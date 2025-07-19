# Auto Portal Infrastructure

This directory contains all infrastructure-related configuration and deployment files for the Auto Portal project.

## Directory Structure

```
infra/
├── indexer/                    # Staking indexer infrastructure
│   ├── db/                    # PostgreSQL database configuration
│   ├── scripts/               # Helper scripts (start.sh, stop.sh, reset.sh)
│   ├── .env.example           # Environment variables template
│   ├── Caddyfile              # Reverse proxy configuration
│   ├── docker-compose.yml     # Main service orchestration
│   ├── docker-compose.workers.yml  # Worker service definitions
│   ├── DEPLOYMENT.md          # Deployment instructions
│   └── README.md              # Indexer infrastructure guide
└── README.md                  # This file
```

## Components

### Indexer Infrastructure (`indexer/`)

The indexer infrastructure supports the blockchain data indexing system with flexible network connectivity:

#### **Core Services:**

- **Caddy Reverse Proxy**: CORS-enabled RPC gateway to blockchain networks
- **PostgreSQL Database**: Stores indexed blockchain data with connection pooling (PgCat)
- **Redis**: Queue management and task coordination
- **SubQuery Node**: Indexes staking events and operator data
- **Staking Worker**: Processes background tasks and data aggregation

#### **Network Options:**

- **External Networks**: Connect to Taurus testnet or Mainnet via public RPC
- **Local Node** (optional): Run local Autonomys development node

## Quick Start

```bash
# Navigate to indexer infrastructure
cd infra/indexer

# Copy and configure environment
cp .env.example .env
# Edit .env to choose network (Taurus testnet recommended)

# Start with external testnet (default)
./scripts/start.sh

# OR start with local development node
./scripts/start.sh --with-local-node

# View logs
docker compose -f docker-compose.yml -f docker-compose.workers.yml logs -f

# Stop all services
./scripts/stop.sh

# Reset and start fresh (removes all data)
./scripts/reset.sh
```

## Docker Compose Profiles

The infrastructure uses profiles for optional services:

- **Base services**: Caddy, PostgreSQL, PgCat (always run)
- **`local-node` profile**: Optional local Autonomys node
- **`indexers` profile**: SubQuery node for blockchain indexing
- **`task` profile**: Redis and worker services

## Network Configuration

### **Taurus Testnet (Recommended)**

```bash
# In .env file:
NETWORK_ID=taurus
UPSTREAM_NODE=https://rpc.taurus.autonomys.xyz
RPC_URLS=wss://rpc.taurus.autonomys.xyz/ws
```

### **Local Development**

```bash
# In .env file (uncomment local section):
NETWORK_ID=dev
UPSTREAM_NODE=node:9944
RPC_URLS=ws://node:9944
```

## Access Points

When running:

- **Node RPC**: `http://localhost:8000` (via Caddy proxy)
- **Database**: `postgresql://postgres:postgres@localhost:5433/staking`
- **SubQuery Status**: `http://localhost:3003`
- **Redis**: `redis://localhost:6379`

## Related Documentation

- [Indexer Infrastructure README](./indexer/README.md) - Detailed setup guide
- [Indexer Deployment Guide](./indexer/DEPLOYMENT.md) - Production deployment
- [Staking Indexer Package](../packages/staking-indexer/README.md) - SubQuery project
- [Staking Worker Package](../packages/staking-worker/README.md) - Background worker

## Troubleshooting

### **Common Issues:**

- **SubQuery node fails**: Run `./scripts/reset.sh` to clean database
- **Connection refused**: Check if services are healthy with `docker compose ps`
- **Database issues**: Verify PostgreSQL is running: `docker compose logs postgres-staking`

### **Chain ID Mismatch:**

If switching networks, always reset the database:

```bash
./scripts/reset.sh
```

## Future Infrastructure

As the project grows, additional infrastructure directories may be added:

- `web/` - Web frontend deployment (Vercel, CDN, etc.)
- `monitoring/` - Logging and monitoring stack (Prometheus, Grafana)
- `ci/` - Continuous integration configuration
