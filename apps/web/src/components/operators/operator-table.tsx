import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatNumber, formatPercentage, getAPYColor, getUptimeColor } from '@/lib/formatting';
import type { Operator } from '@/types/operator';

interface OperatorTableProps {
  operators: Operator[];
  loading?: boolean;
  onStake: (operatorId: string) => void;
  onViewDetails: (operatorId: string) => void;
}

export const OperatorTable: React.FC<OperatorTableProps> = ({
  operators,
  loading = false,
  onStake,
  onViewDetails,
}) => {
  const getStatusVariant = (status: Operator['status']) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'degraded':
        return 'secondary';
      case 'inactive':
        return 'outline';
      case 'slashed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getOperatorInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <div className="border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4 font-medium text-muted-foreground">Operator</th>
              <th className="text-left p-4 font-medium text-muted-foreground">APY</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Tax</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Total Staked</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Uptime</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 4 }).map((_, index) => (
              <tr key={index} className="border-t border-border animate-pulse">
                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-muted rounded-full" />
                    <div className="space-y-1">
                      <div className="h-4 bg-muted rounded w-32" />
                      <div className="h-3 bg-muted rounded w-20" />
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="h-4 bg-muted rounded w-12" />
                </td>
                <td className="p-4">
                  <div className="h-4 bg-muted rounded w-8" />
                </td>
                <td className="p-4">
                  <div className="h-4 bg-muted rounded w-20" />
                </td>
                <td className="p-4">
                  <div className="h-4 bg-muted rounded w-12" />
                </td>
                <td className="p-4">
                  <div className="h-6 bg-muted rounded w-16" />
                </td>
                <td className="p-4">
                  <div className="flex space-x-2">
                    <div className="h-8 bg-muted rounded w-16" />
                    <div className="h-8 bg-muted rounded w-16" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (operators.length === 0) {
    return (
      <div className="border border-border rounded-xl p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <svg
            className="w-8 h-8 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No operators found</h3>
        <p className="text-muted-foreground">
          Try adjusting your search criteria or filters to find more operators.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left p-4 font-medium text-muted-foreground">Operator</th>
            <th className="text-left p-4 font-medium text-muted-foreground">APY</th>
            <th className="text-left p-4 font-medium text-muted-foreground">Tax</th>
            <th className="text-left p-4 font-medium text-muted-foreground">Total Staked</th>
            <th className="text-left p-4 font-medium text-muted-foreground">Uptime</th>
            <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
            <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {operators.map((operator, index) => (
            <tr
              key={operator.id}
              className={`
                border-t border-border hover:bg-muted/50 transition-colors
                ${index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}
              `}
            >
              <td className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-medium text-sm">
                      {getOperatorInitial(operator.name)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-foreground truncate">{operator.name}</div>
                    <div className="text-sm text-muted-foreground">{operator.domainName}</div>
                    {operator.isRecommended && (
                      <Badge
                        variant="secondary"
                        className="bg-accent-100 text-accent-700 border-accent-300 text-xs mt-1"
                      >
                        Recommended
                      </Badge>
                    )}
                  </div>
                </div>
              </td>
              <td className="p-4">
                <span className={`font-mono font-medium ${getAPYColor(operator.currentAPY)}`}>
                  {formatPercentage(operator.currentAPY)}
                </span>
              </td>
              <td className="p-4">
                <span className="font-mono">{formatPercentage(operator.nominationTax)}</span>
              </td>
              <td className="p-4">
                <div>
                  <div className="font-mono font-medium">
                    {formatNumber(operator.totalStaked)} AI3
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {operator.nominatorCount} nominators
                  </div>
                </div>
              </td>
              <td className="p-4">
                <span className={`font-mono ${getUptimeColor(operator.uptime)}`}>
                  {formatPercentage(operator.uptime)}
                </span>
              </td>
              <td className="p-4">
                <Badge variant={getStatusVariant(operator.status)}>{operator.status}</Badge>
              </td>
              <td className="p-4">
                <div className="flex space-x-2">
                  <Button size="sm" onClick={() => onStake(operator.id)}>
                    Stake
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onViewDetails(operator.id)}>
                    Details
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
