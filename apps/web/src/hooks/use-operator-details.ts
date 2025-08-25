import { useState, useEffect } from 'react';
import { operatorService } from '@/services/operator-service';
import type { Operator } from '@/types/operator';
import { config } from '@/config';

interface UseOperatorDetailsReturn {
  operator: Operator | null;
  loading: boolean;
  error: string | null;
}

export const useOperatorDetails = (operatorId: string): UseOperatorDetailsReturn => {
  const [operator, setOperator] = useState<Operator | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOperatorDetails = async () => {
      if (!operatorId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const service = await operatorService(); // Use value from config
        const lookbackDays = 7;
        const operatorData = config.features.enableIndexer
          ? await service.getOperatorWithApy(operatorId, lookbackDays)
          : await service.getOperatorById(operatorId);

        if (!operatorData) {
          setError('Operator not found');
          setOperator(null);
        } else {
          setOperator(operatorData);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load operator details';
        setError(errorMessage);
        setOperator(null);
        console.error('Operator details fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOperatorDetails();
  }, [operatorId]);

  return { operator, loading, error };
};
