import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import {
    createProductEnquiry,
    getProductEnquiries,
    getProductEnquiryConversation,
    PRODUCT_ENQUIRY_STATUSES,
} from "../services/productEnquiry.service";
import { sendWhatsAppTemplateForEnquiry } from "../services/whatsapp.service";
import { getOptionalSession } from "../middlewares/authGuard";
import { prisma } from "../lib/prisma";

const getIp = (req: Request) => {
    const forwarded = req.headers["x-forwarded-for"];
    return Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(",")[0] || req.ip;
};

export const createLead = asyncHandler(async (req: Request, res: Response) => {
    try {
        const session = await getOptionalSession(req);
        const enquiry = await createProductEnquiry({
            ...req.body,
            type: req.body.type || "PRODUCT",
            userId: session?.user?.id,
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

        const created = await getProductEnquiryConversation(enquiry.id);
        res.status(201).json({ success: true, enquiry: created, whatsapp });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to create enquiry.",
        });
    }
});

export const listLeads = asyncHandler(async (_req: Request, res: Response) => {
    const enquiries = await getProductEnquiries();
    res.json({ success: true, enquiries });
});

export const getLeadConversation = asyncHandler(async (req: Request, res: Response) => {
    const enquiry = await getProductEnquiryConversation(req.params.id as string);
    if (!enquiry) {
        res.status(404).json({ success: false, error: "Enquiry not found." });
        return;
    }
    res.json({ success: true, enquiry, conversation: enquiry.whatsappMessages });
});

export const updateLeadStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!PRODUCT_ENQUIRY_STATUSES.includes(status)) {
        res.status(400).json({ success: false, error: "Invalid status value." });
        return;
    }

    const enquiry = await prisma.productEnquiry.update({
        where: { id: id as string },
        data: { status },
        include: {
            items: true,
            whatsappMessages: {
                orderBy: { createdAt: "desc" },
                take: 5,
            },
        },
    });

    res.json({ success: true, enquiry });
});

export const sendLeadWhatsAppTemplate = asyncHandler(async (req: Request, res: Response) => {
    const leadId = (req.body.leadId || req.params.id) as string | undefined;
    if (!leadId) {
        res.status(400).json({ success: false, error: "leadId is required." });
        return;
    }

    try {
        const result = await sendWhatsAppTemplateForEnquiry(leadId);
        const enquiry = await getProductEnquiryConversation(leadId);
        res.json({ success: true, result, enquiry });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to send WhatsApp template.",
        });
    }
});
