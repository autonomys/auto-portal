# Staking Application Wireframes

**Version:** 0.2 (Markdown Format)  
**Last Updated:** 2024-01-15  
**Status:** Phase 2 - Design & Architecture

---

## 1. Design Principles

### 1.1 Core UX Principles

- **Trust First**: Clear security indicators, transparent fee breakdowns
- **Progressive Disclosure**: Show essential info first, details on demand
- **Efficiency**: Minimize clicks for core actions (stake, withdraw)
- **Clarity**: Use Autonomys terminology consistently

### 1.2 Visual Hierarchy

- **Primary Actions**: Prominent CTAs (Stake, Withdraw, Connect Wallet)
- **Critical Info**: APY, balances, status indicators
- **Secondary Info**: Historical data, detailed breakdowns
- **Tertiary Info**: Help text, advanced settings

---

## 2. Core Screen Wireframes

### 2.1 Landing/Dashboard Screen

#### Header

- **Left**: Autonomys Staking Logo
- **Right**: Connect Wallet Button

#### Portfolio Overview Cards

| Position Value   | Total Earned   | Available Balance |
| ---------------- | -------------- | ----------------- |
| **1,263.89 AI3** | **+63.89 AI3** | **500.00 AI3**    |
| Current worth    | +5.3% gain     | Ready to stake    |

#### Active Positions Table

| Operator Name      | Position Value | Total Earned | Status | Actions |
| ------------------ | -------------- | ------------ | ------ | ------- |
| Gemini-3h-Farmer-1 | 758.2 AI3      | +8.2 AI3     | Active | •••     |
| Auto-Domain-Op-2   | 505.7 AI3      | +5.7 AI3     | Active | •••     |

#### Primary Actions

- **[Add More Stake]** - Primary button
- **[Withdraw]** - Secondary button

#### Recent Activity

- Added 500 AI3 stake to Auto-Domain-Op-2 - 2 hours ago
- Position value increased by 2.1 AI3 - 1 day ago

---

### 2.2 Operator Discovery Screen

#### Header

- **Left**: ← Back button
- **Center**: "Choose Operator" title

#### Filters & Search

- **Domain Filter**: All Domains ▼
- **Sort Options**: Sort: APY ▼
- **Search**: 🔍 Search operators...

#### Operator Cards

**Gemini-3h-Farmer-1**

- **APY**: 18.5% | **Tax**: 5% | **Min Stake**: 10 AI3
- **Pool Stats**: Total Staked: 12,450 AI3 | Nominators: 23
- **Performance**: Uptime: 99.2% | Domain: Auto EVM
- **Actions**: [Stake] [Details]

**Auto-Domain-Op-2**

- **APY**: 17.8% | **Tax**: 8% | **Min Stake**: 50 AI3
- **Pool Stats**: Total Staked: 8,920 AI3 | Nominators: 15
- **Performance**: Uptime: 98.7% | Domain: Auto EVM
- **Actions**: [Stake] [Details]

**Autonomys-Validator-X**

- **APY**: 16.9% | **Tax**: 10% | **Min Stake**: 25 AI3
- **Pool Stats**: Total Staked: 15,600 AI3 | Nominators: 45
- **Performance**: Uptime: 97.1% | Domain: Auto EVM
- **Actions**: [Stake] [Details]

---

### 2.3 Staking Flow Screen

#### Header

- **Left**: ← Back button
- **Center**: "Stake to Gemini-3h-Farmer-1"

#### Operator Summary

| Operator                  | APY   | Tax | Domain   | Your Share |
| ------------------------- | ----- | --- | -------- | ---------- |
| Gemini-3h-Farmer-1        | 18.5% | 5%  | Auto EVM | 0%         |
| **Pool Size**: 12,450 AI3 |       |     |          |            |

#### Stake Input Form

**Available Balance**: 500.00 AI3

**Amount to Stake**

- Input field: [100] AI3
- [MAX] button

#### Transaction Breakdown

| Item               | Amount         |
| ------------------ | -------------- |
| Stake Amount       | 100.00 AI3     |
| Storage Fund (20%) | 20.00 AI3      |
| Transaction Fee    | 0.01 AI3       |
| **Total Required** | **120.01 AI3** |

**Estimated Annual Rewards**: ~18.5 AI3

#### Actions

- **[Cancel]** - Secondary button
- **[Stake Tokens]** - Primary button

---

### 2.4 Withdrawal Flow Screen

#### Header

- **Left**: ← Back button
- **Center**: "Withdraw from Gemini-3h-Farmer-1"

#### Current Position Summary

| Metric         | Value                   |
| -------------- | ----------------------- |
| Position Value | 758.20 AI3              |
| Total Invested | 750.00 AI3 (cost basis) |
| Total Earned   | +8.20 AI3 (+1.09%)      |

#### Withdrawal Options

**Withdrawal Type**

- ○ Partial Withdrawal
- ● Full Withdrawal

**Amount**: 300.00 AI3

#### Withdrawal Preview

| Item                     | Amount     |
| ------------------------ | ---------- |
| Cost Basis of Withdrawal | 296.83 AI3 |
| Realized Gains           | +3.17 AI3  |

#### After Withdrawal

| Item                 | Amount             |
| -------------------- | ------------------ |
| Remaining Position   | 458.20 AI3         |
| Remaining Cost Basis | 453.17 AI3         |
| Remaining Gains      | +5.03 AI3 (+1.09%) |

#### Process Timeline

⚠️ **Two-Step Process**:

1. **Withdraw**: Request processed at next epoch
2. **Unlock**: Claim after 7-day locking period

**Timeline**: Next epoch ~4 hours, unlock ~7 days

#### Actions

- **[Cancel]** - Secondary button
- **[Request Withdrawal]** - Primary button

---

### 2.5 Portfolio/Positions Screen

#### Header

- **Left**: Autonomys Portfolio Logo
- **Right**: Connect Wallet Button

#### Active Stakes

| Operator           | Position Value | Total Earned | APY   | Actions |
| ------------------ | -------------- | ------------ | ----- | ------- |
| Gemini-3h-Farmer-1 | 758 AI3        | +8.2 AI3     | 18.5% | •••     |
| Auto-Domain-Op-2   | 506 AI3        | +5.7 AI3     | 17.8% | •••     |

#### Pending Withdrawals

| Operator        | Amount  | Status       | Available |
| --------------- | ------- | ------------ | --------- |
| Old-Validator-X | 250 AI3 | Unlock Ready | [Claim]   |
| Test-Op-Y       | 100 AI3 | Pending (3d) | —         |

#### Transaction History

| Date       | Action              | Amount  | Status    |
| ---------- | ------------------- | ------- | --------- |
| 2024-01-15 | Added stake to Op-2 | 500 AI3 | Confirmed |
| 2024-01-14 | Withdrew from Op-X  | 250 AI3 | Unlocked  |
| 2024-01-13 | Added stake to Op-1 | 250 AI3 | Confirmed |
| 2024-01-12 | Claimed withdrawal  | 100 AI3 | Completed |

---

## 3. Component Specifications

### 3.1 Navigation Components

#### Primary Navigation

- **Logo/Brand**: Autonomys Staking (links to dashboard)
- **Main Sections**: Dashboard, Operators, Portfolio
- **User Actions**: Connect/Disconnect Wallet, Account Menu

#### Breadcrumbs

- Used on detail pages and flows
- Format: Dashboard > Operators > Stake to [Operator Name]

### 3.2 Data Display Components

#### Metric Cards

- **Structure**: Value (large), Label (small), Optional trend indicator
- **Variants**: Currency (AI3), Percentage (APY, gains), Status
- **States**: Loading, Error, Success

#### Data Tables

- **Features**: Sortable columns, Row actions, Pagination (if needed)
- **Responsive**: Stack on mobile, horizontal scroll for complex tables
- **Actions**: Inline buttons, Dropdown menus for multiple actions

### 3.3 Form Components

#### Amount Input

- **Features**: Numeric validation, MAX button, Balance display
- **States**: Default, Focus, Error, Disabled
- **Formatting**: Auto-format large numbers, Currency symbol

#### Transaction Preview

- **Structure**: Breakdown table, Total calculation, Fee estimation
- **Features**: Real-time updates, Error states for insufficient funds

### 3.4 Status Components

#### Progress Indicators

- **Withdrawal Status**: Pending → Processing → Unlock Ready → Claimed
- **Transaction Status**: Submitted → Confirmed → Completed
- **Visual**: Progress bar with labeled steps

#### Alert Banners

- **Types**: Info (blue), Warning (yellow), Error (red), Success (green)
- **Features**: Dismissable, Action buttons, Icon indicators

---

## 4. Responsive Design Notes

### 4.1 Breakpoints

- **Desktop**: 1024px+ (Primary target)
- **Tablet**: 768px - 1023px (Secondary)
- **Mobile**: < 768px (Basic support)

### 4.2 Mobile Adaptations

- **Tables**: Convert to card layouts or horizontal scroll
- **Forms**: Full-width inputs, Larger touch targets
- **Navigation**: Collapsible menu, Bottom navigation for key actions

### 4.3 Key Mobile Patterns

- **Dashboard**: Stack metric cards vertically
- **Operator List**: Convert table to card list
- **Staking Flow**: Single column, larger input fields
- **Portfolio**: Tabbed interface for different sections

---

## 5. Accessibility Requirements

### 5.1 WCAG Compliance

- **Level**: AA compliance target
- **Color Contrast**: 4.5:1 minimum for text
- **Focus Management**: Visible focus indicators, Logical tab order
- **Screen Readers**: Proper ARIA labels, Semantic HTML

### 5.2 Keyboard Navigation

- **All Actions**: Accessible via keyboard
- **Modal Dialogs**: Focus trapping, ESC to close
- **Tables**: Arrow key navigation for complex data

### 5.3 Error Handling

- **Form Validation**: Clear error messages, Field-level feedback
- **Network Errors**: Retry mechanisms, Offline indicators
- **User Feedback**: Success confirmations, Loading states

---

## 6. Next Steps

### 6.1 Design System

- Create component library with consistent styling
- Define color palette, typography, spacing scale
- Build reusable UI components in Storybook

### 6.2 Prototyping

- Interactive prototypes for key user flows
- User testing with target personas
- Validate assumptions about operator selection and staking flow

### 6.3 Implementation Planning

- Component development priority
- API integration requirements
- Performance optimization strategy

---

_This wireframe document will evolve as we gather feedback and iterate on the design._
