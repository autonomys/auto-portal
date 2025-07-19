#!/bin/bash

# Stop all services
set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Change to the indexer directory (parent of scripts)
INDEXER_DIR="$(dirname "$SCRIPT_DIR")"
cd "$INDEXER_DIR"

echo "Working from: $(pwd)"
echo "Stopping Auto Portal services..."

docker compose -f docker-compose.yml -f docker-compose.workers.yml down

echo "All services stopped." 