# Quick Start - Setup em 5 Minutos

## 📋 Pré-requisitos
- Node.js 18+ instalado
- Docker e Docker Compose instalados
- npm ou yarn

## 🚀 Passos

### 1. Instalar dependências (1 min)
```bash
npm install
```

### 2. Configurar variáveis de ambiente (30 seg)
```bash
cp .env.example .env.local
```
Editar `.env.local` se necessário (padrões já estão corretos)

### 3. Iniciar PostgreSQL (1 min)
```bash
docker-compose up -d
```

Validar:
```bash
docker-compose ps
# Deve mostrar 'biblioteca_postgres' rodando
```

### 4. Setup do Banco (1 min)
```bash
npx prisma db push
npx prisma generate
```

### 5. Seed com dados de teste (opcional, 30 seg)
```bash
npm run db:seed
```

### 6. Iniciar servidor (30 seg)
```bash
npm run dev
```

Aguardar a mensagem:
```
▲ Next.js 15.0.0
- Local: http://localhost:3000
```

---

## ✅ Validar Setup

### 1. Acessar Prisma Studio (visualizar dados)
Em outro terminal:
```bash
npx prisma studio
```
Abrirá em http://localhost:5555

### 2. Testar endpoint de empréstimo
```bash
curl -X POST http://localhost:3000/api/emprestimos \
  -H "Content-Type: application/json" \
  -d '{
    "idLeitor": "seu-id-leitor",
    "idExemplar": "seu-id-exemplar"
  }'
```

---

## 🎯 Próximas Etapas

1. Criar leitores, publicações e exemplares em `prisma/seed.ts`
2. Rodar seed: `npm run db:seed`
3. Testar endpoints via cURL ou Postman
4. Implementar novos endpoints seguindo a mesma arquitetura

---

## 🆘 Troubleshooting Rápido

| Problema | Solução |
|----------|---------|
| "Cannot find module @/..." | Rodar `npm install` novamente |
| "Connection refused" PostgreSQL | `docker-compose up -d` |
| "Port 3000 already in use" | `npm run dev -- -p 3001` |
| "P1000 Authentication failed" | Verificar `DATABASE_URL` em `.env.local` |
| "Unique constraint violation" | Rodar `npx prisma migrate reset` |

---

## 📚 Documentação Completa

- [SETUP.md](./SETUP.md) - Setup detalhado com explicações
- [ARQUITETURA.md](./ARQUITETURA.md) - Padrão de camadas e GRASP
- [Prisma Docs](https://www.prisma.io/docs/) - ORM documentation
- [Next.js Docs](https://nextjs.org/docs) - Framework documentation
