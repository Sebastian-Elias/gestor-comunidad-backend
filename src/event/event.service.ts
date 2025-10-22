// src/event/event.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateEventDto) {
    await this.validateSlug(data.slug);
    
    return this.prisma.event.create({
      data: {
        ...data,
        date: data.date ? new Date(data.date) : null,
      },
      include: { organizer: true }
    });
  }

  async findAll() {
    return this.prisma.event.findMany({
      orderBy: { date: 'desc' },
      include: { organizer: true }
    });
  }

  async findOne(id: number) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: { organizer: true }
    });
    
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async update(id: number, data: UpdateEventDto) {
    await this.findOne(id);
    
    if (data.slug) {
      await this.validateSlug(data.slug, id);
    }

    return this.prisma.event.update({
      where: { id },
      data: {
        ...data,
        date: data.date ? new Date(data.date) : undefined,
      },
      include: { organizer: true }
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.event.delete({ where: { id } });
  }

  private async validateSlug(slug: string, excludeId?: number) {
    const existing = await this.prisma.event.findFirst({
      where: { 
        slug,
        ...(excludeId && { NOT: { id: excludeId } })
      }
    });
    
    if (existing) throw new ConflictException('Slug already exists');
  }

  // Métodos adicionales útiles para eventos
  async findFeatured() {
    return this.prisma.event.findMany({
      where: { featured: true },
      orderBy: { date: 'asc' },
      include: { organizer: true }
    });
  }

  async findUpcoming() {
    return this.prisma.event.findMany({
      where: { 
        date: { gte: new Date() }
      },
      orderBy: { date: 'asc' },
      include: { organizer: true }
    });
  }

  async findByOrganizer(organizerId: number) {
    return this.prisma.event.findMany({
      where: { organizerId },
      orderBy: { date: 'desc' },
      include: { organizer: true }
    });
  }
}