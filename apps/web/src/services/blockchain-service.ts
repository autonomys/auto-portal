/**
 * Blockchain Service for Auto SDK Integration
 * Fetches real data from Autonomys blockchain
 */

import { operator, balance, domains } from '@autonomys/auto-consensus';
import { getApiConnection } from './connection-service';
import { mapRpcOperatorToUi, mapRpcOperatorToDetails } from './operator-mapper-service';
import { formatAi3 } from '@/utils/unit-conversion';
import { handleSdkError } from '@/utils/error-handling';
import type { Operator, OperatorDetails } from '@/types/operator';
import type { OperatorRpcData, DomainRpcData, BlockchainCache } from '@/types/blockchain';
import { CACHE_DURATION } from '@/types/blockchain';

// Target operators as specified in the requirements
const TARGET_OPERATORS = ['0', '1', '3'];

// Helper functions for safe type conversion
const safeToBigInt = (value: unknown, defaultValue: bigint = 0n): bigint => {
  if (value === null || value === undefined) {
    return defaultValue;
  }

  if (typeof value === 'bigint') {
    return value;
  }

  if (typeof value === 'string' || typeof value === 'number') {
    try {
      return BigInt(value);
    } catch (error) {
      console.warn('Failed to convert to BigInt:', value, error);
      return defaultValue;
    }
  }

  console.warn('Unexpected type for BigInt conversion:', typeof value, value);
  return defaultValue;
};

const safeToString = (value: unknown): string => {
  if (value === null || value === undefined) {
    return 'inactive';
  }

  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value) && value.length > 0) {
    return String(value[0]);
  }

  if (typeof value === 'object' && value.toString) {
    return value.toString();
  }

  return String(value);
};

// Simple in-memory cache
const cache: BlockchainCache = {
  operators: new Map(),
  balances: new Map(),
  domains: null,
};

export const fetchOperators = async (): Promise<Operator[]> => {
  try {
    const api = await getApiConnection();

    const operatorPromises = TARGET_OPERATORS.map(async id => {
      // Check cache first
      const cached = cache.operators.get(id);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION.OPERATORS) {
        return mapRpcOperatorToUi(cached.data, id);
      }

      try {
        console.log(`Fetching operator ${id} from blockchain`);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const operatorData = await operator(api as any, id);

        // Check if operatorData is null or undefined
        if (!operatorData) {
          console.warn(`Operator ${id} returned null/undefined from API`);
          return null;
        }

        // Log the actual data structure for debugging
        console.log(`Operator ${id} raw data:`, operatorData);

        // Safely extract and validate fields with proper type conversion
        const validatedData: OperatorRpcData = {
          signingKey: operatorData.signingKey || '',
          currentTotalStake: safeToBigInt(operatorData.currentTotalStake),
          minimumNominatorStake: safeToBigInt(operatorData.minimumNominatorStake),
          nominationTax: safeToBigInt(operatorData.nominationTax),
          status: safeToString(operatorData.status),
          currentEpochRewards: safeToBigInt(operatorData.currentEpochRewards, 0n),
          currentTotalShares: safeToBigInt(operatorData.currentTotalShares, 0n),
        };

        // Validate required fields after conversion
        if (!validatedData.signingKey) {
          console.warn(`Operator ${id} missing signingKey`);
          return null;
        }

        // Cache the result
        cache.operators.set(id, {
          data: validatedData,
          timestamp: Date.now(),
        });

        return mapRpcOperatorToUi(validatedData, id);
      } catch (error) {
        console.warn(`Failed to fetch operator ${id}:`, error);
        return null;
      }
    });

    const results = await Promise.all(operatorPromises);
    const validOperators = results.filter(Boolean) as Operator[];

    console.log(`Successfully fetched ${validOperators.length} operators`);
    return validOperators;
  } catch (error) {
    const sdkError = handleSdkError(error, 'fetch_operators');
    console.error('Failed to fetch operators:', sdkError);
    throw sdkError;
  }
};

export const fetchOperatorById = async (operatorId: string): Promise<OperatorDetails | null> => {
  try {
    const api = await getApiConnection();

    // Check cache first
    const cached = cache.operators.get(operatorId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION.OPERATORS) {
      return mapRpcOperatorToDetails(cached.data, operatorId);
    }

    console.log(`Fetching operator ${operatorId} details from blockchain`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const operatorData = await operator(api as any, operatorId);

    // Check if operatorData is null or undefined
    if (!operatorData) {
      console.warn(`Operator ${operatorId} returned null/undefined from API`);
      return null;
    }

    // Log the actual data structure for debugging
    console.log(`Operator ${operatorId} raw data:`, operatorData);

    // Safely extract and validate fields with proper type conversion
    const validatedData: OperatorRpcData = {
      signingKey: operatorData.signingKey || '',
      currentTotalStake: safeToBigInt(operatorData.currentTotalStake),
      minimumNominatorStake: safeToBigInt(operatorData.minimumNominatorStake),
      nominationTax: safeToBigInt(operatorData.nominationTax),
      status: safeToString(operatorData.status),
      currentEpochRewards: safeToBigInt(operatorData.currentEpochRewards, 0n),
      currentTotalShares: safeToBigInt(operatorData.currentTotalShares, 0n),
    };

    // Validate required fields after conversion
    if (!validatedData.signingKey) {
      console.warn(`Operator ${operatorId} missing signingKey`);
      return null;
    }

    // Cache the result
    cache.operators.set(operatorId, {
      data: validatedData,
      timestamp: Date.now(),
    });

    return mapRpcOperatorToDetails(validatedData, operatorId);
  } catch (error) {
    const sdkError = handleSdkError(error, 'fetch_operator_details');
    console.error(`Failed to fetch operator ${operatorId}:`, sdkError);
    return null;
  }
};

export const fetchUserBalance = async (address: string): Promise<string> => {
  try {
    // Check cache first
    const cached = cache.balances.get(address);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION.BALANCES) {
      return formatAi3(cached.data.free.toString());
    }

    const api = await getApiConnection();
    console.log(`Fetching balance for address ${address}`);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const balanceData = await balance(api as any, address);

    if (!balanceData) {
      console.warn(`Balance not found for address ${address}`);
      return '0';
    }

    // Cache the result
    cache.balances.set(address, {
      data: balanceData,
      timestamp: Date.now(),
    });

    return formatAi3(balanceData.free.toString());
  } catch (error) {
    const sdkError = handleSdkError(error, 'fetch_balance');
    console.error(`Failed to fetch balance for ${address}:`, sdkError);
    return '0';
  }
};

export const fetchDomains = async (): Promise<DomainRpcData[]> => {
  try {
    // Check cache first
    if (cache.domains && Date.now() - cache.domains.timestamp < CACHE_DURATION.DOMAINS) {
      return cache.domains.data;
    }

    const api = await getApiConnection();
    console.log('Fetching domains from blockchain');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const domainsData = await domains(api as any);

    if (!domainsData) {
      console.warn('No domains found');
      return [];
    }

    // Cache the result - store as unknown first, then cast as needed
    cache.domains = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: domainsData as any,
      timestamp: Date.now(),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return domainsData as any;
  } catch (error) {
    const sdkError = handleSdkError(error, 'fetch_domains');
    console.error('Failed to fetch domains:', sdkError);
    return [];
  }
};

export const clearCache = (): void => {
  cache.operators.clear();
  cache.balances.clear();
  cache.domains = null;
  console.log('Blockchain cache cleared');
};

export const getCacheStats = () => {
  return {
    operators: cache.operators.size,
    balances: cache.balances.size,
    domains: cache.domains ? 1 : 0,
    lastUpdated: {
      operators: Math.max(...Array.from(cache.operators.values()).map(v => v.timestamp)),
      balances: Math.max(...Array.from(cache.balances.values()).map(v => v.timestamp)),
      domains: cache.domains?.timestamp || 0,
    },
  };
};
