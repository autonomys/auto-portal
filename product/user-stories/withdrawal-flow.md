# 📤 Feature: Withdrawal & Unlock Flow

**Priority:** High
**Type:** Frontend + RPC Integration
**Prerequisites:** ✅ Nominator Position Integration
**Status:** 🎯 **CURRENT PRIORITY**

---

## 📋 Summary

This user story covers the implementation of the full two-step withdrawal process. It allows a user to request a withdrawal of staked AI3 from an operator and, after the locking period, unlock the funds to make them available in their wallet.

This feature is critical for completing the staking lifecycle and builds directly on top of the position tracking components.

---

## 👤 User Story

> **As a** staker with an active position,
> **I want to** withdraw my staked tokens and later unlock them,
> **So that** I can securely retrieve my funds and realized rewards.

---

## ✅ Acceptance Criteria

### **Step 1: Request Withdrawal**

- [ ] A "Withdraw" button will be available on the portfolio or active positions table.
- [ ] The withdrawal UI must allow users to choose between a **partial** or **full** withdrawal.
- [ ] For partial withdrawals, the input must be validated against the user's total position value.
- [ ] The UI must provide a **clear preview** of the withdrawal, showing:
  - The amount of staked tokens being withdrawn.
  - The proportional amount of the **storage fund** being returned.
  - The estimated transaction fee.
- [ ] The flow must construct and sign the `withdrawStake` extrinsic using the Auto SDK.
- [ ] Upon success, the `usePositions` hook must be refreshed to show a new **pending withdrawal**, including the unlock block number or an estimated unlock time.

### **Step 2: Unlock Funds**

- [ ] The `PendingOperations.tsx` component must detect when a withdrawal is ready to be unlocked (current block > unlock block).
- [ ] A "Claim" or "Unlock" button must become active next to the corresponding pending withdrawal.
- [ ] Clicking "Claim" will construct and sign the `unlockNominator` extrinsic.
- [ ] The UI must provide real-time feedback on the unlock transaction status.
- [ ] Upon success, the `usePositions` and `useBalance` hooks must be refreshed. The pending withdrawal should be removed from the list, and the user's available balance should increase.

### **Error Handling & UX**

- [ ] Clear loading and error states must be implemented for both `withdrawStake` and `unlockNominator` transactions.
- [ ] The UI must explain the two-step nature of the process and the associated waiting period.
- [ ] If a transaction is rejected or fails, the user should be notified with a clear error message.

### **Withdrawal Progress Tracking**

- [ ] A visual progress tracker (e.g., a timeline or stepper) must be displayed for pending withdrawals.
- [ ] The tracker must clearly show the current status:
  - **Step 1: Withdrawing** (Waiting for locking period to end)
  - **Step 2: Ready to Unlock** (Locking period complete)
  - **Step 3: Unlocked** (Funds returned to wallet)
- [ ] The UI should display the estimated unlock time or the specific block number required for the unlock. This should be a dynamic countdown if possible.

---

## 🏗️ Technical Implementation Plan

### 1. **Create `WithdrawalPage.tsx`**

- This new page/modal will guide the user through selecting a position and an amount to withdraw.
- It will reuse the `TransactionPreview` component, adapted for withdrawals.
- It will integrate a new `useWithdrawalTransaction` hook.

### 2. **Create `withdrawal-service.ts`**

- This service will contain two primary functions:
  - `requestWithdrawal(operatorId, amount)`: Handles the `withdrawStake` extrinsic.
  - `unlock(operatorId)`: Handles the `unlockNominator` extrinsic.
- It will include logic to correctly format parameters for the different withdrawal types (All, Stake, etc.).

### 3. **Create `useWithdrawalTransaction` Hook**

- This hook will manage the state for both steps of the withdrawal process.
- It will expose `executeWithdraw` and `executeUnlock` functions.
- It will track the state (`idle`, `signing`, `pending`, `success`, `error`) for each transaction type.

### 4. **Update `PendingOperations.tsx`**

- Fetch the current block number to compare against the `unlockAt` block for each pending withdrawal.
- Conditionally render a "Claim" button based on the unlock status.
- The "Claim" button will trigger the `executeUnlock` function from the `useWithdrawalTransaction` hook.

---

## 📚 References

- **[Withdrawal Flow Mockup](../mockups/withdrawal-flow.html)** - Visual reference for the UI.
- **[Protocol Insights](../resources/protocol-insights.md)** - Details on the two-step withdrawal mechanics and locking period.
- **[Auto SDK Consensus Docs](https://develop.autonomys.xyz/sdk/auto-consensus)** - Documentation for `withdrawStake` and `unlockNominator`.
