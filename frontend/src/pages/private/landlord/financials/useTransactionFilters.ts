import { useMemo } from 'react';
import { getDateRange, normalizeDate, recurringOccursInRange } from './helpers';

type DateFilterType = 'THIS_MONTH' | 'THIS_YEAR' | 'ALL_TIME';
type FilterType = 'ALL' | 'INCOME' | 'EXPENSE';

interface Transaction {
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

interface UseTransactionFiltersProps {
  transactions: Transaction[];
  filterType: FilterType;
  filterCategory: string;
  filterPropertyId: string;
  filterUnitId: string;
  dateFilter: DateFilterType;
  customMonth: string;
  customYear: string;
}

export const useTransactionFilters = ({
  transactions,
  filterType,
  filterCategory,
  filterPropertyId,
  filterUnitId,
  dateFilter,
  customMonth,
  customYear,
}: UseTransactionFiltersProps) => {
  const dateRange = useMemo(
    () => getDateRange(dateFilter, customMonth, customYear),
    [dateFilter, customMonth, customYear]
  );

  const matchesDateFilter = (transaction: Transaction) => {
    if (dateFilter === 'ALL_TIME') return true;
    if (!dateRange) return true;
    
    const recordDate = normalizeDate(new Date(transaction.date));
    if (Number.isNaN(recordDate.getTime())) return false;

    // Check if the transaction date itself is within the range
    if (recordDate >= dateRange.startDate && recordDate <= dateRange.endDate) {
      return true;
    }

    // For recurring transactions, check if any occurrence falls within the range
    if (transaction.recurringInterval) {
      return recurringOccursInRange(transaction, dateRange.startDate, dateRange.endDate);
    }

    return false;
  };

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    // Filter by type
    if (filterType !== 'ALL') {
      filtered = filtered.filter(transaction => transaction.type === filterType);
    }

    // Filter by category
    if (filterType !== 'ALL' && filterCategory !== 'ALL') {
      filtered = filtered.filter(transaction => transaction.category === filterCategory);
    }

    // Filter by property
    if (filterPropertyId !== 'ALL_PROPERTIES') {
      filtered = filtered.filter(transaction => transaction.propertyId === filterPropertyId);
    }
    
    // Filter by unit (when filterUnitId is provided and not 'ALL_TRANSACTIONS')
    if (filterUnitId && filterUnitId !== 'ALL_TRANSACTIONS') {
      filtered = filtered.filter(transaction => transaction.unitId === filterUnitId);
    }

    // Date filter
    filtered = filtered.filter(transaction => matchesDateFilter(transaction));

    // Sort by date (newest first)
    filtered = [...filtered].sort((a, b) => {
      const dateA = normalizeDate(new Date(a.date));
      const dateB = normalizeDate(new Date(b.date));
      
      if (dateA.getTime() === dateB.getTime()) {
        const createdAtA = new Date(a.createdAt || 0).getTime();
        const createdAtB = new Date(b.createdAt || 0).getTime();
        return createdAtB - createdAtA;
      }
      
      return dateB.getTime() - dateA.getTime();
    });

    return filtered;
  }, [
    transactions,
    filterType,
    filterCategory,
    filterPropertyId,
    filterUnitId,
    dateFilter,
    customMonth,
    customYear,
  ]);

  return { filteredTransactions, dateRange };
};

