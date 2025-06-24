import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { OperatorSummary, StakingForm } from '@/components/staking';
import { Layout } from '@/components/layout';
import { useOperatorStore } from '@/stores/operator-store';
import type { Operator } from '@/types/operator';

interface StakingPageProps {
  operatorId: string;
  onBack: () => void;
  onNavigate: (page: 'dashboard' | 'operators') => void;
  currentPage: 'dashboard' | 'operators';
}

export const StakingPage: React.FC<StakingPageProps> = ({
  operatorId,
  onBack,
  onNavigate,
  currentPage,
}) => {
  const { operators, loading, error, fetchOperators } = useOperatorStore();
  const [operator, setOperator] = useState<Operator | null>(null);
  const [stakingSuccess, setStakingSuccess] = useState(false);
  const [stakedAmount, setStakedAmount] = useState<string>('');

  useEffect(() => {
    if (operators.length === 0 && !loading) {
      fetchOperators();
    }
  }, [operators.length, loading, fetchOperators]);

  useEffect(() => {
    const foundOperator = operators.find(op => op.id === operatorId);
    if (foundOperator) {
      setOperator(foundOperator);
    }
  }, [operators, operatorId]);

  const handleStakingSubmit = (amount: string) => {
    setStakedAmount(amount);
    setStakingSuccess(true);
  };

  const handleBackToDashboard = () => {
    onNavigate('dashboard');
  };

  // Loading state
  if (loading || !operator) {
    return (
      <Layout className="py-12" onNavigate={onNavigate} currentPage={currentPage}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-4 mb-8">
            <Button variant="outline" onClick={onBack} className="font-sans">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-muted-foreground font-sans">Loading operator details...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // Error state
  if (error) {
    return (
      <Layout className="py-12" onNavigate={onNavigate} currentPage={currentPage}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-4 mb-8">
            <Button variant="outline" onClick={onBack} className="font-sans">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-destructive font-sans">Error: {error}</p>
                <Button
                  variant="outline"
                  onClick={() => fetchOperators()}
                  className="mt-4 font-sans"
                >
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // Success state
  if (stakingSuccess) {
    return (
      <Layout className="py-12" onNavigate={onNavigate} currentPage={currentPage}>
        <div className="max-w-2xl mx-auto">
          <Card className="text-center">
            <CardContent className="pt-8 pb-8">
              <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-success-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
                Staking Successful!
              </h2>
              <p className="text-muted-foreground font-sans mb-6">
                You have successfully staked {stakedAmount} AI3 to {operator.name}. Your stake will
                become active after the next epoch (~10 minutes).
              </p>
              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={onBack} className="font-sans">
                  Browse More Operators
                </Button>
                <Button onClick={handleBackToDashboard} className="font-sans">
                  View Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // Main staking form
  return (
    <Layout className="py-12" onNavigate={onNavigate} currentPage={currentPage}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Button variant="outline" onClick={onBack} className="font-sans">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="h-6 w-px bg-border"></div>
          <h1 className="text-xl font-serif font-semibold text-foreground">
            Stake to {operator.name}
          </h1>
        </div>

        {/* Operator Summary */}
        <OperatorSummary operator={operator} />

        {/* Staking Form */}
        <StakingForm operator={operator} onCancel={onBack} onSubmit={handleStakingSubmit} />
      </div>
    </Layout>
  );
};
