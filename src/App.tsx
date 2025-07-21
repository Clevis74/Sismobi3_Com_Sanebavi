import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { ActivationProvider } from './contexts/ActivationContext';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { SyncIndicator } from './components/Layout/SyncIndicator';
import { Dashboard } from './components/Dashboard/Dashboard';
import { PropertyManager } from './components/Properties/PropertyManager';
import { TenantManager } from './components/Tenants/TenantManager';
import { TransactionManager } from './components/Transactions/TransactionManager';
import { DocumentManager } from './components/Documents/DocumentManager';
import { ReportManager } from './components/Reports/ReportManager';
import { EnergyCalculator } from './components/Energy/EnergyCalculator';
import { SanebaviManager } from './components/Sanebavi/SanebaviManager';
import { InformorsManager } from './components/Informors/InformorsManager';
import { ActivationForm } from './components/Activation/ActivationForm';
import { useProperties } from './hooks/useProperties';
import { useTenants } from './hooks/useTenants';
import { useTransactions } from './hooks/useTransactions';
import { calculateFinancialSummary } from './utils/calculations';
import { useState } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function AppContent() {
  const [showFinancialValues, setShowFinancialValues] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const { data: properties = [] } = useProperties();
  const { data: tenants = [] } = useTenants();
  const { data: transactions = [] } = useTransactions();
  
  const financialSummary = calculateFinancialSummary(properties, transactions);

  const handleToggleFinancialValues = () => {
    setShowFinancialValues(prev => !prev);
  };

  const handleToggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export functionality to be implemented');
  };

  const handleImport = () => {
    // TODO: Implement import functionality
    console.log('Import functionality to be implemented');
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          showFinancialValues={showFinancialValues}
          onToggleFinancialValues={handleToggleFinancialValues}
          onToggleTheme={handleToggleTheme}
          onExport={handleExport}
          onImport={handleImport}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900">
          <div className="container mx-auto px-6 py-8">
            <Routes>
              <Route path="/" element={
                <Dashboard 
                  summary={financialSummary} 
                  properties={properties}
                  transactions={transactions}
                  showFinancialValues={showFinancialValues}
                />
              } />
              <Route path="/properties" element={
                <PropertyManager 
                  properties={properties}
                  onAddProperty={(property) => {
                    // TODO: Implement add property functionality
                    console.log('Add property:', property);
                  }}
                  onEditProperty={(property) => {
                    // TODO: Implement edit property functionality
                    console.log('Edit property:', property);
                  }}
                  onDeleteProperty={(id) => {
                    // TODO: Implement delete property functionality
                    console.log('Delete property:', id);
                  }}
                />
              } />
              <Route path="/tenants" element={
                <TenantManager 
                  tenants={tenants}
                  properties={properties}
                  showFinancialValues={showFinancialValues}
                  onAddTenant={(tenant) => {
                    // TODO: Implement add tenant functionality
                    console.log('Add tenant:', tenant);
                  }}
                  onEditTenant={(tenant) => {
                    // TODO: Implement edit tenant functionality
                    console.log('Edit tenant:', tenant);
                  }}
                  onDeleteTenant={(id) => {
                    // TODO: Implement delete tenant functionality
                    console.log('Delete tenant:', id);
                  }}
                />
              } />
              <Route path="/transactions" element={<TransactionManager />} />
              <Route path="/documents" element={<DocumentManager />} />
              <Route path="/reports" element={<ReportManager />} />
              <Route path="/energy" element={<EnergyCalculator />} />
              <Route path="/sanebavi" element={<SanebaviManager />} />
              <Route path="/informors" element={<InformorsManager />} />
              <Route path="/activation" element={<ActivationForm />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ActivationProvider>
        <Router>
          <AppContent />
          <ToastContainer 
            position="bottom-right" 
            autoClose={5000} 
            hideProgressBar={false} 
            newestOnTop={false} 
            closeOnClick 
            rtl={false} 
            pauseOnFocusLoss 
            draggable 
            pauseOnHover 
          />
        </Router>
      </ActivationProvider>
    </QueryClientProvider>
  );
}

export default App;