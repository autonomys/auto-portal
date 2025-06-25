# 🔗 Feature: Auto SDK Integration for Real Data

**Priority:** High  
**Type:** Backend Integration + Data Layer  
**Parent Epic:** Staking Flow V1  
**Prerequisites:** ✅ [Staking Form UI Mockup](./staking-form-mockup.md) - **COMPLETE**

---

## 📋 Summary

Replace mock data with real blockchain data using Auto SDK and RPC calls. This enables the staking interface to display live operator information, real user balances, and perform actual blockchain queries.

**Current State:** ✅ UI displays mock operator data and fake balances  
**Target State:** 🎯 UI displays real operator data from Taurus testnet via Auto SDK

---

## 👤 User Story

> **As a** user of the staking interface  
> **I want to** see real operator data, live balances, and current network state  
> **So that** I can make informed staking decisions based on actual blockchain data

---

## ✅ Acceptance Criteria

### **Core Data Integration**

- [ ] **Replace mock operator service** with Auto SDK calls
- [ ] **Display real operator data** for operators 0, 1, and 3
- [ ] **Show live user balances** from connected wallet
- [ ] **Handle missing/inactive operators** gracefully
- [ ] **Update domain filtering** to use real domain data

### **Auto SDK Integration**

- [ ] **Install Auto SDK packages** (`@autonomys/auto-consensus`, `@autonomys/auto-utils`)
- [ ] **Establish RPC connection** to Taurus testnet (`wss://rpc.taurus.autonomys.xyz/ws`)
- [ ] **Implement error handling** for network failures and API errors
- [ ] **Add proper unit conversion** (Shannon ↔ AI3)
- [ ] **Cache API responses** appropriately (30s operators, 10s balances)

### **Data Accuracy**

- [ ] **Operator information** matches blockchain state
- [ ] **Balance calculations** include storage fund allocation (20%)
- [ ] **Status indicators** reflect real operator states
- [ ] **Commission rates** display accurate percentages
- [ ] **Minimum stakes** enforce actual operator requirements

### **Performance & UX**

- [ ] **Loading states** during data fetching
- [ ] **Error states** for network issues
- [ ] **Fallback behavior** when operators don't exist
- [ ] **Auto-refresh** operator data every 30 seconds
- [ ] **Connection management** (singleton API instance)

---

## 🏗️ Technical Requirements

### **Package Installation**

```bash
yarn add @autonomys/auto-consensus @autonomys/auto-utils
```

### **New Files to Create**

```
src/services/
├── blockchain-service.ts      # Core blockchain data integration
├── connection-service.ts      # RPC connection management
└── operator-mapper-service.ts # Map RPC data to UI types

src/utils/
├── unit-conversion.ts         # Shannon ↔ AI3 conversion
└── error-handling.ts          # SDK error handling

src/types/
└── blockchain.ts             # Auto SDK type definitions
```

### **Files to Modify**

```
src/services/operator-service.ts    # Rename to operator-service.ts & replace mock with real data
src/stores/operator-store.ts        # Add loading/error states
src/stores/wallet-store.ts          # Add API connection
src/hooks/use-operators.ts          # Update for real data
src/components/operators/           # Update for loading states
```

### **File Naming Cleanup (Standardize on kebab-case)**

```
# Rename existing inconsistent file:
src/services/operatorService.ts → src/services/operator-service.ts

# Update all imports that reference operatorService.ts to use the new name
# Find and replace imports across the codebase:
- import { operatorService } from '@/services/operatorService'
+ import { operatorService } from '@/services/operator-service'
```

### **Import Updates Required**

Files that likely import the renamed service:

- `src/hooks/use-operators.ts`
- `src/stores/operator-store.ts`
- `src/components/operators/` (any components using the service)
- `src/pages/operators.tsx`

---

## 📊 Target Operator IDs

Per requirements, hardcode these specific operators for initial integration:

- **Operator 0**
- **Operator 1**
- **Operator 3**

These operators should be fetched via RPC and displayed if they exist and are active.

---

## 🔧 Implementation Details

### **1. RPC Connection Service**

```typescript
// src/services/connection-service.ts
import { createConnection, ApiPromise } from '@autonomys/auto-utils';

const RPC_ENDPOINT = 'wss://rpc.taurus.autonomys.xyz/ws';
let apiInstance: ApiPromise | null = null;

export const getApiConnection = async (): Promise<ApiPromise> => {
  if (!apiInstance || !apiInstance.isConnected) {
    apiInstance = await createConnection(RPC_ENDPOINT);
  }
  return apiInstance;
};

export const disconnectApi = (): void => {
  if (apiInstance) {
    apiInstance.disconnect();
    apiInstance = null;
  }
};
```

### **2. Blockchain Data Service**

```typescript
// src/services/blockchain-service.ts
import { operators, operator, balance, domains } from '@autonomys/auto-consensus';
import { getApiConnection } from './connection-service';
import { mapRpcOperatorToUi } from './operator-mapper-service';

const TARGET_OPERATORS = ['0', '1', '3'];

export const fetchOperators = async (): Promise<Operator[]> => {
  const api = await getApiConnection();

  const operatorPromises = TARGET_OPERATORS.map(async id => {
    try {
      const operatorData = await operator(api, id);
      return mapRpcOperatorToUi(operatorData, id);
    } catch (error) {
      console.warn(`Operator ${id} not found or inactive`);
      return null;
    }
  });

  const results = await Promise.all(operatorPromises);
  return results.filter(Boolean) as Operator[];
};

export const fetchUserBalance = async (address: string): Promise<string> => {
  const api = await getApiConnection();
  const balanceData = await balance(api, address);
  return shannonToAi3(balanceData.free);
};

export const fetchDomains = async (): Promise<Domain[]> => {
  const api = await getApiConnection();
  return await domains(api);
};
```

### **3. Unit Conversion Utilities**

```typescript
// src/utils/unit-conversion.ts
export const ai3ToShannon = (ai3Amount: number): string => {
  return (ai3Amount * Math.pow(10, 18)).toString();
};

export const shannonToAi3 = (shannonAmount: string): number => {
  return parseInt(shannonAmount) / Math.pow(10, 18);
};

export const formatAi3 = (shannonAmount: string, decimals: number = 4): string => {
  return shannonToAi3(shannonAmount).toFixed(decimals);
};
```

### **4. Data Mapping Service**

```typescript
// src/services/operator-mapper-service.ts
import { formatAi3 } from '@/utils/unit-conversion';
import type { Operator, OperatorStatus } from '@/types/operator';

export const mapRpcOperatorToUi = (rpcOperator: any, operatorId: string): Operator => {
  return {
    id: operatorId,
    name: `Operator ${operatorId}`,
    domainId: '0',
    domainName: 'Auto EVM',
    totalStaked: formatAi3(rpcOperator.currentTotalStake),
    ownStake: formatAi3(rpcOperator.currentTotalStake),
    nominatorCount: 0, // Approximation for now
    commissionRate: parseFloat(rpcOperator.nominationTax) / 100,
    status: mapOperatorStatus(rpcOperator.status),
    minimumStake: formatAi3(rpcOperator.minimumNominatorStake),
    ownerAccount: rpcOperator.signingKey,
    nominationTax: parseFloat(rpcOperator.nominationTax),
    currentAPY: 0, // Will need separate calculation
    poolCapacity: 0, // Will need separate calculation
    isRecommended: false, // Algorithm-based recommendation
  };
};

const mapOperatorStatus = (rpcStatus: string): OperatorStatus => {
  switch (rpcStatus) {
    case 'Active':
      return 'active';
    case 'Slashed':
      return 'slashed';
    case 'Deregistered':
      return 'inactive';
    default:
      return 'inactive';
  }
};
```

### **5. Updated Operator Service**

```typescript
// src/services/operator-service.ts (rename & update existing file)
import { fetchOperators } from './blockchain-service';
import type { Operator, OperatorDetails, OperatorStats } from '@/types/operator';

export const operatorService = {
  getAllOperators: async (): Promise<Operator[]> => {
    try {
      return await fetchOperators();
    } catch (error) {
      console.error('Failed to fetch operators from blockchain:', error);
      // Fallback to empty array or cached data
      return [];
    }
  },

  getOperatorById: async (operatorId: string): Promise<OperatorDetails | null> => {
    try {
      const operators = await fetchOperators();
      const operator = operators.find(op => op.id === operatorId);

      if (!operator) return null;

      // Convert to OperatorDetails format
      return {
        ...operator,
        description: `Operator ${operatorId} on Auto EVM domain`,
        website: '',
        social: {},
        apyHistory: [], // Will need separate calculation
      };
    } catch (error) {
      console.error(`Failed to fetch operator ${operatorId}:`, error);
      return null;
    }
  },

  getOperatorStats: async (): Promise<OperatorStats> => {
    try {
      const operators = await fetchOperators();

      const totalStaked = operators
        .reduce((sum, op) => sum + parseFloat(op.totalStaked), 0)
        .toString();

      return {
        sharePrice: '1.0000',
        totalShares: totalStaked,
        totalStaked,
        nominatorCount: operators.reduce((sum, op) => sum + op.nominatorCount, 0),
      };
    } catch (error) {
      console.error('Failed to fetch operator stats:', error);
      return {
        sharePrice: '1.0000',
        totalShares: '0',
        totalStaked: '0',
        nominatorCount: 0,
      };
    }
  },
};
```

### **6. Updated Operator Store**

```typescript
// src/stores/operator-store.ts
interface OperatorState {
  operators: Operator[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;

  // Actions
  fetchOperators: () => Promise<void>;
  refreshOperators: () => Promise<void>;
  clearError: () => void;
}

export const useOperatorStore = create<OperatorState>((set, get) => ({
  operators: [],
  loading: false,
  error: null,
  lastUpdated: null,

  fetchOperators: async () => {
    set({ loading: true, error: null });

    try {
      const operators = await operatorService.getAllOperators();
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

  refreshOperators: async () => {
    await get().fetchOperators();
  },

  clearError: () => set({ error: null }),
}));
```

---

## 🧪 Testing Requirements

### **Unit Tests**

- [ ] **Unit conversion functions** (Shannon ↔ AI3)
- [ ] **Data mapping functions** (RPC → UI types)
- [ ] **Error handling scenarios** (network failures, missing operators)
- [ ] **Caching logic** (connection management)

### **Integration Tests**

- [ ] **RPC connection establishment**
- [ ] **Operator data fetching** for target IDs
- [ ] **Balance queries** with real addresses
- [ ] **Error recovery** from network issues

### **Manual Testing Scenarios**

- [ ] **Load operators page** → Should show real data for operators 0, 1, 3
- [ ] **Connect wallet** → Should display real balance
- [ ] **Disconnect network** → Should show error state gracefully
- [ ] **Wait 30 seconds** → Should auto-refresh operator data
- [ ] **Invalid operator ID** → Should handle gracefully

---

## 🔍 Definition of Done

- [ ] **All mock data replaced** with Auto SDK calls
- [ ] **Real operator data displayed** for operators 0, 1, 3
- [ ] **Live balance queries** working for connected wallets
- [ ] **Error handling implemented** for all network scenarios
- [ ] **Loading states** visible during data fetching
- [ ] **Auto-refresh working** every 30 seconds
- [ ] **Unit tests passing** for all utility functions
- [ ] **Integration tests passing** for API calls
- [ ] **Manual testing completed** without errors
- [ ] **Performance acceptable** (< 2s initial load, < 500ms refresh)

---

## 📚 Resources

- **[Auto SDK Documentation](../resources/auto-sdk-integration.md)** - Comprehensive integration guide
- **[Auto SDK Consensus Docs](https://develop.autonomys.xyz/sdk/auto-consensus)** - Official API reference
- **[Auto SDK GitHub](https://github.com/autonomys/auto-sdk)** - Source code and examples
- **[Taurus Testnet RPC](wss://rpc.taurus.autonomys.xyz/ws)** - Target endpoint

---

## 🔄 Implementation Strategy Update

**Status Change:** This epic has been **completed** as a planning document and **broken into component-specific issues** for practical implementation.

### **Component-Specific Issues**

Instead of implementing this as one large issue, this has been split into focused component issues:

1. **[Operator Discovery RPC](./operator-discovery-rpc.md)** - 🆕 **READY** - Replace mock operator data
2. **User Balance RPC** - Next - Real wallet balance integration
3. **Staking Form RPC** - Future - Real validation with RPC data
4. **Portfolio RPC** - Future - Current positions from blockchain
5. **Dashboard RPC** - Future - Real-time overview data

### **Benefits of Component Approach**

- **Manageable scope** - Each issue can be completed independently
- **Parallel development** - Multiple developers can work simultaneously
- **Incremental delivery** - Users see progress component by component
- **Clear testing** - Focused testing per component
- **Easier debugging** - Isolated failure points

### **Resources Created**

- **[Simplified Auto SDK Guide](../resources/auto-sdk-integration.md)** - Essential functions only
- **[Data Architecture Analysis](../staking-data/)** - Component data requirements
- **Component-specific implementation plans** - Ready for development

---

## 🚀 Next Steps

1. **Start with Operator Discovery** - [operator-discovery-rpc.md](./operator-discovery-rpc.md)
2. **Implement components incrementally** - RPC data first, indexer features later
3. **Real transactions** - After all components have real data integration
4. **Advanced features** - Performance optimization, caching, etc.

---

_This epic is now **complete** as a planning document. Implementation continues via component-specific issues._
