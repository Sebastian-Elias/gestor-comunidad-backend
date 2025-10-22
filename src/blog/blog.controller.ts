// src/blog/blog.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  ValidationPipe,
  UseGuards,
  Req
} from '@nestjs/common';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { Readable } from 'stream';
import { JwtGuard } from '../auth/jwt/jwt.guard';
import cloudinary from 'cloudinary.config';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

@Controller('blog')
export class BlogController {
  constructor(private readonly service: BlogService) {}

  @Post()
@UseGuards(JwtGuard)
@UseInterceptors(FileInterceptor('image'))
async create(
  @UploadedFile() file: Express.Multer.File,
  @Body(new ValidationPipe({ transform: true })) dto: CreateBlogDto,
  @Req() req: Request,
) {
  try {
    console.log('📦 DTO recibido:', dto);
    console.log('📷 Archivo recibido:', !!file, file?.originalname);

    // ✅ Obtener usuario autenticado
    const user = req.user as any;
    if (!user) {
      throw new BadRequestException('Usuario no autenticado');
    }

    // ✅ Asociar autor automáticamente
    dto.authorId = user.sub;

    // ✅ Subir imagen a Cloudinary si existe
    if (file) {
      const result = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'blog_images' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        );
        Readable.from(file.buffer).pipe(uploadStream);
      });

      dto.imageUrl = result.secure_url;
    }

    return this.service.create(dto);
  } catch (error) {
    console.error('❌ Error en create (controller):', error);
    throw new BadRequestException(error.message);
  }
}


  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
@UseGuards(JwtGuard)
@UseInterceptors(FileInterceptor('image'))
async update(
  @Param('id', ParseIntPipe) id: number,
  @UploadedFile() file: Express.Multer.File,
  @Body() data: UpdateBlogDto,
  @Req() req: Request,
) {
  try {
    console.log('📌 Datos recibidos para update:', data);
    console.log('📌 Archivo recibido:', !!file, file?.originalname);

    // Convertir featured a boolean
    if (typeof data.featured === 'string') {
      data.featured = data.featured === 'true';
    }

    // Subir imagen si hay archivo nuevo
    if (file) {
      const result = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'blog_images' },
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        );
        Readable.from(file.buffer).pipe(uploadStream);
      });
      data.imageUrl = result.secure_url;
    }

    // Asociar autor automáticamente (si es necesario)
    const user = req.user as any;
    if (!data.authorId && user) {
      data.authorId = user.sub;
    }

    return this.service.update(id, data);
  } catch (error) {
    console.error('❌ Error en update (controller):', error);
    throw new BadRequestException(error.message);
  }
}


  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
