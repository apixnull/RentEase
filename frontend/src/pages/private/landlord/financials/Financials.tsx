import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, TrendingUp, TrendingDown, Plus, Repeat, Search, Trash2, Sparkles, Users, X, ChevronDown, ChevronUp, Loader2, RefreshCcw, Calendar, CalendarDays, Clock, Filter, Download } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllTransactionsRequest, createTransactionRequest, updateTransactionRequest, deleteTransactionRequest, getPropertiesWithUnitsRequest } from '@/api/landlord/financialApi';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Interfaces
interface Property {
  id: string;
  title: string;
  type: string;
  address: {
    street: string;
    barangay: string;
    zipCode: string;
    city: string | null;
    municipality: string | null;
  };
  Unit: Array<{
    id: string;
    label: string;
  }>;
}

interface Transaction {
  id: string;
  propertyId: string;
  unitId: string | null;
  amount: number;
  description: string;
  date: string;
  type: string; // "INCOME" or "EXPENSE"
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

const DAY_IN_MS = 1000 * 60 * 60 * 24;

const normalizeDate = (date: Date) => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

const transactionOccursOnDate = (transaction: Transaction, targetDate: Date) => {
  const transactionDate = normalizeDate(new Date(transaction.date));
  const dateToCheck = normalizeDate(targetDate);
  const today = normalizeDate(new Date());

  if (dateToCheck < transactionDate) return false;
  if (dateToCheck > today) return false;

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

const recurringOccursInRange = (transaction: Transaction, startRange: Date, endRange: Date) => {
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

const Financials = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPropertyId, setFilterPropertyId] = useState<string>('ALL_PROPERTIES');
  const [filterUnitId, setFilterUnitId] = useState<string>('ALL_TRANSACTIONS');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<'SPECIFIC_MONTH' | 'SPECIFIC_YEAR' | 'ALL_TIME' | 'MONTH_RANGE'>('SPECIFIC_MONTH');
  const [customMonth, setCustomMonth] = useState<string>(format(new Date(), 'yyyy-MM'));
  const [customYear, setCustomYear] = useState<string>(new Date().getFullYear().toString());
  const [startMonth, setStartMonth] = useState<string>(format(new Date(), 'yyyy-MM'));
  const [endMonth, setEndMonth] = useState<string>(format(new Date(), 'yyyy-MM'));
  const [currentPage, setCurrentPage] = useState(1);
  const [isTimelineCollapsed, setIsTimelineCollapsed] = useState(false);
  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(false);
  const ITEMS_PER_PAGE = 10;
  
  // Transaction modal
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [transactionForm, setTransactionForm] = useState({
    propertyId: '',
    unitId: '',
    amount: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    type: 'INCOME',
    category: 'RENT', // Default category for income
    recurringInterval: '',
  });
  const [submittingTransaction, setSubmittingTransaction] = useState(false);
  const [deletingTransactionId, setDeletingTransactionId] = useState<string | null>(null);
  
  // PDF Download Modal
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [pdfFilterType, setPdfFilterType] = useState<'ALL_PROPERTIES' | 'SPECIFIC_PROPERTY'>('ALL_PROPERTIES');
  const [pdfPropertyId, setPdfPropertyId] = useState<string>('');
  const [pdfDateFilter, setPdfDateFilter] = useState<'ALL_TIME' | 'SPECIFIC_MONTH' | 'SPECIFIC_YEAR' | 'MONTH_RANGE'>('ALL_TIME');
  const [pdfCustomMonth, setPdfCustomMonth] = useState<string>(format(new Date(), 'yyyy-MM'));
  const [pdfCustomYear, setPdfCustomYear] = useState<string>(new Date().getFullYear().toString());
  const [pdfStartMonth, setPdfStartMonth] = useState<string>(format(new Date(), 'yyyy-MM'));
  const [pdfEndMonth, setPdfEndMonth] = useState<string>(format(new Date(), 'yyyy-MM'));
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [generatingExcel, setGeneratingExcel] = useState(false);
  const [downloadType, setDownloadType] = useState<'PDF' | 'EXCEL'>('PDF');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async ({ silent = false }: { silent?: boolean } = {}) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      setRefreshing(true);
      const [transactionsRes, propertiesRes] = await Promise.all([
        getAllTransactionsRequest(),
        getPropertiesWithUnitsRequest(),
      ]);
      
      setTransactions(transactionsRes.data.transactions || []);
      setProperties(propertiesRes.data.properties || []);
    } catch (error: any) {
      console.error('Error fetching financial data:', error);
      toast.error('Failed to load financial records');
    } finally {
      if (!silent) {
        setLoading(false);
      }
      setRefreshing(false);
    }
  };

  const dateRange = useMemo(() => {
    if (dateFilter === 'ALL_TIME') {
      return null; // No date range for all time
    }

    const now = new Date();
    let startRange: Date | null = null;
    let endRange: Date | null = null;

    switch (dateFilter) {
      case 'SPECIFIC_MONTH': {
        const selectedDate = customMonth ? new Date(`${customMonth}-01`) : now;
        startRange = startOfMonth(selectedDate);
        endRange = endOfMonth(selectedDate);
        break;
      }
      case 'SPECIFIC_YEAR': {
        const year = customYear ? parseInt(customYear) : now.getFullYear();
        startRange = startOfYear(new Date(year, 0, 1));
        endRange = endOfYear(new Date(year, 11, 31));
        break;
      }
      case 'MONTH_RANGE': {
        if (startMonth && endMonth) {
          const startDate = new Date(`${startMonth}-01`);
          const endDate = new Date(`${endMonth}-01`);
          startRange = startOfMonth(startDate);
          endRange = endOfMonth(endDate);
        }
        break;
      }
      default:
        return null;
    }

    if (!startRange || !endRange) return null;

    return {
      startDate: normalizeDate(startRange),
      endDate: normalizeDate(endRange),
    };
  }, [dateFilter, customMonth, customYear, startMonth, endMonth]);

  const matchesDateFilter = (transaction: Transaction) => {
    if (dateFilter === 'ALL_TIME') return true; // Show all transactions
    if (!dateRange) return true;
    const recordDate = new Date(transaction.date);
    if (Number.isNaN(recordDate.getTime())) return false;

    if (isWithinInterval(recordDate, { start: dateRange.startDate, end: dateRange.endDate })) {
      return true;
    }

    if (!transaction.recurringInterval) return false;
    return recurringOccursInRange(transaction, dateRange.startDate, dateRange.endDate);
  };

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    // Filter by type
    if (filterType && filterType !== 'ALL') {
      filtered = filtered.filter(transaction => transaction.type === filterType);
    }

    // Filter by category (only if type is selected)
    if (filterType !== 'ALL' && filterCategory && filterCategory !== 'ALL') {
      filtered = filtered.filter(transaction => transaction.category === filterCategory);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(transaction =>
        transaction.description.toLowerCase().includes(term) ||
        transaction.property.title.toLowerCase().includes(term) ||
        transaction.category?.toLowerCase().includes(term) ||
        transaction.unit?.label.toLowerCase().includes(term)
      );
    }

    // Filter by property
    if (filterPropertyId && filterPropertyId !== 'ALL_PROPERTIES') {
      filtered = filtered.filter(transaction => transaction.propertyId === filterPropertyId);
      
      // Filter by unit (only when a specific property is selected)
      if (filterUnitId && filterUnitId !== 'ALL_TRANSACTIONS') {
        if (filterUnitId === 'PROPERTY_LEVEL') {
          // Property level transactions have no unitId (null)
          filtered = filtered.filter(transaction => transaction.unitId === null);
        } else if (filterUnitId === 'ALL_UNITS') {
          // All unit-level transactions (exclude property-level)
          filtered = filtered.filter(transaction => transaction.unitId !== null);
        } else {
          // Specific unit transactions
          filtered = filtered.filter(transaction => transaction.unitId === filterUnitId);
        }
      }
    }

    // Date filter
    filtered = filtered.filter(transaction => matchesDateFilter(transaction));

    // Sort by date (newest first) - regardless of income/expense type
    // Use date only (ignore time) to ensure consistent sorting
    filtered = [...filtered].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      
      // Set time to 0 for date-only comparison
      dateA.setHours(0, 0, 0, 0);
      dateB.setHours(0, 0, 0, 0);
      
      const timeA = dateA.getTime();
      const timeB = dateB.getTime();
      
      // If dates are equal, sort by createdAt (newest first) as secondary sort
      if (timeA === timeB) {
        const createdAtA = new Date(a.createdAt || 0).getTime();
        const createdAtB = new Date(b.createdAt || 0).getTime();
        return createdAtB - createdAtA;
      }
      
      return timeB - timeA; // Descending order (newest first)
    });

    return filtered;
  }, [transactions, filterType, filterCategory, searchTerm, filterPropertyId, filterUnitId, dateFilter, customMonth, customYear]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterPropertyId, filterUnitId, filterType, filterCategory, dateFilter, customMonth, customYear, startMonth, endMonth]);

  // Reset category filter when type changes
  useEffect(() => {
    setFilterCategory('ALL');
  }, [filterType]);

  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTransactions.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredTransactions, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE));

  const selectedProperty = properties.find(p => p.id === transactionForm.propertyId);
  const availableUnits = selectedProperty?.Unit || [];

  // Get all units from properties (not from transactions) for filter
  const allUnits = useMemo(() => {
    const units: Array<{ id: string; label: string; propertyId: string }> = [];
    
    properties.forEach(property => {
      property.Unit.forEach(unit => {
        units.push({
          id: unit.id,
          label: unit.label,
          propertyId: property.id,
        });
      });
    });
    
    return units;
  }, [properties]);

  // Filter units by selected property
  const filteredUnits = useMemo(() => {
    if (!filterPropertyId || filterPropertyId === 'ALL_PROPERTIES') return allUnits;
    return allUnits.filter(unit => unit.propertyId === filterPropertyId);
  }, [allUnits, filterPropertyId]);

  // Calculate recurring transaction amount and occurrences
  const calculateRecurringAmount = (transaction: Transaction): { totalAmount: number; occurrences: number } => {
    if (!transaction.recurringInterval) {
      return { totalAmount: transaction.amount, occurrences: 1 };
    }

    const transactionDate = new Date(transaction.date);
    const now = new Date();
    
    // Reset time to start of day for accurate date comparison
    transactionDate.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    
    const diffTime = now.getTime() - transactionDate.getTime();
    
    if (diffTime < 0) {
      return { totalAmount: transaction.amount, occurrences: 1 }; // Transaction is in the future
    }

    let occurrences = 1;

    switch (transaction.recurringInterval) {
      case 'DAILY':
        // Count days from transaction date to today (inclusive)
        occurrences = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
        break;
      case 'WEEKLY':
        // Count weeks from transaction date to today
        // If transaction was on Monday and today is Monday, that's 1 week = 2 occurrences
        const weeksDiff = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
        occurrences = weeksDiff + 1;
        break;
      case 'MONTHLY':
        // Calculate months difference
        // Example: Nov 1 to Dec 1 = 1 month = 2 occurrences (Nov + Dec)
        // Example: Nov 1 to Dec 15 = 1 month = 2 occurrences (Nov + Dec)
        // Example: Nov 1 to Jan 1 = 2 months = 3 occurrences (Nov + Dec + Jan)
        const yearsDiff = now.getFullYear() - transactionDate.getFullYear();
        const monthsDiff = now.getMonth() - transactionDate.getMonth();
        const totalMonths = yearsDiff * 12 + monthsDiff;
        
        // If we're in the same month as the transaction date, it's the first occurrence
        if (totalMonths === 0) {
          occurrences = 1;
        } else {
          // Count occurrences: initial + number of months passed
          occurrences = totalMonths + 1;
        }
        break;
      case 'YEARLY':
        // Calculate years difference
        const yearsPassed = now.getFullYear() - transactionDate.getFullYear();
        occurrences = yearsPassed + 1;
        break;
      default:
        return { totalAmount: transaction.amount, occurrences: 1 };
    }

    return { 
      totalAmount: transaction.amount * occurrences, 
      occurrences 
    };
  };

  // Get filtered transactions for timeline (applies all filters except date)
  const getFilteredTransactionsForTimeline = useMemo(() => {
    let filtered = transactions;

    // Filter by type
    if (filterType && filterType !== 'ALL') {
      filtered = filtered.filter(transaction => transaction.type === filterType);
    }

    // Filter by category (only if type is selected)
    if (filterType !== 'ALL' && filterCategory && filterCategory !== 'ALL') {
      filtered = filtered.filter(transaction => transaction.category === filterCategory);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(transaction =>
        transaction.description.toLowerCase().includes(term) ||
        transaction.property.title.toLowerCase().includes(term) ||
        transaction.category?.toLowerCase().includes(term) ||
        transaction.unit?.label.toLowerCase().includes(term)
      );
    }

    // Filter by property
    if (filterPropertyId && filterPropertyId !== 'ALL_PROPERTIES') {
      filtered = filtered.filter(transaction => transaction.propertyId === filterPropertyId);
      
      // Filter by unit (only when a specific property is selected)
      if (filterUnitId && filterUnitId !== 'ALL_TRANSACTIONS') {
        if (filterUnitId === 'PROPERTY_LEVEL') {
          filtered = filtered.filter(transaction => transaction.unitId === null);
        } else if (filterUnitId === 'ALL_UNITS') {
          filtered = filtered.filter(transaction => transaction.unitId !== null);
        } else {
          filtered = filtered.filter(transaction => transaction.unitId === filterUnitId);
        }
      }
    }

    return filtered;
  }, [transactions, filterType, filterCategory, filterPropertyId, filterUnitId, searchTerm]);

  const timelineRange = useMemo(() => {
    if (dateFilter === 'ALL_TIME') {
      // For all time, show a range of years (current year - 2 to current year + 1)
      // This ensures we always show multiple years even if there are no transactions
      const currentYear = new Date().getFullYear();
      const startYear = currentYear - 2; // Show 2 years before
      const endYear = currentYear + 1; // Show 1 year ahead
      
      return {
        startDate: normalizeDate(startOfYear(new Date(startYear, 0, 1))),
        endDate: normalizeDate(endOfYear(new Date(endYear, 11, 31))),
        granularity: 'YEARLY' as const,
      };
    }
    if (!dateRange) return null;
    let granularity: 'DAILY' | 'MONTHLY' = 'DAILY';
    if (dateFilter === 'SPECIFIC_YEAR') {
      granularity = 'MONTHLY';
    }
    return {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      granularity,
    };
  }, [dateRange, dateFilter]);


  // Word count helper
  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  // Open transaction update modal
  const handleOpenTransactionUpdate = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setTransactionForm({
      propertyId: transaction.propertyId,
      unitId: transaction.unitId || 'PROPERTY_LEVEL',
      amount: transaction.amount.toString(),
      description: transaction.description,
      date: format(new Date(transaction.date), 'yyyy-MM-dd'),
      type: transaction.type,
      category: transaction.category || (transaction.type === 'INCOME' ? 'RENT' : 'MAINTENANCE'),
      recurringInterval: transaction.recurringInterval || 'NONE',
    });
    setShowTransactionModal(true);
  };

  // Reset transaction form
  const resetTransactionForm = () => {
    setEditingTransaction(null);
    setTransactionForm({
      propertyId: '',
      unitId: '',
      amount: '',
      description: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      type: 'INCOME',
      category: 'RENT', // Default category for income
      recurringInterval: '',
    });
  };

  const handleCreateTransaction = async () => {
    if (!transactionForm.propertyId || !transactionForm.amount || !transactionForm.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate word limit
    const wordCount = getWordCount(transactionForm.description);
    if (wordCount > 15) {
      toast.error(`Description must not exceed 15 words. Current: ${wordCount} words`);
      return;
    }

    try {
      setSubmittingTransaction(true);
      await createTransactionRequest({
        ...transactionForm,
        unitId: transactionForm.unitId === 'PROPERTY_LEVEL' || transactionForm.unitId === '' ? null : transactionForm.unitId,
        category: transactionForm.category || null,
        recurringInterval: transactionForm.recurringInterval === 'NONE' ? null : transactionForm.recurringInterval,
      });
      
      toast.success('Transaction record created successfully');
      setShowTransactionModal(false);
      resetTransactionForm();
      fetchData({ silent: true });
    } catch (error: any) {
      console.error('Error creating transaction:', error);
      toast.error(error.response?.data?.error || 'Failed to create transaction record');
    } finally {
      setSubmittingTransaction(false);
    }
  };

  const handleUpdateTransaction = async () => {
    if (!editingTransaction || !transactionForm.propertyId || !transactionForm.amount || !transactionForm.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate word limit
    const wordCount = getWordCount(transactionForm.description);
    if (wordCount > 15) {
      toast.error(`Description must not exceed 15 words. Current: ${wordCount} words`);
      return;
    }

    try {
      setSubmittingTransaction(true);
      await updateTransactionRequest(editingTransaction.id, {
        ...transactionForm,
        unitId: transactionForm.unitId === 'PROPERTY_LEVEL' || transactionForm.unitId === '' ? null : transactionForm.unitId,
        category: transactionForm.category || null,
        recurringInterval: transactionForm.recurringInterval === 'NONE' ? null : transactionForm.recurringInterval,
      });
      
      toast.success('Transaction record updated successfully');
      setShowTransactionModal(false);
      resetTransactionForm();
      fetchData({ silent: true });
    } catch (error: any) {
      console.error('Error updating transaction:', error);
      toast.error(error.response?.data?.error || 'Failed to update transaction record');
    } finally {
      setSubmittingTransaction(false);
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!confirm('Are you sure you want to delete this transaction record? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingTransactionId(transactionId);
      await deleteTransactionRequest(transactionId);
      toast.success('Transaction record deleted successfully');
      fetchData({ silent: true });
    } catch (error: any) {
      console.error('Error deleting transaction:', error);
      toast.error(error.response?.data?.error || 'Failed to delete transaction record');
    } finally {
      setDeletingTransactionId(null);
    }
  };
  const handleRefreshData = () => fetchData({ silent: true });

  const {
    chartData: dailyChartData,
    totals: dailyTotal,
    occurrenceCount: timelineOccurrenceCount,
  } = useMemo(() => {
    if (!timelineRange) {
      return {
        chartData: [],
        totals: { income: 0, expense: 0 },
        occurrenceCount: 0,
      };
    }

    const days: Date[] = [];
    const cursor = new Date(timelineRange.startDate);
    while (cursor <= timelineRange.endDate) {
      days.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }

    let occurrenceCount = 0;
    const dailyEntries = days.map(day => {
      let income = 0;
      let expense = 0;
      let dayCount = 0;

      getFilteredTransactionsForTimeline.forEach(transaction => {
        if (transactionOccursOnDate(transaction, day)) {
          dayCount += 1;
          if (transaction.type === 'INCOME') {
            income += transaction.amount;
          } else {
            expense += transaction.amount;
          }
        }
      });

      occurrenceCount += dayCount;

      return {
        date: format(day, 'yyyy-MM-dd'),
        income,
        expense,
      };
    });

    let chartData = dailyEntries;

    if (timelineRange.granularity === 'MONTHLY') {
      const monthlyMap = new Map<string, { date: string; income: number; expense: number }>();
      dailyEntries.forEach(entry => {
        const monthKey = entry.date.slice(0, 7);
        if (!monthlyMap.has(monthKey)) {
          monthlyMap.set(monthKey, {
            date: `${monthKey}-01`,
            income: 0,
            expense: 0,
          });
        }
        const bucket = monthlyMap.get(monthKey)!;
        bucket.income += entry.income;
        bucket.expense += entry.expense;
      });
      chartData = Array.from(monthlyMap.values());
    } else if (timelineRange.granularity === 'YEARLY') {
      // Group by year for all time view
      // First, create entries for all years in the range (even if no transactions)
      const currentYear = new Date().getFullYear();
      const startYear = currentYear - 2;
      const endYear = currentYear + 1;
      const yearlyMap = new Map<string, { date: string; income: number; expense: number }>();
      
      // Initialize all years with zero values
      for (let year = startYear; year <= endYear; year++) {
        yearlyMap.set(year.toString(), {
          date: `${year}-01-01`,
          income: 0,
          expense: 0,
        });
      }
      
      // Then add actual transaction data
      dailyEntries.forEach(entry => {
        const yearKey = entry.date.slice(0, 4);
        if (yearlyMap.has(yearKey)) {
          const bucket = yearlyMap.get(yearKey)!;
          bucket.income += entry.income;
          bucket.expense += entry.expense;
        }
      });
      
      chartData = Array.from(yearlyMap.values()).sort((a, b) => a.date.localeCompare(b.date));
    }

    const totals = chartData.reduce(
      (acc, curr) => ({
        income: acc.income + curr.income,
        expense: acc.expense + curr.expense,
      }),
      { income: 0, expense: 0 }
    );

    return {
      chartData,
      totals,
      occurrenceCount,
    };
  }, [timelineRange, getFilteredTransactionsForTimeline]);

  const chartConfig = {
    income: {
      label: "Income",
      color: "hsl(142, 71%, 45%)", // green - emerald-600 equivalent
    },
    expense: {
      label: "Expense",
      color: "hsl(0, 84%, 60%)", // red - red-500 equivalent
    },
  } satisfies ChartConfig;

  // Calculate accounting metrics for timeline
  const accountingMetrics = useMemo(() => {
    const netProfit = dailyTotal.income - dailyTotal.expense;
    const profitMargin = dailyTotal.income > 0 ? (netProfit / dailyTotal.income) * 100 : 0;
    const transactionCount = timelineOccurrenceCount;

    return {
      netProfit,
      profitMargin,
      transactionCount,
    };
  }, [dailyTotal, timelineOccurrenceCount]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

  // Format currency for PDF (ensures ₱ symbol is used and compatible with Microsoft)
  const formatCurrencyForPDF = (amount: number) => {
    // Use simple PHP format that works across all PDF viewers
    const formatted = amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `PHP ${formatted}`;
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilterType('ALL');
    setFilterCategory('ALL');
    setFilterPropertyId('ALL_PROPERTIES');
    setFilterUnitId('ALL_TRANSACTIONS');
    setDateFilter('SPECIFIC_MONTH');
    setCustomMonth(format(new Date(), 'yyyy-MM'));
    setCustomYear(new Date().getFullYear().toString());
    setStartMonth(format(new Date(), 'yyyy-MM'));
    setEndMonth(format(new Date(), 'yyyy-MM'));
    setSearchTerm('');
  };

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return filterType !== 'ALL' || 
           filterCategory !== 'ALL' || 
           filterPropertyId !== 'ALL_PROPERTIES' || 
           (filterPropertyId !== 'ALL_PROPERTIES' && filterUnitId !== 'ALL_TRANSACTIONS') ||
           dateFilter !== 'SPECIFIC_MONTH' || 
           searchTerm !== '';
  }, [filterType, filterCategory, filterPropertyId, filterUnitId, dateFilter, searchTerm]);

  const formatCategory = (category: string | null) => {
    if (!category) return 'N/A';
    return category.split('_').map(word => 
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
  };

  // Generate Excel with filtered transactions
  const generateExcel = async () => {
    if (pdfFilterType === 'SPECIFIC_PROPERTY' && !pdfPropertyId) {
      toast.error('Please select a property');
      return;
    }

    try {
      setGeneratingExcel(true);

      // Filter transactions for Excel (same logic as PDF)
      let excelTransactions = transactions;

      // Filter by property
      if (pdfFilterType === 'SPECIFIC_PROPERTY') {
        excelTransactions = excelTransactions.filter(
          transaction => transaction.propertyId === pdfPropertyId
        );
      }

      // Filter by date range
      if (pdfDateFilter !== 'ALL_TIME') {
        let startRange: Date | null = null;
        let endRange: Date | null = null;

        if (pdfDateFilter === 'SPECIFIC_MONTH') {
          const selectedDate = pdfCustomMonth ? new Date(`${pdfCustomMonth}-01`) : new Date();
          startRange = startOfMonth(selectedDate);
          endRange = endOfMonth(selectedDate);
        } else if (pdfDateFilter === 'SPECIFIC_YEAR') {
          const year = pdfCustomYear ? parseInt(pdfCustomYear) : new Date().getFullYear();
          startRange = startOfYear(new Date(year, 0, 1));
          endRange = endOfYear(new Date(year, 11, 31));
        } else if (pdfDateFilter === 'MONTH_RANGE') {
          if (pdfStartMonth && pdfEndMonth) {
            const startDate = new Date(`${pdfStartMonth}-01`);
            const endDate = new Date(`${pdfEndMonth}-01`);
            startRange = startOfMonth(startDate);
            endRange = endOfMonth(endDate);
          }
        }

        if (startRange && endRange) {
          const normalizedStart = normalizeDate(startRange);
          const normalizedEnd = normalizeDate(endRange);
          
          excelTransactions = excelTransactions.filter(transaction => {
            const recordDate = new Date(transaction.date);
            if (Number.isNaN(recordDate.getTime())) return false;

            if (isWithinInterval(recordDate, { start: normalizedStart, end: normalizedEnd })) {
              return true;
            }

            if (!transaction.recurringInterval) return false;
            return recurringOccursInRange(transaction, normalizedStart, normalizedEnd);
          });
        }
      }

      // Sort by date (oldest first)
      excelTransactions = [...excelTransactions].sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateA - dateB;
      });

      // Prepare data for Excel
      const excelData = excelTransactions.map(transaction => {
        const { totalAmount, occurrences } = calculateRecurringAmount(transaction);
        
        let amountDisplay = '';
        if (transaction.recurringInterval && occurrences > 1) {
          amountDisplay = `${transaction.amount.toFixed(2)} × ${occurrences} = ${totalAmount.toFixed(2)}`;
        } else {
          amountDisplay = transaction.amount.toFixed(2);
        }

        return {
          'Type': transaction.type === 'INCOME' ? 'Income' : 'Expense',
          'Date': format(new Date(transaction.date), 'yyyy-MM-dd'),
          'Description': transaction.description,
          'Property': transaction.property.title,
          'Unit': transaction.unit ? transaction.unit.label : 'Property-level',
          'Category': formatCategory(transaction.category),
          'Recurring': transaction.recurringInterval || 'No',
          'Amount (PHP)': amountDisplay,
        };
      });

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      const colWidths = [
        { wch: 12 }, // Type
        { wch: 12 }, // Date
        { wch: 40 }, // Description
        { wch: 25 }, // Property
        { wch: 15 }, // Unit
        { wch: 20 }, // Category
        { wch: 12 }, // Recurring
        { wch: 20 }, // Amount
      ];
      ws['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Financial Report');

      // Generate filename
      let filename = '';
      const propertyName = pdfFilterType === 'SPECIFIC_PROPERTY' 
        ? properties.find(p => p.id === pdfPropertyId)?.title.replace(/\s+/g, '-') || 'Property'
        : 'All-Properties';
      
      let dateSuffix = '';
      if (pdfDateFilter === 'SPECIFIC_MONTH') {
        const selectedDate = pdfCustomMonth ? new Date(`${pdfCustomMonth}-01`) : new Date();
        dateSuffix = `-${format(selectedDate, 'yyyy-MM')}`;
      } else if (pdfDateFilter === 'SPECIFIC_YEAR') {
        const year = pdfCustomYear || new Date().getFullYear().toString();
        dateSuffix = `-${year}`;
      } else if (pdfDateFilter === 'MONTH_RANGE') {
        if (pdfStartMonth && pdfEndMonth) {
          dateSuffix = `-${pdfStartMonth}-to-${pdfEndMonth}`;
        } else {
          dateSuffix = '-MonthRange';
        }
      } else {
        dateSuffix = '-AllTime';
      }

      filename = `Financial-Report-${propertyName}${dateSuffix}-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;

      // Write file
      XLSX.writeFile(wb, filename);
      
      toast.success('Excel file downloaded successfully');
      setShowDownloadModal(false);
      setPdfFilterType('ALL_PROPERTIES');
      setPdfPropertyId('');
      setPdfDateFilter('ALL_TIME');
      setPdfCustomMonth(format(new Date(), 'yyyy-MM'));
      setPdfCustomYear(new Date().getFullYear().toString());
      setPdfStartMonth(format(new Date(), 'yyyy-MM'));
      setPdfEndMonth(format(new Date(), 'yyyy-MM'));
    } catch (error: any) {
      console.error('Error generating Excel:', error);
      toast.error('Failed to generate Excel file');
    } finally {
      setGeneratingExcel(false);
    }
  };

  // Generate PDF with filtered transactions
  const generatePDF = async () => {
    if (pdfFilterType === 'SPECIFIC_PROPERTY' && !pdfPropertyId) {
      toast.error('Please select a property');
      return;
    }

    try {
      setGeneratingPdf(true);

      // Filter transactions for PDF
      let pdfTransactions = transactions;

      // Filter by property
      if (pdfFilterType === 'SPECIFIC_PROPERTY') {
        pdfTransactions = pdfTransactions.filter(
          transaction => transaction.propertyId === pdfPropertyId
        );
      }

      // Filter by date range
      if (pdfDateFilter !== 'ALL_TIME') {
        let startRange: Date | null = null;
        let endRange: Date | null = null;

        if (pdfDateFilter === 'SPECIFIC_MONTH') {
          const selectedDate = pdfCustomMonth ? new Date(`${pdfCustomMonth}-01`) : new Date();
          startRange = startOfMonth(selectedDate);
          endRange = endOfMonth(selectedDate);
        } else if (pdfDateFilter === 'SPECIFIC_YEAR') {
          const year = pdfCustomYear ? parseInt(pdfCustomYear) : new Date().getFullYear();
          startRange = startOfYear(new Date(year, 0, 1));
          endRange = endOfYear(new Date(year, 11, 31));
        } else if (pdfDateFilter === 'MONTH_RANGE') {
          if (pdfStartMonth && pdfEndMonth) {
            const startDate = new Date(`${pdfStartMonth}-01`);
            const endDate = new Date(`${pdfEndMonth}-01`);
            startRange = startOfMonth(startDate);
            endRange = endOfMonth(endDate);
          }
        }

        if (startRange && endRange) {
          const normalizedStart = normalizeDate(startRange);
          const normalizedEnd = normalizeDate(endRange);
          
          pdfTransactions = pdfTransactions.filter(transaction => {
            const recordDate = new Date(transaction.date);
            if (Number.isNaN(recordDate.getTime())) return false;

            if (isWithinInterval(recordDate, { start: normalizedStart, end: normalizedEnd })) {
              return true;
            }

            if (!transaction.recurringInterval) return false;
            return recurringOccursInRange(transaction, normalizedStart, normalizedEnd);
          });
        }
      }

      // Sort by date (oldest first for PDF)
      pdfTransactions = [...pdfTransactions].sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateA - dateB;
      });

      // Calculate totals (considering recurring transactions)
      let totalIncome = 0;
      let totalExpense = 0;

      pdfTransactions.forEach(transaction => {
        const { totalAmount } = calculateRecurringAmount(transaction);
        if (transaction.type === 'INCOME') {
          totalIncome += totalAmount;
        } else {
          totalExpense += totalAmount;
        }
      });

      const netProfit = totalIncome - totalExpense;
      const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

      // Create PDF in landscape orientation with proper encoding for Microsoft compatibility
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
        compress: true
      });
      const pageWidth = doc.internal.pageSize.getWidth();
      let yPosition = 20;

      // RentEase Branding Header
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(16, 185, 129); // emerald-500 color
      doc.text('RentEase', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 6;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text('Property Management Platform', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 8;
      
      // Divider line
      doc.setDrawColor(200, 200, 200);
      doc.line(14, yPosition, pageWidth - 14, yPosition);
      yPosition += 10;

      // Report Title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Financial Report', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;

      // Report type
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      let reportType = '';
      if (pdfFilterType === 'ALL_PROPERTIES') {
        reportType = 'All Properties';
      } else {
        const propertyTitle = properties.find(p => p.id === pdfPropertyId)?.title || 'Selected Property';
        reportType = `Property: ${propertyTitle}`;
      }

      // Add date range info
      let dateRangeText = '';
      if (pdfDateFilter === 'SPECIFIC_MONTH') {
        const selectedDate = pdfCustomMonth ? new Date(`${pdfCustomMonth}-01`) : new Date();
        dateRangeText = ` - ${format(selectedDate, 'MMMM yyyy')}`;
      } else if (pdfDateFilter === 'SPECIFIC_YEAR') {
        const year = pdfCustomYear || new Date().getFullYear().toString();
        dateRangeText = ` - Year ${year}`;
      } else if (pdfDateFilter === 'MONTH_RANGE') {
        if (pdfStartMonth && pdfEndMonth) {
          const startDate = new Date(`${pdfStartMonth}-01`);
          const endDate = new Date(`${pdfEndMonth}-01`);
          dateRangeText = ` - ${format(startDate, 'MMM yyyy')} to ${format(endDate, 'MMM yyyy')}`;
        } else {
          dateRangeText = ' - Month Range';
        }
      } else {
        dateRangeText = ' - All Time Data';
      }

      doc.text(reportType + dateRangeText, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 8;

      // Generated date
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.text(`Generated on: ${format(new Date(), 'MMMM dd, yyyy')}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // Summary section
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Summary', 14, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Income: ${formatCurrencyForPDF(totalIncome)}`, 14, yPosition);
      yPosition += 6;
      doc.text(`Total Expense: ${formatCurrencyForPDF(totalExpense)}`, 14, yPosition);
      yPosition += 6;
      doc.setFont('helvetica', 'bold');
      // Set text color based on profit (green for positive, red for negative)
      const profitColor = netProfit >= 0 ? [0, 150, 0] : [200, 0, 0];
      doc.setTextColor(profitColor[0], profitColor[1], profitColor[2]);
      doc.text(`Net Profit: ${formatCurrencyForPDF(netProfit)}`, 14, yPosition);
      doc.setTextColor(0, 0, 0);
      yPosition += 6;
      // Add margin
      const marginColor = profitMargin >= 0 ? [0, 150, 0] : [200, 0, 0];
      doc.setTextColor(marginColor[0], marginColor[1], marginColor[2]);
      doc.text(`Profit Margin: ${profitMargin.toFixed(2)}%`, 14, yPosition);
      doc.setTextColor(0, 0, 0);
      yPosition += 6;
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Transactions: ${pdfTransactions.length}`, 14, yPosition);
      yPosition += 8;
      
      // Currency note
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 100, 100);
      doc.text('Note: All amounts are in Philippine Peso (PHP)', 14, yPosition);
      doc.setTextColor(0, 0, 0);
      yPosition += 10;

      // Transactions table
      if (pdfTransactions.length > 0) {
        const tableData = pdfTransactions.map(transaction => {
          const { totalAmount, occurrences } = calculateRecurringAmount(transaction);
          
          // Format amount display - show original and total for recurring transactions
          let amountDisplay = '';
          if (transaction.recurringInterval && occurrences > 1) {
            const originalAmount = formatCurrencyForPDF(transaction.amount);
            const totalAmountFormatted = formatCurrencyForPDF(totalAmount);
            amountDisplay = `${originalAmount} × ${occurrences} = ${totalAmountFormatted}`;
          } else {
            amountDisplay = formatCurrencyForPDF(transaction.amount);
          }
          
          return [
            transaction.type === 'INCOME' ? 'Income' : 'Expense',
            format(new Date(transaction.date), 'MMM dd, yyyy'),
            transaction.description.length > 40 
              ? transaction.description.substring(0, 37) + '...' 
              : transaction.description,
            transaction.property.title.length > 25
              ? transaction.property.title.substring(0, 22) + '...'
              : transaction.property.title,
            transaction.unit ? (transaction.unit.label.length > 15 ? transaction.unit.label.substring(0, 12) + '...' : transaction.unit.label) : 'Property-level',
            formatCategory(transaction.category).length > 15
              ? formatCategory(transaction.category).substring(0, 12) + '...'
              : formatCategory(transaction.category),
            transaction.recurringInterval || 'No',
            amountDisplay,
          ];
        });

        // Calculate available width (page width minus margins)
        // Landscape A4 is 297mm wide, minus 14mm margins on each side = 269mm available
        const availableWidth = pageWidth - 28; // 14mm left + 14mm right margin
        
        autoTable(doc, {
          startY: yPosition,
          head: [['Type', 'Date', 'Description', 'Property', 'Unit', 'Category', 'Recurring', 'Amount (PHP)']],
          body: tableData,
          theme: 'striped',
          headStyles: { 
            fillColor: [16, 185, 129], // emerald-500 (RentEase brand color)
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 9,
          },
          bodyStyles: { fontSize: 8 },
          alternateRowStyles: { fillColor: [249, 250, 251] },
          columnStyles: {
            0: { cellWidth: 18, halign: 'center' },
            1: { cellWidth: 25 },
            2: { cellWidth: 42 },
            3: { cellWidth: 32 },
            4: { cellWidth: 26 },
            5: { cellWidth: 26 },
            6: { cellWidth: 22, halign: 'center' },
            7: { cellWidth: 80, halign: 'right', fontStyle: 'bold' }, // Widest column for amount (needs more space for recurring details)
          },
          margin: { left: 14, right: 14 },
          styles: { 
            overflow: 'linebreak', 
            cellPadding: 2,
            fontSize: 8,
            lineWidth: 0.1,
          },
          tableWidth: availableWidth,
          showHead: 'everyPage',
        });
      } else {
        doc.setFontSize(11);
        doc.text('No transactions found for the selected filter.', 14, yPosition);
      }

      // Add footer with RentEase credit on all pages
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        
        // Footer line
        const pageHeight = doc.internal.pageSize.getHeight();
        doc.setDrawColor(200, 200, 200);
        doc.line(14, pageHeight - 20, pageWidth - 14, pageHeight - 20);
        
        // RentEase branding
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(16, 185, 129); // emerald-500
        doc.text(
          'RentEase',
          pageWidth / 2,
          pageHeight - 12,
          { align: 'center' }
        );
        
        // Generated by text
        doc.setFontSize(7);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(100, 100, 100);
        doc.text(
          'Generated by RentEase - Property Management Platform',
          pageWidth / 2,
          pageHeight - 6,
          { align: 'center' }
        );
        doc.setTextColor(0, 0, 0);
      }

      // Generate filename
      let filename = '';
      const propertyName = pdfFilterType === 'SPECIFIC_PROPERTY' 
        ? properties.find(p => p.id === pdfPropertyId)?.title.replace(/\s+/g, '-') || 'Property'
        : 'All-Properties';
      
      let dateSuffix = '';
      if (pdfDateFilter === 'SPECIFIC_MONTH') {
        const selectedDate = pdfCustomMonth ? new Date(`${pdfCustomMonth}-01`) : new Date();
        dateSuffix = `-${format(selectedDate, 'yyyy-MM')}`;
      } else if (pdfDateFilter === 'SPECIFIC_YEAR') {
        const year = pdfCustomYear || new Date().getFullYear().toString();
        dateSuffix = `-${year}`;
      } else if (pdfDateFilter === 'MONTH_RANGE') {
        if (pdfStartMonth && pdfEndMonth) {
          dateSuffix = `-${pdfStartMonth}-to-${pdfEndMonth}`;
        } else {
          dateSuffix = '-MonthRange';
        }
      } else {
        dateSuffix = '-AllTime';
      }

      filename = `Financial-Report-${propertyName}${dateSuffix}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;

      // Save PDF
      doc.save(filename);
      
      toast.success('PDF generated successfully');
      setShowDownloadModal(false);
      setPdfFilterType('ALL_PROPERTIES');
      setPdfPropertyId('');
      setPdfDateFilter('ALL_TIME');
      setPdfCustomMonth(format(new Date(), 'yyyy-MM'));
      setPdfCustomYear(new Date().getFullYear().toString());
      setPdfStartMonth(format(new Date(), 'yyyy-MM'));
      setPdfEndMonth(format(new Date(), 'yyyy-MM'));
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setGeneratingPdf(false);
    }
  };

  const dateFilterLabel = useMemo(() => {
    switch (dateFilter) {
      case 'SPECIFIC_MONTH': {
        if (!customMonth) return 'Current Month';
        const selected = new Date(`${customMonth}-01T00:00:00`);
        if (Number.isNaN(selected.getTime())) return 'Current Month';
        return format(selected, 'MMMM yyyy');
      }
      case 'SPECIFIC_YEAR': {
        const year = customYear || new Date().getFullYear().toString();
        return `Year ${year}`;
      }
      case 'MONTH_RANGE': {
        if (startMonth && endMonth) {
          const start = new Date(`${startMonth}-01`);
          const end = new Date(`${endMonth}-01`);
          if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
            return `${format(start, 'MMM yyyy')} - ${format(end, 'MMM yyyy')}`;
          }
        }
        return 'Month Range';
      }
      case 'ALL_TIME':
        return 'All Time';
      default:
        return 'Current Month';
    }
  }, [dateFilter, customMonth, customYear, startMonth, endMonth]);

  const activeFilterChips = useMemo(() => {
    const chips: Array<{ label: string; value: string }> = [];

    if (filterPropertyId !== 'ALL_PROPERTIES') {
      const property = properties.find(prop => prop.id === filterPropertyId);
      chips.push({
        label: 'Property',
        value: property?.title || 'Selected property',
      });

      if (filterUnitId && filterUnitId !== 'ALL_TRANSACTIONS') {
        let unitLabel = '';
        if (filterUnitId === 'PROPERTY_LEVEL') {
          unitLabel = 'Property-level';
        } else if (filterUnitId === 'ALL_UNITS') {
          unitLabel = 'All units';
        } else {
          const unit = allUnits.find(unit => unit.id === filterUnitId);
          unitLabel = unit?.label || 'Specific unit';
        }
        chips.push({
          label: 'Unit',
          value: unitLabel,
        });
      }
    }

    if (filterType !== 'ALL') {
      chips.push({
        label: 'Type',
        value: filterType === 'INCOME' ? 'Income' : 'Expense',
      });
    }

    if (filterType !== 'ALL' && filterCategory !== 'ALL') {
      chips.push({
        label: 'Category',
        value: formatCategory(filterCategory),
      });
    }

    // Always show period info
    chips.push({
      label: 'Period',
      value: dateFilterLabel,
    });

    if (searchTerm.trim()) {
      chips.push({
        label: 'Search',
        value: `“${searchTerm.trim()}”`,
      });
    }

    return chips;
  }, [
    filterPropertyId,
    filterUnitId,
    filterType,
    filterCategory,
    dateFilter,
    searchTerm,
    properties,
    allUnits,
    dateFilterLabel,
  ]);

  const renderFilterBadges = (keyPrefix: string, extraClass = '') => {
    if (activeFilterChips.length === 0) return null;
    return (
      <div className={`flex flex-wrap gap-1.5 text-[11px] text-slate-600 ${extraClass}`}>
        {activeFilterChips.map((chip, index) => (
          <Badge
            key={`${keyPrefix}-${chip.label}-${index}`}
            variant="secondary"
            className="bg-slate-100 text-slate-700 border-slate-200 font-medium"
          >
            <span className="uppercase tracking-wide text-[9px] text-slate-500">{chip.label}:</span>
            <span className="ml-1 text-[11px] text-slate-800">{chip.value}</span>
          </Badge>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative overflow-hidden rounded-2xl"
      >
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-sky-200/80 via-cyan-200/75 to-emerald-200/70 opacity-95" />
        <div className="relative m-[1px] rounded-[16px] bg-white/85 backdrop-blur-lg border border-white/60 shadow-lg">
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -top-12 -left-10 h-40 w-40 rounded-full bg-gradient-to-br from-sky-300/50 to-cyan-400/40 blur-3xl"
            initial={{ opacity: 0.4, scale: 0.85 }}
            animate={{ opacity: 0.7, scale: 1.05 }}
            transition={{ duration: 3, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -bottom-12 -right-12 h-48 w-48 rounded-full bg-gradient-to-tl from-emerald-200/40 to-cyan-200/35 blur-3xl"
            initial={{ opacity: 0.3 }}
            animate={{ opacity: 0.6 }}
            transition={{ duration: 3.5, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
          />

          <div className="px-4 sm:px-6 py-5 space-y-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4 min-w-0">
                <motion.div
                  whileHover={{ scale: 1.05, rotate: [0, -3, 3, 0] }}
                  className="relative flex-shrink-0"
                >
                  <div className="relative h-11 w-11 rounded-2xl bg-gradient-to-br from-sky-600 via-cyan-600 to-emerald-600 text-white grid place-items-center shadow-xl shadow-cyan-500/30">
                    <DollarSign className="h-5 w-5 relative z-10" />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/15 to-transparent" />
                  </div>
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 220 }}
                    className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-white text-sky-600 border border-sky-100 shadow-sm grid place-items-center"
                  >
                    <Sparkles className="h-3 w-3" />
                  </motion.div>
                  <motion.div
                    className="absolute inset-0 rounded-2xl border-2 border-cyan-400/30"
                    animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg sm:text-2xl font-semibold tracking-tight text-slate-900 truncate">
                      Financial Overview
                    </h1>
                    <motion.div
                      animate={{ rotate: [0, 8, -8, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Sparkles className="h-4 w-4 text-cyan-500" />
                    </motion.div>
                  </div>
                  <p className="text-sm text-slate-600 leading-6 flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-emerald-500" />
                    Track income, expenses, and profitability across rentals
                  </p>
                </div>
              </div>

              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                <Button
                  onClick={handleRefreshData}
                  disabled={refreshing}
                  className="h-11 rounded-xl bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500 px-5 text-sm font-semibold text-white shadow-md shadow-cyan-500/30 hover:brightness-110 disabled:opacity-70"
                >
                  {refreshing ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Refreshing
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <RefreshCcw className="h-4 w-4" />
                      Refresh
                    </span>
                  )}
                </Button>
              </div>
            </div>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
              style={{ originX: 0 }}
              className="relative h-1 w-full rounded-full overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-sky-400/80 via-cyan-400/80 to-emerald-400/80" />
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Filters Section - Compact with Collapsible */}
      <Card className="border border-slate-200 shadow-sm">
        <CardContent className="p-3">
          <div className="space-y-3">
            {/* Header with Filter Icon and Collapse Button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-500" />
                <h3 className="text-sm font-semibold text-slate-900">Filters</h3>
              </div>
              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 text-xs"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Clear All
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFiltersCollapsed(!isFiltersCollapsed)}
                  className="h-7 w-7 p-0"
                >
                  {isFiltersCollapsed ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronUp className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Period Filter Section - Always Visible */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setDateFilter('SPECIFIC_MONTH')}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                    dateFilter === 'SPECIFIC_MONTH'
                      ? 'bg-sky-100 text-sky-700 border-2 border-sky-400 shadow-sm'
                      : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
                  }`}
                  title="Show all transactions within the selected month"
                >
                  <CalendarDays className="h-3.5 w-3.5" />
                  Month
                </button>
                <button
                  onClick={() => setDateFilter('SPECIFIC_YEAR')}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                    dateFilter === 'SPECIFIC_YEAR'
                      ? 'bg-sky-100 text-sky-700 border-2 border-sky-400 shadow-sm'
                      : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
                  }`}
                  title="Show all transactions within the selected year"
                >
                  <Calendar className="h-3.5 w-3.5" />
                  Year
                </button>
                <button
                  onClick={() => setDateFilter('MONTH_RANGE')}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                    dateFilter === 'MONTH_RANGE'
                      ? 'bg-sky-100 text-sky-700 border-2 border-sky-400 shadow-sm'
                      : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
                  }`}
                  title="Show all transactions within a custom month range"
                >
                  <CalendarDays className="h-3.5 w-3.5" />
                  Month Range
                </button>
                <button
                  onClick={() => setDateFilter('ALL_TIME')}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                    dateFilter === 'ALL_TIME'
                      ? 'bg-sky-100 text-sky-700 border-2 border-sky-400 shadow-sm'
                      : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
                  }`}
                  title="Show all transactions grouped by year (2023, 2024, 2025, 2026)"
                >
                  <Clock className="h-3.5 w-3.5" />
                  All Time
                </button>
              </div>
              {/* Period Description and Input */}
              <div className="flex items-center gap-2 flex-wrap">
                {dateFilter === 'SPECIFIC_MONTH' && (
                  <>
                    <span className="text-xs text-slate-600">Show transactions in:</span>
                    <Input
                      type="month"
                      value={customMonth}
                      onChange={(e) => setCustomMonth(e.target.value)}
                      className="h-8 text-xs border-slate-300 focus:border-sky-400 focus:ring-sky-400 w-[140px]"
                    />
                  </>
                )}
                {dateFilter === 'SPECIFIC_YEAR' && (
                  <>
                    <span className="text-xs text-slate-600">Show transactions in year:</span>
                    <Input
                      type="number"
                      value={customYear}
                      onChange={(e) => setCustomYear(e.target.value)}
                      min="2000"
                      max={new Date().getFullYear() + 10}
                      placeholder="Year"
                      className="h-8 text-xs border-slate-300 focus:border-sky-400 focus:ring-sky-400 w-[100px]"
                    />
                  </>
                )}
                {dateFilter === 'MONTH_RANGE' && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-slate-600">Show transactions from:</span>
                    <Input
                      type="month"
                      value={startMonth}
                      onChange={(e) => setStartMonth(e.target.value)}
                      className="h-8 text-xs border-slate-300 focus:border-sky-400 focus:ring-sky-400 w-[140px]"
                    />
                    <span className="text-xs text-slate-600">to</span>
                    <Input
                      type="month"
                      value={endMonth}
                      onChange={(e) => setEndMonth(e.target.value)}
                      min={startMonth}
                      className="h-8 text-xs border-slate-300 focus:border-sky-400 focus:ring-sky-400 w-[140px]"
                    />
                    {startMonth && endMonth && new Date(`${endMonth}-01`) < new Date(`${startMonth}-01`) && (
                      <span className="text-xs text-red-600">End month must be after or equal to start month</span>
                    )}
                  </div>
                )}
                {dateFilter === 'ALL_TIME' && (
                  <span className="text-xs text-slate-600 italic">Displaying all transactions grouped by year (2023, 2024, 2025, 2026)</span>
                )}
              </div>
            </div>

            {/* Collapsible Filter Content */}
            <AnimatePresence>
              {!isFiltersCollapsed && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden space-y-3"
                >
                  {/* Other Filters - Compact Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {/* Property Filter */}
                    <Select
                      value={filterPropertyId}
                      onValueChange={(value) => {
                        setFilterPropertyId(value);
                        setFilterUnitId('ALL_TRANSACTIONS');
                      }}
                    >
                      <SelectTrigger className="h-8 text-xs border-slate-300">
                        <SelectValue placeholder="Property" />
                      </SelectTrigger>
                      <SelectContent className="z-[100]">
                        <SelectItem value="ALL_PROPERTIES">All Properties</SelectItem>
                        {properties.map(prop => (
                          <SelectItem key={prop.id} value={prop.id}>{prop.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Unit Filter */}
                    <Select
                      value={filterUnitId}
                      onValueChange={setFilterUnitId}
                      disabled={filterPropertyId === 'ALL_PROPERTIES'}
                    >
                      <SelectTrigger className="h-8 text-xs border-slate-300" disabled={filterPropertyId === 'ALL_PROPERTIES'}>
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent className="z-[100]">
                        <SelectItem value="ALL_TRANSACTIONS">All Transactions</SelectItem>
                        <SelectItem value="ALL_UNITS">All Units</SelectItem>
                        <SelectItem value="PROPERTY_LEVEL">Property Level</SelectItem>
                        {filteredUnits.map(unit => (
                          <SelectItem key={unit.id} value={unit.id}>{unit.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Type Filter */}
                    <Select
                      value={filterType}
                      onValueChange={setFilterType}
                    >
                      <SelectTrigger className="h-8 text-xs border-slate-300">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent className="z-[100]">
                        <SelectItem value="ALL">All Types</SelectItem>
                        <SelectItem value="INCOME">Income</SelectItem>
                        <SelectItem value="EXPENSE">Expense</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Category Filter */}
                    <Select
                      value={filterCategory}
                      onValueChange={setFilterCategory}
                      disabled={filterType === 'ALL'}
                    >
                      <SelectTrigger className="h-8 text-xs border-slate-300" disabled={filterType === 'ALL'}>
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent className="z-[100]">
                        <SelectItem value="ALL">All Categories</SelectItem>
                        {filterType === 'INCOME' ? (
                          <>
                            <SelectItem value="RENT">Rent</SelectItem>
                            <SelectItem value="LATE_FEE">Late Fee</SelectItem>
                            <SelectItem value="DEPOSIT">Deposit</SelectItem>
                            <SelectItem value="OTHER_INCOME">Other Income</SelectItem>
                          </>
                        ) : filterType === 'EXPENSE' ? (
                          <>
                            <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                            <SelectItem value="REPAIRS">Repairs</SelectItem>
                            <SelectItem value="UTILITIES">Utilities</SelectItem>
                            <SelectItem value="INSURANCE">Insurance</SelectItem>
                            <SelectItem value="TAXES">Taxes</SelectItem>
                            <SelectItem value="PROPERTY_MANAGEMENT">Property Management</SelectItem>
                            <SelectItem value="LISTING_ADVERTISING">Listing Advertising</SelectItem>
                            <SelectItem value="OTHER_EXPENSE">Other Expense</SelectItem>
                          </>
                        ) : null}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Search Bar - Always Visible */}
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-slate-400 h-3.5 w-3.5" />
                    <Input
                      placeholder="Search transactions, properties, categories..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 h-8 text-xs border-slate-300 focus:border-sky-400 focus:ring-sky-400"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Financial Activity Snapshot - Collapsible */}
      <Card className="shadow-sm border border-slate-200 py-0">
        <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
          <div className="flex flex-1 flex-col justify-center gap-1 px-4 pt-3 pb-2 sm:!py-0 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm">Financial Activity Snapshot</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsTimelineCollapsed(!isTimelineCollapsed)}
                  className="h-6 w-6 p-0"
                >
                  {isTimelineCollapsed ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronUp className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <CardDescription className="text-xs">
                Viewing data for {dateFilterLabel.toLowerCase()}
              </CardDescription>
            </div>
            {renderFilterBadges('timeline', 'mt-2')}
          </div>
          <div className="flex flex-wrap">
            <div className="relative z-30 flex flex-1 min-w-[120px] flex-col justify-center gap-1 border-t px-3 py-2.5 text-left sm:border-t-0 sm:border-l sm:px-4 sm:py-3">
              <span className="text-muted-foreground text-[10px] sm:text-xs">Income</span>
              <span className="text-sm leading-none font-bold sm:text-xl text-emerald-600">
                {formatCurrency(dailyTotal.income)}
              </span>
            </div>
            <div className="relative z-30 flex flex-1 min-w-[120px] flex-col justify-center gap-1 border-t border-l px-3 py-2.5 text-left sm:border-t-0 sm:px-4 sm:py-3">
              <span className="text-muted-foreground text-[10px] sm:text-xs">Expense</span>
              <span className="text-sm leading-none font-bold sm:text-xl text-red-600">
                {formatCurrency(dailyTotal.expense)}
              </span>
            </div>
            <div className="relative z-30 flex flex-1 min-w-[120px] flex-col justify-center gap-1 border-t border-l px-3 py-2.5 text-left sm:border-t-0 sm:px-4 sm:py-3">
              <span className="text-muted-foreground text-[10px] sm:text-xs">Net Profit</span>
              <span className={`text-sm leading-none font-bold sm:text-xl ${accountingMetrics.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {formatCurrency(accountingMetrics.netProfit)}
              </span>
            </div>
            <div className="relative z-30 flex flex-1 min-w-[100px] flex-col justify-center gap-1 border-t border-l px-3 py-2.5 text-left sm:border-t-0 sm:px-4 sm:py-3">
              <span className="text-muted-foreground text-[10px] sm:text-xs">Margin</span>
              <span className={`text-sm leading-none font-bold sm:text-lg ${accountingMetrics.profitMargin >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {accountingMetrics.profitMargin.toFixed(1)}%
              </span>
            </div>
          </div>
        </CardHeader>
        <AnimatePresence>
          {!isTimelineCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <CardContent className="px-2 sm:p-4">
                {/* Transaction Count Only */}
                {dailyChartData.length > 0 && (
                  <div className="mb-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Total Transactions</span>
                      <span className="font-semibold text-slate-900">{accountingMetrics.transactionCount}</span>
                    </div>
                  </div>
                )}
                {dailyChartData.length === 0 ? (
                  <div className="h-[200px] flex flex-col items-center justify-center text-xs text-slate-500 bg-slate-50 border border-dashed border-slate-200 rounded-lg">
                    No data available for the selected period.
                  </div>
                ) : (
                  <ChartContainer config={chartConfig} className="aspect-auto h-[200px] w-full">
                    <BarChart
                      accessibilityLayer
                      data={dailyChartData}
                      margin={{
                        left: 12,
                        right: 12,
                      }}
                    >
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        minTickGap={32}
                        tickFormatter={(value) => {
                          const date = new Date(value);
                          if (timelineRange?.granularity === 'YEARLY') {
                            return date.getFullYear().toString();
                          }
                          if (dateFilter === 'SPECIFIC_YEAR' || timelineRange?.granularity === 'MONTHLY') {
                            return date.toLocaleDateString("en-US", { month: "short" });
                          }
                          return date.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          });
                        }}
                        className="text-xs"
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(value) => {
                          if (value >= 1000000) return `₱${(value / 1000000).toFixed(1)}M`;
                          if (value >= 1000) return `₱${(value / 1000).toFixed(0)}K`;
                          return `₱${value}`;
                        }}
                        className="text-xs"
                      />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            className="w-[150px]"
                            formatter={(value: any) => formatCurrency(Number(value))}
                            labelFormatter={(value) => {
                              return new Date(value).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              });
                            }}
                          />
                        }
                      />
                      <Bar 
                        dataKey="income" 
                        fill={chartConfig.income.color} 
                        radius={4} 
                      />
                      <Bar 
                        dataKey="expense" 
                        fill={chartConfig.expense.color} 
                        radius={4} 
                      />
                    </BarChart>
                  </ChartContainer>
                )}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Transactions Table */}
      <div className="space-y-4">
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold text-slate-900">Transactions</h2>
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                      {filteredTransactions.length} result{filteredTransactions.length !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
                {renderFilterBadges('transactions', 'mt-2')}
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setDownloadType('PDF');
                    setShowDownloadModal(true);
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Report
                </Button>
                <Button onClick={() => {
                  resetTransactionForm();
                  setShowTransactionModal(true);
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Record Transaction
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {loading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        ) : filteredTransactions.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No transactions found</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px] whitespace-nowrap">Type</TableHead>
                      <TableHead className="w-[110px] whitespace-nowrap">Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Property</TableHead>
                      <TableHead className="w-[110px] whitespace-nowrap text-center">Unit</TableHead>
                      <TableHead className="w-[130px] whitespace-nowrap">Category</TableHead>
                      <TableHead className="w-[110px] whitespace-nowrap text-center">Recurring</TableHead>
                      <TableHead className="text-right w-[120px] whitespace-nowrap">Amount</TableHead>
                      <TableHead className="w-[80px] whitespace-nowrap">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedTransactions.map((transaction) => {
                      const words = transaction.description.split(/\s+/);
                      const truncatedDescription = words.length > 15 ? words.slice(0, 15).join(' ') + '...' : transaction.description;
                      const isIncome = transaction.type === 'INCOME';
                      return (
                        <TableRow 
                          key={transaction.id}
                          className={`cursor-pointer transition-all duration-200 ${
                            isIncome 
                              ? 'bg-emerald-50/30 hover:bg-emerald-50/60 border-l-4 border-l-emerald-400' 
                              : 'bg-red-50/30 hover:bg-red-50/60 border-l-4 border-l-red-400'
                          }`}
                          onClick={() => handleOpenTransactionUpdate(transaction)}
                        >
                          <TableCell className="align-middle">
                            <div className="flex items-center gap-2">
                              {isIncome ? (
                                <TrendingUp className={`w-4 h-4 text-emerald-600`} />
                              ) : (
                                <TrendingDown className={`w-4 h-4 text-red-600`} />
                              )}
                              <Badge 
                                variant="outline" 
                                className={`${
                                  isIncome 
                                    ? 'bg-emerald-100/50 text-emerald-700 border-emerald-300' 
                                    : 'bg-red-100/50 text-red-700 border-red-300'
                                }`}
                              >
                                {isIncome ? 'Income' : 'Expense'}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="align-middle text-sm text-slate-600">{formatDate(transaction.date)}</TableCell>
                          <TableCell className="align-middle">
                            <p className="font-medium text-slate-900">{truncatedDescription}</p>
                          </TableCell>
                          <TableCell className="align-middle">
                            <div className="space-y-1">
                              <p className="font-medium text-slate-900">{transaction.property.title}</p>
                            </div>
                          </TableCell>
                          <TableCell className="align-middle text-center">
                            {transaction.unit ? (
                              <Badge variant="outline">{transaction.unit.label}</Badge>
                            ) : (
                              <span className="text-gray-400 text-sm">Property-level</span>
                            )}
                          </TableCell>
                          <TableCell className="align-middle">
                            <Badge variant="outline">{formatCategory(transaction.category)}</Badge>
                          </TableCell>
                          <TableCell className="align-middle text-center">
                            {transaction.recurringInterval ? (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 inline-flex items-center justify-center">
                                <Repeat className="w-3 h-3 mr-1" />
                                {transaction.recurringInterval}
                              </Badge>
                            ) : (
                              <span className="text-xs text-slate-500">No</span>
                            )}
                          </TableCell>
                          <TableCell className={`text-right align-middle font-semibold ${isIncome ? 'text-emerald-600' : 'text-red-600'}`}>
                            <div className="flex flex-col items-end">
                              {transaction.recurringInterval ? (
                                (() => {
                                  const { totalAmount, occurrences } = calculateRecurringAmount(transaction);
                                  return (
                                    <>
                                      <span>{formatCurrency(totalAmount)}</span>
                                      <span className="text-xs text-slate-500 font-normal">
                                        {formatCurrency(transaction.amount)} × {occurrences}
                                      </span>
                                    </>
                                  );
                                })()
                              ) : (
                                <span>{formatCurrency(transaction.amount)}</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="align-middle" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTransaction(transaction.id)}
                              disabled={deletingTransactionId === transaction.id}
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-100/50"
                            >
                              {deletingTransactionId === transaction.id ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mt-4">
                <p className="text-sm text-slate-500">
                  Showing {paginatedTransactions.length ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}-
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredTransactions.length)} of {filteredTransactions.length} transactions
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-slate-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages || filteredTransactions.length === 0}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      {/* Create/Update Transaction Modal */}
      <Dialog open={showTransactionModal} onOpenChange={(open) => {
        setShowTransactionModal(open);
        if (!open) resetTransactionForm();
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTransaction ? 'Update Transaction' : 'Record Transaction'}</DialogTitle>
            <DialogDescription>
              {editingTransaction ? 'Update the transaction record details' : 'Add a new transaction record to your financials'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type *</Label>
                <Select
                  value={transactionForm.type}
                  onValueChange={(value) => {
                    // Set default category when type changes
                    const defaultCategory = value === 'INCOME' ? 'RENT' : 'MAINTENANCE';
                    setTransactionForm({ 
                      ...transactionForm, 
                      type: value,
                      category: transactionForm.category && 
                        ((value === 'INCOME' && ['RENT', 'LATE_FEE', 'DEPOSIT', 'OTHER_INCOME'].includes(transactionForm.category)) ||
                         (value === 'EXPENSE' && ['MAINTENANCE', 'REPAIRS', 'UTILITIES', 'INSURANCE', 'TAXES', 'PROPERTY_MANAGEMENT', 'LISTING_ADVERTISING', 'OTHER_EXPENSE'].includes(transactionForm.category)))
                        ? transactionForm.category 
                        : defaultCategory
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="z-[100]">
                    <SelectItem value="INCOME">Income</SelectItem>
                    <SelectItem value="EXPENSE">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Property *</Label>
                <Select
                  value={transactionForm.propertyId}
                  onValueChange={(value) => {
                    setTransactionForm({ ...transactionForm, propertyId: value, unitId: 'PROPERTY_LEVEL' });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent className="z-[100]">
                    {properties.map(prop => (
                      <SelectItem key={prop.id} value={prop.id}>{prop.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Unit (Optional)</Label>
                <Select
                  value={transactionForm.unitId || 'PROPERTY_LEVEL'}
                  onValueChange={(value) => setTransactionForm({ ...transactionForm, unitId: value === 'PROPERTY_LEVEL' ? '' : value })}
                  disabled={!transactionForm.propertyId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent className="z-[100]">
                    <SelectItem value="PROPERTY_LEVEL">Property-level</SelectItem>
                    {availableUnits.map(unit => (
                      <SelectItem key={unit.id} value={unit.id}>{unit.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Amount *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={transactionForm.amount}
                  onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={transactionForm.date}
                  onChange={(e) => setTransactionForm({ ...transactionForm, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={transactionForm.category || (transactionForm.type === 'INCOME' ? 'RENT' : 'MAINTENANCE')}
                  onValueChange={(value) => setTransactionForm({ ...transactionForm, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="z-[100]">
                    {transactionForm.type === 'INCOME' ? (
                      <>
                        <SelectItem value="RENT">Rent</SelectItem>
                        <SelectItem value="LATE_FEE">Late Fee</SelectItem>
                        <SelectItem value="DEPOSIT">Deposit</SelectItem>
                        <SelectItem value="OTHER_INCOME">Other Income</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                        <SelectItem value="REPAIRS">Repairs</SelectItem>
                        <SelectItem value="UTILITIES">Utilities</SelectItem>
                        <SelectItem value="INSURANCE">Insurance</SelectItem>
                        <SelectItem value="TAXES">Taxes</SelectItem>
                        <SelectItem value="PROPERTY_MANAGEMENT">Property Management</SelectItem>
                        <SelectItem value="LISTING_ADVERTISING">Listing Advertising</SelectItem>
                        <SelectItem value="OTHER_EXPENSE">Other Expense</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Description *</Label>
                <span className={`text-xs ${getWordCount(transactionForm.description) > 15 ? 'text-red-600' : 'text-gray-500'}`}>
                  {getWordCount(transactionForm.description)} / 15 words
                </span>
              </div>
              <Input
                value={transactionForm.description}
                onChange={(e) => setTransactionForm({ ...transactionForm, description: e.target.value })}
                placeholder={transactionForm.type === 'INCOME' ? 'e.g., Rent payment, Late fee' : 'e.g., Maintenance, Utilities'}
                maxLength={200}
              />
              {getWordCount(transactionForm.description) > 15 && (
                <p className="text-xs text-red-600">Description must not exceed 15 words</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Recurring Interval</Label>
              <Select
                value={transactionForm.recurringInterval || 'NONE'}
                onValueChange={(value) => setTransactionForm({ ...transactionForm, recurringInterval: value === 'NONE' ? '' : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select interval (optional)" />
                </SelectTrigger>
                <SelectContent className="z-[100]">
                  <SelectItem value="NONE">Not recurring</SelectItem>
                  <SelectItem value="DAILY">Daily</SelectItem>
                  <SelectItem value="WEEKLY">Weekly</SelectItem>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                  <SelectItem value="YEARLY">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowTransactionModal(false);
              resetTransactionForm();
            }}>Cancel</Button>
            <Button 
              onClick={editingTransaction ? handleUpdateTransaction : handleCreateTransaction} 
              disabled={submittingTransaction || getWordCount(transactionForm.description) > 15}
            >
              {submittingTransaction ? (editingTransaction ? 'Updating...' : 'Creating...') : (editingTransaction ? 'Update Transaction' : 'Create Transaction')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Download Report Modal (PDF/Excel) */}
      <Dialog open={showDownloadModal} onOpenChange={setShowDownloadModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Download Financial Report</DialogTitle>
            <DialogDescription>
              Select the format and data range you want to include in the report.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Report Format *</Label>
              <Select
                value={downloadType}
                onValueChange={(value: 'PDF' | 'EXCEL') => setDownloadType(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent className="z-[9999]">
                  <SelectItem value="PDF">PDF Document</SelectItem>
                  <SelectItem value="EXCEL">Excel Spreadsheet (.xlsx)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select
                value={pdfFilterType}
                onValueChange={(value: 'ALL_PROPERTIES' | 'SPECIFIC_PROPERTY') => {
                  setPdfFilterType(value);
                  if (value === 'ALL_PROPERTIES') {
                    setPdfPropertyId('');
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent className="z-[9999]">
                  <SelectItem value="ALL_PROPERTIES">All Properties</SelectItem>
                  <SelectItem value="SPECIFIC_PROPERTY">Specific Property</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {pdfFilterType === 'SPECIFIC_PROPERTY' && (
              <div className="space-y-2">
                <Label>Property *</Label>
                <Select
                  value={pdfPropertyId}
                  onValueChange={setPdfPropertyId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent className="z-[9999]">
                    {properties.map(prop => (
                      <SelectItem key={prop.id} value={prop.id}>{prop.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">
                  Note: This will include all transactions for the selected property (property-level and all units).
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select
                value={pdfDateFilter}
                onValueChange={(value: 'ALL_TIME' | 'SPECIFIC_MONTH' | 'SPECIFIC_YEAR' | 'MONTH_RANGE') => {
                  setPdfDateFilter(value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent className="z-[9999]">
                  <SelectItem value="ALL_TIME">All Time</SelectItem>
                  <SelectItem value="SPECIFIC_MONTH">Specific Month</SelectItem>
                  <SelectItem value="SPECIFIC_YEAR">Specific Year</SelectItem>
                  <SelectItem value="MONTH_RANGE">Month Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {pdfDateFilter === 'SPECIFIC_MONTH' && (
              <div className="space-y-2">
                <Label>Month</Label>
                <Input
                  type="month"
                  value={pdfCustomMonth}
                  onChange={(e) => setPdfCustomMonth(e.target.value)}
                  className="w-full"
                />
              </div>
            )}

            {pdfDateFilter === 'SPECIFIC_YEAR' && (
              <div className="space-y-2">
                <Label>Year</Label>
                <Input
                  type="number"
                  value={pdfCustomYear}
                  onChange={(e) => setPdfCustomYear(e.target.value)}
                  min="2000"
                  max={new Date().getFullYear() + 10}
                  placeholder="Year"
                  className="w-full"
                />
              </div>
            )}

            {pdfDateFilter === 'MONTH_RANGE' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Month *</Label>
                  <Input
                    type="month"
                    value={pdfStartMonth}
                    onChange={(e) => setPdfStartMonth(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Month *</Label>
                  <Input
                    type="month"
                    value={pdfEndMonth}
                    onChange={(e) => setPdfEndMonth(e.target.value)}
                    className="w-full"
                    min={pdfStartMonth}
                  />
                </div>
                {pdfStartMonth && pdfEndMonth && new Date(`${pdfEndMonth}-01`) < new Date(`${pdfStartMonth}-01`) && (
                  <p className="col-span-2 text-xs text-red-600">
                    End month must be after or equal to start month
                  </p>
                )}
              </div>
            )}

            <div className="bg-slate-50 p-3 rounded-lg space-y-1">
              <p className="text-sm font-semibold text-slate-700">Report will include:</p>
              <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                {pdfDateFilter === 'ALL_TIME' ? (
                  <li>All time transaction data</li>
                ) : pdfDateFilter === 'SPECIFIC_MONTH' ? (
                  <li>Transactions for selected month</li>
                ) : pdfDateFilter === 'SPECIFIC_YEAR' ? (
                  <li>Transactions for selected year</li>
                ) : pdfDateFilter === 'MONTH_RANGE' ? (
                  <li>Transactions from {pdfStartMonth ? format(new Date(`${pdfStartMonth}-01`), 'MMMM yyyy') : 'start'} to {pdfEndMonth ? format(new Date(`${pdfEndMonth}-01`), 'MMMM yyyy') : 'end'}</li>
                ) : null}
                {pdfFilterType === 'ALL_PROPERTIES' ? (
                  <li>All properties and units</li>
                ) : (
                  <li>Selected property only (all units)</li>
                )}
                {downloadType === 'PDF' ? (
                  <>
                    <li>Summary statistics (Income, Expense, Net Profit, Margin)</li>
                    <li>Detailed transaction table</li>
                    <li>All amounts in Philippine Peso (₱)</li>
                  </>
                ) : (
                  <>
                    <li>Detailed transaction spreadsheet</li>
                    <li>All amounts in Philippine Peso (PHP)</li>
                    <li>Formatted columns for easy analysis</li>
                  </>
                )}
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowDownloadModal(false);
                setPdfFilterType('ALL_PROPERTIES');
                setPdfPropertyId('');
                setPdfDateFilter('ALL_TIME');
                setPdfCustomMonth(format(new Date(), 'yyyy-MM'));
                setPdfCustomYear(new Date().getFullYear().toString());
                setPdfStartMonth(format(new Date(), 'yyyy-MM'));
                setPdfEndMonth(format(new Date(), 'yyyy-MM'));
              }}
              disabled={generatingPdf || generatingExcel}
            >
              Cancel
            </Button>
            <Button 
              onClick={downloadType === 'PDF' ? generatePDF : generateExcel}
              disabled={
                (downloadType === 'PDF' ? generatingPdf : generatingExcel) || 
                (pdfFilterType === 'SPECIFIC_PROPERTY' && !pdfPropertyId) ||
                (pdfDateFilter === 'SPECIFIC_MONTH' && !pdfCustomMonth) ||
                (pdfDateFilter === 'SPECIFIC_YEAR' && !pdfCustomYear) ||
                (pdfDateFilter === 'MONTH_RANGE' && (!pdfStartMonth || !pdfEndMonth || new Date(`${pdfEndMonth}-01`) < new Date(`${pdfStartMonth}-01`)))
              }
              className="bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500 text-white hover:brightness-110"
            >
              {(downloadType === 'PDF' ? generatingPdf : generatingExcel) ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Generate {downloadType === 'PDF' ? 'PDF' : 'Excel'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Financials;
