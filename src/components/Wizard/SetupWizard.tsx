import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Check, Home, Users, DollarSign, Settings } from 'lucide-react';
import { useSimpleMode } from '../../contexts/SimpleModeContext';

interface SetupWizardProps {
  onComplete: () => void;
  onSkip: () => void;
}

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  content: React.ReactNode;
}

export const SetupWizard: React.FC<SetupWizardProps> = ({ onComplete, onSkip }) => {
  const { isSimpleMode } = useSimpleMode();
  const [currentStep, setCurrentStep] = useState(0);
  const [wizardData, setWizardData] = useState({
    hasProperties: false,
    propertyCount: 0,
    needsHelp: true,
    preferredMode: 'simple' as 'simple' | 'advanced',
    primaryUse: 'personal' as 'personal' | 'business'
  });

  const steps: WizardStep[] = [
    {
      id: 'welcome',
      title: 'Bem-vindo ao SisMobi!',
      description: 'Vamos configurar o sistema para suas necessidades',
      icon: Home,
      content: (
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <Home className="w-10 h-10 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Sistema de Gestão Imobiliária
            </h3>
            <p className="text-gray-600">
              Organize seus imóveis, inquilinos e finanças de forma simples e eficiente.
            </p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-700">
              Este assistente levará apenas 2 minutos para configurar o sistema de acordo com suas necessidades.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'properties',
      title: 'Sobre seus imóveis',
      description: 'Nos conte sobre suas propriedades',
      icon: Home,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Você já possui propriedades para gerenciar?
            </h3>
          </div>
          <div className="space-y-4">
            <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="hasProperties"
                checked={wizardData.hasProperties === true}
                onChange={() => setWizardData(prev => ({ ...prev, hasProperties: true }))}
                className="h-4 w-4 text-blue-600"
              />
              <div>
                <div className="font-medium text-gray-900">Sim, já tenho propriedades</div>
                <div className="text-sm text-gray-600">Vou cadastrar minhas propriedades existentes</div>
              </div>
            </label>
            <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="hasProperties"
                checked={wizardData.hasProperties === false}
                onChange={() => setWizardData(prev => ({ ...prev, hasProperties: false }))}
                className="h-4 w-4 text-blue-600"
              />
              <div>
                <div className="font-medium text-gray-900">Ainda não tenho propriedades</div>
                <div className="text-sm text-gray-600">Vou usar para planejar futuros investimentos</div>
              </div>
            </label>
          </div>
          
          {wizardData.hasProperties && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantas propriedades você possui?
              </label>
              <select
                value={wizardData.propertyCount}
                onChange={(e) => setWizardData(prev => ({ ...prev, propertyCount: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={0}>Selecione</option>
                <option value={1}>1 propriedade</option>
                <option value={2}>2-3 propriedades</option>
                <option value={4}>4-5 propriedades</option>
                <option value={6}>6-10 propriedades</option>
                <option value={11}>Mais de 10 propriedades</option>
              </select>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'usage',
      title: 'Como você pretende usar?',
      description: 'Escolha o melhor modo para você',
      icon: Users,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Qual é seu perfil de uso?
            </h3>
          </div>
          <div className="space-y-4">
            <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="primaryUse"
                checked={wizardData.primaryUse === 'personal'}
                onChange={() => setWizardData(prev => ({ ...prev, primaryUse: 'personal' }))}
                className="h-4 w-4 text-blue-600"
              />
              <div>
                <div className="font-medium text-gray-900">Uso pessoal</div>
                <div className="text-sm text-gray-600">Gerenciar meus próprios imóveis</div>
              </div>
            </label>
            <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="primaryUse"
                checked={wizardData.primaryUse === 'business'}
                onChange={() => setWizardData(prev => ({ ...prev, primaryUse: 'business' }))}
                className="h-4 w-4 text-blue-600"
              />
              <div>
                <div className="font-medium text-gray-900">Uso profissional</div>
                <div className="text-sm text-gray-600">Gerenciar imóveis para terceiros</div>
              </div>
            </label>
          </div>
          
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Qual interface você prefere?
            </h4>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="preferredMode"
                  checked={wizardData.preferredMode === 'simple'}
                  onChange={() => setWizardData(prev => ({ ...prev, preferredMode: 'simple' }))}
                  className="h-4 w-4 text-blue-600"
                />
                <div>
                  <div className="font-medium text-gray-900">Modo Simples</div>
                  <div className="text-sm text-gray-600">Interface limpa com funcionalidades essenciais</div>
                </div>
              </label>
              <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="preferredMode"
                  checked={wizardData.preferredMode === 'advanced'}
                  onChange={() => setWizardData(prev => ({ ...prev, preferredMode: 'advanced' }))}
                  className="h-4 w-4 text-blue-600"
                />
                <div>
                  <div className="font-medium text-gray-900">Modo Avançado</div>
                  <div className="text-sm text-gray-600">Acesso a todas as funcionalidades</div>
                </div>
              </label>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'complete',
      title: 'Configuração concluída!',
      description: 'Seu sistema está pronto para uso',
      icon: Check,
      content: (
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Tudo pronto!
            </h3>
            <p className="text-gray-600">
              Seu sistema foi configurado com base nas suas preferências.
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Próximos passos:</h4>
            <ul className="text-sm text-gray-600 space-y-2 text-left">
              {wizardData.hasProperties && (
                <li className="flex items-center space-x-2">
                  <Home className="w-4 h-4 text-blue-600" />
                  <span>Cadastrar suas propriedades</span>
                </li>
              )}
              <li className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-green-600" />
                <span>Adicionar inquilinos (se houver)</span>
              </li>
              <li className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-yellow-600" />
                <span>Registrar transações financeiras</span>
              </li>
            </ul>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Aplicar configurações
      localStorage.setItem('sismobi-simple-mode', JSON.stringify(wizardData.preferredMode === 'simple'));
      localStorage.setItem('sismobi-setup-completed', 'true');
      localStorage.setItem('sismobi-wizard-data', JSON.stringify(wizardData));
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('sismobi-setup-completed', 'true');
    onSkip();
  };

  const currentStepData = steps[currentStep];
  const IconComponent = currentStepData.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <IconComponent className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {currentStepData.title}
                </h2>
                <p className="text-sm text-gray-600">{currentStepData.description}</p>
              </div>
            </div>
            <button
              onClick={handleSkip}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Pular configuração
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">
              Etapa {currentStep + 1} de {steps.length}
            </span>
            <span className="text-sm text-gray-600">
              {Math.round(((currentStep + 1) / steps.length) * 100)}% concluído
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {currentStepData.content}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              currentStep === 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>

          <div className="flex space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentStep ? 'bg-blue-600' : 
                  index < currentStep ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span>
              {currentStep === steps.length - 1 ? 'Começar a usar' : 'Próximo'}
            </span>
            {currentStep < steps.length - 1 && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};