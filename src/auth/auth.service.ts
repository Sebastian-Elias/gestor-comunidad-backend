// auth/auth.service.ts
import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private mailService: MailService,
    private config: ConfigService
  ) {}

  /**
   * Invita a un nuevo usuario: crea usuario sin contraseña y envía token por email
   */
async inviteUser(dto: { email: string; role?: Role }) {
  if (!dto.email) throw new BadRequestException('El email es requerido');

  console.log('🚀 Inviting user:', dto.email);

  // Verificar si el email ya existe
  const existingUser = await this.prisma.user.findUnique({
    where: { email: dto.email },
  });

  if (existingUser) {
    throw new BadRequestException('El email ya está registrado');
  }

  // 1. Crear usuario sin contraseña
  const user = await this.prisma.user.create({
    data: {
      email: dto.email,
      role: dto.role || 'MIEMBRO',
      password: null,
    },
  });
  console.log('✅ Usuario creado:', user.id);
  if (!user?.id) {
  throw new BadRequestException('No se pudo crear el usuario, ID inválido');
}


  // 2. Generar token seguro (64 caracteres hexadecimal)
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  
  // 🔍 LOG CRÍTICO: Ver el token ANTES de guardarlo
  console.log('🔍 AuthService - Token generado (ANTES de guardar):', token);
  console.log('🔍 AuthService - Longitud del token:', token.length);

  // 3. Guardar token en la base de datos (expira en 2 días)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 2);

  console.log('🔍 Intentando guardar en invitation_tokens...');
  try {
    await this.prisma.invitationToken.create({
      data: {
        token: token,
        userId: user.id,
        expiresAt: expiresAt,
      },
    });
    console.log('✅ Token guardado en invitation_tokens');
    
    // 🔍 VERIFICAR que realmente se guardó
    const savedToken = await this.prisma.invitationToken.findUnique({
      where: { token: token }
    });
    console.log('🔍 Token verificado en BD:', !!savedToken);
    
  } catch (error) {
    console.error('❌ Error guardando token:', error);
    throw new BadRequestException('Error al generar la invitación');
  }

  // 🔍 LOG CRÍTICO: Ver el token ANTES de enviar al MailService
  console.log('🔍 AuthService - Token a enviar a MailService:', token);

  // 4. Enviar invitación
  await this.mailService.sendUserInvitation(user.email, token);
  console.log('📧 Invitación enviada a', user.email);

  return { 
    success: true, 
    message: 'Invitación enviada correctamente',
    userId: user.id 
  };
}



  /**
   * Establece o restablece contraseña de un usuario a partir de un token JWT
   */
  async setPassword(token: string, newPassword: string) {
  console.log('🔍 setPassword - Token recibido:', token);
  
  if (!token) throw new BadRequestException('Token es requerido');
  if (!newPassword || newPassword.length < 6)
    throw new BadRequestException('La contraseña debe tener al menos 6 caracteres');

  try {
    // 1. Buscar token en la base de datos
    const invitationToken = await this.prisma.invitationToken.findUnique({
      where: { token },
      include: { 
        user: {
          select: {
            id: true,
            email: true,
            password: true,
            firstName: true,
            lastName: true
          }
        }
      },
    });

    console.log('🔍 Token encontrado en DB:', {
      exists: !!invitationToken,
      used: invitationToken?.used,
      expired: invitationToken ? invitationToken.expiresAt < new Date() : false,
      userHasPassword: invitationToken?.user.password ? true : false
    });

    if (!invitationToken) {
      throw new BadRequestException('Enlace de invitación no válido');
    }

    if (invitationToken.used) {
      throw new BadRequestException('Este enlace ya ha sido utilizado');
    }

    if (invitationToken.expiresAt < new Date()) {
      throw new BadRequestException('El enlace de invitación ha expirado');
    }

    if (invitationToken.user.password) {
      throw new BadRequestException('El usuario ya tiene contraseña establecida');
    }

    // 2. Hash de la contraseña
    const hashed = await bcrypt.hash(newPassword, 10);

    // 3. Actualizar usuario y marcar token como usado (en una transacción)
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: invitationToken.userId },
        data: { password: hashed },
      }),
      this.prisma.invitationToken.update({
        where: { id: invitationToken.id },
        data: { used: true },
      }),
    ]);

    console.log('✅ Contraseña creada para:', invitationToken.user.email);

    return { 
      success: true, 
      message: 'Contraseña creada correctamente',
      user: {
        email: invitationToken.user.email,
        firstName: invitationToken.user.firstName,
        lastName: invitationToken.user.lastName
      }
    };
    
  } catch (err) {
    console.error('❌ Error en setPassword:', err);
    if (err instanceof BadRequestException) {
      throw err;
    }
    throw new BadRequestException('Error al crear la contraseña');
  }
}

  /**
   * Registro normal de usuario
   */
  async register(dto: RegisterDto) {
    const hashed = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashed,
        role: dto.role || 'MIEMBRO',
        firstName: dto.firstName,
        lastName: dto.lastName,
      },
    });

    return this.signToken(user.id, user.email);
  }

  /**
   * Login de usuario
   */
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });

    if (!user || !user.password) {
      throw new ForbiddenException('Credenciales incorrectas');
    }

    const match = await bcrypt.compare(dto.password, user.password);
    if (!match) throw new ForbiddenException('Credenciales incorrectas');

    return this.signToken(user.id, user.email);
  }

  /**
   * Obtener perfil de usuario
   */
  async getProfile(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, firstName: true, lastName: true, role: true },
    });
  }

  /**
   * Firma y retorna JWT de acceso
   */
  private async signToken(userId: number, email: string) {
    const payload = { sub: userId, email };
    return {
      access_token: await this.jwt.signAsync(payload),
    };
  }


   /**
   * Restablecer contraseña sin token (desde url publica)
   */
  async forgotPassword(email: string) {
  // 1️⃣ Verificar si existe el usuario
  const user = await this.prisma.user.findUnique({ where: { email } });
  if (!user) throw new BadRequestException('No existe un usuario con ese correo');

  // 2️⃣ Generar token seguro (64 hex)
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');

  // 3️⃣ Guardar token con expiración (2 días)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 2);

  await this.prisma.invitationToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt,
    },
  });

  // 4️⃣ Enviar email con enlace
  const frontendUrl = this.config.get('FRONTEND_URL') || 'http://localhost:5173';
  const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

  console.log('📨 Enviando correo de recuperación a:', email);
  console.log('🔗 URL de recuperación:', resetUrl);

  await this.mailService.sendPasswordReset(user.email, resetUrl);

  return { success: true, message: 'Correo de recuperación enviado' };
}

/**
   * Especifico para usuarios existentes que olvidaron contraseña
   */
async resetPassword(token: string, newPassword: string) {
  console.log('🔄 resetPassword - Token recibido:', token);

  if (!token) throw new BadRequestException('Token requerido');
  if (!newPassword || newPassword.length < 6) {
    throw new BadRequestException('La contraseña debe tener al menos 6 caracteres');
  }

  // 1️⃣ Buscar el token en la tabla PasswordResetToken (o InvitationToken si estás usando la misma)
  const resetToken = await this.prisma.invitationToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!resetToken) throw new BadRequestException('Token inválido');
  if (resetToken.used) throw new BadRequestException('El enlace ya fue utilizado');
  if (resetToken.expiresAt < new Date()) throw new BadRequestException('El enlace ha expirado');

  const user = resetToken.user;
  if (!user) throw new BadRequestException('Usuario no encontrado');

  // 2️⃣ Hashear la nueva contraseña
  const hashed = await bcrypt.hash(newPassword, 10);

  // 3️⃣ Guardar la nueva contraseña y marcar el token como usado
  await this.prisma.$transaction([
    this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashed },
    }),
    this.prisma.invitationToken.update({
      where: { id: resetToken.id },
      data: { used: true },
    }),
  ]);

  console.log(`✅ Contraseña restablecida para ${user.email}`);

  return {
    success: true,
    message: 'Contraseña restablecida correctamente',
    user: { email: user.email },
  };
}


}
