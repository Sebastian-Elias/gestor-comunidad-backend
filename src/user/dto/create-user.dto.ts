// user/dto/create-user.dto.ts
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { Role } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'Juan',
    minLength: 2,
    maxLength: 50
  })
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    description: 'Apellido del usuario',
    example: 'Pérez',
    minLength: 2,
    maxLength: 50
  })
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    description: 'Email del usuario',
    example: 'juan.perez@iglesia.com',
    format: 'email'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Rol del usuario en el sistema',
    enum: Role,
    example: Role.MIEMBRO,
    enumName: 'Role'
  })
  @IsEnum(Role)
  role: Role;

  @ApiPropertyOptional({
    description: 'Indica si el usuario está activo en el sistema',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}