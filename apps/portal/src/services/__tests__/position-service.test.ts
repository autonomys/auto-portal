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
});
