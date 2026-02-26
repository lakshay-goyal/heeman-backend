import "dotenv/config";

export const ENV = {
    PORT: process.env.PORT || 8000,
    DATABASE_URL: process.env.DATABASE_URL || "",
    DIRECT_URL: process.env.DIRECT_URL || "",
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET || "",
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || "",
    ADMIN_EMAIL: process.env.ADMIN_EMAIL || "admin@heeman.com",
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "admin_password_123",
    FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
    ADMIN_URL: process.env.ADMIN_URL || "http://localhost:3000",
    SMTP_HOST: process.env.SMTP_HOST || "",
    SMTP_PORT: parseInt(process.env.SMTP_PORT || "587"),
    SMTP_USER: process.env.SMTP_USER || "",
    SMTP_PASS: process.env.SMTP_PASS || "",
    SMTP_FROM: process.env.SMTP_FROM || "HeMan <no-reply@heeman.com>",
} as const;
