import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  rounded?: boolean;
  animate?: boolean;
}

// Skeleton básico reutilizável
export function Skeleton({ 
  className = '', 
  width = 'w-full', 
  height = 'h-4', 
  rounded = false,
  animate = true 
}: SkeletonProps) {
  return (
    <div 
      className={`bg-gray-200 dark:bg-gray-700 ${width} ${height} ${
        rounded ? 'rounded-full' : 'rounded'
      } ${animate ? 'animate-pulse' : ''} ${className}`}
    />
  );
}

// Skeleton para texto
interface TextSkeletonProps {
  lines?: number;
  className?: string;
  lastLineWidth?: string;
}

export function TextSkeleton({ lines = 1, className = '', lastLineWidth = 'w-3/4' }: TextSkeletonProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton 
          key={index}
          width={index === lines - 1 ? lastLineWidth : 'w-full'}
          height="h-4"
        />
      ))}
    </div>
  );
}

// Skeleton para cards de propriedade
export function PropertyCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Skeleton width="w-10" height="h-10" rounded />
          <div>
            <Skeleton width="w-32" height="h-5" className="mb-2" />
            <Skeleton width="w-48" height="h-4" />
          </div>
        </div>
        <Skeleton width="w-16" height="h-6" rounded />
      </div>

      {/* Content */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Skeleton width="w-12" height="h-4" className="mb-1" />
          <Skeleton width="w-20" height="h-4" />
        </div>
        <div>
          <Skeleton width="w-16" height="h-4" className="mb-1" />
          <Skeleton width="w-24" height="h-4" />
        </div>
        <div className="col-span-2">
          <Skeleton width="w-16" height="h-4" className="mb-1" />
          <Skeleton width="w-32" height="h-4" />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
        <Skeleton width="w-40" height="h-3" />
      </div>
    </div>
  );
}

// Skeleton para lista de propriedades
interface PropertyListSkeletonProps {
  count?: number;
}

export function PropertyListSkeleton({ count = 6 }: PropertyListSkeletonProps) {
  return (
    <div className="space-y-4">
      {/* Filtros skeleton */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton width="w-32" height="h-6" />
          <Skeleton width="w-40" height="h-4" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton width="w-full" height="h-10" />
          <Skeleton width="w-full" height="h-10" />
        </div>
      </div>

      {/* Cards skeleton */}
      {Array.from({ length: count }).map((_, index) => (
        <PropertyCardSkeleton key={index} />
      ))}
    </div>
  );
}

// Skeleton para cards de inquilino
export function TenantCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Skeleton width="w-12" height="h-12" rounded />
          <div>
            <Skeleton width="w-36" height="h-5" className="mb-2" />
            <Skeleton width="w-24" height="h-4" />
          </div>
        </div>
        <Skeleton width="w-16" height="h-6" rounded />
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-4">
        <Skeleton width="w-48" height="h-4" />
        <Skeleton width="w-32" height="h-4" />
      </div>

      {/* Property Info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Skeleton width="w-20" height="h-4" className="mb-1" />
          <Skeleton width="w-28" height="h-4" />
        </div>
        <div>
          <Skeleton width="w-16" height="h-4" className="mb-1" />
          <Skeleton width="w-24" height="h-4" />
        </div>
      </div>
    </div>
  );
}

// Skeleton para documentos
export function DocumentCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center space-x-3">
        <Skeleton width="w-10" height="h-10" rounded />
        <div className="flex-1">
          <Skeleton width="w-32" height="h-5" className="mb-2" />
          <Skeleton width="w-48" height="h-4" />
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton width="w-8" height="h-8" />
          <Skeleton width="w-8" height="h-8" />
        </div>
      </div>
    </div>
  );
}

// Skeleton para dashboard
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <Skeleton width="w-24" height="h-4" className="mb-2" />
                <Skeleton width="w-16" height="h-8" />
              </div>
              <Skeleton width="w-10" height="h-10" rounded />
            </div>
          </div>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <Skeleton width="w-32" height="h-6" className="mb-4" />
          <Skeleton width="w-full" height="h-64" />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <Skeleton width="w-40" height="h-6" className="mb-4" />
          <Skeleton width="w-full" height="h-64" />
        </div>
      </div>

      {/* Lista de atividades recentes */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <Skeleton width="w-32" height="h-6" className="mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center space-x-3">
              <Skeleton width="w-8" height="h-8" rounded />
              <div className="flex-1">
                <Skeleton width="w-48" height="h-4" className="mb-1" />
                <Skeleton width="w-32" height="h-3" />
              </div>
              <Skeleton width="w-16" height="h-4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Skeleton para formulários
export function FormSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton width="w-48" height="h-8" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index}>
            <Skeleton width="w-24" height="h-5" className="mb-2" />
            <Skeleton width="w-full" height="h-10" />
          </div>
        ))}
      </div>

      <div className="flex space-x-4">
        <Skeleton width="w-24" height="h-10" />
        <Skeleton width="w-20" height="h-10" />
      </div>
    </div>
  );
}

// Skeleton para tabelas
interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export function TableSkeleton({ rows = 5, columns = 5 }: TableSkeletonProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, index) => (
            <Skeleton key={index} width="w-20" height="h-5" />
          ))}
        </div>
      </div>
      
      {/* Rows */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton key={colIndex} width="w-full" height="h-4" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Hook para skeleton personalizado
export function useSkeletonVariants() {
  return {
    text: (props?: Partial<TextSkeletonProps>) => <TextSkeleton {...props} />,
    card: () => <PropertyCardSkeleton />,
    list: (props?: Partial<PropertyListSkeletonProps>) => <PropertyListSkeleton {...props} />,
    dashboard: () => <DashboardSkeleton />,
    form: () => <FormSkeleton />,
    table: (props?: Partial<TableSkeletonProps>) => <TableSkeleton {...props} />
  };
}

// Componente wrapper para mostrar skeleton enquanto carrega
interface SkeletonWrapperProps {
  loading: boolean;
  skeleton: React.ReactNode;
  children: React.ReactNode;
}

export function SkeletonWrapper({ loading, skeleton, children }: SkeletonWrapperProps) {
  return loading ? <>{skeleton}</> : <>{children}</>;
}