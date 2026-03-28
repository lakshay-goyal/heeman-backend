export type DiscountType = "PERCENTAGE" | "FIXED";

export interface CreateCouponDTO {
    code: string;
    discountType: DiscountType;
    discountValue: number;
    isActive?: boolean;
    isVisible?: boolean;
    validFrom?: string | Date;
    validUntil?: string | Date | null;
    usageLimit?: number | null;
    productIds?: string[];
    userIds?: string[];
    isGlobal?: boolean;
}

export interface UpdateCouponDTO extends Partial<CreateCouponDTO> { }
