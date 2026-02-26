import { Request, Response } from "express";
import { couponService } from "../services/coupon.service";
import { asyncHandler } from "../utils/asyncHandler";

export class CouponController {
    getAllCoupons = asyncHandler(async (req: Request, res: Response) => {
        const coupons = await couponService.getAllCoupons();
        res.json(coupons);
    });

    getCouponById = asyncHandler(async (req: Request, res: Response) => {
        const id = req.params.id as string;
        const coupon = await couponService.getCouponById(id);
        res.json(coupon);
    });

    getCouponByCode = asyncHandler(async (req: Request, res: Response) => {
        const code = req.params.code as string;
        const coupon = await couponService.getCouponByCode(code);
        if (!coupon) {
            return res.status(404).json({ message: "Coupon not found" });
        }

        const userId = req.query.userId as string | undefined;
        if (coupon.users && coupon.users.length > 0) {
            if (!userId || !coupon.users.some(u => u.id === userId)) {
                return res.status(403).json({ message: "This coupon is restricted to specific users." });
            }
        }
        res.json(coupon);
    });

    createCoupon = asyncHandler(async (req: Request, res: Response) => {
        const couponData = {
            ...req.body,
            discountValue: parseFloat(req.body.discountValue.toString()),
            usageLimit: req.body.usageLimit ? parseInt(req.body.usageLimit.toString()) : null,
            validFrom: req.body.validFrom ? new Date(req.body.validFrom) : new Date(),
            validUntil: req.body.validUntil ? new Date(req.body.validUntil) : null,
            userIds: Array.isArray(req.body.userIds) ? req.body.userIds : undefined,
        };
        // Clean up any remaining fields not needed
        delete couponData.minOrderAmount;
        delete couponData.maxDiscount;
        delete couponData.userId;
        const coupon = await couponService.createCoupon(couponData);
        res.status(201).json(coupon);
    });

    updateCoupon = asyncHandler(async (req: Request, res: Response) => {
        const id = req.params.id as string;
        const couponData = {
            ...req.body,
            discountValue: req.body.discountValue ? parseFloat(req.body.discountValue.toString()) : undefined,
            usageLimit: req.body.usageLimit !== undefined ? (req.body.usageLimit ? parseInt(req.body.usageLimit.toString()) : null) : undefined,
            validFrom: req.body.validFrom ? new Date(req.body.validFrom) : undefined,
            validUntil: req.body.validUntil !== undefined ? (req.body.validUntil ? new Date(req.body.validUntil) : null) : undefined,
            userIds: req.body.userIds !== undefined ? (Array.isArray(req.body.userIds) ? req.body.userIds : []) : undefined,
        };
        // Clean up
        delete couponData.minOrderAmount;
        delete couponData.maxDiscount;
        delete couponData.userId;
        const coupon = await couponService.updateCoupon(id, couponData);
        res.json(coupon);
    });

    deleteCoupon = asyncHandler(async (req: Request, res: Response) => {
        const id = req.params.id as string;
        await couponService.deleteCoupon(id);
        res.status(204).send();
    });
}

export const couponController = new CouponController();
