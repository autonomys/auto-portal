import React, { useState } from 'react';
import { Layout } from './components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OperatorsPage } from './pages/operators';
import { StakingPage } from './pages/StakingPage';
import { PositionSummary, ActivePositionsTable, PendingOperations } from '@/components/positions';
import { useBalance } from '@/hooks/use-balance';
import { usePositions } from '@/hooks/use-positions';
import { formatAI3 } from '@/lib/formatting';
import './App.css';

type Page = 'dashboard' | 'operators' | 'staking';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [selectedOperatorId, setSelectedOperatorId] = useState<string | null>(null);
  const { balance, loading: balanceLoading } = useBalance();
  const { hasPositions } = usePositions();

  const handleStakeOperator = (operatorId: string) => {
    setSelectedOperatorId(operatorId);
    setCurrentPage('staking');
  };

  const handleBackFromStaking = () => {
    setCurrentPage('operators');
  };

  const handleNavigate = (page: 'dashboard' | 'operators') => {
    setCurrentPage(page);
  };

  // Map internal page state to what Layout expects
  const getLayoutCurrentPage = (): 'dashboard' | 'operators' => {
    return currentPage === 'staking' ? 'operators' : currentPage;
  };

  if (currentPage === 'staking' && selectedOperatorId) {
    return (
      <StakingPage
        operatorId={selectedOperatorId}
        onBack={handleBackFromStaking}
        onNavigate={handleNavigate}
        currentPage="operators"
      />
    );
  }

  if (currentPage === 'operators') {
    return (
      <OperatorsPage
        onBack={() => setCurrentPage('dashboard')}
        onNavigate={handleNavigate}
        currentPage={currentPage}
        onStake={handleStakeOperator}
        onViewDetails={operatorId => {
          console.log('View details for operator:', operatorId);
          // TODO: Navigate to operator details
        }}
      />
    );
  }

  return (
    <Layout className="py-12" onNavigate={handleNavigate} currentPage={getLayoutCurrentPage()}>
      <div className="space-y-12">
        {/* Page Header */}
        <div className="border-b border-border pb-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-serif font-bold text-foreground mb-3">Dashboard</h1>
            <p className="text-lg text-muted-foreground font-sans leading-relaxed">
              Manage your staking positions and discover operators
            </p>
          </div>
        </div>

        {/* Portfolio Summary */}
        <PositionSummary />

        {/* Wallet Balance - Only show available balance alongside position data */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="relative">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium font-sans">Available Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono relative">
                <span className={`${balanceLoading ? 'opacity-60' : ''}`}>
                  {balance ? formatAI3(balance.free) : '0.00 AI3'}
                </span>
                {balanceLoading && (
                  <div className="absolute -top-1 -right-1">
                    <div className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground font-sans">Ready to stake</p>
            </CardContent>
          </Card>

          <Card className="relative">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium font-sans">Total Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono relative">
                <span className={`${balanceLoading ? 'opacity-60' : ''}`}>
                  {balance ? formatAI3(balance.total) : '0.00 AI3'}
                </span>
                {balanceLoading && (
                  <div className="absolute -top-1 -right-1">
                    <div className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground font-sans">Free + Reserved</p>
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
                <CardTitle className="mb-2 font-serif">Start Staking</CardTitle>
                <CardDescription className="mb-4 font-sans">
                  Browse available operators and choose the best fit for your staking strategy
                </CardDescription>
                <Button size="lg" className="font-sans" onClick={() => setCurrentPage('operators')}>
                  Browse Operators
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default App;
