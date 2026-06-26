import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { prisma } from './lib/prisma';

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminHash = await bcrypt.hash('Admin@2024!', 12);
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash: adminHash,
      name: 'Administrador',
      email: 'admin@colortim.com.br',
      role: 'Admin',
      isActive: true,
    },
  });
  console.log('✅ Admin user created: admin / Admin@2024!');

  // Create sample employees
  const sectors = ['Preparação', 'Produção', 'Destrinchagem', 'Enrolagem', 'Qualidade', 'Laboratório'];
  const sampleEmployees = [
    { name: 'Carlos Silva', sector: 'Preparação' },
    { name: 'Maria Santos', sector: 'Produção' },
    { name: 'João Oliveira', sector: 'Destrinchagem' },
    { name: 'Ana Costa', sector: 'Enrolagem' },
    { name: 'Pedro Lima', sector: 'Qualidade' },
    { name: 'Lucia Ferreira', sector: 'Laboratório' },
  ];

  for (const emp of sampleEmployees) {
    await prisma.employee.upsert({
      where: { id: (await prisma.employee.findFirst({ where: { name: emp.name } }))?.id ?? 0 },
      update: {},
      create: emp,
    });
  }
  console.log('✅ Sample employees created');

  // Create sample fibers
  const fibers = [
    { name: 'Algodão', code: 'ALG' },
    { name: 'Poliéster', code: 'POL' },
    { name: 'Viscose', code: 'VIS' },
    { name: 'Elastano', code: 'ELS' },
    { name: 'Nylon', code: 'NYL' },
  ];

  for (const fiber of fibers) {
    const exists = await prisma.fiber.findFirst({ where: { code: fiber.code } });
    if (!exists) await prisma.fiber.create({ data: fiber });
  }
  console.log('✅ Sample fibers created');

  console.log('🎉 Seed completed!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
