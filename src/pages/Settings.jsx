import React, { useState } from 'react';
import { Alert } from '../components/Alert';
import { InfoIcon } from '../components/Icons';

export const Settings = ({ settings, onUpdateSettings, onClearAllData }) => {
  const [successMsg, setSuccessMsg] = useState('');
  const [clearState, setClearState] = useState('idle');

  const handleDateFormatChange = (e) => {
    onUpdateSettings({ ...settings, dateFormat: e.target.value });
    triggerSuccess('Date format setting updated.');
  };

  const handleThemeChange = (themeVal) => {
    onUpdateSettings({ ...settings, theme: themeVal });
    triggerSuccess(`${themeVal.toUpperCase()} theme mode enabled.`);
  };

  const handleDefaultViewChange = (e) => {
    onUpdateSettings({ ...settings, defaultView: e.target.value });
    triggerSuccess('Default landing screen updated.');
  };

  const handleNotificationChange = (e) => {
    onUpdateSettings({ ...settings, notificationsEnabled: e.target.checked });
    triggerSuccess(e.target.checked ? 'Notifications enabled.' : 'Notifications muted.');
  };

  const triggerSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => {
      setSuccessMsg('');
    }, 3000);
  };

  const handleResetData = () => {
    if (clearState === 'idle') {
      setClearState('confirm');
    } else if (clearState === 'confirm') {
      onClearAllData();
      setClearState('cleared');
      setTimeout(() => {
        setClearState('idle');
      }, 3000);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {successMsg && <Alert type="success" message={successMsg} />}
      {clearState === 'cleared' && <Alert type="success" message="Local storage database wiped successfully." />}

      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
          gap: '24px' 
        }}
      >
        
        {/* General Configurations Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.05rem', margin: 0 }}>System Configurations</h3>

          {/* Locked Currency Display */}
          <div className="form-group">
            <label>Operating Currency</label>
            <div 
              style={{ 
                padding: '12px 16px', 
                backgroundColor: 'var(--bg-input)', 
                border: '1px solid var(--border-color)', 
                borderRadius: '8px',
                fontWeight: 700,
                color: 'var(--color-success)'
              }}
            >
              INR (₹) - Indian Rupees
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
              Locked to Indian Rupees (₹) formatting.
            </span>
          </div>

          {/* Date Format */}
          <div className="form-group">
            <label htmlFor="set-date">Date Format</label>
            <select 
              id="set-date" 
              className="form-control" 
              value={settings.dateFormat} 
              onChange={handleDateFormatChange}
            >
              <option value="YYYY-MM-DD">YYYY-MM-DD (2026-06-20)</option>
              <option value="DD-MM-YYYY">DD-MM-YYYY (20-06-2026)</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY (06/20/2026)</option>
            </select>
          </div>

          {/* Default landing tab */}
          <div className="form-group">
            <label htmlFor="set-view">Default Landing Screen</label>
            <select 
              id="set-view" 
              className="form-control" 
              value={settings.defaultView} 
              onChange={handleDefaultViewChange}
            >
              <option value="Dashboard">Dashboard</option>
              <option value="Transactions">Transactions</option>
              <option value="Analytics">Analytics</option>
              <option value="Budgets">Budgets</option>
            </select>
          </div>
        </div>

        {/* Visual & Alerts settings card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Visuals & Alerts</h3>

          {/* Theme selection */}
          <div className="form-group">
            <label>Theme Style</label>
            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <button
                type="button"
                className={`btn ${settings.theme === 'light' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1 }}
                onClick={() => handleThemeChange('light')}
              >
                Light Theme
              </button>
              <button
                type="button"
                className={`btn ${settings.theme === 'dark' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1 }}
                onClick={() => handleThemeChange('dark')}
              >
                Dark Theme
              </button>
            </div>
          </div>

          {/* Notifications checkbox toggle */}
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '12px',
              backgroundColor: 'var(--bg-input)',
              borderRadius: '8px',
              border: '1px solid var(--border-color)'
            }}
          >
            <div>
              <strong style={{ display: 'block', fontSize: '0.85rem' }}>Budget Notifications</strong>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Enable near-limit warning flags.
              </span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.notificationsEnabled}
                onChange={handleNotificationChange}
              />
              <span className="slider"></span>
            </label>
          </div>

          {/* Database Reset */}
          <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
            <span style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-danger)', marginBottom: '8px' }}>
              Danger Zone
            </span>
            <button
              onClick={handleResetData}
              className="btn btn-danger"
              style={{ width: '100%' }}
            >
              {clearState === 'idle' 
                ? 'Wipe Local Database' 
                : clearState === 'confirm' 
                  ? 'Confirm Wipe! (IRREVERSIBLE)' 
                  : 'Purging Database...'}
            </button>
          </div>
        </div>

      </div>

      <div style={{ display: 'flex', gap: '10px', padding: '14px', borderRadius: '12px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)' }}>
        <span style={{ color: 'var(--text-muted)', marginTop: '2px' }}>
          <InfoIcon size={18} />
        </span>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
          Clearing local database will reset the platform into a clean initial state.
        </span>
      </div>

    </div>
  );
};
