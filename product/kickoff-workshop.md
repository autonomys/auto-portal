# Staking Product – Kick-off Workshop Notes

**Date:** 2025-06-20

**Participants:** Product, Design, Engineering, Protocol SME

---

## 1. Vision & Purpose

Enable operators and nominators to seamlessly stake on Subspace domains with a friction-less, transparent experience that matches or exceeds Web2 financial apps.

---

## 2. Shared Vocabulary (Glossary)

| Term               | Definition                                                                               |
| ------------------ | ---------------------------------------------------------------------------------------- |
| **Domain**         | An "enshrined layer-2" that lives within the blockchain ecosystem.                       |
| **Operator**       | Node runner responsible for producing domain blocks; must post self-stake.               |
| **Nominator**      | Token holder who stakes to an operator to earn rewards.                                  |
| **Stake**          | Tokens locked on-chain to secure an operator or nomination.                              |
| **Nomination Tax** | Percentage of nominator rewards retained by operator as fee.                             |
| **Epoch**          | Fixed period when stake deposits/withdrawals are processed and rewards are distributed.  |
| **Slashing**       | Penalty applied to stake for operator mis-behavior or downtime.                          |
| **Withdraw**       | First step: request to unstake shares from operator pool (processed at epoch boundary).  |
| **Unlock**         | Second step: claim withdrawn tokens after locking period expires (transfers to balance). |

---

## 3. Success Criteria (Initial Draft)

1. **Time-to-first-stake**: < 5 minutes from landing on staking UI to submitted extrinsic.
2. **Transaction failure rate**: < 1 % measured over rolling 30-day window.
3. **User satisfaction (SUS)**: ≥ 80 for operators and nominators at GA launch.
4. **Staked supply**: ≥ 30 % of circulating tokens staked within 6 months.

---

## 4. Known Constraints & Assumptions

- Transactions must be signed via SubWallet, Talisman or Polkadot.js extension (no custodial flow).
- UI must work on desktop & mobile web (≥ 375 px). Responsive design required.
- Rely on on-chain RPC (Substrate) for data; avoid centralized indexing where possible, but can use a lightweight cache service for performance.
  - This is tough but ideal.
- Strict TypeScript & functional React per repo guidelines.

---

## 5. Immediate Next Steps

1. **User & stakeholder interviews** – schedule 3 operators + 3 nominators (ETA: next week).
2. **Competitor audit** – capture staking flows from Polkadot Apps, Lido, Cosmos Hub, etc.
3. **PRD Skeleton** – create `/product/staking/prd.md` and begin filling sections.
4. **Design workspace** – open Figma project with pages `Audit`, `Wireframes`, `UI Kit`.
5. **Data contract mapping** – draft list of required Substrate RPC / extrinsics.

---

## 6. Resources

- Polkadot staking UX (reference): https://docs.autonomys.xyz/staking/operator/polkadot
- Protocol staking spec: https://github.com/subspace/protocol-specs/blob/main/docs/decex/staking.md
- Auto SDK - https://github.com/autonomys/auto-sdk/tree/main/packages/auto-consensus
- protocol monorepo - https://github.com/autonomys/subspace

---

_End of workshop notes – update as new information arises._
