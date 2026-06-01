#!/bin/bash

# Instalação Inicial do Projeto - Noite Estrelada Backend
# ======================================================
# Este script automatiza o setup inicial completo
# Uso: bash init.sh

set -e  # Exit on error

echo "================================"
echo "🚀 Noite Estrelada - Backend Setup"
echo "================================"
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. Verificar pré-requisitos
echo -e "${YELLOW}📋 Verificando pré-requisitos...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js não está instalado${NC}"
    echo "   Instale em: https://nodejs.org/"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker não está instalado${NC}"
    echo "   Instale em: https://www.docker.com/"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm não está instalado${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v)${NC}"
echo -e "${GREEN}✅ Docker instalado${NC}"
echo -e "${GREEN}✅ npm $(npm -v)${NC}"
echo ""

# 2. Instalar dependências
echo -e "${YELLOW}📦 Instalando dependências npm...${NC}"
npm install
echo -e "${GREEN}✅ Dependências instaladas${NC}"
echo ""

# 3. Configurar variáveis de ambiente
echo -e "${YELLOW}🔧 Configurando variáveis de ambiente...${NC}"
if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo -e "${GREEN}✅ .env.local criado${NC}"
else
    echo -e "${YELLOW}⚠️  .env.local já existe${NC}"
fi
echo ""

# 4. Verificar Docker Compose
echo -e "${YELLOW}🐳 Verificando Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}⚠️  docker-compose não encontrado, tentando docker compose...${NC}"
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi
echo ""

# 5. Parar containers antigos
echo -e "${YELLOW}🛑 Parando containers antigos...${NC}"
$DOCKER_COMPOSE down 2>/dev/null || true
echo ""

# 6. Iniciar PostgreSQL
echo -e "${YELLOW}🐘 Iniciando PostgreSQL...${NC}"
$DOCKER_COMPOSE up -d
echo -e "${GREEN}✅ PostgreSQL iniciado${NC}"

# Aguardar PostgreSQL ficar pronto
echo -e "${YELLOW}⏳ Aguardando PostgreSQL ficar pronto...${NC}"
sleep 5
echo ""

# 7. Gerar cliente Prisma
echo -e "${YELLOW}🔄 Gerando cliente Prisma...${NC}"
npx prisma generate
echo -e "${GREEN}✅ Cliente Prisma gerado${NC}"
echo ""

# 8. Sincronizar schema com banco
echo -e "${YELLOW}🗄️  Sincronizando schema com banco de dados...${NC}"
npx prisma db push --skip-generate
echo -e "${GREEN}✅ Schema sincronizado${NC}"
echo ""

# 9. Opcional: Seed do banco
echo -e "${YELLOW}🌱 Deseja popular o banco com dados de teste? (s/n)${NC}"
read -r -p "Resposta: " response
if [[ "$response" =~ ^([sS]|[yY]|yes|sim)$ ]]; then
    npm run db:seed
    echo -e "${GREEN}✅ Banco populado com dados de teste${NC}"
else
    echo -e "${YELLOW}⏭️  Pulando seed${NC}"
fi
echo ""

# 10. Resumo
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✅ Setup concluído com sucesso!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "📋 Próximos passos:"
echo ""
echo "   1️⃣  Iniciar servidor de desenvolvimento:"
echo -e "      ${YELLOW}npm run dev${NC}"
echo ""
echo "   2️⃣  Em outro terminal, abrir Prisma Studio:"
echo -e "      ${YELLOW}npx prisma studio${NC}"
echo ""
echo "   3️⃣  Testar API:"
echo -e "      ${YELLOW}curl -X POST http://localhost:3000/api/emprestimos \\${NC}"
echo -e "      ${YELLOW}  -H \"Content-Type: application/json\" \\${NC}"
echo -e "      ${YELLOW}  -d '{\"idLeitor\": \"...\", \"idExemplar\": \"...\"}'${NC}"
echo ""
echo "📚 Documentação:"
echo "   - README.md (visão geral)"
echo "   - QUICKSTART.md (setup rápido)"
echo "   - SETUP.md (setup detalhado)"
echo "   - ARQUITETURA.md (padrão de camadas)"
echo "   - EXEMPLOS-REQUISICOES.md (exemplos de API)"
echo ""
echo "🔗 Links úteis:"
echo "   - Next.js: https://nextjs.org/docs"
echo "   - Prisma: https://www.prisma.io/docs"
echo "   - PostgreSQL: https://www.postgresql.org/docs/"
echo ""
