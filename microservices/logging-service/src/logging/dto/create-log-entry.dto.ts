import { IsObject, IsOptional, IsString } from 'class-validator';

export class CreateLogEntryDto {
  @IsString()
  level: string;

  @IsString()
  source: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
