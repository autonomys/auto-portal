# Auto Portal Indexers

This workspace contains the blockchain indexing infrastructure for the Auto Portal staking application, providing real-time and historical data about staking operations on the Autonomys Network.

## Overview

The indexer infrastructure consists of two main components:

- **Staking Indexer** (`staking/`) - SubQuery-based indexer that processes blockchain events
- **Staking Worker** (`staking-worker/`) - Background worker that handles lazy conversions and data aggregation

## Architecture

```mermaid
graph TD
    A[Autonomys Blockchain] --> B[Staking Indexer]
    B --> C[PostgreSQL Database]
    B --> D[Redis Queue]
    D --> E[Staking Worker]
    E --> C
    C --> F[GraphQL API]
    F --> G[Web Frontend]
```

### Components

#### Staking Indexer (`staking/`)

- **Type**: SubQuery project
- **Purpose**: Indexes blockchain events related to staking operations
- **Technology**: TypeScript, SubQuery SDK
- **Data Sources**: Autonomys blockchain via WebSocket
- **Outputs**: Raw event data in PostgreSQL tables

**Key Features:**

- Real-time event processing
- Epoch transition detection
- Share price calculations
- Historical data indexing

#### Staking Worker (`staking-worker/`)

- **Type**: Node.js background worker
- **Purpose**: Processes lazy conversions and data aggregation
- **Technology**: TypeScript, PostgreSQL, Redis
- **Triggers**: Periodic processing and epoch transitions

**Key Features:**

- Lazy deposit/withdrawal conversions
- Share price-based calculations
- Parallel task processing
- Retry mechanisms with exponential backoff

## Database Schema

The indexer creates and manages several PostgreSQL tables in the `staking` schema:

### Core Tables

- `nominators` - Aggregated nominator state and positions
- `operators` - Operator information and statistics
- `operator_epoch_share_prices` - Historical share prices by epoch

### Event Tables (Indexer-managed)

- `nominator_deposits` - Raw deposit events from blockchain
- `nominator_withdrawals` - Raw withdrawal events from blockchain
- `unlocked_events` - Unlock claim events
- `operator_registrations` - Operator registration events
- `operator_rewards` - Operator reward events
- `bundle_submissions` - Bundle submission events

See the full schema in `db/docker-entrypoint-initdb.d/staking-only/07-schema-staking.sql`.

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js ≥20.19.0
- Yarn ≥4.0.0

### Setup

1. **Install dependencies:**

   ```bash
   yarn install
   ```

2. **Configure environment:**

   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

3. **Start infrastructure:**

   ```bash
   docker-compose up -d postgres-staking redis caddy
   ```

4. **Build and start indexer:**

   ```bash
   yarn codegen
   yarn build
   docker-compose up -d staking-indexer
   ```

5. **Start worker:**
   ```bash
   docker-compose up -d staking-worker
   ```

### Access Points

- **GraphQL Playground**: http://localhost:3001
- **Indexer Status**: http://localhost:3000
- **Database**: `postgresql://postgres:postgres@localhost:5432/staking`
- **Redis**: `redis://localhost:6379`

## Development

### Project Structure

```
apps/indexers/
├── staking/                    # SubQuery indexer project
│   ├── src/
│   │   ├── mappings/          # Event processing logic
│   │   └── types/             # Generated types
│   ├── schema.graphql         # GraphQL schema definition
│   └── project.yaml           # SubQuery project config
├── staking-worker/            # Background worker
│   ├── src/
│   │   ├── core/              # Core processing logic
│   │   ├── services/          # Database and external services
│   │   └── utils/             # Utilities and helpers
│   └── package.json
├── db/                        # Database configuration
│   ├── docker-entrypoint-initdb.d/  # Database initialization
│   └── postgresql.conf        # PostgreSQL configuration
└── docker-compose.yml         # Service orchestration
```

### Making Changes

#### Indexer Changes

1. Modify code in `staking/src/`
2. Rebuild: `yarn build`
3. Restart: `docker-compose restart staking-indexer`

#### Worker Changes

1. Modify code in `staking-worker/src/`
2. Rebuild: `yarn build`
3. Restart: `docker-compose restart staking-worker`

#### Schema Changes

1. Update `staking/schema.graphql`
2. Run: `yarn codegen`
3. Update database manually or reset: `docker-compose down -v`

### Monitoring

#### Check Indexer Progress

```bash
# View indexer logs
docker-compose logs -f staking-indexer

# Check current block height
docker-compose exec postgres-staking psql -U postgres -d staking -c "
SELECT value->>'lastProcessedHeight' as current_height
FROM staking._metadata
WHERE key = 'lastProcessedHeight';"
```

#### Check Worker Status

```bash
# View worker logs
docker-compose logs -f staking-worker

# Check unprocessed tasks
docker-compose exec postgres-staking psql -U postgres -d staking -c "
SELECT
  'deposits' as type, COUNT(*) as unprocessed
FROM staking.nominator_deposits
WHERE processed = false
UNION ALL
SELECT
  'withdrawals' as type, COUNT(*) as unprocessed
FROM staking.nominator_withdrawals
WHERE processed = false;"
```

### Data Flow

1. **Blockchain Events** → Indexer processes events and stores raw data
2. **Epoch Transitions** → Indexer detects transitions and calculates share prices
3. **Pending Conversions** → Worker converts pending deposits/withdrawals using share prices
4. **Aggregated Data** → Worker updates nominator and operator aggregated tables
5. **GraphQL API** → Frontend queries processed data via GraphQL

### Key Concepts

#### Lazy Conversion

The Autonomys runtime performs "lazy conversion" - meaning pending deposits and withdrawals are only converted when:

- A new action occurs for that nominator
- The required share price becomes available

The worker replicates this behavior by periodically checking for conversions that can now be performed.

#### Share Prices

Share prices are calculated at epoch boundaries and stored in `operator_epoch_share_prices`. These are used to convert:

- Pending deposits (tokens → shares)
- Pending withdrawals (shares → tokens)

#### Finality

The worker only processes events that are "finalized" (100+ blocks behind the chain tip) to avoid processing reorged blocks.

## Scripts

Available yarn scripts:

- `yarn build` - Build all packages
- `yarn codegen` - Generate SubQuery types
- `yarn lint` - Run ESLint
- `yarn format` - Format code with Prettier
- `yarn dev:staking` - Start indexer in development mode
- `yarn dev:worker:staking` - Start worker in development mode

## Environment Variables

Key environment variables (see `.env.example` for full list):

```bash
# Network
NETWORK_ENDPOINT=wss://rpc.taurus.autonomys.xyz/ws
NETWORK_DICTIONARY=https://dict.taurus.autonomys.xyz

# Database
DB_HOST=postgres-staking
DB_USER=postgres
DB_PASSWORD=postgres
DB_DATABASE=staking

# Worker
BATCH_SIZE=100
FINALITY_THRESHOLD=100
QUEUE_PROCESSING_INTERVAL_MS=1000
```

## Troubleshooting

### Common Issues

**Indexer not syncing:**

- Check node connection: `curl http://localhost:8000/health`
- Verify database connection in logs
- Check for schema migrations

**Worker not processing:**

- Verify Redis connection: `docker-compose exec redis redis-cli ping`
- Check for unprocessed events in database
- Review worker logs for errors

**Database connection errors:**

- Ensure PostgreSQL is running: `docker-compose ps postgres-staking`
- Check port conflicts
- Verify credentials in environment

### Performance Tips

- Monitor database query performance
- Adjust worker batch sizes based on load
- Use Redis for caching frequently accessed data
- Scale worker instances for high throughput

## Contributing

1. Follow TypeScript and ESLint conventions
2. Add comprehensive logging for debugging
3. Write tests for new functionality
4. Update documentation for changes
5. Test with local development setup

## Further Reading

- [SubQuery Documentation](https://academy.subquery.network/)
- [Autonomys Network Documentation](https://docs.autonomys.xyz/)
- [Worker Flow Documentation](staking-worker/STAKING-WORKER-FLOWS.md)
- [Implementation Gaps Analysis](staking/STAKING_IMPLEMENTATION_GAPS.md)
