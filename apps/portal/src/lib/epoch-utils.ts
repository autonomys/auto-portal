import { getSharedApiConnection } from '@/services/api-service';

export const getCurrentDomainEpochIndex = async (domainId: number): Promise<number | null> => {
  try {
    const api = await getSharedApiConnection();
    const summary = await api.query.domains.domainStakingSummary(domainId);
    // Handle both codec and plain object shapes
    const value: unknown = summary?.toPrimitive?.() ?? summary;
    const epochIndex: unknown = (value as Record<string, unknown>)?.currentEpochIndex;
    if (typeof epochIndex === 'number' && Number.isFinite(epochIndex) && epochIndex >= 0) {
      return Math.floor(epochIndex);
    }
    if (typeof epochIndex === 'string' && epochIndex.trim() !== '') {
      const parsed = Number(epochIndex);
      if (Number.isFinite(parsed) && parsed >= 0) return Math.floor(parsed);
    }
    return null;
  } catch (error) {
    console.warn('getCurrentDomainEpochIndex failed:', error);
    return null;
  }
};
