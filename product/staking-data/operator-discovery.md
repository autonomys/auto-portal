# Operator Discovery Data Requirements

## Component Overview

Operator marketplace showing browseable list with filtering, sorting, and comparison.

---

## 🔗 RPC Data (Real-time)

### Operator Configuration

- `operator.id` - Operator identifier
- `operator.domainId` - Target domain
- `operator.signingKey` - Operator's public key
- `operator.minimumNominatorStake` - Min stake requirement (Shannon)
- `operator.nominationTax` - Commission rate (percentage)
- `operator.status` - Active/Inactive/Slashed
- `operator.currentTotalStake` - Total pool size (Shannon)

### Domain Information

- `domain.id` - Domain identifier
- `domain.domainName` - Display name ("Auto EVM")
- `domain.status` - Domain operational status

### Current Pool State

- Current share price
- Total shares outstanding

---

## 📊 Indexer Data (Historical/Calculated)

### Performance Metrics

- **APY calculation** - 30-day rolling average
- **Uptime percentage** - Block production history
- **Reward consistency** - Historical reward distribution

### Pool Analytics

- **Nominator count** - Count of unique stakers
- **Average stake size** - Pool composition analysis
- **Pool growth trends** - Historical total stake changes

### Trust Indicators

- **Time active** - How long operator has been running
- **Slashing history** - Past penalties (if any)
- **Fee history** - Commission rate changes over time

---

## 🎯 Target Operators

Initially hardcode these operator IDs:

- Operator 0
- Operator 1
- Operator 3

Fetch RPC data for each, combine with indexer metrics.

---

## Data Flow

```
1. Fetch operator configs (RPC) for target IDs
2. Fetch performance metrics (Indexer) for same IDs
3. Combine data into UI operator objects
4. Apply client-side filtering/sorting
```

## Cache Strategy

- **RPC data**: 30 seconds (operator status can change)
- **Indexer data**: 5 minutes (metrics update slowly)
