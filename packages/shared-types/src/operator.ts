// Operator-related types shared between frontend and backend

export interface Operator {
  id: string;
  address: string;
  domainId: string;
  signingKey: string;
  minimumNominatorStake: bigint;
  nominationTax: number;
  totalStake: bigint;
  totalShares: bigint;
  status: 'active' | 'deregistered' | 'slashed';
  registrationBlockHeight: bigint;
  deregistrationBlockHeight?: bigint;
}

export interface OperatorStats {
  totalRewardsCollected: bigint;
  totalTaxCollected: bigint;
  bundleCount: number;
  nominatorCount: number;
  averageNominatorStake: bigint;
  sharePrice: bigint;
}

export interface OperatorEpochData {
  operatorId: string;
  domainId: string;
  epochIndex: number;
  sharePrice: bigint;
  totalStake: bigint;
  totalShares: bigint;
  rewards: bigint;
  timestamp: Date;
}

export interface OperatorFilter {
  domainId?: string;
  minStake?: bigint;
  maxTax?: number;
  status?: Operator['status'][];
  sortBy?: 'stake' | 'rewards' | 'nominators' | 'sharePrice';
  sortOrder?: 'asc' | 'desc';
}
