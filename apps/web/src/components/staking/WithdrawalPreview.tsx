import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UnifiedTransactionPreview } from '@/components/transaction/UnifiedTransactionPreview';

interface TransactionItem {
  label: string;
  value: number;
  tooltip?: string;
  isPositive?: boolean;
  isNegative?: boolean;
  loading?: boolean;
  precision?: number;
}

interface WithdrawalPreviewData {
  netStakeWithdrawal: number;
  storageFeeRefund: number;
  grossWithdrawalAmount: number;
  remainingPosition: number;
  percentage: number;
}

interface WithdrawalPreviewProps {
  withdrawalData: WithdrawalPreviewData;
  estimatedFee: number;
  feeLoading?: boolean;
  withdrawalMethod: 'all' | 'partial';
  className?: string;
}

export const WithdrawalPreview: React.FC<WithdrawalPreviewProps> = ({
  withdrawalData,
  estimatedFee,
  feeLoading = false,
  withdrawalMethod,
  className = '',
}) => {
  const items: TransactionItem[] = [
    {
      label: 'Net Stake Withdrawal',
      value: withdrawalData.netStakeWithdrawal,
      precision: 4,
    },
    {
      label: 'Storage Fee Refund',
      value: withdrawalData.storageFeeRefund,
      precision: 4,
      isPositive: true,
      tooltip: 'Storage fees are refunded proportionally based on storage fund performance.',
    },
    {
      label: 'Transaction Fee',
      value: estimatedFee,
      precision: 6,
      loading: feeLoading,
      isNegative: true,
    },
  ];

  // Add remaining position for partial withdrawals
  if (withdrawalMethod === 'partial') {
    items.push({
      label: 'Remaining Position',
      value: withdrawalData.remainingPosition,
      precision: 4,
      tooltip: 'The amount that will remain staked after this withdrawal.',
    });
  }

  const additionalInfo = (
    <div className="space-y-3">
      {/* Withdrawal Percentage */}
      <div className="flex justify-between items-center text-sm">
        <span className="text-muted-foreground font-sans">Withdrawal Percentage:</span>
        <span className="font-mono font-medium">{withdrawalData.percentage}%</span>
      </div>

      {/* Important Warning */}
      <Alert variant="warning">
        <AlertDescription>
          <span className="font-medium">Two-step process:</span> After withdrawal request, funds
          will have a locking period before you can claim them.
        </AlertDescription>
      </Alert>
    </div>
  );

  const notes = [
    'Withdrawal requests are processed according to the protocol schedule',
    'Storage fee refunds depend on storage fund performance',
    'There is a locking period before funds can be claimed',
    withdrawalMethod === 'partial'
      ? 'Remaining stake will continue earning rewards'
      : 'This will close your entire position with this operator',
  ];

  return (
    <UnifiedTransactionPreview
      type="withdrawal"
      title="Withdrawal Summary"
      items={items}
      totalLabel="Total to Receive"
      totalValue={withdrawalData.grossWithdrawalAmount}
      totalLoading={feeLoading}
      additionalInfo={additionalInfo}
      notes={notes}
      className={className}
    />
  );
};
