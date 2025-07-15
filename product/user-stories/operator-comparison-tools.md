# ⚖️ Feature: Operator Comparison Tools

**Priority:** Low  
**Type:** Frontend + Data Analysis  
**Prerequisites:** ✅ Basic Operator Details, ✅ Operator Analytics (Optional)  
**Status:** 📋 **READY FOR IMPLEMENTATION**

---

## 📋 Summary

Implement side-by-side operator comparison tools that allow users to evaluate multiple operators simultaneously. This helps users make informed decisions by comparing key metrics, performance data, and characteristics across different operators.

**Current State:**

- Users can view individual operator details separately
- No way to compare operators side-by-side
- Users must manually track and compare metrics across multiple pages

**Target State:**

- Interactive comparison tool supporting 2-4 operators simultaneously
- Side-by-side metrics display with visual indicators
- Comparison scoring and recommendations
- Export and sharing capabilities for comparison results

---

## 👤 User Story

> **As a** nominator evaluating multiple operators  
> **I want to** compare operators side-by-side with key metrics  
> **So that** I can quickly identify the best operator for my staking strategy

---

## ✅ Acceptance Criteria

### **Comparison Interface**

- [ ] **Operator Selection**
  - Add operators to comparison from discovery page
  - Add operators from individual operator details pages
  - Support 2-4 operators in a single comparison
  - Easy removal and replacement of operators in comparison

- [ ] **Comparison Table Layout**
  - Side-by-side column layout with operators as columns
  - Sticky header with operator names and key identifiers
  - Categorized metrics (Basic Info, Performance, Risk, etc.)
  - Visual indicators for best/worst values in each metric

- [ ] **Key Metrics Comparison**
  - Commission rates with visual ranking
  - Total stake and pool size comparison
  - Minimum stake requirements
  - Current APR/performance metrics (if available)
  - Uptime and reliability scores

### **Advanced Features**

- [ ] **Comparison Scoring**
  - Weighted scoring system based on user preferences
  - Customizable weight allocation (performance vs fees vs reliability)
  - Overall recommendation score for each operator
  - "Best for your needs" recommendations

- [ ] **Visual Enhancements**
  - Color-coded performance indicators (green/yellow/red)
  - Bar charts for visual metric comparison
  - Trend arrows for improving/declining metrics
  - Risk level indicators and warnings

- [ ] **User Experience**
  - Responsive design supporting mobile comparison
  - Export comparison as PDF or image
  - Shareable comparison links
  - Save comparison for later reference

### **Navigation and Integration**

- [ ] **Entry Points**
  - "Compare" button on operator discovery cards
  - "Add to Comparison" on operator details pages
  - Direct comparison URL structure (/compare?operators=1,2,3)
  - Quick comparison widget in sidebar

- [ ] **Action Integration**
  - Direct staking actions from comparison view
  - "Stake to Winner" quick action button
  - Link back to individual operator details
  - Clear comparison and start over functionality

---

## 🏗️ Technical Implementation Plan

### **1. Comparison Store**

```typescript
// src/stores/comparison-store.ts
interface ComparisonState {
  selectedOperators: string[]; // operator IDs
  maxOperators: number; // 4
  comparisonData: OperatorComparisonData[];
  userWeights: ComparisonWeights;
  loading: boolean;

  // Actions
  addOperator: (operatorId: string) => void;
  removeOperator: (operatorId: string) => void;
  clearComparison: () => void;
  updateWeights: (weights: ComparisonWeights) => void;
  fetchComparisonData: () => Promise<void>;
}

interface ComparisonWeights {
  performance: number; // 0-100
  fees: number; // 0-100
  reliability: number; // 0-100
  poolSize: number; // 0-100
}
```

### **2. Comparison Components**

```typescript
// src/components/comparison/
├── OperatorComparisonPage.tsx        # Main comparison page
├── ComparisonTable.tsx               # Side-by-side metrics table
├── ComparisonScoring.tsx             # Weighted scoring display
├── ComparisonControls.tsx            # Add/remove operators, weights
├── ComparisonExport.tsx              # Export and sharing tools
├── ComparisonMetricRow.tsx           # Individual metric row component
└── ComparisonMobileView.tsx          # Mobile-optimized comparison
```

### **3. Comparison Service**

```typescript
// src/services/comparison-service.ts
export class ComparisonService {
  async getComparisonData(operatorIds: string[]): Promise<OperatorComparisonData[]> {
    // Fetch all operator data in parallel
    const operators = await Promise.all(operatorIds.map(id => operatorService.getOperatorById(id)));

    return operators.map(operator => this.formatForComparison(operator));
  }

  calculateComparisonScores(
    operators: OperatorComparisonData[],
    weights: ComparisonWeights,
  ): ScoredOperator[] {
    return operators.map(operator => ({
      ...operator,
      score: this.calculateWeightedScore(operator, weights),
      rankings: this.calculateRankings(operator, operators),
    }));
  }

  private calculateWeightedScore(
    operator: OperatorComparisonData,
    weights: ComparisonWeights,
  ): number {
    const performanceScore = this.normalizePerformance(operator.apy);
    const feeScore = this.normalizeFees(operator.commissionRate);
    const reliabilityScore = this.normalizeReliability(operator.uptime);
    const poolScore = this.normalizePoolSize(operator.totalStake);

    return (
      (performanceScore * weights.performance +
        feeScore * weights.fees +
        reliabilityScore * weights.reliability +
        poolScore * weights.poolSize) /
      100
    );
  }
}
```

### **4. Comparison Page Route**

```typescript
// src/router.tsx - Add comparison route
{
  path: "/compare",
  element: <OperatorComparisonPage />
},
{
  path: "/compare/:operatorIds", // e.g., /compare/1,2,3
  element: <OperatorComparisonPage />
}
```

---

## 📊 Comparison Metrics

### **Core Comparison Categories**

**Basic Information:**

- Operator Name & ID
- Domain & Network
- Status (Active/Inactive)
- Registration Date

**Financial Metrics:**

- Commission Rate (%)
- Minimum Stake Required
- Total Pool Stake
- Available Capacity

**Performance Indicators:**

- Current APR (if available)
- Historical Performance Score
- Uptime Percentage
- Block Production Rate

**Risk Assessment:**

- Pool Concentration Risk
- Performance Volatility
- Slashing History
- Overall Risk Score

### **Scoring Algorithm**

```typescript
// Scoring weights (user customizable)
const defaultWeights = {
  performance: 30, // APR and historical returns
  fees: 25, // Commission rates
  reliability: 25, // Uptime and consistency
  poolSize: 20, // Pool size and capacity
};

// Normalization (0-100 scale)
const normalizeMetric = (value: number, min: number, max: number, invert = false) => {
  const normalized = ((value - min) / (max - min)) * 100;
  return invert ? 100 - normalized : normalized;
};
```

---

## 📱 UI/UX Design

### **Desktop Comparison Table**

```
┌─────────────────────────────────────────────────────────────────┐
│ Operator Comparison (3 operators)                    [Export]    │
├─────────────────┬─────────────┬─────────────┬─────────────────┤
│ Metric          │ Operator 1  │ Operator 2  │ Operator 3      │
├─────────────────┼─────────────┼─────────────┼─────────────────┤
│ Commission      │ 5% 🟢       │ 8%          │ 12% 🔴          │
│ Total Stake     │ 12.4K AI3   │ 8.9K AI3 🔴 │ 15.2K AI3 🟢    │
│ Min Stake       │ 10 AI3      │ 50 AI3      │ 25 AI3          │
│ APR (30d)       │ 18.3% 🟢    │ 17.8%       │ 16.1%           │
│ Uptime          │ 99.2%       │ 99.8% 🟢    │ 97.1% 🔴        │
│ Risk Level      │ Low 🟢      │ Low         │ Medium ⚠️       │
├─────────────────┼─────────────┼─────────────┼─────────────────┤
│ Overall Score   │ 87/100 🥇   │ 82/100 🥈   │ 71/100 🥉       │
│ Action          │ [Stake Now] │ [Stake Now] │ [View Details]  │
└─────────────────┴─────────────┴─────────────┴─────────────────┘
```

### **Mobile Comparison Cards**

- Swipeable operator cards
- Key metrics prominently displayed
- Tap to expand full details
- Quick action buttons at bottom

### **Comparison Controls**

```
┌─────────────────────────────────────────────────────────────────┐
│ Scoring Preferences                                             │
│ ┌─────────────────┬───────────────────────────────────────────┐│
│ │ Performance     │ ████████████████████████░░ 80%           ││
│ │ Low Fees        │ ████████████░░░░░░░░░░░░░░░ 40%           ││
│ │ Reliability     │ ███████████████████████░░░ 75%           ││
│ │ Pool Size       │ ████████░░░░░░░░░░░░░░░░░░░ 30%           ││
│ └─────────────────┴───────────────────────────────────────────┘│
│ [Reset to Defaults] [Apply Weights]                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🧪 Testing Requirements

### **Functional Tests**

- [ ] Adding/removing operators from comparison works correctly
- [ ] Scoring algorithm produces consistent and logical results
- [ ] Export functionality generates correct comparison data
- [ ] Mobile responsive design maintains usability

### **User Experience Tests**

- [ ] Comparison table remains readable with 2-4 operators
- [ ] Visual indicators clearly highlight best/worst values
- [ ] Loading states handle slow data fetching gracefully
- [ ] Error handling for missing operator data

### **Performance Tests**

- [ ] Comparison loads quickly with multiple operators
- [ ] Scoring calculations don't block UI interactions
- [ ] Mobile performance remains smooth with complex layouts
- [ ] Export generation completes within reasonable time

---

## 🔍 Definition of Done

- [ ] **Core Functionality**
  - Support comparison of 2-4 operators simultaneously
  - Side-by-side metric comparison with visual indicators
  - Customizable scoring with user-defined weights
  - Export and sharing capabilities

- [ ] **Integration Points**
  - Add to comparison from operator discovery and details pages
  - Direct staking actions from comparison view
  - URL-based comparison sharing
  - Integration with existing operator data sources

- [ ] **User Experience**
  - Responsive design for desktop and mobile
  - Clear visual hierarchy and metric categorization
  - Professional loading states and error handling
  - Accessibility compliance with keyboard navigation

---

## 🎯 Success Metrics

### **Usage Analytics**

- Number of comparisons initiated per session
- Average number of operators compared
- Conversion rate from comparison to staking action
- Most frequently compared operators

### **User Behavior**

- Time spent on comparison page
- Most important metrics (based on user weight adjustments)
- Export/sharing frequency
- Return visits to saved comparisons

---

## 🔄 Future Enhancements

- **Saved Comparisons** - Bookmark favorite comparisons
- **Comparison History** - Track past comparisons and decisions
- **Advanced Filtering** - Filter operators before adding to comparison
- **Comparison Templates** - Pre-configured comparison setups
- **Social Sharing** - Share comparisons with community
- **Performance Alerts** - Notify when compared operators change significantly

---

## 📚 References

- **[Basic Operator Details](./operator-details-basic.md)** - Data source for comparison
- **[Operator Analytics](./operator-analytics.md)** - Advanced metrics integration
- **[Operator Discovery](./complete/operator-discovery-rpc.md)** - Entry point integration
- **[Design System](../design-system.md)** - Visual design standards

---

_This comparison tool empowers users to make data-driven staking decisions by providing clear, side-by-side evaluation of multiple operators with customizable scoring based on individual preferences._
