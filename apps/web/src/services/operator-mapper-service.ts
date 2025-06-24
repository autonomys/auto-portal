/**
 * Operator Mapper Service
 * Maps RPC data from Auto SDK to UI types
 */

import { formatAi3 } from '@/utils/unit-conversion';
import type { Operator, OperatorDetails } from '@/types/operator';
import type { OperatorRpcData } from '@/types/blockchain';

export type OperatorStatus = 'active' | 'inactive' | 'slashed' | 'degraded';

export const mapRpcOperatorToUi = (rpcOperator: OperatorRpcData, operatorId: string): Operator => {
  const totalStaked = formatAi3(rpcOperator.currentTotalStake.toString());
  const minimumStake = formatAi3(rpcOperator.minimumNominatorStake.toString());
  const commissionRate = Number(rpcOperator.nominationTax) / 100;

  return {
    id: operatorId,
    name: `Operator ${operatorId}`,
    domainId: '0',
    domainName: 'Auto EVM',
    totalStaked,
    nominatorCount: calculateNominatorCount(rpcOperator), // Approximation
    status: mapOperatorStatus(rpcOperator.status),
    minimumNominatorStake: minimumStake,
    ownerAccount: rpcOperator.signingKey,
    nominationTax: Number(rpcOperator.nominationTax),
    currentAPY: calculateAPY(rpcOperator), // Approximation
    poolCapacity: calculatePoolCapacity(rpcOperator), // Approximation
    isRecommended: determineRecommendation(rpcOperator, commissionRate),
  };
};

export const mapRpcOperatorToDetails = (
  rpcOperator: OperatorRpcData,
  operatorId: string,
): OperatorDetails => {
  const baseOperator = mapRpcOperatorToUi(rpcOperator, operatorId);

  return {
    ...baseOperator,
    description: `Operator ${operatorId} on Auto EVM domain`,
    website: '',
    social: {},
    apyHistory: [], // Will need separate calculation from indexer
  };
};

const mapOperatorStatus = (rpcStatus: string): OperatorStatus => {
  switch (rpcStatus.toLowerCase()) {
    case 'active':
      return 'active';
    case 'slashed':
      return 'slashed';
    case 'deregistered':
      return 'inactive';
    case 'pending_slash':
      return 'degraded';
    default:
      console.warn(`Unknown operator status: ${rpcStatus}, defaulting to inactive`);
      return 'inactive';
  }
};

const calculateNominatorCount = (rpcOperator: OperatorRpcData): number => {
  // Approximation based on total stake and minimum stake
  const totalStake = Number(rpcOperator.currentTotalStake);
  const minStake = Number(rpcOperator.minimumNominatorStake);

  if (minStake === 0) return 0;

  // Rough estimate: assume average stake is 2x minimum
  return Math.floor(totalStake / (minStake * 2));
};

const calculateAPY = (rpcOperator: OperatorRpcData): number => {
  // Approximation - would need epoch data for accurate calculation
  const totalStake = Number(rpcOperator.currentTotalStake);
  const rewards = Number(rpcOperator.currentEpochRewards || 0n);

  if (totalStake === 0) return 0;

  // Very rough approximation: assume 365 epochs per year
  const dailyReturn = rewards / totalStake;
  return dailyReturn * 365 * 100; // Convert to percentage
};

const calculatePoolCapacity = (rpcOperator: OperatorRpcData): number => {
  // Approximation - would need max pool size from chain config
  const totalStake = Number(rpcOperator.currentTotalStake);
  const estimatedMaxPool = 10000000; // 10M AI3 approximation

  return Math.min((totalStake / estimatedMaxPool) * 100, 100);
};

const determineRecommendation = (rpcOperator: OperatorRpcData, commissionRate: number): boolean => {
  // Simple algorithm: recommend if active, low commission, and reasonable stake
  const isActive = rpcOperator.status.toLowerCase() === 'active';
  const lowCommission = commissionRate < 0.1; // Less than 10%
  const hasStake = Number(rpcOperator.currentTotalStake) > 1000000; // More than 1M AI3

  return isActive && lowCommission && hasStake;
};
