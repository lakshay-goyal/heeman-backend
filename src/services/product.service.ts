import { prisma } from "../lib/prisma";
import { CreateProductDTO, ProductListQuery, UpdateProductDTO } from "../types/product.types";
import { NotFoundError } from "../utils/errors";

export class ProductService {
    private listSelect = {
        id: true,
        name: true,
        price: true,
        tags: true,
        series: true,
        isTopProduct: true,
        productMaterial: true,
        material: true,
        categoryId: true,
        category: true,
        images: {
            orderBy: {
                url: "asc" as const,
            },
            take: 1,
            select: {
                url: true,
            },
        },
    };

    async getAllProducts() {
        return prisma.product.findMany({
            orderBy: { createdAt: "desc" },
            select: this.listSelect,
        });
    }

    async getProductPage(query: ProductListQuery) {
        const page = Math.max(1, Math.floor(query.page || 1));
        const limit = Math.min(48, Math.max(1, Math.floor(query.limit || 18)));
        const where: any = {};

        if (query.topOnly) {
            where.isTopProduct = true;
        }

        if (query.category && query.category !== "All") {
            where.category = { name: query.category };
        }

        if (query.material && query.material !== "All") {
            where.OR = [
                { productMaterial: { contains: query.material, mode: "insensitive" } },
                { material: { contains: query.material, mode: "insensitive" } },
            ];
        }

        if (query.search) {
            const searchWhere = [
                { name: { contains: query.search, mode: "insensitive" } },
                { description: { contains: query.search, mode: "insensitive" } },
                { series: { contains: query.search, mode: "insensitive" } },
                { aboutItem: { contains: query.search, mode: "insensitive" } },
            ];

            where.OR = where.OR ? [{ AND: [{ OR: where.OR }, { OR: searchWhere }] }] : searchWhere;
        }

        if (query.minPrice !== undefined || query.maxPrice !== undefined) {
            where.price = {};
            if (query.minPrice !== undefined) where.price.gte = query.minPrice;
            if (query.maxPrice !== undefined) where.price.lte = query.maxPrice;
        }

        const orderBy =
            query.sort === "price-low" ? { price: "asc" as const } :
                query.sort === "price-high" ? { price: "desc" as const } :
                    query.sort === "name" ? { name: "asc" as const } :
                        { createdAt: "desc" as const };

        const [products, total, categories, materialRows] = await prisma.$transaction([
            prisma.product.findMany({
                where,
                orderBy,
                skip: (page - 1) * limit,
                take: limit,
                select: this.listSelect,
            }),
            prisma.product.count({ where }),
            prisma.category.findMany({
                orderBy: { name: "asc" },
                select: { name: true },
            }),
            prisma.product.findMany({
                select: {
                    productMaterial: true,
                    material: true,
                },
            }),
        ]);

        const materials = Array.from(new Set(
            materialRows
                .map((item) => item.productMaterial || item.material)
                .filter((item): item is string => Boolean(item))
        )).sort((a, b) => a.localeCompare(b)).slice(0, 80);

        const totalPages = Math.max(1, Math.ceil(total / limit));

        return {
            data: products,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
            facets: {
                categories: categories.map((category) => category.name),
                materials,
            },
        };
    }

    async getProductById(id: string) {
        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                images: {
                    orderBy: {
                        url: "asc",
                    },
                },
                category: true,
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
