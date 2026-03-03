# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
yarn install

# Frontend development server (http://localhost:5173)
yarn dev

# Build everything
yarn build

# Lint frontend (max 10 warnings)
yarn lint

# TypeScript checks across all packages
yarn type-check

# Format all code
yarn format

# Run all tests
yarn test

# Run portal tests only
yarn workspace @auto-portal/portal test

# Run a single test file
yarn workspace @auto-portal/portal vitest run src/lib/__tests__/apy.test.ts

# Run tests with coverage
yarn workspace @auto-portal/portal test:coverage

# Staking worker dev
yarn dev:worker

# Indexer infrastructure (Docker-based)
yarn infra:start     # start services
yarn infra:stop      # stop services
yarn infra:logs      # view logs
yarn infra:reset     # reset data

# Generate SubQuery indexer types
yarn indexer:codegen
```

## Architecture

This is a Yarn 4 monorepo structured as:

```
apps/portal/          # React 19 web frontend (primary codebase)
packages/shared-lib/  # Feature registry types, exported as @auto-portal/shared-lib
packages/shared-state/ # Zustand wallet + theme stores, exported as @auto-portal/shared-state
packages/shared-ui/   # Shared React UI primitives (currently minimal)
services/staking-indexer/ # SubQuery blockchain indexer (indexes staking events to Postgres)
services/staking-worker/  # Node.js background worker (Redis + Postgres, processes indexer data)
infra/staking/           # Docker Compose infrastructure (Postgres, Redis, SubQuery, Caddy)
```

### Frontend (`apps/portal/src/`)

The portal uses a layered architecture:

- **`config/`** — Central config reading `VITE_*` env vars; `config.network.defaultNetworkId` drives all RPC calls
- **`services/`** — Singleton service modules:
  - `api-service.ts` — Manages a single shared Polkadot.js RPC connection (singleton, network-aware; used for tx building/submission only)
  - `chain-pulse-client.ts` — Typed fetch-based REST client for all data reads from the chain-pulse backend
  - `operator-service.ts` — Operator data via `chainPulseClient`; APY windows via share price history
  - `position-service.ts` — Nominator position data via `chainPulseClient`
  - `staking-service.ts` / `withdrawal-service.ts` — Transaction submission (unchanged, still uses Polkadot.js)
- **`stores/`** — Zustand stores (operator-store, wallet-store, theme-store). `useOperatorStore` is the central data store; it fetches operators then enriches them with APY estimates from the indexer asynchronously.
- **`hooks/`** — Custom hooks wrapping stores and services (`use-operators`, `use-positions`, `use-wallet`, `use-staking-transaction`, `use-withdrawal-transaction`)
- **`pages/`** — Route-level components: Dashboard, Operators, OperatorDetail, Staking, Withdrawal
- **`components/`** — Feature components grouped by domain (`operators/`, `staking/`, `positions/`, `wallet/`, `layout/`, `ui/`)
- **`lib/`** — Pure utility functions: `apy.ts` (return calculations), `formatting.ts`, `fixed-point.ts`, `operator-mapper.ts`, `staking-utils.ts`, `withdrawal-utils.ts`
- **`features/`** — Plugin-style feature modules registered via `registerFeatures()` from `shared-lib`; loaded lazily as routes
- **`types/`** — TypeScript interfaces for operators, positions, wallets, indexer data, transactions

### Data Flow

1. **Operator data**: `useOperators` hook → `useOperatorStore.fetchOperators()` → `operatorService.getAllOperators()` calls `chainPulseClient.getOperators()`, then background-enriches with APY windows via `chainPulseClient.getSharePrices()`.
2. **Position data**: `usePositions` hook → `positionService.getAllPositions(address)` → `chainPulseClient.getPositions(address)`; auto-refreshes every 30s.
3. **Transactions**: `api-service.ts` / `staking-service.ts` / `withdrawal-service.ts` — Polkadot.js RPC is used exclusively for building and submitting extrinsics; no data reads.
4. **Wallet**: `useWalletStore` (in `shared-state`) uses `@talismn/connect-wallets`; supports SubWallet, Talisman, Polkadot.js. Persists selection to localStorage and auto-reconnects.

### Path Aliases

The portal uses `@/` as an alias for `apps/portal/src/`. Shared packages are aliased directly to source files in `vite.config.ts` (no build step needed during development).

### Environment Variables (Frontend)

| Variable                           | Default                                   |
| ---------------------------------- | ----------------------------------------- |
| `VITE_CHAIN_PULSE_URL`             | `http://localhost:8080`                   |
| `VITE_NETWORK_ID`                  | `dev` (non-prod) / `mainnet` (prod)       |
| `VITE_EXPLORER_EXTRINSIC_BASE_URL` | `https://autonomys.subscan.io/extrinsic/` |

## Code Style

- **Arrow functions only** — no `function` declarations (enforced by ESLint)
- **Named exports** — prefer over default exports
- **kebab-case** for file names, **PascalCase** for component names
- **`interface`** over `type` for object shapes
- Prettier enforced via ESLint (`prettier/prettier` rule as error)
- 2-space indent, single quotes, trailing commas

## Key Constraints

- All data reads go through `chain-pulse-client.ts` (REST). Polkadot.js RPC (`api-service.ts`) is used only for transaction building/submission.
- The staking indexer (`services/staking-indexer/`) is a SubQuery project — changes require `yarn indexer:codegen` to regenerate types.
- Shared packages (`shared-lib`, `shared-state`) must be built (`yarn build`) before their `dist/` output is used by other workspaces outside Vite dev mode.
