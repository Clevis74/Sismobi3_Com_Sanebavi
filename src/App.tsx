import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { ActivationProvider } from './contexts/ActivationContext';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import SyncIndicator from './components/Layout/SyncIndicator';
import Dashboard from './components/Dashboard/Dashboard';
import PropertyManager from './components/Properties/PropertyManager';
import TenantManager from './components/Tenants/TenantManager';
import TransactionManager from './components/Transactions/TransactionManager';
import DocumentManager from './components/Documents/DocumentManager';
import ReportManager from './components/Reports/ReportManager';
import EnergyCalculator from './components/Energy/EnergyCalculator';
import SanebaviManager from './components/Sanebavi/SanebaviManager';
import InformorsManager from './components/Informors/InformorsManager';
import { ActivationForm } from './components/Activation/ActivationForm';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ActivationProvider>
        <Router>
          <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <Header />
              <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900">
                <div className="container mx-auto px-6 py-8">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/properties" element={<PropertyManager />} />
                    <Route path="/tenants" element={<TenantManager />} />
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
              <SyncIndicator />
            </div>
          </div>
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