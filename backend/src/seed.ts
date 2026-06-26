import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { prisma } from './lib/prisma';

async function main() {
  console.log('🌱 Iniciando seed...');

  // Admin user
  const adminHash = await bcrypt.hash('admin123', 12);
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: { username: 'admin', passwordHash: adminHash, name: 'Administrador', email: 'admin@colortim.com.br', role: 'Admin' },
  });

  // Default fibers
  const fibers = ['Algodão', 'Poliéster', 'Viscose', 'Modal', 'Nylon', 'Acrílico', 'Linho', 'Seda'];
  for (const name of fibers) {
    await prisma.fiber.upsert({ where: { name }, update: {}, create: { name } });
  }

  // Default regions
  const regions = [
    { name: 'Jaraguá do Sul', slug: 'jaragua' },
    { name: 'Brusque', slug: 'brusque' },
    { name: 'Gaspar', slug: 'gaspar' },
  ];
  for (const r of regions) {
    await prisma.region.upsert({ where: { slug: r.slug }, update: {}, create: r });
  }

  // Sample transportadoras
  const transportadoras = ['Jadlog', 'Correios', 'Transportadora Local', 'Retirada pelo Cliente'];
  for (const name of transportadoras) {
    const existing = await prisma.transportadora.findFirst({ where: { name } });
    if (!existing) await prisma.transportadora.create({ data: { name } });
  }

  // Sample employees
  const employees = [
    { name: 'João Silva', sector: 'Preparação' },
    { name: 'Maria Santos', sector: 'Produção' },
    { name: 'Pedro Costa', sector: 'Qualidade' },
    { name: 'Ana Lima', sector: 'Laboratório' },
  ];
  for (const emp of employees) {
    const existing = await prisma.employee.findFirst({ where: { name: emp.name } });
    if (!existing) await prisma.employee.create({ data: emp });
  }

  console.log('✅ Seed concluído!');
  console.log('📌 Login: admin / admin123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
