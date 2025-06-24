/**
 * Blockchain Debug Service
 * Tests Auto SDK integration with detailed logging to understand data structures
 */

import { operator, balance, domains } from '@autonomys/auto-consensus';
import { getApiConnection } from './connection-service';

// Test individual operator fetching with detailed logging
export const debugOperator = async (operatorId: string): Promise<void> => {
  console.log(`🔍 DEBUG: Testing operator ${operatorId}`);

  try {
    const api = await getApiConnection();
    console.log('✅ DEBUG: API connection established');

    let rawResult;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rawResult = await operator(api as any, operatorId);
      console.log(`🔍 DEBUG: Raw result for operator ${operatorId}:`, rawResult);
    } catch (sdkError) {
      console.log(`🔍 DEBUG: Auto SDK threw error for operator ${operatorId}:`, sdkError);

      if (sdkError instanceof Error && sdkError.message.includes('signingKey')) {
        console.log(
          `✅ DEBUG: Operator ${operatorId} does not exist on testnet (expected for inactive operators)`,
        );
        return;
      } else {
        console.log(`❌ DEBUG: Unexpected SDK error:`, sdkError);
        throw sdkError;
      }
    }

    console.log(`🔍 DEBUG: Type of result:`, typeof rawResult);
    console.log(`🔍 DEBUG: Is array:`, Array.isArray(rawResult));
    console.log(`🔍 DEBUG: Is null:`, rawResult === null);
    console.log(`🔍 DEBUG: Is undefined:`, rawResult === undefined);

    if (rawResult && typeof rawResult === 'object') {
      console.log(`🔍 DEBUG: Object keys:`, Object.keys(rawResult));
      console.log(`🔍 DEBUG: Object entries:`, Object.entries(rawResult));

      // Check each field individually
      const fields = [
        'signingKey',
        'currentTotalStake',
        'minimumNominatorStake',
        'nominationTax',
        'status',
        'currentEpochRewards',
        'currentTotalShares',
      ];

      fields.forEach(field => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const value = (rawResult as any)[field];
        console.log(`🔍 DEBUG: ${field}:`, {
          value,
          type: typeof value,
          isNull: value === null,
          isUndefined: value === undefined,
          constructor: value?.constructor?.name,
        });
      });
    }
  } catch (error) {
    console.error(`❌ DEBUG: Error fetching operator ${operatorId}:`, error);
    console.error(`❌ DEBUG: Error type:`, typeof error);
    console.error(`❌ DEBUG: Error stack:`, error instanceof Error ? error.stack : 'No stack');
  }
};

// Test all target operators
export const debugAllOperators = async (): Promise<void> => {
  console.log('🔍 DEBUG: Testing all target operators...');

  const targetOperators = ['0', '1', '3'];

  for (const operatorId of targetOperators) {
    await debugOperator(operatorId);
    console.log('---');
  }
};

// Test a range of operator IDs to find which ones exist
export const findExistingOperators = async (maxId: number = 10): Promise<void> => {
  console.log(`🔍 DEBUG: Scanning for existing operators (0-${maxId})...`);

  const existingOperators: string[] = [];

  for (let i = 0; i <= maxId; i++) {
    const operatorId = i.toString();
    console.log(`Testing operator ${operatorId}...`);

    try {
      const api = await getApiConnection();

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rawResult = await operator(api as any, operatorId);

        if (rawResult) {
          console.log(`✅ Operator ${operatorId} EXISTS`);
          existingOperators.push(operatorId);
        } else {
          console.log(`⚠️ Operator ${operatorId} returned null`);
        }
      } catch (sdkError) {
        if (sdkError instanceof Error && sdkError.message.includes('signingKey')) {
          console.log(`❌ Operator ${operatorId} does not exist`);
        } else {
          console.log(`❌ Operator ${operatorId} error:`, sdkError);
        }
      }
    } catch (error) {
      console.error(`Connection error while testing operator ${operatorId}:`, error);
      break;
    }
  }

  console.log(`\n📊 SCAN RESULTS:`);
  console.log(
    `Found ${existingOperators.length} existing operators: [${existingOperators.join(', ')}]`,
  );

  if (existingOperators.length > 0) {
    console.log(`\n🔍 Testing first existing operator (${existingOperators[0]}) in detail:`);
    await debugOperator(existingOperators[0]);
  }
};

// Test balance fetching
export const debugBalance = async (address: string): Promise<void> => {
  console.log(`🔍 DEBUG: Testing balance for ${address}`);

  try {
    const api = await getApiConnection();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawResult = await balance(api as any, address);

    console.log(`🔍 DEBUG: Raw balance result:`, rawResult);
    console.log(`🔍 DEBUG: Balance type:`, typeof rawResult);

    if (rawResult && typeof rawResult === 'object') {
      console.log(`🔍 DEBUG: Balance keys:`, Object.keys(rawResult));
      console.log(`🔍 DEBUG: Balance entries:`, Object.entries(rawResult));

      const fields = ['free', 'reserved', 'frozen'];
      fields.forEach(field => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const value = (rawResult as any)[field];
        console.log(`🔍 DEBUG: ${field}:`, {
          value,
          type: typeof value,
          constructor: value?.constructor?.name,
          toString: value?.toString?.(),
        });
      });
    }
  } catch (error) {
    console.error(`❌ DEBUG: Error fetching balance:`, error);
  }
};

// Test domains fetching
export const debugDomains = async (): Promise<void> => {
  console.log(`🔍 DEBUG: Testing domains`);

  try {
    const api = await getApiConnection();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawResult = await domains(api as any);

    console.log(`🔍 DEBUG: Raw domains result:`, rawResult);
    console.log(`🔍 DEBUG: Domains type:`, typeof rawResult);
    console.log(`🔍 DEBUG: Is array:`, Array.isArray(rawResult));

    if (Array.isArray(rawResult)) {
      console.log(`🔍 DEBUG: Domains length:`, rawResult.length);
      rawResult.forEach((domain, index) => {
        console.log(`🔍 DEBUG: Domain ${index}:`, domain);
      });
    }
  } catch (error) {
    console.error(`❌ DEBUG: Error fetching domains:`, error);
  }
};

// Test type conversion functions
export const debugTypeConversions = (): void => {
  console.log('🔍 DEBUG: Testing type conversion functions...');

  const testValues = [
    null,
    undefined,
    0,
    '0',
    1234567890,
    '1234567890',
    BigInt(1234567890),
    '1234567890123456789012345678901234567890', // Very large number
    {},
    [],
    'invalid',
    true,
    false,
  ];

  testValues.forEach(value => {
    console.log(`🔍 DEBUG: Testing value:`, value, typeof value);

    try {
      // Test our safeToBigInt function
      const bigIntResult = testSafeToBigInt(value);
      console.log(`  ✅ safeToBigInt result:`, bigIntResult, typeof bigIntResult);
    } catch (error) {
      console.log(`  ❌ safeToBigInt error:`, error);
    }

    try {
      // Test our safeToString function
      const stringResult = testSafeToString(value);
      console.log(`  ✅ safeToString result:`, stringResult, typeof stringResult);
    } catch (error) {
      console.log(`  ❌ safeToString error:`, error);
    }

    console.log('  ---');
  });
};

// Copy of our safe conversion functions for testing
const testSafeToBigInt = (value: unknown, defaultValue: bigint = 0n): bigint => {
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

const testSafeToString = (value: unknown): string => {
  if (value === null || value === undefined) {
    return 'inactive';
  }

  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value) && value.length > 0) {
    return String(value[0]);
  }

  if (typeof value === 'object' && value && 'toString' in value) {
    return String(value);
  }

  return String(value);
};

// Run full debug suite
export const runFullDebugSuite = async (): Promise<void> => {
  console.log('🚀 DEBUG: Starting full Auto SDK debug suite...');

  console.log('\n=== TYPE CONVERSIONS ===');
  debugTypeConversions();

  console.log('\n=== FIND EXISTING OPERATORS ===');
  await findExistingOperators(5); // Scan operators 0-5

  console.log('\n=== TARGET OPERATORS ===');
  await debugAllOperators();

  console.log('\n=== DOMAINS ===');
  await debugDomains();

  // Test with a common test address (you can replace with a real one)
  console.log('\n=== BALANCE ===');
  await debugBalance('5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY');

  console.log('\n✅ DEBUG: Full debug suite completed!');
};

// Export for console access
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).debugAutoSDK = {
  operator: debugOperator,
  allOperators: debugAllOperators,
  findOperators: findExistingOperators,
  balance: debugBalance,
  domains: debugDomains,
  typeConversions: debugTypeConversions,
  fullSuite: runFullDebugSuite,
};

console.log('🔧 DEBUG: Auto SDK debug functions available:');
console.log('  - debugAutoSDK.operator(id) - Debug specific operator');
console.log('  - debugAutoSDK.allOperators() - Debug all target operators');
console.log('  - debugAutoSDK.findOperators(maxId) - Scan for existing operators');
console.log('  - debugAutoSDK.balance(address) - Debug balance query');
console.log('  - debugAutoSDK.domains() - Debug domains query');
console.log('  - debugAutoSDK.typeConversions() - Test type conversion functions');
console.log('  - debugAutoSDK.fullSuite() - Run complete debug suite');
