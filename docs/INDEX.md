# 📖 ÍNDICE DE DOCUMENTAÇÃO - Noite Estrelada

> Guia rápido para toda a documentação do projeto

---

## 🎯 Começar Aqui

1. **Primeira vez?** → [QUICKSTART.md](./QUICKSTART.md) (5 minutos)
2. **Setup completo?** → [SETUP.md](./SETUP.md)
3. **Como rodar?** → [RODANDO-PROJETO.md](./RODANDO-PROJETO.md)

---

## 📚 Documentação Organizada

### 🚀 Getting Started
```
QUICKSTART.md ⭐ START HERE
  └─ 5 passos para rodar o projeto
  
RODANDO-PROJETO.md
  └─ Backend + Frontend + Banco de dados
```

### 🔙 Backend
```
ARQUITETURA.md
  ├─ 3 Camadas (Apresentação, Negócios, Persistência)
  ├─ Padrões GRASP
  └─ Fluxo completo do empréstimo
  
ESTRUTURA.md
  ├─ Visão geral do projeto
  ├─ Modelo de dados
  └─ Como adicionar novos endpoints
  
EXEMPLOS-REQUISICOES.md
  ├─ cURL
  ├─ Postman
  ├─ JavaScript
  └─ Python
```

### 🎭 Frontend
```
FRONTEND.md ⭐ START HERE (Frontend)
  ├─ Stack tecnológico
  ├─ Componentes UI
  ├─ Hooks customizados
  ├─ Páginas (Home, Login, Balcão)
  └─ Integração com API
  
ESTRUTURA-FRONTEND.md
  ├─ Visualização de pastas
  ├─ Paleta de cores
  ├─ Fluxo de dados
  ├─ Componentes em uso
  └─ Estados dos componentes
```

### 🏗️ Geral
```
README.md
  └─ Visão geral completa (Backend + Frontend)
```

---

## 🗂️ Estrutura de Pastas

```
projeto-noite-estrelada/
│
├── 📖 DOCUMENTAÇÃO (Este arquivo + 8 others)
│   ├── README.md                    (Visão geral principal)
│   ├── INDEX.md                     (Este arquivo - guia de docs)
│   ├── QUICKSTART.md                (5 minutos setup)
│   ├── SETUP.md                     (Setup detalhado)
│   ├── RODANDO-PROJETO.md           (Como rodar completo)
│   ├── ARQUITETURA.md               (Backend architecture)
│   ├── ESTRUTURA.md                 (Backend overview)
│   ├── FRONTEND.md                  (Frontend guide)
│   ├── ESTRUTURA-FRONTEND.md        (Frontend structure)
│   └── EXEMPLOS-REQUISICOES.md      (API examples)
│
├── 🔧 CONFIGURAÇÃO (Raiz)
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   ├── postcss.config.mjs
│   ├── .env.example
│   ├── docker-compose.yml
│   └── init.sh
│
├── 🔙 BACKEND (src/)
│   ├── app/api/emprestimos/route.ts    (Controller)
│   ├── services/emprestimoService.ts   (Business Logic)
│   ├── repositories/emprestimoRepository.ts (Persistence)
│   ├── types/index.ts                  (DTOs)
│   └── lib/prisma.ts                   (Prisma Client)
│
├── 🎭 FRONTEND (src/)
│   ├── app/
│   │   ├── layout.tsx                  (Root Layout)
│   │   ├── page.tsx                    (Home)
│   │   ├── globals.css                 (Global Styles)
│   │   ├── login/page.tsx              (Login Page)
│   │   └── balcao/page.tsx             (Balcão Page)
│   ├── components/
│   │   ├── ui/                         (5 UI components)
│   │   ├── layout/                     (Layout components)
│   │   └── forms/                      (Form components)
│   ├── hooks/                          (useApi, useForm)
│   └── utils/                          (helpers, validators)
│
├── 🗄️ PRISMA
│   ├── schema.prisma                   (Database schema)
│   └── seed.ts                         (Seed script)
│
└── 📦 node_modules/ (após npm install)
```

---

## ⚡ Fluxos Rápidos

### Como Adicionar um Novo Endpoint?
1. Ler: [ARQUITETURA.md](./ARQUITETURA.md)
2. Copiar estrutura existente de emprestimos
3. Criar: Route Handler → Service → Repository
4. Testar com exemplos em [EXEMPLOS-REQUISICOES.md](./EXEMPLOS-REQUISICOES.md)

### Como Customizar Componentes?
1. Ler: [ESTRUTURA-FRONTEND.md](./ESTRUTURA-FRONTEND.md)
2. Ver componentes em `src/components/ui/`
3. Modificar estilos em `tailwind.config.ts`
4. Testar em página

### Como Testar API?
1. Ver [EXEMPLOS-REQUISICOES.md](./EXEMPLOS-REQUISICOES.md)
2. Usar Prisma Studio: `npx prisma studio`
3. Usar cURL / Postman / Browser DevTools

### Como Fazer Deploy?
1. Frontend: Vercel (automático com GitHub)
2. Backend: AWS / Heroku / Railway / Render
3. Banco: AWS RDS / Heroku Postgres / Supabase

---

## 🎯 Roadmap Futuro

### Phase 1: Setup Inicial ✅
- ✅ Backend 3 camadas
- ✅ Frontend com componentes
- ✅ Banco de dados PostgreSQL
- ✅ Documentação completa

### Phase 2: Funcionalidades
- [ ] Autenticação real (JWT)
- [ ] Dashboard
- [ ] Perfil de usuário
- [ ] Histórico detalhado

### Phase 3: Avançado
- [ ] Testes (Jest + Playwright)
- [ ] CI/CD (GitHub Actions)
- [ ] Monitoring
- [ ] Analytics

### Phase 4: Produção
- [ ] Deploy automático
- [ ] CDN
- [ ] Performance optimization
- [ ] Security hardening

---

## 📊 Metadados

| Aspecto | Detalhe |
|--------|---------|
| **Linguagem** | TypeScript + React + Next.js |
| **Banco** | PostgreSQL 16 |
| **Estilo** | Tailwind CSS com tema brand |
| **Arquitetura** | 3 Camadas + GRASP |
| **Páginas** | 3 principais (Home, Login, Balcão) |
| **Componentes** | 5 UI + 2 Layouts |
| **Hooks** | 2 customizados (useApi, useForm) |
| **Validators** | 7 funções de validação |
| **Documentação** | 10 arquivos Markdown |
| **Status** | ✅ 1.0.0 - Funcional |

---

## 🔍 Índice de Conceitos

### Backend
- [Arquitetura em Camadas](./ARQUITETURA.md) - Apresentação, Negócios, Persistência
- [Padrões GRASP](./ARQUITETURA.md) - Controller, Information Expert, Creator, Single Responsibility
- [Transações Atômicas](./ESTRUTURA.md) - Consistência de dados
- [Validação em Camadas](./ARQUITETURA.md) - Route, Service, Repository
- [DTOs](./ARQUITETURA.md) - Data Transfer Objects

### Frontend
- [React Hooks](./FRONTEND.md) - useApi, useForm
- [Componentes Reutilizáveis](./ESTRUTURA-FRONTEND.md) - Button, Input, Card, Alert
- [Design System](./ESTRUTURA-FRONTEND.md) - Paleta brand
- [Responsividade](./ESTRUTURA-FRONTEND.md) - Mobile-first com Tailwind
- [Validação Cliente](./FRONTEND.md) - Antes de enviar para API

### Banco de Dados
- [Modelo E-R](./ESTRUTURA.md) - 5 entidades
- [Enums](./ESTRUTURA.md) - Estados e tipos
- [Relacionamentos](./ESTRUTURA.md) - 1:N e constraints
- [Seed](./SETUP.md) - Dados iniciais

---

## 🤔 Dúvidas Frequentes?

**P: Por onde começo?**
R: → [QUICKSTART.md](./QUICKSTART.md)

**P: Como rodo o projeto completo?**
R: → [RODANDO-PROJETO.md](./RODANDO-PROJETO.md)

**P: Como a arquitetura funciona?**
R: → [ARQUITETURA.md](./ARQUITETURA.md)

**P: Como adiciono um novo endpoint?**
R: → [ARQUITETURA.md](./ARQUITETURA.md)

**P: Como uso os componentes?**
R: → [FRONTEND.md](./FRONTEND.md)

**P: Como testo a API?**
R: → [EXEMPLOS-REQUISICOES.md](./EXEMPLOS-REQUISICOES.md)

**P: Qual é a paleta de cores?**
R: → [ESTRUTURA-FRONTEND.md](./ESTRUTURA-FRONTEND.md)

**P: Como faço deploy?**
R: → [SETUP.md](./SETUP.md) (seção final)

---

## 🔗 Links Rápidos

### Local
- http://localhost:3000 - Aplicação
- http://localhost:5555 - Prisma Studio
- http://localhost:3000/api/emprestimos - API

### Ferramentas
- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Prisma Docs](https://www.prisma.io/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs)

### Templates Similares
- Next.js fullstack - [Vercel](https://vercel.com)
- React + TypeScript - [Create React App](https://create-react-app.dev)
- Prisma + PostgreSQL - [Prisma Examples](https://github.com/prisma/examples)

---

## 📝 Versão e Status

- **Versão:** 1.0.0
- **Data:** 1 de junho de 2025
- **Status:** ✅ Funcional e Documentado
- **Próximas:** Autenticação real, Testes, Deploy

---

## 👨‍💻 Stack Tecnológico

```
Frontend Layer
    ↓
React 19 + Next.js 15 + TypeScript
    ↓
Custom Components + Tailwind CSS
    ↓
HTTP Requests (fetch API)
    ↓
Backend API Layer
    ↓
Next.js Route Handlers + TypeScript
    ↓
Services (Business Logic) + Repositories
    ↓
Prisma ORM
    ↓
PostgreSQL Database
```

---

## 📞 Suporte

Para mais informações:
- Ler documentação relevante (ver links acima)
- Verificar exemplos em [EXEMPLOS-REQUISICOES.md](./EXEMPLOS-REQUISICOES.md)
- Consultar código (estrutura bem organizada)
- Abrir issue/discussão no GitHub

---

**Última atualização:** 1 de junho de 2025  
**Autor:** Sistema Noite Estrelada  
**Licença:** Educacional
