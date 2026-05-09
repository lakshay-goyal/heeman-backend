import { Router } from "express";
import { handleContactSubmit } from "../controllers/contact.controller";
import { rateLimit } from "../middlewares/rateLimit";

const router = Router();

router.post("/", rateLimit("contact:create", 6, 10 * 60 * 1000), handleContactSubmit);

export default router;
