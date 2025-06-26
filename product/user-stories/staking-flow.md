# 💰 Feature: Staking Flow RPC Integration

**Priority:** High
**Type:** Frontend + RPC Integration
**Prerequisites:** ✅ Operator Discovery, ✅ Wallet Balance Integration
**Status:** 📝 **READY FOR IMPLEMENTATION**

---

## 📋 Summary

This user story covers the implementation of the complete staking flow, enabling a user to select an operator, input an amount, review the transaction details, and submit a `nominateOperator` extrinsic to the blockchain using the Auto SDK.

This will replace the mock staking logic with a real, end-to-end transaction submission process.

---

## 👤 User Story

> **As a** token holder with an available AI3 balance,
> **I want to** stake a specific amount to a chosen operator,
> **So that** I can put my tokens to work and start earning staking rewards.

---

## ✅ Acceptance Criteria

### **Form & Validation**

- [ ] The staking form must use the user's **real available balance** for validation.
- [ ] The input amount must be validated against the **operator's `minimumNominatorStake`** (fetched via RPC).
- [ ] The form must prevent staking if the user's balance is insufficient to cover the stake amount, storage fund, and estimated transaction fee.
- [ ] The "MAX" button should calculate the maximum stakeable amount, accounting for the 20% storage fund and transaction fees.

### **Transaction Flow**

- [ ] A `staking-service` will be created or updated to handle the `nominateOperator` extrinsic from `@autonomys/auto-consensus`.
- [ ] The "Stake Tokens" button will trigger the signing process via the connected wallet extension.
- [ ] The UI must display real-time transaction status feedback (e.g., "Awaiting signature", "Submitting...", "In block", "Finalized").
- [ ] A toast notification or modal will confirm a successful transaction, providing a link to the block explorer.

### **State Updates & Error Handling**

- [ ] Upon successful staking, the `usePositions` hook should be triggered to refresh the user's position data, showing the new pending deposit.
- [ ] If the user rejects the transaction in their wallet, the UI should return to the form's initial state gracefully.
- [ ] If the transaction fails on-chain, a clear error message should be displayed to the user.
- [ ] Loading states on the "Stake Tokens" button must disable it to prevent duplicate submissions.

### **Monitoring Pending Deposits**

- [ ] The UI must clearly distinguish between **"Active"** stake (earning rewards) and **"Pending"** stake (waiting for the next epoch).
- [ ] A visual indicator, such as a countdown timer or progress bar, should show the estimated time until the next epoch transition when the pending stake will become active.
- [ ] Once the epoch transition occurs, the UI should automatically update to show the pending stake has moved to the active portfolio.

---

## 🏗️ Technical Implementation Plan

### 1. **Create `staking-service.ts`**

- This service will contain the `nominate` function, which takes an `operatorId` and `amount` (in AI3).
- It will convert the AI3 amount to Shannons.
- It will construct the `nominateOperator` extrinsic and use the `signAndSend` utility from the Auto SDK.
- It will return the transaction status and final hash.

### 2. **Create `useStakingTransaction` Hook**

- This hook will manage the state of the staking transaction (`idle`, `signing`, `pending`, `success`, `error`).
- It will expose an `execute` function that calls the `staking-service`.
- It will handle the loading and error states for the UI.

### 3. **Update `StakingForm.tsx`**

- Integrate the `useStakingTransaction` hook.
- Fetch the selected operator's real-time data to validate the minimum stake.
- Use the real `availableBalance` from the `useBalance` hook for validation.
- Disable the form and submit button while a transaction is in progress.
- On success, trigger a refresh of the user's positions.

### 4. **Update `TransactionPreview.tsx`**

- The breakdown must accurately reflect the 20% storage fund, which is handled by the protocol but should be clearly communicated in the UI.
- The estimated transaction fee should be fetched dynamically.

---

## 📚 References

- **[Staking Flow Mockup](../mockups/staking-flow.html)** - Visual reference for the UI.
- **[Protocol Insights](../resources/protocol-insights.md)** - Details on the share-based pool system and storage fund.
- **[Auto SDK Consensus Docs](https://develop.autonomys.xyz/sdk/auto-consensus)** - Documentation for `nominateOperator`.
