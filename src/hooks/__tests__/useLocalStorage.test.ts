import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '../useLocalStorage';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

describe('🔗 useLocalStorage Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should return initial value when localStorage is empty', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial-value'));
      
      expect(result.current[0]).toBe('initial-value');
    });

    it('should return stored value from localStorage', () => {
      const storedValue = { test: 'stored-data' };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(storedValue));
      
      const { result } = renderHook(() => useLocalStorage('test-key', {}));
      
      expect(result.current[0]).toEqual(storedValue);
    });

    it('should handle localStorage read errors gracefully', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });
      
      const { result } = renderHook(() => useLocalStorage('test-key', 'fallback'));
      
      expect(result.current[0]).toBe('fallback');
    });
  });

  describe('Date Revival', () => {
    it('should convert date strings back to Date objects', () => {
      const dataWithDates = {
        id: '1',
        name: 'Test Property',
        createdAt: '2024-01-01T10:00:00Z',
        startDate: '2024-01-15T09:30:00Z'
      };
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(dataWithDates));
      
      const { result } = renderHook(() => useLocalStorage('properties', []));
      
      expect(result.current[0].createdAt).toBeInstanceOf(Date);
      expect(result.current[0].startDate).toBeInstanceOf(Date);
      expect(result.current[0].name).toBe('Test Property');
    });

    it('should handle arrays with date fields', () => {
      const arrayWithDates = [
        {
          id: '1',
          createdAt: '2024-01-01T10:00:00Z',
          date: '2024-01-15T09:30:00Z'
        },
        {
          id: '2', 
          createdAt: '2024-01-02T11:00:00Z',
          date: '2024-01-16T10:30:00Z'
        }
      ];
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(arrayWithDates));
      
      const { result } = renderHook(() => useLocalStorage('transactions', []));
      
      expect(result.current[0]).toHaveLength(2);
      expect(result.current[0][0].createdAt).toBeInstanceOf(Date);
      expect(result.current[0][0].date).toBeInstanceOf(Date);
      expect(result.current[0][1].createdAt).toBeInstanceOf(Date);
    });

    it('should not convert invalid date strings', () => {
      const dataWithInvalidDate = {
        id: '1',
        createdAt: 'invalid-date-string',
        validDate: '2024-01-01T10:00:00Z'
      };
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(dataWithInvalidDate));
      
      const { result } = renderHook(() => useLocalStorage('test', {}));
      
      expect(result.current[0].createdAt).toBe('invalid-date-string');
      expect(result.current[0].validDate).toBeInstanceOf(Date);
    });
  });

  describe('Property-Tenant Synchronization', () => {
    it('should sync properties with active tenants', () => {
      const properties = [
        { id: 'prop1', name: 'Property 1' },
        { id: 'prop2', name: 'Property 2' }
      ];
      
      const tenants = [
        { id: 'tenant1', propertyId: 'prop1', name: 'Tenant 1', status: 'active' },
        { id: 'tenant2', propertyId: 'prop2', name: 'Tenant 2', status: 'inactive' }
      ];
      
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'properties') return JSON.stringify(properties);
        if (key === 'tenants') return JSON.stringify(tenants);
        return null;
      });
      
      const { result } = renderHook(() => useLocalStorage('properties', []));
      
      expect(result.current[0]).toHaveLength(2);
      expect(result.current[0][0].tenant).toEqual(tenants[0]);
      expect(result.current[0][1].tenant).toBeUndefined(); // inactive tenant
    });

    it('should handle missing tenants data gracefully', () => {
      const properties = [{ id: 'prop1', name: 'Property 1' }];
      
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'properties') return JSON.stringify(properties);
        if (key === 'tenants') return null;
        return null;
      });
      
      const { result } = renderHook(() => useLocalStorage('properties', []));
      
      expect(result.current[0]).toEqual(properties);
    });
  });

  describe('Setting Values', () => {
    it('should update localStorage when value changes', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify('initial'));
      
      const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
      
      act(() => {
        result.current[1]('new-value');
      });
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'test-key',
        JSON.stringify('new-value')
      );
      expect(result.current[0]).toBe('new-value');
    });

    it('should handle function updates', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(10));
      
      const { result } = renderHook(() => useLocalStorage('counter', 0));
      
      act(() => {
        result.current[1]((prev) => prev + 5);
      });
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'counter',
        JSON.stringify(15)
      );
      expect(result.current[0]).toBe(15);
    });

    it('should sync properties when tenants are updated', () => {
      const properties = [{ id: 'prop1', name: 'Property 1' }];
      const tenants = [{ id: 'tenant1', propertyId: 'prop1', status: 'active' }];
      
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'properties') return JSON.stringify(properties);
        return null;
      });
      
      const { result } = renderHook(() => useLocalStorage('tenants', []));
      
      act(() => {
        result.current[1](tenants);
      });
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'tenants',
        JSON.stringify(tenants)
      );
      
      // Deve também atualizar properties
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'properties',
        expect.any(String)
      );
    });

    it('should handle localStorage write errors gracefully', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify('initial'));
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });
      
      const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
      
      act(() => {
        result.current[1]('new-value');
      });
      
      // Não deve quebrar a aplicação
      expect(result.current[0]).toBe('new-value');
    });
  });

  describe('Complex Data Structures', () => {
    it('should handle nested objects with dates', () => {
      const complexData = {
        property: {
          id: '1',
          createdAt: '2024-01-01T10:00:00Z',
          tenant: {
            id: 'tenant1',
            startDate: '2024-01-02T09:00:00Z',
            agreedPaymentDate: '2024-01-05T12:00:00Z'
          }
        }
      };
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(complexData));
      
      const { result } = renderHook(() => useLocalStorage('complex', {}));
      
      expect(result.current[0].property.createdAt).toBeInstanceOf(Date);
      expect(result.current[0].property.tenant.startDate).toBeInstanceOf(Date);
      expect(result.current[0].property.tenant.agreedPaymentDate).toBeInstanceOf(Date);
    });

    it('should handle null and undefined values', () => {
      const dataWithNulls = {
        id: '1',
        name: 'Test',
        optionalDate: null,
        undefinedField: undefined,
        validDate: '2024-01-01T10:00:00Z'
      };
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(dataWithNulls));
      
      const { result } = renderHook(() => useLocalStorage('test', {}));
      
      expect(result.current[0].optionalDate).toBeNull();
      expect(result.current[0].validDate).toBeInstanceOf(Date);
    });
  });
});