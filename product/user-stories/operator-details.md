# 🔍 Feature: Operator Details Page

**Priority:** Medium  
**Type:** Frontend + RPC Enhancement  
**Prerequisites:** ✅ Operator Discovery RPC Integration  
**Status:** 📋 **READY FOR IMPLEMENTATION**

---

## 📋 Summary

Implement a detailed operator view that users can navigate to from the operator discovery page. This provides comprehensive information about a specific operator including performance metrics, historical data, and detailed configuration.

**Current State:**

- Operator discovery shows basic operator cards with limited information
- "Details" button exists but only logs to console with TODO comment
- No routing or dedicated operator details page

**Target State:**

- Dedicated operator details page with comprehensive operator information
- Navigation from operator discovery to details view
- Enhanced operator data fetching for detailed metrics
- Professional operator profile layout

---

## 👤 User Story

> **As a** token holder researching staking options  
> **I want to** view comprehensive details about a specific operator  
> **So that** I can make informed decisions about which operators to stake with

---

## ✅ Acceptance Criteria

### **Navigation & Routing**

- [ ] **Dedicated operator details route** at `/operators/:operatorId`
- [ ] **Navigation from discovery** - "Details" button navigates to operator details page
- [ ] **Deep linking support** - users can share/bookmark operator detail URLs
- [ ] **Back navigation** - clear way to return to operator discovery
- [ ] **SEO-friendly URLs** using operator ID

### **Operator Information Display**

- [ ] **Operator overview section** with name, domain, status, and operator ID
- [ ] **Key metrics prominently displayed** - tax rate, minimum stake, total staked
- [ ] **Pool statistics** - current nominators, share price, pool size
- [ ] **Technical details** - owner account, domain ID, signing key
- [ ] **Status indicators** with clear visual representation

### **Enhanced Data Integration**

- [ ] **Fetch detailed operator data** via Auto SDK for the specific operator
- [ ] **Real-time metrics** with auto-refresh capability
- [ ] **Loading states** during data fetching
- [ ] **Error handling** for operator not found or network failures
- [ ] **Responsive data refresh** when operator data changes

### **User Actions**

- [ ] **Stake directly from details** - prominent "Stake with this Operator" button
- [ ] **Share operator details** - copyable URL for sharing
- [ ] **Operator comparison** - easy navigation between operators
- [ ] **Return to discovery** - clear navigation back to operator list

### **Performance & UX**

- [ ] **Fast navigation** between discovery and details
- [ ] **Optimistic loading** - show cached data while fetching updates
- [ ] **Mobile responsive** design for all screen sizes
- [ ] **Accessibility** compliant with proper ARIA labels

---

## 🏗️ Technical Implementation Plan

### **1. Create Operator Details Page**

```typescript
// apps/web/src/pages/OperatorDetailsPage.tsx
interface OperatorDetailsPageProps {
  operatorId: string;
  onBack: () => void;
  onStake: (operatorId: string) => void;
  onNavigate?: (page: 'dashboard' | 'operators') => void;
}

export const OperatorDetailsPage: React.FC<OperatorDetailsPageProps> = ({
  operatorId,
  onBack,
  onStake,
  onNavigate,
}) => {
  // Use enhanced operator hook for detailed data
  const { operator, loading, error, refresh } = useOperatorDetails(operatorId);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(refresh, 60000);
    return () => clearInterval(interval);
  }, [refresh]);

  if (loading) return <OperatorDetailsLoading />;
  if (error) return <OperatorDetailsError error={error} onRetry={refresh} />;
  if (!operator) return <OperatorNotFound operatorId={operatorId} />;

  return (
    <Layout onNavigate={onNavigate} currentPage="operators">
      <div className="py-8 space-y-8">
        {/* Header with back navigation */}
        <OperatorDetailsHeader
          operator={operator}
          onBack={onBack}
          onStake={() => onStake(operatorId)}
        />

        {/* Main content sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <OperatorOverview operator={operator} />
            <OperatorMetrics operator={operator} />
            <OperatorTechnicalDetails operator={operator} />
          </div>

          <div className="space-y-6">
            <OperatorActions
              operator={operator}
              onStake={() => onStake(operatorId)}
            />
            <OperatorQuickStats operator={operator} />
          </div>
        </div>
      </div>
    </Layout>
  );
};
```

### **2. Enhanced Operator Hook**

```typescript
// apps/web/src/hooks/use-operator-details.ts
export const useOperatorDetails = (operatorId: string) => {
  const [operator, setOperator] = useState<Operator | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOperatorDetails = useCallback(async () => {
    if (!operatorId) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch detailed operator data
      const detailedOperator = await operatorService.getOperatorById(operatorId);

      if (!detailedOperator) {
        setError(`Operator ${operatorId} not found`);
        return;
      }

      setOperator(detailedOperator);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch operator details');
    } finally {
      setLoading(false);
    }
  }, [operatorId]);

  useEffect(() => {
    fetchOperatorDetails();
  }, [fetchOperatorDetails]);

  return {
    operator,
    loading,
    error,
    refresh: fetchOperatorDetails,
  };
};
```

### **3. Operator Details Components**

```typescript
// apps/web/src/components/operators/details/OperatorDetailsHeader.tsx
interface OperatorDetailsHeaderProps {
  operator: Operator;
  onBack: () => void;
  onStake: () => void;
}

export const OperatorDetailsHeader: React.FC<OperatorDetailsHeaderProps> = ({
  operator,
  onBack,
  onStake,
}) => {
  return (
    <div className="space-y-4">
      {/* Back navigation */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack} className="p-2">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Operators
        </Button>
        <div className="h-6 w-px bg-border" />
        <Breadcrumb>
          <BreadcrumbItem>
            <button onClick={onBack} className="text-muted-foreground hover:text-foreground">
              Operators
            </button>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem className="text-foreground">
            {operator.name}
          </BreadcrumbItem>
        </Breadcrumb>
      </div>

      {/* Operator header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-2xl">
              {operator.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">
              {operator.name}
            </h1>
            <p className="text-lg text-muted-foreground">{operator.domainName}</p>
            <div className="flex items-center space-x-2 mt-2">
              <Badge variant={getStatusVariant(operator.status)}>
                {operator.status}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Operator #{operator.id}
              </span>
            </div>
          </div>
        </div>

        {/* Primary action */}
        <Button size="lg" onClick={onStake} className="px-8">
          Stake with this Operator
        </Button>
      </div>
    </div>
  );
};
```

### **4. Update App.tsx for Routing**

```typescript
// apps/web/src/App.tsx (update to handle operator details route)
const [currentPage, setCurrentPage] = useState<Page>('dashboard');
const [selectedOperatorId, setSelectedOperatorId] = useState<string | null>(null);

// Update type to include operator details
type Page = 'dashboard' | 'operators' | 'staking' | 'operator-details';

const handleViewDetails = (operatorId: string) => {
  setSelectedOperatorId(operatorId);
  setCurrentPage('operator-details');
};

// Add operator details page rendering
if (currentPage === 'operator-details' && selectedOperatorId) {
  return (
    <OperatorDetailsPage
      operatorId={selectedOperatorId}
      onBack={() => setCurrentPage('operators')}
      onStake={handleStakeOperator}
      onNavigate={handleNavigate}
    />
  );
}
```

---

## 📊 Data Requirements

### **Enhanced Operator Service**

```typescript
// apps/web/src/services/operator-service.ts (enhance existing)
export const getOperatorById = async (operatorId: string): Promise<Operator | null> => {
  const api = await getSharedApiConnection('taurus');

  try {
    const [operatorData, domainList] = await Promise.all([operator(api, operatorId), domains(api)]);

    if (!operatorData) return null;

    // Map to enhanced operator with additional details
    return mapToDetailedOperator(operatorData, domainList);
  } catch (error) {
    console.error(`Failed to fetch operator ${operatorId}:`, error);
    return null;
  }
};

// Enhanced mapping for detailed view
const mapToDetailedOperator = (rawOperator: any, domains: any[]): Operator => {
  // ... existing mapping logic plus additional fields for details view
  return {
    ...mapToUiOperator(rawOperator, domains),
    // Additional fields that might be useful for details view
    signingKey: rawOperator.signingKey,
    currentEpochRewards: rawOperator.currentEpochRewards || null,
    nextDomainId: rawOperator.nextDomainId?.toString() || null,
    // ... other detailed fields
  };
};
```

---

## 📁 Files to Create

### **New Components**

```
apps/web/src/components/operators/details/
├── OperatorDetailsHeader.tsx        # Header with back nav and primary action
├── OperatorOverview.tsx            # Main operator information
├── OperatorMetrics.tsx             # Key performance metrics
├── OperatorTechnicalDetails.tsx    # Technical/blockchain details
├── OperatorActions.tsx             # Action buttons and links
├── OperatorQuickStats.tsx          # Sidebar statistics
├── OperatorDetailsLoading.tsx      # Loading state
├── OperatorDetailsError.tsx        # Error state
└── index.ts                        # Exports
```

### **New Pages**

```
apps/web/src/pages/
└── OperatorDetailsPage.tsx         # Main details page component
```

### **New Hooks**

```
apps/web/src/hooks/
└── use-operator-details.ts         # Enhanced operator data fetching
```

---

## 📁 Files to Modify

### **Existing Components**

```
apps/web/src/App.tsx                      # Add operator details routing
apps/web/src/pages/operators.tsx         # Update onViewDetails handler
apps/web/src/services/operator-service.ts # Enhance getOperatorById
apps/web/src/types/operator.ts           # Add detailed operator fields if needed
```

---

## 🧪 Testing Requirements

### **Unit Tests**

- [ ] Test `useOperatorDetails` hook with various operator IDs
- [ ] Test operator details components render correctly
- [ ] Test navigation between discovery and details
- [ ] Test error handling for invalid operator IDs

### **Integration Tests**

- [ ] Test complete flow from discovery to details
- [ ] Test staking action from details page
- [ ] Test back navigation functionality
- [ ] Test URL deep linking to operator details

### **Manual Testing**

- [ ] Navigate from operator discovery to details
- [ ] Verify all operator information displays correctly
- [ ] Test staking action from details page
- [ ] Test responsive design on mobile devices
- [ ] Test error states for network failures
- [ ] Test operator not found scenarios

---

## 🎯 Definition of Done

- [ ] **Operator details page** accessible via route `/operators/:operatorId`
- [ ] **Complete operator information** displayed in professional layout
- [ ] **Navigation working** from discovery to details and back
- [ ] **Staking integration** - can stake directly from details page
- [ ] **Mobile responsive** design implemented
- [ ] **Loading and error states** properly handled
- [ ] **Deep linking support** for sharing operator details
- [ ] **Auto-refresh** of operator data every 60 seconds
- [ ] **Accessibility compliance** with proper ARIA labels
- [ ] **Unit tests passing** for all new components
- [ ] **Manual testing completed** across different operators and states

---

## 🔄 Future Enhancements

This user story establishes the foundation for future operator detail enhancements:

- **Historical performance data** when indexer becomes available
- **Nominator list** showing who has staked with the operator
- **Reward distribution history** and analytics
- **Operator comparison tools** for side-by-side analysis
- **Operator social features** (descriptions, links, etc.)

---

## 📚 References

- **[Operator Discovery Implementation](./complete/operator-discovery-rpc.md)** - Foundation for operator data
- **[Auto SDK Operator API](https://develop.autonomys.xyz/sdk/auto-consensus#operator)** - RPC documentation
- **[Operator Service](../../apps/web/src/services/operator-service.ts)** - Current implementation
- **[Operator Types](../../apps/web/src/types/operator.ts)** - Data structure definitions

---

_This user story provides the detailed operator view functionality that completes the operator discovery experience._
