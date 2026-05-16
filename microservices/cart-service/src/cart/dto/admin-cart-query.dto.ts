import { IsOptional, IsString } from 'class-validator';

export class AdminCartQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  guestToken?: string;
}
