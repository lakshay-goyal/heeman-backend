import { createClient } from "@supabase/supabase-js";
import { ENV } from "../config/env.config";

const supabaseUrl = ENV.SUPABASE_URL || "";
const supabaseKey = ENV.SUPABASE_KEY || "";

export const supabaseClient = createClient(supabaseUrl, supabaseKey);

export const uploadToSupabase = async (
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    bucket: string = ENV.SUPABASE_BUCKET || "heeman-bucket"
): Promise<string> => {
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
