import { describe, it, expect, beforeEach } from 'vitest';
import { 
  calculateFinancialSummary,
  formatCurrency,
  formatCurrencyWithVisibility,
  formatDate,
  createLocalDate,
  isDateInCurrentMonth
} from '../calculations';
import { Property, Transaction } from '../../types';

describe('🧮 Calculations Utils', () => {
  let mockProperties: Property[];
  let mockTransactions: Transaction[];

  beforeEach(() => {
    // Setup dados de teste
    mockProperties = [
      {
        id: '1',
        name: 'Apartamento 101',
        address: 'Rua A, 123',
        type: 'apartment',
        purchasePrice: 200000,
        rentValue: 1500,
        status: 'rented',
        createdAt: new Date('2024-01-01')
      },
      {
        id: '2', 
        name: 'Casa Residencial',
        address: 'Rua B, 456',
        type: 'house',
        purchasePrice: 300000,
        rentValue: 2000,
        status: 'vacant',
        createdAt: new Date('2024-01-15')
      },
      {
        id: '3',
        name: 'Loja Comercial',
        address: 'Av C, 789',
        type: 'commercial',
        purchasePrice: 150000,
        rentValue: 3000,
        status: 'rented',
        createdAt: new Date('2024-02-01')
      }
    ];

    const currentDate = new Date();
    mockTransactions = [
      {
        id: '1',
        propertyId: '1',
        type: 'income',
        category: 'Aluguel',
        amount: 1500,
        description: 'Aluguel mensal apartamento 101',
        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 5)
      },
      {
        id: '2',
        propertyId: '3',
        type: 'income', 
        category: 'Aluguel',
        amount: 3000,
        description: 'Aluguel loja comercial',
        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 10)
      },
      {
        id: '3',
        propertyId: '1',
        type: 'expense',
        category: 'Manutenção',
        amount: 200,
        description: 'Reparo hidráulico',
        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15)
      },
      {
        id: '4',
        propertyId: '2',
        type: 'expense',
        category: 'IPTU',
        amount: 500,
        description: 'IPTU anual',
        date: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 20) // Mês anterior
      }
    ];
  });

  describe('calculateFinancialSummary', () => {
    it('should calculate correct financial summary for current month', () => {
      const summary = calculateFinancialSummary(mockProperties, mockTransactions);

      expect(summary.totalIncome).toBe(4500); // 1500 + 3000
      expect(summary.totalExpenses).toBe(200); // apenas transação do mês atual
      expect(summary.netIncome).toBe(4300); // 4500 - 200
      expect(summary.totalProperties).toBe(3);
      expect(summary.rentedProperties).toBe(2);
      expect(summary.occupancyRate).toBeCloseTo(66.67); // 2/3 * 100, arredondado
    });

    it('should calculate correct ROI', () => {
      const summary = calculateFinancialSummary(mockProperties, mockTransactions);
      const totalInvestment = 200000 + 300000 + 150000; // 650000
      const expectedROI = (4300 / totalInvestment) * 100;

      expect(summary.monthlyROI).toBeCloseTo(expectedROI, 2);
    });

    it('should handle empty arrays', () => {
      const summary = calculateFinancialSummary([], []);

      expect(summary.totalIncome).toBe(0);
      expect(summary.totalExpenses).toBe(0);
      expect(summary.netIncome).toBe(0);
      expect(summary.totalProperties).toBe(0);
      expect(summary.rentedProperties).toBe(0);
      expect(summary.occupancyRate).toBe(0);
      expect(summary.monthlyROI).toBe(0);
    });

    it('should only consider current month transactions', () => {
      // Adicionar transação de mês diferente
      const futureTransaction: Transaction = {
        id: '5',
        propertyId: '1',
        type: 'income',
        category: 'Aluguel',
        amount: 1500,
        description: 'Aluguel futuro',
        date: new Date(2025, 11, 1) // Dezembro 2025
      };

      const transactionsWithFuture = [...mockTransactions, futureTransaction];
      const summary = calculateFinancialSummary(mockProperties, transactionsWithFuture);

      // Não deve incluir a transação futura
      expect(summary.totalIncome).toBe(4500); // Mesmo valor anterior
    });
  });

  describe('formatCurrency', () => {
    it('should format currency in Brazilian format', () => {
      const result1 = formatCurrency(1500);
      const result2 = formatCurrency(0);
      const result3 = formatCurrency(999999.99);
      
      expect(result1).toMatch(/R\$\s*1\.500,00/);
      expect(result2).toMatch(/R\$\s*0,00/);
      expect(result3).toMatch(/R\$\s*999\.999,99/);
    });

    it('should handle negative values', () => {
      const result = formatCurrency(-500);
      expect(result).toMatch(/-R\$\s*500,00/);
    });

    it('should handle decimal values', () => {
      expect(formatCurrency(1500.50)).toBe('R$ 1.500,50');
      expect(formatCurrency(1500.1)).toBe('R$ 1.500,10');
    });
  });

  describe('formatCurrencyWithVisibility', () => {
    it('should format currency when showValues is true', () => {
      expect(formatCurrencyWithVisibility(1500, true)).toBe('R$ 1.500,00');
      expect(formatCurrencyWithVisibility(0, true)).toBe('R$ 0,00');
    });

    it('should hide values when showValues is false', () => {
      expect(formatCurrencyWithVisibility(1500, false)).toBe('••••');
      expect(formatCurrencyWithVisibility(999999, false)).toBe('••••');
      expect(formatCurrencyWithVisibility(0, false)).toBe('••••');
    });

    it('should default to showing values when no parameter provided', () => {
      expect(formatCurrencyWithVisibility(1500)).toBe('R$ 1.500,00');
    });
  });

  describe('formatDate', () => {
    it('should format date in Brazilian format', () => {
      const date = new Date(2024, 0, 15); // 15 de Janeiro de 2024
      const formatted = formatDate(date);
      
      expect(formatted).toBe('15/01/2024');
    });

    it('should handle different dates correctly', () => {
      expect(formatDate(new Date(2024, 11, 31))).toBe('31/12/2024');
      expect(formatDate(new Date(2024, 6, 4))).toBe('04/07/2024');
    });
  });

  describe('createLocalDate', () => {
    it('should create local date from YYYY-MM-DD string', () => {
      const date = createLocalDate('2024-01-15');
      
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(0); // Janeiro = 0
      expect(date.getDate()).toBe(15);
    });

    it('should handle edge cases', () => {
      const leapYearDate = createLocalDate('2024-02-29');
      expect(leapYearDate.getMonth()).toBe(1); // Fevereiro
      expect(leapYearDate.getDate()).toBe(29);
    });

    it('should fallback to new Date() for other formats', () => {
      const isoDate = createLocalDate('2024-01-15T10:30:00Z');
      expect(isoDate).toBeInstanceOf(Date);
    });

    it('should handle invalid dates gracefully', () => {
      const invalidDate = createLocalDate('invalid-date');
      expect(invalidDate).toBeInstanceOf(Date);
    });
  });

  describe('isDateInCurrentMonth', () => {
    it('should return true for dates in current month', () => {
      const now = new Date();
      const currentMonthDate = new Date(now.getFullYear(), now.getMonth(), 15);
      
      expect(isDateInCurrentMonth(currentMonthDate)).toBe(true);
    });

    it('should return false for dates in different months', () => {
      const now = new Date();
      const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 15);
      const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 15);
      
      expect(isDateInCurrentMonth(lastMonthDate)).toBe(false);
      expect(isDateInCurrentMonth(nextMonthDate)).toBe(false);
    });

    it('should return false for dates in different years', () => {
      const now = new Date();
      const lastYearDate = new Date(now.getFullYear() - 1, now.getMonth(), 15);
      const nextYearDate = new Date(now.getFullYear() + 1, now.getMonth(), 15);
      
      expect(isDateInCurrentMonth(lastYearDate)).toBe(false);
      expect(isDateInCurrentMonth(nextYearDate)).toBe(false);
    });

    it('should handle edge cases correctly', () => {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      expect(isDateInCurrentMonth(firstDayOfMonth)).toBe(true);
      expect(isDateInCurrentMonth(lastDayOfMonth)).toBe(true);
    });
  });
});