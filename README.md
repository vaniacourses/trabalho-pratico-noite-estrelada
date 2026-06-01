# 📚 Noite Estrelada - Sistema de Gerenciamento de Biblioteca

> **Full-Stack Application** com Next.js, React, TypeScript, Prisma e PostgreSQL  
> Arquitetura de Camadas + Padrões GRASP + Design System Premium

---

## 📋 Visão Geral

Backend moderno e profissional para um Sistema de Gerenciamento de Biblioteca (SGBi), construído com:

- **Next.js 15** - Framework web otimizado
- **TypeScript** - Type safety e melhor DX
- **Prisma ORM** - Abstração elegante do banco de dados
- **PostgreSQL 16** - Banco de dados relacional
- **Arquitetura em Camadas** - Separação clara de responsabilidades
- **Padrões GRASP** - Boas práticas de OOP

---

## 🏗️ Arquitetura em Camadas

```
┌─────────────────────────────────────────┐
│  Camada de Apresentação (Route Handler) │  ← src/app/api/
│  Recebe HTTP, valida entrada, retorna   │
└──────────────────┬──────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│  Camada de Negócios (Service)           │  ← src/services/
│  Regras de negócio, orquestração        │
└──────────────────┬──────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│  Camada de Persistência (Repository)    │  ← src/repositories/
│  Acesso ao banco, transações atômicas   │
└──────────────────┬──────────────────────┘
                   ↓
           PostgreSQL (Prisma)
```

**Padrões GRASP aplicados:**
- **Controller** - Route Handler coordena fluxo
- **Information Expert** - Cada camada conhece seu domínio
- **Creator** - Repository cria entidades
- **Single Responsibility** - Uma responsabilidade por classe

---

## 🚀 Quick Start (5 minutos)

### 1️⃣ Instalar Dependências
```bash
npm install
```

### 2️⃣ Configurar Ambiente
```bash
cp .env.example .env.local
```

### 3️⃣ Iniciar PostgreSQL
```bash
docker-compose up -d 
ou
make up
```

### 4️⃣ Setup Banco de Dados
```bash
npx prisma db push
npx prisma generate
```

### 5️⃣ Seed com Dados (Opcional)
```bash
npm run db:seed
```

### 6️⃣ Iniciar Servidor
```bash
npm run dev
```

Servidor disponível em: **http://localhost:3000**

---

## 📁 Estrutura do Projeto

```
src/
├── app/api/emprestimos/route.ts           # Controller (POST, GET)
├── services/emprestimoService.ts          # Lógica de negócios
├── repositories/emprestimoRepository.ts   # Acesso ao banco
├── types/index.ts                         # DTOs e tipos
└── lib/prisma.ts                          # Cliente Prisma

prisma/
├── schema.prisma                          # Modelagem de dados
└── seed.ts                                # Dados iniciais

docker-compose.yml                         # PostgreSQL + Docker
```

---

## 🎯 Exemplo: Caso de Uso - Realizar Empréstimo

### Request
```json
POST /api/emprestimos
Content-Type: application/json

{
  "idLeitor": "abc123",
  "idExemplar": "def456",
  "diasEmprestimo": 14
}
```

### Processamento
1. **Route Handler** - Valida JSON e campos obrigatórios
2. **Service** - Valida regras de negócio:
   - Exemplar disponível? ✓
   - Leitor em estado correto? ✓
   - Limite de empréstimos não atingido? ✓
   - Calcula data de expiração (hoje + 14 dias)
3. **Repository** - Executa em transação:
   - Cria registro em `emprestimos`
   - Atualiza `exemplares.estado = EMPRESTADO`
4. **Response** - Retorna empréstimo criado

### Response
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

---

## 📊 Modelo de Dados

### Entidades

**Leitor**
- Estado: `INCOMPLETO | REGULAR | EM_PUNICAO | BANIDO`
- Pode fazer empréstimos se: `REGULAR` ou `INCOMPLETO`

**Exemplar**
- Estado: `DISPONIVEL | EMPRESTADO | AFASTADO | RESERVADO`
- Pode ser emprestado se: `DISPONIVEL`

**Empréstimo**
- Estado: `CORRENTE | ATRASADO | FINALIZADO`
- Criado em: `CORRENTE`
- Mudança para `ATRASADO`: quando passa data de expiração (job agendado)

**Reserva**
- Estado: `EM_ESPERA | BLOQUEANTE | FINALIZADA`

### Relacionamentos
```
Leitor 1:N Empréstimo
Leitor 1:N Reserva
Exemplar 1:N Empréstimo
Publicação 1:N Exemplar
Publicação 1:N Reserva
```

---

## 🔒 Transações Atômicas

Garante que operações relacionadas sempre ocorrem juntas:

```typescript
// Criar empréstimo + atualizar exemplar (ATOMICIDADE)
await prisma.$transaction(async (tx) => {
  // Ambas operações ocorrem juntas
  const emprestimo = await tx.emprestimo.create({...});
  await tx.exemplar.update({...});
  // Se erro em qualquer uma → ROLLBACK automático
  return emprestimo;
});
```

---

## 🎨 Stack Tecnológico

### 🔙 Backend
- **Next.js 15** - API Routes + Route Handlers
- **TypeScript** - Type-safety completo
- **Prisma 5** - ORM para PostgreSQL
- **PostgreSQL 16** - Banco relacional (Docker)

### 🎭 Frontend  
- **React 19** - UI library
- **Next.js 15 App Router** - Páginas e layouts
- **TypeScript** - Type-safety
- **Tailwind CSS 3.4** - Utility-first styling
- **Componentes Reutilizáveis** - Design System

### 🏛️ Arquitetura
- **3 Camadas** - Apresentação, Negócios, Persistência
- **GRASP Patterns** - Controller, Information Expert, Creator, Single Responsibility
- **Transações Atômicas** - Consistência de dados

---

## 📚 Documentação Completa

| Documento | Descrição |
|-----------|-----------|
| [QUICKSTART.md](./docs/QUICKSTART.md) | ⚡ Setup em 5 minutos |
| [SETUP.md](./docs/SETUP.md) | 🔧 Setup detalhado com troubleshooting |
| [ARQUITETURA.md](./docs/ARQUITETURA.md) | 🏗️ Padrão de camadas + GRASP + fluxo |
| [ESTRUTURA.md](./docs/ESTRUTURA.md) | 📁 Visão geral do backend |
| [FRONTEND.md](./docs/FRONTEND.md) | 🎭 Documentação completa do frontend |
| [ESTRUTURA-FRONTEND.md](./docs/ESTRUTURA-FRONTEND.md) | 📊 Componentes e estrutura de pastas |
| [RODANDO-PROJETO.md](./docs/RODANDO-PROJETO.md) | 🚀 Como rodar backend + frontend |
| [EXEMPLOS-REQUISICOES.md](./docs/EXEMPLOS-REQUISICOES.md) | 📝 Exemplos com cURL, Postman, JS |

---

## 🌐 Acessar o Sistema

Após iniciar com `npm run dev`, acesse:

| URL | Descrição |
|-----|-----------|
| http://localhost:3000 | 🏠 Home - Landing page |
| http://localhost:3000/login | 🔐 Login - Autenticação |
| http://localhost:3000/balcao | 💼 Balcão - Realizar empréstimos |
| http://localhost:5555 | 📊 Prisma Studio - Visualizar dados |
| http://localhost:3000/api/emprestimos | 📡 API - Endpoint (POST/GET) |

---

## 🧪 Testar API

### Via cURL
```bash
curl -X POST http://localhost:3000/api/emprestimos \
  -H "Content-Type: application/json" \
  -d '{
    "idLeitor": "abc123",
    "idExemplar": "def456"
  }'
```

### Via Postman/Insomnia
1. POST `http://localhost:3000/api/emprestimos`
2. Body (JSON): `{ "idLeitor": "abc123", "idExemplar": "def456" }`
3. Send

### Via Prisma Studio
```bash
npx prisma studio
# Abrirá interface em http://localhost:5555
```

---

## 🎯 Funcionalidades do Frontend

### 🏠 Home (`/`)
- Landing page com informações do sistema
- Links de navegação para login e balcão

### 🔐 Login (`/login`)
- Formulário com email e senha
- Validação local com feedback visual
- Simulação de autenticação
- Estados: idle, loading, success, error

### 💼 Balcão (`/balcao`)
- Interface para realizar empréstimos
- Formulário com ID Leitor + ID Exemplar
- Integração com API `/api/emprestimos`
- Validação local antes de enviar
- Exibição de resultado (sucesso/erro)
- Histórico de empréstimos simulado

### 🧩 Componentes Reutilizáveis
- **Button** - Múltiplas variantes (primary, secondary, outline)
- **Input** - Com validação, placeholder, helperText
- **Card** - Layouts flexíveis com subcomponentes
- **Alert** - 4 tipos (success, error, warning, info)
- **LoadingSpinner** - Indicador de carregamento

### 🔗 Hooks Customizados
- **useApi** - Requisições HTTP com estado
- **useForm** - Gerenciamento de formulário com validação

### 🎨 Design System
- Paleta de cores **Premium Consultancy**
- Tipografia profissional
- Espaçamento consistente
- Componentes responsivos
- Animações suaves

---

## 🛠️ Comandos Úteis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor dev
npm run build            # Build para produção
npm run lint             # Lint com ESLint

# Banco de Dados
npm run db:push          # Sincroniza schema com banco
npm run db:generate      # Gera cliente Prisma
npm run db:seed          # Popula banco com dados iniciais

# Docker
docker-compose up -d     # Inicia PostgreSQL
docker-compose down      # Para PostgreSQL
docker-compose logs      # Ver logs
```

---

## 🔧 Configuração

### `.env.local`
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/biblioteca_db"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

### `docker-compose.yml`
- Porta PostgreSQL: **5432**
- Usuário: **postgres**
- Senha: **postgres**
- Banco: **biblioteca_db**

---

## 📈 Escalabilidade

A arquitetura em camadas permite:

✅ Adicionar novos endpoints (copiar estrutura)  
✅ Mudar tecnologia do banco (alterar apenas repository)  
✅ Reutilizar serviços (compartilhar entre endpoints)  
✅ Testar isoladamente (mock + service)  
✅ Adicionar autenticação (validar em route handler)  
✅ Adicionar cache (adicionar em service)  

---

## 🚨 Regras de Negócio Validadas

✅ **Exemplar disponível?** - Deve estar com estado `DISPONIVEL`  
✅ **Leitor válido?** - Não pode estar `BANIDO` ou `EM_PUNICAO`  
✅ **Limite de empréstimos?** - Máximo 5 simultâneos  
✅ **Atomicidade?** - Transação garante consistência  
✅ **Data de expiração?** - Hoje + dias de empréstimo  

---

## 🐛 Troubleshooting

| Problema | Solução |
|----------|---------|
| "Cannot find module @/..." | `npm install` |
| "Connection refused PostgreSQL" | `docker-compose up -d` |
| "Port 3000 in use" | `npm run dev -- -p 3001` |
| "P1000 Authentication failed" | Verificar `DATABASE_URL` |
| "Unique constraint violation" | `npx prisma migrate reset` |

---

## 📞 Suporte

Para questões sobre:
- **Arquitetura** → Ver [ARQUITETURA.md](./docs/ARQUITETURA.md)
- **Setup** → Ver [SETUP.md](./docs/SETUP.md)
- **API** → Ver [EXEMPLOS-REQUISICOES.md](./docs/EXEMPLOS-REQUISICOES.md)
- **Estrutura** → Ver [ESTRUTURA.md](./docs/ESTRUTURA.md)

---

## 📝 Licença

Projeto educacional - Sistema de Gerenciamento de Biblioteca

---

## 👨‍💻 Desenvolvido com

- **Next.js** - Framework web
- **TypeScript** - Type safety
- **Prisma** - ORM moderno
- **PostgreSQL** - Banco relacional
- **Docker** - Containerização

---

**Última atualização:** 1 de junho de 2025  
**Versão:** 1.0.0
