import type { Operator, OperatorStats } from '@/types/operator';

// Mock data for development - replace with actual RPC calls later
const MOCK_OPERATORS: Operator[] = [
  {
    id: '1',
    name: 'Gemini-3h-Farmer-1',
    domainId: '0',
    domainName: 'Auto EVM',
    ownerAccount: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    nominationTax: 5,
    minimumNominatorStake: '10',
    status: 'active',
    totalStaked: '12450',
    nominatorCount: 23,
    currentAPY: 18.5,
    uptime: 99.2,
    poolCapacity: 75,
    isRecommended: true,
  },
  {
    id: '2',
    name: 'Auto-Domain-Op-2',
    domainId: '0',
    domainName: 'Auto EVM',
    ownerAccount: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
    nominationTax: 8,
    minimumNominatorStake: '50',
    status: 'active',
    totalStaked: '8920',
    nominatorCount: 15,
    currentAPY: 17.8,
    uptime: 98.7,
    poolCapacity: 60,
    isRecommended: true,
  },
  {
    id: '3',
    name: 'Autonomys-Validator-X',
    domainId: '0',
    domainName: 'Auto EVM',
    ownerAccount: '5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y',
    nominationTax: 10,
    minimumNominatorStake: '25',
    status: 'degraded',
    totalStaked: '15600',
    nominatorCount: 45,
    currentAPY: 16.9,
    uptime: 97.1,
    poolCapacity: 85,
    isRecommended: false,
  },
  {
    id: '4',
    name: 'Secure-Node-Alpha',
    domainId: '0',
    domainName: 'Auto EVM',
    ownerAccount: '5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy',
    nominationTax: 12,
    minimumNominatorStake: '100',
    status: 'active',
    totalStaked: '22180',
    nominatorCount: 67,
    currentAPY: 16.2,
    uptime: 99.8,
    poolCapacity: 90,
    isRecommended: false,
  },
];

export class OperatorService {
  private rpcUrl: string;
  private initialized: boolean = false;

  constructor(rpcUrl: string = 'wss://rpc.taurus.autonomys.xyz/ws') {
    this.rpcUrl = rpcUrl;
  }

  async initialize(): Promise<void> {
    // TODO: Initialize actual RPC connection with Auto SDK
    this.initialized = true;
  }

  /**
   * Get all registered operators
   */
  async getOperators(): Promise<Operator[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // TODO: Replace with actual RPC calls
    return [...MOCK_OPERATORS];
  }

  /**
   * Get operator details by ID
   */
  async getOperatorById(operatorId: string): Promise<Operator | null> {
    if (!this.initialized) {
      await this.initialize();
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const operator = MOCK_OPERATORS.find(op => op.id === operatorId);
    return operator || null;
  }

  /**
   * Get operator pool statistics
   */
  async getOperatorStats(operatorId: string): Promise<OperatorStats> {
    if (!this.initialized) {
      await this.initialize();
    }

    const operator = MOCK_OPERATORS.find(op => op.id === operatorId);

    if (!operator) {
      throw new Error(`Operator ${operatorId} not found`);
    }

    return {
      sharePrice: '1.0000',
      totalShares: operator.totalStaked,
      totalStaked: operator.totalStaked,
      nominatorCount: operator.nominatorCount,
    };
  }

  /**
   * Refresh operator data (simulate real-time updates)
   */
  async refreshOperatorData(operatorId: string): Promise<void> {
    // TODO: Implement refresh logic with actual RPC calls
    await new Promise(resolve => setTimeout(resolve, 200));
  }
}

// Create singleton instance
export const operatorService = new OperatorService();

// Export helper functions for direct use
export const operatorServiceHelpers = {
  /**
   * Calculate APY from on-chain reward data
   */
  async getOperatorAPY(operatorId: string): Promise<number> {
    const operator = await operatorService.getOperatorById(operatorId);
    return operator?.currentAPY || 0;
  },

  /**
   * Estimate uptime from block production
   */
  async getOperatorUptime(operatorId: string): Promise<number> {
    const operator = await operatorService.getOperatorById(operatorId);
    return operator?.uptime || 0;
  },
};
