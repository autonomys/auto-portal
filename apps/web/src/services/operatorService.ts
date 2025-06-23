import type { Operator, OperatorDetails, OperatorStats } from '@/types/operator';

// Mock data for development
const mockOperators: Operator[] = [
  {
    id: 'op-1',
    name: 'Gemini-3h-Farmer-1',
    domainId: '0',
    domainName: 'Auto EVM',
    ownerAccount: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    nominationTax: 5,
    minimumNominatorStake: '1000',
    status: 'active',
    totalStaked: '5000000',
    nominatorCount: 42,
    currentAPY: 18.5,
    uptime: 99.2,
    poolCapacity: 75,
    isRecommended: true,
  },
  {
    id: 'op-2',
    name: 'Auto-Domain-Op-2',
    domainId: '1',
    domainName: 'Auto Consensus',
    ownerAccount: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
    nominationTax: 8,
    minimumNominatorStake: '500',
    status: 'active',
    totalStaked: '3500000',
    nominatorCount: 28,
    currentAPY: 16.8,
    uptime: 98.7,
    poolCapacity: 60,
    isRecommended: false,
  },
  {
    id: 'op-3',
    name: 'Autonomys-Validator-X',
    domainId: '0',
    domainName: 'Auto EVM',
    ownerAccount: '5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy',
    nominationTax: 12,
    minimumNominatorStake: '2000',
    status: 'active',
    totalStaked: '2800000',
    nominatorCount: 35,
    currentAPY: 15.2,
    uptime: 97.8,
    poolCapacity: 85,
    isRecommended: false,
  },
  {
    id: 'op-4',
    name: 'Secure-Node-Alpha',
    domainId: '1',
    domainName: 'Auto Consensus',
    ownerAccount: '5GNJqTPyNqANBkUVMN1LPPrxXnFouWXoe2wNSmmEoLctxiZY',
    nominationTax: 10,
    minimumNominatorStake: '1500',
    status: 'degraded',
    totalStaked: '2200000',
    nominatorCount: 19,
    currentAPY: 14.1,
    uptime: 94.5,
    poolCapacity: 90,
    isRecommended: false,
  },
];

// Mock operator details with additional information
const mockOperatorDetails: Record<string, OperatorDetails> = {
  'op-1': {
    ...mockOperators[0],
    description: 'High-performance operator with excellent uptime and competitive rewards.',
    website: 'https://gemini-farmer.autonomys.xyz',
    social: {
      twitter: '@GeminiFarmer',
      discord: 'GeminiFarmer#1234',
    },
    apyHistory: [
      { epoch: 150, apy: 18.5, timestamp: Date.now() - 86400000 },
      { epoch: 149, apy: 18.2, timestamp: Date.now() - 172800000 },
      { epoch: 148, apy: 18.8, timestamp: Date.now() - 259200000 },
    ],
    uptimeHistory: [
      { epoch: 150, uptime: 99.2, timestamp: Date.now() - 86400000 },
      { epoch: 149, uptime: 99.1, timestamp: Date.now() - 172800000 },
      { epoch: 148, uptime: 99.5, timestamp: Date.now() - 259200000 },
    ],
  },
};

export const operatorService = {
  async getAllOperators(): Promise<Operator[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return mockOperators;
  },

  async getOperatorById(_: string): Promise<OperatorDetails | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    // For now, return the first operator details as mock
    return mockOperatorDetails['op-1'] || null;
  },

  async getOperatorStats(): Promise<OperatorStats> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const totalStaked = mockOperators.reduce((sum, op) => sum + parseFloat(op.totalStaked), 0).toString();
    
    return {
      sharePrice: '1.0000',
      totalShares: totalStaked,
      totalStaked,
      nominatorCount: mockOperators.reduce((sum, op) => sum + op.nominatorCount, 0),
    };
  },
};
