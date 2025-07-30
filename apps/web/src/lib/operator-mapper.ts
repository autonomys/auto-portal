import type { Operator } from '@/types/operator';
import type { OperatorRegistration } from '@/types/indexer';
import { parseTokenAmount } from '@autonomys/auto-utils';

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
  },
): Operator => {
  // Convert stake amounts from shannons to AI3
  const minimumStake = registration.minimum_nominator_stake
    ? Number(parseTokenAmount(registration.minimum_nominator_stake)).toFixed(4)
    : '0.0000';

  const totalStaked = rpcData?.currentTotalStake
    ? Number(parseTokenAmount(String(rpcData.currentTotalStake))).toFixed(4)
    : '0.0000';

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
    nominatorCount: 0, // TODO: Get from nominators query
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
    ? Number(parseTokenAmount(rpcData.minimumNominatorStake)).toFixed(4)
    : '0.0000';

  const totalStaked = rpcData.currentTotalStake
    ? Number(parseTokenAmount(rpcData.currentTotalStake)).toFixed(4)
    : '0.0000';

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
    nominatorCount: 0,
  };
};
