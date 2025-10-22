//prisma/sedd.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // ============================
  // 1. Crear usuario admin
  // ============================
  const email = 'admin@example.com';
  const password = 'admin123'; // mínimo 6 caracteres
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (!existingUser) {
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
      },
    });
    console.log(`✅ Usuario ADMIN creado: ${email} / ${password}`);
  } else {
    console.log(`ℹ️ Usuario con email ${email} ya existe`);
  }

  // ============================
  // 2. Crear categorías de finanzas
  // ============================
  const categories = [
    { name: 'Diezmo' },
    { name: 'Ofrenda' },
    { name: 'Ofrenda especial' },
    { name: 'Donación' },
    { name: 'Gastos Operativos' },
  ];

  for (const category of categories) {
    await prisma.financeCategory.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }

  console.log('✅ Categorías de finanzas iniciales cargadas');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
