# Auto Portal Indexer Infrastructure

This directory contains the Docker Compose setup for the Auto Portal staking indexer infrastructure, supporting mainnet and an optional local development node.

## Features

- **Flexible Node Configuration**: Choose between mainnet or an optional local development node
- **SubQuery Indexing**: Indexes staking events and operator data
- **PostgreSQL Storage**: Persistent database with connection pooling
- **Redis Task Queue**: For background worker processing
- **Hasura GraphQL**: Production-compatible GraphQL API layer
- **TLS & Reverse Proxy**: Traefik terminates TLS automatically (Let’s Encrypt via Cloudflare DNS‑01)
- **Rate Limiting at Origin**: Traefik applies per‑IP limits for `/v1/graphql` and `/console`

## Quick Start

### 1. Choose environment

Pick one of the provided environment presets. You can use the `.example` files directly or create your own `.env.<env>`.

### 2. Start services

```bash
make start
```

Use a specific env file:

```bash
make start ENV_FILE=.env.mainnet.example
```

Local node is auto-detected when your env file sets `RPC_URLS` to include `node:9944` (e.g. `ws://node:9944`).

## Configuration Options

### Environment Files (provided)

- `.env.example` - General template
- `.env.mainnet.example` - Mainnet
- `.env.dev.example` - Local dev node

You can also pass an explicit env file to make:

```bash
make start ENV_FILE=.env.dev.example
```

### Docker Compose Profiles

The setup uses Docker Compose profiles for optional services:

- **No profiles** (default): All core staking services (PostgreSQL, PgCat, Redis, SubQuery, Worker)
- **`local-node`**: Local Autonomys development node. This profile is enabled automatically when `RPC_URLS` contains `node:9944`.

## Service Architecture

```mermaid
graph TD
    A[Web Frontend] --> K[Hasura GraphQL :8080]
    K --> G[PostgreSQL :5433]

    C{Node Type}
    C -->|Local| D[Local Node :9944]
    C -->|External| E[Mainnet RPC]

    F[SubQuery Indexer] --> G
    F --> C
    H[Staking Worker] --> I[Redis :6379]
    H --> G

    J[PgCat Proxy] --> G
    F --> J
```

## Available Services

| Service    | Port | Description            | Profile      |
| ---------- | ---- | ---------------------- | ------------ |
| Node       | 9944 | Local Development Node | `local-node` |
| PostgreSQL | 5433 | Database               | Always       |
| PgCat      | 6433 | Connection Pooler      | Always       |
| SubQuery   | 3003 | Indexer Status         | Always       |
| Redis      | 6379 | Task Queue             | Always       |
| Hasura     | 8080 | GraphQL API            | Always       |

## Access Points

- **Database**: `postgresql://postgres:postgres@localhost:5433/staking`
- **SubQuery Status**: `http://localhost:3003`
- **Redis**: `redis://localhost:6379`
- **Hasura GraphQL**: `http://localhost:8080/v1/graphql` (configurable via `HASURA_GRAPHQL_PORT`)
- **Hasura Console**: `http://localhost:8080/console` (configurable, password via `HASURA_GRAPHQL_ADMIN_SECRET`)

If you set a public domain (see below):

- **Public GraphQL**: `https://$TRAEFIK_DOMAIN/v1/graphql`
- **Public Console**: `https://$TRAEFIK_DOMAIN/console`

## Configuration

### **Hasura Settings**

Customize Hasura behavior in your `.env` file:

```bash
# Hasura Configuration
HASURA_GRAPHQL_PORT=8080                    # Change port if needed
HASURA_GRAPHQL_ADMIN_SECRET=your-secret     # ⚠️  CRITICAL: Use strong secret for production!
HASURA_GRAPHQL_ENABLE_CONSOLE=true         # Disable in production
HASURA_GRAPHQL_DEV_MODE=true               # MUST be false in production
HASURA_GRAPHQL_ENABLE_INTROSPECTION=true   # Consider disabling in production
```

**🔒 Security Notes:**

- **Development**: Admin secret is shown for convenience
- **Production**: Set `NODE_ENV=production` to hide secrets in logs
- **Generate secure secret**: `openssl rand -hex 32`
- **Disable console and dev mode** in production environments

### **Edge / Proxy Settings (Traefik + Cloudflare)**

This stack now fronts Hasura directly with Traefik (TLS + rate limiting):

```
Internet → Cloudflare (Proxied) → Traefik :443 → Hasura :8080
```

1. Set your public hostname and ACME details in `.env` (do not commit real hostnames or tokens):

```bash
# .env
TRAEFIK_DOMAIN=subql.blue.mainnet.subspace.network
TRAEFIK_ACME_EMAIL=you@example.com
CF_DNS_API_TOKEN=***
```

2. Start services:

```bash
make start
```

3. Verify routing and TLS (expect 200/401 depending on Hasura settings):

```bash
curl -I --resolve "$TRAEFIK_DOMAIN:443:127.0.0.1" https://$TRAEFIK_DOMAIN/v1/graphql
```

Traefik stores ACME certificates in `/letsencrypt/acme.json`. The compose stack includes a small `traefik-init` service that ensures the file exists and is set to `0600` to protect private keys.

#### Rate limits

Default limits are configured via labels:

```text
/v1/graphql  → 100 req/min, burst 200, keyed by CF-Connecting-IP
/console     → 30 req/min, burst 60, keyed by CF-Connecting-IP
```

Note: These limits are keyed by the `CF-Connecting-IP` header, which is only present when requests pass through the Cloudflare proxy. If Cloudflare is disabled (gray cloud) or you are testing locally, either:

- send a `CF-Connecting-IP` header from your client for testing, or
- switch the middleware to key by source IP (Traefik `sourcecriterion.ipstrategy`) in a non‑CF profile.

Adjust in `docker-compose.yml` under the `hasura` service labels.

#### Cloudflare (recommended)

- DNS: `A subql.blue.mainnet → <instance ip>` with Proxy enabled
- SSL/TLS: set to “Full (strict)”
- Caching: bypass for `/v1/graphql` and `/console`
- Optional: Cloudflare Rate Limiting/WAF on the same paths

## Common Commands

```bash
# Start services (auto-detects local node from RPC_URLS)
make start [ENV_FILE=.env.mainnet.example]

# Stop all services
make stop

# View all logs
make logs

# View specific service logs
make logs SERVICE=subquery-node
make logs SERVICE=postgres-staking

# Show status/health
make status

# Reset DB/Redis data (prompts for confirmation)
make reset
```

## Development Notes

### Local vs External Node

**Local Node (auto-detected):**

- Set `RPC_URLS=ws://node:9944` in your env file to enable the local node profile
- Runs Autonomys node in development mode
- Faster for testing indexer logic
- No external dependencies
- Limited to development chain

**External Node (default: Mainnet):**

- Connects to Autonomys mainnet
- Real network data
- No local node resource usage
- Requires internet connection

### Environment Variables (Mainnet)

Key configuration variables in `.env`:

```bash
# Network Configuration
# For external (mainnet) RPC
RPC_URLS=wss://rpc.mainnet.autonomys.xyz/ws
CHAIN_ID=0x66455a580aabff303720aa83adbe6c44502922251c03ba73686d5245da9e21bd

# Starting Block (adjust based on your needs)
START_BLOCK_STAKING=3851328

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

#### Domain / Proxy

```bash
# Check Traefik logs
docker compose logs -f traefik

# Test origin routing with SNI + Host (expects 200/401)
curl -I --resolve "$TRAEFIK_DOMAIN:443:127.0.0.1" https://$TRAEFIK_DOMAIN/v1/graphql
```

If Cloudflare shows 52x errors:

- Ensure Traefik is listening on 443 and has a certificate (see `docker compose logs traefik`)
- Keep Cloudflare SSL/TLS to Full (strict)
- Temporarily set DNS record to “DNS only” (gray cloud) to verify origin, then re‑enable Proxy

#### Local Node RPC Connection

```bash
# Test local node RPC connection (if using local-node profile)
curl -H "Content-Type: application/json" \
  -d '{"id":1, "jsonrpc":"2.0", "method": "system_health", "params":[]}' \
  http://localhost:9944
```

For more detailed deployment information, see [DEPLOYMENT.md](./DEPLOYMENT.md).
