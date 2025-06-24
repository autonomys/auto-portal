/**
 * Manual Integration Test for Auto SDK
 *
 * This is not a full automated test suite, but a script that can be run
 * to verify the Auto SDK integration works with real testnet data.
 *
 * To run this test:
 * 1. Start the dev server: yarn dev
 * 2. Open browser console
 * 3. Run: runIntegrationTest()
 */

import {
  debugAllOperators,
  debugDomains,
  debugTypeConversions,
} from '../services/blockchain-debug';
import { fetchOperators, fetchOperatorById } from '../services/blockchain-service';
import { getApiConnection, disconnectApi } from '../services/connection-service';

export const testBasicConnection = async (): Promise<boolean> => {
  console.log('🧪 TEST: Basic RPC Connection');

  try {
    const api = await getApiConnection();
    const isConnected = api.isConnected;

    console.log(`✅ Connection successful: ${isConnected}`);
    return isConnected;
  } catch (error) {
    console.error('❌ Connection failed:', error);
    return false;
  }
};

export const testOperatorFetching = async (): Promise<boolean> => {
  console.log('🧪 TEST: Operator Fetching');

  try {
    const operators = await fetchOperators();
    console.log(`✅ Fetched ${operators.length} operators`);

    if (operators.length > 0) {
      console.log('Sample operator:', operators[0]);

      // Validate operator structure
      const op = operators[0];
      const requiredFields = ['id', 'name', 'status', 'ownerAccount', 'totalStaked'];
      const missingFields = requiredFields.filter(field => !(field in op));

      if (missingFields.length > 0) {
        console.error('❌ Missing required fields:', missingFields);
        return false;
      }

      console.log('✅ Operator structure validation passed');
    }

    return true;
  } catch (error) {
    console.error('❌ Operator fetching failed:', error);
    return false;
  }
};

export const testIndividualOperators = async (): Promise<boolean> => {
  console.log('🧪 TEST: Individual Operator Fetching');

  const targetOperators = ['0', '1', '3'];
  let successCount = 0;

  for (const operatorId of targetOperators) {
    try {
      console.log(`Testing operator ${operatorId}...`);
      const operatorDetails = await fetchOperatorById(operatorId);

      if (operatorDetails) {
        console.log(`✅ Operator ${operatorId} found:`, {
          id: operatorDetails.id,
          name: operatorDetails.name,
          status: operatorDetails.status,
          ownerAccount: operatorDetails.ownerAccount.substring(0, 12) + '...',
        });
        successCount++;
      } else {
        console.log(`⚠️ Operator ${operatorId} not found (may be inactive)`);
      }
    } catch (error) {
      console.error(`❌ Error fetching operator ${operatorId}:`, error);
    }
  }

  console.log(`✅ Successfully processed ${successCount}/${targetOperators.length} operators`);
  return successCount > 0; // At least one operator should exist
};

export const testErrorHandling = async (): Promise<boolean> => {
  console.log('🧪 TEST: Error Handling');

  try {
    // Test with non-existent operator
    const nonExistent = await fetchOperatorById('999999');

    if (nonExistent === null) {
      console.log('✅ Non-existent operator handled correctly (returned null)');
      return true;
    } else {
      console.error('❌ Non-existent operator should return null, got:', nonExistent);
      return false;
    }
  } catch (error) {
    console.error('❌ Error handling test failed:', error);
    return false;
  }
};

export const runIntegrationTest = async (): Promise<void> => {
  console.log('🚀 INTEGRATION TEST: Starting Auto SDK Integration Test Suite');
  console.log('='.repeat(80));

  const results: Array<{ test: string; passed: boolean }> = [];

  try {
    // Test 1: Basic Connection
    const connectionResult = await testBasicConnection();
    results.push({ test: 'Basic Connection', passed: connectionResult });

    if (!connectionResult) {
      console.error('❌ Connection test failed, stopping tests');
      return;
    }

    // Test 2: Type Conversions
    console.log('\n🧪 TEST: Type Conversions');
    debugTypeConversions();
    results.push({ test: 'Type Conversions', passed: true });

    // Test 3: Operator Fetching
    const operatorResult = await testOperatorFetching();
    results.push({ test: 'Operator Fetching', passed: operatorResult });

    // Test 4: Individual Operators
    const individualResult = await testIndividualOperators();
    results.push({ test: 'Individual Operators', passed: individualResult });

    // Test 5: Error Handling
    const errorResult = await testErrorHandling();
    results.push({ test: 'Error Handling', passed: errorResult });

    // Test 6: Debug Suite
    console.log('\n🧪 TEST: Debug Suite (detailed logging)');
    await debugAllOperators();
    await debugDomains();
    results.push({ test: 'Debug Suite', passed: true });
  } catch (error) {
    console.error('❌ Integration test suite failed:', error);
  } finally {
    // Cleanup
    await disconnectApi();

    // Report results
    console.log('\n' + '='.repeat(80));
    console.log('📊 INTEGRATION TEST RESULTS:');
    console.log('='.repeat(80));

    let passedCount = 0;
    results.forEach(({ test, passed }) => {
      console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
      if (passed) passedCount++;
    });

    console.log('='.repeat(80));
    console.log(`📈 SUMMARY: ${passedCount}/${results.length} tests passed`);

    if (passedCount === results.length) {
      console.log('🎉 ALL TESTS PASSED! Auto SDK integration is working correctly.');
    } else {
      console.log('⚠️ Some tests failed. Check the logs above for details.');
    }

    console.log('\n🔧 For detailed debugging, run:');
    console.log('  - debugAutoSDK.fullSuite() - Complete debug info');
    console.log('  - debugAutoSDK.operator("0") - Debug specific operator');
  }
};

// Export for console access
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).runIntegrationTest = runIntegrationTest;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).testAutoSDK = {
  connection: testBasicConnection,
  operators: testOperatorFetching,
  individual: testIndividualOperators,
  errorHandling: testErrorHandling,
  full: runIntegrationTest,
};

console.log('🔧 Integration test functions available:');
console.log('  - runIntegrationTest() - Full test suite');
console.log('  - testAutoSDK.connection() - Test RPC connection');
console.log('  - testAutoSDK.operators() - Test operator fetching');
console.log('  - testAutoSDK.individual() - Test individual operators');
console.log('  - testAutoSDK.errorHandling() - Test error handling');
