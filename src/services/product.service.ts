import { prisma } from "../lib/prisma";
import { CreateProductDTO, UpdateProductDTO } from "../types/product.types";
import { NotFoundError } from "../utils/errors";

export class ProductService {
    async getAllProducts() {
        return prisma.product.findMany({
            select: {
                id: true,
                name: true,
                price: true,
                tags: true,
                series: true,
                images: {
                    take: 1,
                    select: {
                        url: true,
                    },
                },
            },
        });
    }

    async getProductById(id: string) {
        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                images: true,
            },
        });

        if (!product) {
            throw new NotFoundError("Product not found");
        }

        return product;
    }

    async createProduct(data: CreateProductDTO) {
        const { images, ...productData } = data;

        return prisma.product.create({
            data: {
                ...productData,
                images: {
                    create: images || [],
                },
            },
            include: {
                images: true,
            },
        });
    }

    async updateProduct(id: string, data: UpdateProductDTO) {
        const { images, ...productData } = data;

        let updateData: any = { ...productData };

        if (images) {
            updateData.images = {
                deleteMany: {},
                create: images,
            };
        }

        try {
            return await prisma.product.update({
                where: { id },
                data: updateData,
                include: {
                    images: true,
                },
            });
        } catch (error: any) {
            if (error.code === "P2025") {
                throw new NotFoundError("Product not found");
            }
            throw error;
        }
    }

    async deleteProduct(id: string) {
        try {
            await prisma.product.delete({
                where: { id },
            });
        } catch (error: any) {
            if (error.code === "P2025") {
                throw new NotFoundError("Product not found");
            }
            throw error;
        }
    }
}

export const productService = new ProductService();
