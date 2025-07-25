import React from 'react';
import { Settings, Zap, MoreHorizontal } from 'lucide-react';
import { useSimpleMode } from '../../contexts/SimpleModeContext';

interface SimpleModeToggleProps {
  className?: string;
}

export const SimpleModeToggle: React.FC<SimpleModeToggleProps> = ({ className = '' }) => {
  const { isSimpleMode, toggleSimpleMode } = useSimpleMode();

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <button
        onClick={toggleSimpleMode}
        className={`
          flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium
          ${isSimpleMode 
            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          }
        `}
        title={isSimpleMode ? 'Ativar modo avançado' : 'Ativar modo simples'}
      >
        {isSimpleMode ? (
          <>
            <Zap className="w-4 h-4" />
            <span>Modo Simples</span>
          </>
        ) : (
          <>
            <Settings className="w-4 h-4" />
            <span>Modo Avançado</span>
          </>
        )}
      </button>
      
      <div className="text-xs text-gray-500">
        {isSimpleMode ? 'Interface simplificada' : 'Todas as funcionalidades'}
      </div>
    </div>
  );
};

export const CompactSimpleModeToggle: React.FC<SimpleModeToggleProps> = ({ className = '' }) => {
  const { isSimpleMode, toggleSimpleMode } = useSimpleMode();

  return (
    <button
      onClick={toggleSimpleMode}
      className={`
        p-2 rounded-lg transition-colors
        ${isSimpleMode 
          ? 'bg-green-100 text-green-700 hover:bg-green-200' 
          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
        }
        ${className}
      `}
      title={isSimpleMode ? 'Ativar modo avançado' : 'Ativar modo simples'}
    >
      {isSimpleMode ? <Zap className="w-4 h-4" /> : <MoreHorizontal className="w-4 h-4" />}
    </button>
  );
};