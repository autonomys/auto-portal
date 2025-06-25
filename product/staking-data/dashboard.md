# Dashboard Data Requirements

## Component Overview

High-level portfolio overview with key metrics, recent activity, and quick actions.

---

## 🔗 RPC Data (Real-time)

### Account Balances

- `account.balance.free` - Available balance for staking
- `account.balance.reserved` - Locked balance (includes stakes)

### Current Portfolio Value

- User's shares per operator (RPC)
- Current share prices (RPC)
- Real-time position values

### Network Status

- Current epoch information
- Next epoch timing
- Network health indicators

---

## 📊 Indexer Data (Analytics)

### Portfolio Analytics

- **Total cost basis** - Sum of all investments
- **Total earned** - Lifetime reward accumulation
- **Portfolio performance** - Overall gains/losses percentage

### Recent Activity

- **Last 10 transactions** - Stakes, withdrawals, claims
- **Recent reward events** - Latest reward distributions
- **Position changes** - Stakes added/removed recently

### Performance Trends

- **24h portfolio change** - Daily performance tracking
- **7d portfolio change** - Weekly performance
- **30d performance** - Monthly trends

---

## 🔄 Hybrid Data (Combined)

### Portfolio Metrics

- **Position Value** = sum(shares × sharePrice) from RPC
- **Total Earned** = positionValue - costBasis (Indexer)
- **Gains Percentage** = (totalEarned / costBasis) × 100

### Active Positions Summary

- **Position count** - Number of operators staked to
- **Largest position** - Biggest stake by value
- **Best performer** - Highest gaining position

---

## Summary Cards Data

### Position Value Card

```typescript
{
  value: string; // Current total portfolio value (RPC)
  label: 'Position Value';
  subtitle: 'Current worth';
}
```

### Total Earned Card

```typescript
{
  value: string; // Total gains (Hybrid calculation)
  label: 'Total Earned';
  change: string; // Percentage gain (Hybrid)
  trend: 'positive' | 'negative';
}
```

### Available Balance Card

```typescript
{
  value: string; // Free balance (RPC)
  label: 'Available Balance';
  subtitle: 'Ready to stake';
}
```

---

## Active Positions Table

Data per position:

- **Operator name** (Static/Indexer mapping)
- **Position value** = shares × sharePrice (RPC)
- **Total earned** = positionValue - costBasis (Hybrid)
- **Status** (RPC operator status)

---

## Cache Strategy

- **Real-time metrics**: 10 seconds (balances, position values)
- **Performance analytics**: 5 minutes (calculated metrics)
- **Recent activity**: 2 minutes (transaction updates)
- **Trend data**: 10 minutes (historical calculations)
