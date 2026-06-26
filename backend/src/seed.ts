import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { prisma } from './lib/prisma.js';

async function main() {
  console.log('[SEED] Iniciando seed do banco...');

  // Create admin user
  const existing = await prisma.user.findUnique({ where: { username: 'admin' } });
  if (!existing) {
    const passwordHash = await bcrypt.hash('admin123', 12);
    await prisma.user.create({
      data: {
        username: 'admin', passwordHash, name: 'Administrador',
        email: 'admin@colortim.com.br', role: 'Admin',
      },
    });
    console.log('[SEED] Admin criado: admin / admin123');
  } else {
    console.log('[SEED] Admin já existe, pulando...');
  }

  // Seed regiões
  const regions = ['Jaraguá do Sul', 'Brusque', 'Gaspar'];
  for (const name of regions) {
    await prisma.region.upsert({ where: { name }, update: {}, create: { name } });
  }
  console.log('[SEED] Regiões criadas');

  // Seed fibras
  const fibers = ['Algodão', 'Poliéster', 'Viscose', 'Nylon', 'Acrílico', 'Modal', 'Linho', 'Seda'];
  for (const name of fibers) {
    const existing = await prisma.fiber.findFirst({ where: { name } });
    if (!existing) await prisma.fiber.create({ data: { name } });
  }
  console.log('[SEED] Fibras criadas');

  // Seed funcionários de exemplo
  const employees = [
    { name: 'João Silva', sector: 'Preparação' },
    { name: 'Maria Santos', sector: 'Preparação' },
    { name: 'Carlos Oliveira', sector: 'Produção' },
    { name: 'Ana Costa', sector: 'Qualidade' },
    { name: 'Pedro Ferreira', sector: 'Laboratório' },
  ];
  for (const emp of employees) {
    const existing = await prisma.employee.findFirst({ where: { name: emp.name } });
    if (!existing) await prisma.employee.create({ data: emp });
  }
  console.log('[SEED] Funcionários criados');

  console.log('[SEED] Concluído!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
