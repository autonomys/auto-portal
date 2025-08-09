import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TransactionSuccess } from '@/components/transaction';
import { WithdrawalForm } from '@/components/staking';
import { useOperators } from '@/hooks/use-operators';
import { usePositions } from '@/hooks/use-positions';
import { formatAI3 } from '@/lib/formatting';
import type { Operator } from '@/types/operator';
import type { UserPosition } from '@/types/position';

export const WithdrawalPage: React.FC = () => {
  const { operatorId } = useParams<{ operatorId: string }>();
  const navigate = useNavigate();
  const { allOperators: operators, loading: operatorsLoading } = useOperators();
  const { positions, loading: positionsLoading } = usePositions();

  const [operator, setOperator] = useState<Operator | null>(null);
  const [position, setPosition] = useState<UserPosition | null>(null);
  const [withdrawalSuccess, setWithdrawalSuccess] = useState(false);
  const [withdrawnAmount, setWithdrawnAmount] = useState<string>('');
  const [withdrawalTxHash, setWithdrawalTxHash] = useState<string | null>(null);

  useEffect(() => {
    if (operators.length > 0 && operatorId) {
      const foundOperator = operators.find(op => op.id === operatorId);
      if (foundOperator) {
        setOperator(foundOperator);
      }
    }
  }, [operators, operatorId]);

  useEffect(() => {
    if (positions.length > 0 && operatorId) {
      const foundPosition = positions.find(pos => pos.operatorId === operatorId);
      if (foundPosition) {
        setPosition(foundPosition);
      }
    }
  }, [positions, operatorId]);

  const handleWithdrawalSubmit = (amount: string, txHash?: string) => {
    setWithdrawnAmount(amount);
    setWithdrawalTxHash(txHash || null);
    setWithdrawalSuccess(true);
  };

  const handleWithdrawalSuccess = (actualWithdrawalAmount: number, txHash?: string) => {
    const formattedAmount = formatAI3(actualWithdrawalAmount, 4);
    handleWithdrawalSubmit(formattedAmount, txHash);
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleGoBack = () => {
    navigate('/dashboard');
  };

  // Only show the loading screen before initial data is available
  const loading = (operatorsLoading && !operator) || (positionsLoading && !position);
  const hasError = !operator || !position;

  // Loading state
  if (loading) {
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
              <p className="text-muted-foreground font-sans">Loading withdrawal details...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (hasError) {
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
              <p className="text-destructive font-sans">
                {!operator ? 'Operator not found' : 'Position not found'}
              </p>
              <Button variant="outline" onClick={handleGoBack} className="mt-4 font-sans">
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (withdrawalSuccess) {
    return (
      <TransactionSuccess
        title="Withdrawal Successful!"
        description={`You have successfully withdrawn ${withdrawnAmount} from ${operator!.name}. Your withdrawal will be processed according to the protocol's withdrawal schedule.`}
        txHash={withdrawalTxHash ?? undefined}
        onPrimaryAction={handleBackToDashboard}
        onSecondaryAction={handleGoBack}
        primaryActionText="View Dashboard"
        secondaryActionText="Back to Dashboard"
      />
    );
  }

  // Main withdrawal form
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
          Withdraw from {operator!.name}
        </h1>
      </div>

      {/* Position Summary */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-serif font-semibold text-foreground mb-2">Operator</h3>
              <p className="text-lg font-medium">{operator!.name}</p>
            </div>
            <div className="md:col-span-2">
              <h3 className="font-serif font-semibold text-foreground mb-2">Total Position</h3>
              <p className="text-2xl font-mono font-bold text-foreground">
                {formatAI3(position!.positionValue + position!.storageFeeDeposit, 4)}
              </p>
              <p className="text-sm text-muted-foreground">
                Includes storage fund; hover breakdown shown in the withdrawal preview
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Withdrawal Form */}
      <WithdrawalForm
        position={position!}
        onCancel={handleGoBack}
        onSuccess={handleWithdrawalSuccess}
      />
    </div>
  );
};
