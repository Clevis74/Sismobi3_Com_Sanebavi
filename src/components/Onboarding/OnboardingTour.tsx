import React, { useEffect, useState, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Play, SkipForward } from 'lucide-react';
import { useOnboarding } from '../../contexts/OnboardingContext';

interface TooltipPosition {
  top: number;
  left: number;
  arrowPosition: 'top' | 'bottom' | 'left' | 'right';
}

export function OnboardingTour() {
  const {
    isOnboardingActive,
    currentFlow,
    currentStepIndex,
    nextStep,
    previousStep,
    skipOnboarding,
    completeOnboarding
  } = useOnboarding();

  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition>({
    top: 0,
    left: 0,
    arrowPosition: 'bottom'
  });
  const [targetElement, setTargetElement] = useState<Element | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const currentStep = currentFlow?.steps[currentStepIndex];
  const isLastStep = currentFlow ? currentStepIndex === currentFlow.steps.length - 1 : false;
  const isFirstStep = currentStepIndex === 0;

  // Calcular posição do tooltip
  const calculatePosition = (target: Element, position: 'top' | 'bottom' | 'left' | 'right') => {
    const targetRect = target.getBoundingClientRect();
    const tooltipRect = tooltipRef.current?.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    if (!tooltipRect) return { top: 0, left: 0, arrowPosition: position };

    let top = 0;
    let left = 0;
    let arrowPosition: 'top' | 'bottom' | 'left' | 'right' = position;

    switch (position) {
      case 'bottom':
        top = targetRect.bottom + 10;
        left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
        
        // Ajustar se sair da viewport
        if (top + tooltipRect.height > viewport.height) {
          top = targetRect.top - tooltipRect.height - 10;
          arrowPosition = 'top';
        }
        if (left < 10) left = 10;
        if (left + tooltipRect.width > viewport.width - 10) {
          left = viewport.width - tooltipRect.width - 10;
        }
        break;

      case 'top':
        top = targetRect.top - tooltipRect.height - 10;
        left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
        
        if (top < 10) {
          top = targetRect.bottom + 10;
          arrowPosition = 'bottom';
        }
        if (left < 10) left = 10;
        if (left + tooltipRect.width > viewport.width - 10) {
          left = viewport.width - tooltipRect.width - 10;
        }
        break;

      case 'right':
        top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
        left = targetRect.right + 10;
        
        if (left + tooltipRect.width > viewport.width - 10) {
          left = targetRect.left - tooltipRect.width - 10;
          arrowPosition = 'left';
        }
        if (top < 10) top = 10;
        if (top + tooltipRect.height > viewport.height - 10) {
          top = viewport.height - tooltipRect.height - 10;
        }
        break;

      case 'left':
        top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
        left = targetRect.left - tooltipRect.width - 10;
        
        if (left < 10) {
          left = targetRect.right + 10;
          arrowPosition = 'right';
        }
        if (top < 10) top = 10;
        if (top + tooltipRect.height > viewport.height - 10) {
          top = viewport.height - tooltipRect.height - 10;
        }
        break;
    }

    return { top, left, arrowPosition };
  };

  // Atualizar posição do tooltip quando o step muda
  useEffect(() => {
    if (!isOnboardingActive || !currentStep) return;

    const updatePosition = () => {
      const target = document.querySelector(currentStep.target);
      if (!target) return;

      setTargetElement(target);
      
      // Garantir que o tooltip está renderizado antes de calcular posição
      requestAnimationFrame(() => {
        const position = calculatePosition(target, currentStep.position);
        setTooltipPosition(position);
      });
    };

    // Delay para elementos que podem não estar na DOM ainda
    const timer = setTimeout(updatePosition, 100);

    // Scroll para o elemento se necessário
    const scrollToTarget = () => {
      const target = document.querySelector(currentStep.target);
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center'
        });
      }
    };

    scrollToTarget();

    // Reposicionar em redimensionamento da janela
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [currentStep, isOnboardingActive]);

  // Highlight do elemento alvo
  useEffect(() => {
    if (!targetElement) return;

    const originalOutline = targetElement.getAttribute('style');
    const originalZIndex = (targetElement as HTMLElement).style.zIndex;

    // Adicionar highlight
    (targetElement as HTMLElement).style.outline = '2px solid #3b82f6';
    (targetElement as HTMLElement).style.outlineOffset = '4px';
    (targetElement as HTMLElement).style.zIndex = '1000';
    (targetElement as HTMLElement).style.position = 'relative';

    return () => {
      // Restaurar estilo original
      if (originalOutline) {
        targetElement.setAttribute('style', originalOutline);
      } else {
        (targetElement as HTMLElement).style.outline = '';
        (targetElement as HTMLElement).style.outlineOffset = '';
        (targetElement as HTMLElement).style.zIndex = originalZIndex;
      }
    };
  }, [targetElement]);

  if (!isOnboardingActive || !currentFlow || !currentStep) {
    return null;
  }

  const handleAction = () => {
    if (currentStep.action === 'click' && targetElement) {
      (targetElement as HTMLElement).click();
    }
    nextStep();
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-30 z-40 transition-opacity duration-300" />
      
      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed z-50 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 transition-all duration-300"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
        }}
      >
        {/* Arrow */}
        <div
          className={`absolute w-3 h-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transform rotate-45 ${
            tooltipPosition.arrowPosition === 'top' ? '-bottom-1.5 border-b-0 border-r-0' :
            tooltipPosition.arrowPosition === 'bottom' ? '-top-1.5 border-t-0 border-l-0' :
            tooltipPosition.arrowPosition === 'left' ? '-right-1.5 border-r-0 border-t-0' :
            '-left-1.5 border-l-0 border-b-0'
          } ${
            tooltipPosition.arrowPosition === 'top' || tooltipPosition.arrowPosition === 'bottom' 
              ? 'left-1/2 -translate-x-1/2' 
              : 'top-1/2 -translate-y-1/2'
          }`}
        />

        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {currentStep.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Passo {currentStepIndex + 1} de {currentFlow.steps.length}
              </p>
            </div>
            <button
              onClick={skipOnboarding}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              title="Pular tour"
            >
              <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {currentStep.description}
          </p>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((currentStepIndex + 1) / currentFlow.steps.length) * 100}%`
              }}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={previousStep}
              disabled={isFirstStep}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Anterior</span>
            </button>

            <div className="flex items-center space-x-2">
              {currentStep.optional && (
                <button
                  onClick={nextStep}
                  className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  Pular
                </button>
              )}

              {currentStep.action === 'click' ? (
                <button
                  onClick={handleAction}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Play className="h-4 w-4" />
                  <span>Executar</span>
                </button>
              ) : (
                <button
                  onClick={isLastStep ? completeOnboarding : nextStep}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {isLastStep ? (
                    <>
                      <span>Concluir</span>
                    </>
                  ) : (
                    <>
                      <span>Próximo</span>
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Componente para iniciar tours específicos
interface TourTriggerProps {
  flowId: string;
  className?: string;
  children: React.ReactNode;
}

export function TourTrigger({ flowId, className = '', children }: TourTriggerProps) {
  const { startOnboarding, isFlowCompleted } = useOnboarding();

  const isCompleted = isFlowCompleted(flowId);

  return (
    <button
      onClick={() => startOnboarding(flowId)}
      className={`relative ${className} ${isCompleted ? 'opacity-75' : ''}`}
      title={isCompleted ? 'Tour já concluído' : 'Iniciar tour guiado'}
    >
      {children}
      {isCompleted && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
      )}
    </button>
  );
}