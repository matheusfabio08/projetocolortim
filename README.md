# Colortim ERP

Sistema ERP industrial reconstruído com stack moderna e segura.

## Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **ORM**: Prisma
- **Banco de dados**: PostgreSQL 16
- **Autenticação**: JWT + sessões persistidas no banco
- **Segurança**: Helmet, CORS, Rate Limiting, bcrypt, Zod validation

## Pré-requisitos

- Node.js 20+
- PostgreSQL 16+ (ou Docker)

## Setup com Docker (recomendado)

```bash
# Copie e edite o .env
cp backend/.env.example backend/.env
# Edite JWT_SECRET com um valor aleatório longo (mínimo 64 chars)

# Suba tudo
docker-compose up -d

# Rode o seed (primeira vez)
docker exec colortim_backend npx tsx src/seed.ts
```

Acesse em: `http://localhost`

## Setup manual

### Backend

```bash
cd backend
cp .env.example .env
# Configure DATABASE_URL e JWT_SECRET no .env
npm install
npx prisma migrate dev --name init
npx tsx src/seed.ts
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Credenciais padrão (seed)

| Usuário | Senha | Role |
|---------|-------|------|
| `admin` | `Admin@2025!` | ADMIN |

> ⚠️ Altere a senha do admin imediatamente em produção!

## Módulos do sistema

| Módulo | Descrição |
|--------|-----------|
| Dashboard | KPIs e visão geral |
| Gerenciamento | Gestão de OPs e relatórios |
| PCP | Planejamento e controle de produção |
| Almoxarifado | Controle de materiais |
| Preparação | Preparação individual e em lote |
| Produção | Boxes 1, 2, 3 |
| Secadora | Controle de secagem |
| Destrinchagem | Processo de destrinchagem |
| Enrolagem | Processo de enrolagem |
| Qualidade | Controle de qualidade |
| Laboratório | Análises laboratoriais |
| Pesagem | Controle de pesagem |
| Box 4/5/6 | Boxes finais |
| Lista de Saída | Despacho e saída |
| Qualidade Tecido | Controle de qualidade do tecido |
| Scrolls | Visualização geral de OPs |
| Admin | Gestão de usuários e acessos |

## Segurança

- JWT com expiração configurável + sessões no banco
- Rate limiting (login: 20 req/15min; API: 500 req/15min)
- Headers HTTP seguros via Helmet
- CORS restrito à origem configurada
- Hashing bcrypt com salt 12
- Validação de inputs com Zod em todas as rotas
- Proteção contra SQL injection via Prisma ORM
- Role-based access control (RBAC)
