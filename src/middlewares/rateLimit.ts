import { NextFunction, Request, Response } from "express";

interface Bucket {
    count: number;
    resetAt: number;
}

const buckets = new Map<string, Bucket>();

const getClientKey = (req: Request, scope: string) => {
    const forwarded = req.headers["x-forwarded-for"];
    const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(",")[0];
    return `${scope}:${ip || req.ip || req.socket.remoteAddress || "unknown"}`;
};

export const rateLimit = (scope: string, limit: number, windowMs: number) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const key = getClientKey(req, scope);
        const now = Date.now();
        const current = buckets.get(key);

        if (!current || current.resetAt <= now) {
            buckets.set(key, { count: 1, resetAt: now + windowMs });
            next();
            return;
        }

        if (current.count >= limit) {
            res.status(429).json({
                success: false,
                error: "Too many requests. Please wait a few minutes and try again.",
            });
            return;
        }

        current.count += 1;
        buckets.set(key, current);
        next();
    };
};
