import { Router } from "express";
import { handleContactSubmit } from "../controllers/contact.controller";

const router = Router();

router.post("/", handleContactSubmit);

export default router;
