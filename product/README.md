# Staking Product Development

This directory contains all product development artifacts for the Subspace staking application. The goal is to create a user-friendly interface that enables operators and nominators to seamlessly stake on Subspace domains.

---

## 📋 Project Overview

### Vision

Enable operators and nominators to seamlessly stake on Subspace domains with a friction-less, transparent experience that matches or exceeds Web2 financial apps.

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
- **`staking-prd.md`** - Comprehensive Product Requirements Document
- **`competitive-audit.md`** - High-level analysis of staking UX patterns

### Research Resources

- **`resources/`** - Detailed research findings and UX patterns
  - `polkadot-apps-analysis.md` - Current state pain points
  - `lido-ux-patterns.md` - Best-in-class simplicity patterns
  - `keplr-validator-selection.md` - Validator marketplace UX
  - `protocol-insights.md` - Technical constraints and opportunities

---

## 🚀 Development Phases

### ✅ Phase 1: Discovery & Requirements (Completed)

- [x] Kickoff workshop and terminology alignment
- [x] Competitive research and UX pattern analysis
- [x] Protocol specification deep dive
- [x] Product requirements documentation
- [x] Technical constraints identification

### 🔄 Phase 2: Design & Architecture (In Progress)

- [ ] User journey wireframes
- [ ] Information architecture design
- [ ] Component system planning
- [ ] Mobile-first responsive design
- [ ] Accessibility considerations

### 📋 Phase 3: Technical Planning (Upcoming)

- [ ] Auto SDK integration planning
- [ ] Data architecture design
- [ ] Performance requirements
- [ ] Testing strategy
- [ ] Deployment planning

### 🛠️ Phase 4: Development (Future)

- [ ] Component development
- [ ] Integration testing
- [ ] User acceptance testing
- [ ] Performance optimization
- [ ] Security audit

---

## 👥 Key Personas

### Operator Oliver

- **Role**: Infrastructure provider running domain nodes
- **Needs**: Predictable delegated stake, clear reward visibility, uptime monitoring
- **Pain Points**: Complex setup process, unclear nomination management

### Nominator Nina

- **Role**: Token holder seeking passive income
- **Needs**: Simple staking flow, transparent rewards, easy exit process
- **Pain Points**: Confusing withdrawal process, poor mobile experience

---

## 🔑 Key Insights

### Current State Problems

- **Shannon Conversion Hell**: Manual 10^18 calculations required
- **Hidden in Developer Tools**: Staking buried in technical interface
- **No Operator Discovery**: Must know operator ID beforehand
- **Confusing Storage Fund**: 20% allocation not explained
- **Zero Progress Tracking**: No withdrawal status visibility

### Protocol Opportunities

- **Domain-Specific Operators**: Unique positioning vs generic validators
- **Predictable Epoch Timing**: Clear scheduling vs immediate/variable
- **Storage Fund Innovation**: Infrastructure sustainability story
- **Share-Based Rewards**: Efficient reward distribution system

### Design Principles

- **Hide Complexity**: Abstract away technical details (Shannons, extrinsics)
- **Visual Operator Selection**: Rich marketplace vs manual ID entry
- **Clear Withdrawal Process**: 2-step flow with progress tracking
- **Mobile Optimization**: Touch-first design from day one

---

## 🎯 Core User Journeys

### A. Operator Onboarding

```
Landing → Connect Wallet → Operator Registration →
Configure Pool → Confirm Transaction → Pending State →
Active Operator (next epoch)
```

### B. Nominator Staking

```
Landing → Connect Wallet → Browse Operators →
Select Operator → Enter Amount → Review Terms →
Confirm Transaction → Staking Confirmation → Portfolio View
```

### C. Withdrawal Process

```
Portfolio → Select Position → Withdraw Request →
Confirm Transaction → Pending Withdrawal →
Wait for Unlock Period → Unlock Funds →
Confirm Transaction → Completed
```

---

## 🛡️ Technical Constraints

### Protocol Requirements

- **Wallet Integration**: SubWallet, Talisman, Polkadot.js extension support
- **Epoch-Based Processing**: Deposits/withdrawals processed at epoch boundaries
- **Two-Step Withdrawal**: Withdraw request → unlock after locking period
- **Storage Fund**: 20% of stakes automatically allocated

### Performance Targets

- **Page Load**: < 2s P95 on 4G
- **Transaction Signing**: < 5s from click to wallet prompt
- **Real-time Updates**: < 10s for critical data refresh

### Responsive Design

- **Mobile Web**: ≥ 375px viewport support
- **Desktop**: Full-featured experience
- **Tablet**: Hybrid approach with collapsible details

---

## 📊 Success Metrics & KPIs

### User Experience

- Time-to-first-stake completion rate
- Transaction success rate by flow
- User retention and repeat usage
- Mobile vs desktop conversion rates

### Product Performance

- Total value staked through interface
- Operator discovery and selection patterns
- Withdrawal completion rates
- Support ticket volume and resolution

### Technical Performance

- Page load times and Core Web Vitals
- Transaction failure rates
- API response times
- Error rates by feature

---

## 🔄 Next Steps

### Immediate Actions (This Week)

1. **Wireframe Core Flows** - Start with nominator staking journey
2. **Operator Data Modeling** - Define marketplace information architecture
3. **Unit Conversion Strategy** - Hide Shannon complexity from users
4. **Withdrawal UX Design** - Clear 2-step process visualization

### Short Term (Next 2 Weeks)

1. **Interactive Prototypes** - Clickable flows for validation
2. **Component Architecture** - Design system planning
3. **Technical Feasibility** - Auto SDK integration research
4. **Mobile Optimization** - Touch-first interaction patterns

### Medium Term (Next Month)

1. **Development Planning** - Sprint planning and resource allocation
2. **Testing Strategy** - User testing and validation approach
3. **Performance Planning** - Optimization and caching strategies
4. **Launch Strategy** - MVP scope and rollout plan

---

## 📚 Key Resources

### External Documentation

- [Autonomys Staking Guide](https://docs.autonomys.xyz/staking/operator/polkadot)
- [Protocol Staking Specification](https://github.com/subspace/protocol-specs/blob/main/docs/decex/staking.md)
- [Auto SDK Consensus Package](https://github.com/autonomys/auto-sdk/tree/main/packages/auto-consensus)
- [Protocol Monorepo](https://github.com/autonomys/subspace)

### Design References

- [Lido Finance](https://stake.lido.fi) - Simplicity and trust patterns
- [Keplr Wallet](https://wallet.keplr.app/chains/cosmos-hub) - Validator marketplace UX
- [Polkadot Apps](https://polkadot.js.org/apps/) - Current technical interface

---

## 🤝 Contributing

### Document Updates

- Keep all documents current with latest decisions
- Cross-reference related information
- Update this README when adding new files
- Use consistent formatting and terminology

### Research Additions

- Add new competitive analyses to `resources/` folder
- Document user feedback and insights
- Update protocol insights as specifications evolve
- Maintain links to external resources

---

_This README serves as the central hub for all staking product development activities and should be updated as the project evolves._
