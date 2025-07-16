import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatNumber, formatPercentage } from '@/lib/formatting';
import type { Operator } from '@/types/operator';

interface OperatorPoolStatsProps {
  operator: Operator;
}

export const OperatorPoolStats: React.FC<OperatorPoolStatsProps> = ({ operator }) => {
  const stats = [
    {
      label: 'Total Staked',
      value: `${formatNumber(operator.totalStaked)} AI3`,
      description: 'Current pool size',
    },
    {
      label: 'Nominators',
      value: operator.nominatorCount.toString(),
      description: 'Active stakers',
    },
    {
      label: 'Commission Rate',
      value: formatPercentage(operator.nominationTax),
      description: 'Tax on rewards',
    },
  ];

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Pool Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map(stat => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-mono font-bold text-foreground mb-1">{stat.value}</div>
              <div className="text-sm font-medium text-foreground mb-1">{stat.label}</div>
              <div className="text-xs text-muted-foreground">{stat.description}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
