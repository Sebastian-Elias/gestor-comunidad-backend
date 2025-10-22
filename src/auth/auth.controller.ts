//auth/auth.controller.ts
import {
  Body,
  Controller,
  Post,
  Get,
  UseGuards,
  NotFoundException,
  Req,
  Query,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtGuard } from './jwt/jwt.guard';
import { PrismaService } from '../prisma/prisma.service';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';
import { Role } from '@prisma/client';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MailService } from '../mail/mail.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtInvitationGuard } from './jwt/jwt-invitation.guard';

// Tipo para que req tenga user:
interface RequestWithUser extends Request {
  user: { sub: number; email: string; role: string };
}

@ApiTags('Authentication')
@Controller('auth')
@UseGuards(RolesGuard)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  
  @UseGuards(JwtGuard, RolesGuard)
  @Post('invite')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Invitar un nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Invitación enviada con éxito' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  @ApiBody({
    description: 'Datos para invitar usuario',
    examples: {
      admin: {
        value: { email: 'admin@example.com', role: 'ADMIN' }
      },
      member: {
        value: { email: 'member@example.com' }
      }
    }
  })
  async inviteUser(@Body() dto: { email: string; role?: Role }) {
    console.log('>>> /auth/invite llamado con:', dto);
  if (!dto.email) {
    console.log('❌ inviteUser: no email provided');
    throw new BadRequestException('El email es requerido');
  }

  const result = await this.authService.inviteUser(dto);
  console.log('✅ inviteUser result:', result);

  return result;
}

/**
   * Diseñado para usuarios invitados nuevos (sin contraseña todavía).
   */
  @Post('set-password')
@ApiOperation({ summary: 'Establecer contraseña para usuario invitado' })
@ApiResponse({ status: 200, description: 'Contraseña establecida con éxito' })
@ApiResponse({ status: 400, description: 'Token o contraseña inválidos' })
async setPassword(
  @Query('token') token: string,
  @Body() dto: { password: string }
) {
  console.log('🔍 setPassword - Token recibido:', token);
  console.log('🔍 setPassword - Body recibido:', dto);
  
  if (!token) {
    console.log('❌ setPassword: Token vacío');
    throw new BadRequestException('Token es requerido');
  }

  if (!dto.password || dto.password.length < 6) {
    throw new BadRequestException('La contraseña debe tener al menos 6 caracteres');
  }

  // Pasar el token directamente al servicio
  return this.authService.setPassword(token, dto.password);
}

/**
   * Envía el correo con el enlace para restablecer contraseña.
   */
@Post('forgot-password')
@ApiOperation({ summary: 'Solicitar restablecimiento de contraseña' })
@ApiResponse({ status: 200, description: 'Correo de recuperación enviado' })
@ApiResponse({ status: 400, description: 'Email inválido o no encontrado' })
async forgotPassword(@Body('email') email: string) {
  if (!email) throw new BadRequestException('El email es requerido');
  console.log('📩 Solicitud de recuperación de contraseña:', email);
  return this.authService.forgotPassword(email);
}


@Post('reset-password')
@ApiOperation({ summary: 'Restablecer contraseña para usuarios existentes' })
@ApiResponse({ status: 200, description: 'Contraseña restablecida correctamente' })
@ApiResponse({ status: 400, description: 'Token inválido o expirado' })
async resetPassword(
  @Query('token') token: string,
  @Body() dto: { password: string }
) {
  if (!token) throw new BadRequestException('Token requerido');
  if (!dto.password || dto.password.length < 6) {
    throw new BadRequestException('La contraseña debe tener al menos 6 caracteres');
  }

  // 🔧 SOLUCIÓN: Limpiar el token si contiene URL completa
  const cleanToken = this.extractTokenFromUrl(token);
  console.log('🔍 resetPassword - Token original:', token);
  console.log('🔍 resetPassword - Token limpio:', cleanToken);

  return this.authService.resetPassword(cleanToken, dto.password);
}

/**
 * Extrae el token JWT de una URL que pueda contener el token como parámetro
 */
private extractTokenFromUrl(token: string): string {
  // Si el token ya es un JWT válido (sin URLs), devolverlo tal cual
  if (token.length === 64 && /^[a-f0-9]+$/i.test(token)) {
    return token;
  }

  // Si contiene "token=", extraer el valor del parámetro
  if (token.includes('token=')) {
    try {
      // Intentar parsear como URL
      const url = new URL(token);
      const tokenParam = url.searchParams.get('token');
      return tokenParam || token;
    } catch (e) {
      // Si falla el parsing como URL, usar método simple
      const tokenPart = token.split('token=')[1];
      if (tokenPart) {
        // Remover cualquier parámetro adicional
        return tokenPart.split('&')[0];
      }
    }
  }

  // Si no coincide con ningún patrón, devolver el token original
  return token;
}


  @Post('register')
  @ApiOperation({ summary: 'Registro de usuario' })
  @ApiResponse({ status: 201, description: 'Usuario registrado con éxito' })
  @ApiResponse({ status: 400, description: 'Datos de registro inválidos' })
  @ApiResponse({ status: 409, description: 'El email ya está registrado' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiResponse({ 
    status: 200, 
    description: 'Inicio de sesión exitoso',
    schema: {
      example: {
        access_token: 'jwt.token.here'
      }
    }
  })
  @ApiResponse({ status: 403, description: 'Credenciales inválidas' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('profile')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil del usuario' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async getProfile(@Req() req: RequestWithUser) {
    console.log('req.user:', req.user);
  const userId = req.user.sub;

  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, firstName: true, lastName: true, role: true },
  });

  if (!user) {
    throw new NotFoundException('Usuario no encontrado');
  }

  return user;
}

@Get('test-email')
async testEmail() {
  console.log('🚀 test-email endpoint llamado');

  const testEmail = 'sebastianelias.dg@outlook.com';
  const testToken = 'test123'; // solo un token de prueba

  try {
    await this.mailService.sendUserInvitation(testEmail, testToken);
    console.log('✅ Email enviado correctamente a', testEmail);
    return { success: true };
  } catch (error) {
    console.error('❌ Error enviando email de prueba:', error);
    return { success: false, error: error.message };
  }
}

  
  @Post('test-invite')
async testInvite(@Body() dto: { email: string }) {
  const testToken = 'test123'; // solo el token, no toda la URL
  await this.mailService.sendUserInvitation(dto.email, testToken);
  return { success: true };
}


/*
  @Get('verify-invitation')
@UseGuards(JwtInvitationGuard)
@ApiOperation({ summary: 'Verificar token de invitación' })
@ApiResponse({ status: 200, description: 'Token válido' })
@ApiResponse({ status: 400, description: 'Token inválido o expirado' })
async verifyInvitation(@Req() req: RequestWithUser) { // <-- Cambiar parámetro
  console.log('🔍 verify-invitation llamado');
  
  try {
    const userPayload = req.user;
    console.log('✅ Token válido. User payload:', userPayload);

    const user = await this.prisma.user.findUnique({
      where: { id: userPayload.sub },
      select: { 
        id: true, 
        email: true, 
        firstName: true, 
        lastName: true,
        password: true 
      },
    });

    if (!user) {
      console.log('❌ Usuario no encontrado para id:', userPayload.sub);
      throw new BadRequestException('Usuario no encontrado');
    }

    console.log('✅ Usuario encontrado:', user.email);

    return {
      valid: true,
      user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        hasPassword: !!user.password
      }
    };
  } catch (err) {
    console.error('❌ Error en verify-invitation:', {
      errorName: err.name,
      errorMessage: err.message
    });
    throw new BadRequestException('Token inválido o expirado');
  }
}
  */

}