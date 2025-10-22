// src/blog/blog.service.ts
import { Injectable, NotFoundException, ConflictException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

@Injectable()
export class BlogService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateBlogDto) {
    await this.validateSlug(data.slug);
    
    return this.prisma.blog.create({
      data: {
        ...data,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
      },
      include: { author: true }
    });
  }

  async findAll() {
    return this.prisma.blog.findMany({
      orderBy: { createdAt: 'desc' },
      include: { author: true }
    });
  }

  async findOne(id: number) {
    const blog = await this.prisma.blog.findUnique({
      where: { id },
      include: { author: true }
    });
    
    if (!blog) throw new NotFoundException('Blog not found');
    return blog;
  }

  async update(id: number, data: UpdateBlogDto) {
    await this.findOne(id);
    
    if (data.slug) {
      await this.validateSlug(data.slug, id);
    }

    return this.prisma.blog.update({
      where: { id },
      data: {
        ...data,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : undefined,
      },
      include: { author: true }
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.blog.delete({ where: { id } });
  }

  private async validateSlug(slug: string, excludeId?: number) {
    const existing = await this.prisma.blog.findFirst({
      where: { 
        slug,
        ...(excludeId && { NOT: { id: excludeId } })
      }
    });
    
    if (existing) throw new ConflictException('Slug already exists');
  }
}