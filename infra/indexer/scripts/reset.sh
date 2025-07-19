#!/bin/bash

# Reset script - removes all data and starts fresh
set -e

echo "WARNING: This will remove all indexed data!"
read -p "Are you sure you want to continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
fi

echo "Stopping all services..."
docker compose -f docker-compose.yml -f docker-compose.workers.yml down

echo "Removing volumes..."
docker compose down -v

echo "Starting fresh..."
./scripts/start.sh

echo "Reset complete!" 