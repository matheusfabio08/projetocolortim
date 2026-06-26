# Colortim — ERP de Gestão de Produção

Sistema ERP completo para gestão de produção têxtil, reconstruído do zero com stack moderna.

## Stack

| Camada     | Tecnologia                           |
|------------|--------------------------------------|
| Frontend   | React 18 + TypeScript + Vite + Tailwind CSS |
| Backend    | Node.js + Express + TypeScript       |
| Banco      | PostgreSQL                           |
| ORM        | Prisma                               |
| Auth       | JWT + sessão persistida no banco     |
| Segurança  | Helmet + CORS + Rate Limit + bcrypt  |

## Estrutura

```
projetocolortim/
├── backend/           # API Node.js + Express + Prisma
│   ├── prisma/
│   │   └── schema.prisma
│   └── src/
│       ├── index.ts
│       ├── lib/
│       ├── middleware/
│       ├── routes/
│       └── seed.ts
└── frontend/          # React + TypeScript + Vite
    └── src/
        ├── App.tsx
        ├── contexts/
        ├── lib/
        ├── components/
        └── pages/
```

## Instalação e execução

### Pré-requisitos
- Node.js 20+
- PostgreSQL 15+

### Backend

```bash
cd backend
cp .env.example .env
# Edite .env com DATABASE_URL e JWT_SECRET
npm install
npx prisma migrate dev --name init
npx tsx src/seed.ts
npm run dev
# API rodando em http://localhost:4000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# App rodando em http://localhost:3000
```

### Login inicial

| Usuário | Senha  | Perfil        |
|---------|--------|---------------|
| `admin` | `admin123` | Administrador |

> ⚠️ Altere a senha do admin imediatamente após o primeiro login!

## Módulos implementados

- **Dashboard** — KPIs + tabela de OPs recentes
- **Gerenciamento** — CRUD completo de Ordens de Produção
- **PCP** — Quadro Kanban com todas as OPs por status
- **Almoxarifado** — OPs aguardando material
- **Laboratório** — Laudos e receitas de tingimento
- **Pesagem** — Registro de pesagem por OP (bruto/tara/líquido)
- **Preparação** — Lançamento individual e em lote
- **Produção** — Box 1, 2 e 3 com controle de status
- **Admin** — Gestão de usuários e perfis de acesso

## Segurança

- JWT com expiração + sessão invalidada no logout
- Rate limiting (login: 20/15min; geral: 500/15min)
- Headers HTTP seguros via Helmet
- CORS restrito à origem configurada
- Hashing bcrypt com salt 12
- Role-based access control (RBAC)
- Prepared statements via Prisma (prevenção SQL injection)
- Validação de inputs com Zod
