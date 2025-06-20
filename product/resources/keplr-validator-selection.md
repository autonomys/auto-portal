# Keplr Wallet Validator Selection Patterns

**Source:** [Keplr Cosmos Hub Staking](https://wallet.keplr.app/chains/cosmos-hub)  
**Date Analyzed:** <!-- YYYY-MM-DD -->  
**Focus:** Validator marketplace and selection UX

---

## Validator Discovery Interface

### Table-Based Comparison

**Columns Displayed:**

- Validator name with thumbnail/branding
- Voting power (amount + percentage)
- Commission rate
- Action button (stake/delegate)

**Sorting & Filtering:**

- Default sort by voting power
- Commission warnings for high fees
- Active validator count: 179 shown
- Clear APR display: 16.50% at top

### Visual Hierarchy

**Validator Branding:**

- Thumbnail images for recognition
- Branded validator names
- Professional vs amateur distinction clear
- Trust indicators (verification badges)

**Key Metrics Prominence:**

- Large voting power numbers
- Color-coded commission rates
- Clear percentage displays
- Warning states for high commission

---

## Information Architecture

### Page Structure

**Primary Navigation:**

- Staking (current)
- Governance
- Transactions
- Ecosystem

**Secondary Features:**

- Liquid Staking section
- Chain information sidebar
- Portfolio integration

### Validator Profiles

**Individual Validator Data:**

- Name and branding
- Voting power (absolute + percentage)
- Commission rate
- Implied trustworthiness signals

**Missing Information:**

- Uptime/performance history
- Detailed validator descriptions
- Infrastructure details
- Geographic distribution

---

## User Experience Patterns

### Progressive Disclosure

**Primary View:** Essential comparison data
**Secondary Details:** Available on demand
**Tertiary Info:** External links for deep research

### Mobile Optimization

- Touch-friendly row heights
- Simplified data display
- Swipe-friendly interface
- Responsive table design

### Trust Signals

**High Commission Warnings:**

- Clear red warning text
- Explanation of impact on rewards
- Suggestion to choose lower commission
- Repeated for multiple high-fee validators

**Validator Recognition:**

- Familiar brand names (Coinbase, Binance)
- Professional thumbnails
- Established validator indicators

---

## Interaction Patterns

### Selection Process

1. **Browse**: Scroll through validator list
2. **Compare**: Key metrics in table format
3. **Select**: Click validator row or action button
4. **Delegate**: Integrated staking flow

### Feedback Mechanisms

- Hover states on validator rows
- Clear action buttons
- Loading states during transactions
- Success confirmations

---

## Data Presentation

### Numerical Display

**Large Numbers:** Formatted with commas (1,811,380.4104 ATOM)
**Percentages:** Clear decimal precision (0.67%)
**Rates:** Prominent commission display (5%)

### Status Indicators

- Active validator count
- Commission warnings
- Voting power percentages
- Network-wide APR

---

## Key Learnings for Subspace

### Applicable Patterns

**Validator Marketplace:**

- Table-based comparison interface
- Key metrics prominently displayed
- Visual branding for recognition
- Commission warnings for user protection

**Trust Building:**

- Clear performance indicators
- Warning systems for poor choices
- Professional validator presentation
- Transparent fee display

**Mobile Experience:**

- Touch-optimized table design
- Essential information prioritized
- Simplified mobile layout
- Consistent interaction patterns

### Subspace-Specific Adaptations

**Domain Specialization:**

- Show which domains operators support
- Domain-specific performance metrics
- Infrastructure requirements per domain
- Operator expertise indicators

**Epoch-Based Staking:**

- Show next epoch timing
- Pending stake indicators
- Epoch transition status
- Historical epoch performance

**Storage Fund Communication:**

- Explain 20% storage allocation
- Show infrastructure contribution
- Network health indicators
- Storage fund usage transparency

---

## Missing Opportunities

### Enhanced Validator Profiles

- Detailed operator descriptions
- Infrastructure transparency
- Geographic distribution
- Performance history charts

### Advanced Filtering

- Commission rate ranges
- Voting power tiers
- Geographic preferences
- Performance-based sorting

### Portfolio Integration

- Current staking positions
- Rewards tracking
- Historical performance
- Unstaking status

---

## Technical Implementation Notes

### Performance Considerations

- Fast table rendering
- Efficient data loading
- Real-time updates
- Responsive design

### Accessibility

- Keyboard navigation
- Screen reader support
- High contrast mode
- Clear focus indicators

### Data Management

- Real-time validator data
- Cached performance metrics
- Efficient sorting/filtering
- Error handling for data failures

---

## Metrics Worth Tracking

### Selection Patterns

- Most viewed validators
- Commission rate preferences
- Voting power vs commission trade-offs
- Geographic preferences

### User Behavior

- Time spent comparing validators
- Selection criteria importance
- Return to selection frequency
- Validator switching patterns

---

_These patterns inform our operator marketplace design and help create an intuitive validator selection experience._
