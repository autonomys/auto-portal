# Polkadot Apps Staking Interface Analysis

**Source:** [Autonomys Staking Documentation](https://docs.autonomys.xyz/staking/operator/polkadot)  
**Interface:** [Polkadot Apps - Autonomys Network](https://polkadot.js.org/apps/?rpc=wss://rpc.taurus.autonomys.xyz/ws#/extrinsics)  
**Date Analyzed:** <!-- YYYY-MM-DD -->

---

## Current User Flows

### Operator Registration Flow

1. **Navigation**: Polkadot Apps → Developer → Extrinsics
2. **Wallet Selection**: Choose from connected wallets
3. **Extrinsic Selection**:
   - Module: `domains`
   - Call: `registerOperator`
4. **Parameters**:
   - `domainId`: 0 for Auto EVM
   - `amount`: Initial stake in Shannons (100 tAI3 = 100 + 18 zeros)
   - `config.minimumNominatorStake`: Min stake in Shannons (10 tAI3 = 10 + 18 zeros)
   - `config.nominationTax`: Percentage as integer ≥ 0
5. **Transaction**: Submit and sign

### Nominator Staking Flow

1. **Navigation**: Developer → Extrinsics
2. **Extrinsic Selection**:
   - Module: `domains`
   - Call: `nominateOperator`
3. **Parameters**:
   - `operatorId`: Must know ID beforehand
   - `amount`: Stake amount in Shannons
4. **Transaction**: Submit and sign

### Withdrawal Process (2-Step)

#### Step 1: Withdraw Request

- **Extrinsic**: `withdrawStake`
- **Parameters**:
  - `operatorId`: Target operator
  - **Withdrawal Type Options**:
    - `All`: Withdraw full amount
    - `Stake`: Partial withdrawal
- **Calculation Complexity**: For partial withdrawal, enter 80% of desired amount (remaining 20% held in storage fund, auto-refunded)
- **Waiting Period**: 14,400 domain blocks until unlock

#### Step 2: Unlock Funds

- **Extrinsic**: `unlockNominator`
- **Parameters**: `operatorId` only
- **Result**: Transfers unlocked tokens to balance

---

## Identified Pain Points

### 1. Unit Conversion Complexity

- **Issue**: Manual Shannon calculation (10^18 conversion)
- **Example**: 100 tAI3 = 100000000000000000000 Shannons
- **Impact**: High error rate, poor UX

### 2. Poor Discoverability

- **Issue**: Staking hidden in Developer tools
- **Context**: Technical interface not meant for end users
- **Impact**: Intimidating for non-technical users

### 3. Operator Discovery Gap

- **Issue**: No browsing/search for operators
- **Current**: Must know exact operator ID
- **Missing**: Operator profiles, performance metrics, comparison tools

### 4. Storage Fund Confusion

- **Issue**: 80% calculation not explained in interface
- **Context**: 20% automatically allocated to storage fund
- **Impact**: Users confused about partial withdrawals

### 5. No Progress Tracking

- **Issue**: No visibility into withdrawal status
- **Missing**:
  - Countdown timer for unlock period
  - Current withdrawal state
  - Historical transaction status

### 6. Mobile Incompatibility

- **Issue**: Developer tools not mobile-optimized
- **Impact**: Excludes mobile-first users

---

## Technical Interface Patterns

### Form Structure

- Dropdown-based parameter selection
- Raw text inputs for numeric values
- No input validation or smart defaults
- Submit button with wallet signature flow

### Error Handling

- Basic blockchain error messages
- No user-friendly error explanation
- No prevention of common mistakes

### Data Display

- Technical parameter names exposed
- No human-readable formatting
- Minimal contextual help

---

## Positive Patterns to Preserve

### Transaction Transparency

- Clear extrinsic details before signing
- Estimated gas fees shown
- Transaction hash provided after submission

### Wallet Integration

- Multiple wallet support
- Clear connection status
- Secure signing flow

---

## Key Learnings for Our Design

### What to Abstract Away

- Shannon unit conversions
- Technical extrinsic terminology
- Raw parameter entry
- Developer tool complexity

### What to Enhance

- Operator discovery and comparison
- Withdrawal process clarity
- Mobile-first design
- Progress tracking and status

### What to Preserve

- Transaction transparency
- Security model
- Multi-wallet support

---

## Screenshots Referenced

_Note: Screenshots available in Autonomys documentation_

- Nominate Operator interface
- Register Operator form
- Withdraw Stake options
- Unlock Nominator flow

---

_This analysis informs our design decisions by understanding current user pain points and technical constraints._
