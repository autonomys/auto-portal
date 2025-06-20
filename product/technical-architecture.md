# Technical Architecture - Staking Application

**Version:** 0.1 (Draft)  
**Last Updated:** <!-- YYYY-MM-DD -->  
**Status:** Phase 2 - Design & Architecture

---

## 1. Architecture Overview

### 1.1 Technology Stack

- **Frontend**: React 18+ with TypeScript
- **Build Tool**: Vite (fast development, optimized builds)
- **Package Manager**: Yarn (as per project requirements)
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand (lightweight, TypeScript-first)
- **Blockchain Integration**: Auto SDK + Polkadot.js API

### 1.2 Architecture Principles

- **Functional Programming**: Arrow functions, immutability, pure functions
- **Component Composition**: Small, focused, reusable components
- **Type Safety**: Strict TypeScript configuration
- **Performance First**: Code splitting, lazy loading, memoization
- **Error Boundaries**: Graceful error handling at component level

---

## 2. Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Base UI components (buttons, inputs, etc.)
│   ├── wallet/          # Wallet connection components
│   ├── staking/         # Staking-specific components
│   └── layout/          # Layout components (header, nav, etc.)
├── hooks/               # Custom React hooks
│   ├── useWallet.ts     # Wallet connection and state
│   ├── useStaking.ts    # Staking operations
│   └── useBalances.ts   # Balance management
├── stores/              # Zustand state stores
│   ├── walletStore.ts   # Wallet connection state
│   ├── stakingStore.ts  # Staking data and operations
│   └── uiStore.ts       # UI state (modals, loading, etc.)
├── services/            # External service integrations
│   ├── blockchain.ts    # Auto SDK integration
│   ├── indexer.ts       # Historical data service
│   └── notifications.ts # Browser notifications
├── types/               # TypeScript type definitions
│   ├── staking.ts       # Staking-related types
│   ├── wallet.ts        # Wallet and account types
│   └── api.ts           # API response types
├── utils/               # Utility functions
│   ├── formatting.ts    # Number/date formatting
│   ├── validation.ts    # Form validation helpers
│   └── constants.ts     # App constants
├── pages/               # Page components
│   ├── Dashboard.tsx    # Main dashboard/portfolio
│   ├── Operators.tsx    # Operator discovery
│   ├── Stake.tsx        # Staking flow
│   └── Portfolio.tsx    # Portfolio management
└── App.tsx              # Root application component
```

---

## 3. Component Architecture

### 3.1 Component Hierarchy

```
App
├── Layout
│   ├── Header (wallet connection, navigation)
│   ├── Sidebar (navigation, account info)
│   └── Footer
├── Router
│   ├── Dashboard
│   │   ├── PortfolioOverview
│   │   ├── ActivePositions
│   │   └── RecentActivity
│   ├── Operators
│   │   ├── OperatorFilters
│   │   ├── OperatorList
│   │   └── OperatorCard
│   ├── StakingFlow
│   │   ├── OperatorSelection
│   │   ├── AmountInput
│   │   ├── TransactionPreview
│   │   └── TransactionStatus
│   └── Portfolio
│       ├── ActiveStakes
│       ├── PendingWithdrawals
│       └── TransactionHistory
└── GlobalModals
    ├── WalletConnectionModal
    ├── TransactionModal
    └── ErrorModal
```

### 3.2 Key Component Patterns

#### Compound Components

```typescript
// Operator card with flexible composition
<OperatorCard>
  <OperatorCard.Header>
    <OperatorCard.Name />
    <OperatorCard.Status />
  </OperatorCard.Header>
  <OperatorCard.Stats>
    <OperatorCard.APY />
    <OperatorCard.Tax />
  </OperatorCard.Stats>
  <OperatorCard.Actions>
    <OperatorCard.StakeButton />
    <OperatorCard.DetailsButton />
  </OperatorCard.Actions>
</OperatorCard>
```

#### Render Props for Data Fetching

```typescript
<StakingData operatorId={id}>
  {({ data, loading, error }) => (
    <OperatorDetails operator={data} isLoading={loading} error={error} />
  )}
</StakingData>
```

---

## 4. State Management

### 4.1 Zustand Store Structure

#### Wallet Store

```typescript
interface WalletStore {
  // State
  isConnected: boolean;
  account: Account | null;
  balance: Balance | null;

  // Actions
  connect: (walletType: WalletType) => Promise<void>;
  disconnect: () => void;
  refreshBalance: () => Promise<void>;
}
```

#### Staking Store

```typescript
interface StakingStore {
  // State
  operators: Operator[];
  nominations: Nomination[];
  withdrawals: Withdrawal[];

  // Actions
  fetchOperators: () => Promise<void>;
  stakeToOperator: (operatorId: string, amount: string) => Promise<void>;
  withdrawStake: (operatorId: string, amount: string) => Promise<void>;
  unlockFunds: (operatorId: string) => Promise<void>;
}
```

### 4.2 Data Flow Pattern

1. **UI Component** triggers action
2. **Store Action** updates state + calls service
3. **Service Layer** handles blockchain interaction
4. **Store** updates with result
5. **UI Component** re-renders with new state

---

## 5. Blockchain Integration

### 5.1 Auto SDK Integration

```typescript
// services/blockchain.ts
import { AutoConsensus } from "@autonomys/auto-consensus";

const createBlockchainService = (rpcUrl: string) => {
  const consensus = new AutoConsensus(rpcUrl);

  const nominateOperator = async (
    operatorId: string,
    amount: string
  ): Promise<string> => {
    return consensus.tx.domains.nominateOperator(operatorId, amount);
  };

  const getOperators = async (): Promise<Operator[]> => {
    return consensus.query.domains.operators();
  };

  return {
    nominateOperator,
    getOperators,
  };
};
```

### 5.2 RPC Data Sources

- **Real-time Data**: Direct RPC calls for current state
- **Historical Data**: Indexer service for APY calculations, reward history
- **Cached Data**: Local storage for operator metadata, user preferences

### 5.3 Transaction Management

```typescript
interface TransactionState {
  hash?: string;
  status: "pending" | "confirmed" | "failed";
  error?: string;
  timestamp: number;
}

const useTransaction = () => {
  const [state, setState] = useState<TransactionState>();

  const execute = useCallback(async (extrinsic: () => Promise<string>) => {
    setState({ status: "pending", timestamp: Date.now() });
    try {
      const hash = await extrinsic();
      setState({ hash, status: "confirmed", timestamp: Date.now() });
    } catch (error) {
      setState({
        status: "failed",
        error: error.message,
        timestamp: Date.now(),
      });
    }
  }, []);

  return { state, execute };
};
```

---

## 6. Data Layer

### 6.1 Type Definitions

```typescript
// types/staking.ts
export interface Operator {
  id: string;
  domainId: string;
  ownerAccount: string;
  signingKey: string;
  minimumNominatorStake: string;
  nominationTax: number;
  currentDomainId: string;
  nextDomainId: string;
  status: "active" | "inactive" | "slashed";
}

export interface Nomination {
  operatorId: string;
  shares: string;
  status: "active" | "pending" | "withdrawing";
}

export interface Withdrawal {
  operatorId: string;
  shares: string;
  unlockAt: number;
  status: "pending" | "ready" | "unlocked";
}
```

### 6.2 API Service Layer

```typescript
// services/indexer.ts
export const createIndexerService = (baseUrl: string) => {
  const getOperatorAPY = async (operatorId: string): Promise<number> => {
    const response = await fetch(`${baseUrl}/operators/${operatorId}/apy`);
    return response.json();
  };

  const getNominatorHistory = async (
    account: string
  ): Promise<NominationEvent[]> => {
    const response = await fetch(`${baseUrl}/nominators/${account}/history`);
    return response.json();
  };

  return {
    getOperatorAPY,
    getNominatorHistory,
  };
};
```

---

## 7. Performance Optimizations

### 7.1 Code Splitting

```typescript
// Lazy load pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Operators = lazy(() => import("./pages/Operators"));
const StakingFlow = lazy(() => import("./pages/StakingFlow"));

// Route-based splitting
<Route
  path="/"
  element={
    <Suspense fallback={<Loading />}>
      <Dashboard />
    </Suspense>
  }
/>;
```

### 7.2 Memoization Strategy

```typescript
// Expensive calculations
const useOperatorStats = (operators: Operator[]) => {
  return useMemo(() => {
    return operators.map((op) => ({
      ...op,
      apy: calculateAPY(op),
      riskScore: calculateRisk(op),
    }));
  }, [operators]);
};

// Component memoization
export const OperatorCard = memo(({ operator }: { operator: Operator }) => {
  // Component implementation
});
```

### 7.3 Data Fetching Strategy

- **Critical Data**: Fetch on mount, real-time updates
- **Secondary Data**: Lazy load on interaction
- **Historical Data**: Paginated, cache-first approach
- **Background Refresh**: Periodic updates for non-critical data

---

## 8. Error Handling

### 8.1 Error Boundary Strategy

```typescript
import { ErrorBoundary } from "react-error-boundary";

const ErrorFallback = ({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) => (
  <div className="error-boundary">
    <h2>Something went wrong</h2>
    <p>{error.message}</p>
    <button onClick={resetErrorBoundary}>Try again</button>
  </div>
);

const StakingErrorBoundary = ({ children }: { children: React.ReactNode }) => (
  <ErrorBoundary
    FallbackComponent={ErrorFallback}
    onError={(error, errorInfo) => {
      // Log to monitoring service
      console.error("Staking error:", error, errorInfo);
    }}
  >
    {children}
  </ErrorBoundary>
);
```

### 8.2 Network Error Handling

```typescript
const useRetryableQuery = <T>(queryFn: () => Promise<T>, retries = 3) => {
  const [data, setData] = useState<T>();
  const [error, setError] = useState<Error>();
  const [loading, setLoading] = useState(true);

  const execute = useCallback(
    async (attempt = 0) => {
      try {
        const result = await queryFn();
        setData(result);
        setError(undefined);
      } catch (err) {
        if (attempt < retries) {
          setTimeout(() => execute(attempt + 1), 1000 * Math.pow(2, attempt));
        } else {
          setError(err as Error);
        }
      } finally {
        setLoading(false);
      }
    },
    [queryFn, retries]
  );

  return { data, error, loading, retry: () => execute(0) };
};
```

---

## 9. Security Considerations

### 9.1 Input Validation

- Client-side validation for UX
- Amount validation (min/max, decimal places)
- Address format validation
- Sanitization of user inputs

### 9.2 Transaction Security

- Clear transaction previews
- Amount confirmation requirements
- Wallet signature verification
- Transaction hash validation

### 9.3 State Protection

- Immutable state updates
- Input sanitization
- XSS prevention in dynamic content
- Secure local storage usage

---

## 10. Testing Strategy

### 10.1 Unit Testing

- Component testing with React Testing Library
- Hook testing with custom render utilities
- Service layer testing with mocked dependencies
- Utility function testing

### 10.2 Integration Testing

- Wallet connection flows
- Complete staking/withdrawal flows
- Error handling scenarios
- Cross-browser compatibility

### 10.3 E2E Testing

- Critical user journeys
- Transaction flows with testnet
- Responsive design validation
- Performance benchmarking

---

## 11. Deployment Architecture

### 11.1 Build Configuration

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          blockchain: ["@autonomys/auto-consensus", "@polkadot/api"],
          ui: ["@radix-ui/react-dialog", "lucide-react"],
        },
      },
    },
  },
});
```

### 11.2 Environment Configuration

- **Development**: Local RPC, mock indexer
- **Staging**: Testnet RPC, staging indexer
- **Production**: Mainnet RPC, production indexer

---

## 12. Monitoring & Analytics

### 12.1 Performance Monitoring

- Core Web Vitals tracking
- Bundle size monitoring
- API response time tracking
- Error rate monitoring

### 12.2 User Analytics

- Conversion funnel tracking
- Feature usage analytics
- Transaction success rates
- User engagement metrics

---

_This technical architecture will guide the implementation phase and evolve as we build and test the application._
