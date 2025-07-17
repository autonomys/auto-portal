# 📊 Feature: Operator Analytics & Performance Metrics

**Priority:** Medium  
**Type:** Frontend + GraphQL Integration  
**Prerequisites:** ✅ Basic Operator Details Page, ✅ Auto Portal Indexer Schema Documentation  
**Status:** 📋 **READY FOR IMPLEMENTATION** (Requires Indexer Deployment)

---

## 📋 Summary

Enhance the operator details page with rich historical analytics and performance metrics using the Auto Portal indexer. This provides users with comprehensive data to evaluate operator performance over time and make informed long-term staking decisions.

**Current State:**

- Basic operator details page shows current RPC data (total stake, commission, status)
- No historical performance data or trend analysis
- Users cannot evaluate operator consistency or long-term performance

**Target State:**

- Rich analytics dashboard with historical performance charts
- APR trends, reward distribution history, and uptime metrics
- Performance comparison tools and risk indicators
- Data-driven insights for staking decisions

---

## 👤 User Story

> **As a** sophisticated nominator evaluating operators  
> **I want to** see historical performance data and analytics for operators  
> **So that** I can make data-driven decisions about long-term staking commitments

---

## ✅ Acceptance Criteria

### **Performance Charts & Metrics**

- [ ] **APR Trend Chart**
  - 30-day rolling APR calculation and display
  - Interactive chart showing APR evolution over time
  - Average, min, max APR indicators
  - Comparison with network average APR

- [ ] **Share Price Evolution**
  - Historical share price chart showing pool growth
  - Share price milestones and significant changes
  - Compound growth visualization
  - Performance vs other operators

- [ ] **Pool Growth Analytics**
  - Total stake growth over time
  - Nominator count evolution
  - Pool composition and distribution metrics
  - Staking volume trends

### **Operator Reliability Metrics**

- [ ] **Uptime & Performance**
  - Block production uptime percentage
  - Missed block analysis and patterns
  - Downtime incidents and recovery times
  - Performance consistency indicators

- [ ] **Reward Distribution History**
  - Historical reward distribution patterns
  - Reward frequency and consistency
  - Largest reward events and analysis
  - Reward per epoch trends

- [ ] **Risk Assessment**
  - Slashing history (if any) with details
  - Performance volatility indicators
  - Pool concentration risk metrics
  - Operator behavior pattern analysis

### **Advanced Analytics Features**

- [ ] **Comparative Analysis**
  - Performance vs network average
  - Ranking among all operators
  - Percentile performance indicators
  - Best/worst performing periods

- [ ] **Predictive Insights**
  - Estimated future returns based on trends
  - Pool capacity projections
  - Performance trajectory analysis
  - Risk-adjusted return calculations

- [ ] **Interactive Data Exploration**
  - Time range selection (7d, 30d, 90d, 1y)
  - Metric filtering and customization
  - Data export capabilities
  - Detailed drill-down views

---

## 🏗️ Technical Implementation Plan

### **1. Indexer Integration Service**

```typescript
// src/services/indexer-service.ts
export class IndexerService {
  private baseUrl: string;

  async getOperatorAPYHistory(operatorId: string, timeRange: string) {
    const query = `
      query GetOperatorAPYHistory($operatorId: String!, $timeRange: String!) {
        operator(id: $operatorId) {
          apyHistory(timeRange: $timeRange) {
            epoch
            timestamp
            apy
            sharePrice
            totalStake
          }
        }
      }
    `;
    return this.graphqlQuery(query, { operatorId, timeRange });
  }

  async getOperatorRewardHistory(operatorId: string, limit: number = 50) {
    const query = `
      query GetOperatorRewards($operatorId: String!, $limit: Int!) {
        operatorRewards(
          where: { operatorId: $operatorId }
          orderBy: { epoch: desc }
          limit: $limit
        ) {
          epoch
          amount
          timestamp
          nominatorCount
        }
      }
    `;
    return this.graphqlQuery(query, { operatorId, limit });
  }

  async getOperatorUptimeMetrics(operatorId: string) {
    const query = `
      query GetOperatorUptime($operatorId: String!) {
        operator(id: $operatorId) {
          uptimeMetrics {
            totalBlocks
            missedBlocks
            uptimePercentage
            lastDowntime
            downtimeIncidents {
              startEpoch
              endEpoch
              duration
              reason
            }
          }
        }
      }
    `;
    return this.graphqlQuery(query, { operatorId });
  }
}
```

### **2. Analytics Components**

```typescript
// src/components/operators/analytics/
├── OperatorAnalyticsSection.tsx     # Main analytics container
├── APRTrendChart.tsx               # APR performance over time
├── SharePriceChart.tsx             # Share price evolution
├── PoolGrowthChart.tsx             # Total stake and nominator growth
├── UptimeMetrics.tsx               # Uptime and reliability stats
├── RewardHistory.tsx               # Historical reward distributions
├── PerformanceComparison.tsx       # vs network average
├── RiskAssessment.tsx              # Risk indicators and analysis
└── AnalyticsTimeRangeSelector.tsx  # Time range controls
```

### **3. Enhanced Operator Details Page**

```typescript
// src/pages/OperatorDetailsPage.tsx (Enhanced)
export const OperatorDetailsPage = () => {
  const { operatorId } = useParams();
  const { operator, loading, error } = useOperatorDetails(operatorId);
  const { analytics, analyticsLoading } = useOperatorAnalytics(operatorId);
  const [timeRange, setTimeRange] = useState('30d');

  return (
    <div className="container mx-auto py-6">
      {/* Basic Info Section (from basic implementation) */}
      <OperatorDetailsHeader operator={operator} />
      <OperatorPoolStats operator={operator} />

      {/* Enhanced Analytics Section */}
      <OperatorAnalyticsSection
        operatorId={operatorId}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
      />

      <OperatorActions operator={operator} />
    </div>
  );
};
```

### **4. Analytics Hooks**

```typescript
// src/hooks/use-operator-analytics.ts
export const useOperatorAnalytics = (operatorId: string, timeRange: string = '30d') => {
  const [analytics, setAnalytics] = useState<OperatorAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const [apyHistory, rewardHistory, uptimeMetrics] = await Promise.all([
          indexerService.getOperatorAPYHistory(operatorId, timeRange),
          indexerService.getOperatorRewardHistory(operatorId),
          indexerService.getOperatorUptimeMetrics(operatorId),
        ]);

        setAnalytics({
          apyHistory,
          rewardHistory,
          uptimeMetrics,
          performanceScore: calculatePerformanceScore(apyHistory, uptimeMetrics),
          riskAssessment: calculateRiskAssessment(rewardHistory, uptimeMetrics),
        });
      } catch (error) {
        console.error('Failed to fetch operator analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    if (operatorId) {
      fetchAnalytics();
    }
  }, [operatorId, timeRange]);

  return { analytics, loading };
};
```

---

## 📊 Data Integration with Auto Portal Indexer

### **Required GraphQL Queries**

Based on the [Auto Portal Indexer Schema](../resources/auto-portal-indexer-schema.md):

- ✅ **OperatorEpochSharePrice** - Historical share price and APR calculations
- ✅ **OperatorReward** - Reward distribution history and patterns
- ✅ **NominatorDeposit** - Pool growth and nominator activity analysis
- ✅ **NominatorWithdrawal** - Withdrawal patterns and pool stability
- ✅ **UnlockedEvent** - Transaction activity and volume metrics

### **Performance Calculations**

```typescript
// APR Calculation from indexer data
const calculateAPR = (sharePrices: SharePriceData[]) => {
  const periodicReturns = sharePrices.map((current, index) => {
    if (index === 0) return 0;
    const previous = sharePrices[index - 1];
    return (current.sharePrice - previous.sharePrice) / previous.sharePrice;
  });

  const averageReturn = periodicReturns.reduce((sum, ret) => sum + ret, 0) / periodicReturns.length;
  return averageReturn * EPOCHS_PER_YEAR * 100; // Convert to annual percentage
};

// Risk Assessment
const calculateRiskScore = (rewardHistory: RewardData[], uptimeMetrics: UptimeData) => {
  const rewardVolatility = calculateVolatility(rewardHistory.map(r => r.amount));
  const uptimeScore = uptimeMetrics.uptimePercentage / 100;
  const consistencyScore = 1 - rewardVolatility;

  return (uptimeScore * 0.6 + consistencyScore * 0.4) * 100;
};
```

---

## 📱 Enhanced UI/UX Design

### **Analytics Dashboard Layout**

```
┌─────────────────────────────────────────┐
│ Basic Operator Info (from basic page)   │
├─────────────────────────────────────────┤
│ Analytics [7d] [30d] [90d] [1y]         │ Time Range
├─────────────────────────────────────────┤
│ ┌─────────────────┬─────────────────────┐│
│ │ APR Trend Chart │ Performance Summary ││
│ │                 │ • Avg APR: 18.3%    ││
│ │     ~~~📈~~~    │ • Best: 21.2%       ││
│ │                 │ • Uptime: 99.1%     ││
│ └─────────────────┴─────────────────────┘│
├─────────────────────────────────────────┤
│ ┌─────────────────┬─────────────────────┐│
│ │ Pool Growth     │ Risk Assessment     ││
│ │                 │                     ││
│ │     ~~~📊~~~    │ 🟢 Low Risk         ││
│ │                 │ • Stable rewards    ││
│ │                 │ • High uptime       ││
│ └─────────────────┴─────────────────────┘│
├─────────────────────────────────────────┤
│ Recent Reward History                   │
│ Epoch 1234: 125.4 AI3 • 2 hours ago    │
│ Epoch 1233: 118.7 AI3 • 8 hours ago    │
│ [View All Rewards]                      │
└─────────────────────────────────────────┘
```

### **Interactive Chart Features**

- **Zoom & Pan** - Detailed time period analysis
- **Hover Tooltips** - Precise data point information
- **Metric Overlays** - Compare multiple metrics on same chart
- **Responsive Design** - Touch-friendly mobile interactions

---

## 🎯 Performance & Caching Strategy

### **Data Caching**

- **Analytics Data** - Cache for 10 minutes (slower-changing historical data)
- **Recent Performance** - Cache for 2 minutes (more frequent updates)
- **Chart Data** - Client-side caching with time-based invalidation
- **Comparative Data** - Cache network averages for 1 hour

### **Progressive Loading**

1. **Basic Info** - Load immediately from RPC
2. **Recent Metrics** - Load most recent analytics first
3. **Historical Charts** - Load in background after basic data
4. **Detailed Analysis** - Load on-demand when user explores deeper

---

## 🧪 Testing Requirements

### **Integration Tests**

- [ ] GraphQL queries return expected data structure
- [ ] Chart components render with real indexer data
- [ ] Time range filtering works correctly
- [ ] Performance calculations match expected results

### **Visual Testing**

- [ ] Charts display correctly across different screen sizes
- [ ] Interactive features (zoom, hover) work properly
- [ ] Loading states and error handling are user-friendly
- [ ] Color schemes maintain accessibility standards

### **Performance Testing**

- [ ] Page load times remain under 3 seconds with full analytics
- [ ] Chart rendering performs well with large datasets
- [ ] Memory usage stays reasonable during data exploration
- [ ] Caching reduces unnecessary API calls

---

## 🔍 Definition of Done

- [ ] **Analytics Integration**
  - All required indexer queries implemented and tested
  - Historical data displays accurately in charts
  - Performance calculations match business requirements
  - Error handling for missing or incomplete data

- [ ] **User Experience**
  - Interactive charts respond smoothly to user input
  - Time range selection updates all relevant metrics
  - Loading states provide clear feedback during data fetching
  - Mobile responsive design maintains usability

- [ ] **Performance Standards**
  - Page loads within 3 seconds on average connection
  - Chart interactions remain responsive with large datasets
  - Appropriate caching reduces server load
  - Progressive loading ensures core functionality available immediately

---

## 📈 Success Metrics

### **User Engagement**

- Time spent on operator details pages (expect 50%+ increase)
- Depth of analytics exploration (chart interactions, time range changes)
- Conversion from analytics view to staking action

### **Data Accuracy**

- APR calculations match actual operator performance
- Historical data integrity and completeness
- Performance comparison accuracy vs actual network data

---

## 🔄 Future Enhancements

- **Predictive Analytics** - ML-based performance forecasting
- **Operator Comparison Tool** - Side-by-side analytics comparison
- **Custom Alerts** - Performance threshold notifications
- **Portfolio Integration** - Analytics for user's current operators
- **Advanced Risk Models** - Sophisticated risk assessment algorithms

---

## 📚 References

- **[Basic Operator Details](./operator-details-basic.md)** - Foundation implementation
- **[Auto Portal Indexer Schema](../resources/auto-portal-indexer-schema.md)** - Data source documentation
- **[GraphQL Integration Patterns](../technical-architecture.md)** - API integration guidelines
- **[Chart Component Library](../design-system.md)** - Visualization standards

---

_This advanced analytics implementation transforms the basic operator details page into a comprehensive data-driven decision-making tool, providing users with the insights needed for sophisticated staking strategies._
