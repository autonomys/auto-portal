# Visual Mockups - Staking Application

**Version:** 0.1 (Initial)  
**Last Updated:** 2024-01-15  
**Status:** Phase 2 - Design & Architecture

## Interactive Previews

📱 **[Dashboard Preview](./mockups/dashboard-preview.html)** - Working HTML mockup with official Autonomys branding and interactive elements

> **Note**: The preview files are located in the `mockups/` folder along with official brand assets (logos, icons) downloaded from the [Autonomys Brand Kit](https://www.autonomys.xyz/brand-kit).

---

## 1. Dashboard Screen

### 1.1 Layout Structure

```html
<div class="container">
  <!-- Header -->
  <header
    class="flex justify-between items-center py-6 border-b border-neutral-200"
  >
    <div class="flex items-center space-x-3">
      <img src="autonomys-logo.svg" alt="Autonomys" class="h-8 w-auto" />
      <h1 class="text-xl font-semibold text-neutral-900">Staking</h1>
    </div>
    <button class="btn-primary">Connect Wallet</button>
  </header>

  <!-- Portfolio Overview -->
  <section class="py-8">
    <h2 class="text-2xl font-bold text-neutral-900 mb-6">Portfolio Overview</h2>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <!-- Position Value Card -->
      <div class="metric-card">
        <div class="metric-card-value">1,263.89 AI3</div>
        <div class="metric-card-label">Position Value</div>
        <div class="text-xs text-neutral-500 mt-1">Current worth</div>
      </div>

      <!-- Total Earned Card -->
      <div class="metric-card">
        <div class="metric-card-value">+63.89 AI3</div>
        <div class="metric-card-label">Total Earned</div>
        <div class="metric-card-change positive">+5.3% gain</div>
      </div>

      <!-- Available Balance Card -->
      <div class="metric-card">
        <div class="metric-card-value">500.00 AI3</div>
        <div class="metric-card-label">Available Balance</div>
        <div class="text-xs text-neutral-500 mt-1">Ready to stake</div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex gap-4 mb-8">
      <button class="btn-primary btn-large">Add More Stake</button>
      <button class="btn-secondary btn-large">Withdraw</button>
    </div>
  </section>

  <!-- Active Positions -->
  <section class="py-8">
    <h3 class="text-xl font-semibold text-neutral-900 mb-6">
      Active Positions
    </h3>

    <div class="table-container">
      <table class="table">
        <thead>
          <tr>
            <th>Operator Name</th>
            <th>Position Value</th>
            <th>Total Earned</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <div class="flex items-center space-x-3">
                <div
                  class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center"
                >
                  <span class="text-primary-600 font-medium text-sm">G</span>
                </div>
                <span class="font-medium text-neutral-900"
                  >Gemini-3h-Farmer-1</span
                >
              </div>
            </td>
            <td class="font-mono text-neutral-900">758.2 AI3</td>
            <td class="font-mono text-success-600">+8.2 AI3</td>
            <td><span class="badge success">Active</span></td>
            <td>
              <button class="text-neutral-500 hover:text-neutral-700">
                <svg class="w-5 h-5"><!-- More options icon --></svg>
              </button>
            </td>
          </tr>
          <tr>
            <td>
              <div class="flex items-center space-x-3">
                <div
                  class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center"
                >
                  <span class="text-primary-600 font-medium text-sm">A</span>
                </div>
                <span class="font-medium text-neutral-900"
                  >Auto-Domain-Op-2</span
                >
              </div>
            </td>
            <td class="font-mono text-neutral-900">505.7 AI3</td>
            <td class="font-mono text-success-600">+5.7 AI3</td>
            <td><span class="badge success">Active</span></td>
            <td>
              <button class="text-neutral-500 hover:text-neutral-700">
                <svg class="w-5 h-5"><!-- More options icon --></svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

  <!-- Recent Activity -->
  <section class="py-8">
    <h3 class="text-xl font-semibold text-neutral-900 mb-6">Recent Activity</h3>

    <div class="space-y-4">
      <div class="flex items-center space-x-4 p-4 bg-neutral-50 rounded-lg">
        <div
          class="w-10 h-10 bg-success-100 rounded-full flex items-center justify-center"
        >
          <svg class="w-5 h-5 text-success-600"><!-- Plus icon --></svg>
        </div>
        <div class="flex-1">
          <p class="text-sm font-medium text-neutral-900">
            Added 500 AI3 stake to Auto-Domain-Op-2
          </p>
          <p class="text-xs text-neutral-500">2 hours ago</p>
        </div>
      </div>

      <div class="flex items-center space-x-4 p-4 bg-neutral-50 rounded-lg">
        <div
          class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center"
        >
          <svg class="w-5 h-5 text-primary-600"><!-- Trend up icon --></svg>
        </div>
        <div class="flex-1">
          <p class="text-sm font-medium text-neutral-900">
            Position value increased by 2.1 AI3
          </p>
          <p class="text-xs text-neutral-500">1 day ago</p>
        </div>
      </div>
    </div>
  </section>
</div>
```

### 1.2 Visual Specifications

#### Header

- **Background**: `var(--color-neutral-0)` (white)
- **Border**: `1px solid var(--color-neutral-200)`
- **Logo**: Autonomys brand mark + "Staking" wordmark
- **Connect Button**: Primary button style with hover elevation

#### Metric Cards

- **Background**: `var(--color-neutral-0)` with `var(--shadow-sm)`
- **Border**: `1px solid var(--color-neutral-200)`
- **Border Radius**: `var(--radius-lg)` (8px)
- **Padding**: `var(--space-6)` (24px)
- **Value Typography**: `var(--text-3xl)` `var(--font-bold)` in `var(--color-neutral-900)`
- **Label Typography**: `var(--text-sm)` `var(--font-medium)` in `var(--color-neutral-600)`

#### Color Usage

- **Positive Values**: `var(--color-success-600)` (#16a34a)
- **Negative Values**: `var(--color-error-600)` (#dc2626)
- **Neutral Values**: `var(--color-neutral-600)` (#525252)
- **Monospace Numbers**: `var(--font-mono)` for AI3 amounts

---

## 2. Operator Discovery Screen

### 2.1 Layout Structure

```html
<div class="container">
  <!-- Header with Back Navigation -->
  <header class="flex items-center py-6 border-b border-neutral-200">
    <button class="btn-secondary mr-4">
      <svg class="w-4 h-4 mr-2"><!-- Arrow left icon --></svg>
      Back
    </button>
    <h1 class="text-xl font-semibold text-neutral-900">Choose Operator</h1>
  </header>

  <!-- Filters and Search -->
  <section class="py-6">
    <div
      class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
    >
      <div class="flex gap-4">
        <!-- Domain Filter -->
        <select class="input-base min-w-[160px]">
          <option>All Domains</option>
          <option>Auto EVM</option>
          <option>Auto Consensus</option>
        </select>

        <!-- Sort Filter -->
        <select class="input-base min-w-[120px]">
          <option>Sort: APY</option>
          <option>Sort: Total Staked</option>
          <option>Sort: Uptime</option>
        </select>
      </div>

      <!-- Search -->
      <div class="relative">
        <input
          type="text"
          placeholder="Search operators..."
          class="input-base pl-10 min-w-[240px]"
        />
        <svg
          class="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400"
        >
          <!-- Search icon -->
        </svg>
      </div>
    </div>
  </section>

  <!-- Operator Cards -->
  <section class="py-6">
    <div class="space-y-4">
      <!-- Operator Card 1 -->
      <div class="card hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div
              class="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center"
            >
              <span class="text-primary-600 font-semibold text-lg">G</span>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-neutral-900">
                Gemini-3h-Farmer-1
              </h3>
              <p class="text-sm text-neutral-600">Domain: Auto EVM</p>
            </div>
          </div>
          <div class="flex gap-3">
            <button class="btn-secondary">Details</button>
            <button class="btn-primary">Stake</button>
          </div>
        </div>

        <div
          class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-neutral-100"
        >
          <div>
            <p class="text-xs text-neutral-500 uppercase tracking-wide">APY</p>
            <p class="text-lg font-semibold text-success-600">18.5%</p>
          </div>
          <div>
            <p class="text-xs text-neutral-500 uppercase tracking-wide">Tax</p>
            <p class="text-lg font-semibold text-neutral-900">5%</p>
          </div>
          <div>
            <p class="text-xs text-neutral-500 uppercase tracking-wide">
              Total Staked
            </p>
            <p class="text-lg font-semibold text-neutral-900 font-mono">
              12,450 AI3
            </p>
          </div>
          <div>
            <p class="text-xs text-neutral-500 uppercase tracking-wide">
              Uptime
            </p>
            <p class="text-lg font-semibold text-success-600">99.2%</p>
          </div>
        </div>

        <div
          class="flex items-center justify-between mt-4 pt-4 border-t border-neutral-100"
        >
          <p class="text-sm text-neutral-600">
            <span class="font-medium">23 nominators</span> • Min stake:
            <span class="font-mono">10 AI3</span>
          </p>
          <div class="flex items-center space-x-2">
            <div class="w-2 h-2 bg-success-500 rounded-full"></div>
            <span class="text-sm font-medium text-success-600">Active</span>
          </div>
        </div>
      </div>

      <!-- Operator Card 2 -->
      <div class="card hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div
              class="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center"
            >
              <span class="text-primary-600 font-semibold text-lg">A</span>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-neutral-900">
                Auto-Domain-Op-2
              </h3>
              <p class="text-sm text-neutral-600">Domain: Auto EVM</p>
            </div>
          </div>
          <div class="flex gap-3">
            <button class="btn-secondary">Details</button>
            <button class="btn-primary">Stake</button>
          </div>
        </div>

        <div
          class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-neutral-100"
        >
          <div>
            <p class="text-xs text-neutral-500 uppercase tracking-wide">APY</p>
            <p class="text-lg font-semibold text-success-600">17.8%</p>
          </div>
          <div>
            <p class="text-xs text-neutral-500 uppercase tracking-wide">Tax</p>
            <p class="text-lg font-semibold text-neutral-900">8%</p>
          </div>
          <div>
            <p class="text-xs text-neutral-500 uppercase tracking-wide">
              Total Staked
            </p>
            <p class="text-lg font-semibold text-neutral-900 font-mono">
              8,920 AI3
            </p>
          </div>
          <div>
            <p class="text-xs text-neutral-500 uppercase tracking-wide">
              Uptime
            </p>
            <p class="text-lg font-semibold text-success-600">98.7%</p>
          </div>
        </div>

        <div
          class="flex items-center justify-between mt-4 pt-4 border-t border-neutral-100"
        >
          <p class="text-sm text-neutral-600">
            <span class="font-medium">15 nominators</span> • Min stake:
            <span class="font-mono">50 AI3</span>
          </p>
          <div class="flex items-center space-x-2">
            <div class="w-2 h-2 bg-success-500 rounded-full"></div>
            <span class="text-sm font-medium text-success-600">Active</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</div>
```

### 2.2 Visual Specifications

#### Operator Cards

- **Layout**: Horizontal card with avatar, content, and actions
- **Avatar**: Circular background with operator initial
- **Stats Grid**: 4-column grid on desktop, 2-column on mobile
- **Status Indicator**: Colored dot + text for active/inactive state
- **Hover Effect**: Subtle shadow elevation increase

#### Typography Hierarchy

- **Operator Name**: `var(--text-lg)` `var(--font-semibold)`
- **Domain**: `var(--text-sm)` `var(--color-neutral-600)`
- **Stats Labels**: `var(--text-xs)` uppercase with letter spacing
- **Stats Values**: `var(--text-lg)` `var(--font-semibold)`

---

## 3. Staking Flow Screen

### 3.1 Layout Structure

```html
<div class="container max-w-2xl">
  <!-- Header -->
  <header class="flex items-center py-6 border-b border-neutral-200">
    <button class="btn-secondary mr-4">
      <svg class="w-4 h-4 mr-2"><!-- Arrow left icon --></svg>
      Back
    </button>
    <h1 class="text-xl font-semibold text-neutral-900">
      Stake to Gemini-3h-Farmer-1
    </h1>
  </header>

  <!-- Operator Summary -->
  <section class="py-8">
    <div class="card mb-8">
      <div class="flex items-center space-x-4 mb-6">
        <div
          class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center"
        >
          <span class="text-primary-600 font-bold text-xl">G</span>
        </div>
        <div>
          <h2 class="text-xl font-semibold text-neutral-900">
            Gemini-3h-Farmer-1
          </h2>
          <p class="text-neutral-600">Domain: Auto EVM</p>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-6">
        <div class="text-center">
          <p class="text-2xl font-bold text-success-600">18.5%</p>
          <p class="text-sm text-neutral-600">APY</p>
        </div>
        <div class="text-center">
          <p class="text-2xl font-bold text-neutral-900">5%</p>
          <p class="text-sm text-neutral-600">Tax</p>
        </div>
        <div class="text-center">
          <p class="text-2xl font-bold text-neutral-900">0%</p>
          <p class="text-sm text-neutral-600">Your Share</p>
        </div>
      </div>

      <div class="mt-4 pt-4 border-t border-neutral-100">
        <p class="text-sm text-neutral-600">
          Pool Size: <span class="font-mono font-medium">12,450 AI3</span>
        </p>
      </div>
    </div>
  </section>

  <!-- Stake Form -->
  <section class="py-8">
    <div class="card">
      <h3 class="text-lg font-semibold text-neutral-900 mb-6">Stake Amount</h3>

      <!-- Available Balance -->
      <div class="mb-6 p-4 bg-neutral-50 rounded-lg">
        <p class="text-sm text-neutral-600">Available Balance</p>
        <p class="text-xl font-bold text-neutral-900 font-mono">500.00 AI3</p>
      </div>

      <!-- Amount Input -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-neutral-700 mb-2">
          Amount to Stake
        </label>
        <div class="input-amount-wrapper">
          <input
            type="text"
            value="100"
            class="input-base input-amount"
            placeholder="0.00"
          />
          <span class="input-amount-currency">AI3</span>
        </div>
        <button class="btn-secondary btn-sm mt-2">MAX</button>
      </div>

      <!-- Transaction Breakdown -->
      <div class="mb-8">
        <h4 class="text-md font-semibold text-neutral-900 mb-4">
          Transaction Breakdown
        </h4>
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-sm text-neutral-600">Stake Amount</span>
            <span class="font-mono font-medium text-neutral-900"
              >100.00 AI3</span
            >
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-neutral-600">Storage Fund (20%)</span>
            <span class="font-mono font-medium text-neutral-900"
              >20.00 AI3</span
            >
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-neutral-600">Transaction Fee</span>
            <span class="font-mono font-medium text-neutral-900">0.01 AI3</span>
          </div>
          <hr class="border-neutral-200" />
          <div class="flex justify-between items-center">
            <span class="text-sm font-semibold text-neutral-900"
              >Total Required</span
            >
            <span class="font-mono font-bold text-neutral-900 text-lg"
              >120.01 AI3</span
            >
          </div>
        </div>
      </div>

      <!-- Estimated Rewards -->
      <div class="mb-8 p-4 bg-success-50 rounded-lg border border-success-200">
        <p class="text-sm text-success-700">Estimated Annual Rewards</p>
        <p class="text-xl font-bold text-success-700 font-mono">~18.5 AI3</p>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-4">
        <button class="btn-secondary flex-1">Cancel</button>
        <button class="btn-primary flex-1">Stake Tokens</button>
      </div>
    </div>
  </section>
</div>
```

### 3.1 Visual Specifications

#### Form Layout

- **Container**: Max width `672px` (2xl) for optimal form readability
- **Card Padding**: `var(--space-6)` (24px) for comfortable spacing
- **Input Focus**: Primary color border with subtle shadow

#### Amount Input Styling

- **Font**: Monospace for number alignment
- **Size**: `var(--text-lg)` for better visibility
- **Alignment**: Right-aligned with currency suffix
- **MAX Button**: Small secondary button positioned below input

#### Transaction Breakdown

- **Layout**: Flex justify-between for label/value pairs
- **Typography**: Small labels, medium values, bold total
- **Separator**: Subtle border before total calculation

---

## 4. Component Library Integration

### 4.1 shadcn/ui Customization

```typescript
// tailwind.config.js - Design token integration
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0f9ff",
          500: "#0ea5e9",
          600: "#0284c7",
          // ... full scale
        },
        success: {
          50: "#f0fdf4",
          500: "#22c55e",
          600: "#16a34a",
          // ... full scale
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Consolas", "monospace"],
      },
    },
  },
};
```

### 4.2 Custom Component Variants

```typescript
// Button variants for shadcn/ui
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary-500 text-white hover:bg-primary-600",
        secondary: "bg-white border border-neutral-300 hover:bg-neutral-50",
        success: "bg-success-500 text-white hover:bg-success-600",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        default: "h-10 px-6",
        lg: "h-12 px-8 text-base",
      },
    },
  }
);
```

---

## 5. Responsive Behavior

### 5.1 Mobile Adaptations

#### Dashboard Mobile

- **Metric Cards**: Single column stack with full width
- **Table**: Convert to card layout with stacked information
- **Actions**: Full-width buttons with adequate touch targets

#### Operator Discovery Mobile

- **Filters**: Stack vertically with full-width selects
- **Cards**: Simplified layout with key stats only
- **Actions**: Larger buttons for touch interaction

#### Staking Flow Mobile

- **Form**: Single column with larger input fields
- **Breakdown**: Maintain table layout but with larger text
- **Buttons**: Full-width stacked buttons

### 5.2 Breakpoint Behavior

```css
/* Mobile: < 768px */
.metric-cards {
  grid-template-columns: 1fr;
}
.operator-filters {
  flex-direction: column;
}
.form-actions {
  flex-direction: column;
}

/* Tablet: 768px - 1024px */
.metric-cards {
  grid-template-columns: repeat(2, 1fr);
}
.operator-stats {
  grid-template-columns: repeat(2, 1fr);
}

/* Desktop: > 1024px */
.metric-cards {
  grid-template-columns: repeat(3, 1fr);
}
.operator-stats {
  grid-template-columns: repeat(4, 1fr);
}
```

---

## 6. Next Steps

### 6.1 Interactive Prototyping

- Create clickable prototypes using Figma or similar
- Test user flows with realistic data
- Validate assumptions about information hierarchy

### 6.2 Component Development

- Build actual React components using these specifications
- Create Storybook stories for each component variant
- Implement responsive behavior and accessibility features

### 6.3 User Testing

- Test with target personas (Farmer Frank, Token Holder Tina)
- Validate operator selection and staking flow
- Gather feedback on visual hierarchy and information clarity

---

_These visual mockups provide the foundation for implementation. All specifications should be validated through actual development and user testing._
