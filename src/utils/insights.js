import { 
  calculateTotalIncome, 
  calculateTotalExpenses, 
  calculateSavingsRate, 
  aggregateByCategory 
} from './finance.js';

/**
 * Evaluates transaction logs and outputs financial insights.
 * Returns an empty array if no transactions are recorded to preserve clean initial states.
 */
export const generateFinancialInsights = (transactions) => {
  const insights = [];

  if (!transactions || transactions.length === 0) {
    return []; // Return completely clean state
  }

  const income = calculateTotalIncome(transactions);
  const expenses = calculateTotalExpenses(transactions);
  
  if (expenses === 0) {
    // Return empty list of insights if no expenses exist yet
    return [];
  }

  // 1. Alert if expenses exceed income
  if (expenses > income) {
    insights.push({
      id: 'expenses-exceed',
      type: 'warning',
      text: 'Your overall expenses exceed your income. Consider looking into discretionary costs.'
    });
  }

  // Aggregate categories
  const expenseCategories = aggregateByCategory(transactions, 'expense');

  if (expenseCategories.length > 0) {
    // 2. Alert if Food spending is > 30% of total expenses
    const foodCat = expenseCategories.find(c => c.category === 'Food');
    if (foodCat && foodCat.percentage > 30) {
      insights.push({
        id: 'food-high',
        type: 'warning',
        text: `Food expenses account for ${foodCat.percentage.toFixed(0)}% of your spending, exceeding the recommended 30% cap.`
      });
    }

    // 3. Category dominates spending (any category > 50% of total expenses)
    const dominantCat = expenseCategories.find(c => c.percentage > 50);
    if (dominantCat) {
      insights.push({
        id: 'dominant-category',
        type: 'info',
        text: `Your spending is highly concentrated in "${dominantCat.category}" (${dominantCat.percentage.toFixed(0)}% of total outflows).`
      });
    }
  }

  // 4. Savings rate trend comparison
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthStr = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;

  const currentMonthTransactions = transactions.filter(t => t.date.startsWith(currentMonthStr));
  const prevMonthTransactions = transactions.filter(t => t.date.startsWith(prevMonthStr));

  if (currentMonthTransactions.length > 0 && prevMonthTransactions.length > 0) {
    const currentSavingsRate = calculateSavingsRate(currentMonthTransactions);
    const prevSavingsRate = calculateSavingsRate(prevMonthTransactions);

    if (currentSavingsRate > prevSavingsRate + 2) {
      insights.push({
        id: 'savings-improving',
        type: 'success',
        text: `Your savings rate improved by ${(currentSavingsRate - prevSavingsRate).toFixed(0)}% compared to last month!`
      });
    } else if (currentSavingsRate < prevSavingsRate - 2) {
      insights.push({
        id: 'savings-declining',
        type: 'warning',
        text: `Your monthly savings rate decreased by ${(prevSavingsRate - currentSavingsRate).toFixed(0)}% compared to the previous month.`
      });
    }
  } else {
    // Fallback basic savings feedback
    const overallSavingsRate = calculateSavingsRate(transactions);
    if (overallSavingsRate >= 20) {
      insights.push({
        id: 'savings-healthy',
        type: 'success',
        text: `Your overall savings rate is healthy at ${overallSavingsRate.toFixed(0)}%.`
      });
    }
  }

  return insights;
};
