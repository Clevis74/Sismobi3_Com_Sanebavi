import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSyncManager } from '../useSyncManager';
import React from 'react';

// Mock do testConnection
vi.mock('../../lib/supabaseClient', () => ({
  testConnection: vi.fn()
}));

// Mock do toast
vi.mock('../../components/UI/EnhancedToast', () => ({
  useEnhancedToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn()
  })
}));

// Mock dos services
vi.mock('../../services/supabaseService', () => ({
  propertyService: {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  },
  tenantService: {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  },
  transactionService: {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  }
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
});

describe('🔄 useSyncManager Hook', () => {
  let queryClient: QueryClient;
  
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('[]');
  });

  afterEach(() => {
    queryClient.clear();
  });

  describe('Initial State', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useSyncManager(), { wrapper });
      
      expect(result.current.syncStatus.isOnline).toBe(true);
      expect(result.current.syncStatus.isSyncing).toBe(false);
      expect(result.current.syncStatus.lastSyncTime).toBeNull();
      expect(result.current.syncStatus.pendingChanges).toBe(0);
      expect(result.current.syncStatus.syncErrors).toEqual([]);
    });

    it('should load pending changes count from localStorage', async () => {
      const pendingChanges = [
        {
          id: 'test-1',
          type: 'create',
          entity: 'properties',
          data: { id: '1', name: 'Test' },
          timestamp: new Date().toISOString()
        }
      ];
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(pendingChanges));
      
      const { result } = renderHook(() => useSyncManager(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.syncStatus.pendingChanges).toBe(1);
      });
    });
  });

  describe('Adding Pending Changes', () => {
    it('should add pending change to localStorage', () => {
      const { result } = renderHook(() => useSyncManager(), { wrapper });
      
      act(() => {
        result.current.addPendingChange({
          type: 'create',
          entity: 'properties',
          data: { id: '1', name: 'New Property' }
        });
      });
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'pending-sync-changes',
        expect.stringContaining('properties')
      );
    });

    it('should prevent duplicate changes', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify([
        {
          id: 'existing-1',
          type: 'create',
          entity: 'properties',
          data: { id: '1', name: 'Property 1' },
          timestamp: new Date().toISOString()
        }
      ]));
      
      const { result } = renderHook(() => useSyncManager(), { wrapper });
      
      act(() => {
        result.current.addPendingChange({
          type: 'create',
          entity: 'properties',
          data: { id: '1', name: 'Updated Property 1' }
        });
      });
      
      const setItemCalls = mockLocalStorage.setItem.mock.calls;
      const lastCall = setItemCalls[setItemCalls.length - 1];
      const savedChanges = JSON.parse(lastCall[1]);
      
      // Deve ter apenas uma mudança para o mesmo item
      expect(savedChanges).toHaveLength(1);
      expect(savedChanges[0].data.name).toBe('Updated Property 1');
    });

    it('should update pending changes count', async () => {
      const { result } = renderHook(() => useSyncManager(), { wrapper });
      
      act(() => {
        result.current.addPendingChange({
          type: 'create', 
          entity: 'properties',
          data: { id: '1', name: 'Test' }
        });
      });
      
      await waitFor(() => {
        expect(result.current.syncStatus.pendingChanges).toBe(1);
      });
    });
  });

  describe('Sync Operations', () => {
    it('should perform sync when Supabase is available', async () => {
      const { testConnection } = await import('../../lib/supabaseClient');
      const { propertyService } = await import('../../services/supabaseService');
      
      (testConnection as any).mockResolvedValue(true);
      (propertyService.create as any).mockResolvedValue({ id: '1' });

      const pendingChanges = [
        {
          id: 'test-1',
          type: 'create',
          entity: 'properties',
          data: { name: 'Test Property' },
          timestamp: new Date().toISOString()
        }
      ];
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(pendingChanges));
      
      const { result } = renderHook(() => useSyncManager(), { wrapper });
      
      await act(async () => {
        await result.current.performSync();
      });
      
      expect(propertyService.create).toHaveBeenCalledWith({ name: 'Test Property' });
      expect(result.current.syncStatus.isSyncing).toBe(false);
    });

    it('should handle sync failures gracefully', async () => {
      const { testConnection } = await import('../../lib/supabaseClient');
      const { propertyService } = await import('../../services/supabaseService');
      
      (testConnection as any).mockResolvedValue(true);
      (propertyService.create as any).mockRejectedValue(new Error('Network error'));

      const pendingChanges = [
        {
          id: 'test-1',
          type: 'create',
          entity: 'properties',
          data: { name: 'Test Property' },
          timestamp: new Date().toISOString()
        }
      ];
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(pendingChanges));
      
      const { result } = renderHook(() => useSyncManager(), { wrapper });
      
      await act(async () => {
        await result.current.performSync();
      });
      
      expect(result.current.syncStatus.syncErrors).toContain('Falha ao sincronizar properties create');
    });

    it('should skip sync when Supabase is unavailable', async () => {
      const { testConnection } = await import('../../lib/supabaseClient');
      
      (testConnection as any).mockResolvedValue(false);
      
      const { result } = renderHook(() => useSyncManager(), { wrapper });
      
      await act(async () => {
        await result.current.performSync();
      });
      
      expect(result.current.syncStatus.isOnline).toBe(false);
      expect(result.current.syncStatus.syncErrors).toContain('Supabase indisponível');
    });
  });

  describe('Entity-Specific Sync', () => {
    it('should sync tenant operations correctly', async () => {
      const { testConnection } = await import('../../lib/supabaseClient');
      const { tenantService } = await import('../../services/supabaseService');
      
      (testConnection as any).mockResolvedValue(true);
      (tenantService.update as any).mockResolvedValue({ id: '1' });

      const pendingChanges = [
        {
          id: 'tenant-update-1',
          type: 'update',
          entity: 'tenants',
          data: { id: '1', name: 'Updated Tenant' },
          timestamp: new Date().toISOString()
        }
      ];
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(pendingChanges));
      
      const { result } = renderHook(() => useSyncManager(), { wrapper });
      
      await act(async () => {
        await result.current.performSync();
      });
      
      expect(tenantService.update).toHaveBeenCalledWith('1', { id: '1', name: 'Updated Tenant' });
    });

    it('should sync transaction deletions correctly', async () => {
      const { testConnection } = await import('../../lib/supabaseClient');
      const { transactionService } = await import('../../services/supabaseService');
      
      (testConnection as any).mockResolvedValue(true);
      (transactionService.delete as any).mockResolvedValue(undefined);

      const pendingChanges = [
        {
          id: 'transaction-delete-1',
          type: 'delete',
          entity: 'transactions',
          data: { id: '1' },
          timestamp: new Date().toISOString()
        }
      ];
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(pendingChanges));
      
      const { result } = renderHook(() => useSyncManager(), { wrapper });
      
      await act(async () => {
        await result.current.performSync();
      });
      
      expect(transactionService.delete).toHaveBeenCalledWith('1');
    });
  });

  describe('Network Status Handling', () => {
    it('should update status when going offline', () => {
      const { result } = renderHook(() => useSyncManager(), { wrapper });
      
      act(() => {
        Object.defineProperty(navigator, 'onLine', { value: false });
        window.dispatchEvent(new Event('offline'));
      });
      
      expect(result.current.syncStatus.isOnline).toBe(false);
    });

    it('should trigger sync when coming back online', async () => {
      const { testConnection } = await import('../../lib/supabaseClient');
      
      (testConnection as any).mockResolvedValue(true);
      mockLocalStorage.getItem.mockReturnValue('[]');
      
      const { result } = renderHook(() => useSyncManager(), { wrapper });
      
      await act(async () => {
        Object.defineProperty(navigator, 'onLine', { value: true });
        window.dispatchEvent(new Event('online'));
        await new Promise(resolve => setTimeout(resolve, 2100)); // Wait for timeout
      });
      
      expect(result.current.syncStatus.isOnline).toBe(true);
    });
  });

  describe('Clearing Pending Changes', () => {
    it('should clear all pending changes', () => {
      const { result } = renderHook(() => useSyncManager(), { wrapper });
      
      act(() => {
        result.current.clearPendingChanges();
      });
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'pending-sync-changes',
        JSON.stringify([])
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle localStorage errors gracefully', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });
      
      const { result } = renderHook(() => useSyncManager(), { wrapper });
      
      // Não deve quebrar
      expect(result.current.syncStatus.pendingChanges).toBe(0);
    });

    it('should handle JSON parsing errors', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-json');
      
      const { result } = renderHook(() => useSyncManager(), { wrapper });
      
      // Deve usar array vazio como fallback
      expect(result.current.syncStatus.pendingChanges).toBe(0);
    });
  });
});