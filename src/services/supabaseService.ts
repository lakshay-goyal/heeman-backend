import { createClient } from "@supabase/supabase-js";
import { ENV } from "../config/env.config";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const supabaseUrl = ENV.SUPABASE_URL || "";
const supabaseKey = ENV.SUPABASE_SECRET_KEY || "";
const useLocalStorage = supabaseUrl.includes("localhost:54321") || supabaseKey.startsWith("local-dev");

export const supabaseClient = createClient(supabaseUrl, supabaseKey);

const localUploadUrl = async (fileBuffer: Buffer, fileName: string): Promise<string> => {
    const safeFileName = fileName
        .split(/[\\/]+/)
        .filter(Boolean)
        .map((segment) => segment.replace(/[^a-zA-Z0-9.-]/g, "-"))
        .join("/");

    if (!safeFileName) {
        throw new Error("Invalid upload filename");
    }

    const targetPath = path.join(process.cwd(), "uploads", safeFileName);
    await mkdir(path.dirname(targetPath), { recursive: true });
    await writeFile(targetPath, fileBuffer);

    return `${ENV.BETTER_AUTH_URL}/uploads/${safeFileName}`;
};

export const uploadToSupabase = async (
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    bucket: string = ENV.SUPABASE_BUCKET || "heeman-bucket"
): Promise<string> => {
    if (useLocalStorage) {
        return localUploadUrl(fileBuffer, fileName);
    }

    if (!supabaseUrl || !supabaseKey) {
        throw new Error("Supabase credentials not configured in backend");
    }

    const { data, error } = await supabaseClient.storage
        .from(bucket)
        .upload(fileName, fileBuffer, {
            contentType: mimeType,
            upsert: true,
        });

    if (error) {
        throw new Error(`Supabase upload failed: ${error.message}`);
    }

    const { data: publicUrlData } = supabaseClient.storage
        .from(bucket)
        .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
};
