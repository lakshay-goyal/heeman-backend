import { prisma } from "../lib/prisma";
import { CreateCategoryDTO, UpdateCategoryDTO } from "../types/category.types";
import { NotFoundError } from "../utils/errors";

export class CategoryService {
    async getAllCategories() {
        return prisma.category.findMany({
            include: {
                _count: {
                    select: { products: true }
                }
            }
        });
    }

    async getCategoryById(id: string) {
        const category = await prisma.category.findUnique({
            where: { id },
        });

        if (!category) {
            throw new NotFoundError("Category not found");
        }

        return category;
    }

    async createCategory(data: CreateCategoryDTO) {
        return prisma.category.create({
            data,
        });
    }

    async updateCategory(id: string, data: UpdateCategoryDTO) {
        try {
            return await prisma.category.update({
                where: { id },
                data,
            });
        } catch (error: any) {
            if (error.code === "P2025") {
                throw new NotFoundError("Category not found");
            }
            throw error;
        }
    }

    async deleteCategory(id: string) {
        try {
            await prisma.category.delete({
                where: { id },
            });
        } catch (error: any) {
            if (error.code === "P2025") {
                throw new NotFoundError("Category not found");
            }
            throw error;
        }
    }
}

export const categoryService = new CategoryService();
