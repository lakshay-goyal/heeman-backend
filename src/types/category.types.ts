export interface CreateCategoryDTO {
    name: string;
    description?: string;
}

export interface UpdateCategoryDTO extends Partial<CreateCategoryDTO> {}
