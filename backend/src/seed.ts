import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // Admin
  const existing = await prisma.user.findUnique({ where: { username: 'admin' } });
  if (!existing) {
    await prisma.user.create({
      data: {
        username: 'admin',
        passwordHash: await bcrypt.hash('Admin@1234', 12),
        name: 'Administrador',
        email: 'admin@colortim.com.br',
        role: 'Admin',
      },
    });
    console.log('✅ Usuário admin criado (admin / Admin@1234)');
  } else {
    console.log('ℹ️  Admin já existe');
  }

  // Fibras padrão
  const fibras = ['Algodão', 'Poliéster', 'Viscose', 'Poliamida', 'Elastano', 'Modal', 'Linho'];
  for (const name of fibras) {
    await prisma.fiber.upsert({ where: { id: (await prisma.fiber.findFirst({ where: { name } }))?.id ?? 0 }, update: {}, create: { name } });
  }
  console.log('✅ Fibras criadas');

  // Funcionários padrão
  const employees = [
    { name: 'João Silva', sector: 'Preparação' },
    { name: 'Maria Santos', sector: 'Produção' },
    { name: 'Pedro Lima', sector: 'Destrinchagem' },
    { name: 'Ana Oliveira', sector: 'Enrolagem' },
    { name: 'Carlos Costa', sector: 'Qualidade' },
  ];
  for (const emp of employees) {
    const exists = await prisma.employee.findFirst({ where: { name: emp.name } });
    if (!exists) await prisma.employee.create({ data: emp });
  }
  console.log('✅ Funcionários criados');

  console.log('🎉 Seed concluído!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
