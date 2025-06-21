# Design System - Staking Application

**Version:** 0.1 (Initial)  
**Last Updated:** 2024-01-15  
**Status:** Phase 2 - Design & Architecture

---

## 1. Design Principles

### 1.1 Core Values

- **Trust & Security**: Clear visual hierarchy, transparent information display
- **Simplicity**: Clean, uncluttered interfaces that reduce cognitive load
- **Accessibility**: WCAG AA compliant, keyboard navigable, screen reader friendly
- **Performance**: Fast loading, smooth interactions, responsive design

### 1.2 Visual Principles

- **Clarity over Cleverness**: Information should be immediately understandable
- **Consistency**: Predictable patterns across all interactions
- **Hierarchy**: Important information stands out, secondary info supports
- **Feedback**: Clear indication of system status and user actions

---

## 2. Brand Guidelines

### 2.1 Official Brand Resources

**Source**: [Autonomys Brand Kit](https://www.autonomys.xyz/brand-kit)

#### Logo Usage

- **Full Logo**: Use when space allows and brand needs establishment
- **Icon Only**: Use when Autonomys brand is well-established on page
- **Available Formats**: SVG (vector), PNG (raster)
- **Variants**: White logo for dark backgrounds, dark logo for light backgrounds

#### Brand Colors (Official)

- **Primary**: #5870B3 (Brand Primary)
- **Secondary**: #1D2C57 (Brand Secondary)
- **Accent**: #33EDA6 (Icon/Highlight color)
- **Success**: #75DF22 (Success states)
- **Error**: #FC5146 (Error states)
- **Warning**: #FFDF35 (Alert states)

#### Typography (Official)

- **Headings**: Roboto Serif (brand serif font)
- **Body Text**: Libre Franklin (brand sans-serif font)
- **Monospace**: JetBrains Mono (for technical content)

#### Background Colors (Official)

- **Light**: #FFFFFF (Primary light background)
- **Light Gray**: #D1D8EB (Secondary light background)
- **Dark**: #1A1927 (Primary dark background)
- **Dark Gray**: #201F30 (Secondary dark background)
- **Silver**: #292A41 (Tertiary background)

---

## 3. Design Tokens

### 3.1 Color Palette

#### Primary Colors

```css
/* Brand & Primary Actions - From Autonomys Brand Kit */
--color-brand-primary: #5870b3; /* Official brand primary */
--color-brand-secondary: #1d2c57; /* Official brand secondary */
--color-accent: #33eda6; /* Official icon/accent color */

/* Extended primary palette based on brand colors */
--color-primary-50: #f4f6fb;
--color-primary-100: #e8ecf6;
--color-primary-200: #d6ddee;
--color-primary-300: #bbc6e0;
--color-primary-400: #9ca9cf;
--color-primary-500: #5870b3; /* Primary brand */
--color-primary-600: #4a5f9d;
--color-primary-700: #3d4e82;
--color-primary-800: #1d2c57; /* Secondary brand */
--color-primary-900: #1a2649;
```

#### Semantic Colors

```css
/* Success - Positive gains, completed actions (Official Autonomys) */
--color-success-50: #f0fef7;
--color-success-100: #dcfce7;
--color-success-200: #bbf7d0;
--color-success-300: #86efac;
--color-success-400: #4ade80;
--color-success-500: #75df22; /* Official Autonomys success color */
--color-success-600: #65c91c;
--color-success-700: #4d9a15;

/* Warning - Pending states, cautions (Official Autonomys) */
--color-warning-50: #fffef0;
--color-warning-100: #fffbdc;
--color-warning-200: #fff7bb;
--color-warning-300: #fff089;
--color-warning-400: #ffe455;
--color-warning-500: #ffdf35; /* Official Autonomys alert color */
--color-warning-600: #e6c730;
--color-warning-700: #cc9f2a;

/* Error - Losses, failed actions (Official Autonomys) */
--color-error-50: #fef4f3;
--color-error-100: #fee7e5;
--color-error-200: #fdd4d0;
--color-error-300: #fbb5ae;
--color-error-400: #f78a7f;
--color-error-500: #fc5146; /* Official Autonomys error color */
--color-error-600: #e3493f;
--color-error-700: #c03d35;

/* Accent - Special highlights (Official Autonomys) */
--color-accent-50: #f0fef9;
--color-accent-100: #ccfbef;
--color-accent-200: #99f6e0;
--color-accent-300: #5eead4;
--color-accent-400: #33eda6; /* Official Autonomys icon color */
--color-accent-500: #20d49a;
--color-accent-600: #16a085;
```

#### Neutral Colors

```css
/* Text, backgrounds, borders */
--color-neutral-0: #ffffff;
--color-neutral-50: #fafafa;
--color-neutral-100: #f5f5f5;
--color-neutral-200: #e5e5e5;
--color-neutral-300: #d4d4d4;
--color-neutral-400: #a3a3a3;
--color-neutral-500: #737373;
--color-neutral-600: #525252; /* Body text */
--color-neutral-700: #404040; /* Headings */
--color-neutral-800: #262626;
--color-neutral-900: #171717;
--color-neutral-950: #0a0a0a;
```

### 2.2 Typography

#### Font Families

```css
/* Primary fonts from Autonomys Brand Kit */
--font-serif: 'Roboto Serif', Georgia, serif; /* Official brand serif */
--font-sans: 'Libre Franklin', Inter, system-ui, sans-serif; /* Official brand sans */
--font-mono: 'JetBrains Mono', 'Fira Code', Consolas, monospace;

/* Font usage guidelines */
--font-heading: var(--font-serif); /* Use for main headings and brand elements */
--font-body: var(--font-sans); /* Use for body text and UI elements */
--font-ui: var(--font-sans); /* Use for buttons, labels, and interface */
```

#### Font Scales

```css
/* Headings */
--text-xs: 0.75rem; /* 12px */
--text-sm: 0.875rem; /* 14px */
--text-base: 1rem; /* 16px */
--text-lg: 1.125rem; /* 18px */
--text-xl: 1.25rem; /* 20px */
--text-2xl: 1.5rem; /* 24px */
--text-3xl: 1.875rem; /* 30px */
--text-4xl: 2.25rem; /* 36px */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

/* Line Heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
```

### 2.3 Spacing Scale

```css
--space-0: 0;
--space-1: 0.25rem; /* 4px */
--space-2: 0.5rem; /* 8px */
--space-3: 0.75rem; /* 12px */
--space-4: 1rem; /* 16px */
--space-5: 1.25rem; /* 20px */
--space-6: 1.5rem; /* 24px */
--space-8: 2rem; /* 32px */
--space-10: 2.5rem; /* 40px */
--space-12: 3rem; /* 48px */
--space-16: 4rem; /* 64px */
--space-20: 5rem; /* 80px */
--space-24: 6rem; /* 96px */
```

### 2.4 Border Radius

```css
--radius-none: 0;
--radius-sm: 0.125rem; /* 2px */
--radius-base: 0.25rem; /* 4px */
--radius-md: 0.375rem; /* 6px */
--radius-lg: 0.5rem; /* 8px */
--radius-xl: 0.75rem; /* 12px */
--radius-2xl: 1rem; /* 16px */
--radius-full: 9999px;
```

### 2.5 Shadows

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-base: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
```

---

## 3. Component Specifications

### 3.1 Buttons

#### Primary Button

```css
.btn-primary {
  background: var(--color-primary-500);
  color: var(--color-neutral-0);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  font-weight: var(--font-medium);
  font-size: var(--text-sm);
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: var(--color-primary-600);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-primary:active {
  background: var(--color-primary-700);
  transform: translateY(0);
}

.btn-primary:disabled {
  background: var(--color-neutral-300);
  color: var(--color-neutral-500);
  cursor: not-allowed;
}
```

#### Secondary Button

```css
.btn-secondary {
  background: var(--color-neutral-0);
  color: var(--color-neutral-700);
  border: 1px solid var(--color-neutral-300);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  font-weight: var(--font-medium);
  font-size: var(--text-sm);
}

.btn-secondary:hover {
  border-color: var(--color-neutral-400);
  box-shadow: var(--shadow-sm);
}
```

#### Sizes

- **Small**: `padding: var(--space-2) var(--space-4); font-size: var(--text-xs);`
- **Medium**: `padding: var(--space-3) var(--space-6); font-size: var(--text-sm);` (default)
- **Large**: `padding: var(--space-4) var(--space-8); font-size: var(--text-base);`

### 3.2 Form Inputs

#### Text Input

```css
.input-base {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-neutral-300);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  background: var(--color-neutral-0);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.input-base:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px rgb(14 165 233 / 0.1);
}

.input-base:error {
  border-color: var(--color-error-500);
}

.input-base:error:focus {
  box-shadow: 0 0 0 3px rgb(239 68 68 / 0.1);
}
```

#### Amount Input (Special)

```css
.input-amount {
  font-family: var(--font-mono);
  font-size: var(--text-lg);
  text-align: right;
  padding-right: var(--space-16); /* Space for currency label */
}

.input-amount-wrapper {
  position: relative;
}

.input-amount-currency {
  position: absolute;
  right: var(--space-4);
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-neutral-500);
  font-weight: var(--font-medium);
}
```

### 3.3 Cards

#### Base Card

```css
.card {
  background: var(--color-neutral-0);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
}

.card:hover {
  box-shadow: var(--shadow-md);
  transition: box-shadow 0.2s ease;
}
```

#### Metric Card

```css
.metric-card {
  background: var(--color-neutral-0);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  text-align: center;
}

.metric-card-value {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--color-neutral-900);
  margin-bottom: var(--space-2);
}

.metric-card-label {
  font-size: var(--text-sm);
  color: var(--color-neutral-600);
  font-weight: var(--font-medium);
}

.metric-card-change {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  margin-top: var(--space-1);
}

.metric-card-change.positive {
  color: var(--color-success-600);
}

.metric-card-change.negative {
  color: var(--color-error-600);
}
```

### 3.4 Tables

#### Base Table

```css
.table {
  width: 100%;
  border-collapse: collapse;
  background: var(--color-neutral-0);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.table th {
  background: var(--color-neutral-50);
  padding: var(--space-4) var(--space-6);
  text-align: left;
  font-weight: var(--font-semibold);
  color: var(--color-neutral-700);
  font-size: var(--text-sm);
  border-bottom: 1px solid var(--color-neutral-200);
}

.table td {
  padding: var(--space-4) var(--space-6);
  border-bottom: 1px solid var(--color-neutral-100);
  font-size: var(--text-sm);
}

.table tr:hover {
  background: var(--color-neutral-50);
}

.table tr:last-child td {
  border-bottom: none;
}
```

### 3.5 Status Indicators

#### Badge Component

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.badge.success {
  background: var(--color-success-100);
  color: var(--color-success-700);
}

.badge.warning {
  background: var(--color-warning-100);
  color: var(--color-warning-700);
}

.badge.error {
  background: var(--color-error-100);
  color: var(--color-error-700);
}

.badge.neutral {
  background: var(--color-neutral-100);
  color: var(--color-neutral-700);
}
```

---

## 4. Layout System

### 4.1 Grid System

```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-6);
}

.grid {
  display: grid;
  gap: var(--space-6);
}

.grid-cols-1 {
  grid-template-columns: repeat(1, minmax(0, 1fr));
}
.grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.grid-cols-3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.grid-cols-4 {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}
```

### 4.2 Flexbox Utilities

```css
.flex {
  display: flex;
}
.flex-col {
  flex-direction: column;
}
.flex-row {
  flex-direction: row;
}

.justify-start {
  justify-content: flex-start;
}
.justify-center {
  justify-content: center;
}
.justify-between {
  justify-content: space-between;
}
.justify-end {
  justify-content: flex-end;
}

.items-start {
  align-items: flex-start;
}
.items-center {
  align-items: center;
}
.items-end {
  align-items: flex-end;
}
```

---

## 5. Responsive Design

### 5.1 Breakpoints

```css
/* Mobile First Approach */
@media (min-width: 640px) {
  /* sm */
}
@media (min-width: 768px) {
  /* md */
}
@media (min-width: 1024px) {
  /* lg */
}
@media (min-width: 1280px) {
  /* xl */
}
```

### 5.2 Responsive Patterns

#### Metric Cards

- **Mobile**: Single column stack
- **Tablet**: 2 columns
- **Desktop**: 3-4 columns in a row

#### Data Tables

- **Mobile**: Convert to card layout or horizontal scroll
- **Tablet**: Simplified columns
- **Desktop**: Full table with all columns

#### Forms

- **Mobile**: Full width inputs, larger touch targets
- **Desktop**: Optimized for mouse interaction

---

## 6. Animation & Transitions

### 6.1 Timing Functions

```css
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

### 6.2 Common Transitions

```css
.transition-base {
  transition: all 0.2s var(--ease-out);
}

.transition-colors {
  transition:
    color 0.2s var(--ease-out),
    background-color 0.2s var(--ease-out),
    border-color 0.2s var(--ease-out);
}

.transition-transform {
  transition: transform 0.2s var(--ease-out);
}
```

### 6.3 Hover Effects

- **Buttons**: Slight upward movement (`translateY(-1px)`) + shadow increase
- **Cards**: Shadow elevation increase
- **Table Rows**: Background color change
- **Links**: Color change with smooth transition

---

## 7. Accessibility Standards

### 7.1 Color Contrast

- **Normal Text**: 4.5:1 minimum contrast ratio
- **Large Text**: 3:1 minimum contrast ratio
- **Interactive Elements**: 3:1 minimum for borders/icons

### 7.2 Focus Management

```css
.focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

/* Hide focus for mouse users, show for keyboard users */
.focus-visible:not(.focus-visible) {
  outline: none;
}
```

### 7.3 Screen Reader Support

- Semantic HTML elements
- ARIA labels for complex interactions
- Skip links for keyboard navigation
- Proper heading hierarchy

---

## 8. Component Usage Guidelines

### 8.1 AI3 Token Display

- **Large Amounts**: Use monospace font for better alignment
- **Precision**: Show 2-4 decimal places based on context
- **Formatting**: Add thousand separators for readability
- **Currency Symbol**: Always include "AI3" suffix

### 8.2 Percentage Display

- **Gains**: Green color (`var(--color-success-600)`)
- **Losses**: Red color (`var(--color-error-600)`)
- **Neutral**: Gray color (`var(--color-neutral-600)`)
- **Precision**: 1-2 decimal places

### 8.3 Status Communication

- **Loading States**: Skeleton loaders, not spinners
- **Empty States**: Helpful messaging with clear next steps
- **Error States**: Clear error messages with retry options
- **Success States**: Confirmation with next action guidance

---

## 9. Implementation Notes

### 9.1 CSS Custom Properties

All design tokens should be implemented as CSS custom properties to enable:

- Easy theming
- Consistent values across components
- Runtime customization if needed

### 9.2 Component Library Integration

This design system is designed to work with:

- **shadcn/ui**: Base components that can be styled with our tokens
- **Tailwind CSS**: Utility classes for rapid development
- **Storybook**: Component documentation and testing

### 9.3 Dark Mode Preparation

While not immediately required, the token structure supports dark mode:

- Semantic color naming
- CSS custom properties for easy switching
- Neutral color scale designed for both themes

---

_This design system will evolve as we build and test components. All specifications should be validated through actual implementation and user testing._
