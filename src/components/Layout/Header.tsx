import React from 'react';
import { Calendar, Download, Upload, Eye, EyeOff } from 'lucide-react';

interface HeaderProps {
  showFinancialValues: boolean;
  onToggleFinancialValues: () => void;
  onToggleTheme: () => void;
  onExport: () => void;
  onImport: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  showFinancialValues, 
  onToggleFinancialValues, 
  onToggleTheme,
  onExport, 
  onImport 
}) => {
  const currentDate = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-gray-600 dark:text-gray-300">
            <Calendar className="w-5 h-5 mr-2" />
            <span className="capitalize">{currentDate}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleTheme}
            className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            title="Alternar tema"
          >
            🌗 Alternar Tema
          </button>
          <button
            onClick={onToggleFinancialValues}
            className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            title={showFinancialValues ? 'Ocultar valores financeiros' : 'Mostrar valores financeiros'}
          >
            {showFinancialValues ? (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Ocultar Valores
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4 mr-2" />
                Mostrar Valores
              </>
            )}
          </button>
          <button
            onClick={onImport}
            className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <Upload className="w-4 h-4 mr-2" />
            Importar
          </button>
          <button
            onClick={onExport}
            className="flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </button>
        </div>
      </div>
    </header>
  );
};