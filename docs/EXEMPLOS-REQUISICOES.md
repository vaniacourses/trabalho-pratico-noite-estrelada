# Exemplos de Requisições - Noite Estrelada API

## 📌 Base URL
```
http://localhost:3000/api
```

---

## 🔹 POST /emprestimos - Criar Empréstimo

Realiza um novo empréstimo de um exemplar para um leitor.

### Request Body
```json
{
  "idLeitor": "leitor-uuid-aqui",
  "idExemplar": "exemplar-uuid-aqui",
  "diasEmprestimo": 14
}
```

### Campos
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `idLeitor` | string | Sim | UUID do leitor |
| `idExemplar` | string | Sim | UUID do exemplar |
| `diasEmprestimo` | number | Não | Dias de empréstimo (padrão: 14) |

### Response (201 Created)
```json
{
  "sucesso": true,
  "dados": {
    "id": "emprestimo-uuid",
    "idLeitor": "leitor-uuid-aqui",
    "idExemplar": "exemplar-uuid-aqui",
    "dataInicio": "2025-06-01T14:30:00.000Z",
    "dataExpiracao": "2025-06-15T14:30:00.000Z",
    "estado": "CORRENTE"
  }
}
```

### Possíveis Erros

#### 400 - Exemplar Indisponível
```json
{
  "sucesso": false,
  "erro": {
    "codigo": "EXEMPLAR_INDISPONIVEL",
    "mensagem": "O exemplar não está disponível para empréstimo"
  }
}
```

#### 400 - Leitor Inválido
```json
{
  "sucesso": false,
  "erro": {
    "codigo": "LEITOR_INVALIDO",
    "mensagem": "O leitor não pode realizar empréstimos no momento"
  }
}
```

#### 400 - Limite de Empréstimos Atingido
```json
{
  "sucesso": false,
  "erro": {
    "codigo": "LIMITE_EMPRESTIMOS_ATINGIDO",
    "mensagem": "Limite de 5 empréstimos simultâneos atingido"
  }
}
```

#### 400 - Campos Obrigatórios Faltando
```json
{
  "sucesso": false,
  "erro": {
    "codigo": "VALIDACAO_ERRO",
    "mensagem": "Os campos 'idLeitor' e 'idExemplar' são obrigatórios"
  }
}
```

#### 500 - Erro Interno
```json
{
  "sucesso": false,
  "erro": {
    "codigo": "ERRO_INTERNO",
    "mensagem": "Erro interno do servidor"
  }
}
```

---

## 🔹 GET /emprestimos - Buscar Empréstimo

Busca um empréstimo específico por ID.

### Query Parameters
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `id` | string | Sim | UUID do empréstimo |

### Response (200 OK)
```json
{
  "sucesso": true,
  "dados": {
    "id": "emprestimo-uuid",
    "idLeitor": "leitor-uuid",
    "idExemplar": "exemplar-uuid",
    "dataInicio": "2025-06-01T14:30:00.000Z",
    "dataExpiracao": "2025-06-15T14:30:00.000Z",
    "estado": "CORRENTE"
  }
}
```

---

## 📋 Exemplos com cURL

### ✅ Criar empréstimo com sucesso
```bash
curl -X POST http://localhost:3000/api/emprestimos \
  -H "Content-Type: application/json" \
  -d '{
    "idLeitor": "clm9z1a2b3c4d5e6f7g8h",
    "idExemplar": "clm9z8h7g6f5e4d3c2b1a",
    "diasEmprestimo": 14
  }'
```

### ❌ Erro: Campos faltando
```bash
curl -X POST http://localhost:3000/api/emprestimos \
  -H "Content-Type: application/json" \
  -d '{
    "idLeitor": "clm9z1a2b3c4d5e6f7g8h"
  }'
```

### ❌ Erro: Exemplar indisponível
```bash
curl -X POST http://localhost:3000/api/emprestimos \
  -H "Content-Type: application/json" \
  -d '{
    "idLeitor": "clm9z1a2b3c4d5e6f7g8h",
    "idExemplar": "exemplar-indisponivel-uuid"
  }'
```

### 🔍 Buscar empréstimo
```bash
curl -X GET "http://localhost:3000/api/emprestimos?id=emprestimo-uuid"
```

### 📊 Pretty print da resposta
```bash
curl -X POST http://localhost:3000/api/emprestimos \
  -H "Content-Type: application/json" \
  -d '{
    "idLeitor": "clm9z1a2b3c4d5e6f7g8h",
    "idExemplar": "clm9z8h7g6f5e4d3c2b1a"
  }' | jq '.'
```

---

## 📋 Exemplos com Postman

### 1. Criar nova requisição
- **Método:** POST
- **URL:** `http://localhost:3000/api/emprestimos`

### 2. Configurar Headers
| Header | Valor |
|--------|-------|
| `Content-Type` | `application/json` |

### 3. Configurar Body (JSON)
```json
{
  "idLeitor": "clm9z1a2b3c4d5e6f7g8h",
  "idExemplar": "clm9z8h7g6f5e4d3c2b1a",
  "diasEmprestimo": 14
}
```

### 4. Enviar (Send)

---

## 📋 Exemplos com Insomnia

### 1. Novo Request
- Name: `Criar Empréstimo`
- Method: `POST`
- URL: `http://localhost:3000/api/emprestimos`

### 2. Body
```json
{
  "idLeitor": "clm9z1a2b3c4d5e6f7g8h",
  "idExemplar": "clm9z8h7g6f5e4d3c2b1a",
  "diasEmprestimo": 14
}
```

### 3. Send

---

## 📋 Exemplos com JavaScript/TypeScript

### Fetch API
```typescript
const criarEmprestimo = async () => {
  const response = await fetch("http://localhost:3000/api/emprestimos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      idLeitor: "clm9z1a2b3c4d5e6f7g8h",
      idExemplar: "clm9z8h7g6f5e4d3c2b1a",
      diasEmprestimo: 14,
    }),
  });

  const dados = await response.json();
  
  if (response.ok) {
    console.log("Empréstimo criado:", dados.dados);
  } else {
    console.error("Erro:", dados.erro.mensagem);
  }
};
```

### Axios
```typescript
import axios from "axios";

const criarEmprestimo = async () => {
  try {
    const { data } = await axios.post(
      "http://localhost:3000/api/emprestimos",
      {
        idLeitor: "clm9z1a2b3c4d5e6f7g8h",
        idExemplar: "clm9z8h7g6f5e4d3c2b1a",
        diasEmprestimo: 14,
      }
    );

    console.log("Empréstimo criado:", data.dados);
  } catch (error) {
    console.error("Erro:", error.response.data.erro.mensagem);
  }
};
```

---

## 📋 Exemplos com Python

### Requests
```python
import requests
import json

response = requests.post(
    "http://localhost:3000/api/emprestimos",
    json={
        "idLeitor": "clm9z1a2b3c4d5e6f7g8h",
        "idExemplar": "clm9z8h7g6f5e4d3c2b1a",
        "diasEmprestimo": 14
    }
)

if response.status_code == 201:
    dados = response.json()
    print(f"Empréstimo criado: {dados['dados']['id']}")
else:
    erro = response.json()
    print(f"Erro: {erro['erro']['mensagem']}")
```

---

## 🧪 Script de Teste Completo (bash)

```bash
#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="http://localhost:3000/api"

echo -e "${YELLOW}🧪 Testando API de Empréstimos${NC}\n"

# Teste 1: Criar empréstimo válido
echo -e "${YELLOW}Teste 1: Criar empréstimo válido${NC}"
RESPONSE=$(curl -s -X POST "$API_URL/emprestimos" \
  -H "Content-Type: application/json" \
  -d '{
    "idLeitor": "clm9z1a2b3c4d5e6f7g8h",
    "idExemplar": "clm9z8h7g6f5e4d3c2b1a",
    "diasEmprestimo": 14
  }')

SUCESSO=$(echo $RESPONSE | jq -r '.sucesso')
if [ "$SUCESSO" = "true" ]; then
  echo -e "${GREEN}✅ PASSOU${NC}"
  echo $RESPONSE | jq '.'
else
  echo -e "${RED}❌ FALHOU${NC}"
  echo $RESPONSE | jq '.'
fi

# Teste 2: Criar empréstimo sem campos obrigatórios
echo -e "\n${YELLOW}Teste 2: Criar empréstimo sem campos obrigatórios${NC}"
RESPONSE=$(curl -s -X POST "$API_URL/emprestimos" \
  -H "Content-Type: application/json" \
  -d '{
    "idLeitor": "clm9z1a2b3c4d5e6f7g8h"
  }')

ERRO=$(echo $RESPONSE | jq -r '.erro.codigo')
if [ "$ERRO" = "VALIDACAO_ERRO" ]; then
  echo -e "${GREEN}✅ PASSOU${NC}"
else
  echo -e "${RED}❌ FALHOU${NC}"
fi

# Teste 3: Buscar empréstimo
echo -e "\n${YELLOW}Teste 3: Buscar empréstimo${NC}"
RESPONSE=$(curl -s -X GET "$API_URL/emprestimos?id=emprestimo-uuid")
echo $RESPONSE | jq '.'

echo -e "\n${YELLOW}✅ Testes completados${NC}"
```

Salvar como `teste-api.sh` e executar:
```bash
chmod +x teste-api.sh
./teste-api.sh
```

---

## 🔍 Verificar IDs Reais

Usar Prisma Studio para buscar IDs reais:

```bash
npx prisma studio
```

Acessar `http://localhost:5555`:
1. Clicar em "Leitor"
2. Copiar um `id` de um leitor (ex: clm9z1a2b3c4d5e6f7g8h)
3. Clicar em "Exemplar"
4. Copiar um `id` de um exemplar com `estado: DISPONIVEL`
5. Usar esses IDs nas requisições

---

## 📊 Fluxo de Teste Recomendado

1. **Iniciar servidor:** `npm run dev`
2. **Abrir Prisma Studio:** `npx prisma studio`
3. **Criar dados de teste:** `npm run db:seed`
4. **Copiar IDs reais** do Prisma Studio
5. **Fazer requisições** com os IDs reais
6. **Verificar mudanças** no Prisma Studio

---

## 📝 Status Codes HTTP

| Código | Significado | Descrição |
|--------|------------|-----------|
| 200 | OK | Requisição bem-sucedida |
| 201 | Created | Recurso criado com sucesso |
| 400 | Bad Request | Erro na entrada (validação) |
| 404 | Not Found | Recurso não encontrado |
| 500 | Internal Server Error | Erro no servidor |

---

## 🚨 Regras de Negócio Validadas

✅ Exemplar deve estar em estado `DISPONIVEL`  
✅ Leitor deve estar em estado `REGULAR` ou `INCOMPLETO`  
✅ Leitor não pode ter mais de 5 empréstimos simultâneos  
✅ Data de expiração = hoje + dias de empréstimo  
✅ Transação atômica: criar empréstimo + atualizar exemplar  

---

## 💡 Dicas

- Use `jq` para formatar JSON no terminal: `curl ... | jq '.'`
- Use Insomnia ou Postman para salvar requests reutilizáveis
- Use `prisma studio` para visualizar dados em tempo real
- Use `npm run dev` em um terminal separado para ver logs
- Use variáveis de ambiente no Postman para URLs dinâmicas
