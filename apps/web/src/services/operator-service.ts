/**
 * Operator Service - Real Blockchain Data Integration
 * Replaces mock data with Auto SDK calls
 */

import { fetchOperators, fetchOperatorById } from './blockchain-service';
import type { Operator, OperatorDetails, OperatorStats } from '@/types/operator';

export const operatorService = {
  async getAllOperators(): Promise<Operator[]> {
    try {
      return await fetchOperators();
    } catch (error) {
      console.error('Failed to fetch operators from blockchain:', error);
      // Return empty array as fallback
      return [];
    }
  },

  async getOperatorById(operatorId: string): Promise<OperatorDetails | null> {
    try {
      return await fetchOperatorById(operatorId);
    } catch (error) {
      console.error(`Failed to fetch operator ${operatorId}:`, error);
      return null;
    }
  },

  async getOperatorStats(): Promise<OperatorStats> {
    try {
      const operators = await fetchOperators();

      if (operators.length === 0) {
        return {
          sharePrice: '1.0000',
          totalShares: '0',
          totalStaked: '0',
          nominatorCount: 0,
        };
      }

      const totalStaked = operators
        .reduce((sum, op) => sum + parseFloat(op.totalStaked), 0)
        .toString();

      return {
        sharePrice: '1.0000',
        totalShares: totalStaked,
        totalStaked,
        nominatorCount: operators.reduce((sum, op) => sum + op.nominatorCount, 0),
      };
    } catch (error) {
      console.error('Failed to fetch operator stats:', error);
      return {
        sharePrice: '1.0000',
        totalShares: '0',
        totalStaked: '0',
        nominatorCount: 0,
      };
    }
  },
};