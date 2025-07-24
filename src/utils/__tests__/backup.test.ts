import { describe, it, expect, beforeEach, vi } from 'vitest';
import { exportBackup, importBackup, downloadBackup, BackupData } from '../backup';

// Mock do localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Mock do createElement e click para testar download
const mockLink = {
  setAttribute: vi.fn(),
  click: vi.fn(),
};
vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);

describe('📦 Backup Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('exportBackup', () => {
    it('should export all data from localStorage', () => {
      // Setup mock data
      const mockData = {
        properties: [{ id: '1', name: 'Property 1' }],
        tenants: [{ id: '1', name: 'Tenant 1' }],
        transactions: [{ id: '1', amount: 1000 }],
        documents: [{ id: '1', type: 'Contract' }],
        energyBills: [{ id: '1', amount: 100 }],
        waterBills: [{ id: '1', amount: 50 }],
        informors: [{ id: '1', nome: 'ITR' }],
      };

      mockLocalStorage.getItem.mockImplementation((key: string) => {
        return JSON.stringify(mockData[key as keyof typeof mockData] || []);
      });

      const backup = exportBackup();

      expect(backup).toHaveProperty('properties');
      expect(backup).toHaveProperty('tenants');
      expect(backup).toHaveProperty('transactions');
      expect(backup).toHaveProperty('documents');
      expect(backup).toHaveProperty('energyBills');
      expect(backup).toHaveProperty('waterBills');
      expect(backup).toHaveProperty('informors');
      expect(backup).toHaveProperty('version', '1.0.0');
      expect(backup).toHaveProperty('timestamp');
      expect(backup.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should handle empty localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const backup = exportBackup();

      expect(backup.properties).toEqual([]);
      expect(backup.tenants).toEqual([]);
      expect(backup.transactions).toEqual([]);
      expect(backup.version).toBe('1.0.0');
      expect(backup.timestamp).toBeDefined();
    });

    it('should handle invalid JSON in localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-json');

      const backup = exportBackup();

      // Deve usar arrays vazios como fallback
      expect(backup.properties).toEqual([]);
      expect(backup.tenants).toEqual([]);
    });
  });

  describe('importBackup', () => {
    it('should import valid backup file', async () => {
      const validBackupData: BackupData = {
        properties: [{ id: '1', name: 'Property 1' } as any],
        tenants: [{ id: '1', name: 'Tenant 1' } as any],
        version: '1.0.0',
        timestamp: '2024-01-01T00:00:00Z'
      };

      const mockFile = new File([JSON.stringify(validBackupData)], 'backup.json', {
        type: 'application/json'
      });

      const result = await importBackup(mockFile);

      expect(result).toEqual(validBackupData);
    });

    it('should reject invalid backup format', async () => {
      const invalidBackupData = {
        // Missing version and timestamp
        properties: [{ id: '1', name: 'Property 1' }]
      };

      const mockFile = new File([JSON.stringify(invalidBackupData)], 'backup.json', {
        type: 'application/json'
      });

      await expect(importBackup(mockFile)).rejects.toThrow('Formato de backup inválido');
    });

    it('should reject invalid JSON', async () => {
      const mockFile = new File(['invalid-json'], 'backup.json', {
        type: 'application/json'
      });

      await expect(importBackup(mockFile)).rejects.toThrow('Erro ao processar arquivo de backup');
    });

    it('should handle file reading errors', async () => {
      // Criar um mock que simula erro na leitura
      const mockFile = {
        ...new File(['test'], 'backup.json'),
        // Forçar erro no FileReader
      } as File;

      // Mock FileReader para simular erro
      const originalFileReader = global.FileReader;
      global.FileReader = vi.fn().mockImplementation(() => ({
        readAsText: vi.fn().mockImplementation(function() {
          setTimeout(() => this.onerror?.(), 0);
        })
      })) as any;

      await expect(importBackup(mockFile)).rejects.toThrow('Erro ao ler arquivo');

      // Restaurar FileReader original
      global.FileReader = originalFileReader;
    });
  });

  describe('downloadBackup', () => {
    it('should create download link with correct attributes', () => {
      mockLocalStorage.getItem.mockReturnValue('[]');
      
      downloadBackup();

      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(mockLink.setAttribute).toHaveBeenCalledWith('href', expect.stringContaining('data:application/json'));
      expect(mockLink.setAttribute).toHaveBeenCalledWith('download', expect.stringMatching(/sismobi-backup-\d{4}-\d{2}-\d{2}\.json/));
      expect(mockLink.click).toHaveBeenCalled();
    });

    it('should include current date in filename', () => {
      mockLocalStorage.getItem.mockReturnValue('[]');
      const today = new Date().toISOString().split('T')[0];
      
      downloadBackup();

      const downloadCall = mockLink.setAttribute.mock.calls.find(
        call => call[0] === 'download'
      );
      expect(downloadCall?.[1]).toContain(today);
    });

    it('should create valid data URI', () => {
      const mockData = { properties: [{ id: '1', name: 'Test' }] };
      mockLocalStorage.getItem.mockImplementation((key) => 
        key === 'properties' ? JSON.stringify(mockData.properties) : '[]'
      );
      
      downloadBackup();

      const hrefCall = mockLink.setAttribute.mock.calls.find(
        call => call[0] === 'href'
      );
      expect(hrefCall?.[1]).toMatch(/^data:application\/json;charset=utf-8,/);
    });
  });

  describe('BackupData interface validation', () => {
    it('should accept complete backup data', () => {
      const completeBackup: BackupData = {
        properties: [],
        tenants: [],
        transactions: [],
        documents: [],
        energyBills: [],
        waterBills: [],
        informors: [],
        version: '1.0.0',
        timestamp: new Date().toISOString()
      };

      expect(completeBackup).toBeDefined();
      expect(completeBackup.version).toBe('1.0.0');
      expect(completeBackup.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('should accept minimal backup data', () => {
      const minimalBackup: BackupData = {
        version: '1.0.0',
        timestamp: new Date().toISOString()
      };

      expect(minimalBackup).toBeDefined();
      expect(minimalBackup.properties).toBeUndefined();
      expect(minimalBackup.version).toBe('1.0.0');
    });
  });
});