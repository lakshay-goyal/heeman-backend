import { S3Client } from "@aws-sdk/client-s3";
import { ENV } from "../config/env.config";

export const supabaseS3 = new S3Client({
    endpoint: `${ENV.SUPABASE_URL}/storage/v1/s3`,
    region: ENV.SUPABASE_S3_REGION,
    forcePathStyle: true,
    credentials: {
        accessKeyId: ENV.SUPABASE_S3_ACCESS_KEY_ID,
        secretAccessKey: ENV.SUPABASE_S3_SECRET_ACCESS_KEY,
    },
});
