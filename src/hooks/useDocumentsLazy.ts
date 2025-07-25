import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Document } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { documentService, mappers } from '../services/supabaseService';
import { useSyncManager } from './useSyncManager';

// Chaves para o cache do React Query
const QUERY_KEYS = {
  documents: ['documents'] as const,
  documentsMetadata: ['documents', 'metadata'] as const,
  documentContent: ['documents', 'content'] as const,
};

// Interface para metadata dos documentos (sem file_url para otimizar)
interface DocumentMetadata extends Omit<Document, 'fileUrl'> {
  hasFile: boolean;
}

// Hook para documentos com lazy loading de conteúdo
export function useDocumentsLazy(
  supabaseAvailable: boolean = false,
  pageSize: number = 20,
  filters?: {
    propertyId?: string,
    tenantId?: string,
    type?: string,
    status?: 'Válido' | 'Expirado' | 'Pendente' | 'Revisão'
  }
) {
  const queryClient = useQueryClient();
  const { addPendingChange } = useSyncManager();
  
  // Fallback para localStorage quando Supabase não está disponível
  const [localDocuments, setLocalDocuments] = useLocalStorage<Document[]>('documents', []);

  // Query para metadados dos documentos (sem conteúdo pesado)
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch
  } = useInfiniteQuery({
    queryKey: [...QUERY_KEYS.documentsMetadata, filters],
    queryFn: async ({ pageParam = 0 }): Promise<{data: DocumentMetadata[], hasMore: boolean, count: number}> => {
      if (!supabaseAvailable) {
        // Simular paginação com localStorage e filtros
        let filteredDocuments = localDocuments;
        
        if (filters?.propertyId) {
          filteredDocuments = filteredDocuments.filter(d => d.propertyId === filters.propertyId);
        }
        if (filters?.tenantId) {
          filteredDocuments = filteredDocuments.filter(d => d.tenantId === filters.tenantId);
        }
        if (filters?.type) {
          filteredDocuments = filteredDocuments.filter(d => d.type === filters.type);
        }
        if (filters?.status) {
          filteredDocuments = filteredDocuments.filter(d => d.status === filters.status);
        }
        
        const start = pageParam * pageSize;
        const end = start + pageSize;
        const paginatedData = filteredDocuments.slice(start, end);
        
        // Converter para metadata (remover fileUrl para economizar memória)
        const metadata: DocumentMetadata[] = paginatedData.map(doc => {
          const { fileUrl, ...rest } = doc;
          return {
            ...rest,
            hasFile: !!fileUrl
          };
        });
        
        return {
          data: metadata,
          hasMore: end < filteredDocuments.length,
          count: filteredDocuments.length
        };
      }
      
      try {
        const result = await documentService.getAllMetadata(pageParam * pageSize, pageSize, filters);
        
        // Converter para metadata
        const metadata: DocumentMetadata[] = result.data.map(doc => ({
          id: doc.id,
          type: doc.type,
          issueDate: new Date(doc.issue_date),
          hasValidity: doc.has_validity,
          validityDate: doc.validity_date ? new Date(doc.validity_date) : undefined,
          fileName: doc.file_name,
          observations: doc.observations || '',
          propertyId: doc.property_id,
          tenantId: doc.tenant_id,
          status: doc.status,
          contractSigned: doc.contract_signed,
          lastUpdated: new Date(doc.last_updated),
          hasFile: !!doc.file_name
        }));
        
        return {
          data: metadata,
          hasMore: result.hasMore,
          count: result.count
        };
      } catch (error) {
        console.warn('Supabase indisponível, usando localStorage:', error);
        
        // Fallback com filtros no localStorage
        let filteredDocuments = localDocuments;
        
        if (filters?.propertyId) {
          filteredDocuments = filteredDocuments.filter(d => d.propertyId === filters.propertyId);
        }
        if (filters?.tenantId) {
          filteredDocuments = filteredDocuments.filter(d => d.tenantId === filters.tenantId);
        }
        if (filters?.type) {
          filteredDocuments = filteredDocuments.filter(d => d.type === filters.type);
        }
        if (filters?.status) {
          filteredDocuments = filteredDocuments.filter(d => d.status === filters.status);
        }
        
        const start = pageParam * pageSize;
        const end = start + pageSize;
        const paginatedData = filteredDocuments.slice(start, end);
        
        const metadata: DocumentMetadata[] = paginatedData.map(doc => {
          const { fileUrl, ...rest } = doc;
          return {
            ...rest,
            hasFile: !!fileUrl
          };
        });
        
        return {
          data: metadata,
          hasMore: end < filteredDocuments.length,
          count: filteredDocuments.length
        };
      }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length : undefined;
    },
    staleTime: 15 * 60 * 1000, // 15 minutos (documentos mudam pouco)
    gcTime: 45 * 60 * 1000, // 45 minutos
    refetchOnWindowFocus: false,
  });

  // Processar dados das páginas para uma lista única
  const documentsMetadata = data?.pages.flatMap(page => page.data) || [];
  const totalCount = data?.pages[0]?.count || 0;

  // Mutation para criar novo documento
  const createMutation = useMutation({
    mutationFn: async (documentData: Omit<Document, 'id' | 'lastUpdated'>) => {
      if (!supabaseAvailable) {
        const newDocument: Document = {
          ...documentData,
          id: Date.now().toString(),
          lastUpdated: new Date()
        };
        setLocalDocuments(prev => [newDocument, ...prev]);
        
        addPendingChange({
          type: 'create',
          entity: 'documents',
          data: newDocument
        });
        
        return newDocument;
      }
      
      try {
        const data = await documentService.create(documentData);
        return mappers.documentFromSupabase(data);
      } catch (error) {
        // Fallback para localStorage
        const newDocument: Document = {
          ...documentData,
          id: Date.now().toString(),
          lastUpdated: new Date()
        };
        setLocalDocuments(prev => [newDocument, ...prev]);
        
        addPendingChange({
          type: 'create',
          entity: 'documents',
          data: newDocument
        });
        
        return newDocument;
      }
    },
    onSuccess: (newDocument) => {
      // Invalida os caches relevantes
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.documentsMetadata });
      
      toast.success(`Documento "${newDocument.type}" criado com sucesso!`);
    },
    onError: (error: Error) => {
      console.warn('Erro ao criar documento:', error);
    }
  });

  // Função para carregar conteúdo de um documento específico (lazy loading)
  const useDocumentContent = (documentId: string) => {
    return useQuery({
      queryKey: [...QUERY_KEYS.documentContent, documentId],
      queryFn: async () => {
        if (!supabaseAvailable) {
          // Buscar no localStorage
          const document = localDocuments.find(d => d.id === documentId);
          return document ? { file_url: document.fileUrl, file_name: document.fileName } : null;
        }
        
        try {
          return await documentService.getDocumentContent(documentId);
        } catch (error) {
          console.warn('Erro ao carregar conteúdo do documento:', error);
          // Fallback para localStorage
          const document = localDocuments.find(d => d.id === documentId);
          return document ? { file_url: document.fileUrl, file_name: document.fileName } : null;
        }
      },
      enabled: false, // Só carregar quando solicitado explicitamente
      staleTime: 30 * 60 * 1000, // 30 minutos (conteúdo de arquivo raramente muda)
      gcTime: 60 * 60 * 1000, // 1 hora
    });
  };

  // Mutation para atualizar documento
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Document> }) => {
      if (!supabaseAvailable) {
        const updatedDocument = { 
          ...localDocuments.find(d => d.id === id), 
          ...updates,
          lastUpdated: new Date()
        } as Document;
        setLocalDocuments(prev => prev.map(d => d.id === id ? updatedDocument : d));
        
        addPendingChange({
          type: 'update',
          entity: 'documents',
          data: updatedDocument
        });
        
        return updatedDocument;
      }
      
      try {
        const data = await documentService.update(id, updates);
        return mappers.documentFromSupabase(data);
      } catch (error) {
        const updatedDocument = { 
          ...localDocuments.find(d => d.id === id), 
          ...updates,
          lastUpdated: new Date()
        } as Document;
        setLocalDocuments(prev => prev.map(d => d.id === id ? updatedDocument : d));
        
        addPendingChange({
          type: 'update',
          entity: 'documents',
          data: updatedDocument
        });
        
        return updatedDocument;
      }
    },
    onSuccess: (updatedDocument) => {
      // Invalida os metadados
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.documentsMetadata });
      // Invalida o conteúdo específico
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.documentContent, updatedDocument.id] });
      
      toast.success(`Documento "${updatedDocument.type}" atualizado com sucesso!`);
    },
    onError: (error: Error) => {
      console.warn('Erro ao atualizar documento:', error);
    }
  });

  // Mutation para excluir documento
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!supabaseAvailable) {
        const documentToDelete = localDocuments.find(d => d.id === id);
        setLocalDocuments(prev => prev.filter(d => d.id !== id));
        
        if (documentToDelete) {
          addPendingChange({
            type: 'delete',
            entity: 'documents',
            data: { id: documentToDelete.id }
          });
        }
        
        return id;
      }
      
      try {
        await documentService.delete(id);
      } catch (error) {
        const documentToDelete = localDocuments.find(d => d.id === id);
        setLocalDocuments(prev => prev.filter(d => d.id !== id));
        
        if (documentToDelete) {
          addPendingChange({
            type: 'delete',
            entity: 'documents',
            data: { id: documentToDelete.id }
          });
        }
      }
      return id;
    },
    onSuccess: (deletedId) => {
      // Invalida os metadados
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.documentsMetadata });
      // Remove o conteúdo específico do cache
      queryClient.removeQueries({ queryKey: [...QUERY_KEYS.documentContent, deletedId] });
      
      const deletedDocument = localDocuments.find(d => d.id === deletedId);
      toast.success(`Documento "${deletedDocument?.type || 'desconhecido'}" excluído com sucesso!`);
    },
    onError: (error: Error) => {
      console.warn('Erro ao excluir documento:', error);
    }
  });

  // Funções públicas
  const addDocument = async (documentData: Omit<Document, 'id' | 'lastUpdated'>): Promise<Document | null> => {
    try {
      return await createMutation.mutateAsync(documentData);
    } catch (error) {
      return null;
    }
  };

  const updateDocument = async (id: string, updates: Partial<Document>): Promise<Document | null> => {
    try {
      return await updateMutation.mutateAsync({ id, updates });
    } catch (error) {
      return null;
    }
  };

  const deleteDocument = async (id: string): Promise<boolean> => {
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
    queryClient.resetQueries({ queryKey: [...QUERY_KEYS.documentsMetadata, newFilters] });
  };

  return {
    // Dados
    documentsMetadata,
    totalCount,
    filters,
    
    // Estados de loading
    isLoading: isLoading || createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    isFetchingNextPage,
    hasNextPage,
    
    // Estados de erro
    error: supabaseAvailable ? error : null,
    
    // Funções
    addDocument,
    updateDocument,
    deleteDocument,
    loadMore,
    changeFilters,
    refetch,
    useDocumentContent, // Hook para lazy loading de conteúdo
    setLocalDocuments,
    
    // Informações adicionais
    hasData: documentsMetadata.length > 0,
    usingSupabase: supabaseAvailable,
    
    // Mutações (para componentes que precisam do estado)
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}