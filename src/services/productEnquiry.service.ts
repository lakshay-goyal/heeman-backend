import { prisma } from "../lib/prisma";
import { cleanPhone, hashValue, verifySignedToken } from "./verificationToken.service";

export const PRODUCT_ENQUIRY_STATUSES = [
    "NEW",
    "VERIFIED",
    "WHATSAPP_SENT",
    "REPLIED",
    "QUOTED",
    "FOLLOW_UP",
    "CLOSED",
    "SPAM",
] as const;

export type ProductEnquiryStatusValue = typeof PRODUCT_ENQUIRY_STATUSES[number];

export interface ProductEnquiryItemInput {
    productId?: string;
    productName?: string;
    name?: string;
    productPrice?: number | string | null;
    price?: number | string | null;
    quantity?: number | string;
    productImage?: string | null;
    image?: string | null;
    productCategory?: string | null;
    category?: string | null;
}

export interface CreateProductEnquiryInput {
    type?: "PRODUCT" | "CUSTOM";
    userId?: string;
    name: string;
    email: string;
    phone: string;
    message?: string;
    sourcePage?: string;
    verificationToken: string;
    whatsappConsent: boolean;
    whatsappConsentText?: string;
    referenceImages?: string[];
    items?: ProductEnquiryItemInput[];
    ipAddress?: string;
    userAgent?: string;
}

const parsePrice = (value: number | string | null | undefined) => {
    if (value === null || value === undefined || value === "") return null;
    if (typeof value === "number") return Number.isFinite(value) ? value : null;
    const parsed = Number(value.replace(/[^\d.]/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
};

const parseQuantity = (value: number | string | undefined) => {
    const parsed = Number(value ?? 1);
    if (!Number.isFinite(parsed) || parsed < 1) return 1;
    return Math.min(Math.floor(parsed), 99);
};

export const verifyEnquiryToken = async (verificationToken: string, email: string, phone: string) => {
    const payload = verifySignedToken(verificationToken);
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = cleanPhone(phone);

    if (!payload || payload.kind !== "enquiry_verification") {
        throw new Error("Verification proof is invalid or expired.");
    }

    if (payload.email && payload.email !== normalizedEmail) {
        throw new Error("Verification proof does not match this email address.");
    }

    if (payload.phone !== normalizedPhone) {
        throw new Error("Verification proof does not match this phone number.");
    }

    const verification = await prisma.enquiryVerification.findFirst({
        where: {
            id: payload.verificationId,
            channel: "PHONE",
            status: "VERIFIED",
            tokenHash: hashValue(verificationToken),
        },
    });

    if (!verification?.verifiedAt) {
        throw new Error("Verification proof could not be confirmed.");
    }

    return {
        verification,
        normalizedEmail,
        normalizedPhone,
        tokenHash: hashValue(verificationToken),
        emailVerifiedAt: payload.email ? verification.verifiedAt : null,
        phoneVerifiedAt: verification.verifiedAt,
    };
};

export const createProductEnquiry = async (input: CreateProductEnquiryInput) => {
    const name = input.name?.trim();
    const email = input.email?.trim().toLowerCase();
    const phone = cleanPhone(input.phone || "");

    if (!name || !email || !phone || !input.verificationToken) {
        throw new Error("Name, email, phone, and verification proof are required.");
    }

    if (!input.whatsappConsent) {
        throw new Error("WhatsApp consent is required before submitting an enquiry.");
    }

    const proof = await verifyEnquiryToken(input.verificationToken, email, phone);
    const cleanItems = (input.items || [])
        .slice(0, 50)
        .map((item) => {
            const productName = (item.productName || item.name || "").trim();
            if (!productName) return null;

            return {
                productId: item.productId || null,
                productName,
                productPrice: parsePrice(item.productPrice ?? item.price),
                quantity: parseQuantity(item.quantity),
                productImage: item.productImage || item.image || null,
                productCategory: item.productCategory || item.category || null,
            };
        })
        .filter(Boolean) as Array<{
            productId: string | null;
            productName: string;
            productPrice: number | null;
            quantity: number;
            productImage: string | null;
            productCategory: string | null;
        }>;

    if ((input.type || "PRODUCT") === "PRODUCT" && cleanItems.length === 0) {
        throw new Error("At least one shortlisted product is required.");
    }

    const enquiry = await prisma.productEnquiry.create({
        data: {
            type: input.type || "PRODUCT",
            userId: input.userId || null,
            verificationId: proof.verification.id,
            name,
            email,
            phone,
            message: input.message?.trim() || null,
            sourcePage: input.sourcePage || null,
            status: "VERIFIED",
            whatsappStatus: "QUEUED",
            whatsappConsent: true,
            whatsappConsentText: input.whatsappConsentText || null,
            whatsappConsentAt: new Date(),
            whatsappConsentIp: input.ipAddress || null,
            whatsappConsentUserAgent: input.userAgent || null,
            verificationTokenHash: proof.tokenHash,
            emailVerifiedAt: proof.emailVerifiedAt,
            phoneVerifiedAt: proof.phoneVerifiedAt,
            referenceImages: input.referenceImages || [],
            items: {
                create: cleanItems,
            },
        },
        include: {
            items: true,
            whatsappMessages: {
                orderBy: { createdAt: "desc" },
            },
        },
    });

    return enquiry;
};

export const getProductEnquiries = async () => {
    return prisma.productEnquiry.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            items: true,
            whatsappMessages: {
                orderBy: { createdAt: "desc" },
                take: 5,
            },
        },
    });
};

export const getProductEnquiryConversation = async (id: string) => {
    return prisma.productEnquiry.findUnique({
        where: { id },
        include: {
            items: true,
            whatsappMessages: {
                orderBy: { createdAt: "asc" },
            },
        },
    });
};
