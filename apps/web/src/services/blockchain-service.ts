/**
 * Blockchain Service for Auto SDK Integration
 * Fetches real data from Autonomys blockchain
 */

import { operators, operator, balance, domains } from '@autonomys/auto-consensus';
import { getApiConnection } from './connection-service';
import { mapRpcOperatorToUi, mapRpcOperatorToDetails } from './operator-mapper-service';
import { formatAi3 } from '@/utils/unit-conversion';
import { OperatorNotFoundError, handleSdkError } from '@/utils/error-handling';
import type { Operator, OperatorDetails } from '@/types/operator';
import type { OperatorRpcData, DomainRpcData, BlockchainCache } from '@/types/blockchain';
import { CACHE_DURATION } from '@/types/blockchain';

// Target operators as specified in the requirements
const TARGET_OPERATORS = ['0', '1', '3'];

// Simple in-memory cache
const cache: BlockchainCache = {
  operators: new Map(),
  balances: new Map(),
  domains: null,
};

export const fetchOperators = async (): Promise<Operator[]> => {
  try {
    const api = await getApiConnection();
    
    const operatorPromises = TARGET_OPERATORS.map(async (id) => {
      // Check cache first
      const cached = cache.operators.get(id);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION.OPERATORS) {
        return mapRpcOperatorToUi(cached.data, id);
      }

      try {
        console.log(`Fetching operator ${id} from blockchain`);
        const operatorData = await operator(api, id);
        
        // Check if operatorData is null, undefined, or missing required fields
        if (!operatorData || 
            !operatorData.signingKey ||
            operatorData.currentTotalStake === undefined ||
            operatorData.minimumNominatorStake === undefined ||
            operatorData.nominationTax === undefined) {
          console.warn(`Operator ${id} not found or has invalid data`);
          return null;
        }

        // Additional validation for required fields
        const validatedData = {
          signingKey: operatorData.signingKey,
          currentTotalStake: operatorData.currentTotalStake,
          minimumNominatorStake: operatorData.minimumNominatorStake,
          nominationTax: operatorData.nominationTax,
          status: operatorData.status || 'inactive',
          currentEpochRewards: operatorData.currentEpochRewards || 0n,
          currentTotalShares: operatorData.currentTotalShares || 0n,
        };

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
    const operatorData = await operator(api, operatorId);
    
    if (!operatorData) {
      console.warn(`Operator ${operatorId} not found`);
      return null;
    }

    // Cache the result
    cache.operators.set(operatorId, {
      data: operatorData as OperatorRpcData,
      timestamp: Date.now(),
    });

    return mapRpcOperatorToDetails(operatorData as OperatorRpcData, operatorId);
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
      return formatAi3(cached.data.free);
    }

    const api = await getApiConnection();
    console.log(`Fetching balance for address ${address}`);
    
    const balanceData = await balance(api, address);
    
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
    
    const domainsData = await domains(api);
    
    if (!domainsData) {
      console.warn('No domains found');
      return [];
    }

    // Cache the result - store as unknown first, then cast as needed
    cache.domains = {
      data: domainsData as any,
      timestamp: Date.now(),
    };

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