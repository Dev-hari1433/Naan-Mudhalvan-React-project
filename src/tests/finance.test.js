import { 
  calculateTotalIncome, 
  calculateTotalExpenses, 
  calculateBalance, 
  calculateSavingsRate, 
  calculateBudgetUtilization,
  aggregateByCategory,
  calculateTimeBasedAnalytics,
  calculateFinancialHealthScore,
  calculateSpendingEfficiencyGrade
} from '../utils/finance.js';
import { formatIndianRupee } from '../utils/formatters.js';

// Setup Mock Data
const mockTransactions = [
  { id: '1', type: 'income', amount: 5000, category: 'Salary', date: '2026-06-01', description: 'Regular salary' },
  { id: '2', type: 'income', amount: 1000, category: 'Freelance', date: '2026-06-10', description: 'Consulting gig' },
  { id: '3', type: 'expense', amount: 1500, category: 'Rent', date: '2026-06-02', description: 'Apartment rent' },
  { id: '4', type: 'expense', amount: 300, category: 'Food', date: '2026-06-05', description: 'Weekly groceries' },
  { id: '5', type: 'expense', amount: 120, category: 'Food', date: '2026-06-08', description: 'Dinner out' },
  { id: '6', type: 'expense', amount: 80, category: 'Transportation', date: '2026-06-12', description: 'Fuel fillup' }
];

const mockBudgets = [
  { id: 'b1', category: 'Food', amount: 500, period: 'monthly' },
  { id: 'b2', category: 'Rent', amount: 1200, period: 'monthly' }
];

// Reusable assert helper
const assert = (condition, message) => {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
};

export const runTestsSuite = () => {
  const results = [];

  const runTest = (name, testFn) => {
    try {
      testFn();
      results.push({ name, passed: true });
    } catch (err) {
      results.push({ name, passed: false, error: err.message });
    }
  };

  // 1. Balance calculations test
  runTest('Balance Calculations', () => {
    const income = calculateTotalIncome(mockTransactions);
    const expenses = calculateTotalExpenses(mockTransactions);
    const balance = calculateBalance(mockTransactions);

    assert(income === 6000, `Expected total income 6000, got ${income}`);
    assert(expenses === 2000, `Expected total expenses 2000, got ${expenses}`);
    assert(balance === 4000, `Expected balance 4000, got ${balance}`);
  });

  // 2. Savings rate calculations test (with income = 0 check)
  runTest('Savings Rate Calculations', () => {
    const rate = calculateSavingsRate(mockTransactions);
    assert(Math.abs(rate - 66.666) < 0.01, `Expected savings rate ~66.67%, got ${rate}%`);

    // Zero income edge case
    const zeroRate = calculateSavingsRate([{ type: 'expense', amount: 100, category: 'Food', date: '2026-06-01' }]);
    assert(zeroRate === 0, `Expected 0% savings rate for 0 income, got ${zeroRate}%`);
  });

  // 3. Budget utilization & alert notifications tests
  runTest('Budget Calculations & Alerts', () => {
    const foodBudget = mockBudgets[0]; // limit 500
    const rentBudget = mockBudgets[1]; // limit 1200

    const foodUtil = calculateBudgetUtilization(foodBudget, mockTransactions);
    const rentUtil = calculateBudgetUtilization(rentBudget, mockTransactions);

    // Spent on Food: 300 + 120 = 420
    assert(foodUtil.spent === 420, `Expected food spent 420, got ${foodUtil.spent}`);
    assert(foodUtil.utilization === 84, `Expected food utilization 84%, got ${foodUtil.utilization}%`);
    assert(foodUtil.isWarning === true, 'Expected warning alert for 84% utilization');
    assert(foodUtil.isExceeded === false, 'Expected exceeded alert to be false for 84% utilization');

    // Spent on Rent: 1500 (exceeded limit 1200)
    assert(rentUtil.spent === 1500, `Expected rent spent 1500, got ${rentUtil.spent}`);
    assert(rentUtil.isExceeded === true, 'Expected exceeded alert to be true for rent spending');
  });

  // 4. Analytics category aggregation and percentage calculations tests
  runTest('Analytics Category Aggregation', () => {
    const expenseAgg = aggregateByCategory(mockTransactions, 'expense');
    
    // Rent should be top spending category
    assert(expenseAgg[0].category === 'Rent', `Expected Rent to be rank #1 category, got ${expenseAgg[0].category}`);
    assert(expenseAgg[0].amount === 1500, `Expected Rent amount 1500, got ${expenseAgg[0].amount}`);
    assert(expenseAgg[0].percentage === 75, `Expected Rent percentage 75%, got ${expenseAgg[0].percentage}%`);

    // Food should be rank #2 category
    assert(expenseAgg[1].category === 'Food', `Expected Food to be rank #2, got ${expenseAgg[1].category}`);
    assert(expenseAgg[1].amount === 420, `Expected Food amount 420, got ${expenseAgg[1].amount}`);
    assert(expenseAgg[1].percentage === 21, `Expected Food percentage 21%, got ${expenseAgg[1].percentage}%`);
    assert(expenseAgg[1].count === 2, `Expected Food count 2, got ${expenseAgg[1].count}`);
  });

  // 5. Transaction Filter & Search Logic emulation tests
  runTest('Transaction Filter & Search Logic', () => {
    // Emulate search query for "salary"
    const salaryMatches = mockTransactions.filter(t => 
      t.description.toLowerCase().includes('salary') || t.category.toLowerCase().includes('salary')
    );
    assert(salaryMatches.length === 1, `Expected 1 match for "salary" query, got ${salaryMatches.length}`);

    // Emulate filter by type: expense
    const expenseMatches = mockTransactions.filter(t => t.type === 'expense');
    assert(expenseMatches.length === 4, `Expected 4 expense transactions, got ${expenseMatches.length}`);

    // Emulate date range filter
    const dateMatches = mockTransactions.filter(t => t.date >= '2026-06-05' && t.date <= '2026-06-11');
    assert(dateMatches.length === 3, `Expected 3 transactions in date range, got ${dateMatches.length}`);
  });

  // 6. Time-based data trends tests
  runTest('Time-based Trends Aggregation', () => {
    const monthlyTrends = calculateTimeBasedAnalytics(mockTransactions, 'monthly');
    assert(monthlyTrends.length === 1, `Expected 1 monthly aggregate block, got ${monthlyTrends.length}`);
    assert(monthlyTrends[0].key === '2026-06', `Expected month key "2026-06", got "${monthlyTrends[0].key}"`);
    assert(monthlyTrends[0].income === 6000, `Expected monthly income 6000, got ${monthlyTrends[0].income}`);
    assert(monthlyTrends[0].expense === 2000, `Expected monthly expense 2000, got ${monthlyTrends[0].expense}`);
    assert(monthlyTrends[0].balance === 4000, `Expected monthly balance 4000, got ${monthlyTrends[0].balance}`);
  });

  // 7. Indian Rupee formatting tests
  runTest('Indian Rupee Formatting', () => {
    assert(formatIndianRupee(500) === '₹500', `Expected ₹500, got ${formatIndianRupee(500)}`);
    assert(formatIndianRupee(1000) === '₹1,000', `Expected ₹1,000, got ${formatIndianRupee(1000)}`);
    assert(formatIndianRupee(100000) === '₹1,00,000', `Expected ₹1,00,000, got ${formatIndianRupee(100000)}`);
    assert(formatIndianRupee(10000000) === '₹1,00,00,000', `Expected ₹1,00,00,000, got ${formatIndianRupee(10000000)}`);
    assert(formatIndianRupee(-4500.5) === '-₹4,500.50', `Expected -₹4,500.50, got ${formatIndianRupee(-4500.5)}`);
  });

  // 8. Financial Health Score & Spending Efficiency Grade tests
  runTest('Health Score & Spending Grade', () => {
    const score = calculateFinancialHealthScore(mockTransactions, mockBudgets);
    assert(score === 80, `Expected Health Score 80, got ${score}`);
    
    const grade = calculateSpendingEfficiencyGrade(mockTransactions, mockBudgets);
    assert(grade === 'A', `Expected Grade "A", got "${grade}"`);
    
    // Empty check
    const emptyScore = calculateFinancialHealthScore([], []);
    assert(emptyScore === 0, `Expected 0 score for empty records, got ${emptyScore}`);
    const emptyGrade = calculateSpendingEfficiencyGrade([], []);
    assert(emptyGrade === 'N/A', `Expected "N/A" grade for empty records, got "${emptyGrade}"`);
  });

  return results;
};
