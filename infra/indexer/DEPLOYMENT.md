cd # Local Deployment Guide

This guide walks you through setting up the complete Auto Portal stack locally, including the web frontend, staking indexer, worker, and all required infrastructure.

## Prerequisites

- **Node.js** ≥20.19.0
- **Yarn** ≥4.0.0
- **Docker** and **Docker Compose**
- **Git**

## Architecture Overview

The Auto Portal consists of:

- **Web Frontend** (`apps/web/`) - React application for staking interface
- **Staking Indexer** (`packages/staking-indexer/`) - SubQuery indexer for blockchain data
- **Staking Worker** (`packages/staking-worker/`) - Processes lazy conversions and aggregations
- **Infrastructure** - PostgreSQL, Redis, PgCat proxy, Caddy reverse proxy

## Quick Start

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone https://github.com/jfrank-summit/auto-portal.git
cd auto-portal

# Install web app dependencies
yarn install

# Install indexer dependencies
cd packages/staking-indexer
yarn install
cd ../staking-worker
yarn install
cd ../..
```

### 2. Set Up Environment Variables

Create environment files for the indexer infrastructure:

```bash
# Create indexer environment file
cp infra/indexer/.env.example infra/indexer/.env

# Edit the environment file with your settings
nano infra/indexer/.env
```

**Required Environment Variables:**

```bash
# Network Configuration
NETWORK_ENDPOINT=wss://rpc.taurus.autonomys.xyz/ws
NETWORK_DICTIONARY=https://dict.taurus.autonomys.xyz
NODE_DOCKER_TAG=latest
NETWORK_ID=taurus
CHAIN_ID=0x...  # Get from network

# RPC URLs (comma-separated for multiple endpoints)
RPC_URLS=wss://rpc.taurus.autonomys.xyz/ws

# Database Configuration
STAKING_DB_HOST=postgres-staking
STAKING_DB_PORT=5433
STAKING_DB_USER=postgres
STAKING_DB_PASSWORD=postgres
STAKING_DB_DATABASE=staking
STAKING_INTERNAL_PORT=5432

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_SERVICE_HOST=redis
REDIS_SERVICE_PORT=6379

# SubQuery Configuration
START_BLOCK_STAKING=1

# Worker Configuration
BATCH_SIZE=100
FINALITY_THRESHOLD=100
```

### 3. Build the Indexer and Worker

```bash
# Build the staking indexer
cd packages/staking-indexer
yarn codegen
yarn build
cd ../..

# Build the staking worker
cd packages/staking-worker
yarn build
cd ../..
```

### 4. Start Infrastructure Services

```bash
cd infra/indexer

# Start base infrastructure services (without profiles)
docker-compose up -d postgres-staking pgcat-staking caddy node

# Wait for services to be ready (30-60 seconds)
docker-compose logs -f postgres-staking
```

### 5. Initialize Database

```bash
# The database will be automatically initialized with the schema
# Check if it's ready
docker-compose exec postgres-staking psql -U postgres -d staking -c "\dt"
```

### 6. Start the Staking Indexer and Worker

```bash
# Start all indexer components (redis, indexer, and worker)
docker-compose -f docker-compose.yml -f docker-compose.workers.yml --profile task --profile indexers up -d

# Monitor indexer logs
docker-compose logs -f staking_subquery_node

# Monitor worker logs
docker-compose -f docker-compose.yml -f docker-compose.workers.yml logs -f staking-worker
```

### 7. Start the Web Frontend

```bash
# In a new terminal, go back to project root
cd ../../

# Start the web app
yarn dev
```

## Accessing the Application

- **Web Frontend**: http://localhost:5173
- **SubQuery Status**: http://localhost:3003
- **Node RPC (via Caddy)**: http://localhost:8000

## Development Workflow

### Making Changes to the Indexer

1. **Update code** in `packages/staking-indexer/src/`
2. **Rebuild**: `yarn codegen && yarn build`
3. **Restart**: `docker-compose restart staking_subquery_node`

### Making Changes to the Worker

1. **Update code** in `packages/staking-worker/src/`
2. **Rebuild**: `yarn build`
3. **Restart**: `docker-compose -f docker-compose.yml -f docker-compose.workers.yml restart staking-worker`

### Viewing Logs

```bash
cd infra/indexer

# View all service logs
docker-compose -f docker-compose.yml -f docker-compose.workers.yml logs -f

# View specific service logs
docker-compose logs -f staking_subquery_node
docker-compose -f docker-compose.yml -f docker-compose.workers.yml logs -f staking-worker
docker-compose logs -f postgres-staking
```

### Database Access

```bash
# Connect to PostgreSQL
docker-compose exec postgres-staking psql -U postgres -d staking

# View tables
\dt

# Query nominator data
SELECT * FROM staking.nominators LIMIT 10;

# View indexer progress
SELECT * FROM staking._metadata WHERE key = 'lastProcessedHeight';
```

### Redis Access

```bash
# Connect to Redis
docker-compose exec redis redis-cli

# View keys
KEYS *

# Check chain tip
GET chain:tip
```

## Docker Compose Profiles

The infrastructure uses Docker Compose profiles to organize services:

- **No profile**: Base services (postgres, pgcat, caddy, node)
- **`task` profile**: Redis and task queue services
- **`indexers` profile**: SubQuery indexer and worker services

### Running with Profiles

```bash
# Start only base services
docker-compose up -d

# Start with task services
docker-compose --profile task up -d

# Start with indexer services
docker-compose --profile indexers up -d

# Start everything
docker-compose -f docker-compose.yml -f docker-compose.workers.yml --profile task --profile indexers up -d
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors

```bash
# Check if PostgreSQL is running
docker-compose ps postgres-staking

# Restart database
docker-compose restart postgres-staking

# Check logs
docker-compose logs postgres-staking
```

#### 2. Indexer Not Syncing

```bash
# Check node connection
curl http://localhost:8000/health

# Restart indexer
docker-compose restart staking_subquery_node

# Check indexer logs
docker-compose logs -f staking_subquery_node

# Check indexer status
curl http://localhost:3003/ready
```

#### 3. Worker Not Processing

```bash
# Check worker logs
docker-compose -f docker-compose.yml -f docker-compose.workers.yml logs -f staking-worker

# Verify Redis connection
docker-compose exec redis redis-cli ping

# Check for unprocessed tasks
docker-compose exec postgres-staking psql -U postgres -d staking -c "
SELECT
  'deposits' as type, COUNT(*)
FROM staking.nominator_deposits
WHERE processed = false
UNION ALL
SELECT
  'withdrawals' as type, COUNT(*)
FROM staking.nominator_withdrawals
WHERE processed = false;
"
```

#### 4. Port Conflicts

If ports are already in use:

```bash
# Check what's using the ports
lsof -i :5173  # Web frontend
lsof -i :3003  # SubQuery node
lsof -i :5433  # PostgreSQL
lsof -i :6379  # Redis

# Stop conflicting services or change ports in docker-compose.yml
```

### Performance Tuning

#### Database Performance

```bash
# Monitor database performance
docker-compose exec postgres-staking psql -U postgres -d staking -c "
SELECT
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats
WHERE schemaname = 'staking'
ORDER BY tablename, attname;
"
```

#### Indexer Performance

```bash
# Check indexer block processing rate
docker-compose logs staking_subquery_node | grep "Processing block"

# Monitor memory usage
docker stats staking_subquery_node
```

## Data Reset

### Reset Everything

```bash
cd infra/indexer

# Stop all services
docker-compose -f docker-compose.yml -f docker-compose.workers.yml down

# Remove all data
docker-compose down -v

# Remove Docker images (optional)
docker-compose down --rmi all

# Start fresh
docker-compose -f docker-compose.yml -f docker-compose.workers.yml --profile task --profile indexers up -d
```

### Reset Only Database

```bash
# Stop services that use the database
docker-compose stop staking_subquery_node
docker-compose -f docker-compose.yml -f docker-compose.workers.yml stop staking-worker

# Drop and recreate database
docker-compose exec postgres-staking psql -U postgres -c "DROP DATABASE IF EXISTS staking;"
docker-compose exec postgres-staking psql -U postgres -c "CREATE DATABASE staking;"

# Restart services (database will be re-initialized)
docker-compose restart postgres-staking
docker-compose start staking_subquery_node
docker-compose -f docker-compose.yml -f docker-compose.workers.yml start staking-worker
```

## Production Considerations

This local setup is for development only. For production deployment:

1. **Use external PostgreSQL** with proper backup and monitoring
2. **Configure Redis persistence** and clustering
3. **Set up load balancing** for multiple indexer instances
4. **Implement proper logging** and monitoring
5. **Use SSL/TLS** for all connections
6. **Configure proper firewall** rules
7. **Set up automated backups** for the database

## Getting Help

- Check logs: `docker-compose logs -f [service-name]`
- Verify services: `docker-compose ps`
- Test connections: Use the health check endpoints
- Reset state: Follow the data reset procedures above

For issues specific to:

- **Indexer**: Check SubQuery documentation
- **Worker**: Review the worker flow documentation in `packages/staking-worker/`
- **Frontend**: Standard React/Vite debugging practices
