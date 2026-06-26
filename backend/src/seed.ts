import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { prisma } from './lib/prisma';

async function main() {
  console.log('🌱 Iniciando seed do banco...');

  // Admin
  const adminHash = await bcrypt.hash('admin123', 12);
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash: adminHash,
      name: 'Administrador',
      email: 'admin@colortim.com.br',
      role: 'Admin',
    },
  });

  // Fibras iniciais
  const fibers = [
    { name: 'Algodão', code: 'ALG' },
    { name: 'Poliéster', code: 'POL' },
    { name: 'Viscose', code: 'VIS' },
    { name: 'Nylon', code: 'NYL' },
    { name: 'Elastano', code: 'ELA' },
  ];

  for (const fiber of fibers) {
    await prisma.fiber.upsert({
      where: { code: fiber.code },
      update: {},
      create: fiber,
    });
  }

  // Funcionários de exemplo
  const employees = [
    { name: 'João Silva', sector: 'Preparação' },
    { name: 'Maria Santos', sector: 'Produção' },
    { name: 'Carlos Oliveira', sector: 'Qualidade' },
    { name: 'Ana Souza', sector: 'Laboratório' },
    { name: 'Pedro Costa', sector: 'Enrolagem' },
  ];

  for (const emp of employees) {
    const exists = await prisma.employee.findFirst({ where: { name: emp.name } });
    if (!exists) await prisma.employee.create({ data: emp });
  }

  console.log('✅ Seed concluído!');
  console.log('   Login: admin / admin123');
}

main().catch(console.error).finally(() => prisma.$disconnect());
