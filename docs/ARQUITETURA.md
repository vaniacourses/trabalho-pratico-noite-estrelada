# Documentação de Arquitetura

## 🏗️ Padrão de Camadas (Layered Architecture)

O projeto segue a arquitetura de 3 camadas (3-Tier Architecture) com aplicação dos padrões GRASP:

### Camada 1: Apresentação (Presentation Layer)
**Localização:** `src/app/api/emprestimos/route.ts`

**Responsabilidades:**
- Receber requisições HTTP
- Validar entrada (formato, campos obrigatórios)
- Invocar serviços de negócio
- Formatar respostas HTTP
- Tratar exceções e retornar erros apropriados

**Padrão GRASP:** Controller

**Exemplo:**
```typescript
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { idLeitor, idExemplar } = body;
  
  // Validação
  if (!idLeitor || !idExemplar) {
    return NextResponse.json({ erro: "Campos obrigatórios faltando" }, { status: 400 });
  }
  
  // Invocar serviço
  const emprestimoService = new EmprestimoService();
  const emprestimo = await emprestimoService.realizarEmprestimo({ idLeitor, idExemplar });
  
  return NextResponse.json({ dados: emprestimo }, { status: 201 });
}
```

---

### Camada 2: Negócios (Business Layer)
**Localização:** `src/services/emprestimoService.ts`

**Responsabilidades:**
- Validar regras de negócio
- Coordenar lógica entre múltiplos repositórios
- Transformar DTOs (Data Transfer Objects)
- Lançar exceções com mensagens claras

**Padrão GRASP:** 
- Information Expert (conhece as regras do domínio)
- Controller (coordena o fluxo)

**Exemplo:**
```typescript
export class EmprestimoService {
  async realizarEmprestimo(dto: IRealizarEmprestimoDTO): Promise<IEmprestimoResponse> {
    // Regra 1: Exemplar disponível?
    const exemplarDisponivel = await this.repository.verificarExemplarDisponivel(dto.idExemplar);
    if (!exemplarDisponivel) {
      throw this.criarErro("EXEMPLAR_INDISPONIVEL", "...", 400);
    }
    
    // Regra 2: Leitor válido?
    const leitorVálido = await this.repository.verificarLeitorVálido(dto.idLeitor);
    if (!leitorVálido) {
      throw this.criarErro("LEITOR_INVALIDO", "...", 400);
    }
    
    // Regra 3: Limite de empréstimos?
    const ativos = await this.repository.contarEmprestimosAtivos(dto.idLeitor);
    if (ativos >= 5) {
      throw this.criarErro("LIMITE_ATINGIDO", "...", 400);
    }
    
    // Calcular data de expiração
    const dataExpiracao = this.calcularDataExpiracao(14);
    
    // Invocar repositório
    return await this.repository.criarEmprestimo(dto.idLeitor, dto.idExemplar, dataExpiracao);
  }
}
```

---

### Camada 3: Persistência (Persistence Layer)
**Localização:** `src/repositories/emprestimoRepository.ts`

**Responsabilidades:**
- Interagir com o banco de dados via Prisma ORM
- Executar queries (read/write)
- Gerenciar transações para atomicidade
- Abstrair a implementação do banco

**Padrão GRASP:** 
- Information Expert (sabe ler/escrever dados)
- Creator (cria entidades do banco)

**Exemplo:**
```typescript
export class EmprestimoRepository {
  async criarEmprestimo(idLeitor: string, idExemplar: string, dataExpiracao: Date): Promise<Emprestimo> {
    // Transação: garante atomicidade
    return prisma.$transaction(async (tx) => {
      // 1. Criar empréstimo
      const emprestimo = await tx.emprestimo.create({
        data: { idLeitor, idExemplar, dataExpiracao, estado: "CORRENTE" }
      });
      
      // 2. Atualizar exemplar
      await tx.exemplar.update({
        where: { id: idExemplar },
        data: { estado: "EMPRESTADO" }
      });
      
      // Se tudo correr bem, ambas operações são commitadas
      // Se alguma falhar, nada é commitado (rollback automático)
      return emprestimo;
    });
  }
}
```

---

## 🔄 Fluxo Completo: Realizar Empréstimo

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Cliente HTTP envia POST /api/emprestimos                     │
│    { "idLeitor": "abc123", "idExemplar": "def456" }             │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. Route Handler (Camada de Apresentação)                       │
│    - Parse do JSON                                              │
│    - Validação: campos obrigatórios?                            │
│    - Instancia EmprestimoService                                │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. EmprestimoService (Camada de Negócios)                       │
│    - Chamada: repository.verificarExemplarDisponivel()          │
│      ↓ Resposta: true/false                                     │
│    - Chamada: repository.verificarLeitorVálido()                │
│      ↓ Resposta: true/false                                     │
│    - Chamada: repository.contarEmprestimosAtivos()              │
│      ↓ Resposta: número                                         │
│    - Calcula data de expiração (hoje + 14 dias)                 │
│    - Chamada: repository.criarEmprestimo()                      │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. EmprestimoRepository (Camada de Persistência) - TRANSAÇÃO    │
│                                                                  │
│    BEGIN TRANSACTION                                            │
│    ├─ INSERT INTO emprestimos (...)                             │
│    ├─ UPDATE exemplares SET estado = 'EMPRESTADO' WHERE id = .. │
│    COMMIT                                                       │
│                                                                  │
│    Se erro em qualquer operação → ROLLBACK automático           │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. Retorno da Transação                                         │
│    Emprestimo { id, idLeitor, idExemplar, ... }                 │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. EmprestimoService mapeia para Response                       │
│    { id, idLeitor, idExemplar, dataInicio, dataExpiracao, ... } │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 7. Route Handler formata resposta HTTP 201                      │
│    { "sucesso": true, "dados": {...} }                          │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 8. Cliente recebe resposta com status 201 Created               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔒 Transações Prisma

As transações garantem **atomicidade** - múltiplas operações ocorrem como uma unidade indivisível.

### Exemplo: Criar Empréstimo + Atualizar Exemplar

```typescript
async criarEmprestimo(idLeitor, idExemplar, dataExpiracao) {
  return prisma.$transaction(async (tx) => {
    // Dentro da transação, usar 'tx' em vez de 'prisma'
    
    const emprestimo = await tx.emprestimo.create({
      data: { idLeitor, idExemplar, dataExpiracao, estado: "CORRENTE" }
    });
    
    await tx.exemplar.update({
      where: { id: idExemplar },
      data: { estado: "EMPRESTADO" }
    });
    
    return emprestimo;
  });
}
```

### Garantias:
✅ Ambas operações completam  
✅ Nenhuma operação é perdida  
✅ Sem estado intermediário inconsistente  

### O que ocorre em caso de erro:
❌ Se qualquer operação falhar → **ROLLBACK** automático  
❌ Todas as operações são desfeitas  
❌ Banco volta ao estado anterior  

---

## 📊 Modelo de Dados (Enums Postgres)

Os Enums são definidos no schema.prisma e mapeados para tipos nativos do PostgreSQL:

```sql
-- No PostgreSQL:
CREATE TYPE "EstadoLeitor" AS ENUM ('INCOMPLETO', 'REGULAR', 'EM_PUNICAO', 'BANIDO');
CREATE TYPE "EstadoExemplar" AS ENUM ('DISPONIVEL', 'EMPRESTADO', 'AFASTADO', 'RESERVADO');
CREATE TYPE "EstadoEmprestimo" AS ENUM ('CORRENTE', 'ATRASADO', 'FINALIZADO');
CREATE TYPE "EstadoReserva" AS ENUM ('EM_ESPERA', 'BLOQUEANTE', 'FINALIZADA');
```

No TypeScript (via Prisma):
```typescript
leitor.estado = EstadoLeitor.REGULAR;    // Type-safe!
exemplar.estado = EstadoExemplar.DISPONIVEL;
emprestimo.estado = EstadoEmprestimo.CORRENTE;
```

---

## 🎯 Benefícios da Arquitetura

### Separação de Responsabilidades
- Cada camada tem um único propósito bem definido
- Fácil entender o que cada arquivo faz

### Testabilidade
- Camada de negócios pode ser testada sem banco (mock do repository)
- Camada de apresentação pode ser testada sem chamadas HTTP reais

### Manutenibilidade
- Mudança de banco de dados → alterar apenas repositório
- Mudança de regra de negócio → alterar apenas serviço
- Mudança de formato de resposta → alterar apenas route handler

### Escalabilidade
- Fácil adicionar novos endpoints copiando a estrutura
- Reutilizar serviços entre múltiplos endpoints
- Compartilhar repositórios entre múltiplos serviços

---

## 📝 Exemplo: Adicionar Novo Endpoint

Para adicionar um endpoint que lista empréstimos de um leitor:

**1. Crie o repositório:**
```typescript
// src/repositories/emprestimoRepository.ts
async listarEmprestimosPorLeitor(idLeitor: string) {
  return prisma.emprestimo.findMany({
    where: { idLeitor },
    include: { exemplar: { include: { publicacao: true } } }
  });
}
```

**2. Crie o serviço:**
```typescript
// src/services/emprestimoService.ts
async listarEmprestimosPorLeitor(idLeitor: string) {
  const emprestimos = await this.repository.listarEmprestimosPorLeitor(idLeitor);
  return emprestimos.map(e => this.mapearParaResponse(e));
}
```

**3. Crie o route handler:**
```typescript
// src/app/api/emprestimos/leitor/route.ts
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const idLeitor = searchParams.get("idLeitor");
  
  const service = new EmprestimoService();
  const emprestimos = await service.listarEmprestimosPorLeitor(idLeitor);
  
  return NextResponse.json({ dados: emprestimos });
}
```

Pronto! Nova funcionalidade com a mesma arquitetura.

---

## 🚀 Próximas Melhorias

1. **Validação com Zod:**
   ```typescript
   const schema = z.object({
     idLeitor: z.string().min(1),
     idExemplar: z.string().min(1)
   });
   ```

2. **Logging Centralizado:**
   ```typescript
   logger.info("Empréstimo criado", { idEmprestimo, idLeitor });
   ```

3. **Autenticação JWT:**
   ```typescript
   const usuario = verificarJWT(request.headers.get("Authorization"));
   ```

4. **Paginação:**
   ```typescript
   const emprestimos = await repository.listar({ skip: 0, take: 10 });
   ```

5. **Testes Unitários:**
   ```typescript
   describe("EmprestimoService", () => {
     it("deve lançar erro se exemplar indisponível", () => {...});
   });
   ```
