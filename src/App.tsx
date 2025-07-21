import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useProperties } from './hooks/useProperties';
import { useTenants } from './hooks/useTenants';
import { useTransactions } from './hooks/useTransactions';
import { useDocuments } from './hooks/useDocuments';
import { useEnergyBills } from './hooks/useEnergyBills';
import { useWaterBills } from './hooks/useWaterBills';
import { useSyncManager } from './hooks/useSyncManager';
import { ActivationProvider } from './contexts/ActivationContext';
import { useEnhancedToast } from './components/UI/EnhancedToast';
import { testConnection } from './lib/supabaseClient';
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { Dashboard } from './components/Dashboard/Dashboard';
import { PropertyManager } from './components/Properties/PropertyManager';
import { TenantManager } from './components/Tenants/TenantManager';
import { TransactionManager } from './components/Transactions/TransactionManager';
import { AlertManager } from './components/Alerts/AlertManager';
import { ReportManager } from './components/Reports/ReportManager';
import { DocumentManager } from './components/Documents/DocumentManager';
import { EnergyCalculator } from './components/Energy/EnergyCalculator';
import { SanebaviManager } from './components/Sanebavi/SanebaviManager';
import { InformorsManager } from './components/Informors/InformorsManager';
import { ActivationForm } from './components/Activation/ActivationForm';
import { useLocalStorage } from './hooks/useLocalStorage';
import { calculateFinancialSummary } from './utils/calculations';
import { generateAutomaticAlerts, processRecurringTransactions } from './utils/alerts';
import { createBackup, exportBackup, importBackup, validateBackup, BackupData } from './utils/dataBackup';
import { Tenant, Alert, EnergyBill } from './types';

// Configuração do cliente do TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [supabaseAvailable, setSupabaseAvailable] = useState(false);
  
  // Inicializar o gerenciador de sincronização
  const { syncStatus } = useSyncManager();
  
  const [alerts, setAlerts] = useLocalStorage<Alert[]>('alerts', []);
  const [showFinancialValues, setShowFinancialValues] = useLocalStorage<boolean>('showFinancialValues', true);
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Verificar disponibilidade do Supabase
  useEffect(() => {
    const checkSupabase = async () => {
      const isAvailable = await testConnection();
      setSupabaseAvailable(isAvailable);
    };
    checkSupabase();
  }, []);

  // Hook para gerenciar propriedades (com fallback para localStorage)
  const {
    properties,
    carregando: carregandoProperties,
    erro: erroProperties,
    addProperty,
    updateProperty,
    deleteProperty,
    recarregarDados: recarregarProperties
  } = useProperties(supabaseAvailable);

  // Hook para gerenciar inquilinos (com fallback para localStorage)
  const {
    tenants,
    carregando: carregandoTenants,
    erro: erroTenants,
    addTenant,
    updateTenant,
    deleteTenant,
    recarregarDados: recarregarTenants
  } = useTenants(supabaseAvailable);

  // Hook para gerenciar transações (com fallback para localStorage)
  const {
    transactions,
    carregando: carregandoTransactions,
    erro: erroTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    recarregarDados: recarregarTransactions
  } = useTransactions(supabaseAvailable);

  // Hook para gerenciar documentos (com fallback para localStorage)
  const {
    documents,
    carregando: carregandoDocuments,
    erro: erroDocuments,
    addDocument,
    updateDocument,
    deleteDocument,
    recarregarDados: recarregarDocuments
  } = useDocuments(supabaseAvailable);

  // Hook para gerenciar contas de energia (com fallback para localStorage)
  const {
    energyBills,
    carregando: carregandoEnergyBills,
    erro: erroEnergyBills,
    addEnergyBill,
    updateEnergyBill,
    deleteEnergyBill,
    recarregarDados: recarregarEnergyBills
  } = useEnergyBills(supabaseAvailable);

  // Hook para gerenciar contas de água (com fallback para localStorage)
  const {
    waterBills,
    carregando: carregandoWaterBills,
    erro: erroWaterBills,
    addWaterBill,
    updateWaterBill,
    deleteWaterBill,
    recarregarDados: recarregarWaterBills
  } = useWaterBills(supabaseAvailable);

  // Listener para navegação para ativação
  useEffect(() => {
    const handleNavigateToActivation = () => {
      setActiveTab('activation');
    };

    window.addEventListener('navigate-to-activation', handleNavigateToActivation);
    return () => window.removeEventListener('navigate-to-activation', handleNavigateToActivation);
  }, []);

  // Apply theme to document element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Gerar alertas automáticos
  useEffect(() => {
    const automaticAlerts = generateAutomaticAlerts(properties, tenants, transactions, energyBills, waterBills);
    const existingAlertIds = alerts.map(a => a.id);
    const newAlerts = automaticAlerts.filter(a => !existingAlertIds.includes(a.id));
    
    if (newAlerts.length > 0) {
      setAlerts(prev => [...prev, ...newAlerts]);
    }
  }, [properties, tenants, transactions, energyBills, waterBills, alerts]);

  // Processar transações recorrentes
  useEffect(() => {
    if (transactions.length > 0) {
      const recurringTransactions = processRecurringTransactions(transactions);
      if (recurringTransactions.length > 0) {
        // Adicionar transações recorrentes usando o hook
        recurringTransactions.forEach(transaction => {
          addTransaction(transaction);
        });
      }
    }
  }, [transactions.length]); // Usar length para evitar loop infinito

  const summary = calculateFinancialSummary(properties, transactions);

  // Funções para gerenciar alertas
  const resolveAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, resolved: true } : a));
  };

  const deleteAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  // Funções para backup
  const handleExport = () => {
    const backup = createBackup(properties, tenants, transactions, alerts, documents, energyBills, waterBills);
    exportBackup(backup);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const backupData = await importBackup(file);
          if (validateBackup(backupData)) {
            // Importar dados usando os hooks
            // TODO: Implementar importação em lote para propriedades e inquilinos
            // Por enquanto, importar apenas dados locais
            backupData.transactions.forEach(transaction => {
              addTransaction(transaction);
            });
            setAlerts(backupData.alerts);
            // TODO: Implementar importação para documents, energyBills e waterBills usando os hooks
            alert('Backup importado com sucesso!');
          } else {
            alert('Arquivo de backup inválido!');
          }
        } catch (error) {
          alert('Erro ao importar backup: ' + error);
        }
      }
    };
    input.click();
  };

  const handleToggleFinancialValues = () => {
    setShowFinancialValues(prev => !prev);
  };

  const handleToggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard summary={summary} properties={properties} transactions={transactions} showFinancialValues={showFinancialValues} />;
      case 'properties':
        return (
          <PropertyManager
            properties={properties}
            loading={carregandoProperties}
            error={erroProperties}
            showFinancialValues={showFinancialValues}
            onAddProperty={addProperty}
            onUpdateProperty={updateProperty}
            onDeleteProperty={deleteProperty}
            onReload={recarregarProperties}
          />
        );
      case 'tenants':
        return (
          <TenantManager
            tenants={tenants}
            loading={carregandoTenants}
            error={erroTenants}
            properties={properties}
            showFinancialValues={showFinancialValues}
            onAddTenant={addTenant}
            onUpdateTenant={updateTenant}
            onDeleteTenant={deleteTenant}
            onReload={recarregarTenants}
          />
        );
      case 'transactions':
        return (
          <TransactionManager
            transactions={transactions}
            loading={carregandoTransactions}
            error={erroTransactions}
            properties={properties}
            showFinancialValues={showFinancialValues}
            onAddTransaction={addTransaction}
            onUpdateTransaction={updateTransaction}
            onDeleteTransaction={deleteTransaction}
            onReload={recarregarTransactions}
          />
        );
      case 'alerts':
        return (
          <AlertManager
            alerts={alerts}
            properties={properties}
            onResolveAlert={resolveAlert}
            onDeleteAlert={deleteAlert}
          />
        );
      case 'reports':
        return (
          <ReportManager
            properties={properties}
            transactions={transactions}
            summary={summary}
            showFinancialValues={showFinancialValues}
          />
        );
      case 'documents':
        return (
          <DocumentManager
            documents={documents}
            loading={carregandoDocuments}
            error={erroDocuments}
            properties={properties}
            tenants={tenants}
            onAddDocument={addDocument}
            onUpdateDocument={updateDocument}
            onDeleteDocument={deleteDocument}
            onReload={recarregarDocuments}
          />
        );
      case 'energy':
        return (
          <EnergyCalculator
            energyBills={energyBills}
            loading={carregandoEnergyBills}
            error={erroEnergyBills}
            properties={properties}
            showFinancialValues={showFinancialValues}
            onAddEnergyBill={addEnergyBill}
            onUpdateEnergyBill={updateEnergyBill}
            onDeleteEnergyBill={deleteEnergyBill}
            onReload={recarregarEnergyBills}
          />
        );
      case 'sanebavi':
        return (
          <SanebaviManager
            waterBills={waterBills}
            loading={carregandoWaterBills}
            error={erroWaterBills}
            properties={properties}
            showFinancialValues={showFinancialValues}
            onAddWaterBill={addWaterBill}
            onUpdateWaterBill={updateWaterBill}
            onDeleteWaterBill={deleteWaterBill}
            onReload={recarregarWaterBills}
          />
        );
      case 'informors':
        return <InformorsManager />;
      case 'activation':
        return <ActivationForm />;
      default:
        return <Dashboard summary={summary} properties={properties} transactions={transactions} showFinancialValues={showFinancialValues} />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ActivationProvider>
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex">
          {/* Sidebar */}
          <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} lg:block fixed lg:relative z-30 w-64 h-full`}>
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>

          {/* Mobile overlay */}
          {isMobileMenuOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}

          {/* Main content */}
          <div className="flex-1 flex flex-col">
            <Header 
              showFinancialValues={showFinancialValues}
              onToggleFinancialValues={handleToggleFinancialValues}
              onToggleTheme={handleToggleTheme}
              onExport={handleExport} 
              onImport={handleImport} 
            />
            
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-white rounded-lg shadow-md"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <main className="flex-1 p-6 overflow-y-auto">
              {renderContent()}
            </main>
            
            {/* Toast Container para mensagens de feedback */}
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme={theme === 'dark' ? 'dark' : 'light'}
            />
          </div>
        </div>
      </ActivationProvider>
    </QueryClientProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ActivationProvider>
        <AppContent />
      </ActivationProvider>
    </QueryClientProvider>
  );
}

export default App;