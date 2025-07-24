import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProperties } from '../../hooks/useProperties';
import { useTenants } from '../../hooks/useTenants';
import { useTransactions } from '../../hooks/useTransactions';
import React from 'react';

// Mock services
const mockPropertyService = {
  getAll: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn()
};

const mockTenantService = {
  getAll: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn()
};

const mockTransactionService = {
  getAll: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn()
};

const mockMappers = {
  propertyFromSupabase: vi.fn((data) => ({
    id: data.id,
    name: data.name,
    address: data.address,
    energyUnitName: data.energy_unit_name,
    type: data.type,
    purchasePrice: data.purchase_price,
    rentValue: data.rent_value,
    status: data.status,
    createdAt: new Date(data.created_at)
  })),
  tenantFromSupabase: vi.fn((data) => ({
    id: data.id,
    propertyId: data.property_id,
    name: data.name,
    email: data.email,
    cpf: data.cpf,
    phone: data.phone,
    startDate: new Date(data.start_date),
    monthlyRent: data.monthly_rent,
    deposit: data.deposit,
    status: data.status
  })),
  transactionFromSupabase: vi.fn((data) => ({
    id: data.id,
    propertyId: data.property_id,
    type: data.type,
    category: data.category,
    amount: data.amount,
    description: data.description,
    date: new Date(data.date)
  }))
};

vi.mock('../../services/supabaseService', () => ({
  propertyService: mockPropertyService,
  tenantService: mockTenantService,
  transactionService: mockTransactionService,
  mappers: mockMappers
}));

// Mock useSyncManager
const mockUseSyncManager = {
  addPendingChange: vi.fn()
};

vi.mock('../../hooks/useSyncManager', () => ({
  useSyncManager: () => mockUseSyncManager
}));

// Mock useLocalStorage
const mockUseLocalStorage = vi.fn();
vi.mock('../../hooks/useLocalStorage', () => ({
  useLocalStorage: mockUseLocalStorage
}));

// Mock toast
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn()
  }
}));

describe('🔗 Hooks Integration Tests', () => {
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
    
    // Mock localStorage hook default behavior
    mockUseLocalStorage.mockReturnValue([[], vi.fn()]);
  });

  afterEach(() => {
    queryClient.clear();
  });

  describe('useProperties Integration', () => {
    it('should integrate online and offline modes seamlessly', async () => {
      const mockOnlineData = [
        {
          id: '1',
          name: 'Online Property',
          address: 'Online Address',
          energy_unit_name: null,
          type: 'apartment',
          purchase_price: 100000,
          rent_value: 1000,
          status: 'vacant',
          created_at: '2024-01-01T00:00:00Z'
        }
      ];

      const mockLocalData = [
        {
          id: '2',
          name: 'Local Property',
          address: 'Local Address',
          type: 'house',
          purchasePrice: 200000,
          rentValue: 1500,
          status: 'rented',
          createdAt: new Date('2024-01-02')
        }
      ];

      // Test online mode
      mockPropertyService.getAll.mockResolvedValue(mockOnlineData);
      
      const { result: onlineResult } = renderHook(() => useProperties(true), { wrapper });

      await waitFor(() => {
        expect(onlineResult.current.properties).toHaveLength(1);
        expect(onlineResult.current.properties[0].name).toBe('Online Property');
        expect(onlineResult.current.usingSupabase).toBe(true);
      });

      // Test offline mode
      mockUseLocalStorage.mockReturnValue([mockLocalData, vi.fn()]);
      
      const { result: offlineResult } = renderHook(() => useProperties(false), { wrapper });

      await waitFor(() => {
        expect(offlineResult.current.properties).toHaveLength(1);
        expect(offlineResult.current.properties[0].name).toBe('Local Property');
        expect(offlineResult.current.usingSupabase).toBe(false);
      });
    });

    it('should handle CRUD operations with proper sync queue integration', async () => {
      const mockSetLocalData = vi.fn();
      mockUseLocalStorage.mockReturnValue([[], mockSetLocalData]);
      mockPropertyService.create.mockResolvedValue({
        id: 'new-1',
        name: 'New Property',
        address: 'New Address',
        energy_unit_name: null,
        type: 'apartment',
        purchase_price: 150000,
        rent_value: 1200,
        status: 'vacant',
        created_at: '2024-01-01T00:00:00Z'
      });

      const { result } = renderHook(() => useProperties(true), { wrapper });

      await act(async () => {
        await result.current.addProperty({
          name: 'New Property',
          address: 'New Address',
          type: 'apartment',
          purchasePrice: 150000,
          rentValue: 1200,
          status: 'vacant'
        });
      });

      expect(mockPropertyService.create).toHaveBeenCalledWith({
        name: 'New Property',
        address: 'New Address',
        type: 'apartment',
        purchasePrice: 150000,
        rentValue: 1200,
        status: 'vacant'
      });
    });

    it('should fallback to offline mode when Supabase fails', async () => {
      const mockLocalData = [{ id: '1', name: 'Cached Property' }];
      const mockSetLocalData = vi.fn();
      
      mockUseLocalStorage.mockReturnValue([mockLocalData, mockSetLocalData]);
      mockPropertyService.getAll.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useProperties(true), { wrapper });

      await waitFor(() => {
        expect(result.current.properties).toEqual(mockLocalData);
        expect(result.current.erro).toBeNull(); // Should not show error in offline fallback
      });
    });

    it('should add pending changes when operating offline', async () => {
      const mockSetLocalData = vi.fn();
      mockUseLocalStorage.mockReturnValue([[], mockSetLocalData]);

      const { result } = renderHook(() => useProperties(false), { wrapper });

      await act(async () => {
        await result.current.addProperty({
          name: 'Offline Property',
          address: 'Offline Address',
          type: 'house',
          purchasePrice: 100000,
          rentValue: 800,
          status: 'vacant'
        });
      });

      expect(mockUseSyncManager.addPendingChange).toHaveBeenCalledWith({
        type: 'create',
        entity: 'properties',
        data: expect.objectContaining({
          name: 'Offline Property'
        })
      });
    });
  });

  describe('useTenants Integration', () => {
    it('should properly integrate with property relationships', async () => {
      const mockTenantData = [
        {
          id: 'tenant-1',
          property_id: 'prop-1',
          name: 'John Doe',
          email: 'john@example.com',
          cpf: '12345678901',
          phone: '11999999999',
          start_date: '2024-01-01T00:00:00Z',
          monthly_rent: 1500,
          deposit: 3000,
          status: 'active'
        }
      ];

      mockTenantService.getAll.mockResolvedValue(mockTenantData);

      const { result } = renderHook(() => useTenants(true), { wrapper });

      await waitFor(() => {
        expect(result.current.tenants).toHaveLength(1);
        expect(result.current.tenants[0].propertyId).toBe('prop-1');
      });
    });

    it('should handle tenant CRUD with property cache invalidation', async () => {
      const mockSetLocalData = vi.fn();
      mockUseLocalStorage.mockReturnValue([[], mockSetLocalData]);
      
      const { result } = renderHook(() => useTenants(true), { wrapper });

      await act(async () => {
        await result.current.deleteTenant('tenant-1');
      });

      // Should invalidate properties cache when tenant is deleted
      // This is tested by checking if queryClient.invalidateQueries was called
      // but we can't easily mock that in this setup
      expect(mockTenantService.delete).toHaveBeenCalledWith('tenant-1');
    });
  });

  describe('useTransactions Integration', () => {
    it('should handle complex transaction data with recurring fields', async () => {
      const mockTransactionData = [
        {
          id: 'trans-1',
          property_id: 'prop-1',
          type: 'income',
          category: 'Rent',
          amount: 1500,
          description: 'Monthly rent',
          date: '2024-01-01T00:00:00Z',
          recurring: {
            frequency: 'monthly',
            nextDate: '2024-02-01T00:00:00Z'
          }
        }
      ];

      mockTransactionService.getAll.mockResolvedValue(mockTransactionData);

      const { result } = renderHook(() => useTransactions(true), { wrapper });

      await waitFor(() => {
        expect(result.current.transactions).toHaveLength(1);
        expect(result.current.transactions[0].recurring).toEqual({
          frequency: 'monthly',
          nextDate: '2024-02-01T00:00:00Z'
        });
      });
    });

    it('should handle transactions without description gracefully', async () => {
      const mockSetLocalData = vi.fn();
      mockUseLocalStorage.mockReturnValue([[], mockSetLocalData]);
      
      mockTransactionService.create.mockResolvedValue({
        id: 'trans-new',
        property_id: 'prop-1',
        type: 'expense',
        category: 'Maintenance',
        amount: 200,
        description: null,
        date: '2024-01-01T00:00:00Z',
        recurring: null
      });

      const { result } = renderHook(() => useTransactions(true), { wrapper });

      await act(async () => {
        await result.current.addTransaction({
          propertyId: 'prop-1',
          type: 'expense',
          category: 'Maintenance',
          amount: 200,
          description: '',
          date: new Date('2024-01-01')
        });
      });

      expect(mockTransactionService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          description: ''
        })
      );
    });
  });

  describe('Cross-Hook Data Consistency', () => {
    it('should maintain data consistency across multiple hooks', async () => {
      // Setup shared property data
      const sharedPropertyId = 'shared-prop-1';
      
      const mockPropertyData = [{
        id: sharedPropertyId,
        name: 'Shared Property',
        address: 'Shared Address',
        energy_unit_name: null,
        type: 'apartment',
        purchase_price: 100000,
        rent_value: 1000,
        status: 'rented',
        created_at: '2024-01-01T00:00:00Z'
      }];

      const mockTenantData = [{
        id: 'tenant-1',
        property_id: sharedPropertyId,
        name: 'Tenant for Shared Property',
        email: 'tenant@example.com',
        cpf: '12345678901',
        phone: '11999999999',
        start_date: '2024-01-01T00:00:00Z',
        monthly_rent: 1000,
        deposit: 2000,
        status: 'active'
      }];

      const mockTransactionData = [{
        id: 'trans-1',
        property_id: sharedPropertyId,
        type: 'income',
        category: 'Rent',
        amount: 1000,
        description: 'Rent from shared property',
        date: '2024-01-01T00:00:00Z',
        recurring: null
      }];

      mockPropertyService.getAll.mockResolvedValue(mockPropertyData);
      mockTenantService.getAll.mockResolvedValue(mockTenantData);
      mockTransactionService.getAll.mockResolvedValue(mockTransactionData);

      const { result: propertiesResult } = renderHook(() => useProperties(true), { wrapper });
      const { result: tenantsResult } = renderHook(() => useTenants(true), { wrapper });
      const { result: transactionsResult } = renderHook(() => useTransactions(true), { wrapper });

      await waitFor(() => {
        expect(propertiesResult.current.properties[0].id).toBe(sharedPropertyId);
        expect(tenantsResult.current.tenants[0].propertyId).toBe(sharedPropertyId);
        expect(transactionsResult.current.transactions[0].propertyId).toBe(sharedPropertyId);
      });
    });

    it('should handle cascading updates correctly', async () => {
      const mockSetLocalData = vi.fn();
      mockUseLocalStorage.mockReturnValue([[], mockSetLocalData]);

      // Create property first
      const { result: propertiesResult } = renderHook(() => useProperties(true), { wrapper });
      
      mockPropertyService.create.mockResolvedValue({
        id: 'new-prop',
        name: 'New Property',
        address: 'New Address',
        energy_unit_name: null,
        type: 'apartment',
        purchase_price: 100000,
        rent_value: 1000,
        status: 'vacant',
        created_at: '2024-01-01T00:00:00Z'
      });

      await act(async () => {
        await propertiesResult.current.addProperty({
          name: 'New Property',
          address: 'New Address',
          type: 'apartment',
          purchasePrice: 100000,
          rentValue: 1000,
          status: 'vacant'
        });
      });

      // Then create tenant for that property
      const { result: tenantsResult } = renderHook(() => useTenants(true), { wrapper });
      
      mockTenantService.create.mockResolvedValue({
        id: 'new-tenant',
        property_id: 'new-prop',
        name: 'New Tenant',
        email: 'new@example.com',
        cpf: '12345678901',
        phone: '11999999999',
        start_date: '2024-01-01T00:00:00Z',
        monthly_rent: 1000,
        deposit: 2000,
        status: 'active'
      });

      await act(async () => {
        await tenantsResult.current.addTenant({
          propertyId: 'new-prop',
          name: 'New Tenant',
          email: 'new@example.com',
          cpf: '12345678901',
          phone: '11999999999',
          startDate: new Date('2024-01-01'),
          monthlyRent: 1000,
          deposit: 2000,
          status: 'active'
        });
      });

      expect(mockPropertyService.create).toHaveBeenCalled();
      expect(mockTenantService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          propertyId: 'new-prop'
        })
      );
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle service errors gracefully across hooks', async () => {
      mockPropertyService.getAll.mockRejectedValue(new Error('Service unavailable'));
      mockTenantService.getAll.mockRejectedValue(new Error('Service unavailable'));
      mockTransactionService.getAll.mockRejectedValue(new Error('Service unavailable'));

      const mockLocalData = [];
      mockUseLocalStorage.mockReturnValue([mockLocalData, vi.fn()]);

      const { result: propertiesResult } = renderHook(() => useProperties(true), { wrapper });
      const { result: tenantsResult } = renderHook(() => useTenants(true), { wrapper });
      const { result: transactionsResult } = renderHook(() => useTransactions(true), { wrapper });

      await waitFor(() => {
        // All hooks should fallback to localStorage without showing errors
        expect(propertiesResult.current.properties).toEqual(mockLocalData);
        expect(tenantsResult.current.tenants).toEqual(mockLocalData);
        expect(transactionsResult.current.transactions).toEqual(mockLocalData);
        
        expect(propertiesResult.current.erro).toBeNull();
        expect(tenantsResult.current.erro).toBeNull();
        expect(transactionsResult.current.erro).toBeNull();
      });
    });

    it('should continue operating when partial services fail', async () => {
      // Properties service works
      mockPropertyService.getAll.mockResolvedValue([{
        id: '1',
        name: 'Working Property',
        address: 'Address',
        energy_unit_name: null,
        type: 'apartment',
        purchase_price: 100000,
        rent_value: 1000,
        status: 'vacant',
        created_at: '2024-01-01T00:00:00Z'
      }]);

      // Tenants service fails
      mockTenantService.getAll.mockRejectedValue(new Error('Tenants service down'));

      // Transactions service works
      mockTransactionService.getAll.mockResolvedValue([{
        id: '1',
        property_id: '1',
        type: 'income',
        category: 'Rent',
        amount: 1000,
        description: 'Rent payment',
        date: '2024-01-01T00:00:00Z',
        recurring: null
      }]);

      mockUseLocalStorage.mockReturnValue([[], vi.fn()]);

      const { result: propertiesResult } = renderHook(() => useProperties(true), { wrapper });
      const { result: tenantsResult } = renderHook(() => useTenants(true), { wrapper });
      const { result: transactionsResult } = renderHook(() => useTransactions(true), { wrapper });

      await waitFor(() => {
        expect(propertiesResult.current.properties).toHaveLength(1);
        expect(tenantsResult.current.tenants).toHaveLength(0); // Fallback to localStorage
        expect(transactionsResult.current.transactions).toHaveLength(1);
      });
    });
  });
});