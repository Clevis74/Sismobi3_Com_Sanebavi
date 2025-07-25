import React, { useState } from 'react';
import { HelpCircle, X, Lightbulb, ArrowRight, CheckCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useSimpleMode } from '../../contexts/SimpleModeContext';

interface HelpTip {
  id: string;
  title: string;
  content: string;
  action?: {
    label: string;
    href: string;
  };
}

interface ContextualHelpProps {
  className?: string;
}

export const ContextualHelp: React.FC<ContextualHelpProps> = ({ className = '' }) => {
  const { isSimpleMode } = useSimpleMode();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [dismissedTips, setDismissedTips] = useState<string[]>(() => {
    const saved = localStorage.getItem('sismobi-dismissed-tips');
    return saved ? JSON.parse(saved) : [];
  });

  const helpTips: Record<string, HelpTip[]> = {
    '/': [
      {
        id: 'dashboard-overview',
        title: 'Visão Geral do Dashboard',
        content: 'Aqui você vê um resumo de todos os seus imóveis, receitas e despesas. Use os cards para navegar rapidamente.',
        action: { label: 'Ver propriedades', href: '/properties' }
      },
      {
        id: 'financial-visibility',
        title: 'Controle de Visibilidade',
        content: 'Você pode ocultar ou mostrar valores financeiros clicando no botão "Ocultar Valores" no cabeçalho.',
      },
      {
        id: 'quick-actions',
        title: 'Ações Rápidas',
        content: 'Use os botões de ação rápida para acessar as funcionalidades mais utilizadas rapidamente.',
      }
    ],
    '/properties': [
      {
        id: 'add-first-property',
        title: 'Adicionar Primeira Propriedade',
        content: 'Comece cadastrando suas propriedades com informações básicas como nome, endereço e valor do aluguel.',
        action: { label: 'Nova propriedade', href: '/properties' }
      },
      {
        id: 'property-status',
        title: 'Status da Propriedade',
        content: 'Mantenha o status atualizado: "Alugada", "Vaga" ou "Em Manutenção" para controle preciso.',
      },
      {
        id: 'energy-unit',
        title: 'Unidade de Energia',
        content: 'Preencha o identificador da unidade de energia para usar o rateio de contas elétricas.',
      }
    ],
    '/tenants': [
      {
        id: 'link-to-property',
        title: 'Vinculação à Propriedade',
        content: 'Sempre vincule o inquilino a uma propriedade específica para organizar melhor os dados.',
      },
      {
        id: 'contract-info',
        title: 'Informações do Contrato',
        content: 'Preencha datas de início e vencimento para receber lembretes automáticos.',
      },
      {
        id: 'deposit-tracking',
        title: 'Controle de Calção',
        content: 'Registre o valor do depósito e se foi pago à vista ou parcelado.',
      }
    ],
    '/transactions': [
      {
        id: 'categorize-transactions',
        title: 'Categorizar Transações',
        content: 'Organize receitas e despesas por categorias para relatórios mais precisos.',
      },
      {
        id: 'recurring-transactions',
        title: 'Transações Recorrentes',
        content: 'Configure transações recorrentes para aluguéis e despesas fixas.',
      }
    ],
    '/reports': [
      {
        id: 'financial-analysis',
        title: 'Análise Financeira',
        content: 'Use os relatórios para analisar a rentabilidade e ROI dos seus investimentos.',
      },
      {
        id: 'export-reports',
        title: 'Exportar Relatórios',
        content: 'Exporte relatórios em PDF ou Excel para compartilhar com contadores.',
      }
    ]
  };

  const currentTips = helpTips[location.pathname] || [];
  const availableTips = currentTips.filter(tip => !dismissedTips.includes(tip.id));

  const handleDismissTip = (tipId: string) => {
    const newDismissedTips = [...dismissedTips, tipId];
    setDismissedTips(newDismissedTips);
    localStorage.setItem('sismobi-dismissed-tips', JSON.stringify(newDismissedTips));
  };

  const handleResetTips = () => {
    setDismissedTips([]);
    localStorage.removeItem('sismobi-dismissed-tips');
  };

  if (!isSimpleMode || availableTips.length === 0) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors"
        title="Dicas e ajuda"
      >
        <HelpCircle className="w-4 h-4" />
        <span className="text-sm font-medium">Dicas</span>
        {availableTips.length > 0 && (
          <span className="w-2 h-2 bg-yellow-600 rounded-full"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-gray-900">Dicas Contextuais</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {availableTips.length > 0 ? (
              <div className="p-4 space-y-4">
                {availableTips.map((tip) => (
                  <div key={tip.id} className="relative">
                    <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Lightbulb className="w-4 h-4 text-yellow-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">{tip.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{tip.content}</p>
                        {tip.action && (
                          <a
                            href={tip.action.href}
                            className="inline-flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
                          >
                            <span>{tip.action.label}</span>
                            <ArrowRight className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <button
                        onClick={() => handleDismissTip(tip.id)}
                        className="text-gray-400 hover:text-gray-600 p-1"
                        title="Dispensar dica"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <h4 className="font-medium text-gray-900 mb-2">Todas as dicas foram lidas!</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Você já viu todas as dicas disponíveis para esta página.
                </p>
                <button
                  onClick={handleResetTips}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Mostrar dicas novamente
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const InlineHelp: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex items-center space-x-2 text-sm text-gray-600">
      <HelpCircle className="w-4 h-4" />
      <span>{children}</span>
    </div>
  );
};