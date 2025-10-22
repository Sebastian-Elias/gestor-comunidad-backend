// src/finance/dto/create-finance-entry.dto.ts
import { IsString, IsOptional, IsNumber, IsEnum, IsDateString, IsInt } from 'class-validator';
import { FinanceType, PaymentMethod, Currency } from '@prisma/client';

export class CreateFinanceEntryDto {
  @IsEnum(FinanceType)
  type: FinanceType;

  @IsNumber()
  amount: number;

  @IsEnum(Currency)
  currency: Currency;

  @IsDateString()
  date: string;

  @IsString()
  description: string;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsInt()
  categoryId: number;

  @IsOptional()
  @IsString()
  referenceNumber?: string;

  @IsOptional()
  @IsString()
  donorName?: string;

  @IsOptional()
  @IsString()
  donorContact?: string;

  @IsOptional()
  @IsString()
  beneficiary?: string;

  @IsOptional()
  @IsString()
  accountNumber?: string;

  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  invoiceNumber?: string;

  @IsOptional()
  @IsString()
  subItem?: string;

  @IsOptional()
  @IsString()
  comments?: string;
}
