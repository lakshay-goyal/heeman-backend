import { Request, Response } from "express";
import { ENV } from "../config/env.config";
import { asyncHandler } from "../utils/asyncHandler";
import { handleWhatsAppWebhookPayload } from "../services/whatsapp.service";
import { sendLeadWhatsAppTemplate } from "./productEnquiry.controller";

export const verifyWhatsAppWebhook = (req: Request, res: Response) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === ENV.WHATSAPP_VERIFY_TOKEN && challenge) {
        res.status(200).send(challenge);
        return;
    }

    res.sendStatus(403);
};

export const receiveWhatsAppWebhook = asyncHandler(async (req: Request, res: Response) => {
    const handled = await handleWhatsAppWebhookPayload(req.body);
    res.status(200).json({ success: true, handled });
});

export { sendLeadWhatsAppTemplate };
