import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AmountInput } from '@/components/staking/AmountInput';
import { useWithdrawalTransaction } from '@/hooks/use-withdrawal-transaction';
import { useWallet } from '@/hooks/use-wallet';
import { usePositions } from '@/hooks/use-positions';
import { withdrawalService } from '@/services/withdrawal-service';
import type { WithdrawalRequest, WithdrawalPreview, UserPosition } from '@/types/position';

interface WithdrawalPageProps {
  position?: UserPosition;
  onClose?: () => void;
}

export const WithdrawalPage: React.FC<WithdrawalPageProps> = ({ position, onClose }) => {
  const { selectedAccount, injector } = useWallet();
  const { refetch: refreshPositions } = usePositions();
  const { withdrawalState, withdrawalError, withdrawalTxHash, executeWithdraw, resetWithdrawal } =
    useWithdrawalTransaction(selectedAccount, injector);

  const [selectedPosition] = useState<UserPosition | null>(position || null);
  const [withdrawalType, setWithdrawalType] = useState<'partial' | 'full'>('partial');
  const [amount, setAmount] = useState<string>('0');
  const [preview, setPreview] = useState<WithdrawalPreview | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  // Generate withdrawal preview when amount or type changes
  useEffect(() => {
    if (selectedPosition && selectedAccount && parseFloat(amount) > 0) {
      generatePreview();
    }
  }, [selectedPosition, amount, withdrawalType, selectedAccount]);

  const generatePreview = async () => {
    if (!selectedPosition || !selectedAccount) return;

    setIsLoadingPreview(true);
    try {
      const previewData = await withdrawalService.getWithdrawalPreview(
        selectedPosition.operatorId,
        parseFloat(amount),
        withdrawalType,
        selectedAccount.address,
      );
      setPreview(previewData);
    } catch (error) {
      console.error('Error generating preview:', error);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleWithdraw = async () => {
    if (!selectedPosition || !preview) return;

    const request: WithdrawalRequest = {
      operatorId: selectedPosition.operatorId,
      amount: preview.stakedAmount,
      type: withdrawalType,
    };

    await executeWithdraw(request);
  };

  const handleSuccess = () => {
    // Refresh positions to show new pending withdrawal
    refreshPositions();
    onClose?.();
  };

  const getMaxWithdrawalAmount = () => {
    return selectedPosition?.positionValue || 0;
  };

  const isValidAmount = () => {
    const maxAmount = getMaxWithdrawalAmount();
    const numAmount = parseFloat(amount);
    return numAmount > 0 && numAmount <= maxAmount;
  };

  // Handle transaction states
  useEffect(() => {
    if (withdrawalState === 'success') {
      handleSuccess();
    }
  }, [withdrawalState]);

  if (withdrawalState === 'signing') {
    return (
      <Card className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold mb-2">Sign Transaction</h3>
          <p className="text-gray-600">Please sign the withdrawal transaction in your wallet</p>
        </div>
      </Card>
    );
  }

  if (withdrawalState === 'pending') {
    return (
      <Card className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold mb-2">Processing Withdrawal</h3>
          <p className="text-gray-600">Your withdrawal is being processed...</p>
          {withdrawalTxHash && (
            <p className="text-sm text-gray-500 mt-2">Transaction Hash: {withdrawalTxHash}</p>
          )}
        </div>
      </Card>
    );
  }

  if (withdrawalState === 'error') {
    return (
      <Card className="p-6">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold mb-2 text-red-600">Withdrawal Failed</h3>
          <p className="text-gray-600 mb-4">{withdrawalError}</p>
          <Button onClick={resetWithdrawal} variant="outline">
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Withdraw Stake</h2>
          {onClose && (
            <Button variant="ghost" onClick={onClose}>
              ✕
            </Button>
          )}
        </div>

        {/* Position Selection */}
        {selectedPosition && (
          <div className="p-4 border rounded-lg bg-gray-50">
            <h3 className="font-medium mb-2">Selected Position</h3>
            <div className="text-sm text-gray-600">
              <p>Operator: {selectedPosition.operatorName}</p>
              <p>Staked Amount: {selectedPosition.positionValue.toFixed(4)} AI3</p>
              <p>Storage Deposit: {selectedPosition.storageFeeDeposit.toFixed(4)} AI3</p>
            </div>
          </div>
        )}

        {/* Withdrawal Type Selection */}
        <div className="space-y-3">
          <h3 className="font-medium">Withdrawal Type</h3>
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                value="partial"
                checked={withdrawalType === 'partial'}
                onChange={e => setWithdrawalType(e.target.value as 'partial' | 'full')}
              />
              <span>Partial Withdrawal</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                value="full"
                checked={withdrawalType === 'full'}
                onChange={e => setWithdrawalType(e.target.value as 'partial' | 'full')}
              />
              <span>Full Withdrawal</span>
            </label>
          </div>
        </div>

        {/* Amount Input */}
        {withdrawalType === 'partial' && (
          <div className="space-y-2">
            <label className="block text-sm font-medium">Amount to Withdraw</label>
            <AmountInput
              amount={amount}
              onAmountChange={setAmount}
              errors={!isValidAmount() && amount !== '0' ? ['Invalid amount'] : []}
              availableBalance={getMaxWithdrawalAmount()}
            />
            <p className="text-xs text-gray-500">
              Maximum: {getMaxWithdrawalAmount().toFixed(4)} AI3
            </p>
          </div>
        )}

        {withdrawalType === 'full' && selectedPosition && (
          <div className="p-4 border rounded-lg bg-blue-50">
            <p className="text-sm">
              Full withdrawal will withdraw your entire position of{' '}
              <strong>{selectedPosition.positionValue.toFixed(4)} AI3</strong> plus{' '}
              <strong>{selectedPosition.storageFeeDeposit.toFixed(4)} AI3</strong> storage deposit.
            </p>
          </div>
        )}

        {/* Preview */}
        {preview && (
          <Card className="p-4">
            <h3 className="font-medium mb-3">Withdrawal Preview</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Staked Amount:</span>
                <span className="font-mono">{parseFloat(preview.stakedAmount).toFixed(4)} AI3</span>
              </div>
              <div className="flex justify-between">
                <span>Storage Return:</span>
                <span className="font-mono">
                  {parseFloat(preview.storageAmount).toFixed(4)} AI3
                </span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total Withdrawal:</span>
                <span className="font-mono">{parseFloat(preview.totalAmount).toFixed(4)} AI3</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Fee:</span>
                <span className="font-mono">{parseFloat(preview.estimatedFee).toFixed(4)} AI3</span>
              </div>
              <div className="flex justify-between">
                <span>Unlock Block:</span>
                <span className="font-mono">{preview.unlockAt}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Unlock Time:</span>
                <span className="text-xs">
                  {new Date(preview.estimatedUnlockTime).toLocaleString()}
                </span>
              </div>
            </div>
          </Card>
        )}

        {/* Important Notice */}
        <div className="p-4 border-l-4 border-yellow-400 bg-yellow-50">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-yellow-400">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Two-Step Withdrawal Process</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  1. <strong>Request Withdrawal:</strong> Your funds will be locked for a waiting
                  period
                </p>
                <p>
                  2. <strong>Unlock Funds:</strong> After the waiting period, you can claim your
                  funds
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button
            onClick={handleWithdraw}
            disabled={
              !selectedPosition ||
              !preview ||
              (withdrawalType === 'partial' && !isValidAmount()) ||
              isLoadingPreview
            }
            className="flex-1"
          >
            {isLoadingPreview ? 'Loading...' : 'Request Withdrawal'}
          </Button>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
