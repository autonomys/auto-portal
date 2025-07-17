# Auto Portal Deployment Guide

This guide covers deployment of the complete Auto Portal stack, including the web frontend, staking indexer, worker, and all supporting infrastructure.

## Project Structure

Auto Portal is organized as a TypeScript monorepo:

```
auto-portal/
├── apps/
│   └── web/                    # React web frontend
├── packages/
│   ├── shared-types/          # Shared TypeScript types
│   ├── staking-indexer/       # SubQuery blockchain indexer
│   └── staking-worker/        # Background processing worker
├── infra/
│   └── indexer/              # Infrastructure configuration
│       ├── docker-compose.yml   # Service orchestration
│       ├── db/                  # Database configuration
│       ├── .env.example         # Environment template
│       └── DEPLOYMENT.md        # Detailed indexer setup
└── README.md
```

## Quick Start (Development)

### Prerequisites

- **Node.js** ≥20.19.0
- **Yarn** ≥4.0.0
- **Docker** and **Docker Compose**
- **Git**

### 1. Clone and Install

```bash
# Clone repository
git clone https://github.com/jfrank-summit/auto-portal.git
cd auto-portal

# Install all dependencies
yarn install
```

### 2. Start Web Frontend

```bash
# Start development server
yarn dev

# Frontend will be available at http://localhost:5173
```

### 3. Start Indexer Infrastructure (Optional)

For full functionality with historical data:

```bash
# Navigate to indexer infrastructure
cd infra/indexer

# Copy and configure environment
cp .env.example .env
# Edit .env with your settings

# Start all infrastructure services
docker-compose up -d

# View logs
docker-compose logs -f
```

## Production Deployment

### Frontend Deployment (Vercel)

The web frontend is deployed automatically to Vercel:

1. **Automatic Deployment**: Connected to GitHub, deploys on push to `main`
2. **Custom Domain**: `auto-portal-web.vercel.app`
3. **Environment Variables**: Configure in Vercel dashboard
4. **Build Command**: `yarn build`
5. **Output Directory**: `apps/web/dist`

### Indexer Infrastructure Deployment

For production indexer deployment, see the [detailed guide](./infra/indexer/DEPLOYMENT.md).

**Key components:**

- PostgreSQL database with proper backup strategy
- Redis for queue management and caching
- PgCat connection pooling proxy
- SubQuery indexer for blockchain data
- Background worker for data processing
- Caddy reverse proxy for node connections

### Environment Configuration

#### Frontend (.env)

```bash
VITE_APP_TITLE="Auto Portal"
VITE_RPC_URL="wss://rpc.taurus.autonomys.xyz/ws"
VITE_INDEXER_URL="https://your-indexer-domain.com"
```

#### Indexer (infra/indexer/.env)

```bash
# Network
NETWORK_ENDPOINT=wss://rpc.taurus.autonomys.xyz/ws
NETWORK_DICTIONARY=https://dict.taurus.autonomys.xyz

# Database
DB_HOST=postgres-staking
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_DATABASE=staking

# Performance
BATCH_SIZE=100
FINALITY_THRESHOLD=100
```

## Development Workflows

### Working with the Frontend

```bash
# Start development server
yarn dev

# Run linting
yarn lint

# Type checking
yarn type-check

# Build for production
yarn build
```

### Working with the Indexer

```bash
# Generate SubQuery types
yarn indexer:codegen

# Build indexer
yarn build:indexer

# Start indexer development
yarn dev:indexer

# Start worker development
yarn dev:worker
```

### Shared Development

```bash
# Install dependencies for all packages
yarn install

# Build all packages
yarn build

# Format all code
yarn format

# Clean all build artifacts
yarn clean
```

## Package Scripts

The monorepo provides convenient scripts for development:

- `yarn dev` - Start web frontend
- `yarn dev:indexer` - Start indexer infrastructure
- `yarn dev:worker` - Start staking worker in development mode
- `yarn build` - Build all packages
- `yarn build:indexer` - Build indexer only
- `yarn build:worker` - Build worker only
- `yarn indexer:codegen` - Generate SubQuery types

## Monitoring and Debugging

### Frontend

- **Development**: Browser DevTools
- **Production**: Vercel Analytics and Logs
- **Performance**: Lighthouse scores

### Indexer Infrastructure

- **Database**: PostgreSQL logs and performance metrics
- **Indexer**: SubQuery node logs and sync status
- **Worker**: Application logs and queue processing metrics
- **Infrastructure**: Docker Compose service health

### Access Points (Development)

- **Web Frontend**: http://localhost:5173
- **GraphQL Playground**: http://localhost:3001
- **Indexer Status**: http://localhost:3000
- **Database**: postgresql://postgres:postgres@localhost:5432/staking
- **Redis**: redis://localhost:6379

## Troubleshooting

### Common Issues

#### Frontend Build Errors

```bash
# Clear cache and reinstall
yarn clean
rm -rf node_modules yarn.lock
yarn install
yarn build
```

#### Indexer Connection Issues

```bash
# Check services
cd infra/indexer
docker-compose ps

# View logs
docker-compose logs -f staking-indexer

# Restart services
docker-compose restart
```

#### Workspace Issues

```bash
# Reinstall all dependencies
yarn install

# Check workspace integrity
yarn workspaces info
```

### Performance Issues

- **Frontend**: Use React DevTools Profiler
- **Database**: Monitor query performance and indexing
- **Worker**: Check batch processing rates and queue depth

## Security Considerations

### Frontend

- Environment variables properly prefixed with `VITE_`
- No sensitive data in client-side code
- HTTPS enforced in production

### Infrastructure

- Database credentials secured
- Network access properly restricted
- Regular security updates applied

## CI/CD Pipeline

### GitHub Actions

- **Frontend**: Automatic deployment to Vercel
- **Code Quality**: ESLint and Prettier checks
- **Type Safety**: TypeScript compilation checks

### Manual Deployment

For infrastructure updates:

1. Test locally with `docker-compose`
2. Update environment variables
3. Deploy with infrastructure management tools

## Further Reading

- [Indexer Infrastructure Guide](./infra/indexer/DEPLOYMENT.md) - Detailed indexer setup
- [Staking Indexer Package](./packages/staking-indexer/README.md) - Indexer development
- [Staking Worker Package](./packages/staking-worker/README.md) - Worker development
- [Infrastructure Organization](./infra/README.md) - Infrastructure overview

## Support

For deployment issues:

1. Check logs using the commands above
2. Review environment configuration
3. Verify service health and connectivity
4. Consult package-specific documentation
