import type { DepositRow, WithdrawalRow } from '@/types/indexer';
import type { DepositTransaction, WithdrawalTransaction } from '@/types/transactions';
import type { WithdrawalUnlockStatus } from '@/lib/withdrawal-utils';

export const deriveDepositStatus = (
  row: DepositRow,
  currentDomainEpoch?: number | null,
): DepositTransaction['status'] => {
  const pendingAmount = Number(row.pending_amount || '0');
  const pendingStorage = Number(row.pending_storage_fee_deposit || '0');
  const hasPending = pendingAmount > 0 || pendingStorage > 0;

  if (hasPending) {
    const effectiveEpoch = row.pending_effective_domain_epoch
      ? Number(row.pending_effective_domain_epoch)
      : null;

    if (typeof currentDomainEpoch !== 'number' || effectiveEpoch === null) {
      // Conservative when current epoch unknown or effective epoch missing
      return 'pending';
    }
    if (currentDomainEpoch < effectiveEpoch) {
      return 'pending';
    }
    // Effective epoch has passed → treat as complete even if indexer hasn't converted yet
    return 'complete';
  }

  const knownShares = Number(row.known_shares || '0');
  const knownStorageFee = Number(row.known_storage_fee_deposit || '0');
  if (knownShares > 0 || knownStorageFee > 0) return 'complete';
  return 'pending';
};

export const deriveWithdrawalStatus = (
  row: WithdrawalRow,
  unlockStatus?: WithdrawalUnlockStatus,
): WithdrawalTransaction['status'] => {
  const pendingCount = Number(row.total_pending_withdrawals || '0');
  if (pendingCount > 0) {
    if (unlockStatus && unlockStatus.blocksRemaining === 0) {
      return 'complete';
    }
    return 'pending';
  }
  return 'complete';
};
