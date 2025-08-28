# Auto Portal Staking Infrastructure Makefile
# Provides convenient commands for managing the staking stack

# Colors for output
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[1;33m
BLUE := \033[0;34m
NC := \033[0m # No Color

# Default target
.DEFAULT_GOAL := help

# Environment file selection (defaults to .env).
# Options:
#  - `make start ENV_FILE=.env.mainnet.example`
#  - `make start ENV=mainnet` (auto-resolves to .env.mainnet or .env.mainnet.example)
ENV_FILE ?= .env
ENV ?=

# Help target
.PHONY: help
help: ## Show this help message
	@echo "$(BLUE)Auto Portal Staking Infrastructure$(NC)"
	@echo ""
	@echo "$(YELLOW)Available commands:$(NC)"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  $(GREEN)%-12s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# Setup target
.PHONY: setup
setup: ## First-time setup (copy .env.example if needed)
	@echo "$(BLUE)Setting up staking infrastructure...$(NC)"
	@if [ ! -f .env ]; then \
		echo "$(YELLOW)Creating .env from .env.example...$(NC)"; \
		cp .env.example .env; \
		echo "$(GREEN)✅ .env file created$(NC)"; \
		echo "$(YELLOW)⚠️  Please review and configure .env before starting services$(NC)"; \
	else \
		echo "$(GREEN)✅ .env file already exists$(NC)"; \
	fi
	@# Determine env file for build based on ENV/ENV_FILE
	@FILE=$(ENV_FILE); \
	if [ "$$FILE" = ".env" ] && [ -n "$(ENV)" ]; then \
		if [ -f ".env.$(ENV)" ]; then FILE=".env.$(ENV)"; \
		elif [ -f ".env.$(ENV).example" ]; then FILE=".env.$(ENV).example"; fi; \
	fi; \
	if [ ! -f "$$FILE" ] && [ -f .env ]; then FILE=.env; fi; \
	echo "$(YELLOW)Building staking-indexer manifest with env file: $(BLUE)$$FILE$(NC)"; \
	set -a; if [ -f "$$FILE" ]; then . "./$$FILE"; else echo "$(RED)Env file not found: $$FILE$(NC)" >&2; fi; set +a; \
	cd ../../services/staking-indexer && yarn build --silent && echo "$(GREEN)✅ SubQuery project.yaml built$(NC)"
	@echo "$(YELLOW)💡 Quick setup options:$(NC)"
	@echo "  • For Mainnet: Use .env (default) or .env.mainnet.example"
	@echo "  • For local development: Adjust NETWORK_ID=dev and RPC_URLS in .env"

# Start target (with optional profiles)
.PHONY: start
start: setup ## Start services (use 'make start PROFILES=local-node' or ENV=[mainnet|dev])
	@echo "$(BLUE)Starting staking services...$(NC)"
	@# Resolve env file from ENV if ENV_FILE is default .env
	@FILE=$(ENV_FILE); \
	if [ "$$FILE" = ".env" ] && [ -n "$(ENV)" ]; then \
		if [ -f ".env.$(ENV)" ]; then FILE=".env.$(ENV)"; \
		elif [ -f ".env.$(ENV).example" ]; then FILE=".env.$(ENV).example"; fi; \
	fi; \
	echo "Using env file: $(YELLOW)$$FILE$(NC)"; \
	if [ -n "$(PROFILES)" ]; then \
		echo "$(YELLOW)Starting with profiles: $(PROFILES)$(NC)"; \
		docker compose --env-file $$FILE --profile $(PROFILES) up -d; \
	else \
		echo "$(YELLOW)Starting with default services$(NC)"; \
		docker compose --env-file $$FILE up -d; \
	fi
	@echo "$(GREEN)✅ Services started$(NC)"
	@echo "$(BLUE)Waiting for services to be ready...$(NC)"
	@sleep 5
	@echo "$(YELLOW)💡 Next: apply Hasura metadata with: make hasura-restart$(NC)"
	@echo "$(YELLOW)💡 Check status with: make status$(NC)"

# Start with local node (convenience target)
.PHONY: start-local
start-local: setup ## Start services with local blockchain node (use ENV=dev or ENV_FILE=.env.dev.example)
	@echo "$(BLUE)Starting staking services with local node...$(NC)"
	@FILE=$(ENV_FILE); \
	if [ "$$FILE" = ".env" ] && [ -n "$(ENV)" ]; then \
		if [ -f ".env.$(ENV)" ]; then FILE=".env.$(ENV)"; \
		elif [ -f ".env.$(ENV).example" ]; then FILE=".env.$(ENV).example"; fi; \
	fi; \
	echo "Using env file: $(YELLOW)$$FILE$(NC)"; \
	docker compose --env-file $$FILE --profile local-node up -d
	@echo "$(GREEN)✅ Services started with local node$(NC)"
	@echo "$(BLUE)Waiting for services to be ready...$(NC)"
	@sleep 5
	@echo "$(YELLOW)💡 Next: apply Hasura metadata with: make hasura-restart$(NC)"

# Stop target
.PHONY: stop
stop: ## Stop all services
	@echo "$(BLUE)Stopping staking services...$(NC)"
	@docker compose down
	@echo "$(GREEN)✅ Services stopped$(NC)"

# Logs target
.PHONY: logs
logs: ## View logs (use 'make logs SERVICE=service-name' for specific service)
	@if [ -n "$(SERVICE)" ]; then \
		echo "$(BLUE)Viewing logs for $(SERVICE)...$(NC)"; \
		docker compose logs -f $(SERVICE); \
	else \
		echo "$(BLUE)Viewing all service logs...$(NC)"; \
		docker compose logs -f; \
	fi

# Status target
.PHONY: status
status: ## Check service health and status
	@echo ""
	@echo "$(BLUE)🚀 Auto Portal Staking Status$(NC)"
	@echo ""
	@docker compose ps --format "table {{.Name}}\t{{.State}}\t{{.Status}}"
	@echo ""

# Reset target
.PHONY: reset
reset: ## Reset DB/Redis data (node data is preserved)
	@echo "$(RED)⚠️  WARNING: This will delete ALL data and volumes!$(NC)"
	@echo "$(YELLOW)Are you sure? [y/N]$(NC)"; \
	read -r response; \
	if [ "$$response" = "y" ] || [ "$$response" = "Y" ]; then \
		echo "$(BLUE)Stopping services...$(NC)"; \
		docker compose down; \
		echo "$(BLUE)Removing DB and Redis volumes (preserving node data)...$(NC)"; \
		docker volume rm -f staking_postgres_staking_db staking_redis_db 2>/dev/null || true; \
		echo "$(BLUE)Cleaning Hasura metadata...$(NC)"; \
		rm -rf hasura/metadata/databases 2>/dev/null || true; \
		echo "$(GREEN)✅ All data reset$(NC)"; \
	else \
		echo "$(YELLOW)Reset cancelled$(NC)"; \
	fi

# Build target
.PHONY: build
build: ## Build/rebuild services (useful after code changes)
	@echo "$(BLUE)Building services...$(NC)"
	@docker compose build --no-cache
	@echo "$(GREEN)✅ Services built$(NC)"

# Access points info
.PHONY: info
info: ## Show access points and useful information
	@echo "$(BLUE)Auto Portal Staking Infrastructure$(NC)"
	@echo ""
	@echo "$(YELLOW)📊 Access points:$(NC)"
	@FILE=$(ENV_FILE); \
	if [ "$$FILE" = ".env" ] && [ -n "$(ENV)" ]; then \
		if [ -f ".env.$(ENV)" ]; then FILE=".env.$(ENV)"; \
		elif [ -f ".env.$(ENV).example" ]; then FILE=".env.$(ENV).example"; fi; \
	fi; \
	if [ ! -f "$$FILE" ] && [ -f .env ]; then FILE=.env; fi; \
	if [ -f "$$FILE" ]; then \
		DB_PORT=$$(grep STAKING_DB_EXTERNAL_PORT $$FILE | cut -d'=' -f2 | head -1); \
		REDIS_PORT=$$(grep REDIS_PORT $$FILE | cut -d'=' -f2 | head -1); \
		HASURA_PORT=$$(grep HASURA_GRAPHQL_PORT $$FILE | cut -d'=' -f2 | head -1); \
		echo "  • PostgreSQL: localhost:$${DB_PORT:-5432}"; \
		echo "  • SubQuery status: http://localhost:3003"; \
		echo "  • Redis: localhost:$${REDIS_PORT:-6379}"; \
		echo "  • Hasura GraphQL: http://localhost:$${HASURA_PORT:-8080}"; \
		echo "  • Hasura Console: http://localhost:$${HASURA_PORT:-8080}/console"; \
	else \
		echo "  • PostgreSQL: localhost:5432 (default)"; \
		echo "  • SubQuery status: http://localhost:3003"; \
		echo "  • Redis: localhost:6379 (default)"; \
		echo "  • Hasura GraphQL: http://localhost:8080 (default)"; \
		echo "  • Hasura Console: http://localhost:8080/console (default)"; \
		echo "  $(YELLOW)💡 Run 'make setup' to create .env file$(NC)"; \
	fi
	@echo ""
	@echo "$(YELLOW)📝 Useful commands:$(NC)"
	@echo "  • View specific logs: make logs SERVICE=postgres-staking"
	@echo "  • Start with local node: make start-local"
	@echo "  • Check service health: make status"
	@echo "  • Reset all data: make reset"

# Development helpers
.PHONY: restart
restart: stop start ## Restart all services

.PHONY: rebuild
rebuild: stop build start ## Stop, rebuild, and start services

# Hasura setup
.PHONY: generate-secret
generate-secret: ## Generate a secure Hasura admin secret for production
	@echo "$(BLUE)Generating secure Hasura admin secret...$(NC)"
	@openssl rand -hex 32 2>/dev/null || echo "Please install openssl to generate secure secrets"
	@echo "$(YELLOW)💡 Add this to your .env file as HASURA_GRAPHQL_ADMIN_SECRET$(NC)"

# New: Hasura metadata management
.PHONY: hasura-apply
hasura-apply: ## Apply Hasura metadata from ./hasura/metadata to the running instance
	@if docker compose ps | grep -q "hasura.*Up"; then \
		echo "$(BLUE)Applying Hasura metadata...$(NC)"; \
		docker compose exec hasura sh -lc 'set -e; if command -v hasura-cli >/dev/null 2>&1; then CLI=hasura-cli; elif command -v hasura >/dev/null 2>&1; then CLI=hasura; else echo "hasura CLI not found" >&2; exit 1; fi; $$CLI metadata apply --endpoint http://localhost:8080 --admin-secret "$$HASURA_GRAPHQL_ADMIN_SECRET" --metadata-dir /hasura-metadata'; \
		echo "$(GREEN)✅ Metadata applied$(NC)"; \
	else \
		echo "$(YELLOW)⚠️  Hasura is not running. Start services with: make start$(NC)"; \
		exit 1; \
	fi

.PHONY: hasura-reload
hasura-reload: ## Reload Hasura metadata (refresh caches; does not re-read files)
	@FILE=$(ENV_FILE); \
	if [ "$$FILE" = ".env" ] && [ -n "$(ENV)" ]; then \
		if [ -f ".env.$(ENV)" ]; then FILE=".env.$(ENV)"; \
		elif [ -f ".env.$(ENV).example" ]; then FILE=".env.$(ENV).example"; fi; \
	fi; \
	if [ ! -f "$$FILE" ] && [ -f .env ]; then FILE=.env; fi; \
	HASURA_PORT=$$(grep HASURA_GRAPHQL_PORT $$FILE | cut -d'=' -f2 | head -1); \
	ADMIN_SECRET=$$(grep HASURA_GRAPHQL_ADMIN_SECRET $$FILE | cut -d'=' -f2 | head -1); \
	ADMIN_SECRET=$${ADMIN_SECRET:-devsecret}; \
	echo "$(BLUE)Reloading Hasura metadata...$(NC)"; \
	curl -sS -X POST http://localhost:$${HASURA_PORT:-8080}/v1/metadata \
	  -H 'Content-Type: application/json' \
	  -H "x-hasura-admin-secret: $$ADMIN_SECRET" \
	  -d '{"type":"reload_metadata","args":{"reload_remote_schemas":true,"reload_sources":true}}' | cat; \
	echo "\n$(GREEN)✅ Metadata reloaded$(NC)"

.PHONY: hasura-restart
hasura-restart: ## Restart Hasura container (re-applies metadata on boot via cli-migrations)
	@if docker compose ps | grep -q "hasura.*Up"; then \
		echo "$(BLUE)Restarting Hasura...$(NC)"; \
		docker compose restart hasura; \
		echo "$(GREEN)✅ Hasura restarted$(NC)"; \
	else \
		echo "$(YELLOW)⚠️  Hasura is not running. Start services with: make start$(NC)"; \
	fi

# Convenience targets
.PHONY: start-mainnet start-dev
start-mainnet: ## Start services using .env.mainnet or .env.mainnet.example
	@$(MAKE) start ENV=mainnet

start-dev: ## Start services with local node using .env.dev or .env.dev.example
	@$(MAKE) start-local ENV=dev