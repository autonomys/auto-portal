#!/bin/bash

# Auto Portal Indexer Startup Script
# Usage: ./scripts/start.sh [--with-local-node]

set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Change to the indexer directory (parent of scripts)
INDEXER_DIR="$(dirname "$SCRIPT_DIR")"
# Get the auto-portal root directory (two levels up from indexer)
ROOT_DIR="$(dirname "$(dirname "$INDEXER_DIR")")"

cd "$INDEXER_DIR"
echo "Working from: $(pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if .env file exists
if [ ! -f .env ]; then
    print_warning ".env file not found. Creating from .env.example..."
    cp .env.example .env
    print_info "Please edit .env file with your configuration before running again."
    print_info ""
    print_info "💡 Quick setup options:"
    print_info "  • For Taurus testnet (recommended): Use .env as-is"
    print_info "  • For local development: Uncomment the local node section in .env"
    exit 1
fi

# Parse command line arguments
WITH_LOCAL_NODE=false
PROFILES=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --with-local-node)
            WITH_LOCAL_NODE=true
            shift
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Usage: $0 [--with-local-node]"
            exit 1
            ;;
    esac
done

# Set up profiles based on options
if [ "$WITH_LOCAL_NODE" = true ]; then
    PROFILES="--profile local-node --profile indexers --profile task"
    print_info "Starting with local node (${NETWORK_ID:-dev} network), indexers, and workers..."
else
    PROFILES="--profile indexers --profile task"
    print_info "Starting with external RPC connection, indexers, and workers..."
fi

# Generate project.yaml for SubQuery
print_info "Generating SubQuery project configuration..."
cd "$ROOT_DIR/packages/staking-indexer"
npm run codegen
cd "$INDEXER_DIR"

# Start the services
print_info "Starting Auto Portal indexer infrastructure..."
if [ "$WITH_LOCAL_NODE" = true ]; then
    docker compose -f docker-compose.yml -f docker-compose.workers.yml --profile local-node --profile indexers --profile task up -d
else
    docker compose -f docker-compose.yml -f docker-compose.workers.yml --profile indexers --profile task up -d
fi

# Check if services are healthy
print_info "Waiting for services to become healthy..."
sleep 10

# Check service status
print_info "Checking service status..."

if [ "$WITH_LOCAL_NODE" = true ]; then
    if docker compose ps | grep -q "node.*Up.*healthy"; then
        print_success "Local node is running and healthy"
    else
        print_warning "Local node may not be healthy yet, check logs with: docker compose logs node"
    fi
fi

if docker compose ps | grep -q "postgres-staking.*Up.*healthy"; then
    print_success "PostgreSQL is running and healthy"
else
    print_warning "PostgreSQL may not be healthy yet"
fi

if docker compose ps | grep -q "caddy.*Up"; then
    print_success "Caddy reverse proxy is running"
else
    print_warning "Caddy may not be running properly"
fi

if docker compose -f docker-compose.yml -f docker-compose.workers.yml ps | grep -q "staking_subquery_node.*Up"; then
    print_success "SubQuery indexer is running"
else
    print_warning "SubQuery indexer may not be running properly"
fi

print_success "Auto Portal indexer started successfully!"
print_info ""
print_info "📊 Access points:"
print_info "  • Node RPC (via Caddy): http://localhost:8000"
print_info "  • PostgreSQL: localhost:5433"
print_info "  • SubQuery status: http://localhost:3003"
print_info ""
print_info "📝 Useful commands:"
print_info "  • View all logs: docker compose -f docker-compose.yml -f docker-compose.workers.yml logs -f"
print_info "  • View specific service logs: docker compose logs -f <service-name>"
print_info "  • Stop services: ./scripts/stop.sh"
print_info ""

if [ "$WITH_LOCAL_NODE" = false ]; then
    print_info "🌐 Using Taurus testnet via: $(grep UPSTREAM_NODE .env | cut -d'=' -f2)"
fi 