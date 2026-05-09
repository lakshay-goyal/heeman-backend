import { Router } from "express";
import { couponController } from "../controllers/coupon.controller";
import { requireAdmin } from "../middlewares/authGuard";

const router = Router();

router.get("/", couponController.getAllCoupons);
router.get("/global", couponController.getGlobalCoupon);
router.get("/available", couponController.getAvailableCoupons);
router.get("/:id", couponController.getCouponById);
router.get("/code/:code", couponController.getCouponByCode);
router.post("/", requireAdmin, couponController.createCoupon);
router.put("/:id", requireAdmin, couponController.updateCoupon);
router.delete("/:id", requireAdmin, couponController.deleteCoupon);

export default router;
