import React from 'react';
import { MetricCard } from '../components/MetricCard';
import { SVGLineChart, SVGDonutChart, SVGWormChart, SVGBudgetVsActualChart } from '../components/SVGCharts';
import { Alert } from '../components/Alert';
import { 
  calculateTotalIncome, 
  calculateTotalExpenses, 
  calculateBalance, 
  calculateSavingsRate, 
  aggregateByCategory,
  calculateTimeBasedAnalytics,
  calculateBudgetUtilization,
  calculateFinancialHealthScore,
  calculateSpendingEfficiencyGrade
} from '../utils/finance';
import { formatCurrency, formatDate } from '../utils/formatters';
import { generateFinancialInsights } from '../utils/insights';
import { IncomeIcon, ExpensesIcon, TransactionsIcon, BudgetsIcon, InfoIcon, AlertIcon } from '../components/Icons';

export const Dashboard = ({ transactions = [], budgets = [], settings }) => {
  const dateFormat = settings.dateFormat;

  // 1. Dynamic Greeting based on time of day
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good Morning';
    if (hours < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const hasData = transactions && transactions.length > 0;

  // Basic Metrics
  const totalIncome = calculateTotalIncome(transactions);
  const totalExpenses = calculateTotalExpenses(transactions);
  const currentBalance = calculateBalance(transactions);
  const savingsRate = calculateSavingsRate(transactions);

  // Health Score & Spending Efficiency Grade
  const healthScore = calculateFinancialHealthScore(transactions, budgets);
  const efficiencyGrade = calculateSpendingEfficiencyGrade(transactions, budgets);

  // Highest aggregates
  const expenseCategories = aggregateByCategory(transactions, 'expense');
  const highestExpenseCat = expenseCategories.length > 0 
    ? `${expenseCategories[0].category} (${formatCurrency(expenseCategories[0].amount)})` 
    : 'N/A';

  // Recent timeline transactions (max 5)
  const timelineTransactions = [...transactions]
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))
    .slice(0, 5);

  // Active budget alert flags
  const budgetAlerts = budgets.map(b => {
    const util = calculateBudgetUtilization(b, transactions);
    return { budget: b, util };
  }).filter(alert => alert.util.isWarning || alert.util.isExceeded);

  // Dynamic recommendations
  const insights = generateFinancialInsights(transactions);

  // Trend aggregates
  const trendData = calculateTimeBasedAnalytics(transactions, 'monthly');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Welcome Banner */}
      <div 
        className="card" 
        style={{ 
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.05) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '6px', fontFamily: 'var(--font-display)' }}>
            {getGreeting()}, Investor
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Here is your financial wellness overview. Keep track of cash flows and stay within budgets.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div>
            <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
              Efficiency Grade
            </span>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: efficiencyGrade === 'A+' || efficiencyGrade === 'A' ? 'var(--color-success)' : 'var(--text-primary)' }}>
              {efficiencyGrade}
            </span>
          </div>
        </div>
      </div>

      {/* Real-time Budget Alerts */}
      {budgetAlerts.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {budgetAlerts.map(({ budget, util }, idx) => (
            <Alert 
              key={idx} 
              type={util.isExceeded ? 'danger' : 'warning'}
              message={
                util.isExceeded 
                  ? `Limit Exceeded: The ${budget.period} budget for "${budget.category}" has been breached! (Spent ${formatCurrency(util.spent)} of ${formatCurrency(util.allocated)})`
                  : `Near Limit: The ${budget.period} budget for "${budget.category}" is ${util.utilization.toFixed(0)}% utilized. (Spent ${formatCurrency(util.spent)} of ${formatCurrency(util.allocated)})`
              }
            />
          ))}
        </div>
      )}

      {/* Main Stats Summary Cards */}
      <div className="metrics-grid">
        <MetricCard 
          title="Current Balance" 
          value={formatCurrency(currentBalance)}
          icon={<TransactionsIcon size={22} />}
          type="balance"
          subtitle="Net Disposable Income"
        />
        <MetricCard 
          title="Total Inflow" 
          value={formatCurrency(totalIncome)}
          icon={<IncomeIcon size={22} />}
          type="income"
          subtitle="All Earnings combined"
        />
        <MetricCard 
          title="Total Outflow" 
          value={formatCurrency(totalExpenses)}
          icon={<ExpensesIcon size={22} />}
          type="expense"
          subtitle="All Expenses combined"
        />
        <MetricCard 
          title="Savings Rate" 
          value={`${savingsRate.toFixed(1)}%`}
          icon={<BudgetsIcon size={22} />}
          type="savings"
          subtitle="Income saved ratio"
        />
      </div>

      {/* Financial Health Score & Spending Efficiency row */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: '1.2fr 2fr', 
          gap: '24px' 
        }}
        className="dashboard-health-layout"
      >
        {/* Financial Health Meter */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', justifyContent: 'center' }}>
          <h3 style={{ fontSize: '1.05rem' }}>Financial Health Score</h3>
          <div className="health-score-container">
            <div className="health-score-meter">
              <svg width="90" height="90" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="3" />
                <circle 
                  cx="18" 
                  cy="18" 
                  r="15.915" 
                  fill="none" 
                  stroke="url(#health-grad)" 
                  strokeWidth="3.2" 
                  strokeDasharray={`${healthScore} ${100 - healthScore}`}
                  strokeDashoffset="0"
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dasharray 0.8s ease' }}
                />
                <defs>
                  <linearGradient id="health-grad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="health-score-value">{healthScore}</div>
            </div>
            <div>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>
                {healthScore >= 80 ? 'Excellent' : healthScore >= 50 ? 'Stable' : healthScore > 0 ? 'Action Needed' : 'No Data'}
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                {hasData 
                  ? 'Based on your savings rate, cash flows, and budget compliance.' 
                  : 'Start adding transactions to compute score.'}
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Overview Cards */}
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
            gap: '20px' 
          }}
        >
          <div className="card" style={{ padding: '18px 24px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
              Peak Expense Sector
            </span>
            <h3 style={{ fontSize: '1.25rem', marginTop: '6px', color: 'var(--text-primary)' }}>
              {highestExpenseCat}
            </h3>
          </div>
          <div className="card" style={{ padding: '18px 24px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
              Database Transactions
            </span>
            <h3 style={{ fontSize: '1.25rem', marginTop: '6px', color: 'var(--text-primary)' }}>
              {transactions.length} records logged
            </h3>
          </div>
        </div>
      </div>

      {/* Charts & Graphs Row (Only rendered if user has recorded data) */}
      {!hasData ? (
        <div className="card empty-state">
          <InfoIcon className="empty-state-icon" />
          <h3>No Financial History Recorded</h3>
          <p>This application is in a clean initial state. Start by logging an income or expense in the Transactions tab to generate insights.</p>
        </div>
      ) : (
        <>
          {/* Visual Charts */}
          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: '2fr 1.2fr', 
              gap: '24px',
              marginBottom: '24px'
            }}
            className="charts-layout-grid"
          >
            <div className="card">
              <h3 style={{ marginBottom: '18px', fontSize: '1.05rem' }}>Inflows vs Outflows Cashflow Trend</h3>
              <SVGLineChart data={trendData} />
            </div>
            
            <div className="card">
              <h3 style={{ marginBottom: '18px', fontSize: '1.05rem' }}>Outflow Sectors</h3>
              <SVGDonutChart data={expenseCategories} />
            </div>
          </div>

          {/* Advanced Charts Row */}
          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: '1.2fr 2fr', 
              gap: '24px',
              marginBottom: '24px'
            }}
            className="charts-layout-grid"
          >
            <div className="card">
              <h3 style={{ marginBottom: '18px', fontSize: '1.05rem' }}>Budget vs Actual Category Spent</h3>
              <SVGBudgetVsActualChart budgets={budgets} transactions={transactions} />
            </div>
            
            <div className="card">
              <h3 style={{ marginBottom: '18px', fontSize: '1.05rem' }}>Cumulative Cashflow Progression (Worm Chart)</h3>
              <SVGWormChart data={trendData} />
            </div>
          </div>

          {/* Bottom Row: Recent Timeline + Smart Insights */}
          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '24px' 
            }}
            className="dashboard-bottom-grid"
          >
            {/* Recent Timeline */}
            <div className="card">
              <h3 style={{ marginBottom: '18px', fontSize: '1.05rem' }}>Activity Feed</h3>
              <div className="timeline">
                {timelineTransactions.map((tx, idx) => (
                  <div key={tx.id || idx} className="timeline-item">
                    <span className={`timeline-marker ${tx.type}`} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ display: 'block', fontSize: '0.9rem' }}>{tx.category}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {formatDate(tx.date, dateFormat)} - {tx.description}
                        </span>
                      </div>
                      <span style={{ 
                        fontWeight: 700, 
                        color: tx.type === 'income' ? 'var(--color-success)' : 'var(--text-primary)' 
                      }}>
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Smart Recommendations */}
            <div className="card">
              <h3 style={{ marginBottom: '18px', fontSize: '1.05rem' }}>Intelligent Recommendations</h3>
              {insights.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  Your spending is currently balanced. Keep maintaining budget boundaries!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {insights.map((insight, idx) => (
                    <div 
                      key={idx} 
                      style={{
                        display: 'flex',
                        gap: '12px',
                        padding: '14px 16px',
                        borderRadius: '10px',
                        backgroundColor: 'var(--bg-input)',
                        border: '1px solid var(--border-color)',
                        fontSize: '0.85rem'
                      }}
                    >
                      <span style={{ 
                        color: insight.type === 'warning' ? 'var(--color-warning)' : insight.type === 'success' ? 'var(--color-success)' : 'var(--color-info)',
                        fontWeight: 'bold',
                        marginTop: '2px'
                      }}>
                        {insight.type === 'warning' ? '⚠️' : '•'}
                      </span>
                      <span style={{ color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        {insight.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <style>{`
        @media (max-width: 900px) {
          .charts-layout-grid,
          .dashboard-health-layout,
          .dashboard-bottom-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
