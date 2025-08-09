import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';
import { PositionSummary, ActivePositionsTable, PendingOperations } from '@/components/positions';
import { WalletModal } from '@/components/wallet';
import { useBalance } from '@/hooks/use-balance';
import { usePositions } from '@/hooks/use-positions';
import { useWallet } from '@/hooks/use-wallet';
import { formatAI3 } from '@/lib/formatting';
import { layout } from '@/lib/layout';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { balance, loading: balanceLoading } = useBalance();
  const { hasPositions, portfolioSummary } = usePositions();
  const hasPendingOperations =
    (portfolioSummary?.pendingDeposits || 0) + (portfolioSummary?.pendingWithdrawals || 0) > 0;
  const { isConnected } = useWallet();
  const [walletModalOpen, setWalletModalOpen] = useState(false);

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
    <div className={'py-8 space-y-8'}>
      {/* Page Header */}
      <div className="pb-8 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-h1 text-foreground mb-3">Dashboard</h1>
          <p className="text-body-large text-muted-foreground">
            Manage your staking positions and discover operators
          </p>
        </div>
      </div>

      {/* Contextual CTA above Pending Operations */}
      {!isConnected && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <h3 className="text-h4">Connect wallet to get started</h3>
              <p className="text-muted-foreground text-sm">
                Track your balance, manage staking positions, and claim withdrawals.
              </p>
              <Button size="lg" onClick={() => setWalletModalOpen(true)}>
                Connect wallet
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      {isConnected && !hasPositions && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <h3 className="text-h4">Find operators to nominate</h3>
              <p className="text-muted-foreground text-sm">
                Browse operators and start earning by staking with them.
              </p>
              <Button size="lg" onClick={() => navigate('/operators')}>
                View operators
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Portfolio Summary */}
      {isConnected && <PositionSummary />}

      {/* Wallet Balance - Only show when connected */}
      {isConnected && (
        <div className={layout.gridResponsive['1-2'] + ' gap-6'}>
          <Card className="relative">
            <CardHeader className="pb-2">
              <CardTitle className="text-label">Available Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-mono font-bold leading-tight relative">
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
              <div className="text-2xl font-mono font-bold leading-tight relative">
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
      )}

      {/* Active Positions */}
      {isConnected && hasPositions && (
        <div id="positions-section">
          <ActivePositionsTable
            onOperatorClick={operatorId => {
              navigate(`/operators/${operatorId}`);
            }}
          />
        </div>
      )}

      {/* Pending Operations Details */}
      {isConnected && (hasPositions || hasPendingOperations) && <PendingOperations />}

      <WalletModal open={walletModalOpen} onOpenChange={setWalletModalOpen} />
    </div>
  );
};
