import React from 'react';
import { 
  Home, 
  Building, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Bell, 
  Settings,
  Zap,
  FileText,
  Droplets,
  Info,
  Shield
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'properties', label: 'Propriedades', icon: Building },
  { id: 'tenants', label: 'Inquilinos', icon: Users },
  { id: 'transactions', label: 'Transações', icon: DollarSign },
  { id: 'reports', label: 'Relatórios', icon: TrendingUp },
  { id: 'alerts', label: 'Alertas', icon: Bell },
  { id: 'energy', label: 'Energia (CPFL)', icon: Zap },
  { id: 'sanebavi', label: 'Água (Sanebavi)', icon: Droplets },
  { id: 'documents', label: 'Documentos', icon: FileText },
  { id: 'informors', label: 'Informors', icon: Info },
  { id: 'activation', label: 'Ativação', icon: Shield },
  { id: 'settings', label: 'Configurações', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="w-64 bg-white dark:bg-gray-800 shadow-lg h-full flex flex-col">
      <div className="p-6 border-b dark:border-gray-700">
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200">Gestão Imobiliária</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">Controle Financeiro</p>
      </div>
      
      <nav className="flex-1 pt-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-6 py-3 text-left transition-colors duration-200 ${
                activeTab === item.id
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-r-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
};