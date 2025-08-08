import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { OperatorSummary, StakingForm } from '@/components/staking';
import { TransactionSuccess } from '@/components/transaction';
import { useOperators } from '@/hooks/use-operators';
import type { Operator } from '@/types/operator';

export const StakingPage: React.FC = () => {
  const { operatorId } = useParams<{ operatorId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { allOperators: operators, loading, error, refetch: fetchOperators } = useOperators();
  const [operator, setOperator] = useState<Operator | null>(null);
  const [stakingSuccess, setStakingSuccess] = useState(false);
  const [stakedAmount, setStakedAmount] = useState<string>('');
  const [stakingTxHash, setStakingTxHash] = useState<string | null>(null);

  // Check if coming from a position (adding more stake)
  const fromPosition = searchParams.get('fromPosition') === 'true';

  useEffect(() => {
    const foundOperator = operators.find(op => op.id === operatorId);
    if (foundOperator) {
      setOperator(foundOperator);
    }
  }, [operators, operatorId]);

  const handleStakingSubmit = (amount: string, txHash?: string) => {
    setStakedAmount(amount);
    setStakingTxHash(txHash || null);
    setStakingSuccess(true);
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleGoBack = () => {
    // If coming from a position, go back to dashboard; otherwise go to operators
    navigate(fromPosition ? '/dashboard' : '/operators');
  };

  // Loading state
  if (loading || !operator || !operatorId) {
    return (
      <div className="py-12 max-w-4xl mx-auto">
        <div className="flex items-center space-x-4 mb-8">
          <Button variant="outline" onClick={handleGoBack} className="font-sans">
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
    );
  }

  // Error state
  if (error) {
    return (
      <div className="py-12 max-w-4xl mx-auto">
        <div className="flex items-center space-x-4 mb-8">
          <Button variant="outline" onClick={handleGoBack} className="font-sans">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-destructive font-sans">Error: {error}</p>
              <Button variant="outline" onClick={() => fetchOperators()} className="mt-4 font-sans">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (stakingSuccess) {
    return (
      <TransactionSuccess
        title="Staking Successful!"
        description={`You have successfully staked ${stakedAmount} AI3 to ${operator.name}. Your stake will become active after the next epoch transition (~10 minutes).`}
        txHash={stakingTxHash ?? undefined}
        onPrimaryAction={handleBackToDashboard}
        onSecondaryAction={handleGoBack}
        primaryActionText="View Dashboard"
        secondaryActionText="Browse More Operators"
      />
    );
  }

  // Main staking form
  return (
    <div className="py-12 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <Button variant="outline" onClick={handleGoBack} className="font-sans">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="h-6 w-px bg-border"></div>
        <h1 className="text-xl font-serif font-semibold text-foreground">
          {fromPosition ? `Add Stake to ${operator.name}` : `Stake to ${operator.name}`}
        </h1>
      </div>

      {/* Operator Summary */}
      <OperatorSummary operator={operator} />

      {/* Staking Form */}
      <StakingForm operator={operator} onCancel={handleGoBack} onSubmit={handleStakingSubmit} />
    </div>
  );
};
