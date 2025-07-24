import React from 'react';
import { 
  Brain, 
  Image as ImageIcon, 
  FileText, 
  Languages, 
  Cpu,
  Calendar,
  CreditCard,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface CreditRecord {
  id: string;
  description: string;
  type: 'LLM' | 'Imagem' | 'Conteúdo' | 'Tradução' | 'Inferência';
  creditCost: number;
  timestamp: string;
  status: 'completed' | 'processing' | 'failed';
}

const creditMap = {
  LLM: { icon: Brain, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  Imagem: { icon: ImageIcon, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  Conteúdo: { icon: FileText, color: 'text-green-600', bgColor: 'bg-green-50' },
  Tradução: { icon: Languages, color: 'text-orange-600', bgColor: 'bg-orange-50' },
  Inferência: { icon: Cpu, color: 'text-red-600', bgColor: 'bg-red-50' }
};

// Mock data para demonstração
const mockRecords: CreditRecord[] = [
  {
    id: '1',
    description: 'Análise de risco de inquilino - João Silva',
    type: 'LLM',
    creditCost: 15,
    timestamp: '2024-12-15T10:30:00Z',
    status: 'completed'
  },
  {
    id: '2',
    description: 'Conversão de imagem de imóvel - Apt 101',
    type: 'Imagem',
    creditCost: 8,
    timestamp: '2024-12-15T09:45:00Z',
    status: 'completed'
  },
  {
    id: '3',
    description: 'Resumo financeiro mensal - Dezembro',
    type: 'Conteúdo',
    creditCost: 12,
    timestamp: '2024-12-15T09:15:00Z',
    status: 'completed'
  },
  {
    id: '4',
    description: 'Tradução de contrato - Inglês para Português',
    type: 'Tradução',
    creditCost: 6,
    timestamp: '2024-12-15T08:30:00Z',
    status: 'completed'
  },
  {
    id: '5',
    description: 'Análise preditiva de mercado imobiliário',
    type: 'Inferência',
    creditCost: 25,
    timestamp: '2024-12-15T08:00:00Z',
    status: 'completed'
  },
  {
    id: '6',
    description: 'Geração de descrição automatizada - Casa Jardim',
    type: 'LLM',
    creditCost: 4,
    timestamp: '2024-12-14T17:20:00Z',
    status: 'completed'
  },
  {
    id: '7',
    description: 'Otimização de imagens para listagem',
    type: 'Imagem',
    creditCost: 3,
    timestamp: '2024-12-14T16:45:00Z',
    status: 'completed'
  },
  {
    id: '8',
    description: 'Análise de sentimento - Avaliações de inquilinos',
    type: 'LLM',
    creditCost: 18,
    timestamp: '2024-12-14T15:30:00Z',
    status: 'completed'
  }
];

const CreditConsumptionPanel: React.FC = () => {
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCreditColor = (cost: number) => {
    if (cost >= 20) return 'text-red-600 font-bold';
    if (cost >= 10) return 'text-orange-600 font-semibold';
    return 'text-green-600 font-medium';
  };

  const getCreditIcon = (cost: number) => {
    if (cost >= 15) return <TrendingUp className="w-4 h-4 text-red-500" />;
    return <TrendingDown className="w-4 h-4 text-green-500" />;
  };

  const totalCreditsUsed = mockRecords.reduce((total, record) => total + record.creditCost, 0);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Painel de Consumo de Créditos
          </h1>
          <p className="text-gray-600">
            Acompanhe o consumo de créditos das operações de IA realizadas no sistema
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Créditos</p>
                <p className="text-2xl font-bold text-gray-900">{totalCreditsUsed}</p>
              </div>
              <CreditCard className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Operações Hoje</p>
                <p className="text-2xl font-bold text-gray-900">{mockRecords.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Média por Operação</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(totalCreditsUsed / mockRecords.length)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Maior Consumo</p>
                <p className="text-2xl font-bold text-red-600">
                  {Math.max(...mockRecords.map(r => r.creditCost))}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Records List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              Histórico de Operações
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {mockRecords.map((record) => {
              const { icon: Icon, color, bgColor } = creditMap[record.type];
              
              return (
                <div key={record.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className={`p-2 rounded-lg ${bgColor}`}>
                        <Icon className={`w-5 h-5 ${color}`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${color}`}>
                            {record.type}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(record.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {record.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {getCreditIcon(record.creditCost)}
                      <span className={`text-lg font-bold ${getCreditColor(record.creditCost)}`}>
                        {record.creditCost}
                      </span>
                      <span className="text-sm text-gray-500">créditos</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Type Summary */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              Consumo por Tipo de Operação
            </h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {Object.entries(creditMap).map(([type, config]) => {
                const { icon: Icon, color, bgColor } = config;
                const typeRecords = mockRecords.filter(r => r.type === type);
                const typeTotal = typeRecords.reduce((sum, r) => sum + r.creditCost, 0);
                
                return (
                  <div key={type} className="text-center">
                    <div className={`inline-flex p-3 rounded-lg ${bgColor} mb-2`}>
                      <Icon className={`w-6 h-6 ${color}`} />
                    </div>
                    <h3 className="text-sm font-medium text-gray-900 mb-1">{type}</h3>
                    <p className="text-2xl font-bold text-gray-900">{typeTotal}</p>
                    <p className="text-xs text-gray-500">{typeRecords.length} operações</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditConsumptionPanel;