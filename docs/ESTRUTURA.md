# Estrutura do Projeto - Noite Estrelada

```
📦 trabalho-pratico-noite-estrelada/
│
├── 📄 package.json                          # Dependências do projeto
├── 📄 tsconfig.json                         # Configuração TypeScript
├── 📄 next.config.ts                        # Configuração Next.js
├── 📄 eslint.config.mjs                     # Linting
├── 📄 .npmrc                                # Configuração npm
├── 📄 .gitignore                            # Ignorar arquivos git
│
├── 📋 .env.example                          # Variáveis de ambiente (exemplo)
├── 📋 docker-compose.yml                    # Orquestração PostgreSQL + Docker
│
├── 📚 Documentação:
│   ├── README.md                            # Este arquivo
│   ├── SETUP.md                             # Setup detalhado
│   ├── QUICKSTART.md                        # Setup em 5 minutos
│   ├── ARQUITETURA.md                       # Padrão de camadas + GRASP
│   └── ESTRUTURA.md                         # Este arquivo (estrutura visual)
│
├── 📁 src/
│   │
│   ├── 🔌 app/
│   │   └── api/
│   │       └── 🚀 emprestimos/
│   │           └── route.ts                 # POST: Criar empréstimo
│   │                                        # GET: Buscar empréstimo
│   │           (Camada de Apresentação - Controller)
│   │
│   ├── ⚙️ services/
│   │   └── emprestimoService.ts             # Validar regras de negócio
│   │       (Camada de Negócios - Business Logic)
│   │
│   ├── 💾 repositories/
│   │   └── emprestimoRepository.ts          # Interagir com banco
│   │       (Camada de Persistência - Data Access)
│   │
│   ├── 📦 types/
│   │   └── index.ts                         # DTOs e Interfaces TypeScript
│   │
│   └── 🔧 lib/
│       └── prisma.ts                        # Cliente Prisma singleton
│
├── 🧪 src/__tests__/
│   └── emprestimo.test.ts                   # Exemplo de testes unitários
│
├── 🗄️ prisma/
│   ├── schema.prisma                        # Modelagem de dados
│   └── seed.ts                              # Script seed (popular dados)
│
└── 📊 node_modules/                         # Dependências npm
```

---

## 📊 Relação entre Arquivos

```
┌──────────────────────────────────────────────────────────────────┐
│                    HTTP Request (POST /api/emprestimos)          │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ↓
┌──────────────────────────────────────────────────────────────────┐
│ src/app/api/emprestimos/route.ts (APRESENTAÇÃO - Controller)     │
│                                                                   │
│ • Parse JSON                                                      │
│ • Validar entrada                                                 │
│ • Invocar serviço                                                 │
│ • Formatar resposta HTTP                                          │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ↓ instancia
                             │
┌──────────────────────────────────────────────────────────────────┐
│ src/services/emprestimoService.ts (NEGÓCIOS - Business Logic)    │
│                                                                   │
│ • Validar exemplar disponível                                     │
│ • Validar leitor em estado correto                                │
│ • Validar limite de empréstimos                                   │
│ • Calcular data de expiração                                      │
│ • Invocar repositório                                             │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ↓ instancia
                             │
┌──────────────────────────────────────────────────────────────────┐
│ src/repositories/emprestimoRepository.ts (PERSISTÊNCIA - DAO)    │
│                                                                   │
│ • Verificar exemplar disponível (SELECT)                          │
│ • Verificar leitor válido (SELECT)                                │
│ • Contar empréstimos ativos (COUNT)                               │
│ • Criar empréstimo (INSERT) + Atualizar exemplar (UPDATE)        │
│   [DENTRO DE TRANSAÇÃO - ATOMICIDADE]                             │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ↓ usa
                             │
┌──────────────────────────────────────────────────────────────────┐
│ src/lib/prisma.ts (Cliente Prisma)                               │
│                                                                   │
│ • Singleton para conexão com banco                                │
│ • Executar queries SQL via Prisma ORM                             │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ↓ conecta
                             │
┌──────────────────────────────────────────────────────────────────┐
│ prisma/schema.prisma (Modelagem)                                 │
│                                                                   │
│ • Define tabelas (Leitor, Exemplar, Empréstimo, etc)             │
│ • Define Enums (Estados do Leitor, Exemplar, etc)                │
│ • Define relacionamentos e índices                                │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ↓ mapeia
                             │
┌──────────────────────────────────────────────────────────────────┐
│ PostgreSQL Database (docker-compose.yml)                         │
│                                                                   │
│ • Tabela: leitores                                                │
│ • Tabela: exemplares                                              │
│ • Tabela: emprestimos                                             │
│ • Tabela: publicacoes                                             │
│ • Tabela: reservas                                                │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🔀 Fluxo de Dados

```
Entrada (DTO):
┌─────────────────────────────────────────┐
│ IRealizarEmprestimoDTO                  │
├─────────────────────────────────────────┤
│ idLeitor: string                        │
│ idExemplar: string                      │
│ diasEmprestimo?: number (default: 14)   │
└─────────────────────────────────────────┘
                 ↓
        Processamento
                 ↓
Saída (DTO):
┌─────────────────────────────────────────┐
│ IEmprestimoResponse                     │
├─────────────────────────────────────────┤
│ id: string                              │
│ idLeitor: string                        │
│ idExemplar: string                      │
│ dataInicio: Date                        │
│ dataExpiracao: Date                     │
│ estado: string (EstadoEmprestimo)       │
└─────────────────────────────────────────┘
```

---

## 🛠️ Tecnologias por Camada

| Camada | Arquivo | Tecnologia | Responsabilidade |
|--------|---------|-----------|-----------------|
| **Apresentação** | `route.ts` | Next.js 15 (App Router) | HTTP, Roteamento, Validação entrada |
| **Negócios** | `emprestimoService.ts` | TypeScript puro | Regras, Orquestração |
| **Persistência** | `emprestimoRepository.ts` | Prisma ORM | Banco, Transações |
| **Dados** | `schema.prisma` | Prisma Schema | Modelagem relacional |
| **Banco** | `docker-compose.yml` | PostgreSQL 16 | Armazenamento |

---

## 📦 Módulos TypeScript

```
src/
├── types/index.ts
│   ├── IRealizarEmprestimoDTO
│   ├── IEmprestimoResponse
│   └── IErroAplicacao
│
├── lib/prisma.ts
│   └── export const prisma
│
├── repositories/emprestimoRepository.ts
│   └── class EmprestimoRepository
│       ├── verificarExemplarDisponivel()
│       ├── verificarLeitorVálido()
│       ├── contarEmprestimosAtivos()
│       ├── criarEmprestimo()
│       ├── finalizarEmprestimo()
│       └── obterEmprestimoPorId()
│
├── services/emprestimoService.ts
│   └── class EmprestimoService
│       ├── realizarEmprestimo()
│       ├── finalizarEmprestimo()
│       ├── calcularDataExpiracao() (private)
│       ├── mapearParaResponse() (private)
│       └── criarErro() (private)
│
└── app/api/emprestimos/route.ts
    ├── export function POST()
    └── export function GET()
```

---

## 🔐 Transações Atômicas

```
Sem Transação (❌ PERIGOSO):
┌─────────────────────────────────┐
│ INSERT INTO emprestimos (...)   │ ✅ OK
└─────────────────────────────────┘
                │
           [CRASH AQUI]
                │
┌─────────────────────────────────┐
│ UPDATE exemplares SET ... ❌    │ NÃO EXECUTA
└─────────────────────────────────┘
RESULTADO: Empréstimo criado mas Exemplar não foi atualizado ❌


Com Transação (✅ CORRETO):
┌──────────────────────────────────────────────────┐
│ BEGIN TRANSACTION                                │
├──────────────────────────────────────────────────┤
│ INSERT INTO emprestimos (...)                    │
│ UPDATE exemplares SET estado = 'EMPRESTADO'      │
├──────────────────────────────────────────────────┤
│ [CRASH AQUI → ROLLBACK AUTOMÁTICO]               │
├──────────────────────────────────────────────────┤
│ COMMIT (só executa se tudo OK)                   │
└──────────────────────────────────────────────────┘
RESULTADO: Ambas operações ocorrem ou nenhuma ✅
```

---

## 📋 Dependências Principais

```json
{
  "dependencies": {
    "next": "^15.0.0",              // Framework web
    "react": "^19.0.0",             // Biblioteca UI
    "@prisma/client": "^5.0.0"      // ORM para banco
  },
  "devDependencies": {
    "typescript": "^5.0.0",         // Tipagem
    "prisma": "^5.0.0",             // CLI do Prisma
    "ts-node": "^10.0.0"            // Executar TypeScript
  }
}
```

---

## 🎯 Próximas Adições

```
src/
├── middleware/
│   ├── autenticacao.ts             # JWT Auth
│   ├── validacao.ts                # Zod validation
│   └── erroGlobal.ts               # Error handling
│
├── utils/
│   ├── logger.ts                   # Logging
│   ├── formatadores.ts             # Data/hora
│   └── constantes.ts               # Valores fixos
│
├── config/
│   ├── database.ts                 # Configuração DB
│   └── server.ts                   # Configuração server
│
└── app/api/
    ├── leitores/route.ts           # Gestão leitores
    ├── publicacoes/route.ts        # Gestão publicações
    ├── exemplares/route.ts         # Gestão exemplares
    └── reservas/route.ts           # Gestão reservas
```

---

## 🚀 Escalabilidade

A arquitetura de 3 camadas permite:

✅ **Adicionar novos endpoints** - Copiar estrutura route + service + repository  
✅ **Mudar banco de dados** - Apenas alterar repository  
✅ **Adicionar autenticação** - Apenas validar no route handler  
✅ **Adicionar cache** - Apenas adicionar no service  
✅ **Fazer testes** - Mock do repository e testar service isolado  
✅ **Paralelizar desenvolvimento** - Diferentes pessoas em diferentes camadas  

---

## 📚 Referências

- [Next.js 15 App Router](https://nextjs.org/docs/app)
- [Prisma ORM](https://www.prisma.io/docs/)
- [PostgreSQL 16](https://www.postgresql.org/docs/16/)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [Docker Compose](https://docs.docker.com/compose/)
- [GRASP Principles](https://en.wikipedia.org/wiki/GRASP_(object-oriented_design))
