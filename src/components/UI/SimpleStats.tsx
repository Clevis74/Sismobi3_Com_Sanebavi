import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface SimpleStatsProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    direction: 'up' | 'down' | 'stable';
    value: string;
  };
  color?: 'green' | 'red' | 'blue' | 'yellow' | 'purple' | 'gray';
  icon?: React.ReactNode;
}

export const SimpleStats: React.FC<SimpleStatsProps> = ({
  title,
  value,
  subtitle,
  trend,
  color = 'blue',
  icon
}) => {
  const colorClasses = {
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
      accent: 'text-green-600'
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      accent: 'text-red-600'
    },
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      accent: 'text-blue-600'
    },
    yellow: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-700',
      accent: 'text-yellow-600'
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-700',
      accent: 'text-purple-600'
    },
    gray: {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      text: 'text-gray-700',
      accent: 'text-gray-600'
    }
  };

  const colors = colorClasses[color];
  
  const getTrendIcon = () => {
    if (!trend) return null;
    
    switch (trend.direction) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'stable':
        return <Minus className="w-4 h-4 text-gray-500" />;
      default:
        return null;
    }
  };

  return (
    <div className={`p-6 rounded-lg border-2 ${colors.bg} ${colors.border}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        {icon && (
          <div className={`p-2 rounded-full ${colors.bg} ${colors.text}`}>
            {icon}
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <div className={`text-3xl font-bold ${colors.accent}`}>
          {value}
        </div>
        
        {subtitle && (
          <div className="text-sm text-gray-600">
            {subtitle}
          </div>
        )}
        
        {trend && (
          <div className="flex items-center space-x-2 text-sm">
            {getTrendIcon()}
            <span className={`font-medium ${
              trend.direction === 'up' ? 'text-green-600' :
              trend.direction === 'down' ? 'text-red-600' :
              'text-gray-600'
            }`}>
              {trend.value}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export const SimpleStatsGrid: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {children}
    </div>
  );
};