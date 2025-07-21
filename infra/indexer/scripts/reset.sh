#!/bin/bash

# Reset script - removes all data and starts fresh
set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Change to the indexer directory (parent of scripts)
INDEXER_DIR="$(dirname "$SCRIPT_DIR")"
cd "$INDEXER_DIR"

echo "Working from: $(pwd)"
echo "WARNING: This will remove all indexed data!"
read -p "Are you sure you want to continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
fi

echo "Stopping all services (including orphans)..."
docker compose -f docker-compose.yml -f docker-compose.workers.yml down --remove-orphans

echo "Stopping any remaining containers with 'indexer-' prefix..."
docker ps -q --filter "name=indexer-*" | xargs -r docker stop

echo "Removing containers and volumes..."
docker compose -f docker-compose.yml -f docker-compose.workers.yml down -v --remove-orphans

echo "Removing any remaining containers with 'indexer-' prefix..."
docker ps -aq --filter "name=indexer-*" | xargs -r docker rm -f

echo "Pruning unused volumes..."
docker volume prune -f

echo "Starting fresh..."
./scripts/start.sh

echo "Reset complete!" 