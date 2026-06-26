import 'dotenv/config';
import prisma from './lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Admin user
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
      isActive: true,
    },
  });

  // Fibras
  const fibras = ['Algodão', 'Poliéster', 'Viscose', 'Elastano', 'Nylon', 'Modal', 'Linho', 'Seda'];
  for (const name of fibras) {
    await prisma.fiber.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // Regiões
  const regioes = ['Jaraguá do Sul', 'Brusque', 'Gaspar'];
  for (const name of regioes) {
    await prisma.regiao.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // Employees
  const employees = [
    { name: 'João Silva', sector: 'Preparacao' },
    { name: 'Maria Santos', sector: 'Producao' },
    { name: 'Pedro Oliveira', sector: 'Preparacao' },
    { name: 'Ana Costa', sector: 'Qualidade' },
    { name: 'Carlos Souza', sector: 'Secadora' },
  ];

  for (const emp of employees) {
    const existing = await prisma.employee.findFirst({
      where: { name: emp.name },
    });
    if (!existing) {
      await prisma.employee.create({ data: emp });
    }
  }

  console.log('✅ Seed concluído com sucesso!');
  console.log('📋 Credenciais Admin: admin / admin123');
  console.log('⚠️  ALTERE A SENHA DO ADMIN EM PRODUÇÃO!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
