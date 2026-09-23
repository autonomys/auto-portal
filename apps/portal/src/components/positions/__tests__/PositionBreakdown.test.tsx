import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PositionBreakdown } from '../PositionBreakdown';
import { STORAGE_FEE_FUNDS_PRIMER_URL } from '@/constants/staking';
import type { UserPosition, PortfolioSummary } from '@/types/position';

describe('PositionBreakdown', () => {
  it('renders single position breakdown with storage fee primer link', () => {
    const position: UserPosition = {
      operatorId: '1',
      operatorName: 'Operator 1',
      positionValue: 320000,
      storageFeeDeposit: 80000,
      pendingDeposit: null,
      pendingWithdrawals: [],
      status: 'active',
      lastUpdated: new Date(),
    };

    render(<PositionBreakdown position={position} />);

    expect(screen.getByText('Position Breakdown')).toBeDefined();
    expect(screen.getByText('Staked (active):')).toBeDefined();
    expect(screen.getByText('Storage Fund:')).toBeDefined();

    const link = screen.getByRole('link', {
      name: /see a different staked balance in your wallet\?/i,
    });
    expect(link).toBeDefined();
    expect(link.getAttribute('href')).toBe(STORAGE_FEE_FUNDS_PRIMER_URL);
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('renders portfolio breakdown with storage fee primer link', () => {
    const portfolioSummary: PortfolioSummary = {
      totalValue: 400000,
      totalStorageFee: 80000,
      activePositions: 1,
      totalEarned: 0,
      pendingDeposits: 0,
      pendingWithdrawals: 0,
    };
    const positions: UserPosition[] = [
      {
        operatorId: '1',
        operatorName: 'Operator 1',
        positionValue: 320000,
        storageFeeDeposit: 80000,
        pendingDeposit: null,
        pendingWithdrawals: [],
        status: 'active',
        lastUpdated: new Date(),
      },
    ];

    render(<PositionBreakdown portfolioSummary={portfolioSummary} positions={positions} />);

    expect(screen.getByText('Portfolio Breakdown')).toBeDefined();
    expect(screen.getByText('Total Staked:')).toBeDefined();
    expect(screen.getByText('Storage Fund:')).toBeDefined();

    const link = screen.getByRole('link', {
      name: /see a different staked balance in your wallet\?/i,
    });
    expect(link).toBeDefined();
    expect(link.getAttribute('href')).toBe(STORAGE_FEE_FUNDS_PRIMER_URL);
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('returns null when neither position nor portfolioSummary is provided', () => {
    const { container } = render(<PositionBreakdown />);
    expect(container.firstChild).toBeNull();
  });
});
