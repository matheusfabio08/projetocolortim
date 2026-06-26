import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Admin user
  const passwordHash = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash,
      name: 'Administrador',
      email: 'admin@colortim.com.br',
      role: 'Admin',
      isActive: true,
    },
  });
  console.log('✅ Admin user:', admin.username);

  // Fibras
  const fibers = ['Algodão', 'Poliéster', 'Viscose', 'Nylon', 'Linho', 'Modal', 'Elastano'];
  for (const name of fibers) {
    await prisma.fiber.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log('✅ Fibras criadas');

  // Regiões
  const regioes = [
    { name: 'Jaraguá do Sul', code: 'JGS' },
    { name: 'Brusque', code: 'BRQ' },
    { name: 'Gaspar', code: 'GSP' },
  ];
  for (const r of regioes) {
    await prisma.regiao.upsert({
      where: { code: r.code },
      update: {},
      create: r,
    });
  }
  console.log('✅ Regiões criadas');

  // Transportadoras
  const transportadoras = ['Transportadora A', 'Transportadora B', 'Retirada pelo cliente'];
  for (const name of transportadoras) {
    await prisma.transportadora.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log('✅ Transportadoras criadas');

  // Funcionários
  const employees = [
    { name: 'Carlos Silva', sector: 'Preparacao' },
    { name: 'Ana Santos', sector: 'Preparacao' },
    { name: 'João Costa', sector: 'Producao' },
    { name: 'Maria Lima', sector: 'Producao' },
    { name: 'Pedro Alves', sector: 'Destrinchagem' },
    { name: 'Lucia Ferreira', sector: 'Enrolagem' },
    { name: 'Roberto Nunes', sector: 'Qualidade' },
    { name: 'Sandra Moura', sector: 'Laboratorio' },
  ];
  for (const emp of employees) {
    const exists = await prisma.employee.findFirst({ where: { name: emp.name } });
    if (!exists) {
      await prisma.employee.create({ data: emp });
    }
  }
  console.log('✅ Funcionários criados');

  console.log('🎉 Seed concluído com sucesso!');
  console.log('👤 Login: admin / admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
