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
      username: 'admin',
      passwordHash: adminHash,
      name: 'Administrador',
      email: 'admin@colortim.com.br',
      role: 'Admin',
    },
  });
  console.log('✅ Admin criado: admin / admin123');

  // Default regions
  const regions = ['Jarauguá do Sul', 'Brusque', 'Gaspar'];
  for (const name of regions) {
    await prisma.region.upsert({ where: { name }, update: {}, create: { name } });
  }
  console.log('✅ Regiões criadas');

  // Default fibers
  const fibers = ['Algodão', 'Poliamida', 'Poliester', 'Viscose', 'Acrílico', 'Elastano', 'Modal', 'Bambu'];
  for (const name of fibers) {
    await prisma.fiber.upsert({ where: { name }, update: {}, create: { name } });
  }
  console.log('✅ Fibras criadas');

  // Default carriers
  const carriers = ['Correios', 'JadLog', 'Total Express', 'Braspress', 'TNT', 'Retirada'];
  for (const name of carriers) {
    await prisma.carrier.upsert({ where: { name }, update: {}, create: { name } });
  }
  console.log('✅ Transportadoras criadas');

  // Sample employees
  const employees = [
    { name: 'João Silva', sector: 'Preparacao' },
    { name: 'Maria Souza', sector: 'Preparacao' },
    { name: 'Pedro Lima', sector: 'Producao' },
    { name: 'Ana Costa', sector: 'Producao' },
    { name: 'Carlos Rodrigues', sector: 'Destrinchagem' },
    { name: 'Fernanda Alves', sector: 'Enrolagem' },
    { name: 'Roberto Martins', sector: 'Qualidade' },
    { name: 'Lívia Santos', sector: 'Laboratorio' },
  ];
  for (const emp of employees) {
    const exists = await prisma.employee.findFirst({ where: { name: emp.name } });
    if (!exists) await prisma.employee.create({ data: emp });
  }
  console.log('✅ Funcionários de exemplo criados');

  console.log('\n🎉 Seed concluído!');
  console.log('📌 Credenciais padrão: admin / admin123');
  console.log('⚠️  Altere a senha após o primeiro login!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
