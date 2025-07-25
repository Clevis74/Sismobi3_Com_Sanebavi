import React, { useState } from 'react';
import { Save, X } from 'lucide-react';
import { Tenant } from '../../types';
import { LoadingButton } from '../UI/LoadingSpinner';

interface SimpleTenantFormProps {
  tenant?: Tenant | null;
  properties: any[];
  onSubmit: (tenant: Omit<Tenant, 'id'>) => Promise<void>;
  onCancel: () => void;
}

export const SimpleTenantForm: React.FC<SimpleTenantFormProps> = ({
  tenant,
  properties,
  onSubmit,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    propertyId: tenant?.propertyId || '',
    name: tenant?.name || '',
    email: tenant?.email || '',
    phone: tenant?.phone || '',
    monthlyRent: tenant?.monthlyRent || 0,
    deposit: tenant?.deposit || 0,
    startDate: tenant?.startDate 
      ? new Date(tenant.startDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    status: tenant?.status || 'active' as const,
    // Campos opcionais
    cpf: tenant?.cpf || '',
    agreedPaymentDate: tenant?.agreedPaymentDate
      ? new Date(tenant.agreedPaymentDate).toISOString().split('T')[0]
      : '',
    paymentMethod: tenant?.paymentMethod || '',
    installments: tenant?.installments || '',
    formalizedContract: tenant?.formalizedContract || false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const tenantData = {
        ...formData,
        startDate: new Date(formData.startDate),
        agreedPaymentDate: formData.agreedPaymentDate ? new Date(formData.agreedPaymentDate) : undefined,
        cpf: formData.cpf || undefined,
        paymentMethod: formData.paymentMethod || undefined,
        installments: formData.installments || undefined,
        formalizedContract: formData.formalizedContract || undefined,
      };
      
      await onSubmit(tenantData);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'monthlyRent' || name === 'deposit' ? Number(value) : value
      }));
    }
  };

  const availableProperties = properties.filter(p => p.status === 'vacant' || p.id === tenant?.propertyId);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {tenant ? 'Editar' : 'Novo'} Inquilino
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
              Nome Completo *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: João Silva"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Propriedade *
            </label>
            <select
              name="propertyId"
              value={formData.propertyId}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione uma propriedade</option>
              {availableProperties.map(property => (
                <option key={property.id} value={property.id}>
                  {property.name} - {property.address}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="joao@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefone *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="(11) 99999-9999"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor do Aluguel (R$) *
            </label>
            <input
              type="number"
              name="monthlyRent"
              value={formData.monthlyRent}
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
              Calção/Depósito (R$) *
            </label>
            <input
              type="number"
              name="deposit"
              value={formData.deposit}
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
              Data de Início *
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Informações opcionais em seção colapsável */}
        <details className="bg-gray-50 rounded-lg p-4">
          <summary className="cursor-pointer font-medium text-gray-700 mb-3">
            Informações Adicionais (Opcional)
          </summary>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CPF
                </label>
                <input
                  type="text"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="000.000.000-00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Vencimento do Aluguel
                </label>
                <input
                  type="date"
                  name="agreedPaymentDate"
                  value={formData.agreedPaymentDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Forma de Pagamento do Depósito
                </label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione</option>
                  <option value="À vista">À vista</option>
                  <option value="A prazo">A prazo</option>
                </select>
              </div>

              {formData.paymentMethod === 'A prazo' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de Parcelas
                  </label>
                  <select
                    name="installments"
                    value={formData.installments}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione</option>
                    <option value="2x">2x</option>
                    <option value="3x">3x</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="formalizedContract"
                name="formalizedContract"
                checked={formData.formalizedContract}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="formalizedContract" className="ml-2 block text-sm text-gray-700">
                Contrato formalizado
              </label>
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
            {tenant ? 'Salvar Alterações' : 'Cadastrar Inquilino'}
          </LoadingButton>
        </div>
      </form>
    </div>
  );
};