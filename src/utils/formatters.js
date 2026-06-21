/**
 * Formats a currency amount into Indian Rupees (INR) with Lakh/Crore grouping.
 * Examples:
 * 500 -> ₹500
 * 1000 -> ₹1,000
 * 100000 -> ₹1,00,000
 * 10000000 -> ₹1,00,00,000
 */
export const formatIndianRupee = (amount) => {
  const num = Number(amount || 0);
  const isNegative = num < 0;
  const absoluteNum = Math.abs(num);
  
  // Decide whether to show decimal digits (show only if fractional part exists)
  const hasDecimals = absoluteNum % 1 !== 0;
  const rounded = absoluteNum.toFixed(hasDecimals ? 2 : 0);
  
  const parts = rounded.split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1];

  let lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);
  
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  
  // Group other numbers by 2 digits
  const formattedOther = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  const finalInteger = formattedOther + lastThree;
  
  const suffix = hasDecimals ? `.${decimalPart}` : '';
  return `${isNegative ? '-' : ''}₹${finalInteger}${suffix}`;
};

// Aliased formatCurrency to direct to Indian Rupee formatting globally
export const formatCurrency = (amount) => {
  return formatIndianRupee(amount);
};

/**
 * Format date string (YYYY-MM-DD) based on selected date format setting
 */
export const formatDate = (dateString, format = 'YYYY-MM-DD') => {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;

  const [year, month, day] = parts;

  switch (format) {
    case 'DD-MM-YYYY':
      return `${day}-${month}-${year}`;
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;
    case 'YYYY-MM-DD':
    default:
      return `${year}-${month}-${day}`;
  }
};
