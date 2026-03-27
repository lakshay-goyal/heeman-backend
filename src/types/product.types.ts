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
