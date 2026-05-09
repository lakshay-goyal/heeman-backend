import { Router } from "express";
import {
    receiveWhatsAppWebhook,
    sendLeadWhatsAppTemplate,
    verifyWhatsAppWebhook,
} from "../controllers/whatsapp.controller";
import { requireAdmin } from "../middlewares/authGuard";

const router = Router();

router.get("/webhook", verifyWhatsAppWebhook);
router.post("/webhook", receiveWhatsAppWebhook);
router.post("/send-template", requireAdmin, sendLeadWhatsAppTemplate);

export default router;
