# Projeto Colortim ERP - Conversão

Estrutura inicial do projeto convertida para:

- **Front-end:** React + TypeScript + Vite
- **Back-end:** Node.js + Express 5
- **Banco:** PostgreSQL
- **ORM:** Prisma

## Estrutura

```
projetocolortim/
├── backend/         # Node.js + Express + Prisma
└── frontend/        # React + TypeScript + Vite
```

## Como rodar

### Backend
```bash
cd backend
cp .env.example .env
# Edite o .env com sua DATABASE_URL e JWT_SECRET
npm install
npx prisma migrate dev --name init
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Status da migração

- [x] Esqueleto de pastas e configs
- [x] Backend Express com middlewares de segurança
- [x] Rotas placeholder para todos os módulos
- [x] Frontend React + Vite com todas as rotas mapeadas
- [ ] Schema Prisma completo
- [ ] Autenticação JWT completa
- [ ] Migração da regra de negócio do worker original
- [ ] Telas do frontend com layout original
