# Auto Portal Indexer Infrastructure

This directory contains the Docker Compose setup for the Auto Portal staking indexer infrastructure, supporting both local development nodes and external testnet connections.

## Features

- **Flexible Node Configuration**: Choose between local development node or external testnet
- **SubQuery Indexing**: Indexes staking events and operator data
- **PostgreSQL Storage**: Persistent database with connection pooling
- **Redis Task Queue**: For background worker processing
- **Caddy Reverse Proxy**: CORS-enabled RPC access

## Quick Start

### 1. Configuration

```bash
# Copy and edit the environment file
cp .env.example .env
# Edit .env with your preferred configuration
```

### 2. Start Services

**Default (Taurus Testnet):**

```bash
./scripts/start.sh
```

**With Local Development Node:**

```bash
./scripts/start.sh --with-local-node
```

## Configuration Options

### Environment Files

- `.env.example` - Template with both local and testnet configurations
- Edit `.env` to choose your setup:
  - **Taurus Testnet**: Uses `UPSTREAM_NODE=rpc.taurus.autonomys.xyz`
  - **Local Node**: Uses `UPSTREAM_NODE=node:9944`

### Docker Compose Profiles

The setup uses Docker Compose profiles to make services optional:

- **No profiles** (default): Core services only (Caddy, PostgreSQL, PgCat)
- **`local-node`**: Includes local Autonomys development node
- **`indexers`**: Includes SubQuery indexing services
- **`task`**: Includes Redis and worker services

## Service Architecture

```mermaid
graph TD
    A[Web Frontend] --> B[Caddy :8000]
    B --> C{Node Type}
    C -->|Local| D[Local Node :9944]
    C -->|External| E[Taurus RPC]

    F[SubQuery Indexer] --> G[PostgreSQL :5433]
    F --> C
    H[Staking Worker] --> I[Redis :6379]
    H --> G

    J[PgCat Proxy] --> G
    F --> J
```

## Available Services

| Service    | Port | Description            | Profile      |
| ---------- | ---- | ---------------------- | ------------ |
| Caddy      | 8000 | RPC Reverse Proxy      | Always       |
| Node       | 9944 | Local Development Node | `local-node` |
| PostgreSQL | 5433 | Database               | Always       |
| PgCat      | 6433 | Connection Pooler      | Always       |
| SubQuery   | 3003 | Indexer Status         | `indexers`   |
| Redis      | 6379 | Task Queue             | `task`       |

## Access Points

- **Node RPC**: `http://localhost:8000` (via Caddy)
- **Database**: `postgresql://postgres:postgres@localhost:5433/staking`
- **SubQuery Status**: `http://localhost:3003`
- **Redis**: `redis://localhost:6379`

## Common Commands

```bash
# Start with Taurus testnet (recommended)
./scripts/start.sh

# Start with local development node
./scripts/start.sh --with-local-node

# View all logs
docker compose -f docker-compose.yml -f docker-compose.workers.yml logs -f

# View specific service logs
docker compose logs -f staking_subquery_node
docker compose logs -f caddy

# Stop all services
./scripts/stop.sh

# Reset database and restart
./scripts/reset.sh
```

## Development Notes

### Local vs External Node

**Local Node (`--with-local-node`):**

- Runs Autonomys node in development mode
- Faster for testing indexer logic
- No external dependencies
- Limited to development chain

**External Node (default):**

- Connects to Taurus testnet
- Real network data
- No local node resource usage
- Requires internet connection

### Environment Variables

Key configuration variables in `.env`:

```bash
# Network Configuration
UPSTREAM_NODE=rpc.taurus.autonomys.xyz  # or node:9944 for local
RPC_URLS=wss://rpc.taurus.autonomys.xyz/ws
CHAIN_ID=0x295aeafca762a304d92ee1505548695091f6082d3f0aa4d092ac3cd6397a6c5e

# Starting Block (adjust based on your needs)
START_BLOCK_STAKING=3250000

# Database
STAKING_DB_DATABASE=staking
STAKING_DB_USER=postgres
STAKING_DB_PASSWORD=postgres
```

## Troubleshooting

### SubQuery Node Issues

```bash
# Check indexer status
curl http://localhost:3003/health

# View detailed logs
docker compose logs -f staking_subquery_node
```

### Database Issues

```bash
# Check database connection
docker compose exec postgres-staking pg_isready -U postgres

# Access database directly
docker compose exec postgres-staking psql -U postgres -d staking
```

### Network Issues

```bash
# Test RPC connection
curl -H "Content-Type: application/json" \
  -d '{"id":1, "jsonrpc":"2.0", "method": "system_health", "params":[]}' \
  http://localhost:8000
```

For more detailed deployment information, see [DEPLOYMENT.md](./DEPLOYMENT.md).
