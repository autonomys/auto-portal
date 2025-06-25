import React from 'react';
import { usePositions } from '@/hooks/use-positions';
import { Card, CardContent } from '@/components/ui/card';

export const PositionSummary: React.FC = () => {
  const { portfolioSummary, loading } = usePositions();

  const summaryCards = [
    {
      label: 'Position Value',
      value: portfolioSummary?.totalValue || '0 AI3',
      subtitle: 'Current worth',
    },
    {
      label: 'Active Positions',
      value: portfolioSummary?.activePositions.toString() || '0',
      subtitle: 'Operators staked to',
    },
    {
      label: 'Storage Deposits',
      value: portfolioSummary?.totalStorageFee || '0 AI3',
      subtitle: 'Total locked in storage',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {summaryCards.map(card => (
        <Card key={card.label}>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {loading ? <span className="animate-pulse">---</span> : card.value}
              </div>
              <div className="text-sm font-medium text-muted-foreground mt-1">{card.label}</div>
              <div className="text-xs text-muted-foreground">{card.subtitle}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
