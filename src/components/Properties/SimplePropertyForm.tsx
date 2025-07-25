import React, { useState } from 'react';
import { Save, X } from 'lucide-react';
import { Property } from '../../types';
import { LoadingButton } from '../UI/LoadingSpinner';

interface SimplePropertyFormProps {
  property?: Property | null;
  onSubmit: (property: Omit<Property, 'id' | 'createdAt'>) => Promise<void>;
  onCancel: () => void;
}

export const SimplePropertyForm: React.FC<SimplePropertyFormProps> = ({
  property,
  onSubmit,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: property?.name || '',
    address: property?.address || '',
    type: property?.type || 'apartment' as const,
    rentValue: property?.rentValue || 0,
    purchasePrice: property?.purchasePrice || 0,
    status: property?.status || 'vacant' as const,
    energyUnitName: property?.energyUnitName || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rentValue' || name === 'purchasePrice' ? Number(value) : value
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {property ? 'Editar' : 'Nova'} Propriedade
        </h3>
        <button
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Informações básicas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome da Propriedade *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Apartamento Centro"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Propriedade *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="apartment">Apartamento</option>
              <option value="house">Casa</option>
              <option value="commercial">Comercial</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Endereço *
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: Rua das Flores, 123 - Centro"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor do Aluguel (R$) *
            </label>
            <input
              type="number"
              name="rentValue"
              value={formData.rentValue}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1500.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status Atual *
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="vacant">Vaga</option>
              <option value="rented">Alugada</option>
              <option value="maintenance">Em Manutenção</option>
            </select>
          </div>
        </div>

        {/* Informações opcionais em seção colapsável */}
        <details className="bg-gray-50 rounded-lg p-4">
          <summary className="cursor-pointer font-medium text-gray-700 mb-3">
            Informações Adicionais (Opcional)
          </summary>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor de Compra (R$)
              </label>
              <input
                type="number"
                name="purchasePrice"
                value={formData.purchasePrice}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="250000.00"
              />
              <p className="text-xs text-gray-500 mt-1">
                Usado para cálculo de ROI (Retorno sobre Investimento)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Identificador da Unidade de Energia
              </label>
              <input
                type="text"
                name="energyUnitName"
                value={formData.energyUnitName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: 802-Ca 01"
              />
              <p className="text-xs text-gray-500 mt-1">
                Para rateio de contas de energia (se aplicável)
              </p>
            </div>
          </div>
        </details>

        {/* Botões */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <LoadingButton
            loading={loading}
            variant="primary"
            className="px-4 py-2"
          >
            <Save className="w-4 h-4 mr-2" />
            {property ? 'Salvar Alterações' : 'Cadastrar Propriedade'}
          </LoadingButton>
        </div>
      </form>
    </div>
  );
};