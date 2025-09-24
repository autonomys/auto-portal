import type { Operator } from '@/types/operator';
import { shannonsToAi3 } from '@autonomys/auto-utils';
import type { OperatorDetails } from '@autonomys/auto-consensus';

/**
 * Maps RPC operator data to UI format (fallback when indexer unavailable)
 */
export const mapRpcToOperator = (operatorId: string, rpcData: OperatorDetails): Operator | null => {
  // Skip invalid operators
  if (!rpcData || rpcData.signingKey === null || rpcData.signingKey === undefined) {
    return null;
  }

  const minimumStake =
    rpcData.minimumNominatorStake != null
      ? shannonsToAi3(String(rpcData.minimumNominatorStake))
      : '0';

  // Normalize to bigint once for stake-related values
  const stakeShannons = BigInt(String(rpcData.currentTotalStake ?? 0));
  const storageShannons = BigInt(String(rpcData.totalStorageFeeDeposit ?? 0));
  const totalStaked = shannonsToAi3(stakeShannons);
  const totalStorageFund = shannonsToAi3(storageShannons);
  const totalPoolValue = shannonsToAi3(stakeShannons + storageShannons);

  return {
    id: operatorId,
    name: `Operator ${operatorId}`,
    domainId: String(rpcData.currentDomainId ?? rpcData.nextDomainId ?? 0),
    domainName: 'Auto EVM',
    ownerAccount: String(rpcData.signingKey),
    nominationTax: Number(rpcData.nominationTax ?? 0),
    minimumNominatorStake: minimumStake,
    status: 'active' as const,
    totalStaked,
    totalStorageFund,
    totalPoolValue,
  };
};
