import type { Operator } from '@/types/operator';
import type { OperatorRegistration } from '@/types/indexer';
import { shannonsToAI3 } from '@/lib/unit-conversions';

/**
 * Maps indexer operator data to UI operator format
 * Handles all data transformations in one place
 */
export const mapIndexerToOperator = (
  registration: OperatorRegistration,
  rpcData?: {
    currentTotalStake?: string | number | null;
    currentTotalShares?: string | number | null;
    nominationTax?: number | null;
    minimumNominatorStake?: string | number | null;
    totalStorageFeeDeposit?: string | number | null;
  },
): Operator => {
  // Convert stake amounts from shannons to AI3
  const minimumStake = registration.minimum_nominator_stake
    ? shannonsToAI3(registration.minimum_nominator_stake).toFixed(4)
    : '0.0000';

  const totalStaked = rpcData?.currentTotalStake
    ? shannonsToAI3(String(rpcData.currentTotalStake)).toFixed(4)
    : '0.0000';
  const totalStorageFund = rpcData?.totalStorageFeeDeposit
    ? shannonsToAI3(String(rpcData.totalStorageFeeDeposit)).toFixed(4)
    : '0.0000';
  const totalPoolValue = (parseFloat(totalStaked) + parseFloat(totalStorageFund)).toFixed(4);

  return {
    id: registration.id,
    name: `Operator ${registration.id}`,
    domainId: registration.domain_id,
    domainName: 'Auto EVM', // TODO: Map from domain registry when available
    ownerAccount: registration.owner,
    nominationTax: rpcData?.nominationTax ?? registration.nomination_tax,
    minimumNominatorStake: minimumStake,
    status: 'active' as const, // TODO: Derive from operator status in indexer
    totalStaked,
    totalStorageFund,
    totalPoolValue,
  };
};

/**
 * Maps RPC operator data to UI format (fallback when indexer unavailable)
 */
export const mapRpcToOperator = (
  operatorId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rpcData: any, // RPC data structure varies
): Operator | null => {
  // Skip invalid operators
  if (!rpcData || rpcData.signingKey === null || rpcData.signingKey === undefined) {
    return null;
  }

  const minimumStake = rpcData.minimumNominatorStake
    ? shannonsToAI3(rpcData.minimumNominatorStake).toFixed(4)
    : '0.0000';

  const totalStaked = rpcData.currentTotalStake
    ? shannonsToAI3(rpcData.currentTotalStake).toFixed(4)
    : '0.0000';
  const totalStorageFund = rpcData.totalStorageFeeDeposit
    ? shannonsToAI3(rpcData.totalStorageFeeDeposit).toFixed(4)
    : '0.0000';
  const totalPoolValue = (parseFloat(totalStaked) + parseFloat(totalStorageFund)).toFixed(4);

  return {
    id: operatorId,
    name: `Operator ${operatorId}`,
    domainId: String(rpcData.currentDomainId || rpcData.nextDomainId || '0'),
    domainName: 'Auto EVM',
    ownerAccount: String(rpcData.signingKey),
    nominationTax: Number(rpcData.nominationTax || 0),
    minimumNominatorStake: minimumStake,
    status: 'active' as const,
    totalStaked,
    totalStorageFund,
    totalPoolValue,
  };
};
