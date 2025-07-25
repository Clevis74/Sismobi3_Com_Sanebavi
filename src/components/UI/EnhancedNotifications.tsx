import React, { useState, useEffect, createContext, useContext } from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  XCircle, 
  X, 
  Bell,
  AlertCircle,
  TrendingUp,
  FileText,
  Calendar,
  DollarSign
} from 'lucide-react';

// Tipos de notificação
export type NotificationType = 
  | 'success' 
  | 'error' 
  | 'warning' 
  | 'info' 
  | 'rent-due' 
  | 'contract-expiring' 
  | 'maintenance' 
  | 'financial'
  | 'system';

export interface NotificationData {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  persistent?: boolean;
  timestamp: Date;
  read?: boolean;
}

interface NotificationContextType {
  notifications: NotificationData[];
  addNotification: (notification: Omit<NotificationData, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Configurações de estilo por tipo
const notificationStyles = {
  success: {
    icon: CheckCircle,
    className: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
    iconClassName: 'text-green-500 dark:text-green-400'
  },
  error: {
    icon: XCircle,
    className: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
    iconClassName: 'text-red-500 dark:text-red-400'
  },
  warning: {
    icon: AlertTriangle,
    className: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200',
    iconClassName: 'text-yellow-500 dark:text-yellow-400'
  },
  info: {
    icon: Info,
    className: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
    iconClassName: 'text-blue-500 dark:text-blue-400'
  },
  'rent-due': {
    icon: DollarSign,
    className: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-800 dark:text-orange-200',
    iconClassName: 'text-orange-500 dark:text-orange-400'
  },
  'contract-expiring': {
    icon: Calendar,
    className: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-200',
    iconClassName: 'text-purple-500 dark:text-purple-400'
  },
  maintenance: {
    icon: AlertCircle,
    className: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
    iconClassName: 'text-red-500 dark:text-red-400'
  },
  financial: {
    icon: TrendingUp,
    className: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
    iconClassName: 'text-green-500 dark:text-green-400'
  },
  system: {
    icon: FileText,
    className: 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200',
    iconClassName: 'text-gray-500 dark:text-gray-400'
  }
};

// Provider de notificações
interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  const addNotification = (notificationData: Omit<NotificationData, 'id' | 'timestamp'>) => {
    const notification: NotificationData = {
      ...notificationData,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [notification, ...prev]);

    // Auto-remover após duração especificada (exceto persistentes)
    if (!notification.persistent) {
      const duration = notification.duration || 5000;
      setTimeout(() => {
        removeNotification(notification.id);
      }, duration);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      markAsRead,
      clearAll,
      unreadCount
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

// Componente de toast individual
interface ToastNotificationProps {
  notification: NotificationData;
  onRemove: (id: string) => void;
  onMarkAsRead: (id: string) => void;
}

function ToastNotification({ notification, onRemove, onMarkAsRead }: ToastNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const config = notificationStyles[notification.type];
  const Icon = config.icon;

  useEffect(() => {
    // Animação de entrada
    setTimeout(() => setIsVisible(true), 10);
  }, []);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => onRemove(notification.id), 300);
  };

  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    if (notification.action) {
      notification.action.onClick();
    }
  };

  return (
    <div
      className={`transform transition-all duration-300 ${
        isVisible && !isRemoving 
          ? 'translate-x-0 opacity-100' 
          : 'translate-x-full opacity-0'
      }`}
    >
      <div
        className={`relative max-w-sm w-full bg-white dark:bg-gray-800 border rounded-lg shadow-lg p-4 cursor-pointer hover:shadow-xl transition-shadow ${config.className}`}
        onClick={handleClick}
      >
        {/* Indicador de não lida */}
        {!notification.read && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"></div>
        )}

        <div className="flex items-start space-x-3">
          <Icon className={`h-6 w-6 flex-shrink-0 ${config.iconClassName}`} />
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">{notification.title}</p>
            <p className="text-sm opacity-90 mt-1">{notification.message}</p>
            
            {notification.action && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  notification.action!.onClick();
                }}
                className="text-sm font-medium mt-2 hover:underline"
              >
                {notification.action.label}
              </button>
            )}
            
            <p className="text-xs opacity-75 mt-2">
              {notification.timestamp.toLocaleTimeString()}
            </p>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRemove();
            }}
            className="flex-shrink-0 p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Container de notificações toast
export function NotificationToastContainer() {
  const { notifications, removeNotification, markAsRead } = useNotifications();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.slice(0, 5).map(notification => (
        <ToastNotification
          key={notification.id}
          notification={notification}
          onRemove={removeNotification}
          onMarkAsRead={markAsRead}
        />
      ))}
    </div>
  );
}

// Centro de notificações
interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const { notifications, removeNotification, markAsRead, clearAll } = useNotifications();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="absolute top-0 right-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Notificações
            </h2>
            <div className="flex items-center space-x-2">
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Limpar todas
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <Bell className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-lg font-medium">Nenhuma notificação</p>
                <p className="text-sm">Você está em dia!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {notifications.map(notification => {
                  const config = notificationStyles[notification.type];
                  const Icon = config.icon;
                  
                  return (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer relative ${
                        !notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                      }`}
                      onClick={() => {
                        markAsRead(notification.id);
                        if (notification.action) {
                          notification.action.onClick();
                        }
                      }}
                    >
                      {!notification.read && (
                        <div className="absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                      
                      <div className="flex items-start space-x-3">
                        <Icon className={`h-5 w-5 flex-shrink-0 ${config.iconClassName}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                            {notification.timestamp.toLocaleDateString()} às {notification.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(notification.id);
                          }}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Botão do sino de notificações
interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className = '' }: NotificationBellProps) {
  const { unreadCount } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${className}`}
        title={`${unreadCount} notificações não lidas`}
      >
        <Bell className="h-6 w-6 text-gray-600 dark:text-gray-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      <NotificationCenter 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  );
}

// Hook para notificações pré-definidas
export function useEnhancedNotifications() {
  const { addNotification } = useNotifications();

  return {
    success: (title: string, message: string, action?: NotificationData['action']) =>
      addNotification({ type: 'success', title, message, action }),
    
    error: (title: string, message: string, action?: NotificationData['action']) =>
      addNotification({ type: 'error', title, message, persistent: true, action }),
    
    warning: (title: string, message: string, action?: NotificationData['action']) =>
      addNotification({ type: 'warning', title, message, action }),
    
    info: (title: string, message: string, action?: NotificationData['action']) =>
      addNotification({ type: 'info', title, message, action }),

    rentDue: (tenantName: string, propertyName: string, dueDate: Date) =>
      addNotification({
        type: 'rent-due',
        title: 'Aluguel em atraso',
        message: `${tenantName} - ${propertyName}. Vencimento: ${dueDate.toLocaleDateString()}`,
        persistent: true,
        action: {
          label: 'Ver detalhes',
          onClick: () => console.log('Navigate to tenant details')
        }
      }),

    contractExpiring: (tenantName: string, propertyName: string, expiryDate: Date) =>
      addNotification({
        type: 'contract-expiring',
        title: 'Contrato vencendo',
        message: `${tenantName} - ${propertyName}. Vence em: ${expiryDate.toLocaleDateString()}`,
        persistent: true,
        action: {
          label: 'Renovar contrato',
          onClick: () => console.log('Navigate to contract renewal')
        }
      }),

    maintenanceAlert: (propertyName: string, issue: string) =>
      addNotification({
        type: 'maintenance',
        title: 'Manutenção necessária',
        message: `${propertyName}: ${issue}`,
        persistent: true,
        action: {
          label: 'Programar manutenção',
          onClick: () => console.log('Schedule maintenance')
        }
      }),

    financialSummary: (profit: number, period: string) =>
      addNotification({
        type: 'financial',
        title: 'Resumo financeiro',
        message: `Lucro de R$ ${profit.toLocaleString('pt-BR')} em ${period}`,
        action: {
          label: 'Ver relatório',
          onClick: () => console.log('Navigate to financial report')
        }
      })
  };
}