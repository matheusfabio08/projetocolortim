import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // Admin
  const adminHash = await bcrypt.hash('Admin@2024!', 12);
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: { username: 'admin', passwordHash: adminHash, name: 'Administrador', email: 'admin@colortim.com.br', role: 'Admin' },
  });

  // Fibras
  const fibras = ['Algodão', 'Poliéster', 'Viscose', 'Nylon', 'Elastano', 'Linho', 'Modal', 'Acrílico'];
  for (const name of fibras) {
    await prisma.fiber.upsert({ where: { name }, update: {}, create: { name } });
  }

  // Regiões
  const regioes = ['Jaraguá do Sul', 'Brusque', 'Gaspar'];
  for (const name of regioes) {
    await prisma.regiao.upsert({ where: { name }, update: {}, create: { name } });
  }

  // Funcionários exemplo
  const employees = [
    { name: 'João Silva', sector: 'Preparacao' },
    { name: 'Maria Santos', sector: 'Producao' },
    { name: 'Pedro Costa', sector: 'Enrolagem' },
    { name: 'Ana Lima', sector: 'Qualidade' },
  ];
  for (const e of employees) {
    const exists = await prisma.employee.findFirst({ where: { name: e.name } });
    if (!exists) await prisma.employee.create({ data: e });
  }

  console.log('✅ Seed concluído!');
  console.log('   Login: admin / Admin@2024!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
