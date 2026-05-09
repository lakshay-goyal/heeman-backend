import { Router } from "express";
import { getBillingConfig, updateBillingConfig } from "../controllers/billing.controller";
import { requireAdmin } from "../middlewares/authGuard";

const router = Router();

router.get("/", getBillingConfig);
router.put("/", requireAdmin, updateBillingConfig);

export default router;
