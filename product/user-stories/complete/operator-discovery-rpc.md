# 🔗 Component Issue: Operator Discovery RPC Integration

**Parent:** [Auto SDK Integration](./auto-sdk-integration.md)  
**Component:** Operator marketplace/discovery  
**Priority:** High  
**Focus:** Replace mock operator data with real RPC calls

---

## 📝 Summary

Replace mock operator data in the discovery interface with real Auto SDK calls for operators 0, 1, and 3.

**Current:** Mock data from `operatorService.getAllOperators()`  
**Target:** Real operator configs from Taurus testnet RPC

---

## ✅ Acceptance Criteria

### RPC Data Integration

- [ ] **Fetch real operator configs** for operators 0, 1, 3 via `operator(api, id)`
- [ ] **Get domain information** via `domains(api)` for operator domain names
- [ ] **Handle missing operators** gracefully (if operator doesn't exist)
- [ ] **Map RPC data** to existing UI `Operator` interface
- [ ] **Show loading states** during data fetching

### Data Accuracy

- [ ] **Tax rates** from `operatorDetails.nominationTax`
  - [ ] **Minimum stakes** from `operatorDetails.minimumNominatorStake` (Shannon → AI3)
  - [ ] **Total staked** from `operatorDetails.currentTotalStake` (Shannon → AI3)
- [ ] **Operator status** from `operatorDetails.status` object
- [ ] **Domain names** from domain registry lookup

### Error Handling

- [ ] **Network failures** show error state in UI
- [ ] **Missing operators** filtered out gracefully
- [ ] **Retry mechanism** for failed API calls
- [ ] **Fallback message** when no operators available

---

## 🔧 Implementation Plan

### 1. Update Operator Service (Always Use RPC)

```typescript
// src/services/operator-service.ts
import { activate } from '@autonomys/auto-utils';
import { operator, domains } from '@autonomys/auto-consensus';
import { mapToUiOperator } from './operator-mapper';

const TARGET_OPERATORS = ['0', '1', '3'];

export const getAllOperators = async (): Promise<Operator[]> => {
  const api = await activate({ networkId: 'taurus' });

  try {
    const [operatorResults, domainList] = await Promise.all([
      Promise.all(TARGET_OPERATORS.map(id => fetchOperator(api, id))),
      domains(api),
    ]);

    return operatorResults.filter(Boolean).map(rawData => mapToUiOperator(rawData, domainList));
  } finally {
    await api.disconnect();
  }
};

export const getOperatorById = async (id: string): Promise<Operator | null> => {
  const api = await activate({ networkId: 'taurus' });

  try {
    const [rawData, domainList] = await Promise.all([fetchOperator(api, id), domains(api)]);

    return rawData ? mapToUiOperator(rawData, domainList) : null;
  } finally {
    await api.disconnect();
  }
};

// Helper function
const fetchOperator = async (api, operatorId: string) => {
  try {
    return await operator(api, operatorId);
  } catch (error) {
    console.warn(`Operator ${operatorId} not found:`, error);
    return null;
  }
};
```

### 2. Data Mapping (Real Data + Mock Unavailable Fields)

```typescript
// src/services/operator-mapper.ts
import type { Operator, OperatorStatus } from '@/types/operator';
import { formatAI3 } from '@/utils/unit-conversion';

export const mapToUiOperator = (rawOperator: any, domains: any[]): Operator => {
  const domainInfo = domains.find(d => d.domainId === rawOperator.currentDomainId.toString());

  return {
    // Real RPC data
    id: rawOperator.operatorId.toString(),
    name: `Operator ${rawOperator.operatorId}`,
    domainId: rawOperator.currentDomainId.toString(),
    domainName: domainInfo?.domainConfig.domainName || 'Unknown Domain',
    totalStaked: formatAI3(rawOperator.currentTotalStake),
    ownStake: formatAI3(rawOperator.currentTotalStake), // Approximation for now
    commissionRate: rawOperator.nominationTax,
    status: mapOperatorStatus(rawOperator.status),
    minimumStake: formatAI3(rawOperator.minimumNominatorStake),
    ownerAccount: rawOperator.signingKey,

    // Mock fields (not available from RPC yet)
    nominatorCount: generateMockNominatorCount(rawOperator.operatorId),
    currentAPY: generateMockAPY(rawOperator.operatorId),
    isRecommended: rawOperator.operatorId.toString() === '1',
  };
};

const mapOperatorStatus = (rpcStatus: any): OperatorStatus => {
  if (rpcStatus.registered !== undefined) return 'active';
  if (rpcStatus.slashed !== undefined) return 'slashed';
  return 'inactive';
};

// Mock helper functions for unavailable data
const generateMockNominatorCount = (operatorId: any): number => {
  // Generate consistent but varied mock data based on operator ID
  const id = Number(operatorId);
  return Math.floor((id + 1) * 15 + Math.sin(id) * 10);
};

const generateMockAPY = (operatorId: any): number | null => {
  // Generate realistic APY values or null for some operators
  const id = Number(operatorId);
  if (id === 0) return null; // Show "Coming soon" for operator 0
  return Math.round((12 + Math.sin(id) * 3) * 100) / 100; // 9-15% range
};
```

### 3. Unit Conversion Utilities

```typescript
// src/utils/unit-conversion.ts
const AI3_DECIMALS = 18;

export const formatAI3 = (shannon: bigint, decimals = 4): string => {
  const ai3Value = Number(shannon) / Math.pow(10, AI3_DECIMALS);
  return `${ai3Value.toFixed(decimals)} AI3`;
};

export const ai3ToShannon = (ai3: number | string): bigint => {
  const amount = typeof ai3 === 'string' ? parseFloat(ai3) : ai3;
  return BigInt(Math.floor(amount * Math.pow(10, AI3_DECIMALS)));
};
```

### 4. Store Updates (Minimal Changes)

```typescript
// src/stores/operator-store.ts (update existing)
import { getAllOperators } from '@/services/operator-service';

interface OperatorState {
  operators: Operator[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  // ... existing fields
}

const useOperatorStore = create<OperatorState>((set, get) => ({
  operators: [],
  loading: false,
  error: null,
  lastUpdated: null,

  // Actions
  fetchOperators: async () => {
    set({ loading: true, error: null });

    try {
      const operators = await getAllOperators();
      set({
        operators,
        loading: false,
        lastUpdated: new Date(),
      });
    } catch (error) {
      set({
        error: error.message,
        loading: false,
      });
    }
  },

  // ... existing actions
}));
```

---

## 📊 Data Sources

### From RPC (Real Data)

- ✅ Operator IDs (0, 1, 3)
- ✅ Commission rates (`nominationTax`)
- ✅ Total staked (`currentTotalStake`)
- ✅ Minimum stakes (`minimumNominatorStake`)
- ✅ Operator status (`status`)
- ✅ Domain information (`currentDomainId` + domain lookup)
- ✅ Owner accounts (`signingKey`)

### Mocked (Until Indexer Available)

- 🎭 APY calculations (realistic mock values)
- 🎭 Nominator counts (consistent mock data)
- 🎭 Recommended status (operator 1 = recommended)

---

## 🔄 Future Migration Path

When the indexer is ready:

1. **Replace mock functions** in `operator-mapper.ts`:

   ```typescript
   // Replace this:
   nominatorCount: generateMockNominatorCount(rawOperator.operatorId),

   // With this:
   nominatorCount: await fetchNominatorCount(rawOperator.operatorId),
   ```

2. **Add indexer data** alongside RPC data:

   ```typescript
   const [rpcData, indexerData] = await Promise.all([
     fetchOperator(api, id),
     fetchIndexerData(id), // New indexer call
   ]);
   ```

3. **No changes needed** in store, UI, or other components

---

## 📁 Files to Modify

```
src/services/
├── operator-service.ts         ← UPDATE (RPC calls only)
└── operator-mapper.ts          ← NEW (real data + mock helpers)

src/utils/
└── unit-conversion.ts          ← NEW (Shannon ↔ AI3)

src/stores/
└── operator-store.ts           ← UPDATE (add loading states)
```

---

## 🎯 Definition of Done

- [ ] Operators 0, 1, 3 display real data from Taurus testnet
- [ ] Loading states show during RPC calls
- [ ] Error handling works for network failures
- [ ] Unit tests pass for all new functions
- [ ] Manual testing confirms data accuracy
- [ ] No breaking changes to existing UI
- [ ] **Easy to switch data sources via config**

---

## 🧪 Testing

### Unit Tests

- [ ] Test operator service with mocked data source
- [ ] Test data mapping functions
- [ ] Test error handling scenarios
- [ ] Test Shannon → AI3 conversion

### Integration Tests

- [ ] Test against live Taurus testnet
- [ ] Verify all target operators fetch correctly
- [ ] Test network failure recovery

### Manual Testing

- [ ] Load operators page → should show real data
- [ ] Disconnect network → should show error state
- [ ] Check operator details match blockchain

---

## 🎯 Definition of Done

- [ ] Operators 0, 1, 3 display real data from Taurus testnet
- [ ] Loading states show during RPC calls
- [ ] Error handling works for network failures
- [ ] Unit tests pass for all new functions
- [ ] Manual testing confirms data accuracy
- [ ] No breaking changes to existing UI
- [ ] **Easy to switch data sources via config**

---

## 🔄 Future Migration Path

When the indexer is ready:

1. **Update `getAllOperators()`** to add indexer logic:

   ```typescript
   const USE_INDEXER = import.meta.env.VITE_USE_INDEXER === 'true';

   if (USE_INDEXER) {
     return await fetchFromIndexer();
   }
   ```

2. **Update operator ID list** to include all available operators
3. **No changes needed** in store, UI, or other components

**Next Component:** User Balances (wallet connection + real balance display)
