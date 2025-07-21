import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Property } from '../types';
import { propertyService, mappers } from '../services/supabaseService';

// Chaves para o cache do React Query
const QUERY_KEYS = {
  properties: ['properties'] as const,
};

export function useProperties() {
  const queryClient = useQueryClient();

  // Query para buscar todas as propriedades
  const {
    data: properties = [],
    isLoading: carregando,
    error,
    refetch
  } = useQuery({
    queryKey: QUERY_KEYS.properties,
    queryFn: async () => {
      const data = await propertyService.getAll();
      return data.map(mappers.propertyFromSupabase);
    },
    onError: (error: Error) => {
      console.error('Erro ao carregar propriedades:', error);
      toast.error(`Erro ao carregar propriedades: ${error.message}`);
    }
  });

  // Mutation para criar nova propriedade
  const createMutation = useMutation({
    mutationFn: async (propertyData: Omit<Property, 'id' | 'createdAt'>) => {
      const data = await propertyService.create(propertyData);
      return mappers.propertyFromSupabase(data);
    },
    onSuccess: (newProperty) => {
      // Atualiza o cache local imediatamente
      queryClient.setQueryData(QUERY_KEYS.properties, (old: Property[] = []) => [
        newProperty,
        ...old
      ]);
      
      // Opcional: revalida os dados do servidor
      // queryClient.invalidateQueries(QUERY_KEYS.properties);
      
      toast.success(`Propriedade "${newProperty.name}" criada com sucesso!`);
    },
    onError: (error: Error) => {
      console.error('Erro ao criar propriedade:', error);
      toast.error(`Erro ao criar propriedade: ${error.message}`);
    }
  });

  // Mutation para atualizar propriedade
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Property> }) => {
      const data = await propertyService.update(id, updates);
      return mappers.propertyFromSupabase(data);
    },
    onSuccess: (updatedProperty) => {
      // Atualiza o cache local imediatamente
      queryClient.setQueryData(QUERY_KEYS.properties, (old: Property[] = []) =>
        old.map(property => 
          property.id === updatedProperty.id ? updatedProperty : property
        )
      );
      
      toast.success(`Propriedade "${updatedProperty.name}" atualizada com sucesso!`);
    },
    onError: (error: Error) => {
      console.error('Erro ao atualizar propriedade:', error);
      toast.error(`Erro ao atualizar propriedade: ${error.message}`);
    }
  });

  // Mutation para excluir propriedade
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await propertyService.delete(id);
      return id;
    },
    onSuccess: (deletedId) => {
      // Remove do cache local imediatamente
      queryClient.setQueryData(QUERY_KEYS.properties, (old: Property[] = []) =>
        old.filter(property => property.id !== deletedId)
      );
      
      const deletedProperty = properties.find(p => p.id === deletedId);
      toast.success(`Propriedade "${deletedProperty?.name || 'desconhecida'}" excluída com sucesso!`);
    },
    onError: (error: Error) => {
      console.error('Erro ao excluir propriedade:', error);
      toast.error(`Erro ao excluir propriedade: ${error.message}`);
    }
  });

  // Função para criar nova propriedade
  const addProperty = async (propertyData: Omit<Property, 'id' | 'createdAt'>): Promise<boolean> => {
    try {
      await createMutation.mutateAsync(propertyData);
      return true;
    } catch (error) {
      // Erro já tratado na mutation
      return false;
    }
  };

  // Função para atualizar propriedade
  const updateProperty = async (id: string, updates: Partial<Property>): Promise<boolean> => {
    try {
      await updateMutation.mutateAsync({ id, updates });
      return true;
    } catch (error) {
      // Erro já tratado na mutation
      return false;
    }
  };

  // Função para excluir propriedade
  const deleteProperty = async (id: string): Promise<boolean> => {
    try {
      await deleteMutation.mutateAsync(id);
      return true;
    } catch (error) {
      // Erro já tratado na mutation
      return false;
    }
  };

  // Função para recarregar dados manualmente
  const recarregarDados = () => {
    refetch();
  };

  return {
    // Dados
    properties,
    
    // Estados de loading
    carregando: carregando || createMutation.isLoading || updateMutation.isLoading || deleteMutation.isLoading,
    carregandoBusca: carregando,
    carregandoSalvar: createMutation.isLoading,
    carregandoAtualizar: updateMutation.isLoading,
    carregandoExcluir: deleteMutation.isLoading,
    
    // Estados de erro
    erro: error,
    
    // Funções
    addProperty,
    updateProperty,
    deleteProperty,
    recarregarDados,
    
    // Informações adicionais
    temDados: properties.length > 0,
    totalProperties: properties.length
  };
}