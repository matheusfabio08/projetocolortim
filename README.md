# 🎨 Projeto Colortim

Sistema interno de gestão de ordens de produção para a **Colortim** — controle de almoxarifado, rastreamento de status, fichas de produção e relatórios.

---

## 🏗️ Stack

| Camada | Tecnologia |
|--------|------------|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS |
| Backend | Node.js + Express + TypeScript |
| Banco de dados | PostgreSQL |
| ORM | Drizzle ORM |
| Container | Docker + Docker Compose |

---

## 📁 Estrutura do Projeto

```
projetocolortim/
├── frontend/          # React + Vite
│   └── src/
│       ├── components/
│       │   └── almoxarifado/  # ItemRow, OPForm, OPTable
│       ├── pages/
│       └── hooks/
├── backend/           # Express + Drizzle
│   └── src/
│       ├── routes/
│       └── db/
├── docker-compose.yml
└── .env.example       # Variáveis necessárias
```

---

## 🚀 Rodando com Docker (recomendado)

### Pré-requisitos
- [Docker](https://www.docker.com/) ≥ 24
- [Docker Compose](https://docs.docker.com/compose/) ≥ 2

### Passos

```bash
# 1. Clone o repositório
git clone https://github.com/matheusfabio08/projetocolortim.git
cd projetocolortim

# 2. Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais

# 3. Suba todos os serviços
docker compose up -d

# 4. Acesse
# Frontend: http://localhost:5173
# Backend:  http://localhost:3000
```

---

## ⚙️ Rodando em modo desenvolvimento (sem Docker)

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🔑 Variáveis de Ambiente

Copie `.env.example` para `.env` e preencha:

```env
# Banco de dados
DATABASE_URL=postgresql://usuario:senha@localhost:5432/colortim

# Backend
PORT=3000
NODE_ENV=development

# Frontend (Vite)
VITE_API_URL=http://localhost:3000
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
