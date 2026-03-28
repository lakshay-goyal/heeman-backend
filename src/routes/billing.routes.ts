import { Router } from "express";
import { getBillingConfig, updateBillingConfig } from "../controllers/billing.controller";

const router = Router();

router.get("/", getBillingConfig);
router.put("/", updateBillingConfig);

export default router;
