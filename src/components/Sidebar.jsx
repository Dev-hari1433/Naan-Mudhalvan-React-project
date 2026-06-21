import React from 'react';
import { 
  DashboardIcon, 
  TransactionsIcon, 
  IncomeIcon, 
  ExpensesIcon, 
  AnalyticsIcon, 
  BudgetsIcon, 
  ReportsIcon, 
  SettingsIcon,
  CategoriesIcon,
  ExportIcon,
  CloseIcon
} from './Icons';

/**
 * Sidebar Navigation panel
 */
export const Sidebar = ({ activeTab, onTabChange, isOpen, onClose }) => {
  const menuItems = [
    { id: 'Dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { id: 'Transactions', label: 'Transactions', icon: <TransactionsIcon /> },
    { id: 'Income', label: 'Income Categories', icon: <IncomeIcon /> },
    { id: 'Expenses', label: 'Expense Categories', icon: <ExpensesIcon /> },
    { id: 'Analytics', label: 'Analytics', icon: <AnalyticsIcon /> },
    { id: 'Budgets', label: 'Budgeting', icon: <BudgetsIcon /> },
    { id: 'Reports', label: 'Financial Reports', icon: <ReportsIcon /> },
    { id: 'Export', label: 'Data Export/Import', icon: <ExportIcon /> },
    { id: 'Settings', label: 'Settings', icon: <SettingsIcon /> },
  ];

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div 
        style={{ 
          height: 'var(--header-height)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          padding: '0 24px',
          borderBottom: '1px solid var(--border-color)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ 
            backgroundColor: 'var(--color-primary)', 
            color: '#fff', 
            padding: '6px 12px', 
            borderRadius: '8px', 
            fontWeight: 800,
            fontSize: '1.1rem' 
          }}>
            ₹
          </span>
          <span style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            FinLux Premium
          </span>
        </div>
        <button 
          onClick={onClose} 
          className="btn-secondary mobile-close-btn" 
          style={{ 
            display: 'none', 
            background: 'none', 
            border: 'none', 
            color: 'var(--text-secondary)',
            cursor: 'pointer'
          }}
        >
          <CloseIcon size={20} />
        </button>
      </div>

      <nav style={{ padding: '20px 0', flex: 1, overflowY: 'auto' }}>
        {menuItems.map((item) => (
          <a
            key={item.id}
            onClick={() => {
              onTabChange(item.id);
              onClose();
            }}
            className={`nav-link ${activeTab === item.id ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </a>
        ))}
      </nav>

      <div 
        style={{ 
          padding: '20px', 
          borderTop: '1px solid var(--border-color)', 
          textAlign: 'center',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          fontWeight: 500
        }}
      >
        Personal Finance Engine v1.0.0
      </div>

      {/* Embedded style helper for mobile sidebar toggles */}
      <style>{`
        @media (max-width: 1024px) {
          .mobile-close-btn {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
};
