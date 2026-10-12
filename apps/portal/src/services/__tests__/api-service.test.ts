import { describe, it, expect, vi, beforeEach } from 'vitest';
import { activate, disconnect } from '@autonomys/auto-utils';
import {
  getSharedApiConnection,
  disconnectSharedApi,
  getConnectionStatus,
} from '../api-service';

vi.mock('@autonomys/auto-utils', () => ({
  activate: vi.fn(),
  disconnect: vi.fn(),
}));

describe('api-service', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await disconnectSharedApi();
  });

  describe('getSharedApiConnection', () => {
    it('validates networkId parameter', async () => {
      await expect(getSharedApiConnection('')).rejects.toThrow('Valid networkId is required');
      await expect(getSharedApiConnection('   ')).rejects.toThrow('Valid networkId is required');
    });

    it('establishes a new shared connection and reuses it for the same network', async () => {
      const mockApi = { id: 'api-1', isConnected: true };
      vi.mocked(activate).mockResolvedValueOnce(mockApi as never);

      const conn1 = await getSharedApiConnection('mainnet');
      expect(conn1).toBe(mockApi);
      expect(activate).toHaveBeenCalledTimes(1);
      expect(activate).toHaveBeenCalledWith({ networkId: 'mainnet' });

      // Second call to same network reuses existing connection without reactivating
      const conn2 = await getSharedApiConnection('mainnet');
      expect(conn2).toBe(mockApi);
      expect(activate).toHaveBeenCalledTimes(1);

      const status = getConnectionStatus();
      expect(status).toEqual({ isConnected: true, networkId: 'mainnet' });
    });

    it('deduplicates concurrent connection requests to the same network', async () => {
      const mockApi = { id: 'api-concurrent' };
      vi.mocked(activate).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockApi as never), 20)),
      );

      const [conn1, conn2] = await Promise.all([
        getSharedApiConnection('taurus'),
        getSharedApiConnection('taurus'),
      ]);

      expect(conn1).toBe(mockApi);
      expect(conn2).toBe(mockApi);
      expect(activate).toHaveBeenCalledTimes(1);
    });

    it('disconnects previous connection when switching networks', async () => {
      const mockApi1 = { id: 'api-net1' };
      const mockApi2 = { id: 'api-net2' };
      vi.mocked(activate)
        .mockResolvedValueOnce(mockApi1 as never)
        .mockResolvedValueOnce(mockApi2 as never);

      await getSharedApiConnection('net1');
      expect(activate).toHaveBeenCalledWith({ networkId: 'net1' });

      await getSharedApiConnection('net2');
      expect(disconnect).toHaveBeenCalledWith(mockApi1);
      expect(activate).toHaveBeenCalledWith({ networkId: 'net2' });

      const status = getConnectionStatus();
      expect(status).toEqual({ isConnected: true, networkId: 'net2' });
    });

    it('resets connection state and rethrows when activation fails', async () => {
      vi.mocked(activate).mockRejectedValueOnce(new Error('RPC connection failed'));

      await expect(getSharedApiConnection('bad-net')).rejects.toThrow('RPC connection failed');

      const status = getConnectionStatus();
      expect(status).toEqual({ isConnected: false, networkId: null });
    });

    it('propagates activation error to all concurrent callers without opening duplicate connections', async () => {
      vi.mocked(activate).mockImplementation(
        () =>
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('RPC connection failed')), 20),
          ),
      );

      const [res1, res2] = await Promise.allSettled([
        getSharedApiConnection('bad-net'),
        getSharedApiConnection('bad-net'),
      ]);

      expect(res1.status).toBe('rejected');
      expect(res2.status).toBe('rejected');
      expect(activate).toHaveBeenCalledTimes(1);
      expect(getConnectionStatus()).toEqual({ isConnected: false, networkId: null });
    });
  });

  describe('disconnectSharedApi', () => {
    it('disconnects active shared connection and cleans up status', async () => {
      const mockApi = { id: 'api-to-disconnect' };
      vi.mocked(activate).mockResolvedValueOnce(mockApi as never);

      await getSharedApiConnection('net-test');
      expect(getConnectionStatus().isConnected).toBe(true);

      await disconnectSharedApi();
      expect(disconnect).toHaveBeenCalledWith(mockApi);
      expect(getConnectionStatus()).toEqual({ isConnected: false, networkId: null });
    });

    it('handles in-flight connection promise during disconnect', async () => {
      const mockApi = { id: 'api-inflight' };
      vi.mocked(activate).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockApi as never), 20)),
      );

      // Start in-flight connection
      const connectPromise = getSharedApiConnection('inflight-net');

      // Immediately call disconnect while still in-flight
      await disconnectSharedApi();
      await connectPromise;

      expect(disconnect).toHaveBeenCalledWith(mockApi);
      expect(getConnectionStatus()).toEqual({ isConnected: false, networkId: null });
    });

    it('safely handles error thrown during disconnect call', async () => {
      const mockApi = { id: 'api-failing-disconnect' };
      vi.mocked(activate).mockResolvedValueOnce(mockApi as never);
      vi.mocked(disconnect).mockRejectedValueOnce(new Error('WebSocket already closed'));

      await getSharedApiConnection('failing-net');

      await disconnectSharedApi();
      // State should still be cleanly cleared despite disconnect error
      expect(getConnectionStatus()).toEqual({ isConnected: false, networkId: null });
    });
  });
});
