import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../utils/asyncHandler";

const BILLING_ID = "global";

export const getBillingConfig = asyncHandler(async (_req: Request, res: Response) => {
    const config = await prisma.billingConfig.upsert({
        where: { id: BILLING_ID },
        create: { id: BILLING_ID },
        update: {},
    });
    res.json({ success: true, config });
});

export const updateBillingConfig = asyncHandler(async (req: Request, res: Response) => {
    const {
        gstPercent,
        gstLabel,
        shippingCharge,
        freeShippingThreshold,
        shippingLabel,
        handlingCharge,
        handlingLabel,
        extraCharges,
    } = req.body;

    const config = await prisma.billingConfig.upsert({
        where: { id: BILLING_ID },
        create: {
            id: BILLING_ID,
            ...(gstPercent !== undefined && { gstPercent: Number(gstPercent) }),
            ...(gstLabel !== undefined && { gstLabel }),
            ...(shippingCharge !== undefined && { shippingCharge: Number(shippingCharge) }),
            ...(freeShippingThreshold !== undefined && { freeShippingThreshold: Number(freeShippingThreshold) }),
            ...(shippingLabel !== undefined && { shippingLabel }),
            ...(handlingCharge !== undefined && { handlingCharge: Number(handlingCharge) }),
            ...(handlingLabel !== undefined && { handlingLabel }),
            ...(extraCharges !== undefined && { extraCharges }),
        },
        update: {
            ...(gstPercent !== undefined && { gstPercent: Number(gstPercent) }),
            ...(gstLabel !== undefined && { gstLabel }),
            ...(shippingCharge !== undefined && { shippingCharge: Number(shippingCharge) }),
            ...(freeShippingThreshold !== undefined && { freeShippingThreshold: Number(freeShippingThreshold) }),
            ...(shippingLabel !== undefined && { shippingLabel }),
            ...(handlingCharge !== undefined && { handlingCharge: Number(handlingCharge) }),
            ...(handlingLabel !== undefined && { handlingLabel }),
            ...(extraCharges !== undefined && { extraCharges }),
        },
    });

    res.json({ success: true, config });
});
