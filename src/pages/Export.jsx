import React, { useRef, useState } from 'react';
import { ExportIcon, InfoIcon } from '../components/Icons';
import { Alert } from '../components/Alert';
import { 
  calculateTotalIncome, 
  calculateTotalExpenses, 
  calculateBalance, 
  calculateSavingsRate 
} from '../utils/finance';

export const Export = ({ transactions = [], budgets = [], categories, settings, onImportState }) => {
  const fileInputRef = useRef(null);
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');

  const hasData = transactions && transactions.length > 0;

  // 1. Export Transactions CSV
  const handleExportTransactionsCSV = () => {
    if (transactions.length === 0) {
      alert('No transaction records in database.');
      return;
    }

    const headers = ['ID', 'Type', 'Amount (INR)', 'Category', 'Date', 'Description', 'Notes'];
    const rows = transactions.map(t => [
      t.id,
      t.type,
      t.amount,
      `"${t.category.replace(/"/g, '""')}"`,
      t.date,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    downloadBlob(csvContent, 'rupees_transactions_log.csv', 'text/csv;charset=utf-8;');
  };

  // 2. Export Financial Summary CSV
  const handleExportSummaryCSV = () => {
    const totalIncome = calculateTotalIncome(transactions);
    const totalExpenses = calculateTotalExpenses(transactions);
    const balance = calculateBalance(transactions);
    const savingsRate = calculateSavingsRate(transactions);

    const csvContent = [
      'Financial Summary Sheet (INR ₹)',
      `Date Generated,${new Date().toISOString().substring(0, 10)}`,
      '',
      'Financial Metric,Value (INR)',
      `Total Income,₹${totalIncome}`,
      `Total Expenses,₹${totalExpenses}`,
      `Remaining Balance,₹${balance}`,
      `Savings Ratio,${savingsRate.toFixed(2)}%`,
    ].join('\n');

    downloadBlob(csvContent, 'financial_ledger_summary.csv', 'text/csv;charset=utf-8;');
  };

  // 3. Export Budgets CSV
  const handleExportBudgetsCSV = () => {
    if (budgets.length === 0) {
      alert('No category budgets configured.');
      return;
    }

    const headers = ['ID', 'Category', 'Limit Amount (INR)', 'Period'];
    const rows = budgets.map(b => [
      b.id,
      b.category,
      b.amount,
      b.period
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    downloadBlob(csvContent, 'budgets_outflows_limits.csv', 'text/csv;charset=utf-8;');
  };

  // 4. JSON Backup package
  const handleExportJSONBackup = () => {
    const state = {
      transactions,
      budgets,
      categories,
      settings,
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      currencySymbol: '₹'
    };

    const jsonString = JSON.stringify(state, null, 2);
    downloadBlob(jsonString, 'fintech_dashboard_backup.json', 'application/json;charset=utf-8;');
  };

  const downloadBlob = (content, filename, contentType) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 5. Restore JSON Backup
  const handleImportJSON = (e) => {
    setImportError('');
    setImportSuccess('');

    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        
        if (!parsed.transactions || !Array.isArray(parsed.transactions)) {
          throw new Error('Invalid format: transactions list is missing.');
        }
        if (!parsed.budgets || !Array.isArray(parsed.budgets)) {
          throw new Error('Invalid format: budgets list is missing.');
        }
        if (!parsed.categories || !parsed.categories.income || !parsed.categories.expense) {
          throw new Error('Invalid format: custom category profiles are incomplete.');
        }

        onImportState(parsed);
        setImportSuccess('System database restored successfully! Page reloading...');
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (err) {
        setImportError(err.message || 'Failed to parse JSON backup package.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {importError && <Alert type="danger" message={importError} />}
      {importSuccess && <Alert type="success" message={importSuccess} />}

      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: '1.5fr 1fr', 
          gap: '24px' 
        }}
        className="export-layout-grid"
      >
        {/* Export Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Export Data Sheets</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Compile and download CSV logs of transactions, budgets, or summary ledgers formatted in Indian Rupees (₹).
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="export-row-item">
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem' }}>Transactions Log (.csv)</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  A spreadsheet of all income and expenses containing details and notes.
                </span>
              </div>
              <button 
                className="btn btn-secondary btn-sm" 
                onClick={handleExportTransactionsCSV}
                disabled={!hasData}
              >
                <ExportIcon size={14} /> Download CSV
              </button>
            </div>

            <div className="export-row-item">
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem' }}>Financial Summary Sheet (.csv)</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  A summary file containing net savings rate, balance, and total figures.
                </span>
              </div>
              <button 
                className="btn btn-secondary btn-sm" 
                onClick={handleExportSummaryCSV}
                disabled={!hasData}
              >
                <ExportIcon size={14} /> Download CSV
              </button>
            </div>

            <div className="export-row-item">
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem' }}>Budgets Outflow Sheet (.csv)</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Current category budgets caps and frequencies.
                </span>
              </div>
              <button 
                className="btn btn-secondary btn-sm" 
                onClick={handleExportBudgetsCSV}
                disabled={budgets.length === 0}
              >
                <ExportIcon size={14} /> Download CSV
              </button>
            </div>
          </div>
        </div>

        {/* Database backup */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '18px', height: 'fit-content' }}>
          <h3 style={{ fontSize: '1.05rem', margin: 0 }}>System backups</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Pack all configurations, custom categories, budgets, and transactions into a single JSON file.
          </p>

          <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleExportJSONBackup}>
            <ExportIcon size={16} /> Export JSON Package
          </button>

          <hr style={{ border: 0, borderTop: '1px solid var(--border-color)', margin: '4px 0' }} />

          <div>
            <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Restore from Backup
            </span>
            <input
              type="file"
              accept=".json"
              ref={fileInputRef}
              onChange={handleImportJSON}
              style={{ display: 'none' }}
            />
            <button 
              className="btn btn-secondary" 
              style={{ width: '100%', borderStyle: 'dashed' }}
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
            >
              Upload Backup Package
            </button>
          </div>

          <div style={{ display: 'flex', gap: '10px', padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)' }}>
            <span style={{ color: 'var(--text-muted)', marginTop: '2px' }}>
              <InfoIcon size={14} />
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
              Restoring a backup file will overwrite your local storage database.
            </span>
          </div>
        </div>
      </div>

      <style>{`
        .export-row-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          background-color: rgba(255, 255, 255, 0.01);
        }
        @media (max-width: 768px) {
          .export-layout-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
