//src/member//member.service.ts
import { Injectable, NotFoundException, ConflictException, UseGuards    } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';

@Injectable()
export class MemberService {
  constructor(private prisma: PrismaService) {}

 async create(data: CreateMemberDto) {
  // Paso 1: Limpiar el RUT eliminando puntos y guion, y pasarlo a mayúsculas
  // Esto asegura que el RUT se guarde siempre en un formato consistente y sin errores de comparación
  const rutLimpio = data.rut.replace(/\./g, '').replace(/-/g, '').toUpperCase();

  // Paso 2: Verificar si ya existe un miembro registrado con el mismo RUT limpio
  // Esto evita duplicados en la base de datos
  const existing = await this.prisma.member.findUnique({
    where: { rut: rutLimpio },
  });

  // Paso 3: Si ya existe un miembro con ese RUT, lanzar una excepción de conflicto (409)
  if (existing) {
    throw new ConflictException(`El RUT '${data.rut}' ya está registrado.`);
  }

  // Paso 4: Crear el nuevo miembro en la base de datos
  // - Se reemplaza el RUT por su versión limpia
  // - Se transforman las fechas a objetos Date (si están presentes)
  return this.prisma.member.create({
    data: {
      ...data, // Se copian todos los campos del DTO
      rut: rutLimpio, // Se sobreescribe el RUT con su versión limpia
      incorporationDate: data.incorporationDate ? new Date(data.incorporationDate) : null,
      baptismDate: data.baptismDate ? new Date(data.baptismDate) : null,
      birthDate: data.birthDate ? new Date(data.birthDate) : null,
    },
  });
}



  findAll() {
    return this.prisma.member.findMany();
  }

  async findOne(id: number) {
  const member = await this.prisma.member.findUnique({ where: { id } });

  if (!member) {
    throw new NotFoundException(`Miembro con id ${id} no encontrado`);
  }

  return member;
}


  async update(id: number, data: UpdateMemberDto) {
  // Paso 1: Si el campo RUT viene en la solicitud, se limpia (quitar puntos y guion, pasar a mayúsculas)
  // Esto garantiza consistencia en la base de datos incluso si se actualiza el RUT
  const rutLimpio = data.rut ? data.rut.replace(/\./g, '').replace(/-/g, '').toUpperCase() : undefined;

  // Paso 2: Actualizar el registro en la base de datos
  // - Solo se reemplazan los campos que fueron enviados
  // - Las fechas se convierten a objetos Date si están presentes
  return this.prisma.member.update({
    where: { id },
    data: {
      ...data, // Se copian todos los campos del DTO
      rut: rutLimpio ?? data.rut, // Si se envió el RUT, se guarda limpio; si no, se deja como está
      incorporationDate: data.incorporationDate ? new Date(data.incorporationDate) : undefined,
      baptismDate: data.baptismDate ? new Date(data.baptismDate) : undefined,
      birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
    },
  });
}

async toggleActiveStatus(id: number, isActive: boolean) {
  const member = await this.prisma.member.findUnique({ where: { id } });
  if (!member) throw new NotFoundException('Member not found');

  return this.prisma.member.update({
    where: { id },
    data: { isActive },
  });
}



  remove(id: number) {
    return this.prisma.member.delete({ where: { id } });
  }
}