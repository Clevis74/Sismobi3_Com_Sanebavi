import React from 'react';
import { toast, ToastOptions } from 'react-toastify';
import { CheckCircle, AlertTriangle, XCircle, Info, Trash2, Edit, Plus } from 'lucide-react';

interface CustomToastProps {
  message: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const CustomToast: React.FC<CustomToastProps> = ({ message, icon, action }) => (
  <div className="flex items-center space-x-3">
    {icon && <div className="flex-shrink-0">{icon}</div>}
    <div className="flex-1">
      <p className="text-sm font-medium">{message}</p>
    </div>
    {action && (
      <button
        onClick={action.onClick}
        className="text-xs bg-white bg-opacity-20 hover:bg-opacity-30 px-2 py-1 rounded transition-colors"
      >
        {action.label}
      </button>
    )}
  </div>
);

export const enhancedToast = {
  success: (message: string, options?: ToastOptions & { action?: { label: string; onClick: () => void } }) => {
    toast.success(
      <CustomToast 
        message={message} 
        icon={<CheckCircle className="w-5 h-5 text-green-600" />}
        action={options?.action}
      />,
      {
        ...options,
        className: 'bg-green-50 border-l-4 border-green-400',
      }
    );
  },

  error: (message: string, options?: ToastOptions & { action?: { label: string; onClick: () => void } }) => {
    toast.error(
      <CustomToast 
        message={message} 
        icon={<XCircle className="w-5 h-5 text-red-600" />}
        action={options?.action}
      />,
      {
        ...options,
        className: 'bg-red-50 border-l-4 border-red-400',
      }
    );
  },

  warning: (message: string, options?: ToastOptions & { action?: { label: string; onClick: () => void } }) => {
    toast.warning(
      <CustomToast 
        message={message} 
        icon={<AlertTriangle className="w-5 h-5 text-yellow-600" />}
        action={options?.action}
      />,
      {
        ...options,
        className: 'bg-yellow-50 border-l-4 border-yellow-400',
      }
    );
  },

  info: (message: string, options?: ToastOptions & { action?: { label: string; onClick: () => void } }) => {
    toast.info(
      <CustomToast 
        message={message} 
        icon={<Info className="w-5 h-5 text-blue-600" />}
        action={options?.action}
      />,
      {
        ...options,
        className: 'bg-blue-50 border-l-4 border-blue-400',
      }
    );
  },

  // Toasts específicos para ações
  created: (itemName: string, options?: ToastOptions) => {
    enhancedToast.success(`${itemName} criado com sucesso!`, {
      ...options,
      icon: '🎉'
    });
  },

  updated: (itemName: string, options?: ToastOptions) => {
    enhancedToast.success(`${itemName} atualizado com sucesso!`, {
      ...options,
      icon: '✏️'
    });
  },

  deleted: (itemName: string, options?: ToastOptions & { onUndo?: () => void }) => {
    enhancedToast.success(`${itemName} excluído com sucesso!`, {
      ...options,
      icon: '🗑️',
      action: options?.onUndo ? {
        label: 'Desfazer',
        onClick: options.onUndo
      } : undefined
    });
  },

  demoLimit: (moduleName: string, limit: number) => {
    enhancedToast.warning(
      `Limite do modo DEMO atingido! Você pode ter até ${limit} ${moduleName.toLowerCase()} no modo DEMO.`,
      {
        autoClose: 5000,
        action: {
          label: 'Ativar Sistema',
          onClick: () => {
            // Navegar para aba de ativação
            window.dispatchEvent(new CustomEvent('navigate-to-activation'));
          }
        }
      }
    );
  },

  activationSuccess: () => {
    enhancedToast.success('🎉 Sistema ativado com sucesso! Todos os recursos foram liberados.', {
      autoClose: 5000
    });
  },

  exportDisabled: () => {
    enhancedToast.warning('Exportação desabilitada no modo DEMO. Ative o sistema para acessar esta funcionalidade.', {
      action: {
        label: 'Ativar',
        onClick: () => {
          window.dispatchEvent(new CustomEvent('navigate-to-activation'));
        }
      }
    });
  }
};

// Hook para usar toasts com contexto
export const useEnhancedToast = () => {
  return enhancedToast;
};