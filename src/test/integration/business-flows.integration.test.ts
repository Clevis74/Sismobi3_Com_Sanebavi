import { describe, it, expect, beforeEach, vi } from 'vitest';
import { calculateFinancialSummary } from '../../utils/calculations';
import { exportBackup, importBackup } from '../../utils/backup';
import { Property, Tenant, Transaction } from '../../types';

describe('🏢 Business Flows Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Complete Property Management Flow', () => {
    it('should handle complete property lifecycle', () => {
      // 1. Create Property
      const property: Property = {
        id: 'prop-1',
        name: 'Test Apartment',
        address: 'Rua das Flores, 123',
        energyUnitName: 'Unit-01',
        type: 'apartment',
        purchasePrice: 250000,
        rentValue: 1800,
        status: 'vacant',
        createdAt: new Date('2024-01-01')
      };

      // 2. Add Tenant
      const tenant: Tenant = {
        id: 'tenant-1',
        propertyId: property.id,
        name: 'João Silva',
        email: 'joao@email.com',
        cpf: '12345678901',
        phone: '11999999999',
        startDate: new Date('2024-01-15'),
        agreedPaymentDate: new Date('2024-01-05'),
        monthlyRent: 1800,
        deposit: 3600,
        paymentMethod: 'À vista',
        formalizedContract: true,
        status: 'active'
      };

      // Update property status to rented
      const rentedProperty: Property = {
        ...property,
        status: 'rented',
        tenant
      };

      const currentDate = new Date();
      const transactions: Transaction[] = [
        {
          id: 'trans-1',
          propertyId: property.id,
          type: 'income',
          category: 'Aluguel',
          amount: 1800,
          description: 'Aluguel mensal - Janeiro',
          date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 5),
          recurring: {
            frequency: 'monthly',
            nextDate: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 5)
          }
        },
        {
          id: 'trans-2',
          propertyId: property.id,
          type: 'income',
          category: 'Caução',
          amount: 3600,
          description: 'Depósito caução',
          date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15)
        },
        {
          id: 'trans-3',
          propertyId: property.id,
          type: 'expense',
          category: 'Manutenção',
          amount: 150,
          description: 'Reparo torneira',
          date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 20)
        }
      ];

      // 4. Calculate Financial Summary
      const summary = calculateFinancialSummary([rentedProperty], transactions);

      expect(summary.totalProperties).toBe(1);
      expect(summary.rentedProperties).toBe(1);
      expect(summary.occupancyRate).toBe(100);
      expect(summary.totalIncome).toBe(5400); // 1800 + 3600
      expect(summary.totalExpenses).toBe(150);
      expect(summary.netIncome).toBe(5250);
      expect(summary.monthlyROI).toBeCloseTo(2.1, 1); // (5250/250000) * 100
    });

    it('should handle property with multiple tenants over time', () => {
      const property: Property = {
        id: 'prop-1',
        name: 'Rotating Apartment',
        address: 'Rua da Mudança, 456',
        type: 'apartment',
        purchasePrice: 200000,
        rentValue: 1500,
        status: 'rented',
        createdAt: new Date('2024-01-01')
      };

      // First tenant (Jan-Jun)
      const firstTenant: Tenant = {
        id: 'tenant-1',
        propertyId: property.id,
        name: 'Maria Santos',
        email: 'maria@email.com',
        cpf: '98765432101',
        phone: '11888888888',
        startDate: new Date('2024-01-01'),
        monthlyRent: 1500,
        deposit: 3000,
        status: 'inactive' // Left
      };

      // Second tenant (Jul-Dec)
      const secondTenant: Tenant = {
        id: 'tenant-2', 
        propertyId: property.id,
        name: 'Pedro Oliveira',
        email: 'pedro@email.com',
        cpf: '11223344501',
        phone: '11777777777',
        startDate: new Date('2024-07-01'),
        monthlyRent: 1600, // Rent increase
        deposit: 3200,
        status: 'active'
      };

      const transactions: Transaction[] = [
        // First tenant transactions
        {
          id: 'trans-1',
          propertyId: property.id,
          type: 'income',
          category: 'Aluguel',
          amount: 1500,
          description: 'Aluguel Janeiro - Maria',
          date: new Date(new Date().getFullYear(), 0, 5) // Janeiro do ano atual
        },
        // Gap period expense
        {
          id: 'trans-2',
          propertyId: property.id,
          type: 'expense',
          category: 'Reforma',
          amount: 2000,
          description: 'Pintura entre inquilinos',
          date: new Date('2024-06-15')
        },
        // Second tenant transactions  
        {
          id: 'trans-3',
          propertyId: property.id,
          type: 'income',
          category: 'Aluguel',
          amount: 1600,
          description: 'Aluguel Julho - Pedro',
          date: new Date('2024-07-05')
        }
      ];

      // Test current month summary
      const now = new Date();
      const currentMonthSummary = calculateFinancialSummary([property], 
        transactions.filter(t => t.date.getMonth() === now.getMonth() && t.date.getFullYear() === now.getFullYear())
      );

      expect(currentMonthSummary.totalIncome).toBe(1500);
      expect(currentMonthSummary.totalExpenses).toBe(0);
      expect(currentMonthSummary.netIncome).toBe(1500);
    });
  });

  describe('Financial Calculations Integration', () => {
    it('should calculate portfolio performance across multiple properties', () => {
      const properties: Property[] = [
        {
          id: 'prop-1',
          name: 'Apartamento Centro',
          address: 'Centro, 100',
          type: 'apartment',
          purchasePrice: 300000,
          rentValue: 2000,
          status: 'rented',
          createdAt: new Date('2024-01-01')
        },
        {
          id: 'prop-2',
          name: 'Casa Jardim',
          address: 'Jardim, 200',
          type: 'house',
          purchasePrice: 400000,
          rentValue: 2500,
          status: 'rented',
          createdAt: new Date('2024-01-01')
        },
        {
          id: 'prop-3',
          name: 'Loja Comercial',
          address: 'Comercial, 300',
          type: 'commercial',
          purchasePrice: 500000,
          rentValue: 4000,
          status: 'vacant',
          createdAt: new Date('2024-01-01')
        }
      ];

      const currentDate = new Date();
      const transactions: Transaction[] = [
        // Property 1 - Consistent renter
        {
          id: 'trans-1',
          propertyId: 'prop-1',
          type: 'income',
          category: 'Aluguel',
          amount: 2000,
          description: 'Aluguel mensal',
          date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 5)
        },
        {
          id: 'trans-2',
          propertyId: 'prop-1',
          type: 'expense',
          category: 'Condomínio',
          amount: 300,
          description: 'Taxa condomínio',
          date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 10)
        },
        
        // Property 2 - Consistent renter with maintenance
        {
          id: 'trans-3',
          propertyId: 'prop-2',
          type: 'income',
          category: 'Aluguel',
          amount: 2500,
          description: 'Aluguel mensal',
          date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 5)
        },
        {
          id: 'trans-4',
          propertyId: 'prop-2',
          type: 'expense',
          category: 'Manutenção',
          amount: 500,
          description: 'Reparo jardim',
          date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15)
        },
        
        // Property 3 - Vacant (only expenses)
        {
          id: 'trans-5',
          propertyId: 'prop-3',
          type: 'expense',
          category: 'IPTU',
          amount: 1000,
          description: 'IPTU anual',
          date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 20)
        }
      ];

      const summary = calculateFinancialSummary(properties, transactions);

      expect(summary.totalProperties).toBe(3);
      expect(summary.rentedProperties).toBe(2);
      expect(summary.occupancyRate).toBeCloseTo(66.67, 2);
      expect(summary.totalIncome).toBe(4500); // 2000 + 2500
      expect(summary.totalExpenses).toBe(1800); // 300 + 500 + 1000
      expect(summary.netIncome).toBe(2700); // 4500 - 1800
      
      const totalInvestment = 300000 + 400000 + 500000; // 1,200,000
      const expectedROI = (2700 / totalInvestment) * 100;
      expect(summary.monthlyROI).toBeCloseTo(expectedROI, 2);
    });

    it('should handle edge cases in financial calculations', () => {
      // Edge case: No properties
      let summary = calculateFinancialSummary([], []);
      expect(summary.occupancyRate).toBe(0);
      expect(summary.monthlyROI).toBe(0);

      // Edge case: Properties with zero purchase price
      const freeProperties: Property[] = [{
        id: 'free-prop',
        name: 'Inherited Property',
        address: 'Free Street, 1',
        type: 'house',
        purchasePrice: 0,
        rentValue: 1000,
        status: 'rented',
        createdAt: new Date()
      }];

      const freeTransactions: Transaction[] = [{
        id: 'trans-1',
        propertyId: 'free-prop',
        type: 'income',
        category: 'Aluguel',
        amount: 1000,
        description: 'Rent from inherited property',
        date: new Date()
      }];

      summary = calculateFinancialSummary(freeProperties, freeTransactions);
      expect(summary.monthlyROI).toBe(0); // Avoid division by zero

      // Edge case: All expenses, no income
      const expenseOnlyTransactions: Transaction[] = [{
        id: 'trans-1',
        propertyId: 'free-prop',
        type: 'expense',
        category: 'Maintenance',
        amount: 500,
        description: 'Repair work',
        date: new Date()
      }];

      summary = calculateFinancialSummary(freeProperties, expenseOnlyTransactions);
      expect(summary.totalIncome).toBe(0);
      expect(summary.totalExpenses).toBe(500);
      expect(summary.netIncome).toBe(-500);
    });
  });

  describe('Data Backup and Restore Flow', () => {
    const mockLocalStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
    };

    beforeEach(() => {
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage
      });
    });

    it('should handle complete backup and restore cycle', async () => {
      // Setup mock data in localStorage
      const mockData = {
        properties: [
          {
            id: 'prop-1',
            name: 'Backup Property',
            address: 'Backup Address',
            type: 'apartment',
            purchasePrice: 100000,
            rentValue: 1000,
            status: 'rented',
            createdAt: '2024-01-01T00:00:00Z'
          }
        ],
        tenants: [
          {
            id: 'tenant-1',
            propertyId: 'prop-1',
            name: 'Backup Tenant',
            email: 'backup@email.com',
            phone: '11999999999',
            startDate: '2024-01-01T00:00:00Z',
            monthlyRent: 1000,
            deposit: 2000,
            status: 'active'
          }
        ],
        transactions: [
          {
            id: 'trans-1',
            propertyId: 'prop-1',
            type: 'income',
            category: 'Aluguel',
            amount: 1000,
            description: 'Monthly rent',
            date: '2024-01-05T00:00:00Z'
          }
        ]
      };

      mockLocalStorage.getItem.mockImplementation((key) => {
        const data = mockData[key as keyof typeof mockData];
        return data ? JSON.stringify(data) : '[]';
      });

      // Export backup
      const backupData = exportBackup();

      expect(backupData).toHaveProperty('properties');
      expect(backupData).toHaveProperty('tenants');
      expect(backupData).toHaveProperty('transactions');
      expect(backupData).toHaveProperty('version', '1.0.0');
      expect(backupData).toHaveProperty('timestamp');
      
      expect(backupData.properties).toEqual(mockData.properties);
      expect(backupData.tenants).toEqual(mockData.tenants);
      expect(backupData.transactions).toEqual(mockData.transactions);

      // Create file for import test
      const backupJson = JSON.stringify(backupData);
      const backupFile = new File([backupJson], 'backup.json', {
        type: 'application/json'
      });

      // Import backup
      const importedData = await importBackup(backupFile);

      expect(importedData).toEqual(backupData);
      expect(importedData.properties).toEqual(mockData.properties);
      expect(importedData.tenants).toEqual(mockData.tenants);
      expect(importedData.transactions).toEqual(mockData.transactions);
    });

    it('should validate backup data integrity', async () => {
      const completeBackup = {
        properties: [{ id: '1', name: 'Property 1' }],
        tenants: [{ id: '1', propertyId: '1', name: 'Tenant 1' }],
        transactions: [{ id: '1', propertyId: '1', amount: 1000 }],
        documents: [{ id: '1', propertyId: '1', type: 'Contract' }],
        energyBills: [{ id: '1', amount: 100 }],
        waterBills: [{ id: '1', amount: 50 }],
        informors: [{ id: '1', nome: 'ITR', valor: 200 }],
        version: '1.0.0',
        timestamp: '2024-01-01T00:00:00Z'
      };

      const backupFile = new File([JSON.stringify(completeBackup)], 'complete-backup.json');
      const imported = await importBackup(backupFile);

      expect(imported).toEqual(completeBackup);
    });

    it('should handle partial backup data', async () => {
      const partialBackup = {
        properties: [{ id: '1', name: 'Only Property' }],
        version: '1.0.0',
        timestamp: '2024-01-01T00:00:00Z'
      };

      const backupFile = new File([JSON.stringify(partialBackup)], 'partial-backup.json');
      const imported = await importBackup(backupFile);

      expect(imported.properties).toEqual(partialBackup.properties);
      expect(imported.tenants).toBeUndefined();
      expect(imported.transactions).toBeUndefined();
    });
  });

  describe('Data Consistency Validation', () => {
    it('should validate referential integrity between entities', () => {
      const properties: Property[] = [
        {
          id: 'prop-1',
          name: 'Property 1',
          address: 'Address 1',
          type: 'apartment',
          purchasePrice: 100000,
          rentValue: 1000,
          status: 'rented',
          createdAt: new Date('2024-01-01')
        }
      ];

      const tenants: Tenant[] = [
        {
          id: 'tenant-1',
          propertyId: 'prop-1', // Valid reference
          name: 'Valid Tenant',
          email: 'valid@email.com',
          cpf: '12345678901',
          phone: '11999999999',
          startDate: new Date('2024-01-01'),
          monthlyRent: 1000,
          deposit: 2000,
          status: 'active'
        },
        {
          id: 'tenant-2',
          propertyId: 'prop-999', // Invalid reference
          name: 'Orphan Tenant',
          email: 'orphan@email.com',
          cpf: '98765432101',
          phone: '11888888888',
          startDate: new Date('2024-01-01'),
          monthlyRent: 1000,
          deposit: 2000,
          status: 'active'
        }
      ];

      const transactions: Transaction[] = [
        {
          id: 'trans-1',
          propertyId: 'prop-1', // Valid reference
          type: 'income',
          category: 'Aluguel',
          amount: 1000,
          description: 'Valid transaction',
          date: new Date('2024-01-05')
        },
        {
          id: 'trans-2',
          propertyId: 'prop-999', // Invalid reference
          type: 'income',
          category: 'Aluguel',
          amount: 1000,
          description: 'Orphan transaction',
          date: new Date('2024-01-05')
        }
      ];

      // Validation functions (these would be implemented in the actual app)
      const validateDataConsistency = () => {
        const propertyIds = new Set(properties.map(p => p.id));
        
        const orphanTenants = tenants.filter(t => !propertyIds.has(t.propertyId));
        const orphanTransactions = transactions.filter(t => !propertyIds.has(t.propertyId));
        
        return {
          isValid: orphanTenants.length === 0 && orphanTransactions.length === 0,
          orphanTenants,
          orphanTransactions
        };
      };

      const validation = validateDataConsistency();
      
      expect(validation.isValid).toBe(false);
      expect(validation.orphanTenants).toHaveLength(1);
      expect(validation.orphanTenants[0].id).toBe('tenant-2');
      expect(validation.orphanTransactions).toHaveLength(1);
      expect(validation.orphanTransactions[0].id).toBe('trans-2');
    });

    it('should validate business rules', () => {
      const validateBusinessRules = (property: Property, tenant: Tenant, transactions: Transaction[]) => {
        const issues: string[] = [];

        // Rule 1: Tenant's monthly rent should match property's rent value
        if (tenant.monthlyRent !== property.rentValue) {
          issues.push(`Tenant rent (${tenant.monthlyRent}) doesn't match property rent (${property.rentValue})`);
        }

        // Rule 2: Property marked as rented should have active tenant
        if (property.status === 'rented' && tenant.status !== 'active') {
          issues.push('Property marked as rented but tenant is not active');
        }

        // Rule 3: Rent transactions should match tenant's monthly rent
        const rentTransactions = transactions.filter(t => 
          t.type === 'income' && 
          t.category === 'Aluguel' && 
          t.propertyId === property.id
        );

        for (const rentTransaction of rentTransactions) {
          if (rentTransaction.amount !== tenant.monthlyRent) {
            issues.push(`Rent transaction amount (${rentTransaction.amount}) doesn't match tenant's monthly rent (${tenant.monthlyRent})`);
          }
        }

        return {
          isValid: issues.length === 0,
          issues
        };
      };

      // Test valid scenario
      const validProperty: Property = {
        id: 'prop-1',
        name: 'Valid Property',
        address: 'Valid Address',
        type: 'apartment',
        purchasePrice: 100000,
        rentValue: 1500,
        status: 'rented',
        createdAt: new Date()
      };

      const validTenant: Tenant = {
        id: 'tenant-1',
        propertyId: 'prop-1',
        name: 'Valid Tenant',
        email: 'valid@email.com',
        cpf: '12345678901',
        phone: '11999999999',
        startDate: new Date(),
        monthlyRent: 1500,
        deposit: 3000,
        status: 'active'
      };

      const validTransactions: Transaction[] = [{
        id: 'trans-1',
        propertyId: 'prop-1',
        type: 'income',
        category: 'Aluguel',
        amount: 1500,
        description: 'Monthly rent',
        date: new Date()
      }];

      let validation = validateBusinessRules(validProperty, validTenant, validTransactions);
      expect(validation.isValid).toBe(true);
      expect(validation.issues).toHaveLength(0);

      // Test invalid scenario
      const invalidTenant: Tenant = {
        ...validTenant,
        monthlyRent: 1200, // Different from property rent
        status: 'inactive'
      };

      const invalidTransactions: Transaction[] = [{
        ...validTransactions[0],
        amount: 1000 // Different from tenant rent
      }];

      validation = validateBusinessRules(validProperty, invalidTenant, invalidTransactions);
      expect(validation.isValid).toBe(false);
      expect(validation.issues).toHaveLength(3);
      expect(validation.issues).toContain("Tenant rent (1200) doesn't match property rent (1500)");
      expect(validation.issues).toContain('Property marked as rented but tenant is not active');
      expect(validation.issues).toContain("Rent transaction amount (1000) doesn't match tenant's monthly rent (1200)");
    });
  });
});