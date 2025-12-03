import { getSharedApiConnection } from '@/services/api-service';
import type { DomainStakingSummary } from '@autonomys/auto-consensus';

export const getCurrentDomainEpochIndex = async (domainId: number): Promise<number | null> => {
  try {
    const api = await getSharedApiConnection();
    const summary = await api.query.domains.domainStakingSummary(domainId);
    // Handle both codec and plain object shapes
    const value: unknown = summary?.toPrimitive?.() ?? summary;
    const epochIndex = (value as DomainStakingSummary)?.currentEpochIndex;
    if (typeof epochIndex === 'number') return epochIndex;
    if (typeof epochIndex === 'string') return Number(epochIndex);
    return null;
  } catch (error) {
    console.warn('getCurrentDomainEpochIndex failed:', error);
    return null;
  }
};
