/**
 * Calculates financial statistics for a set of transactions.
 */

// Calculate total income from transactions
export const calculateTotalIncome = (transactions) => {
  return transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
};

// Calculate total expenses from transactions
export const calculateTotalExpenses = (transactions) => {
  return transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
};

// Calculate current balance (Income - Expenses)
export const calculateBalance = (transactions) => {
  const income = calculateTotalIncome(transactions);
  const expenses = calculateTotalExpenses(transactions);
  return income - expenses;
};

// Calculate savings rate: ((Income - Expenses) / Income) * 100
// Defaults to 0 if Income is 0
export const calculateSavingsRate = (transactions) => {
  const income = calculateTotalIncome(transactions);
  if (income <= 0) return 0;
  const expenses = calculateTotalExpenses(transactions);
  const rate = ((income - expenses) / income) * 100;
  return Math.max(0, rate); // Avoid negative savings rates in standard UI display
};

// Calculate total spent for a specific category within a set of transactions
export const calculateCategorySpent = (transactions, category) => {
  return transactions
    .filter(t => t.type === 'expense' && t.category === category)
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
};

// Calculate budget utilization details
export const calculateBudgetUtilization = (budget, transactions) => {
  const spent = calculateCategorySpent(transactions, budget.category);
  const limit = Number(budget.amount || 0);
  const remaining = limit - spent;
  const utilization = limit > 0 ? (spent / limit) * 100 : 0;
  
  return {
    allocated: limit,
    spent,
    remaining,
    utilization,
    isWarning: utilization >= 80 && utilization < 100,
    isExceeded: utilization >= 100
  };
};

// Aggregate transaction amounts by category
export const aggregateByCategory = (transactions, type) => {
  const filtered = transactions.filter(t => t.type === type);
  const totals = {};
  
  filtered.forEach(t => {
    totals[t.category] = (totals[t.category] || 0) + Number(t.amount || 0);
  });
  
  const totalAmount = filtered.reduce((sum, t) => sum + Number(t.amount || 0), 0);
  
  return Object.keys(totals).map(category => {
    const amount = totals[category];
    const percentage = totalAmount > 0 ? (amount / totalAmount) * 100 : 0;
    const count = filtered.filter(t => t.category === category).length;
    
    return {
      category,
      amount,
      percentage,
      count
    };
  }).sort((a, b) => b.amount - a.amount);
};

// Get the date of a transaction parsed into a week string (YYYY-[W]WW)
const getWeekNumber = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getFullYear()}-W${String(weekNo).padStart(2, '0')}`;
};

// Aggregate transactions into time-based groups
export const calculateTimeBasedAnalytics = (transactions, period) => {
  const groups = {};

  transactions.forEach(t => {
    let key = '';
    const dateObj = new Date(t.date);
    if (isNaN(dateObj.getTime())) return;

    if (period === 'daily') {
      key = t.date; // YYYY-MM-DD
    } else if (period === 'weekly') {
      key = getWeekNumber(t.date);
    } else if (period === 'monthly') {
      key = t.date.substring(0, 7); // YYYY-MM
    } else if (period === 'yearly') {
      key = t.date.substring(0, 4); // YYYY
    }

    if (!groups[key]) {
      groups[key] = { key, income: 0, expense: 0, balance: 0 };
    }

    if (t.type === 'income') {
      groups[key].income += Number(t.amount || 0);
    } else {
      groups[key].expense += Number(t.amount || 0);
    }
    groups[key].balance = groups[key].income - groups[key].expense;
  });

  return Object.values(groups).sort((a, b) => a.key.localeCompare(b.key));
};

/**
 * Calculates a Financial Health Score (0 to 100) based on savings, budgets, and cash flow.
 * Returns 0 if there are no transactions.
 */
export const calculateFinancialHealthScore = (transactions, budgets) => {
  if (!transactions || transactions.length === 0) return 0;

  const income = calculateTotalIncome(transactions);
  const expenses = calculateTotalExpenses(transactions);

  // If there are expenses but zero income, score is 0
  if (income === 0 && expenses > 0) return 0;
  if (income === 0 && expenses === 0) return 100;

  let score = 100;

  // 1. Savings Rate Metric (up to 40 points deduction)
  const savingsRate = calculateSavingsRate(transactions);
  if (savingsRate >= 30) {
    // Healthy: no deduction
  } else if (savingsRate >= 20) {
    score -= 10;
  } else if (savingsRate >= 10) {
    score -= 20;
  } else if (savingsRate > 0) {
    score -= 30;
  } else {
    score -= 40;
  }

  // 2. Exceeded budgets metric (15 pts deduction per exceeded budget, 5 pts per warning budget)
  if (budgets && budgets.length > 0) {
    budgets.forEach(b => {
      const util = calculateBudgetUtilization(b, transactions);
      if (util.isExceeded) {
        score -= 15;
      } else if (util.isWarning) {
        score -= 5;
      }
    });
  }

  // 3. Cash flow warning (30 pts deduction if expenses exceed earnings)
  if (expenses > income) {
    score -= 30;
  }

  return Math.max(0, Math.min(100, score));
};

/**
 * Maps a Financial Health Score to a Spending Efficiency Grade (A+, A, B, C, D, F)
 */
export const calculateSpendingEfficiencyGrade = (transactions, budgets) => {
  if (!transactions || transactions.length === 0) return 'N/A';
  
  const score = calculateFinancialHealthScore(transactions, budgets);
  
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 50) return 'C';
  if (score >= 35) return 'D';
  return 'F';
};
