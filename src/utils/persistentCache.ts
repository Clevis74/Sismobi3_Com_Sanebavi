import { QueryClient } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

// Configuração para cache persistente otimizado
const CACHE_VERSION = '1.0';
const CACHE_MAX_AGE = 24 * 60 * 60 * 1000; // 24 horas

// Criar persister com localStorage
const localStoragePersister = createSyncStoragePersister({
  storage: window.localStorage,
  key: 'SISMOBI_QUERY_CACHE',
  serialize: JSON.stringify,
  deserialize: JSON.parse,
});

// Criar persister com IndexedDB (fallback)
const createIndexedDBPersister = () => {
  return createSyncStoragePersister({
    storage: {
      getItem: (key: string) => {
        return new Promise((resolve, reject) => {
          const request = indexedDB.open('sismobi-cache', 1);
          
          request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains('cache')) {
              db.createObjectStore('cache');
            }
          };
          
          request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['cache'], 'readonly');
            const store = transaction.objectStore('cache');
            const getRequest = store.get(key);
            
            getRequest.onsuccess = () => {
              resolve(getRequest.result || null);
            };
            
            getRequest.onerror = () => {
              reject(getRequest.error);
            };
          };
          
          request.onerror = () => {
            reject(request.error);
          };
        });
      },
      
      setItem: (key: string, value: string) => {
        return new Promise((resolve, reject) => {
          const request = indexedDB.open('sismobi-cache', 1);
          
          request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains('cache')) {
              db.createObjectStore('cache');
            }
          };
          
          request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['cache'], 'readwrite');
            const store = transaction.objectStore('cache');
            const putRequest = store.put(value, key);
            
            putRequest.onsuccess = () => {
              resolve();
            };
            
            putRequest.onerror = () => {
              reject(putRequest.error);
            };
          };
          
          request.onerror = () => {
            reject(request.error);
          };
        });
      },
      
      removeItem: (key: string) => {
        return new Promise((resolve, reject) => {
          const request = indexedDB.open('sismobi-cache', 1);
          
          request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['cache'], 'readwrite');
            const store = transaction.objectStore('cache');
            const deleteRequest = store.delete(key);
            
            deleteRequest.onsuccess = () => {
              resolve();
            };
            
            deleteRequest.onerror = () => {
              reject(deleteRequest.error);
            };
          };
          
          request.onerror = () => {
            reject(request.error);
          };
        });
      }
    },
    key: 'SISMOBI_IDB_CACHE',
  });
};

// Função para determinar o melhor persister disponível
const getBestPersister = () => {
  try {
    // Testar localStorage
    const testKey = '__sismobi_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return localStoragePersister;
  } catch (error) {
    console.warn('localStorage não disponível, tentando IndexedDB:', error);
    
    try {
      // Testar IndexedDB
      if ('indexedDB' in window) {
        return createIndexedDBPersister();
      }
    } catch (idbError) {
      console.warn('IndexedDB não disponível:', idbError);
    }
    
    // Fallback: sem persistência
    return null;
  }
};

// Função para configurar cache persistente no QueryClient
export const setupPersistentCache = async (queryClient: QueryClient) => {
  const persister = getBestPersister();
  
  if (!persister) {
    console.warn('Nenhum método de persistência disponível. Cache será apenas em memória.');
    return queryClient;
  }
  
  try {
    await persistQueryClient({
      queryClient,
      persister,
      maxAge: CACHE_MAX_AGE,
      buster: CACHE_VERSION,
      dehydrateOptions: {
        // Não persistir mutations em andamento
        shouldDehydrateMutation: () => false,
        // Persistir apenas queries específicas para economizar espaço
        shouldDehydrateQuery: (query) => {
          // Persistir apenas queries de dados essenciais
          const persistableKeys = [
            'properties',
            'tenants', 
            'documents',
            'transactions',
            'energy_bills',
            'water_bills'
          ];
          
          const queryKey = query.queryKey[0] as string;
          return persistableKeys.some(key => queryKey.includes(key));
        }
      }
    });
    
    console.log('Cache persistente configurado com sucesso');
  } catch (error) {
    console.warn('Erro ao configurar cache persistente:', error);
  }
  
  return queryClient;
};

// Função para limpar cache antigo (manutenção)
export const clearOldCache = () => {
  try {
    // Limpar localStorage
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('SISMOBI_QUERY_CACHE') || key.startsWith('sismobi_')) {
        const item = localStorage.getItem(key);
        if (item) {
          try {
            const parsed = JSON.parse(item);
            const isOld = Date.now() - (parsed.clientState?.queries?.dataUpdatedAt || 0) > CACHE_MAX_AGE;
            if (isOld) {
              localStorage.removeItem(key);
            }
          } catch {
            // Remove itens que não conseguimos parsear
            localStorage.removeItem(key);
          }
        }
      }
    });
    
    // Limpar IndexedDB (se necessário)
    const deleteOldIDBCache = () => {
      const deleteRequest = indexedDB.deleteDatabase('sismobi-cache-old');
      deleteRequest.onsuccess = () => console.log('Cache IndexedDB antigo removido');
    };
    
    deleteOldIDBCache();
    
  } catch (error) {
    console.warn('Erro ao limpar cache antigo:', error);
  }
};

// Hook para monitorar uso do cache
export const useCacheMetrics = () => {
  const getCacheSize = () => {
    try {
      const cache = localStorage.getItem('SISMOBI_QUERY_CACHE');
      return cache ? new Blob([cache]).size : 0;
    } catch {
      return 0;
    }
  };
  
  const getCacheEntries = () => {
    try {
      const cache = localStorage.getItem('SISMOBI_QUERY_CACHE');
      if (!cache) return 0;
      
      const parsed = JSON.parse(cache);
      return Object.keys(parsed.clientState?.queries || {}).length;
    } catch {
      return 0;
    }
  };
  
  return {
    cacheSize: getCacheSize(),
    cacheEntries: getCacheEntries(),
    clearCache: () => {
      localStorage.removeItem('SISMOBI_QUERY_CACHE');
      clearOldCache();
    }
  };
};

// Configurações específicas para diferentes tipos de dados
export const getCacheConfig = (dataType: string) => {
  const configs = {
    // Dados que mudam frequentemente
    transactions: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 15 * 60 * 1000, // 15 minutos
    },
    
    // Dados que mudam moderadamente
    properties: {
      staleTime: 10 * 60 * 1000, // 10 minutos
      gcTime: 30 * 60 * 1000, // 30 minutos
    },
    
    tenants: {
      staleTime: 10 * 60 * 1000, // 10 minutos  
      gcTime: 30 * 60 * 1000, // 30 minutos
    },
    
    // Dados que mudam raramente
    documents: {
      staleTime: 30 * 60 * 1000, // 30 minutos
      gcTime: 60 * 60 * 1000, // 1 hora
    },
    
    // Metadados (mudam muito raramente)
    metadata: {
      staleTime: 60 * 60 * 1000, // 1 hora
      gcTime: 2 * 60 * 60 * 1000, // 2 horas
    }
  };
  
  return configs[dataType] || configs.properties;
};