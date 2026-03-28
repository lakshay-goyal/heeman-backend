import { Router } from "express";
import multer from "multer";
import { createEnquiry, getEnquiries, updateEnquiryStatus } from "../controllers/enquiry.controller";

const router = Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
});

router.post("/", upload.array("images", 5), createEnquiry);
router.get("/", getEnquiries);
router.patch("/:id/status", updateEnquiryStatus);

export default router;
