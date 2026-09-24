import { describe, it, expect, vi } from 'vitest';
import { positionService } from '../position-service';
import { nominatorPosition } from '@autonomys/auto-consensus';

vi.mock('@autonomys/auto-consensus', () => ({
  nominatorPosition: vi.fn(),
}));

vi.mock('../api-service', () => ({
  getSharedApiConnection: vi.fn().mockResolvedValue({}),
}));

vi.mock('../chain-pulse-client', () => ({
  chainPulseClient: {
    getNominatorOperatorIds: vi.fn().mockResolvedValue(['0']),
  },
}));

describe('positionService', () => {
  it('maps storageFeeDeposit to currentValue while using totalDeposited > 0 for activity check', async () => {
    vi.mocked(nominatorPosition).mockResolvedValueOnce({
      currentStakedValue: 0n,
      totalShares: 0n,
      storageFeeDeposit: {
        totalDeposited: 500000000000000000n, // 0.5 AI3
        currentValue: 0n, // fully depleted
      },
      pendingDeposit: null,
      pendingWithdrawals: [],
    });

    const service = await positionService();
    const position = await service.getPositionByOperator(
      '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      '0',
    );

    // Should not be filtered out because totalDeposited > 0
    expect(position).not.toBeNull();
    // storageFeeDeposit should reflect the live currentValue (0)
    expect(position?.storageFeeDeposit).toBe(0);
  });

  describe('calculatePortfolioSummary', () => {
    it('accurately calculates portfolio summary aggregating positionValue, storageFee, and pending operations', async () => {
      const service = await positionService();

      const mockPositions = [
        {
          operatorId: '0',
          operatorName: 'Operator 0',
          positionValue: 100,
          storageFeeDeposit: 10,
          pendingDeposit: { amount: 50, effectiveEpoch: 5 },
          pendingWithdrawals: [],
          status: 'pending' as const,
          lastUpdated: new Date(),
        },
        {
          operatorId: '1',
          operatorName: 'Operator 1',
          positionValue: 200,
          storageFeeDeposit: 20,
          pendingDeposit: null,
          pendingWithdrawals: [
            {
              grossWithdrawalAmount: 30,
              stakeWithdrawalAmount: 25,
              storageFeeRefund: 5,
              unlockAtBlock: 100,
            },
          ],
          status: 'withdrawing' as const,
          lastUpdated: new Date(),
        },
      ];

      const summary = service.calculatePortfolioSummary(mockPositions);

      // Total value: (100 + 10 + 50) + (200 + 20 + 0) = 380
      expect(summary.totalValue).toBe(380);
      expect(summary.activePositions).toBe(2);
      expect(summary.totalStorageFee).toBe(30);
      expect(summary.pendingDeposits).toBe(1);
      expect(summary.pendingWithdrawals).toBe(1);
    });

    it('returns zeroes for empty positions list', async () => {
      const service = await positionService();
      const summary = service.calculatePortfolioSummary([]);

      expect(summary.totalValue).toBe(0);
      expect(summary.activePositions).toBe(0);
      expect(summary.totalStorageFee).toBe(0);
      expect(summary.pendingDeposits).toBe(0);
      expect(summary.pendingWithdrawals).toBe(0);
    });
  });
});
