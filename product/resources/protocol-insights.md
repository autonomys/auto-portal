# Autonomys Staking Protocol Insights

**Source:** [Protocol Staking Specification](https://github.com/subspace/protocol-specs/blob/main/docs/decex/staking.md)  
**Date Analyzed:** <!-- YYYY-MM-DD -->  
**Focus:** Protocol mechanics that impact UX design

---

## Core Staking Mechanics

### Share-Based Pool System

**How It Works:**

- Operators create staking pools with share-based rewards
- Nominators receive shares proportional to their stake
- Share price increases with rewards over time
- More efficient than traditional checkpointed systems

**UX Implications:**

- Need to explain share vs token amounts
- Show share price evolution over time
- Calculate rewards based on share appreciation
- Handle share-to-token conversions transparently

### Epoch-Based Processing

**Timing Mechanics:**

- Deposits processed at next epoch transition
- Withdrawals initiated immediately, processed at epoch end
- Share price calculated at epoch boundaries
- Predictable timing for all operations

**UX Opportunities:**

- Show countdown to next epoch
- Explain pending vs active stake
- Provide predictable timing expectations
- Batch operations for efficiency

---

## Operator Registration Process

### Required Configuration

**Operator Settings:**

- `nomination_tax`: Fee percentage (e.g., 5%)
- `minimum_nominator_stake`: Min stake to participate (>1 SSC)
- `domain_id`: Target domain for operation
- `signing_key`: Operator's signing key

**Storage Fund Allocation:**

- 20% of all stakes go to storage fund
- Used for paying bundle storage fees
- Automatically managed by protocol
- Refunded proportionally on withdrawal

### Registration Flow

1. Operator provides config and initial stake
2. Entry created in Operators registry
3. 20% transferred to storage fund account
4. Added to `next_operators` set
5. Activated at next epoch transition
6. Can participate in VRF bundle election

---

## Nominator Staking Journey

### First-Time Nomination

**Process:**

1. Choose operator and deposit amount
2. 20% transferred to storage fund
3. Remainder locked in nominator's balance
4. Added as `PendingDeposit`
5. Shares calculated at next epoch
6. Becomes active staking position

**Share Calculation:**

- `shares = deposit_amount / share_price`
- Initial share price = 1 at pool creation
- Price increases with accumulated rewards

### Subsequent Deposits

**Aggregation Logic:**

- Multiple deposits in same epoch aggregated
- Previous pending deposits converted to shares
- New deposit added to current epoch
- Efficient batch processing

---

## Withdrawal Process (Two-Step)

### Step 1: Withdraw Request

**User Actions:**

- Submit `withdrawStake` extrinsic
- Choose withdrawal type:
  - `All`: Full withdrawal
  - `Percent`: Percentage of stake
  - `Stake`: Specific token amount
  - `Share`: Specific share amount

**System Processing:**

- Convert pending deposits to shares using historical prices
- Aggregate existing withdrawals for same epoch
- Enforce `WithdrawalLimit` per nominator
- Calculate storage fee refund proportionally
- Lock refund amount in storage fund

### Step 2: Unlock Funds

**Timing Requirements:**

- Wait for `StakeWithdrawalLockingPeriod`
- Measured in confirmed domain blocks
- Variable timing based on network activity

**Unlock Process:**

- Submit `unlock_funds` extrinsic
- Process withdrawals from oldest to newest
- Stop at any not yet unlocked
- Calculate final amounts using epoch share prices
- Release funds to transferable balance

---

## Key Protocol Constraints

### Withdrawal Limitations

- Maximum `WithdrawalLimit` pending withdrawals per nominator
- Must unlock previous withdrawals before new ones
- Locking period tied to domain block confirmations
- Storage fund refunds calculated at withdrawal time

### Minimum Stakes

- Operators: `MinOperatorStake` (≥100 tokens)
- Nominators: Per-operator `minimum_nominator_stake` setting
- Auto-unstaking if below minimum after withdrawal

### Slashing Mechanics

- Entire operator pool slashed for fraud
- Pool immediately frozen (no deposits/withdrawals)
- All pending withdrawals sent to treasury
- Pool balance transferred to treasury
- Operator removed from registry

---

## UX Design Implications

### Share Price Communication

**Challenge:** Users think in tokens, protocol uses shares
**Solution:**

- Always display token amounts to users
- Show share appreciation as "rewards earned"
- Provide share price history charts
- Abstract share mechanics in simple language

### Epoch Timing

**Challenge:** Delayed processing vs immediate expectations
**Solution:**

- Clear countdown timers
- "Pending" vs "Active" status indicators
- Explain predictable timing benefits
- Show epoch transition history

### Two-Step Withdrawal

**Challenge:** Complex process with waiting periods
**Solution:**

- Visual progress timeline
- Clear status indicators
- Automatic unlock notifications
- Explain security benefits of locking period

### Storage Fund Transparency

**Challenge:** 20% allocation not immediately obvious
**Solution:**

- Clear breakdown in staking flow
- Explain infrastructure contribution
- Show refund calculation
- Highlight network sustainability benefits

---

## Technical Data Requirements

### Real-Time Data Needs

- Current epoch information and countdown
- Operator pool statistics and performance
- Share prices and historical data
- Withdrawal status and unlock timing

### Calculated Metrics

- Token equivalent of user's shares
- Estimated rewards and APR
- Storage fund contributions and refunds
- Withdrawal amounts and timing

### Historical Data

- Epoch transition history
- Share price evolution
- Operator performance metrics
- User transaction history

---

_These protocol insights directly inform our UX design decisions and help create accurate user expectations._
