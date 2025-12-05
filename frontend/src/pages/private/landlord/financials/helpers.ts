import { startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

export interface Transaction {
  id: string;
  propertyId: string;
  unitId: string | null;
  amount: number;
  description: string;
  date: string;
  type: string;
  category: string | null;
  recurringInterval: string | null;
  createdAt?: string;
  updatedAt?: string;
  property: {
    id: string;
    title: string;
    type: string;
    street: string;
    barangay: string;
    zipCode: string;
    city: { name: string } | null;
    municipality: { name: string } | null;
  };
  unit: {
    id: string;
    label: string;
  } | null;
}

export const DAY_IN_MS = 1000 * 60 * 60 * 24;

export const normalizeDate = (date: Date) => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

export const transactionOccursOnDate = (transaction: Transaction, targetDate: Date) => {
  const transactionDate = normalizeDate(new Date(transaction.date));
  const dateToCheck = normalizeDate(targetDate);
  const today = normalizeDate(new Date());

  if (dateToCheck < transactionDate || dateToCheck > today) return false;

  const interval = transaction.recurringInterval;
  if (!interval || interval === 'NONE') {
    return dateToCheck.getTime() === transactionDate.getTime();
  }

  const diffDays = Math.floor((dateToCheck.getTime() - transactionDate.getTime()) / DAY_IN_MS);

  switch (interval) {
    case 'DAILY':
      return diffDays >= 0;
    case 'WEEKLY':
      return diffDays >= 0 && diffDays % 7 === 0;
    case 'MONTHLY': {
      const diffMonths =
        (dateToCheck.getFullYear() - transactionDate.getFullYear()) * 12 +
        (dateToCheck.getMonth() - transactionDate.getMonth());
      return diffMonths >= 0 && dateToCheck.getDate() === transactionDate.getDate();
    }
    case 'YEARLY':
      return (
        dateToCheck.getFullYear() >= transactionDate.getFullYear() &&
        dateToCheck.getMonth() === transactionDate.getMonth() &&
        dateToCheck.getDate() === transactionDate.getDate()
      );
    default:
      return false;
  }
};

export const recurringOccursInRange = (transaction: Transaction, startRange: Date, endRange: Date) => {
  if (!transaction.recurringInterval) return false;
  const cursor = new Date(startRange);
  while (cursor <= endRange) {
    if (transactionOccursOnDate(transaction, cursor)) {
      return true;
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return false;
};

export const calculateRecurringAmount = (transaction: Transaction): { totalAmount: number; occurrences: number } => {
  if (!transaction.recurringInterval) {
    return { totalAmount: transaction.amount, occurrences: 1 };
  }

  const transactionDate = normalizeDate(new Date(transaction.date));
  const now = normalizeDate(new Date());
  const diffTime = now.getTime() - transactionDate.getTime();

  if (diffTime < 0) {
    return { totalAmount: transaction.amount, occurrences: 1 };
  }

  let occurrences = 1;

  switch (transaction.recurringInterval) {
    case 'DAILY':
      occurrences = Math.floor(diffTime / DAY_IN_MS) + 1;
      break;
    case 'WEEKLY':
      occurrences = Math.floor(diffTime / (DAY_IN_MS * 7)) + 1;
      break;
    case 'MONTHLY': {
      const yearsDiff = now.getFullYear() - transactionDate.getFullYear();
      const monthsDiff = now.getMonth() - transactionDate.getMonth();
      const totalMonths = yearsDiff * 12 + monthsDiff;
      occurrences = totalMonths === 0 ? 1 : totalMonths + 1;
      break;
    }
    case 'YEARLY':
      occurrences = now.getFullYear() - transactionDate.getFullYear() + 1;
      break;
    default:
      return { totalAmount: transaction.amount, occurrences: 1 };
  }

  return { totalAmount: transaction.amount * occurrences, occurrences };
};

export const getDateRange = (
  dateFilter: 'THIS_MONTH' | 'THIS_YEAR' | 'ALL_TIME',
  _customMonth: string,
  _customYear: string
) => {
  if (dateFilter === 'ALL_TIME') return null;

  const now = new Date();
  let startRange: Date | null = null;
  let endRange: Date | null = null;

  switch (dateFilter) {
    case 'THIS_MONTH': {
      startRange = startOfMonth(now);
      endRange = endOfMonth(now);
      break;
    }
    case 'THIS_YEAR': {
      startRange = startOfYear(now);
      endRange = endOfYear(now);
      break;
    }
  }

  if (!startRange || !endRange) return null;

  return {
    startDate: normalizeDate(startRange),
    endDate: normalizeDate(endRange),
  };
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount);
};

export const formatCurrencyCompact = (amount: number) => {
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  
  if (absAmount >= 1000000000) {
    return `${sign}₱${(absAmount / 1000000000).toFixed(1)}B`;
  } else if (absAmount >= 1000000) {
    return `${sign}₱${(absAmount / 1000000).toFixed(1)}M`;
  } else if (absAmount >= 1000) {
    return `${sign}₱${(absAmount / 1000).toFixed(1)}K`;
  }
  
  return formatCurrency(amount);
};

export const formatCurrencyForPDF = (amount: number) => {
  const formatted = amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `PHP ${formatted}`;
};

export const formatCategory = (category: string | null) => {
  if (!category) return 'N/A';
  return category.split('_').map(word => 
    word.charAt(0) + word.slice(1).toLowerCase()
  ).join(' ');
};

export const getWordCount = (text: string) => {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

