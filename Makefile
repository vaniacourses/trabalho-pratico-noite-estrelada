.PHONY: help up down logs dev setup

help:
	@echo "Noite Estrelada - Makefile"
	@echo ""
	@echo "Comandos:"
	@echo "  make up          Inicia Docker (PostgreSQL)"
	@echo "  make down        Para Docker"
	@echo "  make logs        Ver logs do Docker"
	@echo "  make dev         Inicia servidor (dev)"
	@echo "  make setup       Setup completo"
	@echo ""

up:
	@docker-compose up -d
	@echo "✅ PostgreSQL iniciado"

down:
	@docker-compose down
	@echo "✅ PostgreSQL parado"

logs:
	@docker-compose logs -f

dev:
	@npm run dev

setup:
	@npm install
	@docker-compose up -d
	@npx prisma db push --skip-generate
	@npx prisma generate
	@npm run db:seed
	@echo "✅ Setup completo!"

.DEFAULT_GOAL := help
