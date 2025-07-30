# 🔍 Feature: Basic Operator Details Page

**Priority:** Medium  
**Type:** Frontend + RPC Integration  
**Prerequisites:** ✅ Operator Discovery RPC Integration, ✅ Core Platform Complete  
**Status:** 📋 **READY FOR IMPLEMENTATION**

---

## 📋 Summary

Implement a basic operator details page that shows comprehensive operator information using existing RPC data sources. This provides users with detailed operator information when they click "Details" buttons from the operator discovery page.

**Current State:**

- Operator discovery shows basic operator cards with limited information
- "Details" button exists but leads to a placeholder or basic modal
- Users need more detailed operator information for informed staking decisions

**Target State:**

- Dedicated operator details page with comprehensive operator information
- Navigation from operator discovery and portfolio positions
- Professional layout showcasing operator stats, pool information, and staking actions

---

## 👤 User Story

> **As a** potential nominator browsing operators  
> **I want to** view detailed information about a specific operator  
> **So that** I can make informed decisions about where to stake my tokens

---

## ✅ Acceptance Criteria

### **Basic Operator Information Display**

- [ ] **Operator Header Section**
  - Display operator name, ID, and status prominently
  - Show domain information and domain name
  - Display operator's signing key (truncated with copy functionality)
  - Show operator status badge (Active/Inactive/Slashed)

- [ ] **Pool Statistics**
  - Current total stake with proper AI3 formatting
  - Number of nominators (calculated from RPC data or estimated)
  - Minimum nominator stake requirement
  - Commission rate (nomination tax) prominently displayed

- [ ] **Staking Information**
  - Available pool capacity or "unlimited" if no cap
  - Your current stake in this operator (if any)
  - Storage fund allocation explanation (20% of stakes)
  - Next epoch timing for stake activation

### **Navigation and Actions**

- [ ] **Page Routing**
  - Accessible via `/operators/:id` route
  - Navigation from operator discovery cards "Details" button
  - Navigation from portfolio positions table
  - Breadcrumb navigation (Operators > Operator Name)

- [ ] **Primary Actions**
  - Prominent "Stake to this Operator" button
  - "Withdraw" button if user has existing stake
  - Back to operators list navigation

### **Technical Implementation**

- [ ] **Data Integration**
  - Fetch operator details via existing `operator()` RPC call
  - Fetch domain information for operator's domain
  - Check user's current position with this operator (if wallet connected)
  - Handle operator not found (404) gracefully

- [ ] **Performance**
  - Load operator data on page mount
  - Cache operator data for 30 seconds
  - Show loading states while fetching data
  - Optimize for fast navigation from operator discovery

---

## 🏗️ Technical Implementation Plan

### **1. Create Operator Details Page Component**

```typescript
// src/pages/OperatorDetailsPage.tsx
export const OperatorDetailsPage = () => {
  const { operatorId } = useParams();
  const { operator, loading, error } = useOperatorDetails(operatorId);
  const { position } = useUserPosition(operatorId);

  if (loading) return <OperatorDetailsLoading />;
  if (error) return <OperatorNotFound />;

  return (
    <div className="container mx-auto py-6">
      <OperatorDetailsHeader operator={operator} />
      <OperatorPoolStats operator={operator} />
      <OperatorStakingInfo operator={operator} userPosition={position} />
      <OperatorActions operator={operator} userPosition={position} />
    </div>
  );
};
```

### **2. Operator Details Hook**

```typescript
// src/hooks/use-operator-details.ts
export const useOperatorDetails = (operatorId: string) => {
  const [operator, setOperator] = useState<Operator | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOperatorDetails = async () => {
      try {
        setLoading(true);
        const operatorData = await operatorService.getOperatorById(operatorId);
        if (!operatorData) {
          setError('Operator not found');
          return;
        }
        setOperator(operatorData);
      } catch (err) {
        setError('Failed to load operator details');
      } finally {
        setLoading(false);
      }
    };

    if (operatorId) {
      fetchOperatorDetails();
    }
  }, [operatorId]);

  return { operator, loading, error };
};
```

### **3. Component Structure**

```
src/components/operators/
├── OperatorDetailsHeader.tsx     # Operator name, status, domain
├── OperatorPoolStats.tsx         # Total stake, nominators, commission
├── OperatorStakingInfo.tsx       # Requirements, storage fund info
├── OperatorActions.tsx           # Stake/withdraw buttons
└── OperatorDetailsLoading.tsx    # Loading skeleton
```

### **4. Routing Integration**

```typescript
// src/router.tsx - Add operator details route
{
  path: "/operators/:id",
  element: <OperatorDetailsPage />
}
```

---

## 🎯 Data Sources

### **From Existing RPC Integration**

- ✅ **Operator Configuration** - Via `operator()` call
  - operatorId, domainId, minimumNominatorStake
  - nominationTax, status, currentTotalStake, signingKey

- ✅ **Domain Information** - Via `domains()` call
  - domainName, domainId, status

- ✅ **User Position** - Via existing position service
  - Current stake amount, shares owned, pending operations

### **Calculated/Derived Data**

- **Pool Capacity** - Calculate from operator constraints (if any)
- **Your Stake Percentage** - User stake / total pool stake
- **Storage Fund Contribution** - 20% of user's stake (informational)
- **Estimated Nominators** - Use existing mock calculation from discovery

---

## 📱 UI/UX Design

### **Page Layout**

```
┌─────────────────────────────────────────┐
│ ← Operators / Operator 1                │ Breadcrumb
├─────────────────────────────────────────┤
│ [Icon] Operator 1          🟢 Active     │ Header
│ Domain: Auto EVM                        │
│ ID: 1 • Owner: 5GXX...XXXX              │
├─────────────────────────────────────────┤
│ Pool Statistics                         │
│ ┌──────────────┬──────────────┬────────┐│
│ │ Total Staked │ Nominators   │ Tax    ││
│ │ 12,450 AI3   │ ~23          │ 5%     ││
│ └──────────────┴──────────────┴────────┘│
├─────────────────────────────────────────┤
│ Staking Information                     │
│ • Minimum Stake: 10 AI3                 │
│ • Your Current Stake: 100 AI3 (0.8%)    │
│ • Storage Fund: 20% of stake supports   │
│   network infrastructure               │
├─────────────────────────────────────────┤
│ [Stake to this Operator] [Withdraw]     │ Actions
└─────────────────────────────────────────┘
```

### **Mobile Responsive**

- Stack statistics cards vertically on mobile
- Ensure touch-friendly button sizes
- Maintain clear information hierarchy
- Optimize for one-handed navigation

---

## 🧪 Testing Requirements

### **Unit Tests**

- [ ] OperatorDetailsPage renders correctly with operator data
- [ ] useOperatorDetails hook handles loading, success, and error states
- [ ] Navigation to staking flow works correctly
- [ ] Error handling for non-existent operators

### **Integration Tests**

- [ ] End-to-end navigation from operators list to details
- [ ] Operator details page loads real data from RPC
- [ ] User position data integrates correctly
- [ ] Mobile responsive design functions properly

### **Manual Testing**

- [ ] Navigate from operators discovery to details page
- [ ] Verify all operator information displays correctly
- [ ] Test with and without wallet connection
- [ ] Test with and without existing stake in operator
- [ ] Verify error handling for invalid operator IDs

---

## 🔍 Definition of Done

- [ ] **Functional Requirements**
  - Operator details page displays all required information
  - Navigation works from discovery and portfolio
  - Actions (stake/withdraw) integrate with existing flows
  - Error handling for all edge cases

- [ ] **Technical Requirements**
  - Uses existing RPC data sources (no new dependencies)
  - Follows established component and routing patterns
  - TypeScript compliance with proper type definitions
  - Performance optimized with appropriate caching

- [ ] **UX Requirements**
  - Professional layout consistent with design system
  - Clear information hierarchy and readability
  - Mobile responsive design
  - Loading states and error handling

- [ ] **Quality Assurance**
  - Unit tests passing for all new components
  - Integration tests covering navigation flows
  - Manual testing completed across devices
  - Code review and PR approval

---

## 🔄 Future Enhancements

This basic implementation sets the foundation for more advanced features:

- **Operator Analytics** - Historical performance charts (requires indexer)
- **Nominator List** - Show current nominators (requires indexer queries)
- **Reward History** - Historical reward distributions (requires indexer)
- **Performance Metrics** - APR trends and uptime analytics (requires indexer)

---

## 📚 References

- **[Operator Discovery Implementation](./complete/operator-discovery-rpc.md)** - Existing RPC integration patterns
- **[Current Staking Flow](./complete/staking-flow.md)** - Integration points for stake actions
- **[Position Tracking](./complete/nominator-position-integration.md)** - User position data source
- **[Design System](../design-system.md)** - Component styling and patterns

---

_This basic operator details implementation provides essential operator information using existing infrastructure, enabling informed staking decisions while setting the foundation for future advanced analytics features._
