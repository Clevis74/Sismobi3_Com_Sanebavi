import React from 'react';
import { DollarSign, Home, Users, TrendingUp, Plus, Eye, EyeOff } from 'lucide-react';
import { FinancialSummary } from '../../types';
import { formatCurrencyWithVisibility } from '../../utils/calculations';
import { useSimpleMode } from '../../contexts/SimpleModeContext';

interface SimpleDashboardProps {
  summary: FinancialSummary;
  properties: any[];
  transactions: any[];
  showFinancialValues: boolean;
  onToggleFinancialValues: () => void;
  onAddTenant?: (tenant: any) => void;
}

export const SimpleDashboard: React.FC<SimpleDashboardProps> = ({ 
  summary, 
  properties, 
  transactions, 
  showFinancialValues,
  onToggleFinancialValues,
  onAddTenant 
}) => {
  const { isSimpleMode } = useSimpleMode();

  if (!isSimpleMode) {
    return null; // Não renderizar se não estiver no modo simples
  }

  const rentedProperties = properties.filter(p => p.status === 'rented');
  const vacantProperties = properties.filter(p => p.status === 'vacant');

  return (
    <div className="space-y-6">
      {/* Header simplificado */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Resumo dos Seus Imóveis</h2>
          <button
            onClick={onToggleFinancialValues}
            className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            title={showFinancialValues ? 'Ocultar valores' : 'Mostrar valores'}
          >
            {showFinancialValues ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{showFinancialValues ? 'Ocultar' : 'Mostrar'} Valores</span>
          </button>
        </div>

        {/* Cards principais simplificados */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Receita Mensal */}
          <div className="text-center p-6 bg-green-50 rounded-lg border-2 border-green-100">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Receita Mensal</h3>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrencyWithVisibility(summary.totalIncome, showFinancialValues)}
            </p>
            <p className="text-sm text-gray-600 mt-1">Valor total dos aluguéis</p>
          </div>

          {/* Propriedades */}
          <div className="text-center p-6 bg-blue-50 rounded-lg border-2 border-blue-100">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Home className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Propriedades</h3>
            <p className="text-2xl font-bold text-blue-600">{summary.totalProperties}</p>
            <p className="text-sm text-gray-600 mt-1">
              {rentedProperties.length} alugadas, {vacantProperties.length} vagas
            </p>
          </div>

          {/* Lucro Líquido */}
          <div className="text-center p-6 bg-purple-50 rounded-lg border-2 border-purple-100">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Lucro Líquido</h3>
            <p className="text-2xl font-bold text-purple-600">
              {formatCurrencyWithVisibility(summary.netIncome, showFinancialValues)}
            </p>
            <p className="text-sm text-gray-600 mt-1">Após descontar despesas</p>
          </div>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <a
            href="/properties"
            className="flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Home className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Propriedades</h4>
              <p className="text-sm text-gray-600">Ver e gerenciar</p>
            </div>
          </a>

          <a
            href="/tenants"
            className="flex items-center space-x-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
          >
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Inquilinos</h4>
              <p className="text-sm text-gray-600">Contratos e pagamentos</p>
            </div>
          </a>

          <a
            href="/transactions"
            className="flex items-center space-x-3 p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
          >
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Transações</h4>
              <p className="text-sm text-gray-600">Receitas e despesas</p>
            </div>
          </a>

          <a
            href="/reports"
            className="flex items-center space-x-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Relatórios</h4>
              <p className="text-sm text-gray-600">Análises financeiras</p>
            </div>
          </a>
        </div>
      </div>

      {/* Status das Propriedades */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Status das Propriedades</h3>
        <div className="space-y-3">
          {properties.length === 0 ? (
            <div className="text-center py-8">
              <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-600 mb-2">Nenhuma propriedade cadastrada</h4>
              <p className="text-gray-500 mb-4">Comece adicionando sua primeira propriedade</p>
              <a
                href="/properties"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Propriedade
              </a>
            </div>
          ) : (
            properties.map((property) => (
              <div key={property.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${
                    property.status === 'rented' ? 'bg-green-500' : 
                    property.status === 'vacant' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <div>
                    <h4 className="font-medium text-gray-900">{property.name}</h4>
                    <p className="text-sm text-gray-600">{property.address}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    {formatCurrencyWithVisibility(property.rentValue, showFinancialValues)}/mês
                  </p>
                  <p className={`text-sm ${
                    property.status === 'rented' ? 'text-green-600' : 
                    property.status === 'vacant' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {property.status === 'rented' ? 'Alugada' : 
                     property.status === 'vacant' ? 'Vaga' : 'Manutenção'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Dicas para Iniciantes */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Dicas para Começar</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">1. Cadastre suas propriedades</h4>
            <p className="text-sm text-gray-600">Adicione informações básicas: nome, endereço e valor do aluguel</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">2. Adicione inquilinos</h4>
            <p className="text-sm text-gray-600">Registre os dados dos inquilinos e vincule às propriedades</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">3. Controle receitas</h4>
            <p className="text-sm text-gray-600">Registre os aluguéis recebidos mensalmente</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">4. Acompanhe despesas</h4>
            <p className="text-sm text-gray-600">Registre gastos como manutenção, impostos e taxas</p>
          </div>
        </div>
      </div>
    </div>
  );
};