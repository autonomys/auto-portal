# Auto SDK Integration Guide

**Purpose:** Essential info for replacing mock data with real Auto SDK calls  
**Target:** Taurus testnet, operators 0/1/3  
**Approach:** Component by component, RPC first

---

## Quick Setup

```bash
# Install packages
yarn add @autonomys/auto-consensus @autonomys/auto-utils

# Environment
VITE_AUTONOMYS_NETWORK=taurus
VITE_TARGET_OPERATORS=0,1,3
```

---

## Essential Auto SDK Functions

### Network Connection

```typescript
import { activate } from '@autonomys/auto-utils';

const api = await activate({ networkId: 'taurus' });
// Use api...
await api.disconnect();
```

### Operator Data

```typescript
import { operators, operator, domains } from '@autonomys/auto-consensus';

// Get specific operator (for our targets: 0, 1, 3)
const operatorDetails = await operator(api, '1');
// Returns: currentTotalStake, minimumNominatorStake, nominationTax, status, etc.

// Get all operators (for filtering)
const allOperators = await operators(api);

// Get domains (for operator domain names)
const domainList = await domains(api);
```

### User Balances

```typescript
import { balance, account } from '@autonomys/auto-consensus';

// Get user balance
const balanceData = await balance(api, userAddress);
// Returns: { free: bigint, reserved: bigint, frozen: bigint, flags: bigint }

// Get account info (includes nonce + balance)
const accountData = await account(api, userAddress);
```

### User Positions

```typescript
import { nominatorPosition, deposits } from '@autonomys/auto-consensus';

// Get complete position info
const position = await nominatorPosition(api, operatorId, userAddress);
// Returns: knownValue, pendingDeposits, pendingWithdrawals, storageFeeDeposit

// Get raw deposits (alternative)
const userDeposits = await deposits(api, operatorId, userAddress);
```

## Unit Conversion

```typescript
// 1 AI3 = 10^18 Shannon (like wei in Ethereum)

// Convert AI3 to Shannon for API calls
const ai3ToShannon = (ai3: number | string): bigint => {
  const amount = typeof ai3 === 'string' ? parseFloat(ai3) : ai3;
  return BigInt(Math.floor(amount * 10 ** 18));
};

// Convert Shannon to AI3 for display
const shannonToAi3 = (shannon: bigint): number => {
  return Number(shannon) / 10 ** 18;
};

// Format for UI display
const formatAI3 = (shannon: bigint, decimals = 4): string => {
  return `${shannonToAi3(shannon).toFixed(decimals)} AI3`;
};
```

## Basic Error Handling

```typescript
// Simple try/catch for API calls
const fetchOperatorSafely = async (api, operatorId) => {
  try {
    return await operator(api, operatorId);
  } catch (error) {
    console.warn(`Operator ${operatorId} not found:`, error);
    return null;
  }
};

// Network connection with retry
const connectToNetwork = async () => {
  try {
    return await activate({ networkId: 'taurus' });
  } catch (error) {
    console.error('Failed to connect to network:', error);
    throw error;
  }
};
```

---

## Implementation Approach

**Strategy:** Break into component-specific issues, RPC data first

1. **🔗 Operator Discovery** - Replace mock operator data with Auto SDK calls
2. **💰 User Balances** - Fetch real wallet balances
3. **📋 Staking Form** - Add real validation with RPC data
4. **📊 Portfolio** - Show current positions from blockchain
5. **📈 Dashboard** - Real-time overview data

Each component gets its own issue with specific Auto SDK calls needed.

**Leave these mocked for now:**

- APY calculations (need indexer)
- Transaction history (need indexer)
- Performance metrics (need indexer)

**Resources:**

- See `/staking-data/` folder for component data requirements
- Full Auto SDK docs: https://github.com/autonomys/auto-sdk
