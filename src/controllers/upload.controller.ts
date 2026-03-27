import { Request, Response } from "express";
import { uploadToSupabase } from "../services/supabaseService";
import { asyncHandler } from "../utils/asyncHandler";

export class UploadController {
    uploadImage = asyncHandler(async (req: Request, res: Response) => {
        if (!req.file) {
            res.status(400).json({ error: "No file uploaded" });
            return;
        }

        const file = req.file;
        const fileName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.]/g, "-")}`;
        
        const url = await uploadToSupabase(file.buffer, fileName, file.mimetype);

        res.json({ url });
    });
}

export const uploadController = new UploadController();
