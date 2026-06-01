# DIAGRAMA VISUAL DO PROJETO

## 📊 Arquitetura Completa

```
╔════════════════════════════════════════════════════════════════════════════════╗
║                         NOITE ESTRELADA - BACKEND                             ║
║                  Sistema de Gerenciamento de Biblioteca                        ║
╚════════════════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────────────┐
│                            CLIENTE HTTP (Browser)                           │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │
                    POST /api/emprestimos {"idLeitor": "...", "idExemplar": "..."}
                                     ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                 CAMADA DE APRESENTAÇÃO (src/app/api/)                       │
├─────────────────────────────────────────────────────────────────────────────┤
│  Route Handler: POST /api/emprestimos/route.ts                              │
│                                                                             │
│  ✓ Parse JSON                                                               │
│  ✓ Valida campos obrigatórios                                               │
│  ✓ Instancia EmprestimoService                                              │
│  ✓ Chama service.realizarEmprestimo()                                       │
│  ✓ Formata resposta HTTP                                                    │
│  ✓ Trata exceções e retorna erros                                           │
│                                                                             │
│  Padrão GRASP: CONTROLLER                                                   │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                    {idLeitor, idExemplar, diasEmprestimo}
                                 ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                 CAMADA DE NEGÓCIOS (src/services/)                          │
├─────────────────────────────────────────────────────────────────────────────┤
│  EmprestimoService: emprestimoService.ts                                    │
│                                                                             │
│  ✓ Instancia EmprestimoRepository                                           │
│                                                                             │
│  Regra 1: Exemplar disponível?                                              │
│    └─ repository.verificarExemplarDisponivel(idExemplar)                    │
│       ↓ SELECT exemplares WHERE id = ? AND estado = 'DISPONIVEL'           │
│       ↓ Retorna: true/false                                                 │
│       └─ Se false → Lança erro "EXEMPLAR_INDISPONIVEL"                     │
│                                                                             │
│  Regra 2: Leitor válido?                                                    │
│    └─ repository.verificarLeitorVálido(idLeitor)                           │
│       ↓ SELECT leitores WHERE id = ? AND estado IN ('REGULAR', 'INCOMPLETO')
│       ↓ Retorna: true/false                                                 │
│       └─ Se false → Lança erro "LEITOR_INVALIDO"                           │
│                                                                             │
│  Regra 3: Limite de empréstimos?                                            │
│    └─ repository.contarEmprestimosAtivos(idLeitor)                         │
│       ↓ SELECT COUNT(*) FROM emprestimos                                    │
│         WHERE idLeitor = ? AND estado IN ('CORRENTE', 'ATRASADO')          │
│       ↓ Se >= 5 → Lança erro "LIMITE_EMPRESTIMOS_ATINGIDO"                 │
│                                                                             │
│  Calcula: dataExpiracao = hoje + diasEmprestimo (padrão: 14)               │
│                                                                             │
│  Chama: repository.criarEmprestimo(idLeitor, idExemplar, dataExp)          │
│                                                                             │
│  Mapeia Emprestimo → IEmprestimoResponse (DTO)                             │
│                                                                             │
│  Padrão GRASP: INFORMATION EXPERT, CONTROLLER                              │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                         {Emprestimo}
                                 ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│           CAMADA DE PERSISTÊNCIA (src/repositories/)                        │
├─────────────────────────────────────────────────────────────────────────────┤
│  EmprestimoRepository: emprestimoRepository.ts                              │
│                                                                             │
│  Método: criarEmprestimo(idLeitor, idExemplar, dataExpiracao)              │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────┐             │
│  │          🔒 TRANSAÇÃO ATÔMICA (Atomicidade)               │             │
│  ├───────────────────────────────────────────────────────────┤             │
│  │                                                           │             │
│  │ BEGIN TRANSACTION                                         │             │
│  │                                                           │             │
│  │ 1. INSERT INTO emprestimos (idLeitor, idExemplar, ...)   │             │
│  │    VALUES (?, ?, ...)                                     │             │
│  │    ↓ Retorna: {id, estado='CORRENTE', ...}               │             │
│  │                                                           │             │
│  │ 2. UPDATE exemplares                                      │             │
│  │    SET estado = 'EMPRESTADO'                              │             │
│  │    WHERE id = ?                                           │             │
│  │                                                           │             │
│  │ COMMIT (ou ROLLBACK se erro)                              │             │
│  │                                                           │             │
│  └───────────────────────────────────────────────────────────┘             │
│                                                                             │
│  Garantia: Ambas operações completam OU nenhuma completa                  │
│  Nunca: Empréstimo criado sem atualizar exemplar                          │
│                                                                             │
│  Padrão GRASP: INFORMATION EXPERT, CREATOR                                │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                    {operações SQL para banco}
                                 ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                  PRISMA ORM (src/lib/prisma.ts)                            │
├─────────────────────────────────────────────────────────────────────────────┤
│  Singleton para comunicação com banco                                      │
│  ✓ Conexão única durante aplicação                                         │
│  ✓ Executa queries usando client.emprestimo.create()                       │
│  ✓ Gerencia transações                                                     │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                          SQL Transactions
                                 ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│              PRISMA SCHEMA (prisma/schema.prisma)                          │
├─────────────────────────────────────────────────────────────────────────────┤
│  ✓ Provider: postgresql                                                    │
│  ✓ Tabelas: Leitor, Publicacao, Exemplar, Emprestimo, Reserva             │
│  ✓ Enums: EstadoLeitor, EstadoExemplar, EstadoEmprestimo, EstadoReserva   │
│  ✓ Relacionamentos: 1:N entre tabelas                                      │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                    DATABASE_URL connection
                                 ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                     POSTGRESQL 16 (Docker)                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  Container: biblioteca_postgres                                            │
│  Porta: 5432                                                               │
│  Usuário: postgres                                                         │
│  Banco: biblioteca_db                                                      │
│                                                                             │
│  Tabelas:                                                                  │
│  ├── leitores (id, nome, email, senha, estado, dataCriacao, ...)          │
│  ├── publicacoes (id, isbn, titulo, ...)                                   │
│  ├── exemplares (id, idPublicacao, estado, ...)                            │
│  ├── emprestimos (id, idLeitor, idExemplar, dataInicio, ...)              │
│  └── reservas (id, idLeitor, idPublicacao, estado, ...)                    │
│                                                                             │
│  Enums (tipos PostgreSQL):                                                 │
│  ├── "EstadoLeitor" = INCOMPLETO | REGULAR | EM_PUNICAO | BANIDO         │
│  ├── "EstadoExemplar" = DISPONIVEL | EMPRESTADO | AFASTADO | RESERVADO   │
│  ├── "EstadoEmprestimo" = CORRENTE | ATRASADO | FINALIZADO               │
│  └── "EstadoReserva" = EM_ESPERA | BLOQUEANTE | FINALIZADA               │
│                                                                             │
│  Status das operações:                                                     │
│  ✓ INSERT: Emprestimo criado com estado CORRENTE                          │
│  ✓ UPDATE: Exemplar atualizado para estado EMPRESTADO                     │
│                                                                             │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                      Dados persistidos
                                 ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                         RESPOSTA HTTP 201                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  {                                                                          │
│    "sucesso": true,                                                        │
│    "dados": {                                                              │
│      "id": "emp789",                                                       │
│      "idLeitor": "abc123",                                                 │
│      "idExemplar": "def456",                                               │
│      "dataInicio": "2025-06-01T14:30:00Z",                                 │
│      "dataExpiracao": "2025-06-15T14:30:00Z",                              │
│      "estado": "CORRENTE"                                                  │
│    }                                                                       │
│  }                                                                         │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                       Cliente recebe resposta
                                 ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                         BROWSER / CLIENTE                                   │
│                                                                             │
│  ✓ Empréstimo criado com sucesso                                           │
│  ✓ Exemplar marcado como EMPRESTADO                                        │
│  ✓ Dados persistidos no banco                                              │
│  ✓ Transação atômica garantiu consistência                                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Estrutura de Arquivos

```
trabalho-pratico-noite-estrelada/
│
├── 📚 Documentação (Leia nesta ordem!)
│   ├── LEIA-ME-PRIMEIRO.md          ← Você está aqui! Guia de início
│   ├── QUICKSTART.md                ← Setup em 5 minutos
│   ├── SETUP.md                     ← Setup completo e detalhado
│   ├── ARQUITETURA.md               ← Padrão de camadas + GRASP
│   ├── ESTRUTURA.md                 ← Visão geral do projeto
│   ├── EXEMPLOS-REQUISICOES.md      ← Exemplos de chamadas à API
│   └── README.md                    ← Visão geral executivo
│
├── 🔧 Configuração
│   ├── package.json                 # Dependências npm
│   ├── tsconfig.json                # Configuração TypeScript
│   ├── next.config.ts               # Configuração Next.js
│   ├── eslint.config.mjs            # Linting rules
│   ├── .npmrc                       # npm config
│   ├── .env.example                 # Variáveis de ambiente (exemplo)
│   ├── .gitignore                   # Git ignore
│   └── init.sh                      # Script de setup automático
│
├── 🐳 Docker
│   └── docker-compose.yml           # PostgreSQL + Docker
│
├── 📁 src/ (Código-fonte TypeScript)
│   │
│   ├── 🌐 app/api/ (CAMADA DE APRESENTAÇÃO)
│   │   └── emprestimos/
│   │       └── route.ts             # Controller POST/GET
│   │
│   ├── ⚙️ services/ (CAMADA DE NEGÓCIOS)
│   │   └── emprestimoService.ts     # Regras de negócio
│   │
│   ├── 💾 repositories/ (CAMADA DE PERSISTÊNCIA)
│   │   └── emprestimoRepository.ts  # Acesso ao banco (DAO)
│   │
│   ├── 📦 types/
│   │   └── index.ts                 # DTOs e interfaces TypeScript
│   │
│   ├── 🔧 lib/
│   │   └── prisma.ts                # Cliente Prisma singleton
│   │
│   └── 🧪 __tests__/
│       └── emprestimo.test.ts       # Exemplo de testes unitários
│
├── 🗄️ prisma/ (ORM & Modelagem)
│   ├── schema.prisma                # Schema do banco de dados
│   └── seed.ts                      # Script para popular banco
│
└── 📊 Outros arquivos
    ├── Correções da entrega 1/
    └── Diagrama de Classe Detalhado (de Projeto).xml
```

---

## 🔄 Fluxo de Requisição Completo

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Cliente envia requisição                                     │
│    POST /api/emprestimos                                        │
│    Content-Type: application/json                              │
│    {                                                            │
│      "idLeitor": "abc123",                                      │
│      "idExemplar": "def456",                                    │
│      "diasEmprestimo": 14                                       │
│    }                                                            │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. Next.js Router Handler recebe e parseia                      │
│    - Extrai body JSON                                           │
│    - Instancia EmprestimoService                               │
│    - Trata exceções                                             │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. EmprestimoService valida regras de negócio                   │
│    - Verifica exemplar disponível (query ao banco)              │
│    - Verifica leitor válido (query ao banco)                    │
│    - Verifica limite de empréstimos (count query)               │
│    - Calcula dataExpiracao                                      │
│    - Se tudo OK → Chama repository                              │
│    - Se erro → Lança exception com código e mensagem            │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. EmprestimoRepository executa transação                       │
│                                                                 │
│    BEGIN TRANSACTION                                            │
│    │                                                            │
│    ├─ INSERT INTO emprestimos                                  │
│    │  (idLeitor, idExemplar, dataInicio, dataExpiracao,        │
│    │   estado, dataCriacao)                                    │
│    │  VALUES ('abc123', 'def456', now(), ?, 'CORRENTE', now()) │
│    │  RETURNING *;                                              │
│    │  → {id: 'emp789', estado: 'CORRENTE', ...}                │
│    │                                                            │
│    ├─ UPDATE exemplares                                         │
│    │  SET estado = 'EMPRESTADO', dataAtualizacao = now()       │
│    │  WHERE id = 'def456';                                      │
│    │  → 1 linha atualizada                                      │
│    │                                                            │
│    └─ COMMIT (sucesso) ou ROLLBACK (se erro)                   │
│                                                                 │
│    Resultado: Objeto Emprestimo completo                       │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. EmprestimoService mapeia para DTO Response                   │
│    Emprestimo → IEmprestimoResponse                             │
│    {                                                            │
│      id: 'emp789',                                              │
│      idLeitor: 'abc123',                                        │
│      idExemplar: 'def456',                                      │
│      dataInicio: '2025-06-01T14:30Z',                           │
│      dataExpiracao: '2025-06-15T14:30Z',                        │
│      estado: 'CORRENTE'                                         │
│    }                                                            │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. Route Handler formata resposta HTTP 201 Created              │
│    {                                                            │
│      "sucesso": true,                                           │
│      "dados": {...response...}                                  │
│    }                                                            │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 7. Cliente recebe resposta com sucesso                          │
│    Status: 201 Created                                          │
│    Body: JSON com empréstimo criado                             │
│                                                                 │
│    Banco agora tem:                                             │
│    ✓ Novo registro em emprestimos                              │
│    ✓ Exemplar com estado atualizado para EMPRESTADO             │
│    ✓ Ambos sincronizados (transação garantiu)                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Padrões GRASP Utilizados

```
CONTROLLER (Route Handler)
├─ Recebe evento do exterior (HTTP)
├─ Delega ao serviço apropriado
└─ Formata resposta

INFORMATION EXPERT (Service)
├─ Sabe as regras de negócio
├─ Valida antes de persistir
└─ Orquestra operações

CREATOR (Repository)
├─ Cria novas entidades
├─ Persiste no banco
└─ Garante consistência via transações

SINGLE RESPONSIBILITY (Cada classe)
├─ Uma responsabilidade por classe
├─ Fácil de testar
└─ Fácil de manter
```

---

## ✅ Checklist Visual

```
Instalação:
  ☐ Node.js 18+
  ☐ Docker
  ☐ npm/yarn

Setup:
  ☐ npm install
  ☐ cp .env.example .env.local
  ☐ docker-compose up -d
  ☐ npx prisma db push
  ☐ npx prisma generate
  ☐ (Opcional) npm run db:seed

Desenvolvimento:
  ☐ npm run dev
  ☐ npx prisma studio
  ☐ Testar endpoints

Próximas etapas:
  ☐ Criar mais endpoints
  ☐ Adicionar autenticação
  ☐ Adicionar testes
  ☐ Adicionar validação com Zod
```

---

**Documento gerado:** 1 de junho de 2025  
**Status:** ✅ Pronto para uso
