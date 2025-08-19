# Auto Portal Infrastructure

This directory contains all infrastructure-related configuration and deployment files for the Auto Portal project.

## Directory Structure

```
infra/
├── indexer/                    # Staking indexer infrastructure
│   ├── db/                    # PostgreSQL database configuration
│   ├── scripts/               # Helper scripts (start.sh, stop.sh, reset.sh)
│   ├── .env.example           # Environment variables template

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

- **PostgreSQL Database**: Stores indexed blockchain data with connection pooling (PgCat)
- **Redis**: Queue management and task coordination
- **SubQuery Node**: Indexes staking events and operator data
- **Staking Worker**: Processes background tasks and data aggregation
- **Hasura GraphQL**: Production-compatible GraphQL API layer

#### **Network Options:**

- **External Network**: Connect to Mainnet via public RPC
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

- **Default services**: PostgreSQL, PgCat, Redis, SubQuery indexer, Staking worker (always run)
- **`local-node` profile**: Optional local Autonomys node for development

## Network Configuration

### **Local Development**

```bash
# In .env file (uncomment local section):
NETWORK_ID=dev
RPC_URLS=ws://node:9944
```

## Access Points

When running:

- **Local Node RPC**: `http://localhost:9944` (when using local-node profile)
- **Database**: `postgresql://postgres:postgres@localhost:5433/staking`
- **SubQuery Status**: `http://localhost:3003`
- **Redis**: `redis://localhost:6379`
- **Hasura GraphQL**: `http://localhost:8080/v1/graphql`
- **Hasura Console**: `http://localhost:8080/console`

## Related Documentation

- [Indexer Infrastructure README](./indexer/README.md) - Detailed setup guide
- [Indexer Deployment Guide](./indexer/DEPLOYMENT.md) - Production deployment
- [Staking Indexer Service](../services/staking-indexer/README.md) - SubQuery project
- [Staking Worker Service](../services/staking-worker/README.md) - Background worker

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
