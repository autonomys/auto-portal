import { getSharedApiConnection } from '@/services/api-service';

export const getCurrentDomainEpochIndex = async (domainId: number): Promise<number | null> => {
  try {
    const api = await getSharedApiConnection();
    const summary = await (api as any).query.domains.domainStakingSummary(domainId);
    // Handle both codec and plain object shapes
    const value: unknown = summary?.toPrimitive?.() ?? summary;
    const epochIndex = (value as any)?.currentEpochIndex;
    if (typeof epochIndex === 'number') return epochIndex;
    if (typeof epochIndex === 'string') return Number(epochIndex);
    return null;
  } catch (error) {
    console.warn('getCurrentDomainEpochIndex failed:', error);
    return null;
  }
};
