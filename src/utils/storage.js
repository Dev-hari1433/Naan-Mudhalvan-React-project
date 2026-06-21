// LocalStorage keys
const KEYS = {
  TRANSACTIONS: 'premium_fintech_transactions',
  BUDGETS: 'premium_fintech_budgets',
  CATEGORIES: 'premium_fintech_categories',
  SETTINGS: 'premium_fintech_settings',
};

// Predefined Income Categories
export const DEFAULT_INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Business',
  'Investments',
  'Bonus',
  'Gifts',
  'Other'
];

// Predefined Expense Categories
export const DEFAULT_EXPENSE_CATEGORIES = [
  'Food',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Utilities',
  'Healthcare',
  'Education',
  'Rent',
  'Travel',
  'Insurance',
  'Personal Care',
  'Other'
];

// Default Settings
export const DEFAULT_SETTINGS = {
  currency: 'INR', // Locked to INR (₹)
  dateFormat: 'YYYY-MM-DD', // YYYY-MM-DD, DD-MM-YYYY, MM/DD/YYYY
  theme: 'dark', // light, dark
  defaultView: 'Dashboard', // Dashboard, Transactions, Analytics, Budgets
  notificationsEnabled: true,
};

export const loadState = () => {
  try {
    const transactionsJson = localStorage.getItem(KEYS.TRANSACTIONS);
    const budgetsJson = localStorage.getItem(KEYS.BUDGETS);
    const categoriesJson = localStorage.getItem(KEYS.CATEGORIES);
    const settingsJson = localStorage.getItem(KEYS.SETTINGS);

    let transactions = transactionsJson ? JSON.parse(transactionsJson) : null;
    let budgets = budgetsJson ? JSON.parse(budgetsJson) : null;
    let categories = categoriesJson ? JSON.parse(categoriesJson) : null;
    let settings = settingsJson ? JSON.parse(settingsJson) : null;

    // Initialize default categories if none exist
    if (!categories) {
      categories = {
        income: [...DEFAULT_INCOME_CATEGORIES],
        expense: [...DEFAULT_EXPENSE_CATEGORIES]
      };
      localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(categories));
    }

    // Initialize default settings if none exist
    if (!settings) {
      settings = { ...DEFAULT_SETTINGS };
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    }

    // A brand new clean state: 0 preloaded transactions, 0 budgets
    if (transactions === null) {
      transactions = [];
      localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
    }
    if (budgets === null) {
      budgets = [];
      localStorage.setItem(KEYS.BUDGETS, JSON.stringify(budgets));
    }

    return { transactions, budgets, categories, settings };
  } catch (error) {
    console.error('Error loading localStorage state:', error);
    return {
      transactions: [],
      budgets: [],
      categories: { income: [...DEFAULT_INCOME_CATEGORIES], expense: [...DEFAULT_EXPENSE_CATEGORIES] },
      settings: { ...DEFAULT_SETTINGS }
    };
  }
};

export const saveTransactions = (transactions) => {
  try {
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
  } catch (error) {
    console.error('Error saving transactions:', error);
  }
};

export const saveBudgets = (budgets) => {
  try {
    localStorage.setItem(KEYS.BUDGETS, JSON.stringify(budgets));
  } catch (error) {
    console.error('Error saving budgets:', error);
  }
};

export const saveCategories = (categories) => {
  try {
    localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(categories));
  } catch (error) {
    console.error('Error saving categories:', error);
  }
};

export const saveSettings = (settings) => {
  try {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
};
