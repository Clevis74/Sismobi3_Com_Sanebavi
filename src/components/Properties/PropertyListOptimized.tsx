import React, { useMemo, useState } from 'react';
import { Building2, MapPin, Users, DollarSign, Loader2, Filter, Search } from 'lucide-react';
import { Property } from '../../types';
import { usePropertiesPaginated } from '../../hooks/usePropertiesPaginated';
import { InfiniteList } from '../UI/InfiniteList';

interface PropertyListOptimizedProps {
  supabaseAvailable: boolean;
  showFinancialValues: boolean;
  onPropertyClick?: (property: Property) => void;
  className?: string;
}

/**
 * Lista otimizada de propriedades com paginação infinita
 * Carrega apenas 20 propriedades por vez, economizando memória e melhorando performance
 */
export function PropertyListOptimized({
  supabaseAvailable,
  showFinancialValues,
  onPropertyClick,
  className = ''
}: PropertyListOptimizedProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'rented' | 'vacant' | 'maintenance'>('all');
  
  // Hook otimizado com paginação infinita
  const {
    properties,
    totalCount,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    loadMore,
    error
  } = usePropertiesPaginated(supabaseAvailable, 20); // 20 itens por página

  // Filtrar propriedades localmente (para performance)
  const filteredProperties = useMemo(() => {
    let filtered = properties;

    // Filtro de busca
    if (searchTerm) {
      filtered = filtered.filter(property =>
        property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro de status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(property => property.status === statusFilter);
    }

    return filtered;
  }, [properties, searchTerm, statusFilter]);

  // Renderizar item individual da propriedade
  const renderPropertyItem = (property: Property, index: number) => {
    const statusColors = {
      rented: 'bg-green-100 text-green-800',
      vacant: 'bg-yellow-100 text-yellow-800', 
      maintenance: 'bg-red-100 text-red-800'
    };

    const statusLabels = {
      rented: 'Alugado',
      vacant: 'Vago',
      maintenance: 'Manutenção'
    };

    return (
      <div
        key={property.id}
        onClick={() => onPropertyClick?.(property)}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
      >
        {/* Cabeçalho da propriedade */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{property.name}</h3>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{property.address}</span>
              </div>
            </div>
          </div>
          
          {/* Status Badge */}
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[property.status]}`}>
            {statusLabels[property.status]}
          </span>
        </div>

        {/* Informações da propriedade */}
        <div className="grid grid-cols-2 gap-4">
          {/* Tipo */}
          <div>
            <p className="text-sm text-gray-500">Tipo</p>
            <p className="text-sm font-medium text-gray-900 capitalize">
              {property.type === 'apartment' ? 'Apartamento' :
               property.type === 'house' ? 'Casa' : 'Comercial'}
            </p>
          </div>

          {/* Aluguel */}
          {showFinancialValues && (
            <div>
              <p className="text-sm text-gray-500">Aluguel</p>
              <div className="flex items-center text-sm font-medium text-gray-900">
                <DollarSign className="h-4 w-4 mr-1 text-green-600" />
                <span>R$ {property.rentValue.toLocaleString('pt-BR')}</span>
              </div>
            </div>
          )}

          {/* Inquilino */}
          <div className="col-span-2">
            {property.tenant ? (
              <div>
                <p className="text-sm text-gray-500">Inquilino</p>
                <div className="flex items-center text-sm font-medium text-gray-900">
                  <Users className="h-4 w-4 mr-1 text-blue-600" />
                  <span>{property.tenant.name}</span>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-400 italic">
                Sem inquilino
              </div>
            )}
          </div>
        </div>

        {/* Unidade de energia (se houver) */}
        {property.energyUnitName && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Unidade de energia: <span className="font-medium">{property.energyUnitName}</span>
            </p>
          </div>
        )}
      </div>
    );
  };

  // Componente de loading para primeira carga
  if (isLoading && properties.length === 0) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="flex items-center space-x-3 text-gray-500">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Carregando propriedades...</span>
        </div>
      </div>
    );
  }

  // Componente de erro
  if (error) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-red-500 mb-4">
          <p className="text-lg font-semibold">Erro ao carregar propriedades</p>
          <p className="text-sm">{error.message}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Cabeçalho com filtros */}
      <div className="mb-6 space-y-4">
        {/* Título e contador */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Propriedades
          </h2>
          <div className="text-sm text-gray-500">
            {totalCount > 0 && (
              <span>
                Mostrando {filteredProperties.length} de {totalCount} propriedades
              </span>
            )}
          </div>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar propriedades..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filtro de status */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
            >
              <option value="all">Todos os status</option>
              <option value="rented">Alugado</option>
              <option value="vacant">Vago</option>
              <option value="maintenance">Manutenção</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista infinita de propriedades */}
      <InfiniteList
        items={filteredProperties}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        loadMore={loadMore}
        renderItem={renderPropertyItem}
        className="space-y-4"
        emptyComponent={
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'all' 
                ? 'Nenhuma propriedade encontrada' 
                : 'Nenhuma propriedade cadastrada'
              }
            </h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all'
                ? 'Tente ajustar os filtros de busca'
                : 'Cadastre sua primeira propriedade para começar'
              }
            </p>
          </div>
        }
      />

      {/* Estatísticas de performance */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg text-xs text-gray-600">
          <p><strong>Debug Performance:</strong></p>
          <p>• Propriedades carregadas: {properties.length}/{totalCount}</p>
          <p>• Propriedades filtradas: {filteredProperties.length}</p>
          <p>• Próxima página disponível: {hasNextPage ? 'Sim' : 'Não'}</p>
          <p>• Carregando mais: {isFetchingNextPage ? 'Sim' : 'Não'}</p>
        </div>
      )}
    </div>
  );
}