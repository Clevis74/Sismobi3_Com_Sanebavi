import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target: string; // Seletor CSS do elemento alvo
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: 'click' | 'hover' | 'none';
  optional?: boolean;
}

interface OnboardingFlow {
  id: string;
  name: string;
  description: string;
  steps: OnboardingStep[];
  category: 'first-time' | 'feature' | 'advanced';
}

interface OnboardingContextType {
  isOnboardingActive: boolean;
  currentFlow: OnboardingFlow | null;
  currentStepIndex: number;
  completedFlows: string[];
  startOnboarding: (flowId: string) => void;
  nextStep: () => void;
  previousStep: () => void;
  skipOnboarding: () => void;
  completeOnboarding: () => void;
  resetOnboarding: (flowId?: string) => void;
  isFlowCompleted: (flowId: string) => boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

// Fluxos de onboarding predefinidos
const ONBOARDING_FLOWS: OnboardingFlow[] = [
  {
    id: 'first-time-user',
    name: 'Bem-vindo ao Sismobi',
    description: 'Vamos te guiar pelos recursos principais do sistema',
    category: 'first-time',
    steps: [
      {
        id: 'welcome',
        title: 'Bem-vindo! 👋',
        description: 'Este é o painel principal onde você pode ver um resumo de todas as suas propriedades e transações.',
        target: '[data-tour="dashboard"]',
        position: 'bottom'
      },
      {
        id: 'properties',
        title: 'Gerenciar Propriedades',
        description: 'Aqui você cadastra e gerencia todas as suas propriedades imobiliárias.',
        target: '[data-tour="properties-nav"]',
        position: 'bottom',
        action: 'hover'
      },
      {
        id: 'tenants',
        title: 'Controlar Inquilinos',
        description: 'Cadastre inquilinos, gerencie contratos e acompanhe pagamentos.',
        target: '[data-tour="tenants-nav"]',
        position: 'bottom',
        action: 'hover'
      },
      {
        id: 'transactions',
        title: 'Controle Financeiro',
        description: 'Registre receitas e despesas para manter suas finanças organizadas.',
        target: '[data-tour="transactions-nav"]',
        position: 'bottom',
        action: 'hover'
      },
      {
        id: 'sanebavi',
        title: 'Rateio Sanebavi',
        description: 'Nossa funcionalidade exclusiva para divisão proporcional de contas de água e energia.',
        target: '[data-tour="sanebavi-nav"]',
        position: 'bottom',
        action: 'hover'
      },
      {
        id: 'theme',
        title: 'Personalização',
        description: 'Alterne entre tema claro e escuro conforme sua preferência.',
        target: '[data-tour="theme-toggle"]',
        position: 'left',
        optional: true
      }
    ]
  },
  {
    id: 'property-management',
    name: 'Gerenciamento de Propriedades',
    description: 'Aprenda a cadastrar e gerenciar propriedades eficientemente',
    category: 'feature',
    steps: [
      {
        id: 'add-property',
        title: 'Cadastrar Nova Propriedade',
        description: 'Clique aqui para adicionar uma nova propriedade ao seu portfólio.',
        target: '[data-tour="add-property"]',
        position: 'bottom',
        action: 'click'
      },
      {
        id: 'property-details',
        title: 'Detalhes da Propriedade',
        description: 'Preencha informações como endereço, tipo, valor do aluguel e valor de compra.',
        target: '[data-tour="property-form"]',
        position: 'right'
      },
      {
        id: 'property-status',
        title: 'Status da Propriedade',
        description: 'Defina se a propriedade está alugada, vaga ou em manutenção.',
        target: '[data-tour="property-status"]',
        position: 'top'
      }
    ]
  },
  {
    id: 'financial-control',
    name: 'Controle Financeiro',
    description: 'Domine o controle financeiro das suas propriedades',
    category: 'feature',
    steps: [
      {
        id: 'financial-summary',
        title: 'Resumo Financeiro',
        description: 'Veja receitas totais, despesas e lucro líquido de forma consolidada.',
        target: '[data-tour="financial-summary"]',
        position: 'bottom'
      },
      {
        id: 'add-transaction',
        title: 'Registrar Transação',
        description: 'Adicione receitas (aluguéis) e despesas (manutenção, impostos, etc.).',
        target: '[data-tour="add-transaction"]',
        position: 'bottom'
      },
      {
        id: 'transaction-categories',
        title: 'Categorias',
        description: 'Organize suas transações por categorias para melhor controle.',
        target: '[data-tour="transaction-category"]',
        position: 'top'
      }
    ]
  },
  {
    id: 'sanebavi-features',
    name: 'Recursos Sanebavi',
    description: 'Aprenda a usar o sistema de rateio inteligente de contas',
    category: 'advanced',
    steps: [
      {
        id: 'energy-bills',
        title: 'Contas de Energia',
        description: 'Registre contas de energia e divida proporcionalmente entre inquilinos.',
        target: '[data-tour="energy-bills"]',
        position: 'bottom'
      },
      {
        id: 'water-bills',
        title: 'Contas de Água',
        description: 'Divida contas de água baseado no número de pessoas por unidade.',
        target: '[data-tour="water-bills"]',
        position: 'bottom'
      },
      {
        id: 'consumption-tracking',
        title: 'Acompanhar Consumo',
        description: 'Monitore o consumo individual e calcule valores proporcionais automaticamente.',
        target: '[data-tour="consumption-tracking"]',
        position: 'right'
      }
    ]
  }
];

interface OnboardingProviderProps {
  children: React.ReactNode;
}

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const [isOnboardingActive, setIsOnboardingActive] = useState(false);
  const [currentFlow, setCurrentFlow] = useState<OnboardingFlow | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedFlows, setCompletedFlows] = useLocalStorage<string[]>('sismobi-completed-onboarding', []);

  // Auto-iniciar onboarding para novos usuários
  useEffect(() => {
    const isFirstTime = !completedFlows.includes('first-time-user');
    const hasSeenWelcome = localStorage.getItem('sismobi-seen-welcome');
    
    if (isFirstTime && !hasSeenWelcome) {
      // Delay para garantir que os elementos estejam na DOM
      setTimeout(() => {
        startOnboarding('first-time-user');
        localStorage.setItem('sismobi-seen-welcome', 'true');
      }, 1000);
    }
  }, [completedFlows]);

  const startOnboarding = (flowId: string) => {
    const flow = ONBOARDING_FLOWS.find(f => f.id === flowId);
    if (!flow) return;

    setCurrentFlow(flow);
    setCurrentStepIndex(0);
    setIsOnboardingActive(true);
  };

  const nextStep = () => {
    if (!currentFlow) return;

    if (currentStepIndex < currentFlow.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      completeOnboarding();
    }
  };

  const previousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const skipOnboarding = () => {
    setIsOnboardingActive(false);
    setCurrentFlow(null);
    setCurrentStepIndex(0);
  };

  const completeOnboarding = () => {
    if (currentFlow && !completedFlows.includes(currentFlow.id)) {
      setCompletedFlows([...completedFlows, currentFlow.id]);
    }
    setIsOnboardingActive(false);
    setCurrentFlow(null);
    setCurrentStepIndex(0);
  };

  const resetOnboarding = (flowId?: string) => {
    if (flowId) {
      setCompletedFlows(completedFlows.filter(id => id !== flowId));
    } else {
      setCompletedFlows([]);
      localStorage.removeItem('sismobi-seen-welcome');
    }
  };

  const isFlowCompleted = (flowId: string) => {
    return completedFlows.includes(flowId);
  };

  const value: OnboardingContextType = {
    isOnboardingActive,
    currentFlow,
    currentStepIndex,
    completedFlows,
    startOnboarding,
    nextStep,
    previousStep,
    skipOnboarding,
    completeOnboarding,
    resetOnboarding,
    isFlowCompleted
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}

export { ONBOARDING_FLOWS };