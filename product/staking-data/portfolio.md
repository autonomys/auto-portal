# Portfolio Data Requirements

## Component Overview

User's staking positions, pending withdrawals, transaction history, and performance tracking.

---

## 🔗 RPC Data (Real-time)

### Current Positions

- `nomination.shares` - User's share amount per operator
- `operator.sharePrice` - Current share price for value calculation
- `operator.status` - Active/slashed status affecting position

### Pending Operations

- `pendingDeposits` - Stakes waiting for next epoch
- `pendingWithdrawals` - Withdrawal requests in progress
- `withdrawals.unlockAt` - When funds become available

### Account State

- `account.balance.free` - Current spendable balance
- `account.balance.reserved` - Locked balance
- Current epoch and timing for pending operations

---

## 📊 Indexer Data (Historical)

### Position History

- **Cost basis tracking** - Original investment amounts
- **Stake events** - When user added/removed stake
- **Reward accrual** - Historical reward accumulation

### Performance Analytics

- **Realized gains/losses** - From completed withdrawals
- **Unrealized gains/losses** - Current position vs cost basis
- **Reward history** - Breakdown by operator and time period

### Transaction History

- **All staking transactions** - Deposits, withdrawals, claims
- **Transaction details** - Amounts, fees, timestamps, status
- **Operator context** - Which operators for each transaction

---

## 🔄 Hybrid Data (Combined)

### Position Calculations

- **Current value** = shares (RPC) × sharePrice (RPC)
- **Total gains** = currentValue - costBasis (Indexer)
- **Performance** = gains / costBasis (Hybrid calculation)

### Withdrawal Status

- **Withdrawal amount** (Indexer) + **unlock timing** (RPC)
- **Available to claim** - Combine withdrawal records with current epoch

---

## Data Queries Needed

### From RPC

```typescript
// User's nominations across all operators
api.query.domains.nominations(userAccount);

// Current share prices for user's operators
api.query.domains.operators(operatorId);

// Pending withdrawals and unlock times
api.query.domains.withdrawals(userAccount);
```

### From Indexer

```sql
-- User's staking history for cost basis
SELECT * FROM stake_events WHERE user_account = ? ORDER BY timestamp

-- Reward accumulation over time
SELECT * FROM rewards WHERE nominator = ? ORDER BY epoch

-- Transaction history with context
SELECT * FROM transactions WHERE account = ? AND type IN ('stake', 'withdraw', 'unlock')
```

---

## Cache Strategy

- **Position values**: 15 seconds (share prices change)
- **Withdrawal status**: 30 seconds (unlock timing critical)
- **Transaction history**: 10 minutes (rarely changes)
- **Performance analytics**: 5 minutes (daily calculations)
