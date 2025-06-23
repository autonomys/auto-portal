# Next Steps: Operator Discovery & Comparison Interface

**Status:** Ready to Begin  
**Phase:** 4 - Implementation  
**Priority:** High (Critical Path)  
**Estimated Timeline:** 2-3 weeks  
**Dependencies:** ✅ Wallet Integration Complete

---

## 1. Executive Summary

With wallet integration now complete, the next critical milestone is building the **Operator Discovery & Comparison Interface**. This is the core feature that allows users to browse, filter, compare, and select operators before staking - essentially the "marketplace" experience that differentiates our UI from the technical Polkadot Apps interface.

**Success Criteria:**

- Users can browse all available operators with key metrics
- Filter and sort by APY, tax rate, domain, uptime
- Compare operators side-by-side with trust signals
- Seamless transition to staking flow from operator selection
- Mobile-responsive operator cards and table layouts

---

## 2. Implementation Scope

### 2.1 Core Components to Build

#### A. Operator Discovery Page (`/operators`)

- **OperatorFilters**: Domain filter, sort options, search input
- **OperatorList**: Grid/list view toggle with pagination
- **OperatorCard**: Individual operator cards with key metrics
- **OperatorTable**: Table view for desktop power users
- **LoadingStates**: Skeleton loaders for async data

#### B. Individual Operator Detail Modal/Page

- **OperatorProfile**: Detailed operator information and stats
- **PerformanceCharts**: Historical APY, uptime metrics
- **PoolComposition**: Nominator distribution, stake analysis
- **StakeButton**: Direct CTA to staking flow

#### C. Data Layer Integration

- **operatorStore** (Zustand): Operator data management
- **useOperators** hook: Data fetching and filtering logic
- **operatorService**: Auto SDK integration for operator data
- **Historical data**: RPC-based calculations (indexer to be added later)

### 2.2 Key Features

#### Filtering & Search

- **Domain Filter**: Auto EVM, Auto Consensus, All Domains
- **Performance Filter**: APY ranges, uptime thresholds
- **Search**: Operator name/ID search with fuzzy matching
- **Sort Options**: APY (high/low), Total Staked, Uptime, Tax Rate

#### Trust & Performance Indicators

- **Status Badges**: Active, Inactive, Degraded, Slashed
- **Uptime Indicators**: Visual uptime percentage with color coding
- **Pool Health**: Capacity indicators, nominator distribution
- **Risk Signals**: High tax rates, low uptime warnings

---

## 3. Technical Implementation Plan

### 3.1 Development Phases

#### Phase 1: Data Layer & Store (Week 1)

```typescript
// stores/operatorStore.ts
interface OperatorStore {
  operators: Operator[];
  filteredOperators: Operator[];
  loading: boolean;
  error: string | null;

  // Filters
  searchQuery: string;
  domainFilter: string;
  sortBy: 'apy' | 'totalStaked' | 'uptime' | 'tax';
  sortOrder: 'asc' | 'desc';

  // Actions
  fetchOperators: () => Promise<void>;
  setFilters: (filters: Partial<FilterState>) => void;
  refreshOperatorData: (operatorId: string) => Promise<void>;
}
```

**Key Files to Create:**

- `src/stores/operatorStore.ts` - Zustand store for operator data
- `src/services/operatorService.ts` - Auto SDK integration
- `src/hooks/useOperators.ts` - React hook for component usage
- `src/types/operator.ts` - TypeScript definitions

#### Phase 2: Basic Operator Components (Week 1-2)

```typescript
// components/operators/OperatorCard.tsx
interface OperatorCardProps {
  operator: Operator;
  onStake: (operatorId: string) => void;
  onViewDetails: (operatorId: string) => void;
}

// components/operators/OperatorFilters.tsx
interface OperatorFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: Partial<FilterState>) => void;
  totalResults: number;
}
```

**Components to Build:**

- `OperatorCard` - Individual operator card component
- `OperatorFilters` - Filter and search bar
- `OperatorGrid` - Grid layout container
- `OperatorStats` - Key metrics display component

#### Phase 3: Advanced Features & Polish (Week 2-3)

- Table view toggle for desktop users
- Operator detail modal/page
- Performance indicator components
- Mobile-responsive layouts
- Loading and error states

### 3.2 Auto SDK Integration

#### Required RPC Calls

```typescript
// services/operatorService.ts
export const operatorService = {
  // Get all registered operators
  async getOperators(): Promise<Operator[]> {
    return await consensus.query.domains.operators();
  },

  // Get operator details by ID
  async getOperatorById(operatorId: string): Promise<OperatorDetails> {
    return await consensus.query.domains.operatorIdOwner(operatorId);
  },

  // Get operator pool statistics
  async getOperatorStats(operatorId: string): Promise<OperatorStats> {
    // Share price, total stake, nominator count
  },
};
```

#### RPC-Based Historical Data (Future: Indexer)

```typescript
// For now, calculate metrics from RPC data
// Future: Replace with dedicated indexer service
export const calculateOperatorMetrics = {
  // Calculate APY from on-chain reward data
  async getOperatorAPY(operatorId: string): Promise<number> {
    // Use recent epoch data to estimate APY
  },

  // Estimate uptime from block production
  async getOperatorUptime(operatorId: string): Promise<number> {
    // Use block production history (limited lookback)
  },
};
```

### 3.3 Component Architecture

#### Compound Component Pattern

```typescript
<OperatorDiscovery>
  <OperatorDiscovery.Filters />
  <OperatorDiscovery.Results>
    <OperatorDiscovery.Grid>
      {operators.map(op => (
        <OperatorCard key={op.id} operator={op} />
      ))}
    </OperatorDiscovery.Grid>
  </OperatorDiscovery.Results>
</OperatorDiscovery>
```

---

## 4. User Experience Requirements

### 4.1 Key User Flows

#### Primary Flow: Operator Selection

```
Dashboard → Browse Operators → Apply Filters →
Compare Options → Select Operator → View Details →
Proceed to Stake
```

#### Secondary Flows

- **Search**: Direct operator search by name/ID
- **Comparison**: Side-by-side operator comparison
- **Filtering**: Progressive filtering by multiple criteria

### 4.2 Visual Design Implementation

#### Operator Card Design (from visual-mockups.md)

- **Avatar**: Operator icon/initial with colored background
- **Key Metrics**: APY, Tax Rate, Min Stake prominently displayed
- **Pool Stats**: Total staked, nominator count
- **Status Indicators**: Uptime percentage, active status badge
- **Actions**: Stake button (primary), Details button (secondary)

#### Mobile Responsiveness

- **Desktop**: 2-column grid layout with detailed cards
- **Tablet**: 1-column layout with horizontal cards
- **Mobile**: Stacked card layout with essential info only

### 4.3 Performance Requirements

- **Load Time**: < 2s for operator list with 50+ operators
- **Search**: < 500ms response time for search/filter operations
- **Data Freshness**: Operator stats updated every 30 seconds
- **Pagination**: Load more pattern for large operator lists

---

## 5. Data Requirements & Mock Data

### 5.1 Operator Data Structure

```typescript
interface Operator {
  id: string;
  name: string; // Display name or default to ID
  domainId: string;
  domainName: string; // "Auto EVM", "Auto Consensus"
  ownerAccount: string;

  // Pool Configuration
  nominationTax: number; // Percentage (0-100)
  minimumNominatorStake: string; // In AI3

  // Current Status
  status: 'active' | 'inactive' | 'slashed' | 'degraded';
  totalStaked: string; // Total AI3 in pool
  nominatorCount: number;

  // Performance Metrics (calculated from RPC)
  currentAPY: number; // Current annualized percentage yield
  uptime: number; // Percentage uptime (recent average)

  // Calculated/Derived
  poolCapacity: number; // Percentage of max capacity
  isRecommended: boolean; // Algorithm-based recommendation
}
```

### 5.2 Mock Data for Development

Create `src/mocks/operatorData.ts` with 10-15 realistic operators:

- Mix of high/medium/low APY rates
- Various tax rates (5%, 8%, 10%, 12%)
- Different pool sizes and nominator counts
- Include some "degraded" operators for testing

---

## 6. Testing Strategy

### 6.1 Component Testing

- **Unit Tests**: Individual component rendering and props
- **Integration Tests**: Filter/search functionality
- **Visual Tests**: Responsive design across breakpoints

### 6.2 User Flow Testing

- **Happy Path**: Browse → Filter → Select → Proceed to stake
- **Edge Cases**: No results found, loading states, network errors
- **Performance**: Large operator lists, rapid filter changes

### 6.3 Accessibility Testing

- **Keyboard Navigation**: Tab through operator cards and filters
- **Screen Reader**: Proper ARIA labels for operator stats
- **Color Contrast**: Status indicators and badges

---

## 7. Implementation Checklist

### Week 1: Foundation

- [ ] Set up operator store with Zustand
- [ ] Create operatorService with Auto SDK integration
- [ ] Build basic OperatorCard component
- [ ] Implement OperatorFilters component
- [ ] Create mock data for development
- [ ] Set up operator routes and page structure

### Week 2: Core Features

- [ ] Add search and filtering logic
- [ ] Implement sorting functionality
- [ ] Build OperatorGrid and list layouts
- [ ] Add loading and error states
- [ ] Create operator detail modal/page
- [ ] Implement mobile-responsive design

### Week 3: Polish & Integration

- [ ] Add performance metrics and charts
- [ ] Implement status indicators and badges
- [ ] Connect to real operator data (testnet)
- [ ] Add transition to staking flow
- [ ] Performance optimization and testing
- [ ] User testing and feedback incorporation

---

## 8. Success Metrics

### 8.1 Technical Metrics

- **Performance**: Page load time < 2s, filter response < 500ms
- **Code Quality**: TypeScript strict mode, 90%+ test coverage
- **Accessibility**: WCAG AA compliance, keyboard navigation

### 8.2 User Experience Metrics

- **Usability**: Users can find and select operator within 60 seconds
- **Conversion**: 80%+ of users who browse operators proceed to stake
- **Error Rate**: < 5% task failure rate in user testing

---

## 9. Risks & Mitigation

| Risk                                  | Impact | Probability | Mitigation                                  |
| ------------------------------------- | ------ | ----------- | ------------------------------------------- |
| Auto SDK operator data incomplete     | High   | Medium      | Create adapter layer, fallback to RPC calls |
| Performance with large operator lists | Medium | Low         | Implement pagination, virtual scrolling     |
| Complex filtering logic bugs          | Medium | Medium      | Comprehensive unit tests, staged rollout    |
| Mobile UX not intuitive               | High   | Low         | Early mobile testing, iterative design      |

---

## 10. Post-Implementation: Next Milestones

After operator discovery is complete, the next major milestones will be:

1. **Staking Flow Implementation** (2-3 weeks)

   - Amount input and validation
   - Transaction preview and confirmation
   - Integration with Auto SDK staking extrinsics

2. **Portfolio Management** (2-3 weeks)
   - Active positions dashboard
   - Withdrawal flow implementation
   - Transaction history and analytics

---

**Next Actions:**

1. Create GitHub issues for each component in the checklist
2. Set up development branch: `feature/operator-discovery`
3. Begin with operator store and service layer implementation
4. Schedule user testing sessions for Week 3

_This document will be updated as implementation progresses and requirements evolve._
