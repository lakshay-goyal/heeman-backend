import "dotenv/config";

export const ENV = {
    PORT: process.env.PORT!,
    DATABASE_URL: process.env.DATABASE_URL!,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET!,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL!,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL!,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD!,
    FRONTEND_URL: process.env.FRONTEND_URL!,
    ADMIN_URL: process.env.ADMIN_URL!,
    SMTP_HOST: process.env.SMTP_HOST!,
    SMTP_PORT: parseInt(process.env.SMTP_PORT!),
    SMTP_USER: process.env.SMTP_USER!,
    SMTP_PASS: process.env.SMTP_PASS!,
    SMTP_FROM: process.env.SMTP_FROM!,
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_KEY: process.env.SUPABASE_KEY!,
    SUPABASE_BUCKET: process.env.SUPABASE_BUCKET!,
} as const;
