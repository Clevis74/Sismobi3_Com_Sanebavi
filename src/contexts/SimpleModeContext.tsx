import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SimpleModeContextType {
  isSimpleMode: boolean;
  toggleSimpleMode: () => void;
  setSimpleMode: (enabled: boolean) => void;
}

const SimpleModeContext = createContext<SimpleModeContextType | undefined>(undefined);

export const useSimpleMode = () => {
  const context = useContext(SimpleModeContext);
  if (!context) {
    throw new Error('useSimpleMode must be used within a SimpleModeProvider');
  }
  return context;
};

interface SimpleModeProviderProps {
  children: ReactNode;
}

export const SimpleModeProvider: React.FC<SimpleModeProviderProps> = ({ children }) => {
  const [isSimpleMode, setIsSimpleMode] = useState(() => {
    // Verificar se já há preferência salva no localStorage
    const saved = localStorage.getItem('sismobi-simple-mode');
    return saved ? JSON.parse(saved) : true; // Default para modo simples
  });

  useEffect(() => {
    localStorage.setItem('sismobi-simple-mode', JSON.stringify(isSimpleMode));
  }, [isSimpleMode]);

  const toggleSimpleMode = () => {
    setIsSimpleMode(prev => !prev);
  };

  const setSimpleMode = (enabled: boolean) => {
    setIsSimpleMode(enabled);
  };

  return (
    <SimpleModeContext.Provider value={{ isSimpleMode, toggleSimpleMode, setSimpleMode }}>
      {children}
    </SimpleModeContext.Provider>
  );
};