#!/bin/bash

# Stop all services
echo "Stopping Auto Portal services..."

docker-compose -f docker-compose.yml -f docker-compose.workers.yml down

echo "All services stopped." 