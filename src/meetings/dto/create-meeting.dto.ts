// src/meetings/dto/create-meeting.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateMeetingDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  schedule: string; // Ejemplo: "Domingos 11:00 hrs"

  @IsString()
  @IsNotEmpty()
  description: string;
}
