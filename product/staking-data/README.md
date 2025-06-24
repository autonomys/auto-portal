# Staking Data Architecture

**Purpose:** Define data sources for staking interface components

## Data Source Strategy

### 🔗 RPC (Point-in-time source of truth)

Real-time blockchain state that changes frequently

### 📊 Indexer (Historical & aggregated data)

Pre-processed data for tables, charts, and calculations

### 🔄 Hybrid

Data requiring both sources for complete picture

---

## Component Data Requirements

See individual files for detailed breakdown:

- **[operator-discovery.md](./operator-discovery.md)** - Operator marketplace data needs
- **[staking-form.md](./staking-form.md)** - Transaction form data requirements
- **[portfolio.md](./portfolio.md)** - User position and history data
- **[dashboard.md](./dashboard.md)** - Overview metrics and summaries

---

## Key Findings

### Phase 1: RPC-Only (Ready to Start)

- **Operator configs** and **user balances** from Auto SDK
- **Basic portfolio** with current position values
- **Real validation** and transaction preview
- Show "Coming soon" for analytics requiring indexer

### Phase 2: Indexer Integration (Future)

- **APY calculations** and **performance metrics**
- **Transaction history** and **cost basis tracking**
- **Advanced analytics** and **trend data**

See **[implementation-strategy.md](./implementation-strategy.md)** for detailed plan and next steps.

## Cache Guidelines

- **RPC calls**: 10-30 seconds (real-time blockchain state)
- **Indexer queries**: 2-10 minutes (calculated/historical data)
- **Critical UX data**: Always from RPC for accuracy
- **Analytics data**: Can be cached longer, update periodically
