import { Router } from "express";
import multer from "multer";
import { createEnquiry, getEnquiries, updateEnquiryStatus } from "../controllers/enquiry.controller";
import { requireAdmin } from "../middlewares/authGuard";
import { rateLimit } from "../middlewares/rateLimit";

const router = Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
});

router.post("/", rateLimit("custom-enquiry:create", 5, 10 * 60 * 1000), upload.array("images", 5), createEnquiry);
router.get("/", requireAdmin, getEnquiries);
router.patch("/:id/status", requireAdmin, updateEnquiryStatus);

export default router;
