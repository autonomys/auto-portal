# 🔍 Enhanced Operator Discovery with Indexer

**Priority:** High  
**Type:** Enhancement  
**Status:** Ready for Implementation  
**Prerequisites:** Auto Portal Indexer GraphQL endpoint available

---

## 📋 User Story

**As a** nominator exploring staking opportunities  
**I want to** browse and search all available operators with advanced filtering  
**So that I** can discover the best operators for my staking needs without being limited to a hardcoded list

---

## 🎯 Problem Statement

Currently, the operator discovery page only shows 2 hardcoded operators (IDs 0 and 3) because we fetch them individually via RPC calls. This severely limits user choice and prevents discovering new or better-performing operators. With the indexer now available, we can provide comprehensive operator discovery.

### Current Pain Points:

- Only 2 operators visible (hardcoded list)
- No real pagination support
- Limited filtering capabilities
- No search functionality across all operators

---

## ✅ Acceptance Criteria

### **Must Have**

- [ ] Display ALL active operators from the indexer (not just hardcoded list)
- [ ] Implement pagination (20-50 operators per page)
- [ ] Basic search by operator ID, owner address, or signing key
- [ ] Filter by domain ID
- [ ] Filter by status (active/inactive)
- [ ] Sort by: total stake, nomination tax, minimum stake requirement
- [ ] Loading states while fetching from GraphQL
- [ ] Error handling for indexer connection issues
- [ ] Fallback to RPC for operator details if needed

### **Should Have**

- [ ] Real-time operator count display
- [ ] Filter by nomination tax range (e.g., 0-5%, 5-10%, etc.)
- [ ] Filter by minimum stake requirements
- [ ] Preserve filter/search state in URL params
- [ ] "Load More" or numbered pagination
- [ ] Empty state when no operators match filters

### **Could Have**

- [ ] Export filtered results as CSV
- [ ] Save filter presets
- [ ] Bulk comparison selection

---

## 🔧 Technical Implementation

### **Data Source Migration**

Replace hardcoded RPC calls with GraphQL queries:

```typescript
// GraphQL query for operator discovery
const GET_OPERATORS = gql`
  query GetOperators($first: Int!, $offset: Int!, $where: OperatorRegistrationWhereInput) {
    operatorRegistrations(
      first: $first
      offset: $offset
      where: $where
      orderBy: blockHeight_DESC
    ) {
      nodes {
        id
        owner
        domainId
        signingKey
        minimumNominatorStake
        nominationTax
        blockHeight
      }
      totalCount
    }
  }
`;
```

### **Service Layer Updates**

1. Create new `indexer-service.ts` for GraphQL operations
2. Update `operator-service.ts` to use indexer as primary source
3. Keep RPC fallback for detailed operator data
4. Add caching layer for frequently accessed operators

### **State Management**

Update operator store to handle:

- Paginated data structure
- Total operator count
- Current page/offset
- Active filters
- Search query debouncing

### **UI Components**

1. **Enhanced Filters Component**
   - Domain selector (fetch domains from indexer)
   - Tax rate slider/range
   - Minimum stake input
   - Status toggle

2. **Pagination Component**
   - Page size selector
   - Current page indicator
   - Total results display
   - Navigation controls

3. **Search Component**
   - Debounced input
   - Search type selector (ID/address/signing key)
   - Clear button
   - Search results count

---

## 🎨 Design Considerations

### **Performance**

- Implement query debouncing for search (300-500ms)
- Cache operator list for 5 minutes
- Lazy load operator details on hover/expand
- Virtual scrolling for large result sets

### **User Experience**

- Show skeleton loaders during pagination
- Maintain scroll position on filter changes
- Highlight newly discovered operators
- Provide tooltips explaining each filter

### **Responsive Design**

- Mobile-friendly filter drawer
- Simplified table view on small screens
- Touch-friendly pagination controls

---

## 📊 Success Metrics

- **Operator Discovery Rate**: % of users viewing >5 operators (target: >80%)
- **Filter Usage**: % of users applying at least one filter (target: >60%)
- **Page Load Time**: <2s for initial 50 operators
- **Search Success Rate**: % of searches returning results (target: >90%)

---

## 🚀 Implementation Plan

### **Commit 1: GraphQL Foundation**

- Add GraphQL client dependency (Apollo Client or urql)
- Create `indexer-service.ts` with basic GraphQL setup
- Add GraphQL schema types for OperatorRegistration
- Test connection to indexer endpoint

### **Commit 2: Core Data Integration**

- Implement `GET_OPERATORS` query in indexer service
- Update operator store to handle GraphQL data source
- Replace hardcoded `TARGET_OPERATORS` with indexer calls
- Maintain RPC fallback for operator details

### **Commit 3: Pagination Infrastructure**

- Add pagination state to operator store (page, pageSize, totalCount)
- Update `OperatorGrid` and `OperatorTable` for paginated data
- Add pagination controls component
- Implement "Load More" functionality

### **Commit 4: Search Implementation**

- Add search input component with debouncing
- Implement search by operator ID, owner, signing key
- Update GraphQL query with search filters
- Add search state to URL params

### **Commit 5: Basic Filtering**

- Add domain filter dropdown (fetch domains from indexer)
- Add status filter toggle (active/inactive)
- Update GraphQL where clause for filters
- Preserve filter state in URL

### **Commit 6: Sorting & Advanced Filters**

- Add sort dropdown (total stake, nomination tax, minimum stake)
- Implement tax rate range slider
- Add minimum stake requirement filter
- Update sort/filter UI feedback

### **Commit 7: Performance & Polish**

- Add query caching and debouncing
- Implement loading states and error handling
- Add empty state when no results
- Performance optimizations for large result sets

---

## 🔗 Dependencies

- Auto Portal Indexer GraphQL endpoint: `https://subql.blue.taurus.subspace.network/v1/graphql`
- GraphQL client library (Apollo Client or similar)
- Updated operator type definitions
- Indexer schema documentation

---

## 📝 Notes

- Start with read-only indexer integration (no mutations needed)
- Keep RPC integration for real-time data and transactions
- Consider implementing a "featured operators" section for high-quality operators
- Future enhancement: Add operator performance metrics once available in indexer

---

_This story significantly improves operator discovery by removing the artificial limitation of showing only 2 operators, enabling users to explore the full ecosystem of staking opportunities._
