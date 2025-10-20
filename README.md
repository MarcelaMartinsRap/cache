# Initial Setup - Fullstack Project

**[🚀 Backend](#backend)** • **[🎨 Frontend](#frontend)** • **[🏃 Quick Start](#quick-start)**

Setup inicial com **Next.js 15** + **Express** + **Prisma** + **TypeScript**.

---

## Backend

### Stack

- Express 5 + TypeScript (ESM)
- Prisma ORM (PostgreSQL)
- tsx (hot reload)

### Dependências Principais

- `express` ^5.1.0
- `@prisma/client` ^6.17.1
- `tsx` ^4.20.6

### Setup

**1. Instalar:**

```bash
cd backend && npm install
```

**2. Configurar `.env`:**

```env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
PORT=3000
```

**3. Rodar:**

```bash
npx prisma generate
npm run dev  # http://localhost:3000
```

**API:**

- `GET /` → `{ "ok": true }`

---

## Frontend

### Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS v4
- shadcn/ui + Radix UI
- Axios (cliente HTTP)

### 🎯 Componentes shadcn/ui Instalados

Todos os componentes estão em `src/components/ui/` e prontos para uso:

| Componente       | Descrição              | Uso Principal                    |
| ---------------- | ---------------------- | -------------------------------- |
| **Alert Dialog** | Modal de confirmação   | Ações destrutivas, confirmações  |
| **Button**       | Botão com variantes    | Ações primárias/secundárias      |
| **Card**         | Container com sections | Exibição de conteúdo estruturado |
| **Input**        | Campo de texto         | Formulários                      |
| **Label**        | Label acessível        | Formulários                      |
| **Pagination**   | Navegação de páginas   | Listas paginadas                 |
| **Sonner**       | Toast notifications    | Feedback de ações                |
| **Table**        | Tabela responsiva      | Exibição de dados tabulares      |

**Exemplo de uso:**

```tsx
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
  </CardHeader>
  <CardContent>
    <Button>Clique aqui</Button>
  </CardContent>
</Card>;
```

### Dependências

`next` 15.5.6 • `react` 19.1.0 • `axios` ^1.12.2 • `tailwindcss` ^4 • `lucide-react` • `sonner`

### Setup

**1. Instalar:**

```bash
cd frontend && npm install
```

**2. Configurar `.env.local`:**

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**3. Rodar:**

```bash
npm run dev  # http://localhost:3001
```

**Cliente API (Axios):**

```typescript
import { api } from "@/lib/api";
const res = await api.get("/endpoint");
```

---

## 🏃 Quick Start

```bash
# Backend
cd backend
npm install
npx prisma generate
npm run dev

# Frontend (outro terminal)
cd frontend
npm install
npm run dev
```

---

## � Notas

- TypeScript strict mode em ambos
- Backend usa ESM (`"type": "module"`)
- Frontend usa Turbopack
- Prisma output: `src/generated/prisma`
