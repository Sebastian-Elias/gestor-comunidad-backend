// src/dashboard/dashboard.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getMetrics() {
    // Finanzas - últimos 30 días
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [ingresos, egresos] = await Promise.all([
      this.prisma.financeEntry.aggregate({
        _sum: { amount: true },
        where: { 
          type: 'INCOME',
          date: { gte: thirtyDaysAgo }
        },
      }),
      this.prisma.financeEntry.aggregate({
        _sum: { amount: true },
        where: { 
          type: 'EXPENSE',
          date: { gte: thirtyDaysAgo }
        },
      })
    ]);

    // Miembros - últimos 30 días para nuevos miembros
    const thirtyDaysAgoMembers = new Date();
    thirtyDaysAgoMembers.setDate(thirtyDaysAgoMembers.getDate() - 30);

    const [totalMiembros, miembrosActivos, nuevosMiembrosUltimoMes, allMembersWithBirthdays] = await Promise.all([
      this.prisma.member.count(),
      this.prisma.member.count({
        where: { isActive: true }
      }),
      // ✅ NUEVO: Miembros registrados en los últimos 30 días
      this.prisma.member.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgoMembers
          }
        }
      }),
      this.prisma.member.findMany({
        where: { 
          birthDate: { not: null },
          isActive: true 
        },
        select: { birthDate: true }
      })
    ]);

    // ✅ CORRECCIÓN: Cálculo preciso de cumpleaños del mes
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const cumpleaniosMes = allMembersWithBirthdays.filter(member => {
      if (!member.birthDate) return false;
      const birthDate = new Date(member.birthDate);
      return birthDate.getMonth() + 1 === currentMonth;
    }).length;

    // Recursos
    const totalRecursos = await this.prisma.resource.count();

    // Últimas transacciones
    const ultimasTransacciones = await this.prisma.financeEntry.findMany({
      take: 5,
      orderBy: { date: 'desc' },
      include: {
        category: true,
        createdBy: {
          select: { firstName: true, lastName: true }
        }
      }
    });

    return {
      finanzas: {
        ingresos: ingresos._sum.amount || 0,
        egresos: egresos._sum.amount || 0,
        balance: (ingresos._sum.amount || 0) - (egresos._sum.amount || 0),
        ultimasTransacciones
      },
      miembros: {
        total: totalMiembros,
        activos: miembrosActivos,
        inactivos: totalMiembros - miembrosActivos,
        nuevosUltimoMes: nuevosMiembrosUltimoMes, // ✅ Nuevo campo
        cumpleaniosMes,
      },
      recursos: {
        total: totalRecursos
      }
    };
  }

  async getFinancialTrends() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  // Agrupar por mes y tipo para mejor procesamiento
  const trends = await this.prisma.financeEntry.groupBy({
    by: ['type', 'date'],
    where: {
      date: { gte: sixMonthsAgo }
    },
    _sum: { amount: true },
    orderBy: { date: 'asc' }
  });

  return trends;
}
}