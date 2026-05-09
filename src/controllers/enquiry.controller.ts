import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { uploadToSupabase } from "../services/supabaseService";
import { asyncHandler } from "../utils/asyncHandler";
import { EnquiryStatus } from "../generated/prisma/enums";

export const createEnquiry = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !message) {
        res.status(400).json({ success: false, error: "Name, email, and message are required." });
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

    const enquiry = await prisma.customEnquiry.create({
        data: {
            name,
            email,
            phone: phone || null,
            message,
            images: imageUrls,
        },
    });

    res.status(201).json({ success: true, enquiry });
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
