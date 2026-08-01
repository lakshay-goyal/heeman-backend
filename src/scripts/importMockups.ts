import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { SQL } from "bun";
import { ENV } from "../config/env.config";
import { uploadToSupabase } from "../services/supabaseService";

const MOCKUPS_DIR = path.resolve(import.meta.dir, "../../../mockups");

// PgBouncer runs in transaction mode; named prepared statements don't
// survive across pooled connections, so disable them for this script.
const sql = new SQL({ url: ENV.DATABASE_URL, prepare: false });

interface ProductDimensions {
    height?: string;
    width?: string;
    depth?: string;
    seat_height?: string;
    seat_width?: string;
    backrest_height?: string;
}

interface ProductMetadata {
    product_id: string;
    product_name: string;
    visual_analysis: {
        chair_type?: string;
        color?: string;
        material?: string;
    };
    product_description: string;
    product_material?: string;
    product_dimensions?: ProductDimensions;
    about_this_item?: string[];
    special_features?: string[];
    recommended_uses?: string[];
    style?: string;
    included_components?: string[];
    care_instructions?: string;
    item_weight?: string;
}

/**
 * Bun's sql.array() corrupts elements (double-quotes values containing
 * spaces) when a query binds more than one array parameter alongside other
 * values. Build the Postgres array literal ourselves and cast it instead.
 */
function pgArray(arr: string[]): string {
    const escaped = arr.map((v) => `"${String(v).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`);
    return `{${escaped.join(",")}}`;
}

function formatDimensions(dimensions?: ProductDimensions): string | null {
    if (!dimensions) return null;
    const labels: Record<keyof ProductDimensions, string> = {
        height: "Height",
        width: "Width",
        depth: "Depth",
        seat_height: "Seat Height",
        seat_width: "Seat Width",
        backrest_height: "Backrest Height",
    };
    const parts = (Object.keys(labels) as (keyof ProductDimensions)[])
        .filter((key) => dimensions[key])
        .map((key) => `${labels[key]}: ${dimensions[key]}`);
    return parts.length ? parts.join("; ") : null;
}

async function ensureCategory(chairType: string | undefined): Promise<string | null> {
    if (!chairType) return null;

    const [category] = await sql`
        INSERT INTO "Category" (id, name, "createdAt", "updatedAt")
        VALUES (${crypto.randomUUID()}, ${chairType}, NOW(), NOW())
        ON CONFLICT (name) DO UPDATE SET "updatedAt" = NOW()
        RETURNING id
    `;
    return category.id as string;
}

async function importProduct(folderName: string) {
    const folderPath = path.join(MOCKUPS_DIR, folderName);
    const metadataPath = path.join(folderPath, "metadata.json");

    const metadataRaw = await readFile(metadataPath, "utf-8");
    const metadata: ProductMetadata = JSON.parse(metadataRaw);

    const entries = await readdir(folderPath);
    const imageFiles = entries.filter((f) => f.toLowerCase().endsWith(".png")).sort();

    if (imageFiles.length === 0) {
        console.warn(`  [skip] ${folderName}: no image files found`);
        return;
    }

    const imageUrls: string[] = [];
    for (const file of imageFiles) {
        const filePath = path.join(folderPath, file);
        const buffer = await readFile(filePath);
        const url = await uploadToSupabase(
            buffer,
            `products/${metadata.product_id}/${file}`,
            "image/png"
        );
        imageUrls.push(url);
    }

    const categoryId = await ensureCategory(metadata.visual_analysis?.chair_type?.trim());
    const color = metadata.visual_analysis?.color?.trim();
    const colors = color ? [color] : [];
    const aboutItem = (metadata.about_this_item || []).join("\n");
    const specialFeatures = metadata.special_features || [];
    const tags = metadata.recommended_uses || [];
    const includedComponents = metadata.included_components || [];
    const productDimension = formatDimensions(metadata.product_dimensions);
    const height = metadata.product_dimensions?.height ?? null;
    const productMaterial = metadata.product_material ?? null;

    const [product] = await sql`
        INSERT INTO "Product" (
            id, "productId", name, description, price, colors, "aboutItem",
            "specialFeatures", tags, "productMaterial", "productDimension", material,
            weight, height, "styleAndPatterns", "includedComponents", "careInstructions",
            "categoryId", "createdAt", "updatedAt"
        ) VALUES (
            ${crypto.randomUUID()}, ${metadata.product_id}, ${metadata.product_name},
            ${metadata.product_description}, 0, ${pgArray(colors)}::text[], ${aboutItem},
            ${pgArray(specialFeatures)}::text[], ${pgArray(tags)}::text[], ${productMaterial},
            ${productDimension}, ${productMaterial}, ${metadata.item_weight ?? null}, ${height},
            ${metadata.style ?? null}, ${pgArray(includedComponents)}::text[], ${metadata.care_instructions ?? null},
            ${categoryId}, NOW(), NOW()
        )
        ON CONFLICT ("productId") DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            colors = EXCLUDED.colors,
            "aboutItem" = EXCLUDED."aboutItem",
            "specialFeatures" = EXCLUDED."specialFeatures",
            tags = EXCLUDED.tags,
            "productMaterial" = EXCLUDED."productMaterial",
            "productDimension" = EXCLUDED."productDimension",
            material = EXCLUDED.material,
            weight = EXCLUDED.weight,
            height = EXCLUDED.height,
            "styleAndPatterns" = EXCLUDED."styleAndPatterns",
            "includedComponents" = EXCLUDED."includedComponents",
            "careInstructions" = EXCLUDED."careInstructions",
            "categoryId" = EXCLUDED."categoryId",
            "updatedAt" = NOW()
        RETURNING id
    `;

    await sql`DELETE FROM "ProductImage" WHERE "productId" = ${product.id}`;
    for (const url of imageUrls) {
        await sql`INSERT INTO "ProductImage" (id, url, "productId") VALUES (${crypto.randomUUID()}, ${url}, ${product.id})`;
    }

    console.log(`  [ok] ${metadata.product_id} — ${imageUrls.length} images`);
}

async function main() {
    const entries = await readdir(MOCKUPS_DIR);
    const folders: string[] = [];
    for (const entry of entries) {
        if (!entry.startsWith("HF-")) continue;
        const entryPath = path.join(MOCKUPS_DIR, entry);
        const s = await stat(entryPath);
        if (s.isDirectory()) folders.push(entry);
    }
    folders.sort();

    const only = process.argv.slice(2).filter((arg) => arg.startsWith("HF-"));
    const targets = only.length ? folders.filter((f) => only.includes(f)) : folders;

    console.log(`Found ${folders.length} product folders. Importing ${targets.length}...`);

    let done = 0;
    let failed = 0;
    let skipped = 0;
    for (const folder of targets) {
        try {
            const folderPath = path.join(MOCKUPS_DIR, folder);
            const entries = await readdir(folderPath);
            const hasImages = entries.some((f) => f.toLowerCase().endsWith(".png"));
            if (!hasImages) skipped++;
            await importProduct(folder);
        } catch (error) {
            failed++;
            console.error(`  [fail] ${folder}:`, (error as Error).message);
        }
        done++;
        if (done % 10 === 0) {
            console.log(`Progress: ${done}/${targets.length}`);
        }
    }

    console.log(`Done. ${done - failed - skipped}/${targets.length} imported, ${skipped} skipped (no images), ${failed} failed.`);
    await sql.close();
}

main().catch(async (e) => {
    console.error(e);
    await sql.close();
    process.exit(1);
});
