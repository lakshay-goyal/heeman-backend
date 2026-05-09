import { Router } from "express";
import multer from "multer";
import { uploadController } from "../controllers/upload.controller";
import { requireAdmin } from "../middlewares/authGuard";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", requireAdmin, upload.single("image"), uploadController.uploadImage);

export default router;
