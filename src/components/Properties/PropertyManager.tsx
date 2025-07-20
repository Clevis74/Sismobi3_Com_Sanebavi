import React, { useState } from 'react';
import { Plus, Edit, Trash2, MapPin, DollarSign } from 'lucide-react';
import { Property } from '../../types';
import { PropertyForm } from './PropertyForm';
import { formatCurrencyWithVisibility } from '../../utils/calculations';
import { useActivation } from '../../contexts/ActivationContext';

interface PropertyManagerProps {
  properties: Property[];
  showFinancialValues: boolean;
  onAddProperty: (property: Omit<Property, 'id' | 'createdAt'>) => void;
  onUpdateProperty: (id: string, property: Partial<Property>) => void;
  onDeleteProperty: (id: string) => void;
}

export const PropertyManager: React.FC<PropertyManagerProps> = ({
  properties,
  showFinancialValues,
  onAddProperty,
  onUpdateProperty,
  onDeleteProperty
}) => {
  const { isDemoMode } = useActivation();
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  // Configurações do modo DEMO
  const DEMO_LIMITS = {
    maxProperties: 5
  };

  const isAtDemoLimit = isDemoMode && properties.length >= DEMO_LIMITS.maxProperties;
  const canAddProperty = !isDemoMode || properties.length < DEMO_LIMITS.maxProperties;
  const handleAddProperty = (propertyData: Omit<Property, 'id' | 'createdAt'>) => {
    if (isAtDemoLimit) {
      return; // Não permite adicionar se estiver no limite do demo
    }
    onAddProperty(propertyData);
    setShowForm(false);
  };

  const handleEditProperty = (property: Property) => {
    setEditingProperty(property);
    setShowForm(true);
  };

  const handleUpdateProperty = (propertyData: Omit<Property, 'id' | 'createdAt'>) => {
    if (editingProperty) {
      onUpdateProperty(editingProperty.id, propertyData);
      setEditingProperty(null);
      setShowForm(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'rented': return 'bg-green-100 text-green-800';
      case 'vacant': return 'bg-yellow-100 text-yellow-800';
      case 'maintenance': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'rented': return 'Alugado';
      case 'vacant': return 'Vago';
      case 'maintenance': return 'Manutenção';
      default: return 'Indefinido';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Propriedades</h2>
          {isDemoMode && (
            <p className="text-sm text-orange-600 mt-1">
              Modo DEMO: {properties.length}/{DEMO_LIMITS.maxProperties} propriedades utilizadas
            </p>
          )}
        </div>
        <div className="flex flex-col items-end space-y-2">
          <button
            onClick={() => setShowForm(true)}
            disabled={isAtDemoLimit}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
              isAtDemoLimit
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            title={isAtDemoLimit ? 'Limite do modo DEMO atingido' : 'Adicionar nova propriedade'}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Propriedade
          </button>
          {isAtDemoLimit && (
            <p className="text-xs text-red-600 text-right max-w-xs">
              Limite de {DEMO_LIMITS.maxProperties} propriedades atingido no modo DEMO. 
              Ative o sistema para cadastros ilimitados.
            </p>
          )}
        </div>
      </div>

      {/* Aviso do modo DEMO */}
      {isDemoMode && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <h3 className="text-orange-800 font-medium">Modo DEMO Ativo</h3>
          </div>
          <p className="text-orange-700 text-sm mt-1">
            Você pode cadastrar até {DEMO_LIMITS.maxProperties} propriedades. 
            Para acesso ilimitado, ative o sistema na aba "Ativação".
          </p>
        </div>
      )}

      {showForm && (
        <PropertyForm
          property={editingProperty}
          onSubmit={editingProperty ? handleUpdateProperty : handleAddProperty}
          onCancel={() => {
            setShowForm(false);
            setEditingProperty(null);
          }}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <div key={property.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{property.name}</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(property.status)}`}>
                  {getStatusText(property.status)}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span className="text-sm">{property.address}</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <DollarSign className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">{formatCurrencyWithVisibility(property.rentValue, showFinancialValues)}/mês</span>
                </div>
              </div>

              <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                <p>Tipo: {property.type === 'apartment' ? 'Apartamento' : property.type === 'house' ? 'Casa' : 'Comercial'}</p>
                <p>Valor de Compra: {formatCurrencyWithVisibility(property.purchasePrice, showFinancialValues)}</p>
                {property.tenant && (
                  <p>Inquilino: {property.tenant.name}</p>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => handleEditProperty(property)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDeleteProperty(property.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {properties.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Nenhuma propriedade cadastrada</p>
          <p className="text-gray-400 mt-2">Comece adicionando sua primeira propriedade</p>
        </div>
      )}
    </div>
  );
};