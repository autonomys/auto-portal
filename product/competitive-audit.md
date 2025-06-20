# Competitive Audit: Staking UX Patterns

**Date:** <!-- YYYY-MM-DD -->  
**Status:** In Progress

---

## 1. Current State: Polkadot Apps (Autonomys)

### 1.1 Current User Flow

Based on [Autonomys staking docs](https://docs.autonomys.xyz/staking/operator/polkadot):

**Operator Registration:**

1. Navigate to Polkadot Apps → Developer → Extrinsics
2. Select wallet, choose `domains`, select `registerOperator`
3. Enter domain ID (0 for Auto EVM)
4. Set initial stake amount **in Shannons** (100 tAI3 = 100 + 18 zeros)
5. Set minimum nominator stake **in Shannons**
6. Set nomination tax percentage
7. Submit transaction

**Nominator Flow:**

1. Navigate to Developer → Extrinsics
2. Select `domains` → `nominateOperator`
3. Enter operator ID manually
4. Enter amount **in Shannons** (complex conversion)
5. Submit transaction

**Withdrawal Flow (2-step):**

1. **Step 1: Withdraw** - `withdrawStake` extrinsic
   - Choose "All" or "Stake" (partial)
   - If partial: enter 80% of desired amount (due to 20% storage fund)
   - Submit transaction
2. **Step 2: Unlock** - `unlockNominator` extrinsic
   - Wait **14,400 domain blocks** (~locking period)
   - Submit unlock transaction to claim funds

### 1.2 Pain Points Identified

- **Complex Unit Conversion**: Users must calculate Shannons (10^18) manually
- **Poor Discoverability**: Hidden in Developer → Extrinsics (technical interface)
- **No Operator Browsing**: Must know operator ID beforehand
- **Confusing Withdrawal**: 80% calculation due to storage fund not explained
- **No Status Tracking**: No visibility into withdrawal progress or locking period
- **Mobile Hostile**: Developer tools not mobile-optimized
- **No Validation**: Easy to make errors with large numbers

---

## 2. Best-in-Class: Lido Finance

### 2.1 Strengths

**Simplicity & Clarity:**

- Single input field for ETH amount with "MAX" button
- Clear exchange rate display (1 ETH = 1 stETH)
- Prominent APR display (2.7%) with fee breakdown
- Simple fee structure (10% on rewards, clearly stated)

**Trust & Transparency:**

- Extensive FAQ addressing risks and security
- Multiple audit reports linked
- Real-time statistics (total staked, stakers count, market cap)
- Clear explanation of liquid staking mechanics

**User Experience:**

- One-click staking with wallet connection
- Estimated transaction cost shown upfront
- Clean, modern interface focused on core action
- Progressive disclosure (advanced info in FAQ)

### 2.2 Areas for Improvement

- Limited customization (can't choose specific validators)
- Centralized liquid staking model (not applicable to our use case)

---

## 3. Cosmos Ecosystem: Keplr Wallet

### 3.1 Strengths

**Validator Discovery:**

- Comprehensive validator list with key metrics
- Sortable by voting power, commission, APR
- Validator profiles with branding and descriptions
- Clear commission warnings for high-fee validators

**User Experience:**

- Integrated wallet experience (not separate dApp)
- Mobile-optimized interface
- Clear staking APR prominently displayed (16.50%)
- Validator thumbnails and branding for recognition

**Information Architecture:**

- Tabbed interface: Staking | Governance | Transactions | Ecosystem
- Portfolio view showing staked positions
- Transaction history integrated

### 3.2 Delegation Model Differences

- Single-step staking (no operator registration required)
- Immediate staking (no epoch boundaries)
- Simpler unbonding (21-day period, single step)

---

## 4. Key UX Patterns & Opportunities

### 4.1 Information Hierarchy

**Priority 1 (Above Fold):**

- Current APR/rewards rate
- Stake amount input with validation
- Primary CTA button
- Wallet connection status

**Priority 2 (Secondary):**

- Fee breakdown and explanation
- Estimated transaction cost
- Risk disclaimers

**Priority 3 (Progressive Disclosure):**

- Detailed operator information
- Historical performance data
- Advanced settings

### 4.2 Operator Selection UX

**Current State:** Manual operator ID entry  
**Opportunity:** Visual operator marketplace with:

- Commission rates and performance metrics
- Operator branding and descriptions
- Uptime and reliability indicators
- Stake distribution and capacity

### 4.3 Transaction Flow Improvements

**Current State:** Complex multi-step technical interface  
**Opportunity:** Guided wizard with:

- Smart defaults and validation
- Real-time fee calculation
- Clear progress indicators
- Error prevention and recovery

### 4.4 Withdrawal/Unlock Communication

**Current State:** Confusing 2-step process with manual calculations  
**Opportunity:** Clear status tracking with:

- Visual timeline showing current step
- Countdown timer for unlock period
- Automatic unlock notifications
- Clear explanation of storage fund mechanics

---

## 5. Mobile-First Considerations

### 5.1 Current Gaps

- Polkadot Apps unusable on mobile
- Complex number entry difficult on mobile keyboards
- No mobile wallet deep-linking

### 5.2 Mobile Opportunities

- Touch-optimized input controls
- Simplified operator selection (cards vs tables)
- Swipe gestures for navigation
- Push notifications for epoch transitions

---

## 6. Competitive Advantages for Autonomys

### 6.1 Unique Value Props

- **Domain-Specific Staking**: Operators run specific domains (unique positioning)
- **Storage Fund Innovation**: 20% allocation for infrastructure (needs clear explanation)
- **Epoch-Based Processing**: Predictable timing for deposits/withdrawals

### 6.2 Differentiation Opportunities

- **Operator Marketplace**: Rich profiles showing domain specialization
- **Predictable Timing**: Clear epoch countdown and scheduling
- **Infrastructure Transparency**: Show how storage funds support network health

---

## 7. Design System Implications

### 7.1 Component Needs

- **Operator Cards**: Rich validator selection interface
- **Amount Input**: Smart validation with unit conversion
- **Progress Indicators**: Multi-step transaction flows
- **Status Badges**: Staking states (pending, active, withdrawing, unlocking)
- **Countdown Timers**: Epoch boundaries and unlock periods

### 7.2 Responsive Patterns

- **Desktop**: Table-based operator comparison
- **Mobile**: Card-based operator selection with filtering
- **Tablet**: Hybrid approach with collapsible details

---

## 8. Next Steps

### 8.1 Immediate Actions

1. **Wireframe Core Flows**: Start with nominator staking journey
2. **Operator Data Modeling**: Define what information to display
3. **Unit Conversion Strategy**: Hide Shannon complexity from users
4. **Withdrawal UX Design**: Clear 2-step process visualization

### 8.2 Research Needs

1. **Technical Feasibility**: Confirm RPC capabilities for operator data
2. **Performance Requirements**: Real-time vs cached data trade-offs
3. **Wallet Integration**: Test mobile wallet signing flows

---

## 9. Key Takeaways

### 9.1 Critical Success Factors

- **Hide Complexity**: Abstract away technical details (Shannons, extrinsics)
- **Visual Operator Selection**: Rich marketplace vs manual ID entry
- **Clear Withdrawal Process**: 2-step flow with progress tracking
- **Mobile Optimization**: Touch-first design from day one

### 9.2 Avoid These Pitfalls

- Technical interfaces for end users
- Complex unit conversions
- Hidden or unclear fee structures
- Poor mobile experience
- Lack of transaction status feedback

---

_This audit informs our design decisions and helps identify competitive advantages._
