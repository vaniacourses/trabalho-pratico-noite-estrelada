# RODANDO O PROJETO COMPLETO

> Backend + Frontend do Sistema "Noite Estrelada"

---

## 📋 Pré-requisitos

- Node.js 18+
- Docker e Docker Compose
- npm ou yarn

---

## 🚀 Inicialização Rápida (5 minutos)

### 1️⃣ Setup Completo
```bash
bash init.sh
```

Este script:
- Verifica pré-requisitos
- Instala dependências npm
- Configura .env.local
- Inicia PostgreSQL com Docker
- Sincroniza schema Prisma
- Popula banco com dados iniciais

### 2️⃣ Em Um Terminal: Backend
```bash
npm run dev
```

Servidor rodando em: **http://localhost:3000**

Você verá:
```
▲ Next.js 15.0.0
- Local:        http://localhost:3000
- Environments: .env.local
```

### 3️⃣ Em Outro Terminal: Banco de Dados Visual
```bash
npx prisma studio
```

Abrirá em: **http://localhost:5555**

Use este para:
- Visualizar dados do banco
- Criar leitor/exemplar para testar
- Ver empréstimos realizados

---

## 🌐 Acessando o Sistema

### Home
```
http://localhost:3000
```

Vê:
- Título "Noite Estrelada"
- 2 botões: "Acessar Sistema" e "Atendimento"

### Login
```
http://localhost:3000/login
```

Preencher:
- Email: qualquer email válido (ex: user@example.com)
- Senha: mínimo 6 caracteres

Clicar: "Fazer Login"

### Balcão (Atendimento)
```
http://localhost:3000/balcao
```

Preencher:
- ID do Leitor
- ID do Exemplar

---

## 📊 Como Testar o Sistema

### Passo 1: Gerar IDs de Teste

1. Abrir **Prisma Studio** em http://localhost:5555
2. Clicar em **"Leitor"**
3. Copiar um `id` que tenha `estado: REGULAR`
4. Clicar em **"Exemplar"**
5. Copiar um `id` que tenha `estado: DISPONIVEL`

### Passo 2: Testar Empréstimo

1. Acessar http://localhost:3000/balcao
2. Colar o ID do Leitor no campo "ID do Leitor"
3. Colar o ID do Exemplar no campo "ID do Exemplar"
4. Clicar "Realizar Empréstimo"

### Resultado Esperado

✅ Sucesso:
```json
{
  "sucesso": true,
  "dados": {
    "id": "emp789",
    "idLeitor": "abc123",
    "idExemplar": "def456",
    "dataInicio": "2025-06-01T14:30Z",
    "dataExpiracao": "2025-06-15T14:30Z",
    "estado": "CORRENTE"
  }
}
```

❌ Erro Possível:
```json
{
  "sucesso": false,
  "erro": {
    "codigo": "EXEMPLAR_INDISPONIVEL",
    "mensagem": "O exemplar não está disponível para empréstimo"
  }
}
```

### Verificar no Prisma Studio

1. Abrir http://localhost:5555
2. Clicar em **"Emprestimo"**
3. Ver o novo empréstimo criado
4. Clicar em **"Exemplar"**
5. Ver que o exemplar agora tem `estado: EMPRESTADO`

---

## 🛠️ Comandos Úteis

### Desenvolvimento
```bash
npm run dev              # Inicia servidor dev (port 3000)
npm run build            # Build para produção
npm run start            # Roda build em produção
npm run lint             # ESLint
```

### Banco de Dados
```bash
npx prisma studio       # Interface visual (port 5555)
npx prisma db push      # Sincroniza schema
npx prisma generate     # Gera cliente Prisma
npx prisma migrate reset # Reseta banco (perigoso!)
npm run db:seed         # Popula com dados iniciais
```

### Docker
```bash
docker-compose up -d    # Inicia PostgreSQL
docker-compose down     # Para PostgreSQL
docker-compose logs     # Ver logs
docker ps               # Ver containers rodando
```

---

## 📁 Estrutura de Pastas (Final)

```
projeto-noite-estrelada/
│
├── 📚 Documentação
│   ├── README.md                    (Visão geral)
│   ├── QUICKSTART.md                (5 minutos)
│   ├── SETUP.md                     (Completo)
│   ├── ARQUITETURA.md               (Backend)
│   ├── FRONTEND.md                  (Frontend)
│   ├── ESTRUTURA-FRONTEND.md        (Componentes)
│   └── ... (+ 5 arquivos)
│
├── 🔧 Configuração Raiz
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.ts
│   ├── tailwind.config.ts           (NOVO!)
│   ├── postcss.config.mjs           (NOVO!)
│   ├── eslint.config.mjs
│   ├── .env.example
│   ├── .gitignore
│   ├── docker-compose.yml
│   └── init.sh
│
├── 📁 src/
│   │
│   ├── 🌐 app/ (Páginas + Layout)
│   │   ├── layout.tsx               (Root)
│   │   ├── globals.css              (Tailwind)
│   │   ├── page.tsx                 (Home)
│   │   ├── login/page.tsx           (Login)
│   │   └── balcao/page.tsx          (Balcão)
│   │
│   ├── 🧩 components/ (UI + Layouts)
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Alert.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   ├── forms/ (expandível)
│   │   └── layout/
│   │       └── Layout.tsx
│   │
│   ├── 🔗 hooks/ (Custom Hooks)
│   │   ├── useApi.ts                (Requisições HTTP)
│   │   └── useForm.ts               (Gerenciar formulários)
│   │
│   ├── 🛠️ utils/ (Helpers)
│   │   ├── helpers.ts               (Utilities)
│   │   └── validators.ts            (Validação)
│   │
│   ├── 🔐 services/ (BACKEND - Negócios)
│   │   └── emprestimoService.ts
│   │
│   ├── 💾 repositories/ (BACKEND - Persistência)
│   │   └── emprestimoRepository.ts
│   │
│   ├── 📦 types/
│   │   └── index.ts                 (DTOs)
│   │
│   └── 🧪 __tests__/
│       └── emprestimo.test.ts
│
├── 🗄️ prisma/
│   ├── schema.prisma
│   └── seed.ts
│
└── 📦 node_modules/ (após npm install)
```

---

## 🎯 Fluxo Completo do Sistema

```
┌─────────────────────────────────────────────────────────────┐
│  CLIENTE (Browser)                                          │
│  http://localhost:3000                                      │
└────────────────────┬────────────────────────────────────────┘
                     │
    ┌────────────────┼────────────────┐
    │                │                │
    ↓                ↓                ↓
┌─────────┐    ┌──────────┐    ┌──────────────┐
│   /     │    │ /login   │    │  /balcao     │
│  Home   │    │ Login    │    │  Balcão      │
└────┬────┘    └────┬─────┘    └────┬─────────┘
     │              │               │
     │         useForm hook         │
     │         Validação            │
     │         │                    │
     │         ↓                    useForm
     │    POST /api/auth/login      Validação
     │    (simulado)                │
     │         │                    ↓
     │         │            POST /api/emprestimos
     │         │            (route.ts)
     │         │                    │
     └─────────┼────────────────────┤
               │                    │
               ↓                    ↓
        ┌─────────────────────────────────────┐
        │  BACKEND (Next.js API Routes)       │
        │  http://localhost:3000/api/...      │
        │                                     │
        │  ┌──────────────┐    ┌────────────┐ │
        │  │  Controller  │    │  Service   │ │
        │  │  (Route)     │    │ (Business) │ │
        │  └──────┬───────┘    └────┬───────┘ │
        │         │                 │         │
        │         ├─────────────────┤         │
        │         │                 │         │
        │         ↓                 ↓         │
        │    ┌──────────────────────────────┐ │
        │    │  Repository (Persistência)   │ │
        │    │  - Validações BD             │ │
        │    │  - Transações Atômicas       │ │
        │    └──────────┬───────────────────┘ │
        └───────────────┼─────────────────────┘
                        │
                        ↓
        ┌──────────────────────────────────────┐
        │  PRISMA ORM                          │
        │  - Client Prisma singleton           │
        │  - Executa queries                   │
        └──────────────┬───────────────────────┘
                       │
                       ↓
        ┌──────────────────────────────────────┐
        │  POSTGRESQL (Docker)                 │
        │  host: localhost:5432                │
        │  user: postgres / pass: postgres     │
        │  db: biblioteca_db                   │
        │                                      │
        │  ✓ INSERT emprestimos                │
        │  ✓ UPDATE exemplares                 │
        │  ✓ SELECT verificações              │
        └─────────────┬──────────────────────┘
                      │
                      ↓
        ┌──────────────────────────────────────┐
        │  PRISMA STUDIO (Visual Interface)    │
        │  http://localhost:5555               │
        │                                      │
        │  Visualizar/Editar dados             │
        └──────────────────────────────────────┘
```

---

## ✅ Checklist de Setup

```
Pré-requisitos:
  ☐ Node.js 18+ instalado
  ☐ Docker instalado
  ☐ npm/yarn instalado

Setup:
  ☐ npm install
  ☐ cp .env.example .env.local
  ☐ docker-compose up -d
  ☐ npx prisma db push
  ☐ npx prisma generate

Teste:
  ☐ npm run dev (backend rodando)
  ☐ http://localhost:3000 (abre)
  ☐ http://localhost:3000/login (abre)
  ☐ http://localhost:3000/balcao (abre)
  ☐ npx prisma studio (abre em :5555)

Teste funcional:
  ☐ Fazer login com email/senha
  ☐ Copiar IDs do Prisma Studio
  ☐ Realizar empréstimo no /balcao
  ☐ Ver resultado na API
  ☐ Verificar dados no Prisma Studio
```

---

## 🐛 Troubleshooting

| Problema | Solução |
|----------|---------|
| "npm: command not found" | Instalar Node.js |
| "docker: command not found" | Instalar Docker |
| Port 3000 já em uso | `npm run dev -- -p 3001` |
| Port 5432 já em uso (PostgreSQL) | `docker-compose down` primeiro |
| "Cannot find module @/..." | `npm install` novamente |
| Estilos não carregam | Limpar `.next/` e `npm run dev` |
| PostgreSQL não conecta | `docker ps` e `docker-compose logs` |
| "Unique constraint violation" | `npx prisma migrate reset` |

---

## 📊 Resumo Técnico

| Aspecto | Tecnologia |
|--------|-----------|
| **Frontend** | React 19 + Next.js 15 + TypeScript |
| **Estilo** | Tailwind CSS com tema brand |
| **Backend** | Next.js API Routes + TypeScript |
| **ORM** | Prisma 5 |
| **Banco** | PostgreSQL 16 (Docker) |
| **Arquitetura** | 3 Camadas (Apresentação, Negócios, Persistência) |
| **Padrões** | GRASP (Controller, Information Expert, Creator) |

---

## 🎓 O que Você Tem

✅ Frontend responsivo e elegante  
✅ Backend com arquitetura em camadas  
✅ Banco de dados relacional  
✅ Componentes reutilizáveis  
✅ Hooks customizados  
✅ Validação integrada  
✅ Transações atômicas  
✅ Documentação completa  
✅ Docker automatizado  

---

## 🚀 Próximas Etapas

1. **Testar completo** - Seguir checklist acima
2. **Criar mais páginas** - Dashboard, gerenciamento, etc
3. **Adicionar autenticação real** - JWT + sessions
4. **Implementar testes** - Jest + Playwright
5. **Deploy** - Vercel (frontend) + AWS/Heroku (backend)

---

**Data:** 1 de junho de 2025  
**Versão:** 1.0.0  
**Status:** ✅ Pronto para uso
