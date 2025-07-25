import React, { useEffect, useRef, useCallback } from 'react';
import { Loader2 } from 'lucide-react';

interface InfiniteListProps<T> {
  items: T[];
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  loadMore: () => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  loadingComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  threshold?: number; // Pixels from bottom to trigger load
  children?: React.ReactNode;
}

/**
 * Componente reutilizável para listas infinitas otimizadas
 * Carrega mais itens automaticamente quando o usuário rola até o final
 */
export function InfiniteList<T>({
  items,
  hasNextPage,
  isFetchingNextPage,
  loadMore,
  renderItem,
  className = '',
  loadingComponent,
  emptyComponent,
  threshold = 100,
  children
}: InfiniteListProps<T>) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef(loadMore);

  // Manter referência atualizada da função loadMore
  useEffect(() => {
    loadMoreRef.current = loadMore;
  }, [loadMore]);

  // Intersection Observer para detectar quando chegar no final da lista
  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
      loadMoreRef.current();
    }
  }, [hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin: `${threshold}px`,
    });

    observer.observe(sentinel);

    return () => {
      observer.unobserve(sentinel);
    };
  }, [handleIntersection, threshold]);

  // Componente de loading padrão
  const defaultLoadingComponent = (
    <div className="flex items-center justify-center py-8">
      <div className="flex items-center space-x-2 text-gray-500">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Carregando mais itens...</span>
      </div>
    </div>
  );

  // Componente vazio padrão
  const defaultEmptyComponent = (
    <div className="text-center py-12">
      <div className="text-gray-400 text-lg">Nenhum item encontrado</div>
    </div>
  );

  // Se não há itens e não está carregando, mostrar componente vazio
  if (items.length === 0 && !isFetchingNextPage) {
    return (
      <div className={className}>
        {emptyComponent || defaultEmptyComponent}
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Renderizar itens */}
      {items.map((item, index) => (
        <React.Fragment key={`item-${index}`}>
          {renderItem(item, index)}
        </React.Fragment>
      ))}

      {/* Conteúdo adicional (ex: botões, filtros) */}
      {children}

      {/* Indicador de loading */}
      {isFetchingNextPage && (loadingComponent || defaultLoadingComponent)}

      {/* Sentinel para detectar final da lista */}
      <div 
        ref={sentinelRef} 
        className="h-1" 
        style={{ 
          visibility: hasNextPage ? 'visible' : 'hidden' 
        }} 
      />

      {/* Indicador de fim da lista */}
      {!hasNextPage && items.length > 0 && (
        <div className="text-center py-4 text-gray-400 text-sm">
          • Fim da lista •
        </div>
      )}
    </div>
  );
}

// Hook para scroll virtual (opcional, para listas muito grandes)
export function useVirtualScroll(
  items: any[],
  itemHeight: number,
  containerHeight: number
) {
  const [scrollTop, setScrollTop] = React.useState(0);
  
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 2);
  const endIndex = Math.min(
    items.length - 1,
    Math.floor((scrollTop + containerHeight) / itemHeight) + 2
  );
  
  const visibleItems = items.slice(startIndex, endIndex + 1);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    startIndex,
    endIndex
  };
}