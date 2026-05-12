import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { ENV } from "../config/env.config";

type AdminTokenPayload = {
    email: string;
    role: "admin";
    exp: number;
    nonce: string;
};

const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;

const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString("base64url");

const sign = (payload: string) => (
    createHmac("sha256", ENV.BETTER_AUTH_SECRET)
        .update(payload)
        .digest("base64url")
);

const safeEqual = (a: string, b: string) => {
    const aBuffer = Buffer.from(a);
    const bBuffer = Buffer.from(b);
    return aBuffer.length === bBuffer.length && timingSafeEqual(aBuffer, bBuffer);
};

export const createAdminToken = (email: string) => {
    const payload: AdminTokenPayload = {
        email,
        role: "admin",
        exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
        nonce: randomUUID(),
    };
    const encodedPayload = encode(payload);
    return `${encodedPayload}.${sign(encodedPayload)}`;
};

export const verifyAdminToken = (token?: string | null): AdminTokenPayload | null => {
    if (!token) return null;

    const [encodedPayload, signature] = token.split(".");
    if (!encodedPayload || !signature) return null;
    if (!safeEqual(sign(encodedPayload), signature)) return null;

    try {
        const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as AdminTokenPayload;
        if (payload.role !== "admin") return null;
        if (payload.email !== ENV.ADMIN_EMAIL) return null;
        if (payload.exp <= Math.floor(Date.now() / 1000)) return null;
        return payload;
    } catch {
        return null;
    }
};

export const getBearerToken = (authorization?: string | string[]) => {
    const header = Array.isArray(authorization) ? authorization[0] : authorization;
    if (!header?.startsWith("Bearer ")) return null;
    return header.slice("Bearer ".length).trim();
};
