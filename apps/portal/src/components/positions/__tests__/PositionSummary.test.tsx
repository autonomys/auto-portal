import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PositionSummary } from '../PositionSummary';
import { usePositions } from '@/hooks/use-positions';
import { STORAGE_FEE_FUNDS_PRIMER_URL } from '@/constants/staking';
import type { PortfolioSummary, UserPosition } from '@/types/position';

vi.mock('@/hooks/use-positions', () => ({
  usePositions: vi.fn(),
}));

const mockUsePositions = vi.mocked(usePositions);

describe('PositionSummary banner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('hides the storage fee banner when portfolioSummary has not loaded yet', () => {
    mockUsePositions.mockReturnValue({
      positions: [],
      portfolioSummary: null,
      loading: true,
      error: null,
      lastUpdated: null,
      hasPositions: false,
      totalValue: 0,
      activePositionsCount: 0,
      refetch: vi.fn(),
      clearError: vi.fn(),
    });

    render(<PositionSummary />);

    expect(screen.queryByText(/Seeing a different staked balance in your wallet/i)).toBeNull();
  });

  it('hides the storage fee banner when totalStorageFee is 0', () => {
    const portfolioSummary: PortfolioSummary = {
      totalValue: 500,
      activePositions: 2,
      totalEarned: 0,
      totalStorageFee: 0,
      pendingDeposits: 0,
      pendingWithdrawals: 0,
    };

    mockUsePositions.mockReturnValue({
      positions: [],
      portfolioSummary,
      loading: false,
      error: null,
      lastUpdated: new Date(),
      hasPositions: true,
      totalValue: 500,
      activePositionsCount: 2,
      refetch: vi.fn(),
      clearError: vi.fn(),
    });

    render(<PositionSummary />);

    expect(screen.queryByText(/Seeing a different staked balance in your wallet/i)).toBeNull();
  });

  it('displays the banner with formatted amount and primer link when totalStorageFee > 0', () => {
    const portfolioSummary: PortfolioSummary = {
      totalValue: 1000,
      activePositions: 2,
      totalEarned: 0,
      totalStorageFee: 200,
      pendingDeposits: 0,
      pendingWithdrawals: 0,
    };

    const positions: UserPosition[] = [
      {
        operatorId: '1',
        operatorName: 'Operator 1',
        positionValue: 800,
        storageFeeDeposit: 200,
        pendingDeposit: null,
        pendingWithdrawals: [],
        status: 'active',
        lastUpdated: new Date(),
      },
    ];

    mockUsePositions.mockReturnValue({
      positions,
      portfolioSummary,
      loading: false,
      error: null,
      lastUpdated: new Date(),
      hasPositions: true,
      totalValue: 1000,
      activePositionsCount: 1,
      refetch: vi.fn(),
      clearError: vi.fn(),
    });

    render(<PositionSummary />);

    expect(screen.getByText(/Seeing a different staked balance in your wallet/i)).toBeDefined();
    expect(screen.getByText(/200.00 AI3/)).toBeDefined();

    const link = screen.getByRole('link', { name: /Learn more/i });
    expect(link.getAttribute('href')).toBe(STORAGE_FEE_FUNDS_PRIMER_URL);
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toContain('noopener');
  });
});
