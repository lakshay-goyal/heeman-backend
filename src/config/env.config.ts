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
} as const;
