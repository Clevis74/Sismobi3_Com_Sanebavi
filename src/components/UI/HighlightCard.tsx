import React, { useEffect, useState } from 'react';

interface HighlightCardProps {
  children: React.ReactNode;
  isHighlighted: boolean;
  highlightDuration?: number;
  className?: string;
}

export const HighlightCard: React.FC<HighlightCardProps> = ({
  children,
  isHighlighted,
  highlightDuration = 3000,
  className = ''
}) => {
  const [showHighlight, setShowHighlight] = useState(false);

  useEffect(() => {
    if (isHighlighted) {
      setShowHighlight(true);
      const timer = setTimeout(() => {
        setShowHighlight(false);
      }, highlightDuration);

      return () => clearTimeout(timer);
    }
  }, [isHighlighted, highlightDuration]);

  const highlightClasses = showHighlight 
    ? "bg-green-50 border-green-200 shadow-lg transform scale-105" 
    : "bg-white border-gray-200";

  return (
    <div 
      className={`
        transition-all duration-500 ease-in-out border rounded-lg
        ${highlightClasses} 
        ${className}
      `}
    >
      {children}
    </div>
  );
};

interface AnimatedListItemProps {
  children: React.ReactNode;
  isNew: boolean;
  className?: string;
}

export const AnimatedListItem: React.FC<AnimatedListItemProps> = ({
  children,
  isNew,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(!isNew);

  useEffect(() => {
    if (isNew) {
      // Pequeno delay para permitir que o elemento seja renderizado
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [isNew]);

  return (
    <div 
      className={`
        transition-all duration-500 ease-out
        ${isVisible 
          ? 'opacity-100 transform translate-y-0' 
          : 'opacity-0 transform translate-y-4'
        }
        ${className}
      `}
    >
      {children}
    </div>
  );
};