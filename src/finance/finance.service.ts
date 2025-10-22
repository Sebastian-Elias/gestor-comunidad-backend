// src/finance/finance.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFinanceEntryDto } from './dto/create-finance-entry.dto';
import { UpdateFinanceEntryDto } from './dto/update-finance-entry.dto';

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  // --- ENTRIES ---
  async createEntry(dto: CreateFinanceEntryDto, userId: number) {
    const category = await this.prisma.financeCategory.findUnique({
      where: { id: dto.categoryId },
    });

    if (!category) {
      throw new Error(`La categoría con id ${dto.categoryId} no existe`);
    }

    return this.prisma.financeEntry.create({
      data: {
        type: dto.type,
        amount: dto.amount,
        currency: dto.currency,
        date: new Date(dto.date),
        description: dto.description,
        paymentMethod: dto.paymentMethod,
        referenceNumber: dto.referenceNumber,
        donorName: dto.donorName,
        donorContact: dto.donorContact,
        beneficiary: dto.beneficiary,
        accountNumber: dto.accountNumber,
        bankName: dto.bankName,
        invoiceNumber: dto.invoiceNumber,
        subItem: dto.subItem,
        comments: dto.comments,
        createdById: userId,
        categoryId: dto.categoryId,
      },
      include: { category: true, createdBy: true },
    });
  }

  findAllEntries() {
    return this.prisma.financeEntry.findMany({
      include: { category: true, createdBy: true, updatedBy: true },
      orderBy: { date: 'desc' },
    });
  }

  findOneEntry(id: number) {
    return this.prisma.financeEntry.findUnique({
      where: { id },
      include: { category: true, createdBy: true, updatedBy: true },
    });
  }

  updateEntry(id: number, dto: UpdateFinanceEntryDto, userId: number) {
    return this.prisma.financeEntry.update({
      where: { id },
      data: {
        ...dto,
        updatedById: userId,
      },
    });
  }

  removeEntry(id: number) {
    return this.prisma.financeEntry.delete({
      where: { id },
    });
  }

  // --- CATEGORIES ---
  findAllCategories() {
    return this.prisma.financeCategory.findMany({
      include: { entries: true },
    });
  }
}
