// src/common/validators/is-rut.validators.ts
import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

/**
 * Función que realiza la validación matemática del RUT chileno
 * @param rut - El RUT a validar (puede venir con puntos y guión)
 * @returns boolean - true si el RUT es válido, false si no lo es
 * 
 * Explicación del algoritmo:
 * 1. Se limpia el RUT quitando puntos y guiones
 * 2. Se verifica el formato básico (7-8 dígitos + dígito verificador)
 * 3. Se separa el cuerpo del dígito verificador (DV)
 * 4. Se calcula el DV esperado usando el algoritmo oficial
 * 5. Se compara con el DV recibido
 */
function validarRut(rut: string): boolean {
  // Primera validación: que el RUT no esté vacío
  if (!rut) return false;

  // Limpieza del RUT: eliminamos puntos, comas, guiones y convertimos a mayúsculas
  // Ejemplo: "12.345.678-5" → "123456785"
  const rutClean = rut.replace(/[.,]/g, '').replace(/-/g, '').toUpperCase();

  // Validación del formato básico usando expresión regular:
  // ^\d{7,8} = 7 u 8 dígitos al inicio
  // [0-9K]$ = debe terminar en número o K
  if (!/^\d{7,8}[0-9K]$/.test(rutClean)) return false;

  // Separamos el cuerpo (todos los dígitos excepto el último) del DV
  const cuerpo = rutClean.slice(0, -1); // Ejemplo: "12345678"
  const dv = rutClean.slice(-1).toUpperCase(); // Ejemplo: "5"

  // Cálculo del dígito verificador esperado:
  let suma = 0;
  let multiplicador = 2; // La secuencia de multiplicadores comienza en 2

  // Recorremos el cuerpo de derecha a izquierda
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    // Multiplicamos cada dígito por el multiplicador actual y sumamos
    suma += parseInt(cuerpo.charAt(i)) * multiplicador;
    
    // Actualizamos el multiplicador (2,3,4,5,6,7 y luego se repite)
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }

  // Cálculo del dígito verificador esperado:
  const dvEsperado = 11 - (suma % 11);
  
  // Casos especiales:
  // Si el resultado es 11 → DV debe ser 0
  // Si el resultado es 10 → DV debe ser K
  const dvCalculado = dvEsperado === 11 
    ? '0' 
    : dvEsperado === 10 
      ? 'K' 
      : dvEsperado.toString();

  // Comparamos el DV calculado con el recibido
  return dvCalculado === dv;
}

/**
 * Clase que implementa la restricción de validación para NestJS
 * Implementa ValidatorConstraintInterface que requiere:
 * - validate(): método que realiza la validación
 * - defaultMessage(): mensaje de error por defecto
 */
@ValidatorConstraint({ async: false }) // No necesita ser asíncrono
export class IsRutConstraint implements ValidatorConstraintInterface {
  /**
   * Método que realiza la validación
   * @param rut - El RUT a validar
   * @returns boolean - Resultado de la validación
   */
  validate(rut: string) {
    const result = validarRut(rut);
    return result;
  }

  /**
   * Mensaje de error cuando la validación falla
   */
  defaultMessage() {
    return 'El RUT ingresado no es válido.';
  }
}

/**
 * Decorador @IsRut() para usar en los DTOs
 * @param validationOptions - Opciones adicionales de validación
 * 
 * Cómo se usa:
 * @IsRut({ message: 'El RUT no es válido' })
 * rut: string;
 */
export function IsRut(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    // Registra el decorador en la clase
    registerDecorator({
      target: object.constructor, // La clase del DTO
      propertyName: propertyName, // Nombre de la propiedad a validar
      options: validationOptions, // Opciones adicionales
      constraints: [], // Restricciones adicionales
      validator: IsRutConstraint, // La clase validadora
    });
  };
}