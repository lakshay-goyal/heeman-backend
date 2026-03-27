import { Request, Response } from "express";
import { categoryService } from "../services/category.service";
import { asyncHandler } from "../utils/asyncHandler";

export class CategoryController {
    getAllCategories = asyncHandler(async (req: Request, res: Response) => {
        const categories = await categoryService.getAllCategories();
        res.json(categories);
    });

    getCategoryById = asyncHandler(async (req: Request, res: Response) => {
        const id = req.params.id as string;
        const category = await categoryService.getCategoryById(id);
        res.json(category);
    });

    createCategory = asyncHandler(async (req: Request, res: Response) => {
        const category = await categoryService.createCategory(req.body);
        res.status(201).json(category);
    });

    updateCategory = asyncHandler(async (req: Request, res: Response) => {
        const id = req.params.id as string;
        const category = await categoryService.updateCategory(id, req.body);
        res.json(category);
    });

    deleteCategory = asyncHandler(async (req: Request, res: Response) => {
        const id = req.params.id as string;
        await categoryService.deleteCategory(id);
        res.status(204).send();
    });
}

export const categoryController = new CategoryController();
