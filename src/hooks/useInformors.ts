import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Informor } from '../types/informor'
import { informorSchema } from '../schemas/informorSchema'
import { 
  fetchInformors, 
  salvarInformor as salvarInformorsService, 
  excluirInformor as excluirInformorsService,
  atualizarInformor as atualizarInformorsService,
  limparTodosInformors,
  exportarInformors,
  importarInformors
} from '../services/informorsService'
import { useEnhancedToast } from '../components/UI/EnhancedToast'

// Chaves para o cache do React Query
const QUERY_KEYS = {
  informors: ['informors'] as const,
}

export function useInformors() {
  const queryClient = useQueryClient()
  const toast = useEnhancedToast()

  // Query para buscar todos os Informors
  const {
    data: informors = [],
    isLoading: carregando,
    error,
    refetch
  } = useQuery({
    queryKey: QUERY_KEYS.informors,
    queryFn: fetchInformors,
    onError: (error: any) => {
      console.error('Erro ao carregar Informors:', error)
      toast.error(`Erro ao carregar dados: ${error.message}`)
    }
  })

  // Mutation para salvar novo Informor
  const salvarMutation = useMutation({
    mutationFn: salvarInformorsService,
    onSuccess: (novoInformor) => {
      // Atualiza o cache local imediatamente
      queryClient.setQueryData(QUERY_KEYS.informors, (old: Informor[] = []) => [
        ...old,
        novoInformor
      ])
      
      // Opcional: revalida os dados do servidor
      // queryClient.invalidateQueries(QUERY_KEYS.informors)
      
      toast.success(`Informor "${novoInformor.nome}" salvo com sucesso!`)
    },
    onError: (error: any) => {
      console.error('Erro ao salvar Informor:', error)
      toast.error(`Erro ao salvar: ${error.message}`)
    }
  })

  // Mutation para excluir Informor
  const excluirMutation = useMutation({
    mutationFn: excluirInformorsService,
    onSuccess: (_, idExcluido) => {
      // Atualiza o cache local imediatamente
      queryClient.setQueryData(QUERY_KEYS.informors, (old: Informor[] = []) =>
        old.filter(inf => inf.id !== idExcluido)
      )
      
      const informorExcluido = informors.find(inf => inf.id === idExcluido)
      toast.success(`Informor "${informorExcluido?.nome || 'desconhecido'}" excluído com sucesso!`)
    },
    onError: (error: any) => {
      console.error('Erro ao excluir Informor:', error)
      toast.error(`Erro ao excluir: ${error.message}`)
    }
  })

  // Mutation para atualizar Informor
  const atualizarMutation = useMutation({
    mutationFn: ({ id, dados }: { id: string; dados: Partial<Omit<Informor, 'id'>> }) =>
      atualizarInformorsService(id, dados),
    onSuccess: (informorAtualizado) => {
      // Atualiza o cache local imediatamente
      queryClient.setQueryData(QUERY_KEYS.informors, (old: Informor[] = []) =>
        old.map(inf => inf.id === informorAtualizado.id ? informorAtualizado : inf)
      )
      
      toast.success(`Informor "${informorAtualizado.nome}" atualizado com sucesso!`)
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar Informor:', error)
      toast.error(`Erro ao atualizar: ${error.message}`)
    }
  })

  // Mutation para limpar todos os dados
  const limparMutation = useMutation({
    mutationFn: limparTodosInformors,
    onSuccess: () => {
      queryClient.setQueryData(QUERY_KEYS.informors, []);
      toast.success('Todos os Informors foram removidos!');
    },
    onError: (error: any) => {
      console.error('Erro ao limpar Informors:', error);
      toast.error(`Erro ao limpar dados: ${error.message}`);
    }
  });

  // Mutation para importar dados
  const importarMutation = useMutation({
    mutationFn: importarInformors,
    onSuccess: () => {
      queryClient.invalidateQueries(QUERY_KEYS.informors);
      toast.success('Dados importados com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao importar dados:', error);
      toast.error(`Erro ao importar: ${error.message}`);
    }
  });

  // Função para salvar novo Informor com validação
  const salvarInformor = async (novo: Omit<Informor, 'id'>): Promise<boolean> => {
    try {
      // Validar os dados antes de enviar
      const resultado = informorSchema.safeParse({ ...novo, id: 'temp' })
      
      if (!resultado.success) {
        console.error('Erro de validação:', resultado.error.format())
        toast.error('Dados inválidos! Verifique os campos preenchidos.')
        return false
      }

      // Executar a mutation
      await salvarMutation.mutateAsync(novo)
      return true
    } catch (error) {
      // Erro já tratado na mutation
      return false
    }
  }

  // Função para excluir Informor
  const excluirInformor = async (id: string): Promise<boolean> => {
    try {
      await excluirMutation.mutateAsync(id)
      return true
    } catch (error) {
      // Erro já tratado na mutation
      return false
    }
  }

  // Função para atualizar Informor
  const atualizarInformor = async (id: string, dados: Partial<Omit<Informor, 'id'>>): Promise<boolean> => {
    try {
      await atualizarMutation.mutateAsync({ id, dados })
      return true
    } catch (error) {
      // Erro já tratado na mutation
      return false
    }
  }

  // Função para recarregar dados manualmente
  const recarregarDados = () => {
    refetch()
  }

  // Função para limpar todos os dados
  const limparTodos = async (): Promise<boolean> => {
    try {
      await limparMutation.mutateAsync();
      return true;
    } catch (error) {
      return false;
    }
  };

  // Função para exportar dados
  const exportarDados = async (): Promise<string | null> => {
    try {
      return await exportarInformors();
    } catch (error) {
      toast.error('Erro ao exportar dados');
      return null;
    }
  };

  // Função para importar dados
  const importarDados = async (jsonData: string): Promise<boolean> => {
    try {
      await importarMutation.mutateAsync(jsonData);
      return true;
    } catch (error) {
      return false;
    }
  };

  return {
    // Dados
    informors,
    
    // Estados de loading
    carregando: carregando || salvarMutation.isLoading || excluirMutation.isLoading || atualizarMutation.isLoading,
    carregandoBusca: carregando,
    carregandoSalvar: salvarMutation.isLoading,
    carregandoExcluir: excluirMutation.isLoading,
    carregandoAtualizar: atualizarMutation.isLoading,
    carregandoLimpar: limparMutation.isLoading,
    carregandoImportar: importarMutation.isLoading,
    
    // Estados de erro
    erro: error,
    
    // Funções
    salvarInformor,
    excluirInformor,
    atualizarInformor,
    recarregarDados,
    limparTodos,
    exportarDados,
    importarDados,
    
    // Informações adicionais
    temDados: informors.length > 0,
    totalInformors: informors.length
  }
}