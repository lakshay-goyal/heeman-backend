import { Router } from "express";
import multer from "multer";
import { uploadController } from "../controllers/upload.controller";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.single("image"), uploadController.uploadImage);

export default router;
