import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className = '', showLabel = true }: ThemeToggleProps) {
  const { theme, actualTheme, toggleTheme, setTheme } = useTheme();

  const themeConfig = {
    light: {
      icon: Sun,
      label: 'Modo claro',
      description: 'Interface com fundo claro'
    },
    dark: {
      icon: Moon,
      label: 'Modo escuro',
      description: 'Interface com fundo escuro'
    },
    system: {
      icon: Monitor,
      label: 'Automático',
      description: 'Segue a preferência do sistema'
    }
  };

  const getCurrentIcon = () => {
    if (theme === 'system') {
      return Monitor;
    }
    return themeConfig[actualTheme].icon;
  };

  const CurrentIcon = getCurrentIcon();

  return (
    <div className={`relative ${className}`}>
      {/* Botão principal */}
      <button
        onClick={toggleTheme}
        className="p-2 rounded-lg transition-all duration-200 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        title={`Tema atual: ${themeConfig[theme].label}`}
        aria-label={`Alterar tema. Tema atual: ${themeConfig[theme].label}`}
      >
        <CurrentIcon className="h-5 w-5 transition-transform duration-200" />
      </button>

      {/* Dropdown para seleção específica (opcional) */}
      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
        {(Object.entries(themeConfig) as [keyof typeof themeConfig, typeof themeConfig[keyof typeof themeConfig]][]).map(([key, config]) => {
          const Icon = config.icon;
          const isActive = theme === key;

          return (
            <button
              key={key}
              onClick={() => setTheme(key)}
              className={`w-full flex items-center px-4 py-3 text-sm transition-colors duration-150 hover:bg-gray-50 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg ${
                isActive 
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              <Icon className={`h-4 w-4 mr-3 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} />
              <div className="flex-1 text-left">
                <div className={`font-medium ${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                  {config.label}
                </div>
                {showLabel && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {config.description}
                  </div>
                )}
              </div>
              {isActive && (
                <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Componente compacto para uso em headers
export function CompactThemeToggle({ className = '' }: { className?: string }) {
  const { actualTheme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-full transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:scale-110 ${className}`}
      title={`Alternar para tema ${actualTheme === 'light' ? 'escuro' : 'claro'}`}
      aria-label="Alternar tema"
    >
      {actualTheme === 'light' ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
    </button>
  );
}

// Componente com dropdown completo
export function FullThemeToggle({ className = '' }: { className?: string }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const { theme, setTheme } = useTheme();

  const themeOptions = [
    { key: 'light' as const, icon: Sun, label: 'Claro' },
    { key: 'dark' as const, icon: Moon, label: 'Escuro' },
    { key: 'system' as const, icon: Monitor, label: 'Sistema' }
  ];

  const currentTheme = themeOptions.find(opt => opt.key === theme);
  const CurrentIcon = currentTheme?.icon || Monitor;

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
        aria-label="Selecionar tema"
      >
        <CurrentIcon className="h-4 w-4" />
        <span className="text-sm font-medium">{currentTheme?.label}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          {themeOptions.map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => {
                setTheme(key);
                setIsOpen(false);
              }}
              className={`w-full flex items-center space-x-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg ${
                theme === key ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Overlay para fechar dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}