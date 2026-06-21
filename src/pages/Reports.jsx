import React, { useState } from 'react';
import { 
  calculateTotalIncome, 
  calculateTotalExpenses, 
  calculateBalance, 
  calculateSavingsRate, 
  aggregateByCategory,
  calculateTimeBasedAnalytics,
  calculateFinancialHealthScore,
  calculateSpendingEfficiencyGrade,
  calculateBudgetUtilization
} from '../utils/finance';
import { formatCurrency } from '../utils/formatters';
import { generateFinancialInsights } from '../utils/insights';
import { ReportsIcon } from '../components/Icons';

export const Reports = ({ transactions = [], budgets = [], settings }) => {
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

  // Math aggregates for active screen filters
  const totalIncome = calculateTotalIncome(reportTransactions);
  const totalExpenses = calculateTotalExpenses(reportTransactions);
  const balance = calculateBalance(reportTransactions);
  const savingsRate = calculateSavingsRate(reportTransactions);

  const expenseCategories = aggregateByCategory(reportTransactions, 'expense');
  const incomeCategories = aggregateByCategory(reportTransactions, 'income');

  // Diagnostic metrics
  const healthScore = calculateFinancialHealthScore(reportTransactions, budgets);
  const efficiencyGrade = calculateSpendingEfficiencyGrade(reportTransactions, budgets);
  const insights = generateFinancialInsights(reportTransactions);

  // Budget calculations
  const printBudgetsSummary = budgets.map(b => {
    const util = calculateBudgetUtilization(b, reportTransactions);
    return {
      category: b.category,
      allocated: b.amount,
      spent: util.spent,
      remaining: util.remaining,
      utilization: util.utilization
    };
  });

  // Transaction counts
  const totalCount = reportTransactions.length;
  const incomeCount = reportTransactions.filter(t => t.type === 'income').length;
  const expenseCount = reportTransactions.filter(t => t.type === 'expense').length;

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
      
      {/* Filters & Actions row (Screen Only) */}
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

      {/* Tabs navigation (Screen Only) */}
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

      {/* RENDER ACTIVE TAB SHEET (Screen Only) */}

      {/* 1. FINANCIAL SUMMARY */}
      {activeReportTab === 'summary' && (
        <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
        <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
        <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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

      {/* ---------------------------------------------------- */}
      {/* DEDICATED PRINT-ONLY CONTAINER (HIDDEN ON SCREEN)     */}
      {/* ---------------------------------------------------- */}
      <div className="print-only-container">
        
        {/* 1. Report Header */}
        <div className="print-header" style={{ borderBottom: '2px solid #000', paddingBottom: '12px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '20pt', fontWeight: 800, color: '#000', margin: 0, fontFamily: 'var(--font-display)' }}>FinLux Premium</h1>
              <p style={{ fontSize: '9pt', color: '#666', margin: '2px 0 0 0', fontFamily: 'var(--font-sans)' }}>Intelligent Wealth Analytics</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <h2 style={{ fontSize: '14pt', fontWeight: 700, color: '#000', margin: 0, fontFamily: 'var(--font-display)' }}>Financial Intelligence & Audit Statement</h2>
              <p style={{ fontSize: '9pt', color: '#666', margin: '2px 0 0 0', fontFamily: 'var(--font-sans)' }}>
                Period: {selectedMonth === 'all' ? 'All-Time Records' : `Month: ${selectedMonth}`}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9pt', color: '#333', marginTop: '16px' }}>
            <span><strong>Generated On:</strong> {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <span><strong>Currency:</strong> INR (₹)</span>
          </div>
        </div>

        {/* 2. Financial Summary */}
        <div className="print-section" style={{ marginBottom: '30px', pageBreakInside: 'avoid' }}>
          <h3 style={{ fontSize: '12pt', borderBottom: '1px solid #ddd', paddingBottom: '6px', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
            I. Executive Financial Summary
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
            <div style={{ border: '1px solid #ccc', padding: '12px', borderRadius: '6px', textAlign: 'center' }}>
              <span style={{ fontSize: '8pt', textTransform: 'uppercase', color: '#666', display: 'block', marginBottom: '4px' }}>Total Inflow (Earnings)</span>
              <span style={{ fontSize: '14pt', fontWeight: 700, color: '#166534' }}>{formatCurrency(totalIncome)}</span>
            </div>
            <div style={{ border: '1px solid #ccc', padding: '12px', borderRadius: '6px', textAlign: 'center' }}>
              <span style={{ fontSize: '8pt', textTransform: 'uppercase', color: '#666', display: 'block', marginBottom: '4px' }}>Total Outflow (Expenses)</span>
              <span style={{ fontSize: '14pt', fontWeight: 700, color: '#000000' }}>{formatCurrency(totalExpenses)}</span>
            </div>
            <div style={{ border: '1px solid #ccc', padding: '12px', borderRadius: '6px', textAlign: 'center' }}>
              <span style={{ fontSize: '8pt', textTransform: 'uppercase', color: '#666', display: 'block', marginBottom: '4px' }}>Net Disposable Balance</span>
              <span style={{ fontSize: '14pt', fontWeight: 700, color: balance >= 0 ? '#166534' : '#991b1b' }}>{formatCurrency(balance)}</span>
            </div>
            <div style={{ border: '1px solid #ccc', padding: '12px', borderRadius: '6px', textAlign: 'center' }}>
              <span style={{ fontSize: '8pt', textTransform: 'uppercase', color: '#666', display: 'block', marginBottom: '4px' }}>Savings Compliance Ratio</span>
              <span style={{ fontSize: '14pt', fontWeight: 700, color: '#000000' }}>{savingsRate.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* 3. Income Summary */}
        <div className="print-section" style={{ marginBottom: '30px', pageBreakInside: 'avoid' }}>
          <h3 style={{ fontSize: '12pt', borderBottom: '1px solid #ddd', paddingBottom: '6px', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
            II. Capital Inflow Analysis (Income Categories)
          </h3>
          {incomeCategories.length === 0 ? (
            <p style={{ fontSize: '9.5pt', fontStyle: 'italic', color: '#666' }}>No capital inflows recorded during this statement period.</p>
          ) : (
            <table className="print-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9.5pt' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #333' }}>
                  <th style={{ padding: '8px', textAlign: 'left', fontWeight: 700 }}>Earnings Source</th>
                  <th style={{ padding: '8px', textAlign: 'right', fontWeight: 700 }}>Total Inflow</th>
                  <th style={{ padding: '8px', textAlign: 'right', fontWeight: 700 }}>Percentage Contribution</th>
                  <th style={{ padding: '8px', textAlign: 'right', fontWeight: 700 }}>Record Counts</th>
                </tr>
              </thead>
              <tbody>
                {incomeCategories.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '8px', fontWeight: 700 }}>{item.category}</td>
                    <td style={{ padding: '8px', textAlign: 'right', color: '#166534', fontWeight: 600 }}>{formatCurrency(item.amount)}</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>{item.percentage.toFixed(1)}%</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>{item.count} items</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* 4. Expense Summary */}
        <div className="print-section" style={{ marginBottom: '30px', pageBreakInside: 'avoid' }}>
          <h3 style={{ fontSize: '12pt', borderBottom: '1px solid #ddd', paddingBottom: '6px', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
            III. Capital Outflow Analysis (Expense Categories)
          </h3>
          {expenseCategories.length === 0 ? (
            <p style={{ fontSize: '9.5pt', fontStyle: 'italic', color: '#666' }}>No capital outflows recorded during this statement period.</p>
          ) : (
            <table className="print-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9.5pt' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #333' }}>
                  <th style={{ padding: '8px', textAlign: 'left', fontWeight: 700 }}>Expense Category</th>
                  <th style={{ padding: '8px', textAlign: 'right', fontWeight: 700 }}>Total Outflow</th>
                  <th style={{ padding: '8px', textAlign: 'right', fontWeight: 700 }}>Percentage Allocation</th>
                  <th style={{ padding: '8px', textAlign: 'right', fontWeight: 700 }}>Record Counts</th>
                </tr>
              </thead>
              <tbody>
                {expenseCategories.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '8px', fontWeight: 700 }}>{item.category}</td>
                    <td style={{ padding: '8px', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(item.amount)}</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>{item.percentage.toFixed(1)}%</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>{item.count} items</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* 5. Top Spending Categories */}
        <div className="print-section" style={{ marginBottom: '30px', pageBreakInside: 'avoid' }}>
          <h3 style={{ fontSize: '12pt', borderBottom: '1px solid #ddd', paddingBottom: '6px', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
            IV. Top Spending Categories Leaderboard
          </h3>
          {expenseCategories.length === 0 ? (
            <p style={{ fontSize: '9.5pt', fontStyle: 'italic', color: '#666' }}>No expense records logged.</p>
          ) : (
            <table className="print-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9.5pt' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #333' }}>
                  <th style={{ padding: '8px', textAlign: 'left', fontWeight: 700, width: '60px' }}>Rank</th>
                  <th style={{ padding: '8px', textAlign: 'left', fontWeight: 700 }}>Category Name</th>
                  <th style={{ padding: '8px', textAlign: 'right', fontWeight: 700 }}>Amount Spent</th>
                  <th style={{ padding: '8px', textAlign: 'right', fontWeight: 700 }}>Percentage of Outflows</th>
                </tr>
              </thead>
              <tbody>
                {expenseCategories.slice(0, 5).map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '8px' }}>#{idx + 1}</td>
                    <td style={{ padding: '8px', fontWeight: 700 }}>{item.category}</td>
                    <td style={{ padding: '8px', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(item.amount)}</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>{item.percentage.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* 6. Budget Summary */}
        <div className="print-section" style={{ marginBottom: '30px', pageBreakInside: 'avoid' }}>
          <h3 style={{ fontSize: '12pt', borderBottom: '1px solid #ddd', paddingBottom: '6px', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
            V. Budget Threshold & Compliance Summary
          </h3>
          {printBudgetsSummary.length === 0 ? (
            <p style={{ fontSize: '9.5pt', fontStyle: 'italic', color: '#666' }}>No active category budgets defined.</p>
          ) : (
            <table className="print-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9.5pt' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #333' }}>
                  <th style={{ padding: '8px', textAlign: 'left', fontWeight: 700 }}>Budgeted Category</th>
                  <th style={{ padding: '8px', textAlign: 'right', fontWeight: 700 }}>Allocated Limit</th>
                  <th style={{ padding: '8px', textAlign: 'right', fontWeight: 700 }}>Actual Spent</th>
                  <th style={{ padding: '8px', textAlign: 'right', fontWeight: 700 }}>Remaining Balance</th>
                  <th style={{ padding: '8px', textAlign: 'right', fontWeight: 700 }}>Utilization Rate</th>
                </tr>
              </thead>
              <tbody>
                {printBudgetsSummary.map((b, idx) => {
                  const isOver = b.spent > b.allocated;
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '8px', fontWeight: 700 }}>{b.category}</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>{formatCurrency(b.allocated)}</td>
                      <td style={{ padding: '8px', textAlign: 'right', fontWeight: 600, color: isOver ? '#991b1b' : '#000000' }}>
                        {formatCurrency(b.spent)}
                      </td>
                      <td style={{ padding: '8px', textAlign: 'right', color: b.remaining >= 0 ? '#166534' : '#991b1b' }}>
                        {formatCurrency(b.remaining)}
                      </td>
                      <td style={{ padding: '8px', textAlign: 'right', fontWeight: 700, color: isOver ? '#991b1b' : b.utilization >= 80 ? '#b45309' : '#166534' }}>
                        {b.utilization.toFixed(0)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* 7. Analytics Section */}
        <div className="print-section" style={{ marginBottom: '30px', pageBreakInside: 'avoid' }}>
          <h3 style={{ fontSize: '12pt', borderBottom: '1px solid #ddd', paddingBottom: '6px', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
            VI. Financial Health & Structural Diagnostics
          </h3>
          <div style={{ border: '1px solid #ccc', borderRadius: '6px', padding: '16px', marginBottom: '16px', display: 'flex', justifyContent: 'space-around', alignSelf: 'center', alignItems: 'center', backgroundColor: '#fafafa' }}>
            <div style={{ textAlign: 'center', padding: '0 24px' }}>
              <span style={{ fontSize: '9pt', color: '#666', display: 'block', marginBottom: '4px' }}>Financial Health Score</span>
              <span style={{ fontSize: '24pt', fontWeight: 800, color: '#2e5bff' }}>{healthScore} / 100</span>
            </div>
            <div style={{ borderLeft: '1px solid #ddd', height: '50px' }}></div>
            <div style={{ textAlign: 'center', padding: '0 24px' }}>
              <span style={{ fontSize: '9pt', color: '#666', display: 'block', marginBottom: '4px' }}>Spending Efficiency Grade</span>
              <span style={{ fontSize: '24pt', fontWeight: 800, color: efficiencyGrade.startsWith('A') ? '#166534' : '#000000' }}>{efficiencyGrade}</span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '9.5pt' }}>
            <div style={{ border: '1px solid #ddd', borderRadius: '6px', padding: '12px' }}>
              <strong style={{ display: 'block', marginBottom: '8px', borderBottom: '1px solid #eee', paddingBottom: '4px', color: '#166534' }}>Inflow (Income) Analysis</strong>
              <p style={{ margin: '4px 0' }}>• Primary Earnings Sector: <strong>{incomeCategories.length > 0 ? incomeCategories[0].category : 'None'}</strong></p>
              <p style={{ margin: '4px 0' }}>• Peak Source Total: <strong>{incomeCategories.length > 0 ? formatCurrency(incomeCategories[0].amount) : '₹0'}</strong></p>
              <p style={{ margin: '4px 0' }}>• Active Income Categories: <strong>{incomeCategories.length}</strong> streams</p>
            </div>
            <div style={{ border: '1px solid #ddd', borderRadius: '6px', padding: '12px' }}>
              <strong style={{ display: 'block', marginBottom: '8px', borderBottom: '1px solid #eee', paddingBottom: '4px', color: '#991b1b' }}>Outflow (Expense) Analysis</strong>
              <p style={{ margin: '4px 0' }}>• Primary Expense Sector: <strong>{expenseCategories.length > 0 ? expenseCategories[0].category : 'None'}</strong></p>
              <p style={{ margin: '4px 0' }}>• Peak Expense Total: <strong>{expenseCategories.length > 0 ? formatCurrency(expenseCategories[0].amount) : '₹0'}</strong></p>
              <p style={{ margin: '4px 0' }}>• Active Expense Categories: <strong>{expenseCategories.length}</strong> sectors</p>
            </div>
          </div>
        </div>

        {/* 8. Transaction Summary */}
        <div className="print-section" style={{ marginBottom: '30px', pageBreakInside: 'avoid' }}>
          <h3 style={{ fontSize: '12pt', borderBottom: '1px solid #ddd', paddingBottom: '6px', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
            VII. Transaction Volume Summary
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', fontSize: '9.5pt' }}>
            <div style={{ border: '1px solid #ddd', borderRadius: '6px', padding: '10px', textAlign: 'center' }}>
              <span style={{ color: '#666', display: 'block', fontSize: '8pt', textTransform: 'uppercase', marginBottom: '2px' }}>Total Entries Logged</span>
              <span style={{ fontSize: '12pt', fontWeight: 700 }}>{totalCount} records</span>
            </div>
            <div style={{ border: '1px solid #ddd', borderRadius: '6px', padding: '10px', textAlign: 'center' }}>
              <span style={{ color: '#666', display: 'block', fontSize: '8pt', textTransform: 'uppercase', marginBottom: '2px' }}>Income Entries</span>
              <span style={{ fontSize: '12pt', fontWeight: 700, color: '#166534' }}>{incomeCount} items</span>
            </div>
            <div style={{ border: '1px solid #ddd', borderRadius: '6px', padding: '10px', textAlign: 'center' }}>
              <span style={{ color: '#666', display: 'block', fontSize: '8pt', textTransform: 'uppercase', marginBottom: '2px' }}>Expense Entries</span>
              <span style={{ fontSize: '12pt', fontWeight: 700, color: '#991b1b' }}>{expenseCount} items</span>
            </div>
          </div>
        </div>

        {/* 9. Insights Section */}
        <div className="print-section" style={{ marginBottom: '30px', pageBreakInside: 'avoid' }}>
          <h3 style={{ fontSize: '12pt', borderBottom: '1px solid #ddd', paddingBottom: '6px', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
            VIII. Intelligent Financial Insights
          </h3>
          {insights.length === 0 ? (
            <p style={{ fontSize: '9.5pt', fontStyle: 'italic', color: '#666' }}>No specific anomalies detected. Expense ratios are within normal limits.</p>
          ) : (
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '9.5pt', lineHeight: 1.6 }}>
              {insights.map((insight, idx) => (
                <li key={idx} style={{ marginBottom: '8px' }}>
                  <strong>{insight.type === 'warning' ? '⚠️ Warning: ' : '• Info: '}</strong>
                  {insight.text}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 10. Footer */}
        <div className="print-footer">
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <span>Report Audit Log: {new Date().toLocaleString()}</span>
            <span>FinLux Premium Expense Dashboard</span>
            <span className="page-number-placeholder">Page 1</span>
          </div>
        </div>
      </div>

      <style>{`
        .report-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.95rem;
          color: var(--text-secondary);
        }
        .print-only-container {
          display: none !important;
        }
        @media print {
          html, body, #root, .app-container, .main-content, main, .reports-page-container {
            display: block !important;
            position: static !important;
            width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            overflow: visible !important;
            margin: 0 !important;
            padding: 0 !important;
            background-color: #ffffff !important;
            background: #ffffff !important;
            color: #000000 !important;
            box-shadow: none !important;
          }
          .sidebar, .chatbot-sidebar, .no-print, header, .pagination-controls, .btn, .mobile-hamburger {
            display: none !important;
          }
          .card {
            border: none !important;
            background: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin-bottom: 20px;
            display: block !important;
            overflow: visible !important;
            height: auto !important;
          }
          .print-only-container {
            display: block !important;
            width: 100% !important;
            height: auto !important;
            background: #ffffff !important;
            color: #000000 !important;
            overflow: visible !important;
            padding: 10mm 0 !important;
          }
          .print-table {
            width: 100% !important;
            border-collapse: collapse !important;
            margin-bottom: 20px !important;
            overflow: visible !important;
          }
          .print-table th {
            background-color: #f3f4f6 !important;
            color: #000000 !important;
            border-bottom: 2px solid #000000 !important;
            padding: 8px !important;
            font-size: 9.5pt !important;
            font-weight: 700 !important;
          }
          .print-table td {
            border-bottom: 1px solid #e5e7eb !important;
            color: #000000 !important;
            padding: 8px !important;
            font-size: 9.5pt !important;
          }
          .print-footer {
            display: flex !important;
            position: fixed !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            border-top: 1px solid #cccccc !important;
            padding-top: 8px !important;
            font-size: 8pt !important;
            color: #666666 !important;
          }
        }
      `}</style>
    </div>
  );
};
