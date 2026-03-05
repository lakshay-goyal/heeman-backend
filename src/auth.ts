import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./lib/prisma";
import { ENV } from "./config/env.config";

export const auth = betterAuth({
    secret: ENV.BETTER_AUTH_SECRET,
    baseURL: ENV.BETTER_AUTH_URL,
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    trustedOrigins: [ENV.FRONTEND_URL, ENV.ADMIN_URL],
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                required: false,
                defaultValue: "user",
            },
        },
    },
});
