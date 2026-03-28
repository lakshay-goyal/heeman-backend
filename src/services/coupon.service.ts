import { prisma } from "../lib/prisma";
import { CreateCouponDTO, UpdateCouponDTO } from "../types/coupon.types";
import { NotFoundError } from "../utils/errors";

export class CouponService {
    async getAllCoupons() {
        return prisma.coupon.findMany({
            include: {
                products: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                users: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    async getCouponById(id: string) {
        const coupon = await prisma.coupon.findUnique({
            where: { id },
            include: {
                products: true,
                users: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        if (!coupon) {
            throw new NotFoundError("Coupon not found");
        }

        return coupon;
    }

    async getCouponByCode(code: string) {
        return prisma.coupon.findUnique({
            where: { code },
            include: {
                products: true,
                users: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
    }

    async getAvailableCoupons(userId?: string) {
        const now = new Date();

        const whereClause: any = {
            isActive: true,
            isVisible: true,
            OR: [
                { validUntil: null },
                { validUntil: { gte: now } }
            ],
        };

        // If userId provided, include coupons for that user + universal ones
        // Otherwise only return universal (no user restriction) coupons
        if (userId) {
            whereClause.AND = [{
                OR: [
                    { users: { none: {} } },
                    { users: { some: { id: userId } } }
                ]
            }];
        } else {
            whereClause.users = { none: {} };
        }

        return prisma.coupon.findMany({
            where: whereClause,
            select: {
                id: true,
                code: true,
                discountType: true,
                discountValue: true,
                minOrderAmount: true,
                minItemCount: true,
                validUntil: true,
                usageLimit: true,
                usedCount: true,
            },
            orderBy: [
                { minOrderAmount: 'asc' },
                { minItemCount: 'asc' },
            ]
        });
    }

    async getGlobalCoupon() {
        return prisma.coupon.findFirst({
            where: {
                isGlobal: true,
                isActive: true,
                OR: [
                    { validUntil: null },
                    { validUntil: { gte: new Date() } } // Only valid ones
                ]
            }
        });
    }

    async createCoupon(data: CreateCouponDTO) {
        const { productIds, userIds, isGlobal, ...couponData } = data;

        if (isGlobal) {
            await prisma.coupon.updateMany({
                where: { isGlobal: true },
                data: { isGlobal: false }
            });
        }

        return prisma.coupon.create({
            data: {
                ...couponData,
                isGlobal: isGlobal ?? false,
                products: productIds ? {
                    connect: productIds.map(id => ({ id }))
                } : undefined,
                users: userIds ? {
                    connect: userIds.map(id => ({ id }))
                } : undefined
            },
            include: {
                products: true,
                users: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
    }

    async updateCoupon(id: string, data: UpdateCouponDTO) {
        const { productIds, userIds, isGlobal, ...couponData } = data;

        let updateData: any = { ...couponData };

        if (isGlobal !== undefined) {
            updateData.isGlobal = isGlobal;
            if (isGlobal) {
                await prisma.coupon.updateMany({
                    where: { isGlobal: true, id: { not: id } },
                    data: { isGlobal: false }
                });
            }
        }

        if (productIds) {
            updateData.products = {
                set: productIds.map(id => ({ id }))
            };
        }

        if (userIds) {
            updateData.users = {
                set: userIds.map(id => ({ id }))
            };
        }

        try {
            return await prisma.coupon.update({
                where: { id },
                data: updateData,
                include: {
                    products: true,
                    users: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            });
        } catch (error: any) {
            if (error.code === "P2025") {
                throw new NotFoundError("Coupon not found");
            }
            throw error;
        }
    }

    async deleteCoupon(id: string) {
        try {
            await prisma.coupon.delete({
                where: { id },
            });
        } catch (error: any) {
            if (error.code === "P2025") {
                throw new NotFoundError("Coupon not found");
            }
            throw error;
        }
    }
}

export const couponService = new CouponService();
