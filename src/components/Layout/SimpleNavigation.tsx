import React from 'react';
import { useLocation } from 'react-router-dom';
import { Home, Users, DollarSign, FileText, BarChart3, Settings } from 'lucide-react';

interface SimpleNavigationProps {
  isCollapsed?: boolean;
}

export const SimpleNavigation: React.FC<SimpleNavigationProps> = ({ isCollapsed = false }) => {
  const location = useLocation();

  const navigationItems = [
    {
      name: 'Início',
      href: '/',
      icon: Home,
      description: 'Visão geral dos seus imóveis'
    },
    {
      name: 'Propriedades',
      href: '/properties',
      icon: Home,
      description: 'Gerenciar seus imóveis'
    },
    {
      name: 'Inquilinos',
      href: '/tenants',
      icon: Users,
      description: 'Contratos e pagamentos'
    },
    {
      name: 'Financeiro',
      href: '/transactions',
      icon: DollarSign,
      description: 'Receitas e despesas'
    },
    {
      name: 'Relatórios',
      href: '/reports',
      icon: BarChart3,
      description: 'Análises e estatísticas'
    }
  ];

  const advancedItems = [
    {
      name: 'Documentos',
      href: '/documents',
      icon: FileText,
      description: 'Contratos e documentos'
    },
    {
      name: 'Energia',
      href: '/energy',
      icon: Settings,
      description: 'Rateio de energia'
    },
    {
      name: 'Sanebavi',
      href: '/sanebavi',
      icon: Settings,
      description: 'Rateio de água'
    }
  ];

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  return (
    <nav className="space-y-2">
      {/* Navegação Principal */}
      <div className="space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.name}
              href={item.href}
              className={`
                flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors
                ${isActive(item.href)
                  ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-500'
                  : 'text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              {!isCollapsed && (
                <div className="flex-1">
                  <span className="font-medium">{item.name}</span>
                  <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                </div>
              )}
            </a>
          );
        })}
      </div>

      {/* Separador */}
      {!isCollapsed && (
        <div className="py-3">
          <div className="border-t border-gray-200"></div>
          <p className="text-xs text-gray-500 mt-2 px-3">Funcionalidades Avançadas</p>
        </div>
      )}

      {/* Navegação Avançada */}
      <div className="space-y-1">
        {advancedItems.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.name}
              href={item.href}
              className={`
                flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors
                ${isActive(item.href)
                  ? 'bg-purple-100 text-purple-700 border-r-2 border-purple-500'
                  : 'text-gray-600 hover:bg-gray-50'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              {!isCollapsed && (
                <div className="flex-1">
                  <span className="text-sm font-medium">{item.name}</span>
                  <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                </div>
              )}
            </a>
          );
        })}
      </div>
    </nav>
  );
};