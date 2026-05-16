import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CategoryResponseDto {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class CategoryListResponseDto {
  items: CategoryResponseDto[];
  total: number;
}

export class CategoryQueryDto {
  @IsOptional()
  @IsString()
  search?: string;
}

export class CreateCategoryDto {
  @IsString()
  @MaxLength(120)
  name: string;

  @IsString()
  @MaxLength(120)
  slug: string;

  @IsOptional()
  @IsString()
  parentId?: string | null;
}

export class UpdateCategoryDto extends CreateCategoryDto {}
