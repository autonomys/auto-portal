import { describe, it, expect } from 'vitest';
import { hasUserPosition, calculateTotalPositionValue } from '../position-utils';
import type { UserPosition } from '@/types/position';

describe('hasUserPosition', () => {
  it('returns false for null, undefined, or empty position', () => {
    expect(hasUserPosition(null)).toBe(false);
    expect(hasUserPosition(undefined)).toBe(false);

    const emptyPosition: UserPosition = {
      operatorId: '0',
      operatorName: 'Operator 0',
      positionValue: 0,
      storageFeeDeposit: 0,
      pendingDeposit: null,
      pendingWithdrawals: [],
      status: 'active',
      lastUpdated: new Date(),
    };
    expect(hasUserPosition(emptyPosition)).toBe(false);
  });

  it('returns true when positionValue > 0', () => {
    const pos: UserPosition = {
      operatorId: '0',
      operatorName: 'Operator 0',
      positionValue: 100,
      storageFeeDeposit: 0,
      pendingDeposit: null,
      pendingWithdrawals: [],
      status: 'active',
      lastUpdated: new Date(),
    };
    expect(hasUserPosition(pos)).toBe(true);
  });

  it('returns true when storageFeeDeposit > 0', () => {
    const pos: UserPosition = {
      operatorId: '0',
      operatorName: 'Operator 0',
      positionValue: 0,
      storageFeeDeposit: 20,
      pendingDeposit: null,
      pendingWithdrawals: [],
      status: 'active',
      lastUpdated: new Date(),
    };
    expect(hasUserPosition(pos)).toBe(true);
  });

  it('returns true when pendingDeposit.amount > 0', () => {
    const pos: UserPosition = {
      operatorId: '0',
      operatorName: 'Operator 0',
      positionValue: 0,
      storageFeeDeposit: 0,
      pendingDeposit: { amount: 50, effectiveEpoch: 2 },
      pendingWithdrawals: [],
      status: 'pending',
      lastUpdated: new Date(),
    };
    expect(hasUserPosition(pos)).toBe(true);
  });

  it('omits pendingWithdrawals from active position presence', () => {
    const exitedPos: UserPosition = {
      operatorId: '0',
      operatorName: 'Operator 0',
      positionValue: 0,
      storageFeeDeposit: 0,
      pendingDeposit: null,
      pendingWithdrawals: [
        {
          grossWithdrawalAmount: 100,
          stakeWithdrawalAmount: 80,
          storageFeeRefund: 20,
          unlockAtBlock: 1000,
        },
      ],
      status: 'withdrawing',
      lastUpdated: new Date(),
    };
    expect(hasUserPosition(exitedPos)).toBe(false);
  });
});

describe('calculateTotalPositionValue', () => {
  it('returns 0 for null or undefined position', () => {
    expect(calculateTotalPositionValue(null)).toBe(0);
    expect(calculateTotalPositionValue(undefined)).toBe(0);
  });

  it('sums positionValue, storageFeeDeposit, and pendingDeposit amount accurately', () => {
    const pos: UserPosition = {
      operatorId: '0',
      operatorName: 'Operator 0',
      positionValue: 100,
      storageFeeDeposit: 25,
      pendingDeposit: { amount: 50, effectiveEpoch: 2 },
      pendingWithdrawals: [],
      status: 'active',
      lastUpdated: new Date(),
    };
    expect(calculateTotalPositionValue(pos)).toBe(175);
  });
});
