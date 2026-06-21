import React, { useState } from 'react';
import { 
  aggregateByCategory, 
  calculateTimeBasedAnalytics, 
  calculateTotalIncome, 
  calculateTotalExpenses 
} from '../utils/finance';
import { formatCurrency } from '../utils/formatters';
import { SVGDonutChart, SVGLineChart, SVGBarChart, SVGWormChart } from '../components/SVGCharts';
import { AnalyticsIcon } from '../components/Icons';

export const Analytics = ({ transactions = [], settings }) => {
  // Secondary tab selection
  const [activeSubTab, setActiveSubTab] = useState('distribution');
  // Time period selection
  const [timePeriod, setTimePeriod] = useState('monthly');

  const hasData = transactions && transactions.length > 0;

  // Aggregate stats
  const expenseCategories = aggregateByCategory(transactions, 'expense');
  const incomeCategories = aggregateByCategory(transactions, 'income');
  const totalExpenses = calculateTotalExpenses(transactions);
  const totalIncome = calculateTotalIncome(transactions);

  // Time based aggregates
  const timeData = calculateTimeBasedAnalytics(transactions, timePeriod);

  // Top spending categories (Top 3)
  const topSpending = expenseCategories.slice(0, 3);

  // General empty state fallback
  if (!hasData) {
    return (
      <div className="card empty-state">
        <AnalyticsIcon className="empty-state-icon" />
        <h3>No Analytics Sheet Available</h3>
        <p>Log transactions (income or expenses) to unlock category distributions, comparison charts, and trend metrics.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Sub-tab Navigation */}
      <div 
        style={{ 
          display: 'flex', 
          borderBottom: '1px solid var(--border-color)', 
          gap: '8px',
          paddingBottom: '2px' 
        }}
      >
        <button
          className={`btn ${activeSubTab === 'distribution' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveSubTab('distribution')}
          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
        >
          Expense Distribution
        </button>
        <button
          className={`btn ${activeSubTab === 'income' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveSubTab('income')}
          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
        >
          Income Source Analysis
        </button>
        <button
          className={`btn ${activeSubTab === 'timebased' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveSubTab('timebased')}
          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
        >
          Time-based Cashflows
        </button>
      </div>

      {/* RENDER CHOSEN SHEETS */}

      {/* 1. EXPENSE DISTRIBUTION */}
      {activeSubTab === 'distribution' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: '1.1fr 1.5fr', 
              gap: '24px' 
            }}
            className="analytics-distribution-grid"
          >
            {/* Donut Chart */}
            <div className="card">
              <h3 style={{ marginBottom: '16px', fontSize: '1.05rem' }}>Expense Proportions</h3>
              <SVGDonutChart data={expenseCategories} />
            </div>

            {/* Top Categories Rankings */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h3 style={{ fontSize: '1.05rem' }}>Primary Outflows Leaderboard</h3>
              
              {topSpending.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No expense records logged.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {topSpending.map((item, idx) => (
                    <div 
                      key={idx}
                      style={{
                        padding: '14px 18px',
                        borderRadius: '10px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-input)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <span style={{ 
                          fontSize: '1.1rem', 
                          fontWeight: 800, 
                          color: idx === 0 ? 'var(--color-warning)' : idx === 1 ? 'var(--text-secondary)' : '#b45309' 
                        }}>
                          #{idx + 1}
                        </span>
                        <div>
                          <div style={{ fontWeight: 700 }}>{item.category}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {item.count} items ({item.percentage.toFixed(1)}%)
                          </div>
                        </div>
                      </div>
                      <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>
                        {formatCurrency(item.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Table Breakdown */}
          <div className="card" style={{ padding: 0 }}>
            <h3 style={{ padding: '20px 24px 12px 24px', fontSize: '1.05rem' }}>Category Analysis Grid</h3>
            {expenseCategories.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No expense data logged yet.
              </div>
            ) : (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Expense Category</th>
                      <th>Total Outflow</th>
                      <th>Percentage</th>
                      <th>Item Counts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenseCategories.map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 700 }}>{item.category}</td>
                        <td style={{ fontWeight: 600 }}>{formatCurrency(item.amount)}</td>
                        <td>{item.percentage.toFixed(1)}%</td>
                        <td>{item.count} entries</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. INCOME SOURCE ANALYSIS */}
      {activeSubTab === 'income' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: '1.5fr 1.1fr', 
              gap: '24px' 
            }}
            className="analytics-income-grid"
          >
            {/* Income Comparative Bar chart */}
            <div className="card">
              <h3 style={{ marginBottom: '18px', fontSize: '1.05rem' }}>Income by Category Comparisons</h3>
              <SVGBarChart 
                data={incomeCategories.map(c => ({ label: c.category, amount: c.amount }))} 
                title="Income Sources"
              />
            </div>

            {/* Metrics cards */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ fontSize: '1.05rem' }}>Inflow Aggregates</h3>
              
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Cumulative Earnings
                </span>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-success)', marginTop: '4px' }}>
                  {formatCurrency(totalIncome)}
                </h2>
              </div>

              <hr style={{ border: 0, borderTop: '1px solid var(--border-color)' }} />

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Primary Income Source
                </span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '4px' }}>
                  {incomeCategories.length > 0 ? incomeCategories[0].category : 'None'}
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {incomeCategories.length > 0 
                    ? `Contributes ${incomeCategories[0].percentage.toFixed(1)}% of your total earnings.` 
                    : 'Add income transactions to calculate.'}
                </span>
              </div>
            </div>
          </div>

          {/* Income Grid Table */}
          <div className="card" style={{ padding: 0 }}>
            <h3 style={{ padding: '20px 24px 12px 24px', fontSize: '1.05rem' }}>Income breakdown sheet</h3>
            {incomeCategories.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No income transactions logged.
              </div>
            ) : (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Income Source</th>
                      <th>Total Inflow</th>
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
                        <td>{item.count} entries</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. TIME-BASED CASHFLOWS */}
      {activeSubTab === 'timebased' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Controls */}
          <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ fontSize: '1rem', margin: 0 }}>Breakdown Interval</h3>
            <div style={{ display: 'flex', gap: '6px' }}>
              {['daily', 'weekly', 'monthly', 'yearly'].map((period) => (
                <button
                  key={period}
                  className={`btn btn-sm ${timePeriod === period ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setTimePeriod(period)}
                  style={{ textTransform: 'capitalize' }}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          {/* Line Chart & Worm Chart */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }} className="analytics-time-charts">
            <div className="card">
              <h3 style={{ marginBottom: '18px', fontSize: '1.05rem', textTransform: 'capitalize' }}>
                {timePeriod} Inflow vs Outflow Cashflow Trend
              </h3>
              <SVGLineChart data={timeData} />
            </div>

            <div className="card">
              <h3 style={{ marginBottom: '18px', fontSize: '1.05rem', textTransform: 'capitalize' }}>
                {timePeriod} Cumulative Cashflow Progression (Worm Chart)
              </h3>
              <SVGWormChart data={timeData} />
            </div>
          </div>

          {/* Table list */}
          <div className="card" style={{ padding: 0 }}>
            <h3 style={{ padding: '20px 24px 12px 24px', fontSize: '1.05rem', textTransform: 'capitalize' }}>
              {timePeriod} Statement Summary
            </h3>
            {timeData.length === 0 ? (
              <div className="empty-state">
                <p>No transaction history to calculate intervals.</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th style={{ textTransform: 'capitalize' }}>{timePeriod} Range</th>
                      <th>Total Inflow</th>
                      <th>Total Outflow</th>
                      <th>Net Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...timeData].reverse().map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 700 }}>{item.key}</td>
                        <td style={{ color: 'var(--color-success)', fontWeight: 600 }}>
                          {formatCurrency(item.income)}
                        </td>
                        <td style={{ color: item.expense > 0 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                          {formatCurrency(item.expense)}
                        </td>
                        <td style={{ 
                          fontWeight: 700, 
                          color: item.balance >= 0 ? 'var(--color-success)' : 'var(--color-danger)' 
                        }}>
                          {formatCurrency(item.balance)}
                        </td>
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
        @media (max-width: 860px) {
          .analytics-distribution-grid,
          .analytics-income-grid,
          .analytics-time-charts {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
