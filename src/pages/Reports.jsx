import React, { useState } from 'react';
import { 
  calculateTotalIncome, 
  calculateTotalExpenses, 
  calculateBalance, 
  calculateSavingsRate, 
  aggregateByCategory,
  calculateTimeBasedAnalytics
} from '../utils/finance';
import { formatCurrency } from '../utils/formatters';
import { ReportsIcon } from '../components/Icons';

export const Reports = ({ transactions = [], settings }) => {
  const [activeReportTab, setActiveReportTab] = useState('summary');
  const [selectedMonth, setSelectedMonth] = useState('all');

  const hasData = transactions && transactions.length > 0;

  // Extract available months
  const availableMonths = Array.from(
    new Set(
      transactions
        .map(t => t.date.substring(0, 7))
        .filter(m => m && !isNaN(new Date(m).getTime()))
    )
  ).sort((a, b) => b.localeCompare(a));

  // Date filtered transactions
  const reportTransactions = selectedMonth === 'all' 
    ? transactions 
    : transactions.filter(t => t.date.startsWith(selectedMonth));

  // Math aggregates
  const totalIncome = calculateTotalIncome(reportTransactions);
  const totalExpenses = calculateTotalExpenses(reportTransactions);
  const balance = calculateBalance(reportTransactions);
  const savingsRate = calculateSavingsRate(reportTransactions);

  const expenseCategories = aggregateByCategory(reportTransactions, 'expense');
  const incomeCategories = aggregateByCategory(reportTransactions, 'income');
  const monthlyTrends = calculateTimeBasedAnalytics(reportTransactions, 'monthly');

  const handlePrint = () => {
    window.print();
  };

  if (!hasData) {
    return (
      <div className="card empty-state">
        <ReportsIcon className="empty-state-icon" />
        <h3>No Statements Compiled</h3>
        <p>Log transactions first to generate printable statements, summaries, and monthly reports.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="reports-page-container">
      
      {/* Filters & Actions row */}
      <div 
        className="card no-print" 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: '12px' 
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Filter Month:
          </span>
          <select 
            className="form-control" 
            style={{ width: '160px' }}
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            <option value="all">All Records</option>
            {availableMonths.map((m, idx) => (
              <option key={idx} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <button className="btn btn-primary" onClick={handlePrint}>
          <ReportsIcon size={16} /> Print Report
        </button>
      </div>

      {/* Tabs */}
      <div 
        className="no-print" 
        style={{ 
          display: 'flex', 
          borderBottom: '1px solid var(--border-color)', 
          gap: '8px',
          paddingBottom: '2px' 
        }}
      >
        <button
          className={`btn ${activeReportTab === 'summary' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveReportTab('summary')}
          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
        >
          Financial Summary
        </button>
        <button
          className={`btn ${activeReportTab === 'income' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveReportTab('income')}
          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
        >
          Income Report
        </button>
        <button
          className={`btn ${activeReportTab === 'expense' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveReportTab('expense')}
          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
        >
          Expense Report
        </button>
      </div>

      {/* PRINT BANNER */}
      <div className="print-only-header" style={{ display: 'none', marginBottom: '24px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '8px', fontFamily: 'var(--font-display)' }}>
          Daily Expense Platform Summary
        </h1>
        <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.875rem' }}>
          Statement Period: {selectedMonth === 'all' ? 'All-Time' : selectedMonth} (Currency: INR ₹)
        </p>
        <hr style={{ margin: '16px 0', border: 0, borderTop: '2px solid #000' }} />
      </div>

      {/* RENDER ACTIVE TAB SHEET */}

      {/* 1. FINANCIAL SUMMARY */}
      {activeReportTab === 'summary' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '18px', fontSize: '1.05rem' }}>Monthly Performance Sheet</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="report-row">
                <span>Total Capital Inflow (Earnings)</span>
                <span style={{ color: 'var(--color-success)', fontWeight: 700 }}>
                  {formatCurrency(totalIncome)}
                </span>
              </div>
              <div className="report-row">
                <span>Total Capital Outflow (Spending)</span>
                <span style={{ fontWeight: 700 }}>
                  {formatCurrency(totalExpenses)}
                </span>
              </div>
              <div className="report-row" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                <span>Net Disposable Balance</span>
                <span style={{ 
                  fontWeight: 800, 
                  color: balance >= 0 ? 'var(--color-success)' : 'var(--color-danger)' 
                }}>
                  {formatCurrency(balance)}
                </span>
              </div>
              <div className="report-row">
                <span>Savings Compliance Ratio</span>
                <span style={{ fontWeight: 700 }}>
                  {savingsRate.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Top category breakdown */}
          <div className="card" style={{ padding: 0 }}>
            <h3 style={{ padding: '20px 24px 12px 24px', fontSize: '1.05rem' }}>Top Spending Contributors</h3>
            {expenseCategories.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No expense data logged.
              </div>
            ) : (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Expense Category</th>
                      <th>Total Outflow</th>
                      <th>Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenseCategories.slice(0, 5).map((item, idx) => (
                      <tr key={idx}>
                        <td>#{idx + 1}</td>
                        <td style={{ fontWeight: 700 }}>{item.category}</td>
                        <td style={{ fontWeight: 600 }}>{formatCurrency(item.amount)}</td>
                        <td>{item.percentage.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. INCOME REPORT */}
      {activeReportTab === 'income' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card" style={{ padding: 0 }}>
            <h3 style={{ padding: '20px 24px 12px 24px', fontSize: '1.05rem' }}>Inflow Source Ledger</h3>
            {incomeCategories.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No earnings logged.
              </div>
            ) : (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Earnings Source</th>
                      <th>Total Amount</th>
                      <th>Percentage</th>
                      <th>Counts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incomeCategories.map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 700 }}>{item.category}</td>
                        <td style={{ fontWeight: 600, color: 'var(--color-success)' }}>
                          {formatCurrency(item.amount)}
                        </td>
                        <td>{item.percentage.toFixed(1)}%</td>
                        <td>{item.count} items</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. EXPENSE REPORT */}
      {activeReportTab === 'expense' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card" style={{ padding: 0 }}>
            <h3 style={{ padding: '20px 24px 12px 24px', fontSize: '1.05rem' }}>Outflow Ledger</h3>
            {expenseCategories.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No expenses logged.
              </div>
            ) : (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Expense Category</th>
                      <th>Total Outflow</th>
                      <th>Percentage</th>
                      <th>Counts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenseCategories.map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 700 }}>{item.category}</td>
                        <td style={{ fontWeight: 600 }}>{formatCurrency(item.amount)}</td>
                        <td>{item.percentage.toFixed(1)}%</td>
                        <td>{item.count} items</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .report-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.95rem;
          color: var(--text-secondary);
        }
        @media print {
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
            font-size: 11pt;
          }
          .sidebar, .no-print, header, .pagination-controls, .btn {
            display: none !important;
          }
          .main-content {
            margin-left: 0 !important;
            width: 100% !important;
            padding: 0 !important;
          }
          .card {
            border: none !important;
            background: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin-bottom: 20px;
          }
          .custom-table th {
            background-color: #f3f4f6 !important;
            color: #000000 !important;
            border-bottom: 2px solid #000000 !important;
          }
          .custom-table td {
            border-bottom: 1px solid #e5e7eb !important;
            color: #000000 !important;
          }
          .print-only-header {
            display: block !important;
          }
          .report-row {
            color: #000000 !important;
          }
        }
      `}</style>
    </div>
  );
};
