import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Property } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { propertyService, mappers } from '../services/supabaseService';
import { useSyncManager } from './useSyncManager';

// Chaves para o cache do React Query
const QUERY_KEYS = {
  properties: ['properties'] as const,
  propertiesPaginated: ['properties', 'paginated'] as const,
  propertiesMetadata: ['properties', 'metadata'] as const,
};

// Hook para propriedades com paginação infinita (otimizado para grandes listas)
export function usePropertiesPaginated(
  supabaseAvailable: boolean = false,
  pageSize: number = 20
) {
  const queryClient = useQueryClient();
  const { addPendingChange } = useSyncManager();
  
  // Fallback para localStorage quando Supabase não está disponível
  const [localProperties, setLocalProperties] = useLocalStorage<Property[]>('properties', []);

  // Query com paginação infinita
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch
  } = useInfiniteQuery({
    queryKey: QUERY_KEYS.propertiesPaginated,
    queryFn: async ({ pageParam = 0 }): Promise<{data: Property[], hasMore: boolean, count: number}> => {
      if (!supabaseAvailable) {
        // Simular paginação com localStorage
        const start = pageParam * pageSize;
        const end = start + pageSize;
        const paginatedData = localProperties.slice(start, end);
        
        return {
          data: paginatedData,
          hasMore: end < localProperties.length,
          count: localProperties.length
        };
      }
      
      try {
        const result = await propertyService.getAllPaginated(pageParam * pageSize, pageSize);
        return {
          data: result.data.map(mappers.propertyFromSupabase),
          hasMore: result.hasMore,
          count: result.count
        };
      } catch (error) {
        console.warn('Supabase indisponível, usando localStorage:', error);
        const start = pageParam * pageSize;
        const end = start + pageSize;
        const paginatedData = localProperties.slice(start, end);
        
        return {
          data: paginatedData,
          hasMore: end < localProperties.length,
          count: localProperties.length
        };
      }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length : undefined;
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos (novo nome para cacheTime)
    refetchOnWindowFocus: false,
  });

  // Processar dados das páginas para uma lista única
  const properties = data?.pages.flatMap(page => page.data) || [];
  const totalCount = data?.pages[0]?.count || 0;

  // Mutation para criar nova propriedade
  const createMutation = useMutation({
    mutationFn: async (propertyData: Omit<Property, 'id' | 'createdAt'>) => {
      if (!supabaseAvailable) {
        const newProperty: Property = {
          ...propertyData,
          id: Date.now().toString(),
          createdAt: new Date()
        };
        setLocalProperties(prev => [newProperty, ...prev]);
        
        addPendingChange({
          type: 'create',
          entity: 'properties',
          data: newProperty
        });
        
        return newProperty;
      }
      
      try {
        const data = await propertyService.create(propertyData);
        return mappers.propertyFromSupabase(data);
      } catch (error) {
        // Fallback para localStorage
        const newProperty: Property = {
          ...propertyData,
          id: Date.now().toString(),
          createdAt: new Date()
        };
        setLocalProperties(prev => [newProperty, ...prev]);
        
        addPendingChange({
          type: 'create',
          entity: 'properties',
          data: newProperty
        });
        
        return newProperty;
      }
    },
    onSuccess: (newProperty) => {
      // Invalida o cache para recarregar a lista
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.propertiesPaginated });
      
      toast.success(`Propriedade "${newProperty.name}" criada com sucesso!`);
    },
    onError: (error: Error) => {
      console.warn('Erro ao criar propriedade:', error);
    }
  });

  // Mutation para atualizar propriedade
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Property> }) => {
      if (!supabaseAvailable) {
        const updatedProperty = { ...properties.find(p => p.id === id), ...updates } as Property;
        setLocalProperties(prev => prev.map(p => p.id === id ? updatedProperty : p));
        
        addPendingChange({
          type: 'update',
          entity: 'properties',
          data: updatedProperty
        });
        
        return updatedProperty;
      }
      
      try {
        const data = await propertyService.update(id, updates);
        return mappers.propertyFromSupabase(data);
      } catch (error) {
        const updatedProperty = { ...properties.find(p => p.id === id), ...updates } as Property;
        setLocalProperties(prev => prev.map(p => p.id === id ? updatedProperty : p));
        
        addPendingChange({
          type: 'update',
          entity: 'properties',
          data: updatedProperty
        });
        
        return updatedProperty;
      }
    },
    onSuccess: (updatedProperty) => {
      // Atualiza o cache de forma otimista
      queryClient.setQueriesData(
        { queryKey: QUERY_KEYS.propertiesPaginated },
        (oldData: any) => {
          if (!oldData) return oldData;
          
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              data: page.data.map((property: Property) => 
                property.id === updatedProperty.id ? updatedProperty : property
              )
            }))
          };
        }
      );
      
      toast.success(`Propriedade "${updatedProperty.name}" atualizada com sucesso!`);
    },
    onError: (error: Error) => {
      console.warn('Erro ao atualizar propriedade:', error);
    }
  });

  // Mutation para excluir propriedade
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!supabaseAvailable) {
        const propertyToDelete = properties.find(p => p.id === id);
        setLocalProperties(prev => prev.filter(p => p.id !== id));
        
        if (propertyToDelete) {
          addPendingChange({
            type: 'delete',
            entity: 'properties',
            data: { id: propertyToDelete.id }
          });
        }
        
        return id;
      }
      
      try {
        await propertyService.delete(id);
      } catch (error) {
        const propertyToDelete = properties.find(p => p.id === id);
        setLocalProperties(prev => prev.filter(p => p.id !== id));
        
        if (propertyToDelete) {
          addPendingChange({
            type: 'delete',
            entity: 'properties',
            data: { id: propertyToDelete.id }
          });
        }
      }
      return id;
    },
    onSuccess: (deletedId) => {
      // Remove do cache de forma otimista
      queryClient.setQueriesData(
        { queryKey: QUERY_KEYS.propertiesPaginated },
        (oldData: any) => {
          if (!oldData) return oldData;
          
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              data: page.data.filter((property: Property) => property.id !== deletedId)
            }))
          };
        }
      );
      
      const deletedProperty = properties.find(p => p.id === deletedId);
      toast.success(`Propriedade "${deletedProperty?.name || 'desconhecida'}" excluída com sucesso!`);
    },
    onError: (error: Error) => {
      console.warn('Erro ao excluir propriedade:', error);
    }
  });

  // Funções públicas
  const addProperty = async (propertyData: Omit<Property, 'id' | 'createdAt'>): Promise<Property | null> => {
    try {
      return await createMutation.mutateAsync(propertyData);
    } catch (error) {
      return null;
    }
  };

  const updateProperty = async (id: string, updates: Partial<Property>): Promise<Property | null> => {
    try {
      return await updateMutation.mutateAsync({ id, updates });
    } catch (error) {
      return null;
    }
  };

  const deleteProperty = async (id: string): Promise<boolean> => {
    try {
      await deleteMutation.mutateAsync(id);
      return true;
    } catch (error) {
      return false;
    }
  };

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return {
    // Dados
    properties,
    totalCount,
    
    // Estados de loading
    isLoading: isLoading || createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    isFetchingNextPage,
    hasNextPage,
    
    // Estados de erro
    error: supabaseAvailable ? error : null,
    
    // Funções
    addProperty,
    updateProperty,
    deleteProperty,
    loadMore,
    refetch,
    setLocalProperties,
    
    // Informações adicionais
    hasData: properties.length > 0,
    usingSupabase: supabaseAvailable,
    
    // Mutações (para componentes que precisam do estado)
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}