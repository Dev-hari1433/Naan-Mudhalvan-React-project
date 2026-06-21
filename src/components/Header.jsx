import React from 'react';
import { MenuIcon, MoonIcon, SunIcon } from './Icons';
import { formatCurrency } from '../utils/formatters';

/**
 * Top header component with summary indicators and theme control
 */
export const Header = ({ 
  title, 
  onMenuToggle, 
  theme, 
  onThemeToggle, 
  currentBalance, 
  currencyCode,
  isChatOpen,
  onChatToggle
}) => {
  return (
    <header 
      style={{
        height: 'var(--header-height)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        borderBottom: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-sidebar)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        backdropFilter: 'var(--backdrop-blur)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button 
          onClick={onMenuToggle}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            padding: '4px',
            display: 'none'
          }}
          className="mobile-hamburger"
        >
          <MenuIcon size={24} />
        </button>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
          {title}
        </h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Quick Header Balance Metric (Desktop only) */}
        <div className="header-balance-indicator" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
            Current Balance
          </span>
          <span style={{ 
            fontSize: '1rem', 
            fontWeight: 700, 
            color: currentBalance >= 0 ? 'var(--color-success)' : 'var(--color-danger)' 
          }}>
            {formatCurrency(currentBalance, currencyCode)}
          </span>
        </div>

        {/* AI Chat Drawer Toggle Button */}
        <button 
          onClick={onChatToggle}
          title={isChatOpen ? "Close AI Assistant" : "Open AI Assistant"}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            borderRadius: '50%',
            backgroundColor: isChatOpen ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-input)',
            border: isChatOpen ? '1px solid var(--color-primary)' : '1px solid var(--border-color)',
            color: isChatOpen ? 'var(--color-primary)' : 'var(--text-primary)',
            cursor: 'pointer',
            transition: 'var(--transition-smooth)',
            position: 'relative'
          }}
        >
          <span style={{ fontSize: '1.15rem' }}>🤖</span>
          <span style={{
            position: 'absolute',
            top: 2,
            right: 2,
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: '#10b981',
            border: '1.5px solid var(--bg-sidebar)'
          }} />
        </button>

        {/* Theme Toggle Button */}
        <button 
          onClick={onThemeToggle}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            borderRadius: '50%',
            backgroundColor: 'var(--bg-input)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            transition: 'var(--transition-smooth)'
          }}
        >
          {theme === 'dark' ? <SunIcon size={18} /> : <MoonIcon size={18} />}
        </button>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .mobile-hamburger {
            display: block !important;
          }
        }
        @media (max-width: 600px) {
          .header-balance-indicator {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
};
