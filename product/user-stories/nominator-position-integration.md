# 📊 Feature: Nominator Position Integration

**Priority:** High  
**Type:** Backend Integration + Portfolio Display  
**Prerequisites:** ✅ Wallet connection system, ✅ Auto SDK integration

---

## 📋 Summary

Integrate user's current staking positions across operators using Auto SDK's `nominatorPosition()` function to display real portfolio data, pending operations, and position analytics.

**Current State:**

- Dashboard shows mock portfolio data
- No visibility into user's actual staking positions
- No pending operations tracking

**Target State:**

- Real position data from RPC via `nominatorPosition()` calls
- Portfolio summary with total value and active positions count
- Detailed positions table with operator-specific data
- Pending deposits/withdrawals with timing information

---

## 👤 User Story

> **As a** connected wallet user who has staked tokens  
> **I want to** see my current positions across all operators with real-time values  
> **So that** I can track my portfolio performance and manage pending operations

---

## ✅ Acceptance Criteria

### **Position Data Integration**

- [ ] **Fetch user positions** across target operators (0, 1, 3) via `nominatorPosition()` calls
- [ ] **Display position values** calculated from shares × current share price
- [ ] **Show operator details** for each position (name, domain, status)
- [ ] **Handle empty positions** gracefully (no stakes with operator)
- [ ] **Position auto-refresh** every 30 seconds

### **Portfolio Analytics**

- [ ] **Calculate total portfolio value** from all positions
- [ ] **Active positions count** (operators with stakes > 0)
- [ ] **Position status indicators** (active, pending, withdrawing)
- [ ] **Storage fee deposits** displayed per position
- [ ] **Portfolio summary cards** in dashboard

### **Pending Operations Display**

- [ ] **Pending deposits** with effective epoch timing
- [ ] **Pending withdrawals** with unlock block information
- [ ] **Visual indicators** for pending states
- [ ] **Timing calculations** (epochs remaining, blocks to unlock)
- [ ] **Operation counts** in portfolio summary

### **Error Handling & UX**

- [ ] **Loading states** during position fetching
- [ ] **Error states** for network failures
- [ ] **Empty state** when no positions exist
- [ ] **Partial data handling** when some operators fail
- [ ] **Retry mechanisms** for failed position calls

---

## 🏗️ Technical Requirements

### **New Components to Create**

```
src/components/positions/
├── PositionSummary.tsx        # Portfolio overview cards
├── ActivePositionsTable.tsx   # Detailed positions table
├── PendingOperations.tsx      # Pending deposits/withdrawals
└── index.ts                   # Exports

src/services/
└── position-service.ts        # RPC position fetching

src/hooks/
└── use-positions.ts          # Position fetching with auto-refresh

src/types/
└── position.ts               # Position type definitions
```

### **Files to Modify**

```
src/pages/StakingPage.tsx                  # Dashboard integration
src/components/layout/Layout.tsx           # Add positions to navigation
```

### **Package Dependencies**

```bash
# Already available
@autonomys/auto-consensus  # For nominatorPosition() calls
@autonomys/auto-utils      # For RPC connection
```

---

## 🔧 Implementation Details

### **1. Position Service (Core RPC Integration)**

```typescript
// src/services/position-service.ts
import { activate } from '@autonomys/auto-utils';
import { nominatorPosition, operator } from '@autonomys/auto-consensus';
import { formatAI3 } from '@/utils/unit-conversion';

const TARGET_OPERATORS = ['0', '3']; // Same as operator service

export interface UserPosition {
  operatorId: string;
  operatorName: string;
  positionValue: string; // Current value in AI3
  storageFeeDeposit: string;
  pendingDeposits: Array<{
    amount: string;
    effectiveEpoch: number;
  }>;
  pendingWithdrawals: Array<{
    amount: string;
    unlockAtBlock: number;
  }>;
  status: 'active' | 'pending' | 'withdrawing';
  lastUpdated: Date;
}

export interface PortfolioSummary {
  totalValue: string; // Total portfolio value in AI3
  activePositions: number; // Number of operators staked to
  totalEarned: string; // Future: requires cost basis from indexer
  pendingDeposits: number; // Count of pending operations
  pendingWithdrawals: number;
  totalStorageFee: string; // Total storage fee deposits
}

export const fetchUserPositions = async (address: string): Promise<UserPosition[]> => {
  const api = await activate({ networkId: 'taurus' });

  try {
    const positions: UserPosition[] = [];

    // Check positions across target operators in parallel
    const positionPromises = TARGET_OPERATORS.map(async operatorId => {
      try {
        const [positionData, operatorData] = await Promise.all([
          nominatorPosition(api, operatorId, address),
          operator(api, operatorId),
        ]);

        // Only include if user has a position (knownValue > 0)
        if (positionData.knownValue > 0n) {
          return {
            operatorId,
            operatorName: `Operator ${operatorId}`,
            positionValue: formatAI3(positionData.knownValue.toString()),
            storageFeeDeposit: formatAI3(positionData.storageFeeDeposit.toString()),
            pendingDeposits: positionData.pendingDeposits.map(deposit => ({
              amount: formatAI3(deposit.amount.toString()),
              effectiveEpoch: deposit.effectiveEpoch,
            })),
            pendingWithdrawals: positionData.pendingWithdrawals.map(withdrawal => ({
              amount: formatAI3(withdrawal.amount.toString()),
              unlockAtBlock: withdrawal.unlockAtBlock,
            })),
            status:
              positionData.pendingWithdrawals.length > 0
                ? 'withdrawing'
                : positionData.pendingDeposits.length > 0
                  ? 'pending'
                  : 'active',
            lastUpdated: new Date(),
          };
        }
        return null;
      } catch (error) {
        console.warn(`No position found for operator ${operatorId}:`, error);
        return null;
      }
    });

    const results = await Promise.all(positionPromises);
    return results.filter(Boolean) as UserPosition[];
  } finally {
    await api.disconnect();
  }
};

export const calculatePortfolioSummary = (positions: UserPosition[]): PortfolioSummary => {
  const totalValue = positions.reduce((sum, pos) => {
    const value = parseFloat(pos.positionValue.replace(' AI3', ''));
    return sum + value;
  }, 0);

  const totalStorageFee = positions.reduce((sum, pos) => {
    const storageFee = parseFloat(pos.storageFeeDeposit.replace(' AI3', ''));
    return sum + storageFee;
  }, 0);

  const totalPendingDeposits = positions.reduce((sum, pos) => sum + pos.pendingDeposits.length, 0);
  const totalPendingWithdrawals = positions.reduce(
    (sum, pos) => sum + pos.pendingWithdrawals.length,
    0,
  );

  return {
    totalValue: `${totalValue.toFixed(4)} AI3`,
    activePositions: positions.length,
    totalEarned: '0 AI3', // Will need cost basis calculation later
    pendingDeposits: totalPendingDeposits,
    pendingWithdrawals: totalPendingWithdrawals,
    totalStorageFee: `${totalStorageFee.toFixed(4)} AI3`,
  };
};
```

### **2. Position Hook with Auto-refresh**

```typescript
// src/hooks/use-positions.ts
import { useState, useEffect } from 'react';
import { useWallet } from './use-wallet';
import {
  fetchUserPositions,
  calculatePortfolioSummary,
  type UserPosition,
  type PortfolioSummary,
} from '@/services/position-service';

export const usePositions = (refreshInterval = 30000) => {
  const { isConnected, selectedAccount } = useWallet();
  const [positions, setPositions] = useState<UserPosition[]>([]);
  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPositions = async () => {
    if (!isConnected || !selectedAccount) {
      setPositions([]);
      setPortfolioSummary(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const userPositions = await fetchUserPositions(selectedAccount.address);
      const summary = calculatePortfolioSummary(userPositions);

      setPositions(userPositions);
      setPortfolioSummary(summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch positions');
      console.error('Position fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount and account change
  useEffect(() => {
    fetchPositions();
  }, [isConnected, selectedAccount?.address]);

  // Auto-refresh
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(fetchPositions, refreshInterval);
    return () => clearInterval(interval);
  }, [isConnected, refreshInterval]);

  return {
    positions,
    portfolioSummary,
    loading,
    error,
    refetch: fetchPositions,
    hasPositions: positions.length > 0,
  };
};
```

### **3. Active Positions Table Component**

```typescript
// src/components/positions/ActivePositionsTable.tsx
import { usePositions } from '@/hooks/use-positions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const ActivePositionsTable: React.FC = () => {
  const { positions, loading, error } = usePositions();

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="animate-pulse">Loading positions...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            Failed to load positions: {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (positions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Positions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            <p>No active positions found</p>
            <p className="text-sm">Stake with an operator to see your positions here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Positions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {positions.map((position) => (
            <div key={position.operatorId} className="flex justify-between items-center p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h4 className="font-medium">{position.operatorName}</h4>
                  <Badge variant={
                    position.status === 'active' ? 'default' :
                    position.status === 'pending' ? 'secondary' : 'destructive'
                  }>
                    {position.status}
                  </Badge>
                </div>

                {/* Pending operations summary */}
                <div className="mt-2 text-sm text-muted-foreground">
                  {position.pendingDeposits.length > 0 && (
                    <div className="text-yellow-600">
                      {position.pendingDeposits.length} pending deposit{position.pendingDeposits.length > 1 ? 's' : ''}
                    </div>
                  )}
                  {position.pendingWithdrawals.length > 0 && (
                    <div className="text-orange-600">
                      {position.pendingWithdrawals.length} pending withdrawal{position.pendingWithdrawals.length > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>

              <div className="text-right">
                <div className="font-medium text-lg">{position.positionValue}</div>
                <div className="text-sm text-muted-foreground">
                  Storage: {position.storageFeeDeposit}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
```

### **4. Portfolio Summary Cards**

```typescript
// src/components/positions/PositionSummary.tsx
import { usePositions } from '@/hooks/use-positions';
import { Card, CardContent } from '@/components/ui/card';

export const PositionSummary: React.FC = () => {
  const { portfolioSummary, loading } = usePositions();

  const summaryCards = [
    {
      label: 'Position Value',
      value: portfolioSummary?.totalValue || '0 AI3',
      subtitle: 'Current worth',
    },
    {
      label: 'Active Positions',
      value: portfolioSummary?.activePositions.toString() || '0',
      subtitle: 'Operators staked to',
    },
    {
      label: 'Storage Deposits',
      value: portfolioSummary?.totalStorageFee || '0 AI3',
      subtitle: 'Total locked in storage',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {summaryCards.map((card) => (
        <Card key={card.label}>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {loading ? (
                  <span className="animate-pulse">---</span>
                ) : (
                  card.value
                )}
              </div>
              <div className="text-sm font-medium text-muted-foreground mt-1">
                {card.label}
              </div>
              <div className="text-xs text-muted-foreground">
                {card.subtitle}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
```

---

## 🧪 Testing Requirements

### **Unit Tests**

- [ ] Position service RPC calls and calculations
- [ ] Portfolio summary calculations
- [ ] Position hook auto-refresh logic
- [ ] Position status determination logic
- [ ] Error handling scenarios

### **Integration Tests**

- [ ] Position fetching across multiple operators
- [ ] Empty position handling
- [ ] Pending operations data mapping
- [ ] Auto-refresh behavior
- [ ] Network failure recovery

### **Manual Testing**

- [ ] User with positions → displays correctly
- [ ] User without positions → shows empty state
- [ ] Pending deposits → shown with epoch timing
- [ ] Pending withdrawals → shown with unlock blocks
- [ ] Position auto-refresh → updates every 30 seconds
- [ ] Multiple positions → all operators displayed
- [ ] Network disconnect → error handling works

---

## 🎯 Definition of Done

- [ ] **Real position data** fetched via `nominatorPosition()` calls
- [ ] **Portfolio summary** showing total value and active positions
- [ ] **Active positions table** with operator details and status
- [ ] **Pending operations** displayed with timing information
- [ ] **Auto-refresh** positions every 30 seconds
- [ ] **Loading and error states** properly handled
- [ ] **Empty state** when no positions exist
- [ ] **Mobile responsive** design
- [ ] **Unit tests passing** for all position logic
- [ ] **Integration tests** for RPC calls
- [ ] **Manual testing completed** with various position states

---

## 📚 References

- **[Auto SDK Position Documentation](https://develop.autonomys.xyz/sdk/auto-consensus#nominator-position)** - API reference
- **[Dashboard Requirements](../staking-data/dashboard.md)** - Data specifications
- **[Portfolio Requirements](../staking-data/portfolio.md)** - Portfolio data needs
- **[Position Calculator Script](../../auto-sdk/scripts/staking-position-calculator.ts)** - Reference implementation

---

## 🔄 Future Enhancements

Once this foundation is complete, future user stories can add:

- **Cost basis tracking** via indexer integration
- **Realized/unrealized gains** calculations
- **APY calculations** per position
- **Transaction history** per position
- **Position performance** analytics over time

---

_This user story establishes the foundation for real portfolio tracking using Auto SDK position data._
