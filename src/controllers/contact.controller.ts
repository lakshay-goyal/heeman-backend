import { Request, Response } from "express";
import { sendContactEmail } from "../services/emailService";

export const handleContactSubmit = async (req: Request, res: Response): Promise<any> => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({ success: false, error: "Please provide name, email, subject, and message" });
        }

        await sendContactEmail({ name, email, subject, message });

        return res.status(200).json({ success: true, message: "Contact form submitted successfully" });
    } catch (error) {
        console.error("Error submitting contact form:", error);
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
};
