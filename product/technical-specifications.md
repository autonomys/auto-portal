# Technical Specifications - Staking Application

**Version:** 0.1 (Draft)  
**Last Updated:** <!-- YYYY-MM-DD -->  
**Status:** Phase 2 - Design & Architecture

---

## 1. Overview

This document captures detailed technical decisions and specifications for implementing the staking application UI/UX. It focuses on calculations, data handling, and business logic that affects the user experience.

---

## 2. Position Value Calculations

### 2.1 Core Data Model

```typescript
interface StakingPosition {
  operatorId: string;

  // Cost basis tracking (for UI gains calculation)
  totalCostBasis: string; // Total AI3 invested by user

  // Protocol state (hidden from UI)
  sharesOwned: string;
  currentSharePrice: string;

  // Derived values (shown in UI)
  currentValue: string; // sharesOwned * currentSharePrice
  unrealizedGains: string; // currentValue - totalCostBasis
  gainsPercentage: number; // (unrealizedGains / totalCostBasis) * 100
}
```

### 2.2 Position Display Logic

**Primary Display Values:**

- **Position Value**: Current worth of all shares at current share price
- **Total Earned**: Unrealized gains (Position Value - Total Cost Basis)
- **Gains Percentage**: (Total Earned / Total Cost Basis) × 100

**Calculation Examples:**

```typescript
// Example position
const position = {
  totalCostBasis: "1000", // User invested 1,000 AI3 total
  sharesOwned: "980.39", // Owns 980.39 shares
  currentSharePrice: "1.0612", // Current share price
};

// Calculated display values
const currentValue = 980.39 * 1.0612 = 1,040.25 AI3
const unrealizedGains = 1,040.25 - 1,000 = +40.25 AI3
const gainsPercentage = (40.25 / 1,000) * 100 = +4.03%
```

---

## 3. Withdrawal Calculations

### 3.1 Cost Basis Reduction Method

**Decision: Proportional Cost Basis Reduction**

When a user withdraws a portion of their position, we reduce the cost basis proportionally to maintain accurate gains calculation.

**Rationale:**

- Aligns with share-based protocol mechanics
- Shares are fungible (can't withdraw "specific" shares)
- Maintains consistent gains percentage after partial withdrawals

### 3.2 Withdrawal Calculation Logic

```typescript
const calculateWithdrawal = (
  position: StakingPosition,
  withdrawalAmount: string,
): WithdrawalCalculation => {
  const currentValue = parseFloat(position.sharesOwned) * parseFloat(position.currentSharePrice);
  const withdrawalPercentage = parseFloat(withdrawalAmount) / currentValue;

  // Proportional cost basis reduction
  const costBasisReduction = parseFloat(position.totalCostBasis) * withdrawalPercentage;
  const realizedGains = parseFloat(withdrawalAmount) - costBasisReduction;

  // Remaining position after withdrawal
  const remainingCostBasis = parseFloat(position.totalCostBasis) - costBasisReduction;
  const remainingValue = currentValue - parseFloat(withdrawalAmount);
  const remainingGains = remainingValue - remainingCostBasis;

  return {
    withdrawalAmount: withdrawalAmount,
    costBasisReduction: costBasisReduction.toFixed(2),
    realizedGains: realizedGains.toFixed(2),
    remainingValue: remainingValue.toFixed(2),
    remainingCostBasis: remainingCostBasis.toFixed(2),
    remainingGains: remainingGains.toFixed(2),
  };
};
```

### 3.3 Withdrawal UI Preview

**Before Withdrawal:**

```
Position Value: 1,040.25 AI3
Total Invested: 1,000.00 AI3
Total Earned: +40.25 AI3 (+4.03%)
```

**Withdraw 300 AI3 (28.84% of position):**

```
Withdrawal Amount: 300.00 AI3
Cost Basis of Withdrawal: 288.40 AI3
Realized Gains: +11.60 AI3

After Withdrawal:
Remaining Value: 740.25 AI3
Remaining Cost Basis: 711.60 AI3
Remaining Gains: +28.65 AI3 (+4.03%)
```

**Note:** Gains percentage remains the same after proportional withdrawal.

---

## 4. Multiple Stakes Handling

### 4.1 Aggregated Cost Basis

When users make multiple stakes to the same operator, we maintain a running total of cost basis:

```typescript
const addStake = (
  existingPosition: StakingPosition,
  newStakeAmount: string,
  sharePrice: string,
): StakingPosition => {
  const newShares = parseFloat(newStakeAmount) / parseFloat(sharePrice);

  return {
    ...existingPosition,
    totalCostBasis: (
      parseFloat(existingPosition.totalCostBasis) + parseFloat(newStakeAmount)
    ).toString(),
    sharesOwned: (parseFloat(existingPosition.sharesOwned) + newShares).toString(),
  };
};
```

### 4.2 Example Multi-Stake Scenario

```
Stake #1: 1,000 AI3 when share price = 1.000 → 1,000 shares
Stake #2: 500 AI3 when share price = 1.050 → 476.19 shares

Combined Position:
- Total Cost Basis: 1,500 AI3
- Total Shares: 1,476.19 shares
- If current share price = 1.080:
  - Current Value: 1,476.19 × 1.080 = 1,594.29 AI3
  - Total Earned: 1,594.29 - 1,500 = +94.29 AI3 (+6.29%)
```

---

## 5. Real-Time Updates

### 5.1 Share Price Updates

**Update Frequency:**

- Critical updates: Every 10 seconds
- Background updates: Every 30 seconds
- On user interaction: Immediate refresh

**Calculation Chain:**

1. Fetch current share price from RPC
2. Update `currentValue = sharesOwned × currentSharePrice`
3. Recalculate `unrealizedGains = currentValue - totalCostBasis`
4. Update UI display values

### 5.2 Epoch Boundary Handling

**Special Considerations:**

- Share prices may change at epoch boundaries
- Pending withdrawals become available
- New stakes become active

**UI Behavior:**

- Show loading states during epoch transitions
- Refresh all position data after epoch boundary
- Update withdrawal status indicators

---

## 6. Error Handling & Edge Cases

### 6.1 Share Price Edge Cases

**Zero/Negative Share Price:**

- Should never happen in normal operation
- If detected, show error state and prevent transactions
- Log for investigation

**Extreme Price Changes:**

- If share price changes >50% in single update, flag for review
- Show warning to user before allowing transactions
- May indicate operator slashing event

### 6.2 Calculation Precision

**Decimal Precision:**

- Internal calculations: Use full precision (18 decimals)
- UI display: Round to 2-4 decimal places for readability
- Always round down for withdrawal amounts (prevent overdraft)

**Rounding Strategy:**

```typescript
const formatForDisplay = (amount: string, decimals: number = 2): string => {
  return parseFloat(amount).toFixed(decimals);
};

const formatForTransaction = (amount: string): string => {
  // Always round down to prevent overdraft
  return Math.floor(parseFloat(amount) * 1e18).toString();
};
```

---

## 7. Storage Requirements

### 7.1 Local Storage

**Required Data:**

- Position cost basis per operator
- Transaction history for audit trail
- User preferences (display settings)

**Data Structure:**

```typescript
interface StoredPosition {
  operatorId: string;
  totalCostBasis: string;
  stakeEvents: StakeEvent[];
  lastUpdated: number;
}

interface StakeEvent {
  timestamp: number;
  type: 'stake' | 'withdraw';
  aiAmount: string;
  sharePrice: string;
  transactionHash: string;
}
```

### 7.2 Data Persistence

**Backup Strategy:**

- Store in localStorage for persistence
- Sync with indexer when available
- Allow manual export/import for user backup

---

## 8. Open Technical Questions

| #   | Question                                                | Priority | Status | Notes                                    |
| --- | ------------------------------------------------------- | -------- | ------ | ---------------------------------------- |
| 1   | Should we cache share prices or always fetch real-time? | High     | Open   | Affects UI responsiveness vs accuracy    |
| 2   | How to handle position data if localStorage is cleared? | Medium   | Open   | Need indexer backup or chain scanning    |
| 3   | Precision requirements for share calculations?          | High     | Open   | Need to match protocol precision exactly |
| 4   | How to detect and handle operator slashing events?      | Medium   | Open   | Affects position value calculations      |
| 5   | Should we show separate positions for same operator?    | Low      | Open   | Current design aggregates all stakes     |

---

## 9. Testing Requirements

### 9.1 Calculation Testing

**Unit Tests Required:**

- Cost basis calculations with multiple stakes
- Proportional withdrawal calculations
- Edge cases (zero amounts, extreme values)
- Precision and rounding behavior

**Test Scenarios:**

```typescript
describe('Position Calculations', () => {
  test('single stake position display', () => {
    // Test basic position value calculation
  });

  test('multiple stakes aggregation', () => {
    // Test cost basis aggregation across multiple stakes
  });

  test('partial withdrawal calculations', () => {
    // Test proportional cost basis reduction
  });

  test('precision handling', () => {
    // Test rounding and precision edge cases
  });
});
```

---

## 10. Implementation Notes

### 10.1 Development Phases

**Phase 1: Basic Position Display**

- Single stake position calculations
- Simple withdrawal preview
- Real-time share price updates

**Phase 2: Multi-Stake Support**

- Aggregated cost basis tracking
- Complex withdrawal calculations
- Transaction history

**Phase 3: Advanced Features**

- Historical performance charts
- Detailed transaction breakdown
- Export capabilities

---

_This specification document will be updated as implementation progresses and edge cases are discovered._
