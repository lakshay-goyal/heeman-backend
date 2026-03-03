import { Router } from "express";
import { getConstants, updateConstant } from "../controllers/frontend-constant.controller";

const router = Router();

router.get("/", getConstants);
router.post("/", updateConstant);

export default router;
