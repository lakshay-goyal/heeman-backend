import { Request, Response } from "express";
import { productService } from "../services/product.service";
import { asyncHandler } from "../utils/asyncHandler";

export class ProductController {
    getAllProducts = asyncHandler(async (req: Request, res: Response) => {
        const products = await productService.getAllProducts();
        res.json(products);
    });

    getProductById = asyncHandler(async (req: Request, res: Response) => {
        const id = req.params.id as string;
        const product = await productService.getProductById(id);
        res.json(product);
    });

    createProduct = asyncHandler(async (req: Request, res: Response) => {
        const product = await productService.createProduct(req.body);
        res.status(201).json(product);
    });

    updateProduct = asyncHandler(async (req: Request, res: Response) => {
        const id = req.params.id as string;
        const product = await productService.updateProduct(id, req.body);
        res.json(product);
    });

    deleteProduct = asyncHandler(async (req: Request, res: Response) => {
        const id = req.params.id as string;
        await productService.deleteProduct(id);
        res.status(204).send();
    });
}

export const productController = new ProductController();
