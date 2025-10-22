//src/member/dto/create-member.dto.ts
import { IsString, IsOptional, IsDateString, IsEmail, IsBoolean } from 'class-validator';
import { IsRut } from '../../common/validators/is-rut.validator';
import { Transform } from 'class-transformer';


export class CreateMemberDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsRut({ message: 'El RUT ingresado no es válido.' })
  rut: string;

  @IsString()
  @IsOptional()
  passport?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isMale?: boolean;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsDateString()
  incorporationDate: string;

  @IsOptional()
  @IsDateString()
  baptismDate?: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;
}
