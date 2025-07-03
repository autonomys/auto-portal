import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';
import { PositionSummary, ActivePositionsTable, PendingOperations } from '@/components/positions';
import { useBalance } from '@/hooks/use-balance';
import { usePositions } from '@/hooks/use-positions';
import { formatAI3 } from '@/lib/formatting';
import { layout } from '@/lib/layout';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { balance, loading: balanceLoading } = useBalance();
  const { hasPositions, portfolioSummary } = usePositions();

  // Calculate true total balance including storage deposits
  const totalBalanceWithPositions = useMemo(() => {
    if (!balance) return null;

    const walletBalance = parseFloat(balance.total);
    const storageDeposits = portfolioSummary?.totalStorageFee || 0;

    return walletBalance + storageDeposits;
  }, [balance, portfolioSummary]);

  // Breakdown tooltip content for total balance
  const TotalBalanceBreakdown = () => (
    <div className="space-y-1.5 min-w-48">
      <div className="text-xs font-semibold text-gray-300 border-b border-gray-700 pb-1">
        Total Balance Breakdown
      </div>
      <div className="space-y-1">
        <div className="grid grid-cols-2 gap-2">
          <span className="text-gray-300 text-left">Free Balance:</span>
          <span className="font-mono text-white text-right">
            {balance ? formatAI3(balance.free, 4) : '0.0000 AI3'}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <span className="text-gray-300 text-left">Reserved Balance:</span>
          <span className="font-mono text-white text-right">
            {balance ? formatAI3(balance.reserved, 4) : '0.0000 AI3'}
          </span>
        </div>
        {portfolioSummary && portfolioSummary.totalStorageFee > 0 && (
          <div className="grid grid-cols-2 gap-2">
            <span className="text-gray-300 text-left">Storage Deposits:</span>
            <span className="font-mono text-white text-right">
              {formatAI3(portfolioSummary.totalStorageFee, 4)}
            </span>
          </div>
        )}
        <div className="border-t border-gray-700 pt-1 mt-2">
          <div className="grid grid-cols-2 gap-2 font-semibold">
            <span className="text-gray-200 text-left">Total Balance:</span>
            <span className="font-mono text-white text-right">
              {totalBalanceWithPositions ? formatAI3(totalBalanceWithPositions, 4) : '0.0000 AI3'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={layout.pageSection + ' ' + layout.pageContent}>
      {/* Page Header */}
      <div className={layout.pageHeader}>
        <div className="max-w-3xl mx-auto">
          <h1 className="text-h1 text-foreground mb-3">Dashboard</h1>
          <p className="text-body-large text-muted-foreground">
            Manage your staking positions and discover operators
          </p>
        </div>
      </div>

      {/* Portfolio Summary */}
      <PositionSummary />

      {/* Wallet Balance - Only show available balance alongside position data */}
      <div className={layout.gridResponsive['1-2'] + ' gap-6'}>
        <Card className="relative">
          <CardHeader className="pb-2">
            <CardTitle className="text-label">Available Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-h2 font-mono relative">
              <span className={`${balanceLoading ? 'opacity-60' : ''}`}>
                {balance ? formatAI3(balance.free) : '0.00 AI3'}
              </span>
              {balanceLoading && (
                <div className="absolute -top-1 -right-1">
                  <div className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
              )}
            </div>
            <p className="text-caption">Ready to stake</p>
          </CardContent>
        </Card>

        <Card className="relative">
          <CardHeader className="pb-2">
            <CardTitle className="text-label">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-h2 font-mono relative">
              <Tooltip content={<TotalBalanceBreakdown />} side="top">
                <span className={`cursor-help ${balanceLoading ? 'opacity-60' : ''}`}>
                  {totalBalanceWithPositions ? formatAI3(totalBalanceWithPositions) : '0.00 AI3'}
                </span>
              </Tooltip>
              {balanceLoading && (
                <div className="absolute -top-1 -right-1">
                  <div className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
              )}
            </div>
            <p className="text-caption">Wallet + Storage Deposits</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Positions */}
      <ActivePositionsTable
        onOperatorClick={operatorId => {
          console.log('Navigate to operator details:', operatorId);
          // Future: Navigate to operator details page
        }}
      />

      {/* Pending Operations */}
      <PendingOperations />

      {/* Call to Action - Only show if no positions */}
      {!hasPositions && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <CardTitle className="text-h3 mb-2">Start Staking</CardTitle>
              <CardDescription className="text-body mb-4">
                Browse available operators and choose the best fit for your staking strategy
              </CardDescription>
              <Button size="lg" onClick={() => navigate('/operators')}>
                Browse Operators
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
