export interface CreateProductImageDTO {
    url: string;
    color?: string;
}

export interface CreateProductDTO {
    productId: string;
    name: string;
    series?: string;
    description: string;
    price: number;
    aboutItem: string;
    specialFeatures?: string[];
    tags?: string[];
    isTopProduct?: boolean;
    topProductRank?: number | null;
    categoryId?: string;
    colors?: string[];
    productMaterial?: string;
    productDimension?: string;
    material?: string;
    weight?: string;
    height?: string;
    styleAndPatterns?: string;
    includedComponents?: string[];
    careInstructions?: string;
    images?: CreateProductImageDTO[];
}

export interface UpdateProductDTO extends Partial<CreateProductDTO> { }

export type ProductSortOption = "newest" | "price-low" | "price-high" | "name";

export interface ProductListQuery {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    material?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: ProductSortOption;
    topOnly?: boolean;
}

export interface ReorderTopProductsDTO {
    productIds: string[];
}
