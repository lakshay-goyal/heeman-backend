import { Router } from "express";
import { ENV } from "../config/env.config";
import { createAdminToken, getBearerToken, verifyAdminToken } from "../services/adminToken.service";

const router = Router();

router.post("/login", (req, res) => {
    const { email, password } = req.body as { email?: string; password?: string };

    if (email !== ENV.ADMIN_EMAIL || password !== ENV.ADMIN_PASSWORD) {
        res.status(401).json({ success: false, error: "Invalid admin credentials." });
        return;
    }

    res.json({
        success: true,
        token: createAdminToken(email),
        user: {
            email,
            role: "admin",
            name: "Admin",
        },
    });
});

router.get("/session", (req, res) => {
    const payload = verifyAdminToken(getBearerToken(req.headers.authorization));
    if (!payload) {
        res.status(401).json({ success: false, error: "Authentication required." });
        return;
    }

    res.json({
        success: true,
        user: {
            email: payload.email,
            role: payload.role,
            name: "Admin",
        },
    });
});

export default router;
