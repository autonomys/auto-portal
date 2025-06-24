# Staking Form Data Requirements

## Component Overview

Form for staking tokens to a selected operator with amount input, fee preview, and transaction confirmation.

---

## 🔗 RPC Data (Real-time)

### User Account Data

- `account.balance.free` - Available balance (Shannon)
- `account.balance.reserved` - Locked balance (Shannon)
- `account.nonce` - Transaction nonce

### Selected Operator Data

- `operator.minimumNominatorStake` - Minimum allowed stake (Shannon)
- `operator.nominationTax` - Commission rate for preview
- `operator.status` - Must be active to stake
- `operator.currentTotalStake` - Pool size for preview

### Transaction Costs

- Estimated transaction fees
- Current share price (for share calculation preview)

### Network State

- Current epoch information
- Domain status (must be operational)

---

## 📊 Indexer Data (Analytics)

### Reward Estimates

- **Projected APY** - For reward calculation preview
- **Historical reward rate** - To show realistic expectations

### Transaction Context

- **Average transaction fees** - For better fee estimation
- **Pool performance trends** - Context for user decision

---

## 🔄 Hybrid Data

### Form Validation

- **Balance check** (RPC) - Real-time available balance
- **Minimum stake** (RPC) - Current operator requirements
- **Pool capacity** (Indexer + RPC) - Combined pool analysis

---

## Data Flow

```
1. Load selected operator config (RPC)
2. Fetch user balance (RPC)
3. Get APY estimate (Indexer)
4. Real-time validation on amount input
5. Calculate transaction preview (RPC + static calculations)
```

## Validation Requirements

- Amount >= operator minimum stake
- Amount <= available balance
- Amount + fees + storage fund <= total balance
- Operator must be active
- Domain must be operational

## Cache Strategy

- **User balance**: 10 seconds (changes frequently)
- **Operator config**: 30 seconds (changes rarely)
- **APY estimates**: 5 minutes (historical data)
