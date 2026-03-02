import { nominatorPosition } from '@autonomys/auto-consensus';
import { shannonsToAi3 } from '@autonomys/auto-utils';
import type {
  UserPosition,
  PortfolioSummary,
  PendingDeposit,
  PendingWithdrawal,
} from '@/types/position';
import { getSharedApiConnection } from './api-service';
import { chainPulseClient } from './chain-pulse-client';

export const positionService = async (networkId?: string) => {
  const getPositionStatus = (
    pendingDeposit: PendingDeposit | null,
    pendingWithdrawals: PendingWithdrawal[],
  ): 'active' | 'pending' | 'withdrawing' => {
    if (pendingWithdrawals.length > 0) return 'withdrawing';
    if (pendingDeposit) return 'pending';
    return 'active';
  };

  const calculatePortfolioSummary = (positions: UserPosition[]): PortfolioSummary => {
    const totalValue = positions.reduce((sum, pos) => {
      const pendingAmount = pos.pendingDeposit ? pos.pendingDeposit.amount : 0;
      return sum + pos.positionValue + pos.storageFeeDeposit + pendingAmount;
    }, 0);

    const totalStorageFee = positions.reduce((sum, pos) => sum + pos.storageFeeDeposit, 0);

    return {
      totalValue,
      activePositions: positions.length,
      totalEarned: 0,
      pendingDeposits: positions.reduce((sum, pos) => sum + (pos.pendingDeposit ? 1 : 0), 0),
      pendingWithdrawals: positions.reduce((sum, pos) => sum + pos.pendingWithdrawals.length, 0),
      totalStorageFee,
    };
  };

  const getAllPositions = async (address: string): Promise<UserPosition[]> => {
    const api = await getSharedApiConnection(networkId);
    const operatorIds = await chainPulseClient.getNominatorOperatorIds(address);
    const now = new Date();

    const results = await Promise.allSettled(
      operatorIds.map(async operatorId => {
        const pos = await nominatorPosition(api, operatorId, address);

        // Skip positions with no activity
        const hasContent =
          pos.currentStakedValue > 0n ||
          pos.totalShares > 0n ||
          pos.pendingDeposit !== null ||
          pos.pendingWithdrawals.length > 0 ||
          pos.storageFeeDeposit.totalDeposited > 0n;
        if (!hasContent) return null;

        const pendingDeposit: PendingDeposit | null = pos.pendingDeposit
          ? {
              amount: parseFloat(shannonsToAi3(pos.pendingDeposit.amount)),
              effectiveEpoch: pos.pendingDeposit.effectiveEpoch,
            }
          : null;

        const pendingWithdrawals: PendingWithdrawal[] = pos.pendingWithdrawals.map(w => {
          const stakeWithdrawalAmount = parseFloat(shannonsToAi3(w.stakeWithdrawalAmount));
          const storageFeeRefund = parseFloat(shannonsToAi3(w.storageFeeRefund));
          return {
            grossWithdrawalAmount: stakeWithdrawalAmount + storageFeeRefund,
            stakeWithdrawalAmount,
            storageFeeRefund,
            unlockAtBlock: w.unlockAtBlock,
          };
        });

        return {
          operatorId,
          operatorName: `Operator ${operatorId}`,
          positionValue: parseFloat(shannonsToAi3(pos.currentStakedValue)),
          storageFeeDeposit: parseFloat(shannonsToAi3(pos.storageFeeDeposit.totalDeposited)),
          pendingDeposit,
          pendingWithdrawals,
          status: getPositionStatus(pendingDeposit, pendingWithdrawals),
          lastUpdated: now,
        } satisfies UserPosition;
      }),
    );

    return results
      .filter((r): r is PromiseFulfilledResult<UserPosition | null> => r.status === 'fulfilled')
      .map(r => r.value)
      .filter((p): p is UserPosition => p !== null);
  };

  const getPositionByOperator = async (
    address: string,
    operatorId: string,
  ): Promise<UserPosition | null> => {
    const api = await getSharedApiConnection(networkId);
    const now = new Date();
    const pos = await nominatorPosition(api, operatorId, address);

    const hasContent =
      pos.currentStakedValue > 0n ||
      pos.totalShares > 0n ||
      pos.pendingDeposit !== null ||
      pos.pendingWithdrawals.length > 0 ||
      pos.storageFeeDeposit.totalDeposited > 0n;
    if (!hasContent) return null;

    const pendingDeposit: PendingDeposit | null = pos.pendingDeposit
      ? {
          amount: parseFloat(shannonsToAi3(pos.pendingDeposit.amount)),
          effectiveEpoch: pos.pendingDeposit.effectiveEpoch,
        }
      : null;

    const pendingWithdrawals: PendingWithdrawal[] = pos.pendingWithdrawals.map(w => {
      const stakeWithdrawalAmount = parseFloat(shannonsToAi3(w.stakeWithdrawalAmount));
      const storageFeeRefund = parseFloat(shannonsToAi3(w.storageFeeRefund));
      return {
        grossWithdrawalAmount: stakeWithdrawalAmount + storageFeeRefund,
        stakeWithdrawalAmount,
        storageFeeRefund,
        unlockAtBlock: w.unlockAtBlock,
      };
    });

    return {
      operatorId,
      operatorName: `Operator ${operatorId}`,
      positionValue: parseFloat(shannonsToAi3(pos.currentStakedValue)),
      storageFeeDeposit: parseFloat(shannonsToAi3(pos.storageFeeDeposit.totalDeposited)),
      pendingDeposit,
      pendingWithdrawals,
      status: getPositionStatus(pendingDeposit, pendingWithdrawals),
      lastUpdated: now,
    } satisfies UserPosition;
  };

  return {
    calculatePortfolioSummary,
    getAllPositions,
    getPositionByOperator,
  };
};
