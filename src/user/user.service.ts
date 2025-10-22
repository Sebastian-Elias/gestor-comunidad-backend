//user/user.service.ts
import { Prisma } from '@prisma/client';
import { Injectable, NotFoundException, BadRequestException, ConflictException  } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService, private mailService: MailService) {}

  async create(dto: CreateUserDto) {
  const data: Prisma.UserCreateInput = {
    firstName: dto.firstName,
    lastName: dto.lastName,
    email: dto.email,
    role: dto.role ?? 'MIEMBRO',
    password: '', // vacío porque el usuario debe crear su contraseña
  };

  try {
    const user = await this.prisma.user.create({ data });

    // Generar token para que el usuario configure su contraseña
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 horas
    await this.prisma.invitationToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    // Enviar email de invitación
    const invitationUrl = `http://localhost:3000/reset-password?token=${token}`;
    await this.mailService.sendUserInvitation(user.email, invitationUrl);

    console.log('📨 Invitación enviada a:', user.email);

    return user;
  } catch (error: any) {
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      throw new ConflictException('El email ya está registrado');
    }
    throw error;
  }
}



  findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        memberId: true,
      },
    });
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: number, dto: UpdateUserDto) {
    await this.findOne(id); // validar existencia
    return this.prisma.user.update({
      where: { id },
      data: {
        ...dto,
        password: dto.password
          ? await bcrypt.hash(dto.password, 10)
          : undefined, // si no hay password, no se modifica
      },
    });
  }

  async remove(id: number) {
  // Eliminar tokens pendientes
  await this.prisma.invitationToken.deleteMany({ where: { userId: id } });

  // Eliminar recursos subidos por el usuario
  await this.prisma.resource.deleteMany({ where: { uploadedById: id } });

  // Actualizar finance entries para desvincular usuario
  await this.prisma.financeEntry.updateMany({
    where: { OR: [{ createdById: id }, { updatedById: id }] },
    data: { createdById: null, updatedById: null },
  });

  // Finalmente eliminar al usuario
  return this.prisma.user.delete({ where: { id } });
}



  async findByEmail(email: string) {
  const user = await this.prisma.user.findUnique({ where: { email } });
  if (!user) throw new NotFoundException('User not found');
  return user;
}

  //Método para crear el token y enviar email al usuario para creación de password
  async createPasswordResetToken(userId: number) {
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 horas

  await this.prisma.invitationToken.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });

  // Aquí mandas el email con el link tipo:
  // https://tusitio.com/reset-password?token=TOKEN

  return token;
}

async resetPassword(token: string, newPassword: string) {
  const tokenRecord = await this.prisma.invitationToken.findUnique({
    where: { token },
  });

  if (!tokenRecord) throw new BadRequestException('Token inválido');
  if (tokenRecord.expiresAt < new Date()) throw new BadRequestException('Token expirado');
  if (tokenRecord.used) throw new BadRequestException('Token ya usado');

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await this.prisma.user.update({
    where: { id: tokenRecord.userId },
    data: { password: hashedPassword },
  });

  await this.prisma.invitationToken.update({
    where: { token },
    data: { used: true },
  });

  return { message: 'Contraseña actualizada exitosamente' };
}
}