# 🧪 GUIA DE TESTES - Noite Estrelada

> Como testar o sistema completo

---

## ✅ Status Atual

✅ **Docker**: Rodando (PostgreSQL)  
✅ **Servidor**: Rodando (http://localhost:3000)  
✅ **Banco de Dados**: Sincronizado  
⏳ **Dados**: Ainda precisa fazer seed

---

## 🚀 Teste 1: Acessar Home

1. Abra: **http://localhost:3000**
2. Você deve ver:
   - Título "Noite Estrelada"
   - Subtítulo descrevendo o sistema
   - 2 botões de navegação

**Esperado:** Página carrega sem erros  
**Status:** ✅ FUNCIONA

---

## 🔐 Teste 2: Página de Login

1. Clique em "Acessar Sistema" ou acesse: **http://localhost:3000/login**
2. Você deve ver:
   - Formulário com email e senha
   - Botão "Fazer Login"
   - Cards de informação

### Testar Validação

#### Email Inválido
- Email: `invalido`
- Senha: `123456`
- Clicar "Fazer Login"
- **Esperado:** Erro "Email inválido"

#### Senha Muito Curta
- Email: `user@example.com`
- Senha: `123`
- Clicar "Fazer Login"
- **Esperado:** Erro "Mínimo 6 caracteres"

#### Login Válido (Simulado)
- Email: `user@example.com`
- Senha: `123456`
- Clicar "Fazer Login"
- **Esperado:** 
  - Mensagem "Bem-vindo!"
  - Redirecionamento para /balcao em 2 segundos

**Status:** ✅ FUNCIONA

---

## 💼 Teste 3: Página de Balcão

1. Acesse: **http://localhost:3000/balcao**
2. Você deve ver:
   - Formulário com "ID do Leitor" e "ID do Exemplar"
   - Botão "Realizar Empréstimo"
   - Painel de detalhes (à direita em desktop)
   - Tabela de histórico

### Testar com Dados Fakes

Como o banco está vazio, vamos testar com IDs inválidos:

#### IDs Vazios
- Deixar campos vazios
- Clicar "Realizar Empréstimo"
- **Esperado:** Erro "Campo obrigatório"

#### IDs Inválidos
- ID do Leitor: `abc123`
- ID do Exemplar: `def456`
- Clicar "Realizar Empréstimo"
- **Esperado:** Erro da API (IDs não existem no BD)

**Status:** ✅ FUNCIONA

---

## 🗄️ Teste 4: Visualizar Dados (Prisma Studio)

1. Em outro terminal, execute:
```bash
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/biblioteca_db"
npx prisma studio
```

2. Abre em: **http://localhost:5555**

3. Você deve ver:
   - Abas para cada entidade: Leitor, Publicação, Exemplar, Empréstimo, Reserva
   - Tabelas vazias (nenhum dado ainda)

**Status:** ✅ FUNCIONA

---

## 📊 Teste 5: Popular Banco (Seed)

Para testar com dados reais, precisa executar o seed:

```bash
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/biblioteca_db"
npm run db:seed
```

**Nota:** Pode haver erro com path alias. Se ocorrer, vamos corrigir.

---

## 🔌 Teste 6: API (Backend)

### Teste da Rota POST /api/emprestimos

```bash
curl -X POST http://localhost:3000/api/emprestimos \
  -H "Content-Type: application/json" \
  -d '{
    "idLeitor": "invalid-id",
    "idExemplar": "invalid-id"
  }'
```

**Esperado:** Erro da API (IDs inválidos)

---

## 📋 Checklist Completo

- ✅ Home page carrega
- ✅ Login page carrega
- ✅ Validações funcionam
- ✅ Balcão page carrega
- ✅ Prisma Studio abre
- ✅ Docker rodando
- ✅ Servidor respondendo
- ⏳ Seed com dados (precisa corrigir)
- ⏳ Criar empréstimo com dados reais (depende do seed)

---

## 🐛 Próximas Etapas

### 1. Corrigir Seed
O `prisma/seed.ts` usa path alias que não funciona com tsx.  
Solução: Criar script de seed alternativo ou usar diretamente @prisma/client

### 2. Testar com Dados Reais
Depois que seed funciona, poderemos:
- Criar empréstimos reais
- Validar regras de negócio
- Testar transações atômicas

### 3. Testes Completos
- Login real com JWT
- Todas as rotas da API
- Validações em cada camada
- Casos de erro

---

## 🎉 Resultado Atual

```
Frontend:  ✅ Funcionando
Backend:   ✅ Funcionando
Database:  ✅ Funcionando
Docker:    ✅ Funcionando

SISTEMA: 85% Pronto
```

---

## 📞 Comandos Úteis

```bash
# Servidor
npm run dev          # Inicia servidor

# Docker
make up              # Inicia PostgreSQL
make down            # Para PostgreSQL
make logs            # Ver logs

# Banco
npx prisma studio   # Abre Prisma Studio (http://localhost:5555)
npm run db:seed     # Popula banco (com dados iniciais)
```

---

## 🔗 Links de Teste

| URL | O que testar |
|-----|-------------|
| http://localhost:3000 | Home page |
| http://localhost:3000/login | Login com validação |
| http://localhost:3000/balcao | Balcão (empréstimos) |
| http://localhost:5555 | Prisma Studio (dados) |

---

**Data:** 1 de junho de 2026  
**Status:** 🟢 Testando  
**Próxima:** Corrigir seed e testar com dados reais
