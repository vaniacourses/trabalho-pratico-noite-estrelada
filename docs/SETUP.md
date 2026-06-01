# Noite Estrelada - Backend Setup

## 📋 Arquitetura

O projeto segue o padrão de **Camadas** (Layered Architecture) com GRASP:

```
Requisição HTTP
      ↓
┌─────────────────────────────────────────┐
│  Camada de Apresentação (Route Handler) │ ← src/app/api/emprestimos/route.ts
└──────────────────┬──────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│  Camada de Negócios (Service)           │ ← src/services/emprestimoService.ts
└──────────────────┬──────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│  Camada de Persistência (Repository)    │ ← src/repositories/emprestimoRepository.ts
└──────────────────┬──────────────────────┘
                   ↓
            PostgreSQL (Prisma ORM)
```

### Padrões GRASP Aplicados:

1. **Controller** - Route Handler recebe e valida requisição
2. **Information Expert** - Cada camada possui expertise no seu domínio
3. **Creator** - Repository cria entidades do banco
4. **Single Responsibility** - Cada classe tem uma única responsabilidade

---

## 🚀 Setup Inicial

### 1. Clonar dependências
```bash
npm install
```

### 2. Copiar variáveis de ambiente
```bash
cp .env.example .env.local
```

### 3. Iniciar PostgreSQL com Docker
```bash
docker-compose up -d
```

Validar conexão:
```bash
docker-compose ps
```

### 4. Criar o schema no banco
```bash
npx prisma db push
```

### 5. Gerar cliente Prisma
```bash
npx prisma generate
```

### 6. (Opcional) Seed do banco com dados iniciais
```bash
npm run db:seed
```

### 7. Iniciar servidor de desenvolvimento
```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3000`

---

## 📁 Estrutura de Pastas

```
src/
├── app/
│   └── api/
│       └── emprestimos/
│           └── route.ts              # Controller (Route Handler)
├── services/
│   └── emprestimoService.ts           # Lógica de negócios
├── repositories/
│   └── emprestimoRepository.ts        # Persistência (Banco de dados)
├── types/
│   └── index.ts                       # Tipos TypeScript
└── lib/
    └── prisma.ts                      # Cliente Prisma singleton

prisma/
└── schema.prisma                      # Schema do Prisma

docker-compose.yml                     # Configuração PostgreSQL
package.json                           # Dependências
tsconfig.json                          # Configuração TypeScript
```

---

## 🔄 Fluxo: Realizar Empréstimo

### Request HTTP (POST /api/emprestimos)
```json
{
  "idLeitor": "leitor-123",
  "idExemplar": "exemplar-456",
  "diasEmprestimo": 14
}
```

### Processamento (3 Camadas):

#### 1️⃣ **Camada de Apresentação** (route.ts)
- Recebe a requisição
- Valida campos obrigatórios
- Chama o serviço
- Retorna resposta HTTP formatada

#### 2️⃣ **Camada de Negócios** (emprestimoService.ts)
- Valida regra 1: Exemplar disponível?
- Valida regra 2: Leitor válido?
- Valida regra 3: Leitor não atingiu limite de empréstimos?
- Calcula data de expiração
- Chama o repositório

#### 3️⃣ **Camada de Persistência** (emprestimoRepository.ts)
- Cria o empréstimo
- Atualiza estado do exemplar (Transaction Prisma)
- Retorna o empréstimo criado

### Response HTTP (201 Created)
```json
{
  "sucesso": true,
  "dados": {
    "id": "emp-789",
    "idLeitor": "leitor-123",
    "idExemplar": "exemplar-456",
    "dataInicio": "2025-06-01T10:30:00Z",
    "dataExpiracao": "2025-06-15T10:30:00Z",
    "estado": "CORRENTE"
  }
}
```

---

## 📊 Modelo de Dados (Schema Prisma)

### Entidades:

| Entidade | Campos | Estados Possíveis |
|----------|--------|-------------------|
| **Leitor** | id, nome, email, senha, estado | INCOMPLETO, REGULAR, EM_PUNICAO, BANIDO |
| **Publicação** | id, isbn, titulo | - |
| **Exemplar** | id, idPublicacao, estado | DISPONIVEL, EMPRESTADO, AFASTADO, RESERVADO |
| **Empréstimo** | id, idLeitor, idExemplar, dataInicio, dataExpiracao, dataFinalizacao, estado | CORRENTE, ATRASADO, FINALIZADO |
| **Reserva** | id, idLeitor, idPublicacao, dataExpiracao, estado | EM_ESPERA, BLOQUEANTE, FINALIZADA |

### Relacionamentos:
- Leitor → Empréstimo (1:N)
- Leitor → Reserva (1:N)
- Publicação → Exemplar (1:N)
- Publicação → Reserva (1:N)
- Exemplar → Empréstimo (1:N)

---

## 🔒 Transações (Transaction Prisma)

O `EmprestimoRepository` utiliza `prisma.$transaction` para garantir atomicidade:

```typescript
return prisma.$transaction(async (tx) => {
  // Criar empréstimo
  const emprestimo = await tx.emprestimo.create({...});
  
  // Atualizar exemplar
  await tx.exemplar.update({...});
  
  // Ambas operações ocorrem ou nenhuma (atomicidade)
  return emprestimo;
});
```

Isso garante que **nunca** existe um estado inconsistente onde o empréstimo foi criado mas o exemplar não foi marcado como emprestado.

---

## 🧪 Testar via cURL

```bash
# Criar empréstimo
curl -X POST http://localhost:3000/api/emprestimos \
  -H "Content-Type: application/json" \
  -d '{
    "idLeitor": "clm1a2b3c4d5e",
    "idExemplar": "clm5f6g7h8i9j",
    "diasEmprestimo": 14
  }'
```

---

## 📝 Próximas Etapas

1. Implementar endpoints para Reservas
2. Adicionar autenticação (JWT)
3. Implementar paginação
4. Adicionar logging centralizado
5. Criar testes unitários (Jest)
6. Implementar validação com Zod
7. Adicionar documentação Swagger/OpenAPI

---

## 🛠️ Comandos Úteis

```bash
# Prisma Studio (visualizar/editar dados)
npx prisma studio

# Ver logs de migrações
npx prisma migrate status

# Resetar banco (apaga e recria schema)
npx prisma migrate reset

# Parar PostgreSQL
docker-compose down

# Ver logs do PostgreSQL
docker-compose logs postgres
```

---

## 🐛 Troubleshooting

**Erro: "Cannot find module @/lib/prisma"**
- Verificar `tsconfig.json` → paths está correto

**Erro: "Connection refused"**
- PostgreSQL não está rodando: `docker-compose up -d`

**Erro: "P2002 Unique constraint"**
- Email duplicado ao criar leitor

**Erro: "P1000 Authentication failed"**
- Verificar `DATABASE_URL` em `.env.local`
