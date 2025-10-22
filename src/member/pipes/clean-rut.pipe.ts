// src/member/pipes/clean-rut.pipe.ts
import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class CleanRutPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type === 'body' && value?.rut) {
      console.log('RUT antes de limpiar:', value.rut); // Debug
      value.rut = value.rut.replace(/\./g, '').replace(/-/g, '').toUpperCase();
      console.log('RUT después de limpiar:', value.rut); // Debug
    }
    return value;
  }
}