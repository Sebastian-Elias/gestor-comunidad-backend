// user/user.controller.ts
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { MailService } from '../mail/mail.service';

@ApiTags('users') // Agrupa todos los endpoints bajo "users" en Swagger UI
@ApiBearerAuth() // Si usas autenticación JWT
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly mailService: MailService,
  ) {}

  @Post()
  @ApiOperation({ 
    summary: 'Crear un nuevo usuario',
    description: 'Crea un nuevo usuario en el sistema con la información proporcionada'
  })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Usuario creado exitosamente',
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos de entrada inválidos' 
  })
  @ApiResponse({ 
    status: 409, 
    description: 'El usuario ya existe' 
  })
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Obtener todos los usuarios',
    description: 'Retorna una lista de todos los usuarios registrados en el sistema'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de usuarios obtenida exitosamente' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado' 
  })
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Obtener un usuario por ID',
    description: 'Retorna la información de un usuario específico basado en su ID'
  })
  @ApiParam({ 
    name: 'id', 
    type: Number, 
    description: 'ID del usuario a buscar',
    example: 1 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Usuario encontrado exitosamente' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Usuario no encontrado' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'ID inválido' 
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'Actualizar un usuario',
    description: 'Actualiza la información de un usuario existente'
  })
  @ApiParam({ 
    name: 'id', 
    type: Number, 
    description: 'ID del usuario a actualizar',
    example: 1 
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Usuario actualizado exitosamente' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Usuario no encontrado' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos de entrada inválidos' 
  })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Eliminar un usuario',
    description: 'Elimina un usuario del sistema basado en su ID'
  })
  @ApiParam({ 
    name: 'id', 
    type: Number, 
    description: 'ID del usuario a eliminar',
    example: 1 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Usuario eliminado exitosamente' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Usuario no encontrado' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'ID inválido' 
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }

@Post('request-invitation')
@ApiOperation({ 
  summary: 'Solicitar invitación para crear contraseña',
  description: 'Envía un email con un token para que el usuario configure su contraseña'
})
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      email: {
        type: 'string',
        format: 'email',
        example: 'usuario@ejemplo.com',
        description: 'Email del usuario que recibirá la invitación'
      }
    },
    required: ['email']
  }
})
@ApiResponse({ 
  status: 200, 
  description: 'Invitación enviada exitosamente',
  schema: {
    type: 'object',
    properties: {
      message: {
        type: 'string',
        example: 'Invitación enviada'
      }
    }
  }
})
@ApiResponse({ 
  status: 404, 
  description: 'Usuario no encontrado' 
})
@ApiResponse({ 
  status: 400, 
  description: 'Email inválido' 
})
async requestInvitation(@Body('email') email: string) {
  const user = await this.userService.findByEmail(email);
  if (!user) throw new NotFoundException('Usuario no encontrado');

  // Genera token en invitationToken
  const token = await this.userService.createPasswordResetToken(user.id);

  // Envía email con enlace para establecer contraseña
  await this.mailService.sendUserInvitation(user.email, token);

  return { message: 'Invitación enviada' };
}


  @Post('reset-password')
  @ApiOperation({ 
    summary: 'Restablecer contraseña',
    description: 'Restablece la contraseña del usuario usando el token de verificación'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        token: {
          type: 'string',
          example: 'abc123def456',
          description: 'Token de restablecimiento recibido por email'
        },
        newPassword: {
          type: 'string',
          format: 'password',
          example: 'nuevaContraseña123',
          description: 'Nueva contraseña del usuario'
        }
      },
      required: ['token', 'newPassword']
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Contraseña restablecida exitosamente' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Token inválido o expirado' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Usuario no encontrado' 
  })
  async resetPassword(@Body() body: { token: string; newPassword: string }) {
    const { token, newPassword } = body;
    return this.userService.resetPassword(token, newPassword);
  }
}