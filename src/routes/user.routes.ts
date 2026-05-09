import { Router } from "express";
import { getAllUsers, getUserById } from "../controllers/user.controller";
import { requireAdmin } from "../middlewares/authGuard";

const router = Router();

router.get("/", requireAdmin, getAllUsers);
router.get("/:id", requireAdmin, getUserById);

export default router;
