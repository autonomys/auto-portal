import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip } from '@/components/ui/tooltip';
import { ExternalLink, InfoIcon } from 'lucide-react';
import { usePositions } from '@/hooks/use-positions';
import { formatAI3, formatNumber } from '@/lib/formatting';
import { STORAGE_FEE_FUNDS_PRIMER_URL } from '@/constants/staking';
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
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {summaryCards.map(card => (
        <Card key={card.label} className="relative">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="text-2xl font-mono font-bold relative">
                {card.showTooltip && portfolioSummary && positions ? (
                  <Tooltip
                    interactive
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
      {portfolioSummary && portfolioSummary.totalStorageFee > 0 && (
        <div className="col-span-full bg-muted/40 border border-border/60 rounded-lg p-3 text-xs text-muted-foreground flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-2">
            <InfoIcon className="w-4 h-4 text-primary shrink-0 mt-0.5 sm:mt-0" />
            <span>
              <strong>Seeing a different staked balance in your wallet?</strong> Wallets display
              only your active staking pool shares, excluding the Storage Fund deposit (
              {formatAI3(portfolioSummary.totalStorageFee, 2)}). Your storage funds remain part of
              your total position and are returned upon withdrawal.
            </span>
          </div>
          <a
            href={STORAGE_FEE_FUNDS_PRIMER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline whitespace-nowrap inline-flex items-center gap-1 font-medium text-xs self-end sm:self-auto"
          >
            Learn more
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
    </div>
  );
};
