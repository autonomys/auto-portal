import React from 'react';
import { formatAI3 } from '@/lib/formatting';
import type { UserPosition, PortfolioSummary } from '@/types/position';

interface PositionBreakdownProps {
  position?: UserPosition;
  portfolioSummary?: PortfolioSummary;
  positions?: UserPosition[];
}

export const PositionBreakdown: React.FC<PositionBreakdownProps> = ({
  position,
  portfolioSummary,
  positions,
}) => {
  // Single position breakdown
  if (position) {
    const totalStaked = position.positionValue;
    const storageFund = position.storageFeeDeposit;
    const pendingStaked = position.pendingDeposits.reduce(
      (sum, deposit) => sum + deposit.amount,
      0,
    );
    const pendingWithdrawal = position.pendingWithdrawals.reduce(
      (sum, withdrawal) => sum + withdrawal.grossWithdrawalAmount,
      0,
    );

    return (
      <div className="space-y-1.5 min-w-48">
        <div className="text-xs font-semibold text-gray-300 border-b border-gray-700 pb-1">
          Position Breakdown
        </div>
        <div className="space-y-1">
          <div className="grid grid-cols-2 gap-2">
            <span className="text-gray-300 text-left">Staked:</span>
            <span className="font-mono text-white text-right">{formatAI3(totalStaked, 4)}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <span className="text-gray-300 text-left">Storage Fund:</span>
            <span className="font-mono text-white text-right">{formatAI3(storageFund, 4)}</span>
          </div>
          {pendingStaked > 0 && (
            <div className="grid grid-cols-2 gap-2">
              <span className="text-yellow-300 text-left">Pending Staked:</span>
              <span className="font-mono text-yellow-300 text-right">
                {formatAI3(pendingStaked, 4)}
              </span>
            </div>
          )}
          {pendingWithdrawal > 0 && (
            <div className="grid grid-cols-2 gap-2">
              <span className="text-orange-300 text-left">Pending Withdrawal:</span>
              <span className="font-mono text-orange-300 text-right">
                {formatAI3(pendingWithdrawal, 4)}
              </span>
            </div>
          )}
          <div className="border-t border-gray-700 pt-1 mt-2">
            <div className="grid grid-cols-2 gap-2 font-semibold">
              <span className="text-gray-200 text-left">Total Value:</span>
              <span className="font-mono text-white text-right">
                {formatAI3(totalStaked + storageFund, 4)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Portfolio summary breakdown
  if (portfolioSummary && positions) {
    const totalStaked = positions.reduce((sum, pos) => sum + pos.positionValue, 0);
    const totalStorageFund = portfolioSummary.totalStorageFee;
    const totalPendingStaked = positions.reduce(
      (sum, pos) => sum + pos.pendingDeposits.reduce((pSum, deposit) => pSum + deposit.amount, 0),
      0,
    );
    const totalPendingWithdrawal = positions.reduce(
      (sum, pos) =>
        sum +
        pos.pendingWithdrawals.reduce(
          (wSum, withdrawal) => wSum + withdrawal.grossWithdrawalAmount,
          0,
        ),
      0,
    );

    return (
      <div className="space-y-1.5 min-w-48">
        <div className="text-xs font-semibold text-gray-300 border-b border-gray-700 pb-1">
          Portfolio Breakdown
        </div>
        <div className="space-y-1">
          <div className="grid grid-cols-2 gap-2">
            <span className="text-gray-300 text-left">Total Staked:</span>
            <span className="font-mono text-white text-right">{formatAI3(totalStaked, 4)}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <span className="text-gray-300 text-left">Storage Fund:</span>
            <span className="font-mono text-white text-right">
              {formatAI3(totalStorageFund, 4)}
            </span>
          </div>
          {totalPendingStaked > 0 && (
            <div className="grid grid-cols-2 gap-2">
              <span className="text-yellow-300 text-left">Pending Staked:</span>
              <span className="font-mono text-yellow-300 text-right">
                {formatAI3(totalPendingStaked, 4)}
              </span>
            </div>
          )}
          {totalPendingWithdrawal > 0 && (
            <div className="grid grid-cols-2 gap-2">
              <span className="text-orange-300 text-left">Pending Withdrawal:</span>
              <span className="font-mono text-orange-300 text-right">
                {formatAI3(totalPendingWithdrawal, 4)}
              </span>
            </div>
          )}
          <div className="border-t border-gray-700 pt-1 mt-2">
            <div className="grid grid-cols-2 gap-2 font-semibold">
              <span className="text-gray-200 text-left">Total Value:</span>
              <span className="font-mono text-white text-right">
                {formatAI3(portfolioSummary.totalValue, 4)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
