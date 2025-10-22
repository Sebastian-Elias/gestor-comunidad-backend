// src/member/member.controller.ts
import {
  Controller,
  Post,
  Put,
  Patch,
  Body,
  Get,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  ValidationPipe,
  BadRequestException
} from '@nestjs/common';
import cloudinary from 'cloudinary.config';
import { FileInterceptor } from '@nestjs/platform-express';
import { Readable } from 'stream';
import { MemberService } from './member.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { CleanRutPipe } from './pipes/clean-rut.pipe';

@Controller('members')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

@Post()
@UseInterceptors(FileInterceptor('photo'))
async create(
  @UploadedFile() file: Express.Multer.File,
  @Body(new CleanRutPipe(), new ValidationPipe({ transform: true })) dto: CreateMemberDto
) {
  try {
    console.log('📦 DTO recibido:', dto);
    console.log('📷 Archivo recibido:', !!file, file?.originalname);

    // Subir imagen si existe
    if (file) {
      const result = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'members_photos' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        Readable.from(file.buffer).pipe(uploadStream);
      });

      dto.photoUrl = result.secure_url;
    }

    return this.memberService.create(dto);
  } catch (error) {
    console.error('❌ Error en create (controller):', error);
    throw new BadRequestException(error.message);
  }
}


  @Get()
  findAll() {
    return this.memberService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.memberService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMemberDto) {
    return this.memberService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.memberService.remove(+id);
  }
}
