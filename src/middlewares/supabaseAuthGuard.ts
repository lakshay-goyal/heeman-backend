import { NextFunction, Request, Response } from "express";
import { verifyAuth } from "@supabase/server/core";
import type { UserClaims } from "@supabase/server";

declare global {
    namespace Express {
        interface Request {
            supabaseUser?: UserClaims;
        }
    }
}

const toFetchRequest = (req: Request) => {
    const headers = new Headers();
    const authorization = req.headers.authorization;
    if (authorization) headers.set("authorization", Array.isArray(authorization) ? authorization[0] : authorization);
    const apikey = req.headers["apikey"];
    if (apikey) headers.set("apikey", Array.isArray(apikey) ? apikey[0] : apikey);
    return new Request("http://internal.local/", { headers });
};

export const requireSupabaseUser = async (req: Request, res: Response, next: NextFunction) => {
    const { data: auth, error } = await verifyAuth(toFetchRequest(req), { auth: "user" });

    if (error) {
        res.status(error.status).json({ success: false, error: error.message });
        return;
    }

    req.supabaseUser = auth.userClaims ?? undefined;
    next();
};
