# ESTRUTURA FRONTEND - Noite Estrelada

## 📊 Visualização da Estrutura

```
📱 FRONTEND (React + Next.js 15 + TypeScript)
│
├── 🌐 PÁGINAS (src/app/)
│   ├── layout.tsx                  Root layout
│   ├── globals.css                 Estilos globais (Tailwind)
│   ├── page.tsx                    / (Home)
│   │
│   ├── 🔐 login/page.tsx          Autenticação
│   │   ├─ Form: Email + Senha
│   │   ├─ Validação local
│   │   ├─ POST /api/auth/login (simulado)
│   │   └─ Estados: idle, loading, success, error
│   │
│   └── 💼 balcao/page.tsx         Atendimento
│       ├─ Form: ID Leitor + ID Exemplar
│       ├─ Validação local
│       ├─ POST /api/emprestimos
│       ├─ Exibe resultado da API
│       └─ Tabela simulada de histórico
│
├── 🧩 COMPONENTES (src/components/)
│   │
│   ├── 🎨 ui/                      UI Components reutilizáveis
│   │   ├─ Button.tsx               ✓ Variantes: primary, secondary, outline
│   │   │                           ✓ Tamanhos: sm, md, lg
│   │   │                           ✓ Loading state com spinner
│   │   ├─ Input.tsx                ✓ Label, placeholder, error
│   │   │                           ✓ Helper text
│   │   │                           ✓ Disabled state
│   │   ├─ Card.tsx                 ✓ Card + CardHeader + CardTitle
│   │   │                           ✓ CardContent + CardFooter
│   │   │                           ✓ Variantes: default, secondary
│   │   ├─ Alert.tsx                ✓ Tipos: success, error, warning, info
│   │   │                           ✓ Icon, title, message
│   │   │                           ✓ Ícone fechar
│   │   └─ LoadingSpinner.tsx       ✓ Tamanhos: sm, md, lg
│   │                               ✓ Message customizável
│   │
│   ├── 📝 forms/                   Form Components
│   │   └─ (expandível para mais formulários)
│   │
│   └── 🏗️ layout/                  Layout Components
│       └─ Layout.tsx               ✓ PublicLayout (login)
│                                   ✓ AuthenticatedLayout (dashboard)
│
├── 🔗 HOOKS (src/hooks/)
│   ├─ useApi.ts                    ✓ Requisições HTTP com estado
│   │                               ✓ Methods: GET, POST, PUT, DELETE
│   │                               ✓ Error handling
│   │                               ✓ Loading state
│   └─ useForm.ts                   ✓ Gerenciamento de formulário
│                                   ✓ Validação integrada
│                                   ✓ Touch tracking
│                                   ✓ Reset functionality
│
├── 🛠️ UTILS (src/utils/)
│   ├─ helpers.ts                   ✓ Formatação (data, moeda)
│   │                               ✓ Utilities (truncate, slugify, delay)
│   │                               ✓ Clipboard copy
│   │                               ✓ Query params
│   └─ validators.ts                ✓ Required, email, minLength, maxLength
│                                   ✓ UUID/CUID, phone, strongPassword
│                                   ✓ Composable validators
│
├── 🎨 ESTILO (Tailwind)
│   ├─ tailwind.config.ts           ✓ Tema brand customizado
│   │                               ✓ Cores: bg, primary, secondary, text
│   │                               ✓ Shadows customizadas
│   │                               ✓ Border radius
│   ├─ postcss.config.mjs           ✓ PostCSS com Tailwind + Autoprefixer
│   └─ src/app/globals.css          ✓ Base styles
│                                   ✓ Component styles (@layer)
│                                   ✓ Utilities (@layer)
│                                   ✓ Animations
│
└── 📦 CONFIG
    ├─ package.json                 ✓ Next.js, React, Tailwind
    ├─ tsconfig.json                ✓ TypeScript strict mode
    ├─ next.config.ts               ✓ Next.js configurações
    └─ .env.example                 ✓ Variáveis de ambiente
```

---

## 🎨 PALETA DE CORES

```
┌─────────────────────────────────────────────────┐
│         BRAND COLOR PALETTE (Premium)           │
├─────────────────────────────────────────────────┤
│                                                 │
│  🟫 BACKGROUND (Bege/Creme)                    │
│    #F4EFEA / #EAE0D5                           │
│    └─ Fundo principal da aplicação             │
│                                                 │
│  🟤 PRIMARY (Caramelo/Terracota) - BOTÕES      │
│    #AF764F (normal)                            │
│    #9C5B32 (hover/dark)                        │
│    └─ Ação primária e destaque                 │
│                                                 │
│  🟫 SECONDARY (Marrom) - CARDS/PAINEL         │
│    #7A4222                                     │
│    └─ Painéis e cards secundários             │
│                                                 │
│  🟤 TEXT (Chocolate/Marrom Escuro)             │
│    #4A2511 (dark)                              │
│    #F9F6F3 (light)                             │
│    └─ Tipografia                               │
│                                                 │
│  ⭐ ACCENT (Dourado Suave)                     │
│    #C9A961                                     │
│    └─ Destaques especiais                      │
│                                                 │
│  ❌ ERROR (Coral/Vermelho)                     │
│    #D97757                                     │
│    └─ Mensagens de erro                        │
│                                                 │
│  ✅ SUCCESS (Verde Oliva)                      │
│    #6B8E23                                     │
│    └─ Mensagens de sucesso                     │
│                                                 │
│  ⚠️ WARNING (Dourado)                          │
│    #DAA520                                     │
│    └─ Aviso e alertas                          │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 🔄 FLUXO DE DADOS

### Login Flow
```
User Input
    ↓
useForm hook
    ↓
Validação local (validators)
    ↓
Se válido:
    ├─ useApi hook
    ├─ POST /api/auth/login
    └─ Resposta: {sucesso, dados/erro}
    ↓
UI: Alert (success/error)
    ↓
Se sucesso → Redirect /balcao
```

### Empréstimo Flow
```
User Input (ID Leitor + ID Exemplar)
    ↓
useForm hook
    ↓
Validação local
    ↓
Se válido:
    ├─ useApi hook
    ├─ POST /api/emprestimos
    │   {idLeitor, idExemplar, diasEmprestimo}
    └─ Resposta: {sucesso, dados/erro}
    ↓
Renderizar resultado:
    ├─ Success: Card com detalhes do empréstimo
    ├─ Error: Alert com mensagem
    └─ Loading: Spinner
    ↓
Atualizar histórico (tabela simulada)
```

---

## 🚀 COMPONENTES EM USO

### Página de Login
```
PublicLayout
  ├─ Card
  │   ├─ CardContent
  │   │   └─ Form (useForm hook)
  │   │       ├─ Input (email)
  │   │       ├─ Input (senha)
  │   │       ├─ Alert (success/error)
  │   │       └─ Button (primary, loading)
  │   └─ CardFooter
  │       └─ Helper text
  │
  └─ Info cards
      ├─ Card (brand-secondary)
      │   └─ Tipos de usuários
      └─ Card (brand-secondary)
          └─ Info de segurança
```

### Página de Balcão
```
AuthenticatedLayout
  ├─ Header
  │   ├─ Logo/Título
  │   └─ Botão Sair
  │
  ├─ Conteúdo (Grid 3 colunas)
  │   │
  │   ├─ Col 1-2 (Formulário + Info)
  │   │   ├─ Card
  │   │   │   ├─ CardHeader
  │   │   │   ├─ CardContent
  │   │   │   │   └─ Form
  │   │   │   │       ├─ Input (ID Leitor)
  │   │   │   │       ├─ Input (ID Exemplar)
  │   │   │   │       ├─ Alert (success/error)
  │   │   │   │       └─ Button
  │   │   │   └─ CardFooter
  │   │   │
  │   │   └─ Card (Info)
  │   │       └─ Instruções passo a passo
  │   │
  │   └─ Col 3 (Resultados)
  │       ├─ Card (success state)
  │       │   └─ Detalhes do empréstimo
  │       ├─ Card (default state)
  │       │   └─ Placeholder
  │       └─ Card (Validações)
  │           └─ Checklist
  │
  └─ Histórico
      └─ Card
          └─ Tabela de empréstimos
```

---

## 📊 ESTADOS DOS COMPONENTES

### Button
```
States:
  - Default: bg-brand-primary
  - Hover: bg-brand-primary-dark
  - Loading: spinner + disabled
  - Disabled: opacity-50 + cursor-not-allowed
  
Variantes:
  - primary: bg-brand-primary
  - secondary: bg-brand-secondary
  - outline: border + text-brand-primary
  
Tamanhos:
  - sm: py-2 px-4 text-sm
  - md: py-3 px-6 text-base (padrão)
  - lg: py-4 px-8 text-lg
```

### Input
```
States:
  - Default: border-gray-300
  - Focus: ring-2 ring-brand-primary
  - Error: border-brand-error
  - Disabled: opacity-50 + cursor-not-allowed
  
Elementos:
  - label: text-sm font-semibold
  - input: w-full px-4 py-3
  - error: text-brand-error font-medium
  - helperText: text-gray-500
```

### Alert
```
Variantes e cores:
  - success: bg-brand-success/10, border-brand-success
  - error: bg-brand-error/10, border-brand-error
  - warning: bg-brand-warning/10, border-brand-warning
  - info: bg-brand-primary/10, border-brand-primary
  
Elementos:
  - icon: ✓, ✕, ⚠, ℹ
  - title: font-semibold
  - message: text-sm
  - close: hover:opacity-70
```

---

## 🔌 API ENDPOINTS ESPERADOS

```
POST /api/auth/login
├─ Body: { email, password }
└─ Response: { sucesso, dados: {token, usuario}, erro }

POST /api/emprestimos
├─ Body: { idLeitor, idExemplar, diasEmprestimo }
└─ Response: { sucesso, dados: {id, ...}, erro: {codigo, mensagem} }

GET /api/emprestimos?id=...
└─ Response: { sucesso, dados: {id, ...} }
```

---

## ✅ CHECKLIST DE COMPONENTES

Componentes implementados:
- ✅ Button (primary, secondary, outline)
- ✅ Input (com validação)
- ✅ Card (com subcomponentes)
- ✅ Alert (4 variantes)
- ✅ LoadingSpinner
- ✅ PublicLayout
- ✅ AuthenticatedLayout

Hooks implementados:
- ✅ useApi (GET, POST, PUT, DELETE)
- ✅ useForm (com validação)

Validadores implementados:
- ✅ required
- ✅ email
- ✅ minLength, maxLength
- ✅ uuid
- ✅ phoneNumber
- ✅ strongPassword

Páginas implementadas:
- ✅ Home (/)
- ✅ Login (/login)
- ✅ Balcão (/balcao)

---

## 🎯 PRÓXIMAS MELHORIAS

1. **Autenticação Real**
   - JWT tokens
   - Refresh tokens
   - Session persistence

2. **Novos Componentes**
   - Modal/Dialog
   - Tabs
   - Breadcrumbs
   - Sidebar nav

3. **Novas Páginas**
   - Dashboard (home autenticada)
   - Perfil de usuário
   - Histórico de empréstimos
   - Gerenciamento de publicações
   - Gerenciamento de exemplares

4. **Testes**
   - Jest unit tests
   - React Testing Library
   - Playwright E2E tests

5. **Performance**
   - Image optimization
   - Code splitting
   - Caching strategy

---

**Data:** 1 de junho de 2025  
**Versão:** 1.0.0  
**Status:** ✅ Inicial completo
