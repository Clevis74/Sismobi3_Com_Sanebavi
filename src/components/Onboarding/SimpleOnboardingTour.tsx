import React, { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, CheckCircle, Home, Users, DollarSign, FileText } from 'lucide-react';
import { useSimpleMode } from '../../contexts/SimpleModeContext';

interface SimpleOnboardingTourProps {
  onComplete?: () => void;
}

export const SimpleOnboardingTour: React.FC<SimpleOnboardingTourProps> = ({ onComplete }) => {
  const { isSimpleMode } = useSimpleMode();
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Verificar se é a primeira vez do usuário e está no modo simples
    const hasSeenTour = localStorage.getItem('sismobi-simple-tour-completed');
    if (!hasSeenTour && isSimpleMode) {
      setIsVisible(true);
    }
  }, [isSimpleMode]);

  const steps = [
    {
      title: 'Bem-vindo ao SisMobi!',
      content: 'Vamos te ajudar a começar a gerenciar seus imóveis de forma simples e eficiente.',
      icon: Home,
      action: 'Começar'
    },
    {
      title: 'Cadastre suas propriedades',
      content: 'Primeiro, adicione suas propriedades com informações básicas como nome, endereço e valor do aluguel.',
      icon: Home,
      action: 'Próximo'
    },
    {
      title: 'Adicione inquilinos',
      content: 'Depois, cadastre os inquilinos e vincule-os às propriedades. Você pode adicionar contratos e dados de pagamento.',
      icon: Users,
      action: 'Próximo'
    },
    {
      title: 'Controle financeiro',
      content: 'Registre receitas (aluguéis) e despesas (manutenção, impostos) para acompanhar sua rentabilidade.',
      icon: DollarSign,
      action: 'Próximo'
    },
    {
      title: 'Pronto para começar!',
      content: 'Agora você tem tudo que precisa para gerenciar seus imóveis. Lembre-se: você pode alternar para o modo avançado a qualquer momento.',
      icon: CheckCircle,
      action: 'Começar a usar'
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('sismobi-simple-tour-completed', 'true');
    setIsVisible(false);
    onComplete?.();
  };

  const handleSkip = () => {
    localStorage.setItem('sismobi-simple-tour-completed', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const currentStepData = steps[currentStep];
  const IconComponent = currentStepData.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-500">
              {currentStep + 1} de {steps.length}
            </span>
          </div>
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <IconComponent className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {currentStepData.title}
            </h2>
            <p className="text-gray-600">
              {currentStepData.content}
            </p>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                currentStep === 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>

            <div className="flex space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span>{currentStepData.action}</span>
              {currentStep < steps.length - 1 && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};