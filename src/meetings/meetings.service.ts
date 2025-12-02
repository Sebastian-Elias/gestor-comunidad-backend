// meetings.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class MeetingsService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.MeetingCreateInput) {
    return this.prisma.meeting.create({ data });
  }

  async findAll() {
    return this.prisma.meeting.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: number) {
    return this.prisma.meeting.findUnique({ where: { id } });
  }

  async update(id: number, data: Prisma.MeetingUpdateInput) {
    return this.prisma.meeting.update({ where: { id }, data });
  }

  async remove(id: number) {
    return this.prisma.meeting.delete({ where: { id } });
  }
}
