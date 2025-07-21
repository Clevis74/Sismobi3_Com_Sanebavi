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
import { useDocuments } from './hooks/useDocuments';
import { useEnergyBills } from './hooks/useEnergyBills';
import { useWaterBills } from './hooks/useWaterBills';
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
  const { data: documents = [] } = useDocuments();
  const { data: energyBills = [] } = useEnergyBills();
  const { data: waterBills = [] } = useWaterBills();
  
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
              <Route path="/transactions" element={
                <TransactionManager 
                  transactions={transactions}
                  properties={properties}
                  showFinancialValues={showFinancialValues}
                  onAddTransaction={(transaction) => {
                    // TODO: Implement add transaction functionality
                    console.log('Add transaction:', transaction);
                  }}
                  onUpdateTransaction={(transaction) => {
                    // TODO: Implement update transaction functionality
                    console.log('Update transaction:', transaction);
                  }}
                  onDeleteTransaction={(id) => {
                    // TODO: Implement delete transaction functionality
                    console.log('Delete transaction:', id);
                  }}
                  loading={false}
                  error={null}
                />
              } />
              <Route path="/documents" element={
                <DocumentManager 
                  documents={documents}
                  onAddDocument={(document) => {
                    // TODO: Implement add document functionality
                    console.log('Add document:', document);
                  }}
                  onUpdateDocument={(document) => {
                    // TODO: Implement update document functionality
                    console.log('Update document:', document);
                  }}
                  onDeleteDocument={(id) => {
                    // TODO: Implement delete document functionality
                    console.log('Delete document:', id);
                  }}
                  loading={false}
                  error={null}
                />
              } />
              <Route path="/reports" element={
                <ReportManager 
                  properties={properties}
                  tenants={tenants}
                  transactions={transactions}
                  documents={documents}
                  showFinancialValues={showFinancialValues}
                />
              } />
              <Route path="/energy" element={
                <EnergyCalculator 
                  energyBills={energyBills}
                  waterBills={waterBills}
                  properties={properties}
                  onAddEnergyBill={(bill) => {
                    // TODO: Implement add energy bill functionality
                    console.log('Add energy bill:', bill);
                  }}
                  onAddWaterBill={(bill) => {
                    // TODO: Implement add water bill functionality
                    console.log('Add water bill:', bill);
                  }}
                  onUpdateEnergyBill={(bill) => {
                    // TODO: Implement update energy bill functionality
                    console.log('Update energy bill:', bill);
                  }}
                  onUpdateWaterBill={(bill) => {
                    // TODO: Implement update water bill functionality
                    console.log('Update water bill:', bill);
                  }}
                  onDeleteEnergyBill={(id) => {
                    // TODO: Implement delete energy bill functionality
                    console.log('Delete energy bill:', id);
                  }}
                  onDeleteWaterBill={(id) => {
                    // TODO: Implement delete water bill functionality
                    console.log('Delete water bill:', id);
                  }}
                  loading={false}
                  error={null}
                />
              } />
              <Route path="/sanebavi" element={
                <SanebaviManager 
                  properties={properties}
                  tenants={tenants}
                  showFinancialValues={showFinancialValues}
                />
              } />
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