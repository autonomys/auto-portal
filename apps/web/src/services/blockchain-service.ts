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
  // More aggressive null/undefined checking
  if (value === null || value === undefined || value === '') {
    console.log('safeToBigInt: null/undefined/empty value, using default:', defaultValue);
    return defaultValue;
  }
  
  // Already a BigInt
  if (typeof value === 'bigint') {
    return value;
  }
  
  // Handle string and number types
  if (typeof value === 'string' || typeof value === 'number') {
    // Additional check for empty strings or NaN
    if (value === '' || (typeof value === 'number' && isNaN(value))) {
      console.log('safeToBigInt: empty string or NaN, using default:', defaultValue);
      return defaultValue;
    }
    
    try {
      const result = BigInt(value);
      console.log('safeToBigInt: converted', value, 'to', result);
      return result;
    } catch (error) {
      console.warn('safeToBigInt: Failed to convert to BigInt:', value, error);
      return defaultValue;
    }
  }
  
  // Handle objects that might have toString or valueOf methods
  if (typeof value === 'object' && value !== null) {
    console.log('safeToBigInt: object value, trying toString:', value);
    
    try {
      // Try to convert object to string first
      const stringValue = String(value);
      if (stringValue && stringValue !== '[object Object]') {
        return BigInt(stringValue);
      }
    } catch (error) {
      console.warn('safeToBigInt: Failed to convert object to BigInt:', value, error);
    }
  }
  
  console.warn('safeToBigInt: Unexpected type for BigInt conversion:', typeof value, value, 'using default:', defaultValue);
  return defaultValue;
};

const safeToString = (value: unknown): string => {
  if (value === null || value === undefined) {
    console.log('safeToString: null/undefined value, using default: inactive');
    return 'inactive';
  }

  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value)) {
    if (value.length > 0) {
      console.log('safeToString: array value, using first element:', value[0]);
      return String(value[0]);
    } else {
      console.log('safeToString: empty array, using default: inactive');
      return 'inactive';
    }
  }

  if (typeof value === 'object' && value !== null) {
    try {
      const stringValue = String(value);
      console.log('safeToString: object value converted to:', stringValue);
      return stringValue;
    } catch (error) {
      console.warn('safeToString: Failed to convert object to string:', value, error);
      return 'inactive';
    }
  }

  const result = String(value);
  console.log('safeToString: converted', value, 'to', result);
  return result;
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
        
        let operatorData;
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          operatorData = await operator(api as any, id);
        } catch (sdkError) {
          // Auto SDK throws errors for non-existent operators instead of returning null
          console.warn(`Auto SDK error for operator ${id}:`, sdkError);
          
          // Check if this is a "null signingKey" error (operator doesn't exist)
          if (sdkError instanceof Error && sdkError.message.includes('signingKey')) {
            console.warn(`Operator ${id} does not exist on testnet`);
            return null;
          }
          
          // Re-throw other SDK errors
          throw sdkError;
        }

        // Check if operatorData is null or undefined
        if (!operatorData) {
          console.warn(`Operator ${id} returned null/undefined from API`);
          return null;
        }

        // Log the actual data structure for debugging
        console.log(`Operator ${id} raw data:`, operatorData);
        console.log(`Operator ${id} data type:`, typeof operatorData);
        console.log(`Operator ${id} is null:`, operatorData === null);
        console.log(`Operator ${id} is undefined:`, operatorData === undefined);
        
        if (operatorData && typeof operatorData === 'object') {
          console.log(`Operator ${id} keys:`, Object.keys(operatorData));
          
          // Log each field with detailed type info
          const expectedFields = ['signingKey', 'currentTotalStake', 'minimumNominatorStake', 'nominationTax', 'status'];
          expectedFields.forEach(field => {
            const value = (operatorData as any)[field];
            console.log(`Operator ${id} ${field}:`, {
              value,
              type: typeof value,
              constructor: value?.constructor?.name,
              isNull: value === null,
              isUndefined: value === undefined,
            });
          });
        }

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
    
    let operatorData;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      operatorData = await operator(api as any, operatorId);
    } catch (sdkError) {
      // Auto SDK throws errors for non-existent operators instead of returning null
      console.warn(`Auto SDK error for operator ${operatorId}:`, sdkError);
      
      // Check if this is a "null signingKey" error (operator doesn't exist)
      if (sdkError instanceof Error && sdkError.message.includes('signingKey')) {
        console.warn(`Operator ${operatorId} does not exist on testnet`);
        return null;
      }
      
      // Re-throw other SDK errors
      throw sdkError;
    }

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
