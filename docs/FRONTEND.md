# FRONTEND - Noite Estrelada

> Camada de Apresentação do Sistema de Gerenciamento de Biblioteca

---

## 📋 Visão Geral

Frontend moderno e responsivo com:

- **Next.js 15** - App Router
- **React 19** - UI com Hooks
- **TypeScript** - Type-safety completo
- **Tailwind CSS** - Styling com tema brand premium
- **Componentes Reutilizáveis** - UI bem estruturada
- **Custom Hooks** - useApi, useForm
- **Identidade Visual Premium** - Paleta brand definida

---

## 🎨 Paleta de Cores Premium

Configurada em `tailwind.config.ts`:

```
brand-bg:      #F4EFEA  (Fundo: Bege/Creme)
brand-primary: #AF764F  (Botões: Caramelo)
brand-secondary: #7A4222 (Cards: Marrom)
brand-text:    #4A2511  (Texto: Chocolate)
brand-accent:  #C9A961  (Destaque: Dourado)
brand-error:   #D97757  (Erro: Coral)
brand-success: #6B8E23  (Sucesso: Oliva)
```

---

## 📁 Estrutura de Pastas

```
src/
├── 🎨 app/
│   ├── layout.tsx              # Layout raiz
│   ├── page.tsx                # Home
│   ├── globals.css             # Estilos globais
│   ├── login/
│   │   └── page.tsx            # Página de Login
│   └── balcao/
│       └── page.tsx            # Página de Balcão (Empréstimos)
│
├── 🧩 components/
│   ├── ui/                     # Componentes base reutilizáveis
│   │   ├── Button.tsx          # Botão com variantes
│   │   ├── Input.tsx           # Input com validação
│   │   ├── Card.tsx            # Card e subcomponentes
│   │   ├── Alert.tsx           # Alerta (success/error/warning/info)
│   │   └── LoadingSpinner.tsx  # Spinner de carregamento
│   ├── forms/                  # Componentes de formulário
│   └── layout/
│       └── Layout.tsx          # Layouts (Public e Authenticated)
│
├── 🔗 hooks/
│   ├── useApi.ts               # Hook para requisições HTTP
│   └── useForm.ts              # Hook para gerenciar formulários
│
├── 🛠️ utils/
│   ├── helpers.ts              # Funções auxiliares
│   └── validators.ts           # Validadores de formulário
│
└── tailwind.config.ts          # Tema Tailwind com cores brand
```

---

## 🚀 Como Usar

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Variáveis de Ambiente
```bash
cp .env.example .env.local
# Editar .env.local se necessário (NEXT_PUBLIC_API_URL)
```

### 3. Iniciar Servidor
```bash
npm run dev
```

Acesso em: http://localhost:3000

---

## 📄 Páginas Principais

### 🏠 Home (`/`)
- Landing page inicial
- Links para Login e Balcão
- Informações sobre o sistema

### 🔐 Login (`/login`)
- Formulário de autenticação
- Validação de email e senha
- Simulação de requisição à API
- Estados: carregamento, sucesso, erro

### 💼 Balcão (`/balcao`)
- Interface do atendente
- Formulário para realizar empréstimos
- ID do Leitor + ID do Exemplar
- Requisição POST à API `/api/emprestimos`
- Exibição de resultado (sucesso/erro)
- Tabela de últimos empréstimos (simulada)

---

## 🧩 Componentes UI

### Button
```tsx
<Button 
  variant="primary"  // primary | secondary | outline
  size="lg"          // sm | md | lg
  loading={false}
  onClick={() => {}}
>
  Clique aqui
</Button>
```

### Input
```tsx
<Input
  label="Email"
  name="email"
  type="email"
  placeholder="Digite seu email"
  value={formData.email}
  onChange={handleChange}
  error={errors.email}
  helperText="Email válido é obrigatório"
/>
```

### Card
```tsx
<Card variant="default">
  <CardHeader>
    <CardTitle>Título do Card</CardTitle>
  </CardHeader>
  <CardContent>
    Conteúdo aqui
  </CardContent>
  <CardFooter>
    Rodapé aqui
  </CardFooter>
</Card>
```

### Alert
```tsx
<Alert
  variant="success"  // success | error | warning | info
  title="Sucesso"
  message="Operação realizada com sucesso!"
  onClose={() => setAlert(null)}
/>
```

---

## 🔗 Hooks Customizados

### useApi
Hook para fazer requisições HTTP com gerenciamento automático de estado:

```tsx
const { data, loading, error, execute } = useApi("/api/emprestimos");

// Fazer requisição
await execute({ idLeitor: "...", idExemplar: "..." });

// Acessar resultado
if (loading) return <LoadingSpinner />;
if (error) return <Alert variant="error" message={error} />;
if (data) return <div>{JSON.stringify(data)}</div>;
```

### useForm
Hook para gerenciar estado de formulários com validação:

```tsx
const { 
  values, 
  errors, 
  touched, 
  isSubmitting,
  handleChange,
  handleBlur,
  handleSubmit,
  reset
} = useForm(
  { email: "", password: "" },
  async (values) => {
    // Lógica de submissão
  }
);
```

---

## ✅ Validadores

```tsx
import { validators, validateFields } from "@/utils/validators";

// Validar email
validators.email("user@example.com"); // null (válido)
validators.email("invalid"); // "Email inválido"

// Validar múltiplos campos
const errors = validateFields(
  { email: "user@example.com", password: "pass123" },
  {
    email: [validators.required, validators.email],
    password: [validators.required, validators.minLength(6)]
  }
);
```

Validadores disponíveis:
- `required` - Campo obrigatório
- `email` - Validação de email
- `minLength(n)` - Mínimo de caracteres
- `maxLength(n)` - Máximo de caracteres
- `uuid` - Validação de UUID/CUID
- `phoneNumber` - Número de telefone
- `strongPassword` - Senha forte

---

## 🎯 Fluxo: Realizar Empréstimo

```
┌─────────────────────┐
│ Usuário acessa      │
│ /balcao             │
└────────────┬────────┘
             ↓
┌─────────────────────┐
│ Preenche IDs:       │
│ - Leitor            │
│ - Exemplar          │
└────────────┬────────┘
             ↓
┌─────────────────────────────────────┐
│ Clica em Realizar Empréstimo        │
│ handleSubmit → validação local      │
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│ useForm valida com validators       │
│ validateFields() retorna erros      │
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│ Se válido: fetch POST /api/emprestimos
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│ Recebe resposta da API              │
│ Sucesso: exibe dados                │
│ Erro: exibe mensagem                │
└─────────────────────────────────────┘
```

---

## 🔄 Integração com Backend

### URLs da API

```typescript
// Em src/utils/helpers.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Endpoints esperados:
POST /api/emprestimos
POST /api/auth/login (simulado)
GET  /api/emprestimos?id=... (não implementado ainda)
```

### Estrutura de Resposta Esperada

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

### Tratamento de Erro

```json
{
  "sucesso": false,
  "erro": {
    "codigo": "EXEMPLAR_INDISPONIVEL",
    "mensagem": "O exemplar não está disponível para empréstimo"
  }
}
```

---

## 📱 Responsividade

Todos os componentes são responsive:

```
Mobile:  1 coluna
Tablet:  2 colunas
Desktop: 3+ colunas
```

Utiliza Tailwind breakpoints:
- `sm:` 640px
- `md:` 768px
- `lg:` 1024px
- `xl:` 1280px

---

## 🎨 Customização de Cores

### Adicionar cor customizada

1. Editar `tailwind.config.ts`:
```tsx
colors: {
  brand: {
    // ... cores existentes
    "novo-tom": "#ABCDEF",
  }
}
```

2. Usar no componente:
```tsx
<div className="bg-brand-novo-tom">...</div>
```

---

## ⚡ Performance

- **Code Splitting**: Automático com Next.js
- **Image Optimization**: Usar Next.js Image
- **CSS-in-JS**: Tailwind pré-compilado
- **Client Components**: Apenas onde necessário (`"use client"`)
- **Lazy Loading**: Componentes pesados carregam on-demand

---

## 🐛 Debugging

### Modo Desenvolvimento

```bash
npm run dev
# Abrirá em http://localhost:3000
# Logs aparecerão no terminal
```

### React DevTools

Instalar extensão [React DevTools](https://react-devtools-tutorial.vercel.app/)

### Console do Navegador

Abrir DevTools (F12) → Console → Ver logs

---

## 📦 Build para Produção

```bash
npm run build
npm run start
```

---

## 🔐 Segurança

✅ Validação client-side com validators  
✅ Validação server-side (no backend)  
✅ Proteção contra XSS com React  
✅ CSRF tokens (implementar futuramente)  
✅ Sanitização de inputs (usar libraries como `dompurify`)  

---

## 🚨 Troubleshooting

| Problema | Solução |
|----------|---------|
| "Cannot find module @/..." | `npm install` novamente |
| Port 3000 em uso | `npm run dev -- -p 3001` |
| Estilos não carregam | Limpar `.next` e `npm run dev` novamente |
| Componentes não renderizam | Verificar se está `"use client"` |

---

## 📚 Próximas Etapas

1. ✅ Criar mais páginas (dashboard, perfil, etc)
2. ✅ Implementar autenticação real com JWT
3. ✅ Adicionar persistência de sessão
4. ✅ Criar componentes adicionais (modal, sidebar, etc)
5. ✅ Testes unitários com Jest + React Testing Library
6. ✅ E2E tests com Playwright
7. ✅ Deploy (Vercel, AWS, etc)

---

**Data:** 1 de junho de 2025  
**Versão:** 1.0.0  
**Status:** ✅ Funcional
