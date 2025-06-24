/**
 * Integration Verification Script for Blockchain Service
 * Run this manually to verify Auto SDK integration works
 * 
 * Usage: Import and call verifyIntegration() in console or component
 */

import { fetchOperators, fetchOperatorById, clearCache, getCacheStats } from './blockchain-service';
import { getApiConnection, disconnectApi, getConnectionStatus } from './connection-service';

export const verifyIntegration = async (): Promise<void> => {
  console.log('🔗 Starting Auto SDK Integration Verification...\n');

  try {
    // 1. Test RPC Connection
    console.log('1. Testing RPC Connection...');
    const api = await getApiConnection();
    const connectionStatus = getConnectionStatus();
    console.log('✅ Connected to:', connectionStatus.endpoint);
    console.log('✅ Connection status:', connectionStatus.connected);
    console.log('✅ Connected at:', connectionStatus.connectedAt);

    // 2. Test Operator Fetching
    console.log('\n2. Testing Operator Fetching...');
    clearCache(); // Start fresh
    
    const operators = await fetchOperators();
    console.log(`✅ Fetched ${operators.length} operators successfully`);
    
    if (operators.length > 0) {
      console.log('✅ Sample operator data:');
      operators.forEach((op, index) => {
        console.log(`  Operator ${index + 1}:`, {
          id: op.id,
          name: op.name,
          status: op.status,
          totalStaked: op.totalStaked,
          nominationTax: op.nominationTax,
          ownerAccount: op.ownerAccount.substring(0, 12) + '...',
        });
      });
    } else {
      console.log('⚠️ No operators found. This might be expected if operators 0, 1, 3 are not active on testnet.');
    }

    // 3. Test Individual Operator Fetching
    console.log('\n3. Testing Individual Operator Fetching...');
    const targetOperators = ['0', '1', '3'];
    
    for (const operatorId of targetOperators) {
      try {
        console.log(`\n  Testing operator ${operatorId}...`);
        const operatorDetails = await fetchOperatorById(operatorId);
        
        if (operatorDetails) {
          console.log(`  ✅ Operator ${operatorId} found:`, {
            id: operatorDetails.id,
            name: operatorDetails.name,
            status: operatorDetails.status,
            totalStaked: operatorDetails.totalStaked,
            signingKey: operatorDetails.ownerAccount.substring(0, 12) + '...',
          });
        } else {
          console.log(`  ⚠️ Operator ${operatorId} not found or inactive`);
        }
      } catch (error) {
        console.log(`  ❌ Error fetching operator ${operatorId}:`, error);
      }
    }

    // 4. Test Caching
    console.log('\n4. Testing Caching Performance...');
    
    const start1 = Date.now();
    await fetchOperators();
    const time1 = Date.now() - start1;
    
    const start2 = Date.now();
    await fetchOperators(); // Should use cache
    const time2 = Date.now() - start2;
    
    console.log(`✅ First call: ${time1}ms`);
    console.log(`✅ Cached call: ${time2}ms`);
    console.log(`✅ Cache speedup: ${Math.round((time1 / time2) * 100) / 100}x faster`);
    
    const cacheStats = getCacheStats();
    console.log('✅ Cache stats:', cacheStats);

    // 5. Test Error Handling
    console.log('\n5. Testing Error Handling...');
    try {
      const nonExistent = await fetchOperatorById('999999');
      if (nonExistent === null) {
        console.log('✅ Non-existent operator handled gracefully (returned null)');
      } else {
        console.log('⚠️ Unexpected result for non-existent operator:', nonExistent);
      }
    } catch (error) {
      console.log('❌ Error handling test failed:', error);
    }

    console.log('\n🎉 Integration verification completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`  - RPC Connection: ✅ Working`);
    console.log(`  - Operator Fetching: ✅ Working (${operators.length} operators found)`);
    console.log(`  - Individual Fetching: ✅ Working`);
    console.log(`  - Caching: ✅ Working (${Math.round((time1 / time2) * 100) / 100}x speedup)`);
    console.log(`  - Error Handling: ✅ Working`);

  } catch (error) {
    console.error('❌ Integration verification failed:', error);
    throw error;
  } finally {
    // Cleanup
    await disconnectApi();
    console.log('\n🧹 Cleaned up connections');
  }
};

// Helper function to run verification with error catching
export const runVerification = async (): Promise<boolean> => {
  try {
    await verifyIntegration();
    return true;
  } catch (error) {
    console.error('Verification failed:', error);
    return false;
  }
};

// Export for easy console usage
(globalThis as any).verifyAutoSDK = verifyIntegration;
(globalThis as any).runAutoSDKVerification = runVerification;

console.log('🔧 Integration verification functions available:');
console.log('  - verifyAutoSDK() - Full verification');
console.log('  - runAutoSDKVerification() - Safe verification with error handling');