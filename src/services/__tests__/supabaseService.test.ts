import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  propertyService, 
  tenantService, 
  transactionService,
  mappers
} from '../supabaseService';
import { Property, Tenant, Transaction } from '../../types';

// Mock do supabase
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      order: vi.fn(() => ({
        data: [],
        error: null
      }))
    })),
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(() => ({
          data: {},
          error: null
        }))
      }))
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: {},
            error: null
          }))
        }))
      }))
    })),
    delete: vi.fn(() => ({
      eq: vi.fn(() => ({
        error: null
      }))
    }))
  }))
};

vi.mock('../../lib/supabaseClient', () => ({
  supabase: mockSupabase
}));

describe('🗄️ Supabase Services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock chains
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [], error: null })
      }),
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: {}, error: null })
        })
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: {}, error: null })
          })
        })
      }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null })
      })
    });
  });

  describe('Property Service', () => {
    describe('getAll', () => {
      it('should fetch all properties with tenants', async () => {
        const mockData = [
          {
            id: '1',
            name: 'Property 1',
            address: 'Address 1',
            type: 'apartment',
            purchase_price: 100000,
            rent_value: 1000,
            status: 'rented',
            created_at: '2024-01-01T00:00:00Z',
            tenants: []
          }
        ];

        const selectMock = vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: mockData, error: null })
        });
        
        mockSupabase.from.mockReturnValue({ select: selectMock });

        const result = await propertyService.getAll();

        expect(mockSupabase.from).toHaveBeenCalledWith('properties');
        expect(selectMock).toHaveBeenCalledWith(expect.stringContaining('tenants'));
        expect(result).toEqual(mockData);
      });

      it('should handle errors gracefully', async () => {
        const selectMock = vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ 
            data: null, 
            error: { message: 'Database error' } 
          })
        });
        
        mockSupabase.from.mockReturnValue({ select: selectMock });

        await expect(propertyService.getAll()).rejects.toThrow();
      });
    });

    describe('create', () => {
      it('should create new property with correct mapping', async () => {
        const propertyData: Omit<Property, 'id' | 'createdAt'> = {
          name: 'New Property',
          address: 'New Address',
          energyUnitName: 'Unit-01',
          type: 'apartment',
          purchasePrice: 200000,
          rentValue: 1500,
          status: 'vacant'
        };

        const mockCreated = {
          id: 'new-id',
          name: 'New Property',
          address: 'New Address',
          energy_unit_name: 'Unit-01',
          type: 'apartment',
          purchase_price: 200000,
          rent_value: 1500,
          status: 'vacant',
          created_at: '2024-01-01T00:00:00Z'
        };

        const insertMock = vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockCreated, error: null })
          })
        });
        
        mockSupabase.from.mockReturnValue({ insert: insertMock });

        const result = await propertyService.create(propertyData);

        expect(mockSupabase.from).toHaveBeenCalledWith('properties');
        expect(insertMock).toHaveBeenCalledWith({
          name: 'New Property',
          address: 'New Address',
          energy_unit_name: 'Unit-01',
          type: 'apartment',
          purchase_price: 200000,
          rent_value: 1500,
          status: 'vacant'
        });
        expect(result).toEqual(mockCreated);
      });

      it('should handle null energyUnitName', async () => {
        const propertyData: Omit<Property, 'id' | 'createdAt'> = {
          name: 'Property',
          address: 'Address',
          type: 'house',
          purchasePrice: 100000,
          rentValue: 1000,
          status: 'vacant'
        };

        const insertMock = vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: {}, error: null })
          })
        });
        
        mockSupabase.from.mockReturnValue({ insert: insertMock });

        await propertyService.create(propertyData);

        expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({
          energy_unit_name: null
        }));
      });
    });

    describe('update', () => {
      it('should update property with partial data', async () => {
        const updates: Partial<Property> = {
          name: 'Updated Name',
          rentValue: 1800
        };

        const updateMock = vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: {}, error: null })
            })
          })
        });
        
        mockSupabase.from.mockReturnValue({ update: updateMock });

        await propertyService.update('123', updates);

        expect(mockSupabase.from).toHaveBeenCalledWith('properties');
        expect(updateMock).toHaveBeenCalledWith({
          name: 'Updated Name',
          rent_value: 1800
        });
      });

      it('should handle undefined values correctly', async () => {
        const updates: Partial<Property> = {
          energyUnitName: undefined
        };

        const updateMock = vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: {}, error: null })
            })
          })
        });
        
        mockSupabase.from.mockReturnValue({ update: updateMock });

        await propertyService.update('123', updates);

        expect(updateMock).toHaveBeenCalledWith({
          energy_unit_name: undefined
        });
      });
    });

    describe('delete', () => {
      it('should delete property by id', async () => {
        const deleteMock = vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null })
        });
        
        mockSupabase.from.mockReturnValue({ delete: deleteMock });

        await propertyService.delete('123');

        expect(mockSupabase.from).toHaveBeenCalledWith('properties');
        expect(deleteMock().eq).toHaveBeenCalledWith('id', '123');
      });
    });
  });

  describe('Tenant Service', () => {
    describe('create', () => {
      it('should create tenant with date conversion', async () => {
        const tenantData: Omit<Tenant, 'id'> = {
          propertyId: 'prop-1',
          name: 'John Doe',
          email: 'john@example.com',
          cpf: '12345678901',
          phone: '11999999999',
          startDate: new Date('2024-01-01'),
          agreedPaymentDate: new Date('2024-01-05'),
          monthlyRent: 1500,
          deposit: 3000,
          paymentMethod: 'À vista',
          installments: '2x',
          depositPaidInstallments: [true, false],
          formalizedContract: true,
          status: 'active'
        };

        const insertMock = vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: {}, error: null })
          })
        });
        
        mockSupabase.from.mockReturnValue({ insert: insertMock });

        await tenantService.create(tenantData);

        expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({
          property_id: 'prop-1',
          name: 'John Doe',
          email: 'john@example.com',
          start_date: '2024-01-01T00:00:00.000Z',
          agreed_payment_date: '2024-01-05T00:00:00.000Z',
          monthly_rent: 1500,
          deposit: 3000
        }));
      });

      it('should handle optional fields correctly', async () => {
        const tenantData: Omit<Tenant, 'id'> = {
          propertyId: 'prop-1',
          name: 'Jane Doe',
          email: 'jane@example.com',
          phone: '11999999999',
          startDate: new Date('2024-01-01'),
          monthlyRent: 1500,
          deposit: 3000,
          status: 'active'
        };

        const insertMock = vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: {}, error: null })
          })
        });
        
        mockSupabase.from.mockReturnValue({ insert: insertMock });

        await tenantService.create(tenantData);

        expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({
          cpf: null,
          agreed_payment_date: null,
          payment_method: null,
          installments: null,
          deposit_paid_installments: null,
          formalized_contract: null
        }));
      });
    });
  });

  describe('Transaction Service', () => {
    describe('create', () => {
      it('should create transaction with proper field mapping', async () => {
        const transactionData: Omit<Transaction, 'id'> = {
          propertyId: 'prop-1',
          type: 'income',
          category: 'Rent',
          amount: 1500,
          description: 'Monthly rent',
          date: new Date('2024-01-01'),
          recurring: {
            frequency: 'monthly',
            nextDate: new Date('2024-02-01')
          }
        };

        const insertMock = vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: {}, error: null })
          })
        });
        
        mockSupabase.from.mockReturnValue({ insert: insertMock });

        await transactionService.create(transactionData);

        expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({
          property_id: 'prop-1',
          type: 'income',
          category: 'Rent',
          amount: 1500,
          description: 'Monthly rent',
          date: '2024-01-01T00:00:00.000Z',
          recurring: {
            frequency: 'monthly',
            nextDate: new Date('2024-02-01')
          }
        }));
      });

      it('should handle null description', async () => {
        const transactionData: Omit<Transaction, 'id'> = {
          propertyId: 'prop-1',
          type: 'expense',
          category: 'Maintenance',
          amount: 200,
          description: '',
          date: new Date('2024-01-01')
        };

        const insertMock = vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: {}, error: null })
          })
        });
        
        mockSupabase.from.mockReturnValue({ insert: insertMock });

        await transactionService.create(transactionData);

        expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({
          description: null
        }));
      });
    });
  });

  describe('Mappers', () => {
    describe('propertyFromSupabase', () => {
      it('should map Supabase data to Property interface', () => {
        const supabaseData = {
          id: '1',
          name: 'Test Property',
          address: 'Test Address',
          energy_unit_name: 'Unit-01',
          type: 'apartment',
          purchase_price: 100000,
          rent_value: 1500,
          status: 'rented',
          created_at: '2024-01-01T00:00:00Z',
          tenants: []
        };

        const result = mappers.propertyFromSupabase(supabaseData);

        expect(result).toEqual({
          id: '1',
          name: 'Test Property',
          address: 'Test Address',
          energyUnitName: 'Unit-01',
          type: 'apartment',
          purchasePrice: 100000,
          rentValue: 1500,
          status: 'rented',
          createdAt: new Date('2024-01-01T00:00:00Z'),
          tenant: undefined
        });
      });

      it('should map tenant data when present', () => {
        const supabaseData = {
          id: '1',
          name: 'Test Property',
          address: 'Test Address',
          energy_unit_name: null,
          type: 'apartment',
          purchase_price: 100000,
          rent_value: 1500,
          status: 'rented',
          created_at: '2024-01-01T00:00:00Z',
          tenants: [{
            id: 'tenant-1',
            name: 'John Doe',
            email: 'john@example.com',
            cpf: '12345678901',
            phone: '11999999999',
            start_date: '2024-01-01T00:00:00Z',
            agreed_payment_date: null,
            monthly_rent: 1500,
            deposit: 3000,
            payment_method: 'À vista',
            installments: null,
            deposit_paid_installments: null,
            formalized_contract: true,
            status: 'active'
          }]
        };

        const result = mappers.propertyFromSupabase(supabaseData);

        expect(result.tenant).toBeDefined();
        expect(result.tenant?.name).toBe('John Doe');
        expect(result.tenant?.startDate).toBeInstanceOf(Date);
        expect(result.tenant?.agreedPaymentDate).toBeUndefined();
      });
    });

    describe('tenantFromSupabase', () => {
      it('should map Supabase tenant data correctly', () => {
        const supabaseData = {
          id: 'tenant-1',
          property_id: 'prop-1',
          name: 'John Doe',
          email: 'john@example.com',
          cpf: '12345678901',
          phone: '11999999999',
          start_date: '2024-01-01T00:00:00Z',
          agreed_payment_date: '2024-01-05T00:00:00Z',
          monthly_rent: 1500,
          deposit: 3000,
          payment_method: 'À vista',
          installments: '2x',
          deposit_paid_installments: [true, false],
          formalized_contract: true,
          status: 'active'
        };

        const result = mappers.tenantFromSupabase(supabaseData);

        expect(result).toEqual({
          id: 'tenant-1',
          propertyId: 'prop-1',
          name: 'John Doe',
          email: 'john@example.com',
          cpf: '12345678901',
          phone: '11999999999',
          startDate: new Date('2024-01-01T00:00:00Z'),
          agreedPaymentDate: new Date('2024-01-05T00:00:00Z'),
          monthlyRent: 1500,
          deposit: 3000,
          paymentMethod: 'À vista',
          installments: '2x',
          depositPaidInstallments: [true, false],
          formalizedContract: true,
          status: 'active'
        });
      });

      it('should handle null agreed_payment_date', () => {
        const supabaseData = {
          id: 'tenant-1',
          property_id: 'prop-1',
          name: 'Jane Doe',
          email: 'jane@example.com',
          cpf: null,
          phone: '11999999999',
          start_date: '2024-01-01T00:00:00Z',
          agreed_payment_date: null,
          monthly_rent: 1500,
          deposit: 3000,
          payment_method: null,
          installments: null,
          deposit_paid_installments: null,
          formalized_contract: null,
          status: 'active'
        };

        const result = mappers.tenantFromSupabase(supabaseData);

        expect(result.agreedPaymentDate).toBeUndefined();
        expect(result.cpf).toBeNull();
        expect(result.paymentMethod).toBeNull();
      });
    });

    describe('transactionFromSupabase', () => {
      it('should map transaction data correctly', () => {
        const supabaseData = {
          id: 'trans-1',
          property_id: 'prop-1',
          type: 'income',
          category: 'Rent',
          amount: 1500,
          description: 'Monthly rent payment',
          date: '2024-01-01T00:00:00Z',
          recurring: {
            frequency: 'monthly',
            nextDate: '2024-02-01T00:00:00Z'
          }
        };

        const result = mappers.transactionFromSupabase(supabaseData);

        expect(result).toEqual({
          id: 'trans-1',
          propertyId: 'prop-1',
          type: 'income',
          category: 'Rent',
          amount: 1500,
          description: 'Monthly rent payment',
          date: new Date('2024-01-01T00:00:00Z'),
          recurring: {
            frequency: 'monthly',
            nextDate: '2024-02-01T00:00:00Z'
          }
        });
      });

      it('should handle null recurring field', () => {
        const supabaseData = {
          id: 'trans-1',
          property_id: 'prop-1',
          type: 'expense',
          category: 'Maintenance',
          amount: 200,
          description: 'One-time repair',
          date: '2024-01-01T00:00:00Z',
          recurring: null
        };

        const result = mappers.transactionFromSupabase(supabaseData);

        expect(result.recurring).toBeNull();
      });
    });
  });
});