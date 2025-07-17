# Auto Portal Infrastructure

This directory contains all infrastructure-related configuration and deployment files for the Auto Portal project.

## Directory Structure

```
infra/
├── indexer/          # Staking indexer infrastructure
│   ├── db/          # PostgreSQL database configuration
│   ├── .env.example # Environment variables template
│   ├── Caddyfile    # Reverse proxy configuration
│   ├── docker-compose.yml # Service orchestration
│   └── DEPLOYMENT.md # Deployment instructions
└── README.md        # This file
```

## Components

### Indexer Infrastructure (`indexer/`)

The indexer infrastructure supports the blockchain data indexing system:

- **PostgreSQL Database**: Stores indexed blockchain data
- **Redis**: Queue management and caching
- **PgCat**: Database connection pooling
- **Caddy**: Reverse proxy for node connections
- **SubQuery Node**: Runs the staking indexer
- **Staking Worker**: Processes lazy conversions

## Quick Start

```bash
# Navigate to indexer infrastructure
cd infra/indexer

# Copy and configure environment
cp .env.example .env

# Start infrastructure
docker-compose up -d

# View logs
docker-compose logs -f
```

## Related Documentation

- [Indexer Deployment Guide](./indexer/DEPLOYMENT.md)
- [Staking Indexer Package](../packages/staking-indexer/README.md)
- [Staking Worker Package](../packages/staking-worker/README.md)

## Future Infrastructure

As the project grows, additional infrastructure directories may be added:

- `web/` - Web frontend deployment (Vercel, CDN, etc.)
- `monitoring/` - Logging and monitoring stack
- `ci/` - Continuous integration configuration
