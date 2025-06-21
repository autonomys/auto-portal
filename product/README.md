# Staking Product Development

This directory contains all product development artifacts for the Autonomys staking application. The goal is to create a user-friendly interface that enables operators and nominators to seamlessly stake on Autonomys domains.

---

## 📋 Project Overview

### Vision

Enable operators and nominators to seamlessly stake on Autonomys domains with a friction-less, transparent experience that matches or exceeds Web2 financial apps.

### Success Metrics

- **Time-to-first-stake**: < 5 minutes from landing to submitted transaction
- **Transaction failure rate**: < 1% (30-day rolling window)
- **User satisfaction (SUS)**: ≥ 80 for operators and nominators at GA
- **Staked supply**: ≥ 30% of circulating tokens within 6 months

---

## 📁 Directory Structure

### Core Documents

- **`rough-description.txt`** - Initial project brief and requirements
- **`kickoff-workshop.md`** - Workshop notes with shared terminology and decisions
- **`staking-prd.md`** - Complete Product Requirements Document with functional specs
- **`wireframes.md`** - Screen layouts and user interface design patterns (markdown format)
- **`technical-architecture.md`** - Component structure, data flow, and implementation plan (functional programming)
- **`technical-specifications.md`** - Detailed calculations, business logic, and implementation decisions
- **`design-system.md`** - Visual design tokens, component specifications, and styling guidelines
- **`visual-mockups.md`** - High-fidelity screen designs with interactive preview links
- **`mockups/`** - Interactive HTML previews and brand assets
  - `dashboard-preview.html` - Working dashboard mockup with official Autonomys branding
  - `autonomys-logo-dark.svg` - Official Autonomys logo (dark version)
  - `autonomys-icon-dark.svg` - Official Autonomys icon (dark version)

### Research Resources

- **`resources/`** - Competitive analysis and protocol insights for reference
  - `polkadot-apps-analysis.md` - Current state pain points
  - `lido-ux-patterns.md` - Best-in-class simplicity patterns
  - `keplr-validator-selection.md` - Validator marketplace UX
  - `protocol-insights.md` - Technical constraints and opportunities

---

## 🎯 Target Users

### Primary Personas

- **Farmer Frank**: Active Autonomys farmers with earned AI3 tokens seeking yield
- **Token Holder Tina**: Exchange purchasers looking for passive income opportunities
- **Operator Oliver**: Domain operators needing simplified registration and nomination UX

### Core User Journeys

1. **Nominator Flow**: Connect → Browse Operators → Stake → Monitor Portfolio
2. **Withdrawal Flow**: Request Withdrawal → Wait for Epoch → Unlock Funds
3. **Portfolio Management**: Track positions, rewards, and transaction history

---

## 🚀 Development Phases

### ✅ Phase 1: Discovery & Requirements (Complete)

- [x] Stakeholder alignment and shared terminology
- [x] Competitive research (Polkadot Apps, Lido, Keplr)
- [x] Protocol deep-dive and constraint analysis
- [x] Complete PRD with functional requirements

### ✅ Phase 2: Design & Architecture (Complete)

- [x] User journey wireframes and screen layouts (markdown format)
- [x] Information architecture and navigation design
- [x] Technical architecture and component planning (functional programming)
- [x] Design system specification with tokens and components
- [x] Visual mockups for key screens with component integration
- [x] Performance and security considerations

### 🔄 Phase 3: Technical Planning (Next)

- [ ] Project initialization with Vite + React + TypeScript
- [ ] Component library setup (shadcn/ui + Tailwind CSS)
- [ ] Design system implementation with CSS custom properties
- [ ] Auto SDK integration and blockchain service layer
- [ ] State management implementation (Zustand stores)
- [ ] Development environment and tooling setup

### 📋 Phase 4: Implementation (Upcoming)

- [ ] Core UI components and layout system
- [ ] Wallet connection and account management
- [ ] Operator discovery and comparison interface
- [ ] Staking flow implementation
- [ ] Portfolio and withdrawal management

### 🧪 Phase 5: Testing & Launch (Future)

- [ ] Unit and integration testing
- [ ] User acceptance testing with target personas
- [ ] Performance optimization and security audit
- [ ] Staging deployment and production launch

---

## 🔍 Key Insights

### Protocol Constraints

- **Two-step withdrawal**: Withdraw request → Unlock after locking period
- **Share-based rewards**: Operators use share pools rather than direct token rewards
- **Storage fund**: 20% of stake allocated to storage fund (refunded on withdrawal)
- **Epoch-based processing**: State changes processed at epoch boundaries

### UX Principles

- **Trust First**: Clear security indicators and transparent fee breakdowns
- **Progressive Disclosure**: Essential info first, details on demand
- **Efficiency**: Minimize clicks for core actions (stake, withdraw)

### Technical Decisions

- **Desktop-first**: Optimized for desktop browsers (mobile-responsive but not priority)
- **React + TypeScript**: Functional programming with strict type safety
- **Auto SDK**: Direct blockchain integration with Polkadot.js fallback
- **Zustand**: Lightweight state management for wallet and staking data (TBD)

---

## 📊 Success Tracking

### MVP Scope

- **Core Nomination Flow**: Browse operators, stake tokens, view portfolio
- **Withdrawal Process**: Two-step withdraw → unlock with clear status tracking
- **Operator Discovery**: Compare APY, tax rates, and operator details
- **Desktop Experience**: Optimized for desktop web browsers

### Post-MVP Features

- **Operator Registration Flow**: UI for domain operators to register
- **Advanced Analytics**: Historical yield charts and performance metrics
- **Batch Operations**: Multi-operator staking and bulk withdrawals
- **Governance Integration**: Voting with staked tokens

---

## 🛠 Next Steps

### Immediate Actions (Phase 3)

1. **Component Library Setup**: Initialize shadcn/ui + Tailwind CSS design system
2. **Auto SDK Integration**: Set up blockchain service layer and RPC connections
3. **State Management**: Implement Zustand stores for wallet and staking data
4. **Development Environment**: Vite setup with TypeScript and testing framework

---

## 📚 Resources

### Protocol Documentation

- [Staking Specification](https://github.com/subspace/protocol-specs/blob/main/docs/decex/staking.md)
- [Auto SDK Documentation](https://github.com/autonomys/auto-sdk)
- [Farming Overview](https://academy.autonomys.xyz/autonomys-network/consensus/proof-of-archival-storage/farming)

### Brand Resources

- [Autonomys Brand Kit](https://www.autonomys.xyz/brand-kit) - Official logos, colors, and typography

### Design References

- [Lido Finance](https://stake.lido.fi) - Simplicity and trust patterns
- [Keplr Wallet](https://wallet.keplr.app/chains/cosmos-hub) - Validator marketplace UX
- [Polkadot Apps](https://polkadot.js.org/apps/) - Current technical interface

---

_This product development is following an iterative approach with clear milestones and user-centered design principles._
