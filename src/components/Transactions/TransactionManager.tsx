import React, { useState } from 'react';
import { Plus, Edit, Trash2, Calendar, DollarSign, Tag, Filter } from 'lucide-react';
import { Transaction } from '../../types';
import { TransactionForm } from './TransactionForm';
import { formatCurrencyWithVisibility, formatDate } from '../../utils/calculations';
import { useActivation } from '../../contexts/ActivationContext';
import { LoadingButton, LoadingOverlay } from '../UI/LoadingSpinner';

interface TransactionManagerProps {
  transactions: Transaction[];
  properties: any[];
  showFinancialValues: boolean;
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  onUpdateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  onDeleteTransaction: (id: string) => void;
}

export const TransactionManager: React.FC<TransactionManagerProps> = ({
  transactions,
  properties,
  showFinancialValues,
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction
}) => {
  const { isDemoMode } = useActivation();
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  // Configurações do modo DEMO
  const DEMO_LIMITS = {
    maxTransactions: 50
  };

  const isAtDemoLimit = isDemoMode && transactions.length >= DEMO_LIMITS.maxTransactions;

  const handleAddTransaction = (transactionData: Omit<Transaction, 'id'>) => {
    if (isAtDemoLimit) {
      return; // Não permite adicionar se estiver no limite do demo
    }
    setLoading(true);
    
    // Simular operação assíncrona
    setTimeout(() => {
      onAddTransaction(transactionData);
      setShowForm(false);
      setLoading(false);
    }, 800);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleUpdateTransaction = (transactionData: Omit<Transaction, 'id'>) => {
    if (editingTransaction) {
      setLoading(true);
      
      // Simular operação assíncrona
      setTimeout(() => {
        onUpdateTransaction(editingTransaction.id, transactionData);
        setEditingTransaction(null);
        setShowForm(false);
        setLoading(false);
      }, 600);
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const typeMatch = filter === 'all' || transaction.type === filter;
    const categoryMatch = categoryFilter === 'all' || transaction.category === categoryFilter;
    return typeMatch && categoryMatch;
  });

  const categories = [...new Set(transactions.map(t => t.category))];

  const getTransactionColor = (type: string) => {
    return type === 'income' ? 'text-green-600' : 'text-red-600';
  };

  const getTransactionIcon = (type: string) => {
    return type === 'income' ? '+' : '-';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Transações</h2>
          {isDemoMode && (
            <p className="text-sm text-orange-600 mt-1">
              Modo DEMO: {transactions.length}/{DEMO_LIMITS.maxTransactions} transações utilizadas
            </p>
          )}
        </div>
        <div className="flex flex-col items-end space-y-2">
          <LoadingButton
            loading={loading}
            onClick={() => setShowForm(true)}
            disabled={isAtDemoLimit}
            variant={isAtDemoLimit ? 'secondary' : 'primary'}
            title={isAtDemoLimit ? 'Limite do modo DEMO atingido' : 'Adicionar nova transação'}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Transação
          </LoadingButton>
          {isAtDemoLimit && (
            <p className="text-xs text-red-600 text-right max-w-xs">
              Limite de {DEMO_LIMITS.maxTransactions} transações atingido no modo DEMO. 
              Ative o sistema para cadastros ilimitados.
            </p>
          )}
        </div>
      </div>

      {/* Aviso do modo DEMO */}
      {isDemoMode && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <h3 className="text-orange-800 font-medium">Modo DEMO Ativo</h3>
          </div>
          <p className="text-orange-700 text-sm mt-1">
            Você pode cadastrar até {DEMO_LIMITS.maxTransactions} transações. 
            Para acesso ilimitado, ative o sistema na aba "Ativação".
          </p>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Filtros:</span>
          </div>
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'income' | 'expense')}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos os tipos</option>
            <option value="income">Receitas</option>
            <option value="expense">Despesas</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todas as categorias</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {showForm && (
        <LoadingOverlay loading={loading} message={editingTransaction ? "Atualizando transação..." : "Criando transação..."}>
          <TransactionForm
            transaction={editingTransaction}
            properties={properties}
            onSubmit={editingTransaction ? handleUpdateTransaction : handleAddTransaction}
            onCancel={() => {
              setShowForm(false);
              setEditingTransaction(null);
            }}
          />
        </LoadingOverlay>
      )}

      {/* Lista de Transações */}
      <LoadingOverlay loading={loading} message="Processando transação...">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Propriedade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Descrição
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTransactions.map((transaction) => {
                const property = properties.find(p => p.id === transaction.propertyId);
                return (
                  <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900 dark:text-gray-100">{formatDate(transaction.date)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 dark:text-gray-100">{property?.name || 'Propriedade não encontrada'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getTransactionColor(transaction.type)}`}>
                        {transaction.type === 'income' ? 'Receita' : 'Despesa'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Tag className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900 dark:text-gray-100">{transaction.category}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900 dark:text-gray-100">{transaction.description}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 text-gray-400 mr-1" />
                        <span className={`text-sm font-medium ${getTransactionColor(transaction.type)}`}>
                          {getTransactionIcon(transaction.type)}{formatCurrencyWithVisibility(transaction.amount, showFinancialValues)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditTransaction(transaction)}
                          disabled={loading}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteTransaction(transaction.id)}
                          disabled={loading}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        </div>
      </LoadingOverlay>

      {filteredTransactions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Nenhuma transação encontrada</p>
          <p className="text-gray-400 mt-2">Comece adicionando sua primeira transação</p>
        </div>
      )}
    </div>
  );
};