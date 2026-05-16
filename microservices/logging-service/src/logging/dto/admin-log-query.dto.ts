import { IsOptional, IsString } from 'class-validator';

export class AdminLogQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  level?: string;

  @IsOptional()
  @IsString()
  source?: string;
}
