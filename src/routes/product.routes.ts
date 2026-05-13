import { Router } from "express";
import { productController } from "../controllers/product.controller";
import { requireAdmin } from "../middlewares/authGuard";

const router = Router();

router.get("/", productController.getAllProducts);
router.put("/top-products/order", requireAdmin, productController.reorderTopProducts);
router.get("/:id", productController.getProductById);
router.post("/", requireAdmin, productController.createProduct);
router.put("/:id", requireAdmin, productController.updateProduct);
router.delete("/:id", requireAdmin, productController.deleteProduct);

export default router;
