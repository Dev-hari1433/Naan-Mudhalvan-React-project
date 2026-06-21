import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { Categories } from './pages/Categories';
import { Analytics } from './pages/Analytics';
import { Budgets } from './pages/Budgets';
import { Reports } from './pages/Reports';
import { Export } from './pages/Export';
import { Settings } from './pages/Settings';
import { 
  loadState, 
  saveTransactions, 
  saveBudgets, 
  saveCategories, 
  saveSettings 
} from './utils/storage';
import { calculateBalance } from './utils/finance';
import { AIChatbot } from './components/AIChatbot';

function App() {
  // 1. Initial State Loading
  const [state, setState] = useState(() => loadState());
  const [activeTab, setActiveTab] = useState(() => {
    const loadedState = loadState();
    return loadedState.settings?.defaultView || 'Dashboard';
  });
  
  // Mobile sidebar drawer state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);

  // Sync theme with HTML attribute for CSS variables selection
  useEffect(() => {
    if (state.settings?.theme) {
      document.documentElement.setAttribute('data-theme', state.settings.theme);
    }
  }, [state.settings?.theme]);

  // 2. Transaction Handlers
  const handleAddTransaction = (newTx) => {
    const transaction = {
      ...newTx,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    };
    const updated = [transaction, ...state.transactions];
    setState(prev => ({ ...prev, transactions: updated }));
    saveTransactions(updated);
  };

  const handleEditTransaction = (id, updatedData) => {
    const updated = state.transactions.map(t => 
      t.id === id ? { ...t, ...updatedData } : t
    );
    setState(prev => ({ ...prev, transactions: updated }));
    saveTransactions(updated);
  };

  const handleDeleteTransaction = (id) => {
    const updated = state.transactions.filter(t => t.id !== id);
    setState(prev => ({ ...prev, transactions: updated }));
    saveTransactions(updated);
  };

  const handleDeleteTransactions = (ids) => {
    const updated = state.transactions.filter(t => !ids.includes(t.id));
    setState(prev => ({ ...prev, transactions: updated }));
    saveTransactions(updated);
  };

  // 3. Budget Handlers
  const handleAddBudget = (newBudget) => {
    const budget = {
      ...newBudget,
      id: `b-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    };
    const updated = [...state.budgets, budget];
    setState(prev => ({ ...prev, budgets: updated }));
    saveBudgets(updated);
  };

  const handleEditBudget = (id, updatedData) => {
    const updated = state.budgets.map(b => 
      b.id === id ? { ...b, ...updatedData } : b
    );
    setState(prev => ({ ...prev, budgets: updated }));
    saveBudgets(updated);
  };

  const handleDeleteBudget = (id) => {
    const updated = state.budgets.filter(b => b.id !== id);
    setState(prev => ({ ...prev, budgets: updated }));
    saveBudgets(updated);
  };

  // 4. Category Handlers
  const handleAddCategory = (type, newCategory) => {
    const updatedCategories = { ...state.categories };
    if (type === 'income') {
      updatedCategories.income = [...updatedCategories.income, newCategory];
    } else {
      updatedCategories.expense = [...updatedCategories.expense, newCategory];
    }
    setState(prev => ({ ...prev, categories: updatedCategories }));
    saveCategories(updatedCategories);
  };

  const handleDeleteCategory = (type, categoryToDelete) => {
    const updatedCategories = { ...state.categories };
    if (type === 'income') {
      updatedCategories.income = updatedCategories.income.filter(c => c !== categoryToDelete);
    } else {
      updatedCategories.expense = updatedCategories.expense.filter(c => c !== categoryToDelete);
    }
    setState(prev => ({ ...prev, categories: updatedCategories }));
    saveCategories(updatedCategories);
  };

  // 5. Settings Handlers
  const handleUpdateSettings = (newSettings) => {
    setState(prev => ({ ...prev, settings: newSettings }));
    saveSettings(newSettings);
  };

  const handleThemeToggle = () => {
    const nextTheme = state.settings.theme === 'dark' ? 'light' : 'dark';
    handleUpdateSettings({ ...state.settings, theme: nextTheme });
  };

  // 6. Reset & Restore Database Handlers
  const handleClearAllData = () => {
    localStorage.clear();
    const freshState = loadState();
    setState(freshState);
  };

  const handleImportState = (importedState) => {
    // Overwrite state and write to localstorage
    setState({
      transactions: importedState.transactions,
      budgets: importedState.budgets,
      categories: importedState.categories,
      settings: importedState.settings
    });
    saveTransactions(importedState.transactions);
    saveBudgets(importedState.budgets);
    saveCategories(importedState.categories);
    saveSettings(importedState.settings);
  };

  // 7. Render dynamic pages based on Active Tab
  const renderActivePage = () => {
    switch (activeTab) {
      case 'Transactions':
        return (
          <Transactions 
            transactions={state.transactions}
            categories={state.categories}
            settings={state.settings}
            onAddTransaction={handleAddTransaction}
            onEditTransaction={handleEditTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            onDeleteTransactions={handleDeleteTransactions}
          />
        );
      case 'Income':
        return (
          <Categories 
            type="income"
            categories={state.categories}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        );
      case 'Expenses':
        return (
          <Categories 
            type="expense"
            categories={state.categories}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        );
      case 'Analytics':
        return (
          <Analytics 
            transactions={state.transactions}
            settings={state.settings}
          />
        );
      case 'Budgets':
        return (
          <Budgets 
            budgets={state.budgets}
            transactions={state.transactions}
            categories={state.categories}
            settings={state.settings}
            onAddBudget={handleAddBudget}
            onEditBudget={handleEditBudget}
            onDeleteBudget={handleDeleteBudget}
          />
        );
      case 'Reports':
        return (
          <Reports 
            transactions={state.transactions}
            budgets={state.budgets}
            settings={state.settings}
          />
        );
      case 'Export':
        return (
          <Export 
            transactions={state.transactions}
            budgets={state.budgets}
            categories={state.categories}
            settings={state.settings}
            onImportState={handleImportState}
          />
        );
      case 'Settings':
        return (
          <Settings 
            settings={state.settings}
            onUpdateSettings={handleUpdateSettings}
            onClearAllData={handleClearAllData}
          />
        );
      case 'Dashboard':
      default:
        return (
          <Dashboard 
            transactions={state.transactions}
            budgets={state.budgets}
            settings={state.settings}
          />
        );
    }
  };

  const balance = calculateBalance(state.transactions);

  return (
    <div className={`app-container ${isChatOpen ? 'chat-open' : ''}`}>
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <div className="main-content">
        <Header 
          title={activeTab === 'Dashboard' ? 'Daily Financial Dashboard' : `${activeTab}`}
          onMenuToggle={() => setIsSidebarOpen(prev => !prev)}
          theme={state.settings.theme}
          onThemeToggle={handleThemeToggle}
          currentBalance={balance}
          currencyCode={state.settings.currency}
          isChatOpen={isChatOpen}
          onChatToggle={() => setIsChatOpen(prev => !prev)}
        />
        
        <main style={{ padding: '24px 0', flex: 1 }}>
          {renderActivePage()}
        </main>
      </div>

      <AIChatbot 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        transactions={state.transactions}
        budgets={state.budgets}
      />
    </div>
  );
}

export default App;
