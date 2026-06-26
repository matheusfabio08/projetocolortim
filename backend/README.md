# Colortim Backend

Node.js + Express + Prisma + PostgreSQL

## Setup

```bash
# Instalar dependências
npm install

# Copiar .env
cp .env.example .env
# Editar .env com sua DATABASE_URL e JWT_SECRET

# Gerar Prisma Client
npx prisma generate

# Criar banco e rodar migrations
npx prisma migrate dev --name init

# Seed inicial (cria admin e dados base)
npm run db:seed

# Iniciar em desenvolvimento
npm run dev
```

## Credenciais padrão após seed
- **Usuário:** admin  
- **Senha:** Admin@2024!

## Segurança implementada
- JWT com sessão persistida no banco (invalidação server-side)
- bcrypt com salt 12 para hashing de senhas
- Helmet (headers HTTP de segurança)
- CORS restrito à URL do frontend
- Rate limiting global (500/15min) e no login (20/15min)
- Role-based access control (RBAC)
- Validação de todos os inputs com Zod
- Proteção contra timing attacks no login
- Cascade delete para integridade referencial

## Roles
- `Admin` — acesso total, gestão de usuários
- `PCP` — planejamento e controle de produção
- `Gerenciamento` — visão geral e relatórios  
- `Almoxarifado` — criação e gestão de OPs
- `Operador` — acesso às etapas de produção
