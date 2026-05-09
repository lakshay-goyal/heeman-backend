import { createHash, createHmac, timingSafeEqual } from "crypto";
import { ENV } from "../config/env.config";

interface TokenPayload {
    kind: "email_verification" | "enquiry_verification";
    verificationId: string;
    email?: string;
    phone?: string;
    exp: number;
}

const base64url = (value: string | Buffer) => Buffer.from(value).toString("base64url");

const sign = (payload: string) => {
    return createHmac("sha256", ENV.VERIFICATION_TOKEN_SECRET).update(payload).digest("base64url");
};

export const hashValue = (value: string) => {
    return createHash("sha256").update(value).digest("hex");
};

export const hashOtp = (identifier: string, otp: string) => {
    return hashValue(`${identifier}:${otp}:${ENV.VERIFICATION_TOKEN_SECRET}`);
};

export const createVerificationToken = (payload: TokenPayload) => {
    const encodedPayload = base64url(JSON.stringify(payload));
    return `${encodedPayload}.${sign(encodedPayload)}`;
};

export const verifySignedToken = (token: string): TokenPayload | null => {
    const [encodedPayload, signature] = token.split(".");
    if (!encodedPayload || !signature) return null;

    const expected = sign(encodedPayload);
    const actualBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);
    if (actualBuffer.length !== expectedBuffer.length) return null;
    if (!timingSafeEqual(actualBuffer, expectedBuffer)) return null;

    try {
        const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as TokenPayload;
        if (!payload.exp || payload.exp < Date.now()) return null;
        return payload;
    } catch {
        return null;
    }
};

export const cleanPhone = (phone: string) => phone.replace(/\D/g, "");
