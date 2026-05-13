import { Request, Response } from "express";
import { productService } from "../services/product.service";
import { ProductSortOption } from "../types/product.types";
import { asyncHandler } from "../utils/asyncHandler";

export class ProductController {
    getAllProducts = asyncHandler(async (req: Request, res: Response) => {
        if (Object.keys(req.query).length > 0) {
            const page = parsePositiveNumber(req.query.page);
            const limit = parsePositiveNumber(req.query.limit);
            const minPrice = parseNumber(req.query.minPrice);
            const maxPrice = parseNumber(req.query.maxPrice);

            const products = await productService.getProductPage({
                page,
                limit,
                search: parseString(req.query.search),
                category: parseString(req.query.category),
                material: parseString(req.query.material),
                minPrice,
                maxPrice,
                sort: parseSort(req.query.sort),
                topOnly: parseBoolean(req.query.top) || parseBoolean(req.query.isTopProduct),
            });

            return res.json(products);
        }

        const products = await productService.getAllProducts();
        res.json(products);
    });

    getProductById = asyncHandler(async (req: Request, res: Response) => {
        const id = req.params.id as string;
        const product = await productService.getProductById(id);
        res.json(product);
    });

    createProduct = asyncHandler(async (req: Request, res: Response) => {
        const productData = {
            ...req.body,
            price: req.body.price ? parseFloat(req.body.price.toString()) : 0,
        };
        const product = await productService.createProduct(productData);
        res.status(201).json(product);
    });

    updateProduct = asyncHandler(async (req: Request, res: Response) => {
        const id = req.params.id as string;
        const productData = {
            ...req.body,
            price: req.body.price ? parseFloat(req.body.price.toString()) : undefined,
        };
        const product = await productService.updateProduct(id, productData);
        res.json(product);
    });

    reorderTopProducts = asyncHandler(async (req: Request, res: Response) => {
        const productIds = Array.isArray(req.body.productIds) ? req.body.productIds : [];
        const products = await productService.reorderTopProducts(productIds);
        res.json(products);
    });

    deleteProduct = asyncHandler(async (req: Request, res: Response) => {
        const id = req.params.id as string;
        await productService.deleteProduct(id);
        res.status(204).send();
    });
}

export const productController = new ProductController();

function parseString(value: unknown) {
    return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function parseNumber(value: unknown) {
    if (typeof value !== "string" || !value.trim()) return undefined;
    const number = Number(value);
    return Number.isFinite(number) ? number : undefined;
}

function parsePositiveNumber(value: unknown) {
    const number = parseNumber(value);
    return number && number > 0 ? number : undefined;
}

function parseBoolean(value: unknown) {
    return value === "true" || value === "1" || value === true;
}

function parseSort(value: unknown): ProductSortOption | undefined {
    const sort = parseString(value);
    return sort === "price-low" || sort === "price-high" || sort === "name" || sort === "newest" ? sort : undefined;
}
