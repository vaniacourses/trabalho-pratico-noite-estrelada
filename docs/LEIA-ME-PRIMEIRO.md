# LEIA-ME PRIMEIRO 👋

Bem-vindo ao **Noite Estrelada Backend**! Este documento orienta você sobre como começar.

---

## 🎯 O que foi criado?

Uma **arquitetura profissional de 3 camadas** para o backend de um Sistema de Gerenciamento de Biblioteca com:

✅ **Next.js 15** + **TypeScript** + **Prisma ORM** + **PostgreSQL**  
✅ Padrão **Controller/Service/Repository**  
✅ Padrões **GRASP** aplicados corretamente  
✅ **Transações atômicas** para consistência  
✅ Validação de regras de negócio  
✅ Exemplo prático: **Caso de Uso de Empréstimo**  

---

## 📚 Guia de Leitura (por ordem)

### 1️⃣ COMECE AQUI (5 minutos)
**Arquivo:** [`QUICKSTART.md`](./QUICKSTART.md)

Roteiro rápido para colocar o projeto funcionando:
- Instalar dependências
- Configurar variáveis de ambiente
- Iniciar PostgreSQL
- Fazer primeira requisição

```bash
# Ou execute o script:
bash init.sh
```

### 2️⃣ Entender a Arquitetura (15 minutos)
**Arquivo:** [`ARQUITETURA.md`](./ARQUITETURA.md)

Explicação detalhada de:
- O que é arquitetura em camadas
- Padrões GRASP utilizados
- Fluxo completo de uma requisição
- Por que transações atômicas importam

### 3️⃣ Ver o Projeto (10 minutos)
**Arquivo:** [`ESTRUTURA.md`](./ESTRUTURA.md)

Visual completo do projeto:
- Estrutura de pastas
- Relacionamento entre arquivos
- Fluxo de dados
- Tecnologias por camada

### 4️⃣ Setup Completo (20 minutos)
**Arquivo:** [`SETUP.md`](./SETUP.md)

Instruções detalhadas com:
- Passo a passo completo
- Explicação de cada comando
- Troubleshooting
- Próximas etapas

### 5️⃣ Testar a API (10 minutos)
**Arquivo:** [`EXEMPLOS-REQUISICOES.md`](./EXEMPLOS-REQUISICOES.md)

Exemplos prontos em:
- cURL
- Postman
- JavaScript/TypeScript
- Python
- Bash

### 6️⃣ Ver o Código (15 minutos)
**Arquivos principais:**
- [`src/app/api/emprestimos/route.ts`](./src/app/api/emprestimos/route.ts) - Controller
- [`src/services/emprestimoService.ts`](./src/services/emprestimoService.ts) - Serviço
- [`src/repositories/emprestimoRepository.ts`](./src/repositories/emprestimoRepository.ts) - Repository
- [`prisma/schema.prisma`](./prisma/schema.prisma) - Modelagem de dados

---

## ⚡ Quick Start (3 comandos)

```bash
# 1. Setup automático
bash init.sh

# 2. Iniciar servidor
npm run dev

# 3. Em outro terminal, abrir interface de dados
npx prisma studio
```

Servidor em: http://localhost:3000  
Prisma Studio em: http://localhost:5555

---

## 📋 Arquivos Principais

```
📁 Projeto/
│
├── 📄 README.md                     ← Visão geral do projeto
├── 📄 QUICKSTART.md                 ← Setup em 5 minutos
├── 📄 SETUP.md                      ← Setup completo
├── 📄 ARQUITETURA.md                ← Padrão de camadas
├── 📄 ESTRUTURA.md                  ← Estrutura visual
├── 📄 EXEMPLOS-REQUISICOES.md       ← Exemplos de API
├── 📄 LEIA-ME-PRIMEIRO.md           ← Este arquivo
│
├── 🔧 Configuração
│   ├── package.json                 # Dependências npm
│   ├── tsconfig.json                # Configuração TypeScript
│   ├── next.config.ts               # Configuração Next.js
│   ├── eslint.config.mjs            # Linting
│   ├── .env.example                 # Variáveis de ambiente
│   ├── docker-compose.yml           # PostgreSQL + Docker
│   └── init.sh                      # Script de setup
│
├── 📁 src/
│   ├── 🚀 app/api/emprestimos/route.ts        # Route Handler (Controller)
│   ├── ⚙️ services/emprestimoService.ts       # Service (Business Logic)
│   ├── 💾 repositories/emprestimoRepository.ts # Repository (DAO)
│   ├── 📦 types/index.ts                      # DTOs e Tipos
│   ├── 🔧 lib/prisma.ts                       # Cliente Prisma
│   └── 🧪 __tests__/emprestimo.test.ts        # Testes
│
├── 🗄️ prisma/
│   ├── schema.prisma                # Modelagem de dados
│   └── seed.ts                      # Script de seed
│
└── 📚 Documentação
    └── Todos os .md files acima
```

---

## 🏗️ Arquitetura em Diagrama

```
┌───────────────────────────────┐
│     HTTP Request (Browser)    │
└───────────────┬───────────────┘
                ↓
┌─────────────────────────────────────────┐
│  CAMADA DE APRESENTAÇÃO (Controller)    │
│  ├─ Recebe HTTP                         │
│  ├─ Valida entrada                      │
│  └─ Formata resposta                    │
│  📄 route.ts                            │
└────────────────┬────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│  CAMADA DE NEGÓCIOS (Service)           │
│  ├─ Valida regras de negócio            │
│  ├─ Orquestra lógica                    │
│  └─ Calcula derivados                   │
│  📄 emprestimoService.ts                │
└────────────────┬────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│  CAMADA DE PERSISTÊNCIA (Repository)    │
│  ├─ Consulta banco de dados             │
│  ├─ Executa transações                  │
│  └─ Abstrai banco de dados              │
│  📄 emprestimoRepository.ts             │
└────────────────┬────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│  BANCO DE DADOS (PostgreSQL)            │
│  📦 Prisma ORM + Docker                 │
└─────────────────────────────────────────┘
```

---

## 🎯 Exemplo: Realizar Empréstimo

### O que acontece quando você faz um POST `/api/emprestimos`:

1. **Route Handler** (Controller)
   - Recebe JSON
   - Valida campos obrigatórios
   - Chama serviço

2. **Service** (Lógica de Negócios)
   - Verifica se exemplar está disponível
   - Verifica se leitor é válido
   - Verifica limite de empréstimos
   - Calcula data de expiração

3. **Repository** (Persistência)
   - Executa transação atômica:
     - INSERT empréstimo
     - UPDATE exemplar.estado = EMPRESTADO
   - Ou rollback se erro

4. **Resposta**
   - Route Handler formata resposta
   - Retorna HTTP 201 Created

---

## 🚀 Primeiros Passos

### Opção 1: Automático (Recomendado)
```bash
bash init.sh
```

### Opção 2: Manual
```bash
# 1. Instalar dependências
npm install

# 2. Copiar variáveis
cp .env.example .env.local

# 3. Iniciar PostgreSQL
docker-compose up -d

# 4. Sincronizar banco
npx prisma db push

# 5. (Opcional) Popular com dados
npm run db:seed

# 6. Iniciar servidor
npm run dev
```

---

## 🧪 Testar Imediatamente

Em outro terminal, após iniciar o servidor:

```bash
# Abrir interface de dados
npx prisma studio

# Ou fazer uma requisição (depois de adicionar dados)
curl -X POST http://localhost:3000/api/emprestimos \
  -H "Content-Type: application/json" \
  -d '{
    "idLeitor": "seu-id-aqui",
    "idExemplar": "seu-id-aqui"
  }'
```

---

## 📊 Modelo de Dados

### Entidades Principais

| Entidade | Estados |
|----------|---------|
| **Leitor** | INCOMPLETO, REGULAR, EM_PUNICAO, BANIDO |
| **Exemplar** | DISPONIVEL, EMPRESTADO, AFASTADO, RESERVADO |
| **Empréstimo** | CORRENTE, ATRASADO, FINALIZADO |
| **Reserva** | EM_ESPERA, BLOQUEANTE, FINALIZADA |

---

## 📚 Documentação Recomendada

| Quer entender... | Leia... |
|-----------------|---------|
| Como começar | [`QUICKSTART.md`](./QUICKSTART.md) |
| Camadas e GRASP | [`ARQUITETURA.md`](./ARQUITETURA.md) |
| Estrutura visual | [`ESTRUTURA.md`](./ESTRUTURA.md) |
| Setup completo | [`SETUP.md`](./SETUP.md) |
| Como testar API | [`EXEMPLOS-REQUISICOES.md`](./EXEMPLOS-REQUISICOES.md) |
| Visão geral | [`README.md`](./README.md) |

---

## 💡 Principais Conceitos

### 🏗️ Arquitetura em Camadas
Separação clara de responsabilidades em 3 níveis:
- Apresentação (HTTP)
- Negócios (Regras)
- Persistência (Banco)

### 🔒 Transações Atômicas
Garante consistência: múltiplas operações ocorrem juntas ou nenhuma.

### 📦 DTOs (Data Transfer Objects)
Objetos para transferir dados entre camadas sem expor entidades.

### 🎯 GRASP (General Responsibility Assignment Software Patterns)
Padrões para atribuir responsabilidades às classes:
- **Controller** - Coordena fluxo
- **Information Expert** - Sabe resolver seu domínio
- **Creator** - Cria entidades

---

## 🔧 Próximas Etapas (Após Setup)

1. **Criar leitores, publicações e exemplares** via Prisma Studio
2. **Testar endpoint** com IDs reais
3. **Implementar novos endpoints** copiando a estrutura
4. **Adicionar autenticação** JWT
5. **Adicionar testes unitários** com Jest
6. **Adicionar validação** com Zod

---

## 🆘 Problemas?

| Problema | Solução |
|----------|---------|
| Não consegue iniciar | Verificar [`SETUP.md`](./SETUP.md#-troubleshooting) |
| Dúvidas sobre arquitetura | Ler [`ARQUITETURA.md`](./ARQUITETURA.md) |
| Erros ao testar API | Ver [`EXEMPLOS-REQUISICOES.md`](./EXEMPLOS-REQUISICOES.md) |
| PostgreSQL não conecta | `docker-compose down` + `docker-compose up -d` |

---

## 📞 Checklist de Setup

- [ ] Node.js instalado (`node -v`)
- [ ] Docker instalado (`docker -v`)
- [ ] npm instalado (`npm -v`)
- [ ] Dependências instaladas (`npm install`)
- [ ] .env.local criado (`cp .env.example .env.local`)
- [ ] PostgreSQL rodando (`docker-compose up -d`)
- [ ] Schema sincronizado (`npx prisma db push`)
- [ ] Servidor iniciado (`npm run dev`)
- [ ] Prisma Studio funcionando (`npx prisma studio`)
- [ ] API respondendo (curl ou Postman)

---

## ✅ Pronto!

Você agora tem um **backend profissional** com:

✅ Arquitetura em camadas  
✅ Padrões GRASP aplicados  
✅ Exemplo prático funcionando  
✅ Transações atômicas  
✅ Validação de regras de negócio  
✅ TypeScript type-safe  
✅ Documentação completa  

**Próximo passo:** Ler [`QUICKSTART.md`](./QUICKSTART.md) ou executar `bash init.sh`

---

**Última atualização:** 1 de junho de 2025  
**Versão:** 1.0.0  
**Status:** ✅ Pronto para uso
