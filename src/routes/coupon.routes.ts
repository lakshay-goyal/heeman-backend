import { Router } from "express";
import { couponController } from "../controllers/coupon.controller";

const router = Router();

router.get("/", couponController.getAllCoupons);
router.get("/:id", couponController.getCouponById);
router.get("/code/:code", couponController.getCouponByCode);
router.post("/", couponController.createCoupon);
router.put("/:id", couponController.updateCoupon);
router.delete("/:id", couponController.deleteCoupon);

export default router;
