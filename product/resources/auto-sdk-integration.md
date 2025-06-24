# Auto SDK Integration Guide

**Source:** [Auto SDK Documentation](https://develop.autonomys.xyz/sdk/auto-consensus)  
**GitHub:** [autonomys/auto-sdk](https://github.com/autonomys/auto-sdk)  
**Date Created:** Current  
**Focus:** Staking operations and real data integration

---

## Package Overview

### `@autonomys/auto-consensus`

The core package for interacting with the Autonomys consensus layer, providing functions for:

- Account management and balance queries
- Staking operations (nominate, withdraw, unlock)
- Operator information and discovery
- Domain interactions
- Blockchain state queries

### Installation

```bash
# Using yarn (preferred for our project)
yarn add @autonomys/auto-consensus @autonomys/auto-utils

# Using npm
npm install @autonomys/auto-consensus @autonomys/auto-utils
```

---

## Key Staking Functions

### Operator Discovery

```typescript
import { operators, operator, domains } from '@autonomys/auto-consensus';
import { activate } from '@autonomys/auto-utils';

// Get all operators
const api = await activate({ networkId: 'taurus' });
const allOperators = await operators(api);

// Get specific operator details
const operatorDetails = await operator(api, '1');

// Get domain information
const domainList = await domains(api);
```

### Staking Operations

```typescript
import { nominateOperator, withdrawStake, unlockNominator } from '@autonomys/auto-consensus';
import { activateWallet, signAndSendTx } from '@autonomys/auto-utils';

// Nominate operator
const { api, accounts } = await activateWallet({
  networkId: 'taurus',
  mnemonic: 'your_mnemonic',
});

const tx = await nominateOperator({
  api,
  operatorId: '1',
  amountToStake: '5000000000000000000', // Amount in Shannon (smallest unit)
});

await signAndSendTx(accounts[0], tx);

// Withdraw stake (2-step process)
const withdrawTx = await withdrawStake({
  api,
  operatorId: '1',
  amount: '1000000000000000000',
});

await signAndSendTx(accounts[0], withdrawTx);

// Unlock after locking period
const unlockTx = await unlockNominator({
  api,
  operatorId: '1',
});

await signAndSendTx(accounts[0], unlockTx);
```

---

## Data Structures

### Operator Data

```typescript
interface Operator {
  id: string;
  domainId: string;
  minimumNominatorStake: string; // Shannon
  nominationTax: string; // Percentage
  currentTotalStake: string; // Shannon
  totalShares: string;
  status: 'Active' | 'Slashed' | 'Deregistered';
  signingKey: string;
  // Additional fields from RPC calls
}
```

### Domain Data

```typescript
interface Domain {
  id: string;
  ownerAccountId: string;
  createdAt: number;
  genesisReceiptHash: string;
  domainInstantiation: {
    domainId: string;
    domainConfig: {
      domainName: string;
      runtimeType: string;
      rawGenesisStorage: string;
    };
  };
}
```

### Account Balance

```typescript
interface BalanceData {
  free: string; // Available balance
  reserved: string; // Reserved/locked balance
  miscFrozen: string;
  feeFrozen: string;
}
```

---

## Real Data Integration Requirements

### RPC Connection Setup

```typescript
import { createConnection } from '@autonomys/auto-utils';

// Taurus testnet endpoint
const endpoint = 'wss://rpc.taurus.autonomys.xyz/ws';
const api = await createConnection(endpoint);
```

### Target Operator IDs for Development

Per user requirements, hardcode these operator IDs for initial integration:

- **Operator 0**
- **Operator 1**
- **Operator 3**

### Required API Calls

1. **Operator Discovery**

   ```typescript
   const targetOperators = ['0', '1', '3'];
   const operatorData = await Promise.all(targetOperators.map(id => operator(api, id)));
   ```

2. **Balance Queries**

   ```typescript
   const userBalance = await balance(api, userAddress);
   ```

3. **Domain Information**
   ```typescript
   const domainInfo = await domains(api);
   // Expected: Auto EVM domain (ID: 0)
   ```

---

## Unit Conversion

### Shannon ↔ AI3 Conversion

```typescript
// AI3 to Shannon (multiply by 10^18)
function ai3ToShannon(ai3Amount: number): string {
  return (ai3Amount * Math.pow(10, 18)).toString();
}

// Shannon to AI3 (divide by 10^18)
function shannonToAi3(shannonAmount: string): number {
  return parseInt(shannonAmount) / Math.pow(10, 18);
}

// For display formatting
function formatAi3(shannonAmount: string): string {
  return shannonToAi3(shannonAmount).toFixed(4);
}
```

---

## Error Handling

### Common Error Scenarios

1. **Network Connectivity**

   ```typescript
   try {
     const api = await createConnection(endpoint);
   } catch (error) {
     console.error('Failed to connect to RPC:', error);
     // Fallback to cached data or show error state
   }
   ```

2. **Transaction Failures**

   ```typescript
   try {
     await signAndSendTx(account, tx);
   } catch (error) {
     if (error.message.includes('InsufficientBalance')) {
       // Handle insufficient balance
     } else if (error.message.includes('OperatorNotFound')) {
       // Handle invalid operator
     }
   }
   ```

3. **Data Fetching**
   ```typescript
   try {
     const operatorData = await operator(api, operatorId);
   } catch (error) {
     console.error(`Failed to fetch operator ${operatorId}:`, error);
     return null; // Return null for missing operators
   }
   ```

---

## Integration with Existing Types

### Mapping RPC Data to UI Types

```typescript
// Convert RPC operator to UI operator
function mapRpcOperatorToUi(rpcOperator: any, operatorId: string): Operator {
  return {
    id: operatorId,
    name: `Operator ${operatorId}`, // Default name
    domainId: '0', // Auto EVM for all operators
    domainName: 'Auto EVM',
    totalStake: formatAi3(rpcOperator.currentTotalStake),
    ownStake: formatAi3(rpcOperator.currentTotalStake), // Approximate
    nominatorCount: 0, // Will need separate call
    commissionRate: parseFloat(rpcOperator.nominationTax) / 100,
    status: mapOperatorStatus(rpcOperator.status),
    minimumStake: formatAi3(rpcOperator.minimumNominatorStake),
  };
}

function mapOperatorStatus(rpcStatus: string): OperatorStatus {
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
}
```

---

## Development Workflow

### 1. Replace Mock Data Service

```typescript
// Old: Mock service
const operators = mockOperators;

// New: Real RPC service
const operators = await fetchOperatorsFromRPC(['0', '1', '3']);
```

### 2. Update State Management

```typescript
// Add RPC connection to Zustand store
interface WalletState {
  api: ApiPromise | null;
  // ... existing state
}

// Update operator store to use real data
interface OperatorState {
  operators: Operator[];
  loading: boolean;
  error: string | null;
  refreshOperators: () => Promise<void>;
}
```

### 3. Implement Real Staking Flow

```typescript
// Replace mock staking with real transactions
const handleStake = async (operatorId: string, amount: number) => {
  const amountInShannon = ai3ToShannon(amount * 0.8); // 80% after storage fund
  const tx = await nominateOperator({
    api,
    operatorId,
    amountToStake: amountInShannon,
  });

  await signAndSendTx(account, tx);
};
```

---

## Performance Considerations

### Caching Strategy

1. **Operator Data**: Cache for 30 seconds (operators don't change frequently)
2. **Balance Data**: Cache for 10 seconds (balances change with transactions)
3. **Domain Data**: Cache for 5 minutes (domains rarely change)

### Connection Management

```typescript
// Singleton API connection
let apiInstance: ApiPromise | null = null;

export async function getApi(): Promise<ApiPromise> {
  if (!apiInstance || !apiInstance.isConnected) {
    apiInstance = await createConnection('wss://rpc.taurus.autonomys.xyz/ws');
  }
  return apiInstance;
}

// Cleanup on app unmount
export function disconnectApi(): void {
  if (apiInstance) {
    apiInstance.disconnect();
    apiInstance = null;
  }
}
```

---

## Testing Strategy

### Mock RPC for Development

```typescript
// Create mock RPC responses for testing
const mockOperatorResponse = {
  id: '1',
  currentTotalStake: '50000000000000000000', // 50 AI3
  minimumNominatorStake: '10000000000000000000', // 10 AI3
  nominationTax: '500', // 5%
  status: 'Active',
};
```

### Integration Tests

```typescript
describe('Auto SDK Integration', () => {
  test('fetches real operator data', async () => {
    const operators = await fetchOperatorsFromRPC(['0', '1', '3']);
    expect(operators).toHaveLength(3);
    expect(operators[0]).toHaveProperty('id', '0');
  });

  test('handles missing operators gracefully', async () => {
    const operators = await fetchOperatorsFromRPC(['999']);
    expect(operators).toHaveLength(0);
  });
});
```

---

## Security Considerations

### Wallet Connection Security

1. **Never store mnemonics in code**
2. **Validate all user inputs before RPC calls**
3. **Use proper error handling to avoid exposing internal details**
4. **Implement rate limiting for RPC calls**

### Transaction Security

1. **Always show transaction preview before signing**
2. **Validate amounts and addresses client-side**
3. **Handle failed transactions gracefully**
4. **Show clear confirmation after successful transactions**

---

_This documentation provides the foundation for integrating real Auto SDK data with our staking interface._
