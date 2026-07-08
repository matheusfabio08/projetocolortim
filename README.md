# 🎨 Projeto Colortim

Sistema interno de gestão de ordens de produção para a **Colortim** — controle de almoxarifado, rastreamento de status, fichas de produção e relatórios.

---

## 🏗️ Stack

| Camada | Tecnologia |
|--------|------------|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS |
| Backend | Node.js + Express + TypeScript |
| Banco de dados | PostgreSQL 16 |
| ORM | Prisma |
| Container | Docker + Docker Compose |

---

## 📁 Estrutura do Projeto

```
projetocolortim/
├── frontend/                  # React + Vite
│   ├── Dockerfile
│   ├── nginx.conf
│   └── src/
│       ├── components/
│       │   └── almoxarifado/  # ItemRow, OPForm, OPTable
│       ├── pages/
│       └── hooks/
├── backend/                   # Express + Prisma
│   ├── Dockerfile
│   ├── prisma/
│   │   └── schema.prisma
│   └── src/
├── docker-compose.yml         # Produção (build completo)
├── docker-compose.dev.yml     # Desenvolvimento (hot-reload)
└── .env.example
```

---

## 🚀 Rodando com Docker (recomendado)

### Pré-requisitos
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) ≥ 24 (Windows/Mac) ou Docker Engine (Linux)
- Git

### 1️⃣ Primeira vez — configure o ambiente

```bash
# Clone o repositório
git clone https://github.com/matheusfabio08/projetocolortim.git
cd projetocolortim

# Crie o .env a partir do exemplo
cp .env.example .env
```

Edite o `.env` com suas configurações (veja a seção Variáveis de Ambiente abaixo).

### 2️⃣ Desenvolvimento (hot-reload)

```bash
docker compose -f docker-compose.dev.yml up
```

- Frontend: http://localhost:5173 (Vite com hot-reload)
- Backend: http://localhost:3001 (tsx watch)
- Banco: `localhost:5432`

### 3️⃣ Produção (build completo)

```bash
docker compose up -d --build
```

- Frontend: http://localhost:80
- Backend: http://localhost:3001

### Comandos úteis

```bash
# Ver logs em tempo real
docker compose logs -f

# Parar tudo
docker compose down

# Parar e apagar o banco (CUIDADO: perde os dados)
docker compose down -v

# Rodar migrations manualmente
docker compose exec backend npx prisma migrate deploy

# Abrir Prisma Studio (interface visual do banco)
docker compose exec backend npx prisma studio
```

---

## 🔑 Variáveis de Ambiente

Copie `.env.example` para `.env` e preencha:

```env
# Banco de dados
DATABASE_URL=postgresql://colortim:colortim_pass@postgres:5432/colortim_erp

# JWT
JWT_SECRET=troque_por_uma_string_aleatoria_longa
JWT_EXPIRES_IN=8h

# Backend
PORT=3001
NODE_ENV=development

# Frontend (Vite)
VITE_API_URL=http://localhost:3001
FRONTEND_URL=http://localhost:5173
```

> ⚠️ **Nunca commite o arquivo `.env`** — ele está no `.gitignore`.

---

## 📋 Funcionalidades

- **Almoxarifado** — criação e gestão de Ordens de Produção (OPs)
- **Ficha de Produção** — geração e impressão de fichas por OP
- **Rastreamento de Status** — acompanhamento por etapa (laboratório, qualidade, produção, etc.)
- **Fibras** — cadastro e seleção de fibras por item
- **Regiões** — segmentação por Jaraguá / Brusque / Gaspar

---

## 🤝 Contribuindo

1. Crie uma branch: `git checkout -b feat/minha-feature`
2. Faça suas alterações e commite: `git commit -m 'feat: minha feature'`
3. Abra um Pull Request

---

## 📄 Licença

Projeto privado — uso interno Colortim.
