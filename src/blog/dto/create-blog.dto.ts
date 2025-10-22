// src/blog/dto/create-blog.dto.ts
import { IsString, IsOptional, IsBoolean, IsDateString, IsInt, IsNotEmpty, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';
import { Transform } from 'class-transformer';

export class CreateBlogDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.toLowerCase().replace(/\s+/g, '-'))
  slug: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  excerpt?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  featured?: boolean;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsDateString()
  publishedAt?: string;

  @IsInt()
  @Type(() => Number)
  authorId: number;
}