//finance/finance.controller.ts
import { Controller, Get, Post, Body, Param, Delete, Patch, ParseIntPipe } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { CreateFinanceEntryDto } from './dto/create-finance-entry.dto';
import { UpdateFinanceEntryDto } from './dto/update-finance-entry.dto';

@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  // --- ENTRIES ---
  @Post('entries/:userId')
  createEntry(
    @Body() dto: CreateFinanceEntryDto,
    @Param('userId', ParseIntPipe) userId: number, // ✅ convierte a number
  ) {
    return this.financeService.createEntry(dto, userId);
  }

  @Get('entries')
  findAllEntries() {
    return this.financeService.findAllEntries();
  }

  @Get('entries/:id')
  findOneEntry(
    @Param('id', ParseIntPipe) id: number, // ✅ convierte a number
  ) {
    return this.financeService.findOneEntry(id);
  }

  @Patch('entries/:id/:userId')
  updateEntry(
    @Param('id', ParseIntPipe) id: number, // ✅ convierte a number
    @Body() dto: UpdateFinanceEntryDto,
    @Param('userId', ParseIntPipe) userId: number, // ✅ convierte a number
  ) {
    return this.financeService.updateEntry(id, dto, userId);
  }

  @Delete('entries/:id')
  removeEntry(
    @Param('id', ParseIntPipe) id: number, // ✅ convierte a number
  ) {
    return this.financeService.removeEntry(id);
  }

  // --- CATEGORIES ---
  @Get('categories')
  findAllCategories() {
    return this.financeService.findAllCategories();
  }
}
