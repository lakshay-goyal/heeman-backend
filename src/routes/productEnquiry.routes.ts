import { Router } from "express";
import {
    createLead,
    getLeadConversation,
    listLeads,
    sendLeadWhatsAppTemplate,
    updateLeadStatus,
} from "../controllers/productEnquiry.controller";
import { requireAdmin } from "../middlewares/authGuard";
import { rateLimit } from "../middlewares/rateLimit";

const router = Router();

router.post("/", rateLimit("lead:create", 8, 10 * 60 * 1000), createLead);
router.get("/", requireAdmin, listLeads);
router.get("/:id/conversation", requireAdmin, getLeadConversation);
router.patch("/:id/status", requireAdmin, updateLeadStatus);
router.post("/:id/send-whatsapp-template", requireAdmin, sendLeadWhatsAppTemplate);

export default router;
