import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip } from '@/components/ui/tooltip';
import { usePositions } from '@/hooks/use-positions';
import { formatAI3, formatNumber } from '@/lib/formatting';
import { PositionBreakdown } from './PositionBreakdown';

interface PositionSummaryProps {
  refreshInterval?: number;
  networkId?: string;
}

export const PositionSummary: React.FC<PositionSummaryProps> = ({ refreshInterval, networkId }) => {
  const { portfolioSummary, positions, loading, error } = usePositions({
    refreshInterval,
    networkId,
  });

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-full">
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              <p className="font-sans">Failed to load portfolio data</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const summaryCards = [
    {
      label: 'Total Position Value',
      value: portfolioSummary ? formatAI3(portfolioSummary.totalValue, 2) : '0.00 AI3',
      subtitle: 'Current worth of all positions',
      showTooltip: true,
    },
    {
      label: 'Active Positions',
      value: portfolioSummary ? formatNumber(portfolioSummary.activePositions) : '0',
      subtitle: 'Operators staked with',
      showTooltip: false,
    },
    {
      label: 'Storage Deposits',
      value: portfolioSummary ? formatAI3(portfolioSummary.totalStorageFee, 4) : '0.0000 AI3',
      subtitle: 'Total locked in storage fees',
      showTooltip: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {summaryCards.map(card => (
        <Card key={card.label} className="relative">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="text-2xl font-mono font-bold relative">
                {card.showTooltip && portfolioSummary && positions ? (
                  <Tooltip
                    content={
                      <PositionBreakdown
                        portfolioSummary={portfolioSummary}
                        positions={positions}
                      />
                    }
                    side="top"
                  >
                    <span className={`text-foreground cursor-help ${loading ? 'opacity-60' : ''}`}>
                      {card.value}
                    </span>
                  </Tooltip>
                ) : (
                  <span className={`text-foreground ${loading ? 'opacity-60' : ''}`}>
                    {card.value}
                  </span>
                )}
                {loading && (
                  <div className="absolute -top-1 -right-1">
                    <div className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <div className="text-sm font-medium text-muted-foreground font-sans">
                {card.label}
              </div>
              <div className="text-xs text-muted-foreground font-sans">{card.subtitle}</div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Pending Operations Summary */}
      {portfolioSummary &&
        (portfolioSummary.pendingDeposits > 0 || portfolioSummary.pendingWithdrawals > 0) && (
          <div className="md:col-span-3 mt-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center space-x-8 text-sm font-sans">
                  {portfolioSummary.pendingDeposits > 0 && (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                      <span className="text-muted-foreground">
                        {portfolioSummary.pendingDeposits} pending deposit
                        {portfolioSummary.pendingDeposits > 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                  {portfolioSummary.pendingWithdrawals > 0 && (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                      <span className="text-muted-foreground">
                        {portfolioSummary.pendingWithdrawals} pending withdrawal
                        {portfolioSummary.pendingWithdrawals > 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
    </div>
  );
};
