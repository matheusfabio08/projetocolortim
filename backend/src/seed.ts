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
    create: {
      username: 'admin', passwordHash: adminHash, name: 'Administrador',
      email: 'admin@colortim.com.br', role: 'Admin',
    },
  });

  // Fibras
  const fibras = ['Poliéster', 'Algodão', 'Viscose', 'Nylon', 'Elastano', 'Modal', 'Linho'];
  for (const name of fibras) {
    await prisma.fiber.upsert({ where: { name }, update: {}, create: { name } });
  }

  // Regiões
  const regioes = ['Jaraguá do Sul', 'Brusque', 'Gaspar'];
  for (const name of regioes) {
    await prisma.region.upsert({ where: { name }, update: {}, create: { name } });
  }

  // Transportadoras
  const transportadoras = ['Transportadora A', 'Transportadora B', 'Motoboy'];
  for (const name of transportadoras) {
    const exists = await prisma.transporter.findFirst({ where: { name } });
    if (!exists) await prisma.transporter.create({ data: { name } });
  }

  // Funcionários de exemplo
  const employees = [
    { name: 'João Silva', sector: 'Preparação' },
    { name: 'Maria Souza', sector: 'Produção' },
    { name: 'Carlos Oliveira', sector: 'Qualidade' },
    { name: 'Ana Santos', sector: 'Laboratório' },
  ];
  for (const emp of employees) {
    const exists = await prisma.employee.findFirst({ where: { name: emp.name } });
    if (!exists) await prisma.employee.create({ data: emp });
  }

  console.log('✅ Seed concluído!');
  console.log('   Login admin: usuario=admin / senha=admin123');
}

main().catch(console.error).finally(() => prisma.$disconnect());
