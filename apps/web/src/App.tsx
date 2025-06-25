import React, { useState } from 'react';
import { Layout } from './components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OperatorsPage } from './pages/operators';
import { StakingPage } from './pages/StakingPage';
import { useBalance } from '@/hooks/use-balance';
import { formatAI3 } from '@/lib/formatting';
import './App.css';

type Page = 'dashboard' | 'operators' | 'staking';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [selectedOperatorId, setSelectedOperatorId] = useState<string | null>(null);
  const { balance } = useBalance();

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

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium font-sans">Available Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">
                {balance ? formatAI3(balance.free) : '---'}
              </div>
              <p className="text-xs text-muted-foreground font-sans">Ready to stake</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium font-sans">Total Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">
                {balance ? formatAI3(balance.total) : '---'}
              </div>
              <p className="text-xs text-muted-foreground font-sans">Free + Reserved</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium font-sans">Active Positions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">0</div>
              <p className="text-xs text-muted-foreground font-sans">Staking positions</p>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
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
      </div>
    </Layout>
  );
};

export default App;
