import { Router } from "express";
import { categoryController } from "../controllers/category.controller";
import { requireAdmin } from "../middlewares/authGuard";

const router = Router();

router.get("/", categoryController.getAllCategories);
router.get("/:id", categoryController.getCategoryById);
router.post("/", requireAdmin, categoryController.createCategory);
router.put("/:id", requireAdmin, categoryController.updateCategory);
router.delete("/:id", requireAdmin, categoryController.deleteCategory);

export default router;
