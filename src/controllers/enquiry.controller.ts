import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { uploadToSupabase } from "../services/supabaseService";
import { asyncHandler } from "../utils/asyncHandler";
import { EnquiryStatus } from "../generated/prisma/enums";
import { createProductEnquiry } from "../services/productEnquiry.service";
import { sendWhatsAppTemplateForEnquiry } from "../services/whatsapp.service";
import { getOptionalSession } from "../middlewares/authGuard";

const getIp = (req: Request) => {
    const forwarded = req.headers["x-forwarded-for"];
    return Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(",")[0] || req.ip;
};

export const createEnquiry = asyncHandler(async (req: Request, res: Response) => {
    const {
        name,
        email,
        phone,
        message,
        verificationToken,
        whatsappConsent,
        whatsappConsentText,
    } = req.body;

    if (!name || !email || !message) {
        res.status(400).json({ success: false, error: "Name, email, and message are required." });
        return;
    }

    if (!verificationToken) {
        res.status(400).json({ success: false, error: "A valid verification proof is required." });
        return;
    }

    // Upload all attached images to Supabase
    const files = req.files as Express.Multer.File[];
    const imageUrls: string[] = [];

    if (files && files.length > 0) {
        for (const file of files) {
            const fileName = `enquiries/${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.]/g, "-")}`;
            const url = await uploadToSupabase(file.buffer, fileName, file.mimetype);
            imageUrls.push(url);
        }
    }

    try {
        const session = await getOptionalSession(req);
        const enquiry = await createProductEnquiry({
            type: "CUSTOM",
            userId: session?.user?.id,
            name,
            email,
            phone,
            message,
            verificationToken,
            whatsappConsent: whatsappConsent === "true" || whatsappConsent === true,
            whatsappConsentText,
            referenceImages: imageUrls,
            sourcePage: "custom-enquiry",
            ipAddress: getIp(req),
            userAgent: req.headers["user-agent"],
        });

        let whatsapp: unknown = null;
        if (enquiry.whatsappConsent) {
            try {
                whatsapp = await sendWhatsAppTemplateForEnquiry(enquiry.id);
            } catch (error) {
                whatsapp = {
                    configured: true,
                    error: error instanceof Error ? error.message : "WhatsApp template failed.",
                };
            }
        }

        res.status(201).json({ success: true, enquiry, whatsapp });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to submit enquiry.",
        });
    }
});

export const getEnquiries = asyncHandler(async (_req: Request, res: Response) => {
    const enquiries = await prisma.customEnquiry.findMany({
        orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, enquiries });
});

export const updateEnquiryStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = Object.values(EnquiryStatus);
    if (typeof id !== "string" || !validStatuses.includes(status)) {
        res.status(400).json({ success: false, error: "Invalid status value." });
        return;
    }

    const enquiry = await prisma.customEnquiry.update({
        where: { id },
        data: { status },
    });

    res.json({ success: true, enquiry });
});
