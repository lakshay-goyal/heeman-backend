import { NextFunction, Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../auth";

export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user) {
        res.status(401).json({ success: false, error: "Authentication required." });
        return;
    }

    if ((session.user as { role?: string }).role !== "admin") {
        res.status(403).json({ success: false, error: "Admin access required." });
        return;
    }

    next();
};

export const getOptionalSession = async (req: Request) => {
    return auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
    });
};
