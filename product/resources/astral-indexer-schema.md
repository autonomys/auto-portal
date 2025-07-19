# Auto Portal Indexer Schema Documentation

**Source:** [Auto Portal Staking Indexer](https://github.com/jfrank-summit/auto-portal/blob/main/apps/indexers/staking/schema.graphql)  
**Purpose:** Indexed blockchain data for enhanced staking UX  
**Status:** Available for integration

---

## Overview

The Auto Portal indexer provides comprehensive GraphQL access to processed blockchain data, eliminating the need for complex RPC calls and enabling rich historical data queries. This indexed data significantly enhances the staking user experience beyond what's possible with direct Auto SDK integration.

---

## Core Entity Types

### 1. **OperatorRegistration**

**Purpose:** Track operator registration events and configurations

```graphql
type OperatorRegistration @entity {
  id: ID!
  owner: String!
  domainId: String!
  signingKey: String!
  minimumNominatorStake: BigInt!
  nominationTax: Int!
  blockHeight: BigInt!
  extrinsicId: String!
  eventId: String!
  processed: Boolean! @index
}
```

**Use Cases:**

- **Operator Discovery:** Browse all registered operators
- **Operator Profiles:** Show registration details and settings
- **Filtering:** Find operators by domain, tax rate, minimum stake
- **Historical Data:** Track operator registration history

**Key Fields:**

- `owner`: Operator account address
- `domainId`: Which domain the operator serves
- `minimumNominatorStake`: Min stake required to nominate
- `nominationTax`: Operator commission percentage
- `processed`: Index processing status

### 2. **OperatorEpochSharePrice**

**Purpose:** Historical share price data for accurate reward calculations

```graphql
type OperatorEpochSharePrice @entity {
  id: ID! # Format: operatorId-domainId-epochIndex
  operatorId: String! @index
  domainId: String! @index
  epochIndex: Int! @index
  sharePrice: BigInt!
  totalStake: BigInt!
  totalShares: BigInt!
  timestamp: Date!
  blockHeight: BigInt!
}
```

**Use Cases:**

- **APR Calculations:** Calculate historical and projected returns
- **Performance Charts:** Show operator performance over time
- **Reward Estimation:** Predict future rewards based on trends
- **Portfolio Valuation:** Calculate current position value

**Key Fields:**

- `sharePrice`: Price per share at epoch end
- `totalStake`: Total tokens staked to this operator
- `totalShares`: Total shares issued by operator
- `epochIndex`: Epoch number for timeline tracking

### 3. **NominatorDeposit**

**Purpose:** Track nominator staking positions and pending deposits

```graphql
type NominatorDeposit @entity {
  id: ID!
  address: String! @index
  operatorId: String! @index
  domainId: String! @index
  knownShares: BigInt!
  knownStorageFeeDeposit: BigInt!
  pendingAmount: BigInt!
  pendingStorageFeeDeposit: BigInt!
  pendingEffectiveDomainEpoch: BigInt!
  extrinsicIds: String!
  eventIds: String!
  timestamp: Date!
  blockHeights: String!
  blockHeight: BigInt!
  processed: Boolean! @index
}
```

**Use Cases:**

- **Portfolio View:** Show user's active positions
- **Pending Deposits:** Track deposits awaiting epoch processing
- **Storage Fund Tracking:** Monitor storage fee contributions
- **Position History:** Show staking timeline and amounts

**Key Fields:**

- `address`: Nominator account address
- `knownShares`: Currently active shares
- `pendingAmount`: Deposits awaiting processing
- `pendingEffectiveDomainEpoch`: When pending deposits become active

### 4. **NominatorWithdrawal**

**Purpose:** Track withdrawal requests and unlock status

```graphql
type NominatorWithdrawal @entity {
  id: ID!
  address: String! @index
  operatorId: String! @index
  domainId: String! @index
  withdrawalInSharesAmount: BigInt!
  withdrawalInSharesStorageFeeRefund: BigInt!
  withdrawalInSharesDomainEpoch: String!
  withdrawalInSharesUnlockBlock: BigInt!
  totalWithdrawalAmount: BigInt!
  totalStorageFeeWithdrawal: BigInt!
  withdrawalsJson: String!
  totalPendingWithdrawals: BigInt!
  extrinsicIds: String!
  eventIds: String!
  timestamp: Date!
  blockHeight: BigInt!
  blockHeights: String!
  processed: Boolean! @index
}
```

**Use Cases:**

- **Withdrawal Tracking:** Show pending withdrawal status
- **Unlock Timing:** Display when funds become available
- **Batch Processing:** Handle multiple withdrawal requests
- **Storage Fee Refunds:** Track refund amounts and timing

**Key Fields:**

- `withdrawalInSharesUnlockBlock`: When funds can be unlocked
- `totalWithdrawalAmount`: Total tokens being withdrawn
- `totalStorageFeeWithdrawal`: Storage fee refund amount
- `withdrawalsJson`: Detailed withdrawal batch data

### 5. **OperatorReward**

**Purpose:** Track operator reward distributions

```graphql
type OperatorReward @entity {
  id: ID!
  domainId: String!
  operatorId: String!
  amount: BigInt!
  atBlockNumber: BigInt!
  blockHeight: BigInt!
  extrinsicId: String!
  eventId: String!
  processed: Boolean! @index
}
```

**Use Cases:**

- **Reward History:** Show historical reward distributions
- **APR Calculations:** Calculate operator performance metrics
- **Performance Comparison:** Compare operators by rewards
- **Reward Tracking:** Monitor reward frequency and amounts

### 6. **UnlockedEvent**

**Purpose:** Track successful fund unlocks

```graphql
type UnlockedEvent @entity {
  id: ID!
  domainId: String!
  operatorId: String!
  address: String!
  nominatorId: String!
  amount: BigInt!
  storageFee: BigInt!
  timestamp: Date!
  blockHeight: BigInt!
  extrinsicId: String!
  eventId: String!
  processed: Boolean! @index
}
```

**Use Cases:**

- **Transaction History:** Show completed unlocks
- **Portfolio Updates:** Update balances after unlock
- **Notifications:** Alert users of successful unlocks
- **Audit Trail:** Track all unlock events

---

## Advanced Query Capabilities

### Operator Discovery Queries

```graphql
# Find operators by domain and tax rate
query findOperators($domainId: String!, $maxTax: Int!) {
  operatorRegistrations(
    where: { domainId: $domainId, nominationTax_lte: $maxTax }
    orderBy: nominationTax_ASC
  ) {
    owner
    nominationTax
    minimumNominatorStake
  }
}
```

### Performance Analysis Queries

```graphql
# Get operator performance history
query operatorPerformance($operatorId: String!, $epochs: Int!) {
  operatorEpochSharePrices(
    where: { operatorId: $operatorId }
    orderBy: epochIndex_DESC
    first: $epochs
  ) {
    epochIndex
    sharePrice
    totalStake
    timestamp
  }
}
```

### Portfolio Queries

```graphql
# Get user's complete staking portfolio
query userPortfolio($address: String!) {
  nominatorDeposits(where: { address: $address }) {
    operatorId
    domainId
    knownShares
    pendingAmount
    pendingEffectiveDomainEpoch
  }

  nominatorWithdrawals(where: { address: $address }) {
    operatorId
    totalWithdrawalAmount
    withdrawalInSharesUnlockBlock
  }
}
```

---

## Integration Benefits

### Enhanced UX Capabilities

**Real-Time Data:**

- Live operator rankings and performance metrics
- Portfolio value calculations with historical context
- Accurate APR calculations based on real reward data

**Historical Analysis:**

- Operator performance trends over time
- Portfolio value evolution
- Reward distribution patterns

**Smart Defaults:**

- Suggest operators based on performance and fees
- Recommend optimal staking amounts
- Predict unlock timing accurately

### Performance Advantages

**Reduced Load:**

- Pre-processed data eliminates complex RPC calculations
- Efficient GraphQL queries vs multiple SDK calls
- Cached results for fast page loads

**Rich Filtering:**

- Complex operator discovery queries
- Portfolio analysis across multiple operators
- Historical performance comparisons

---

## Implementation Strategy

### Phase 1: Core Data Integration

1. **Operator Discovery** - Replace mock data with indexed operator list
2. **Portfolio View** - Show real positions from NominatorDeposit entities
3. **Withdrawal Tracking** - Display pending withdrawals and unlock status

### Phase 2: Performance Metrics

1. **APR Calculations** - Use OperatorEpochSharePrice for accurate rates
2. **Historical Charts** - Show operator performance over time
3. **Reward Tracking** - Display reward distribution history

### Phase 3: Advanced Features

1. **Smart Recommendations** - Suggest operators based on performance
2. **Portfolio Analytics** - Show detailed position analysis
3. **Predictive Modeling** - Estimate future returns

---

## Technical Considerations

### Data Freshness

- **Near Real-Time:** Indexed data typically 1-2 blocks behind chain
- **Processing Status:** Use `processed: Boolean` fields for status
- **Fallback Strategy:** Combine with Auto SDK for latest block data

### Query Optimization

- **Pagination:** Use `first/skip` for large result sets
- **Indexing:** Leverage `@index` fields for fast queries
- **Caching:** Cache frequent queries to reduce load

### Error Handling

- **Missing Data:** Handle cases where indexer is catching up
- **Processing Delays:** Show appropriate loading states
- **Fallback Modes:** Graceful degradation to SDK-only data

---

## Related Resources

- **Auto SDK Integration:** `/resources/auto-sdk-integration.md`
- **Protocol Insights:** `/resources/protocol-insights.md`
- **Staking Data Requirements:** `/staking-data/`

---

_This indexed data provides the foundation for a rich, performant staking interface that would be impossible with RPC calls alone._
