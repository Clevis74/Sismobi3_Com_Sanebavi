import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Tenant } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { tenantService, mappers } from '../services/supabaseService';
import { useSyncManager } from './useSyncManager';

// Chaves para o cache do React Query
const QUERY_KEYS = {
  tenants: ['tenants'] as const,
  tenantsPaginated: ['tenants', 'paginated'] as const,
  tenantsActive: ['tenants', 'active'] as const,
};

// Hook para inquilinos com paginação infinita e filtros
export function useTenantsPaginated(
  supabaseAvailable: boolean = false,
  pageSize: number = 20,
  filters?: {
    status?: 'active' | 'inactive',
    propertyId?: string
  }
) {
  const queryClient = useQueryClient();
  const { addPendingChange } = useSyncManager();
  
  // Fallback para localStorage quando Supabase não está disponível
  const [localTenants, setLocalTenants] = useLocalStorage<Tenant[]>('tenants', []);

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
    queryKey: [...QUERY_KEYS.tenantsPaginated, filters],
    queryFn: async ({ pageParam = 0 }): Promise<{data: Tenant[], hasMore: boolean, count: number}> => {
      if (!supabaseAvailable) {
        // Simular paginação com localStorage e filtros
        let filteredTenants = localTenants;
        
        if (filters?.status) {
          filteredTenants = filteredTenants.filter(t => t.status === filters.status);
        }
        if (filters?.propertyId) {
          filteredTenants = filteredTenants.filter(t => t.propertyId === filters.propertyId);
        }
        
        const start = pageParam * pageSize;
        const end = start + pageSize;
        const paginatedData = filteredTenants.slice(start, end);
        
        return {
          data: paginatedData,
          hasMore: end < filteredTenants.length,
          count: filteredTenants.length
        };
      }
      
      try {
        const result = await tenantService.getAllPaginated(pageParam * pageSize, pageSize, filters);
        return {
          data: result.data.map(mappers.tenantFromSupabase),
          hasMore: result.hasMore,
          count: result.count
        };
      } catch (error) {
        console.warn('Supabase indisponível, usando localStorage:', error);
        
        // Fallback com filtros no localStorage
        let filteredTenants = localTenants;
        
        if (filters?.status) {
          filteredTenants = filteredTenants.filter(t => t.status === filters.status);
        }
        if (filters?.propertyId) {
          filteredTenants = filteredTenants.filter(t => t.propertyId === filters.propertyId);
        }
        
        const start = pageParam * pageSize;
        const end = start + pageSize;
        const paginatedData = filteredTenants.slice(start, end);
        
        return {
          data: paginatedData,
          hasMore: end < filteredTenants.length,
          count: filteredTenants.length
        };
      }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length : undefined;
    },
    staleTime: 8 * 60 * 1000, // 8 minutos (inquilinos mudam menos que propriedades)
    gcTime: 25 * 60 * 1000, // 25 minutos
    refetchOnWindowFocus: false,
  });

  // Processar dados das páginas para uma lista única
  const tenants = data?.pages.flatMap(page => page.data) || [];
  const totalCount = data?.pages[0]?.count || 0;

  // Mutation para criar novo inquilino
  const createMutation = useMutation({
    mutationFn: async (tenantData: Omit<Tenant, 'id'>) => {
      if (!supabaseAvailable) {
        const newTenant: Tenant = {
          ...tenantData,
          id: Date.now().toString()
        };
        setLocalTenants(prev => [newTenant, ...prev]);
        
        addPendingChange({
          type: 'create',
          entity: 'tenants',
          data: newTenant
        });
        
        return newTenant;
      }
      
      try {
        const data = await tenantService.create(tenantData);
        return mappers.tenantFromSupabase(data);
      } catch (error) {
        // Fallback para localStorage
        const newTenant: Tenant = {
          ...tenantData,
          id: Date.now().toString()
        };
        setLocalTenants(prev => [newTenant, ...prev]);
        
        addPendingChange({
          type: 'create',
          entity: 'tenants',
          data: newTenant
        });
        
        return newTenant;
      }
    },
    onSuccess: (newTenant) => {
      // Invalida os caches relevantes
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tenantsPaginated });
      queryClient.invalidateQueries({ queryKey: ['properties'] }); // Invalidar propriedades também
      
      toast.success(`Inquilino "${newTenant.name}" criado com sucesso!`);
    },
    onError: (error: Error) => {
      console.warn('Erro ao criar inquilino:', error);
    }
  });

  // Mutation para atualizar inquilino
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Tenant> }) => {
      if (!supabaseAvailable) {
        const updatedTenant = { ...tenants.find(t => t.id === id), ...updates } as Tenant;
        setLocalTenants(prev => prev.map(t => t.id === id ? updatedTenant : t));
        
        addPendingChange({
          type: 'update',
          entity: 'tenants',
          data: updatedTenant
        });
        
        return updatedTenant;
      }
      
      try {
        const data = await tenantService.update(id, updates);
        return mappers.tenantFromSupabase(data);
      } catch (error) {
        const updatedTenant = { ...tenants.find(t => t.id === id), ...updates } as Tenant;
        setLocalTenants(prev => prev.map(t => t.id === id ? updatedTenant : t));
        
        addPendingChange({
          type: 'update',
          entity: 'tenants',
          data: updatedTenant
        });
        
        return updatedTenant;
      }
    },
    onSuccess: (updatedTenant) => {
      // Atualiza o cache de forma otimista
      queryClient.setQueriesData(
        { queryKey: QUERY_KEYS.tenantsPaginated },
        (oldData: any) => {
          if (!oldData) return oldData;
          
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              data: page.data.map((tenant: Tenant) => 
                tenant.id === updatedTenant.id ? updatedTenant : tenant
              )
            }))
          };
        }
      );
      
      toast.success(`Inquilino "${updatedTenant.name}" atualizado com sucesso!`);
    },
    onError: (error: Error) => {
      console.warn('Erro ao atualizar inquilino:', error);
    }
  });

  // Mutation para excluir inquilino
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!supabaseAvailable) {
        const tenantToDelete = tenants.find(t => t.id === id);
        setLocalTenants(prev => prev.filter(t => t.id !== id));
        
        if (tenantToDelete) {
          addPendingChange({
            type: 'delete',
            entity: 'tenants',
            data: { id: tenantToDelete.id }
          });
        }
        
        return id;
      }
      
      try {
        await tenantService.delete(id);
      } catch (error) {
        const tenantToDelete = tenants.find(t => t.id === id);
        setLocalTenants(prev => prev.filter(t => t.id !== id));
        
        if (tenantToDelete) {
          addPendingChange({
            type: 'delete',
            entity: 'tenants',
            data: { id: tenantToDelete.id }
          });
        }
      }
      return id;
    },
    onSuccess: (deletedId) => {
      // Remove do cache de forma otimista
      queryClient.setQueriesData(
        { queryKey: QUERY_KEYS.tenantsPaginated },
        (oldData: any) => {
          if (!oldData) return oldData;
          
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              data: page.data.filter((tenant: Tenant) => tenant.id !== deletedId)
            }))
          };
        }
      );
      
      // Invalidar propriedades para atualizar relacionamentos
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      
      const deletedTenant = tenants.find(t => t.id === deletedId);
      toast.success(`Inquilino "${deletedTenant?.name || 'desconhecido'}" excluído com sucesso!`);
    },
    onError: (error: Error) => {
      console.warn('Erro ao excluir inquilino:', error);
    }
  });

  // Funções públicas
  const addTenant = async (tenantData: Omit<Tenant, 'id'>): Promise<Tenant | null> => {
    try {
      return await createMutation.mutateAsync(tenantData);
    } catch (error) {
      return null;
    }
  };

  const updateTenant = async (id: string, updates: Partial<Tenant>): Promise<Tenant | null> => {
    try {
      return await updateMutation.mutateAsync({ id, updates });
    } catch (error) {
      return null;
    }
  };

  const deleteTenant = async (id: string): Promise<boolean> => {
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

  // Função para alterar filtros (reinicia a query)
  const changeFilters = (newFilters: typeof filters) => {
    queryClient.resetQueries({ queryKey: [...QUERY_KEYS.tenantsPaginated, newFilters] });
  };

  return {
    // Dados
    tenants,
    totalCount,
    filters,
    
    // Estados de loading
    isLoading: isLoading || createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    isFetchingNextPage,
    hasNextPage,
    
    // Estados de erro
    error: supabaseAvailable ? error : null,
    
    // Funções
    addTenant,
    updateTenant,
    deleteTenant,
    loadMore,
    changeFilters,
    refetch,
    setLocalTenants,
    
    // Informações adicionais
    hasData: tenants.length > 0,
    usingSupabase: supabaseAvailable,
    
    // Mutações (para componentes que precisam do estado)
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}