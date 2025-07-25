import { useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

// Tipos para atalhos
export interface KeyboardShortcut {
  id: string;
  keys: string[];
  description: string;
  action: () => void;
  category: 'navigation' | 'actions' | 'system' | 'forms';
  global?: boolean; // Se funciona globalmente ou apenas em contextos específicos
  preventDefault?: boolean;
}

// Mapeamento de teclas especiais
const KEY_MAPPING = {
  'cmd': 'Meta',
  'ctrl': 'Control',
  'alt': 'Alt',
  'shift': 'Shift',
  'enter': 'Enter',
  'escape': 'Escape',
  'space': ' ',
  'tab': 'Tab',
  'backspace': 'Backspace',
  'delete': 'Delete',
  'up': 'ArrowUp',
  'down': 'ArrowDown',
  'left': 'ArrowLeft',
  'right': 'ArrowRight',
};

// Normalizar tecla
const normalizeKey = (key: string): string => {
  const mapped = KEY_MAPPING[key.toLowerCase() as keyof typeof KEY_MAPPING];
  return mapped || key;
};

// Verificar se as teclas coincidem
const keysMatch = (pressed: string[], expected: string[]): boolean => {
  if (pressed.length !== expected.length) return false;
  
  const normalizedPressed = pressed.map(normalizeKey).sort();
  const normalizedExpected = expected.map(normalizeKey).sort();
  
  return normalizedPressed.every((key, index) => key === normalizedExpected[index]);
};

// Hook principal para atalhos de teclado
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled = true) {
  const pressedKeys = new Set<string>();

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Ignorar se estiver digitando em inputs
    const target = event.target as HTMLElement;
    const isInputActive = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || 
                          target.contentEditable === 'true';
    
    if (isInputActive && !shortcuts.some(s => s.global)) return;

    // Adicionar tecla pressionada
    pressedKeys.add(event.key);
    if (event.ctrlKey) pressedKeys.add('Control');
    if (event.metaKey) pressedKeys.add('Meta');
    if (event.altKey) pressedKeys.add('Alt');
    if (event.shiftKey) pressedKeys.add('Shift');

    // Verificar correspondência com atalhos
    for (const shortcut of shortcuts) {
      if (keysMatch(Array.from(pressedKeys), shortcut.keys)) {
        if (shortcut.preventDefault !== false) {
          event.preventDefault();
        }
        shortcut.action();
        break;
      }
    }
  }, [shortcuts, enabled, pressedKeys]);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    pressedKeys.delete(event.key);
    if (!event.ctrlKey) pressedKeys.delete('Control');
    if (!event.metaKey) pressedKeys.delete('Meta');
    if (!event.altKey) pressedKeys.delete('Alt');
    if (!event.shiftKey) pressedKeys.delete('Shift');
  }, [pressedKeys]);

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp, enabled]);
}

// Hook para atalhos padrão do sistema
export function useSystemShortcuts() {
  const navigate = useNavigate();
  const { toggleTheme } = useTheme();

  const systemShortcuts: KeyboardShortcut[] = useMemo(() => [
    // Navegação
    {
      id: 'nav-dashboard',
      keys: ['ctrl', 'h'],
      description: 'Ir para Dashboard',
      action: () => navigate('/'),
      category: 'navigation',
      global: true
    },
    {
      id: 'nav-properties',
      keys: ['ctrl', 'p'],
      description: 'Ir para Propriedades',
      action: () => navigate('/properties'),
      category: 'navigation',
      global: true
    },
    {
      id: 'nav-tenants',
      keys: ['ctrl', 't'],
      description: 'Ir para Inquilinos',
      action: () => navigate('/tenants'),
      category: 'navigation',
      global: true
    },
    {
      id: 'nav-transactions',
      keys: ['ctrl', 'f'],
      description: 'Ir para Transações Financeiras',
      action: () => navigate('/transactions'),
      category: 'navigation',
      global: true
    },
    {
      id: 'nav-documents',
      keys: ['ctrl', 'd'],
      description: 'Ir para Documentos',
      action: () => navigate('/documents'),
      category: 'navigation',
      global: true
    },
    {
      id: 'nav-sanebavi',
      keys: ['ctrl', 's'],
      description: 'Ir para Sanebavi',
      action: () => navigate('/sanebavi'),
      category: 'navigation',
      global: true
    },

    // Sistema
    {
      id: 'toggle-theme',
      keys: ['ctrl', 'shift', 't'],
      description: 'Alternar tema',
      action: toggleTheme,
      category: 'system',
      global: true
    },

    // Ações rápidas
    {
      id: 'search',
      keys: ['ctrl', 'k'],
      description: 'Busca global',
      action: () => {
        const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      },
      category: 'actions',
      global: true
    },

    // Formulários
    {
      id: 'save-form',
      keys: ['ctrl', 'enter'],
      description: 'Salvar formulário',
      action: () => {
        const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;
        if (submitButton && !submitButton.disabled) {
          submitButton.click();
        }
      },
      category: 'forms',
      global: false
    },
    {
      id: 'cancel-form',
      keys: ['escape'],
      description: 'Cancelar/Fechar',
      action: () => {
        // Procurar por botões de cancelar ou fechar
        const cancelButton = document.querySelector('[data-action="cancel"]') as HTMLButtonElement ||
                            document.querySelector('button[aria-label*="fechar"]') as HTMLButtonElement ||
                            document.querySelector('button[aria-label*="cancel"]') as HTMLButtonElement;
        
        if (cancelButton) {
          cancelButton.click();
        }
      },
      category: 'forms',
      global: true
    }
  ], [navigate, toggleTheme]);

  return systemShortcuts;
}

// Hook para atalhos específicos de contexto
export function useContextShortcuts(context: string) {
  const navigate = useNavigate();

  const contextShortcuts = useMemo(() => {
    const shortcuts: Record<string, KeyboardShortcut[]> = {
      properties: [
        {
          id: 'add-property',
          keys: ['ctrl', 'n'],
          description: 'Nova propriedade',
          action: () => {
            const addButton = document.querySelector('[data-action="add-property"]') as HTMLButtonElement;
            if (addButton) addButton.click();
          },
          category: 'actions'
        }
      ],
      tenants: [
        {
          id: 'add-tenant',
          keys: ['ctrl', 'n'],
          description: 'Novo inquilino',
          action: () => {
            const addButton = document.querySelector('[data-action="add-tenant"]') as HTMLButtonElement;
            if (addButton) addButton.click();
          },
          category: 'actions'
        }
      ],
      transactions: [
        {
          id: 'add-income',
          keys: ['ctrl', 'i'],
          description: 'Nova receita',
          action: () => {
            const addButton = document.querySelector('[data-action="add-income"]') as HTMLButtonElement;
            if (addButton) addButton.click();
          },
          category: 'actions'
        },
        {
          id: 'add-expense',
          keys: ['ctrl', 'e'],
          description: 'Nova despesa',
          action: () => {
            const addButton = document.querySelector('[data-action="add-expense"]') as HTMLButtonElement;
            if (addButton) addButton.click();
          },
          category: 'actions'
        }
      ],
      documents: [
        {
          id: 'upload-document',
          keys: ['ctrl', 'u'],
          description: 'Upload de documento',
          action: () => {
            const uploadButton = document.querySelector('[data-action="upload-document"]') as HTMLButtonElement;
            if (uploadButton) uploadButton.click();
          },
          category: 'actions'
        }
      ]
    };

    return shortcuts[context] || [];
  }, [context]);

  return contextShortcuts;
}

// Componente para exibir help de atalhos
export function KeyboardShortcutsHelp({ 
  shortcuts, 
  isOpen, 
  onClose 
}: { 
  shortcuts: KeyboardShortcut[]; 
  isOpen: boolean; 
  onClose: () => void;
}) {
  const categorizedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, KeyboardShortcut[]>);

  const categoryLabels = {
    navigation: 'Navegação',
    actions: 'Ações',
    system: 'Sistema',
    forms: 'Formulários'
  };

  if (!isOpen) return null;

  const formatKeys = (keys: string[]): string => {
    return keys.map(key => {
      const keyMap: Record<string, string> = {
        'ctrl': 'Ctrl',
        'cmd': 'Cmd',
        'alt': 'Alt',
        'shift': 'Shift',
        'enter': 'Enter',
        'escape': 'Esc',
        'space': 'Space'
      };
      return keyMap[key.toLowerCase()] || key.toUpperCase();
    }).join(' + ');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black opacity-50" onClick={onClose} />
        
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Atalhos de Teclado
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {Object.entries(categorizedShortcuts).map(([category, categoryShortcuts]) => (
                <div key={category}>
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">
                    {categoryLabels[category as keyof typeof categoryLabels] || category}
                  </h3>
                  
                  <div className="space-y-2">
                    {categoryShortcuts.map((shortcut) => (
                      <div key={shortcut.id} className="flex items-center justify-between py-2">
                        <span className="text-gray-700 dark:text-gray-300">
                          {shortcut.description}
                        </span>
                        <div className="flex items-center space-x-1">
                          {shortcut.keys.map((key, index) => (
                            <React.Fragment key={key}>
                              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm font-mono">
                                {formatKeys([key])}
                              </kbd>
                              {index < shortcut.keys.length - 1 && (
                                <span className="text-gray-400">+</span>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Pressione <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">?</kbd> para abrir este menu
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook para gerenciar help de atalhos
export function useKeyboardShortcutsHelp() {
  const systemShortcuts = useSystemShortcuts();
  const [isHelpOpen, setIsHelpOpen] = React.useState(false);

  // Atalho para abrir ajuda
  const helpShortcut: KeyboardShortcut = {
    id: 'show-help',
    keys: ['?'],
    description: 'Mostrar atalhos de teclado',
    action: () => setIsHelpOpen(true),
    category: 'system',
    global: true,
    preventDefault: true
  };

  useKeyboardShortcuts([helpShortcut]);

  const HelpComponent = useCallback(() => (
    <KeyboardShortcutsHelp
      shortcuts={systemShortcuts}
      isOpen={isHelpOpen}
      onClose={() => setIsHelpOpen(false)}
    />
  ), [systemShortcuts, isHelpOpen]);

  return {
    isHelpOpen,
    openHelp: () => setIsHelpOpen(true),
    closeHelp: () => setIsHelpOpen(false),
    HelpComponent
  };
}

// Hook combinado para usar todos os atalhos
export function useAllKeyboardShortcuts(context?: string) {
  const systemShortcuts = useSystemShortcuts();
  const contextShortcuts = useContextShortcuts(context || '');
  const allShortcuts = [...systemShortcuts, ...contextShortcuts];

  useKeyboardShortcuts(allShortcuts);

  const { HelpComponent } = useKeyboardShortcutsHelp();

  return {
    shortcuts: allShortcuts,
    HelpComponent
  };
}