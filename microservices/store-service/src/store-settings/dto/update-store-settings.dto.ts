import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateStoreSettingsDto {
  @IsOptional()
  @IsString()
  storeName?: string;

  @IsOptional()
  @IsString()
  logoImageUrl?: string | null;

  @IsOptional()
  @IsString()
  logoPublicId?: string | null;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsEmail()
  contactEmail?: string | null;

  @IsOptional()
  @IsString()
  contactPhone?: string | null;

  @IsOptional()
  @IsString()
  address?: string | null;
}
