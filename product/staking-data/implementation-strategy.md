# Implementation Strategy

## Data Architecture Summary

### Clear Separation of Concerns

**🔗 RPC (Auto SDK)** - Source of truth for current blockchain state

- Operator configurations and status
- User balances and shares
- Transaction state and validation
- Real-time network data

**📊 Indexer** - Historical and calculated data

- APY calculations and performance metrics
- Transaction history and cost basis tracking
- Reward accumulation and analytics
- Operator performance over time

---

## Implementation Phases

### Phase 1: RPC-Only MVP ✅ Ready to Start

**Goal:** Basic functionality with real blockchain data

#### What to Build:

- **Operator discovery** with basic operator configs (RPC)
- **Balance display** for connected wallets (RPC)
- **Staking form** with real validation (RPC)
- **Basic portfolio** showing current shares and values (RPC)

#### Data Sources:

- Auto SDK for all operator data
- Simple calculations for current position values
- No historical data yet (shows "Coming soon" for APY, etc.)

#### Target Operators: 0, 1, 3

Use hardcoded list, fetch real configs via RPC

---

### Phase 2: Indexer Integration

**Goal:** Add analytics and historical context

#### What to Add:

- **APY calculations** from indexer
- **Transaction history** and cost basis tracking
- **Performance metrics** and trends
- **Reward history** and analytics

#### Prerequisites:

- Indexer service deployed and populated
- API endpoints for historical queries
- Data synchronization strategy

---

### Phase 3: Advanced Features

**Goal:** Full-featured staking interface

#### What to Add:

- **Advanced analytics** and charting
- **Portfolio optimization** suggestions
- **Notification system** for epoch transitions
- **Batch operations** and advanced flows

---

## Immediate Next Steps

### 1. Service Layer Architecture

```typescript
// RPC service for real-time data
class BlockchainService {
  getOperators(ids: string[]);
  getUserBalance(address: string);
  getUserNominations(address: string);
}

// Indexer service for historical data (Phase 2)
class IndexerService {
  getOperatorAPY(operatorId: string);
  getUserTransactionHistory(address: string);
  getPortfolioAnalytics(address: string);
}

// Combined service for hybrid calculations
class StakingService {
  getOperatorWithMetrics(id: string); // RPC + Indexer
  getUserPortfolio(address: string); // RPC + Indexer
}
```

### 2. Data Models

```typescript
// Core types from RPC
interface OperatorConfig {
  id: string;
  domainId: string;
  minimumNominatorStake: string;
  nominationTax: number;
  status: OperatorStatus;
  currentTotalStake: string;
}

// Enhanced with indexer data (Phase 2)
interface OperatorWithMetrics extends OperatorConfig {
  apy?: number; // From indexer
  uptime?: number; // From indexer
  nominatorCount?: number; // From indexer
}
```

### 3. Component Updates

Update existing mock services to use real RPC data:

- **operator-service.ts** → Use Auto SDK calls
- **wallet-store.ts** → Add balance fetching
- **staking-form** → Real validation with RPC data

---

## Development Approach

### Start Simple

- Replace mock data with RPC calls
- Keep existing UI/UX unchanged
- Add loading states and error handling
- Show "Coming soon" for indexer-dependent features

### Add Complexity Gradually

- Phase 1: RPC data working reliably
- Phase 2: Indexer integration for analytics
- Phase 3: Advanced features and optimizations

### Validation Strategy

- **Phase 1:** All current UI should work with real data
- **Phase 2:** Analytics features can be added incrementally
- **Phase 3:** Advanced features built on solid foundation

---

## Key Decisions Made

1. **RPC First**: Start with source-of-truth data before analytics
2. **Hardcoded Operators**: Focus on operators 0, 1, 3 initially
3. **Progressive Enhancement**: UI works without indexer, better with it
4. **Clear Separation**: RPC and indexer services remain independent
5. **Cache Strategy**: Appropriate cache times per data type

This approach gets real blockchain integration working quickly while setting up for rich analytics later.
