# Local Deployment Guide

This guide walks you through setting up the complete Auto Portal stack locally, including the web frontend, staking indexer, worker, and all required infrastructure.

## Prerequisites

- **Node.js** ≥20.19.0
- **Yarn** ≥4.0.0
- **Docker** and **Docker Compose**
- **Git**

## Architecture Overview

The Auto Portal consists of:

- **Web Frontend** (`apps/web/`) - React application for staking interface
- **Staking Indexer** (`apps/indexers/staking/`) - SubQuery indexer for blockchain data
- **Staking Worker** (`apps/indexers/staking-worker/`) - Processes lazy conversions and aggregations
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
cd apps/indexers
yarn install
cd ../..
```

### 2. Set Up Environment Variables

Create environment files for the indexer infrastructure:

```bash
# Create indexer environment file
cp apps/indexers/.env.example apps/indexers/.env

# Edit the environment file with your settings
nano apps/indexers/.env
```

**Required Environment Variables:**

```bash
# Network Configuration
NETWORK_ENDPOINT=wss://rpc.taurus.autonomys.xyz/ws
NETWORK_DICTIONARY=https://dict.taurus.autonomys.xyz

# Database Configuration
DB_HOST=postgres-staking
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_DATABASE=staking

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379

# SubQuery Configuration
SUBQUERY_NODE_PORT=3000
SUBQUERY_QUERY_PORT=3001

# Worker Configuration
BATCH_SIZE=100
FINALITY_THRESHOLD=100
```

### 3. Start Infrastructure Services

```bash
cd apps/indexers

# Start all infrastructure services
docker-compose up -d postgres-staking pgcat-staking redis caddy

# Wait for services to be ready (30-60 seconds)
docker-compose logs -f postgres-staking
```

### 4. Initialize Database

```bash
# The database will be automatically initialized with the schema
# Check if it's ready
docker-compose exec postgres-staking psql -U postgres -d staking -c "\dt"
```

### 5. Start the Staking Indexer

```bash
# Build the indexer
yarn codegen
yarn build

# Start the indexer
docker-compose up -d staking-indexer

# Monitor indexer logs
docker-compose logs -f staking-indexer
```

### 6. Start the Staking Worker

```bash
# Start the worker
docker-compose up -d staking-worker

# Monitor worker logs
docker-compose logs -f staking-worker
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
- **SubQuery GraphQL Playground**: http://localhost:3001
- **Indexer Status**: http://localhost:3000
- **Node RPC (via Caddy)**: http://localhost:8000

## Development Workflow

### Making Changes to the Indexer

1. **Update code** in `apps/indexers/staking/src/`
2. **Rebuild**: `yarn build`
3. **Restart**: `docker-compose restart staking-indexer`

### Making Changes to the Worker

1. **Update code** in `apps/indexers/staking-worker/src/`
2. **Rebuild**: `yarn build`
3. **Restart**: `docker-compose restart staking-worker`

### Viewing Logs

```bash
cd apps/indexers

# View all service logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f staking-indexer
docker-compose logs -f staking-worker
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
docker-compose restart staking-indexer

# Check indexer logs
docker-compose logs -f staking-indexer
```

#### 3. Worker Not Processing

```bash
# Check worker logs
docker-compose logs -f staking-worker

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
lsof -i :3000  # SubQuery node
lsof -i :3001  # SubQuery query
lsof -i :5432  # PostgreSQL
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
docker-compose logs staking-indexer | grep "Processing block"

# Monitor memory usage
docker stats staking-indexer
```

## Data Reset

### Reset Everything

```bash
cd apps/indexers

# Stop all services
docker-compose down

# Remove all data
docker-compose down -v

# Remove Docker images (optional)
docker-compose down --rmi all

# Start fresh
docker-compose up -d
```

### Reset Only Database

```bash
# Stop services that use the database
docker-compose stop staking-indexer staking-worker

# Drop and recreate database
docker-compose exec postgres-staking psql -U postgres -c "DROP DATABASE IF EXISTS staking;"
docker-compose exec postgres-staking psql -U postgres -c "CREATE DATABASE staking;"

# Restart services (database will be re-initialized)
docker-compose restart postgres-staking
docker-compose start staking-indexer staking-worker
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
- **Worker**: Review the worker flow documentation in `apps/indexers/staking-worker/`
- **Frontend**: Standard React/Vite debugging practices
