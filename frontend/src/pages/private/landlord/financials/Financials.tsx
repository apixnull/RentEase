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
import { DollarSign, TrendingUp, TrendingDown, Plus, Repeat, Trash2, Sparkles, Users, X, ChevronDown, ChevronUp, Loader2, RefreshCcw, Filter, Download } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllTransactionsRequest, createTransactionRequest, updateTransactionRequest, deleteTransactionRequest, getPropertiesWithUnitsRequest } from '@/api/landlord/financialApi';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 

  
  calculateRecurringAmount, 
  formatCurrency, 
  formatCurrencyForPDF, 
  formatCategory, 
  getWordCount,
  transactionOccursOnDate,
  normalizeDate,
  recurringOccursInRange
} from './helpers';
import { useTransactionFilters } from './useTransactionFilters';

// Types
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

type DateFilterType = 'THIS_MONTH' | 'THIS_YEAR' | 'ALL_TIME';
type FilterType = 'ALL' | 'INCOME' | 'EXPENSE';
type ReportFilterType = 'ALL_PROPERTIES' | 'SPECIFIC_PROPERTY';
type FilterScope = 'ALL_PROPERTIES' | 'SPECIFIC_PROPERTY' | 'SPECIFIC_UNIT';

const Financials = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterScope, setFilterScope] = useState<FilterScope>('ALL_PROPERTIES');
  const [filterPropertyId, setFilterPropertyId] = useState<string>('');
  const [filterUnitId, setFilterUnitId] = useState<string>('');
  const [filterType, setFilterType] = useState<FilterType>('ALL');
  const [dateFilter, setDateFilter] = useState<DateFilterType>('THIS_MONTH');
  const [currentPage, setCurrentPage] = useState(1);
  const [isTimelineCollapsed, setIsTimelineCollapsed] = useState(true);
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
  const [pdfFilterType, setPdfFilterType] = useState<ReportFilterType>('ALL_PROPERTIES');
  const [pdfPropertyId, setPdfPropertyId] = useState<string>('');
  const [pdfDateFilter, setPdfDateFilter] = useState<DateFilterType>('ALL_TIME');
  const [generatingPdf, setGeneratingPdf] = useState(false);

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

  // Use custom hook for filtering
  const { filteredTransactions, dateRange } = useTransactionFilters({
    transactions,
    filterType,
    filterCategory: 'ALL',
    filterPropertyId: filterScope === 'SPECIFIC_PROPERTY' ? filterPropertyId : 'ALL_PROPERTIES',
    filterUnitId: filterScope === 'SPECIFIC_UNIT' ? filterUnitId : (filterScope === 'SPECIFIC_PROPERTY' ? 'ALL_TRANSACTIONS' : 'ALL_TRANSACTIONS'),
    dateFilter,
    customMonth: format(new Date(), 'yyyy-MM'),
    customYear: new Date().getFullYear().toString(),
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [filterScope, filterPropertyId, filterUnitId, filterType, dateFilter]);

  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTransactions.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredTransactions, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE));

  const selectedProperty = properties.find(p => p.id === transactionForm.propertyId);
  const availableUnits = selectedProperty?.Unit || [];


  // Get filtered transactions for timeline (applies all filters including date)
  const getFilteredTransactionsForTimeline = useMemo(() => {
    // Use the same filtered transactions as the table to ensure consistency
    return filteredTransactions;
  }, [filteredTransactions]);

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
    if (dateFilter === 'THIS_YEAR') {
      granularity = 'MONTHLY';
    } else if (dateFilter === 'THIS_MONTH') {
      granularity = 'DAILY';
    }
    return {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      granularity,
    };
  }, [dateRange, dateFilter]);



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
  } = useMemo(() => {
    if (!timelineRange) {
      return {
        chartData: [],
      };
    }

    const days: Date[] = [];
    const start = normalizeDate(new Date(timelineRange.startDate));
    const end = normalizeDate(new Date(timelineRange.endDate));
    const today = normalizeDate(new Date());
    // For THIS_MONTH, show all days in the month, not just up to today
    const effectiveEnd = dateFilter === 'THIS_MONTH' ? end : (end > today ? today : end);
    
    // Generate all days in the range (inclusive of both start and end)
    // Calculate the number of days between start and end
    const startTime = start.getTime();
    const endTime = effectiveEnd.getTime();
    const diffTime = endTime - startTime;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end
    
    // Generate all days explicitly
    for (let i = 0; i < diffDays; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      day.setHours(0, 0, 0, 0);
      // Only add if it's within the range
      if (day.getTime() <= endTime) {
        days.push(day);
      }
    }

    // Create daily entries for all days (even if no transactions)
    const dailyEntries = days.map(day => {
      let income = 0;
      let expense = 0;
      const normalizedDay = normalizeDate(day);

      // Check each transaction to see if it occurs on this day
      getFilteredTransactionsForTimeline.forEach(transaction => {
        // Use the helper function to check if transaction occurs on this day
        if (transactionOccursOnDate(transaction, normalizedDay)) {
          if (transaction.type === 'INCOME') {
            income += transaction.amount;
          } else {
            expense += transaction.amount;
          }
        }
      });

      return {
        date: format(normalizedDay, 'yyyy-MM-dd'),
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

    return {
      chartData,
    };
  }, [timelineRange, getFilteredTransactionsForTimeline, dateFilter]);

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

  // Calculate accounting metrics - use filteredTransactions for accurate totals
  const accountingMetrics = useMemo(() => {
    // Calculate totals from filtered transactions (same as table)
    const { income: accurateIncome, expense: accurateExpense } = filteredTransactions.reduce(
      (acc, transaction) => {
        if (transaction.recurringInterval && dateRange) {
          // For recurring transactions in date range, calculate occurrences within range
          const transactionDate = normalizeDate(new Date(transaction.date));
          const rangeStart = dateRange.startDate;
          const rangeEnd = dateRange.endDate;
          const today = normalizeDate(new Date());
          const effectiveEnd = rangeEnd > today ? today : rangeEnd;
          
          if (transactionDate <= effectiveEnd) {
            let occurrences = 0;
            const cursor = new Date(Math.max(transactionDate.getTime(), rangeStart.getTime()));
            const endDate = effectiveEnd;
            
            while (cursor <= endDate) {
              if (transactionOccursOnDate(transaction, cursor)) {
                occurrences++;
              }
              cursor.setDate(cursor.getDate() + 1);
            }
            
            const totalAmount = transaction.amount * occurrences;
            if (transaction.type === 'INCOME') {
              acc.income += totalAmount;
            } else {
              acc.expense += totalAmount;
            }
          }
        } else {
          // For non-recurring transactions, just add the amount
          if (transaction.type === 'INCOME') {
            acc.income += transaction.amount;
          } else {
            acc.expense += transaction.amount;
          }
        }
        return acc;
      },
      { income: 0, expense: 0 }
    );
    
    const netProfit = accurateIncome - accurateExpense;
    const profitMargin = accurateIncome > 0 ? (netProfit / accurateIncome) * 100 : 0;
    const transactionCount = filteredTransactions.length;

    return {
      netProfit,
      profitMargin,
      transactionCount,
      income: accurateIncome,
      expense: accurateExpense,
    };
  }, [filteredTransactions, dateRange]);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilterType('ALL');
    setFilterScope('ALL_PROPERTIES');
    setFilterPropertyId('');
    setFilterUnitId('');
    setDateFilter('THIS_MONTH');
  };

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return filterType !== 'ALL' || 
           filterScope !== 'ALL_PROPERTIES' || 
           dateFilter !== 'THIS_MONTH';
  }, [filterType, filterScope, dateFilter]);


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
        const now = new Date();

        if (pdfDateFilter === 'THIS_MONTH') {
          startRange = startOfMonth(now);
          endRange = endOfMonth(now);
        } else if (pdfDateFilter === 'THIS_YEAR') {
          startRange = startOfYear(now);
          endRange = endOfYear(now);
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
      if (pdfDateFilter === 'THIS_MONTH') {
        dateRangeText = ` - ${format(new Date(), 'MMMM yyyy')}`;
      } else if (pdfDateFilter === 'THIS_YEAR') {
        dateRangeText = ` - Year ${new Date().getFullYear()}`;
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
      if (pdfDateFilter === 'THIS_MONTH') {
        dateSuffix = `-${format(new Date(), 'yyyy-MM')}`;
      } else if (pdfDateFilter === 'THIS_YEAR') {
        dateSuffix = `-${new Date().getFullYear()}`;
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
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setGeneratingPdf(false);
    }
  };

  const dateFilterLabel = useMemo(() => {
    switch (dateFilter) {
      case 'THIS_MONTH':
        return format(new Date(), 'MMMM yyyy');
      case 'THIS_YEAR':
        return `Year ${new Date().getFullYear()}`;
      case 'ALL_TIME':
        return 'All Time';
      default:
        return format(new Date(), 'MMMM yyyy');
    }
  }, [dateFilter]);

  // Get all units from all properties for the unit filter
  const allUnits = useMemo(() => {
    return properties.flatMap(property => 
      (property.Unit || []).map(unit => ({
        ...unit,
        propertyTitle: property.title,
        propertyId: property.id,
      }))
    );
  }, [properties]);

  const activeFilterChips = useMemo(() => {
    const chips: Array<{ label: string; value: string }> = [];

    if (filterScope === 'SPECIFIC_PROPERTY' && filterPropertyId) {
      const property = properties.find(p => p.id === filterPropertyId);
      chips.push({
        label: 'Filter',
        value: property ? `Property: ${property.title}` : 'Selected property',
      });
    } else if (filterScope === 'SPECIFIC_UNIT' && filterUnitId) {
      const unit = allUnits.find(u => u.id === filterUnitId);
      chips.push({
        label: 'Filter',
        value: unit ? `Unit: ${unit.label} (${unit.propertyTitle})` : 'Selected unit',
      });
    }

    if (filterType !== 'ALL') {
      chips.push({
        label: 'Type',
        value: filterType === 'INCOME' ? 'Income' : 'Expense',
      });
    }

    // Always show period info
    chips.push({
      label: 'Period',
      value: dateFilterLabel,
    });

    return chips;
  }, [
    filterScope,
    filterPropertyId,
    filterUnitId,
    filterType,
    dateFilter,
    allUnits,
    properties,
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
                {formatCurrency(accountingMetrics.income)}
              </span>
            </div>
            <div className="relative z-30 flex flex-1 min-w-[120px] flex-col justify-center gap-1 border-t border-l px-3 py-2.5 text-left sm:border-t-0 sm:px-4 sm:py-3">
              <span className="text-muted-foreground text-[10px] sm:text-xs">Expense</span>
              <span className="text-sm leading-none font-bold sm:text-xl text-red-600">
                {formatCurrency(accountingMetrics.expense)}
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
                          if (dateFilter === 'THIS_YEAR' || timelineRange?.granularity === 'MONTHLY') {
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
            <div className="flex flex-col gap-4">
              {/* Header Row */}
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

              {/* Filters Row */}
              <div className="flex flex-col lg:flex-row lg:items-center gap-3 pt-2 border-t border-slate-200">
                {/* Period Filter */}
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-slate-500" />
                  <span className="text-xs font-medium text-slate-700">Period:</span>
                  <Select
                    value={dateFilter}
                    onValueChange={(value) => setDateFilter(value as DateFilterType)}
                  >
                    <SelectTrigger className="h-8 text-xs w-[140px]">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent className="z-[100]">
                      <SelectItem value="THIS_MONTH">This Month</SelectItem>
                      <SelectItem value="THIS_YEAR">This Year</SelectItem>
                      <SelectItem value="ALL_TIME">All Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Scope Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-700">Scope:</span>
                  <Select
                    value={filterScope}
                    onValueChange={(value) => {
                      setFilterScope(value as FilterScope);
                      if (value === 'ALL_PROPERTIES') {
                        setFilterPropertyId('');
                        setFilterUnitId('');
                      } else if (value === 'SPECIFIC_PROPERTY') {
                        setFilterUnitId('');
                      } else if (value === 'SPECIFIC_UNIT') {
                        setFilterPropertyId('');
                      }
                    }}
                  >
                    <SelectTrigger className="h-8 text-xs w-[150px]">
                      <SelectValue placeholder="Select scope" />
                    </SelectTrigger>
                    <SelectContent className="z-[100]">
                      <SelectItem value="ALL_PROPERTIES">All Properties</SelectItem>
                      <SelectItem value="SPECIFIC_PROPERTY">Specific Property</SelectItem>
                      <SelectItem value="SPECIFIC_UNIT">Specific Unit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Property Selection (when filterScope is SPECIFIC_PROPERTY) */}
                {filterScope === 'SPECIFIC_PROPERTY' && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-700">Property:</span>
                    <Select
                      value={filterPropertyId}
                      onValueChange={setFilterPropertyId}
                    >
                      <SelectTrigger className="h-8 text-xs w-[180px]">
                        <SelectValue placeholder="Select property" />
                      </SelectTrigger>
                      <SelectContent className="z-[100]">
                        {properties.map(prop => (
                          <SelectItem key={prop.id} value={prop.id}>
                            {prop.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Unit Selection (when filterScope is SPECIFIC_UNIT) */}
                {filterScope === 'SPECIFIC_UNIT' && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-700">Unit:</span>
                    <Select
                      value={filterUnitId}
                      onValueChange={setFilterUnitId}
                    >
                      <SelectTrigger className="h-8 text-xs w-[180px]">
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent className="z-[100] max-h-[300px] overflow-y-auto">
                        {allUnits.map(unit => (
                          <SelectItem key={unit.id} value={unit.id}>
                            {unit.label} ({unit.propertyTitle})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Clear button */}
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 text-xs px-2 ml-auto"
                  >
                    <X className="w-3.5 h-3.5 mr-1" />
                    Clear All
                  </Button>
                )}
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          {/* Header with Gradient */}
          <div className="relative overflow-hidden rounded-t-lg bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500 p-6">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                  transactionForm.type === 'INCOME' 
                    ? 'bg-emerald-500/20 backdrop-blur-sm' 
                    : transactionForm.type === 'EXPENSE'
                    ? 'bg-red-500/20 backdrop-blur-sm'
                    : 'bg-white/20 backdrop-blur-sm'
                }`}>
                  <DollarSign className={`h-6 w-6 ${
                    transactionForm.type === 'INCOME' 
                      ? 'text-emerald-100' 
                      : transactionForm.type === 'EXPENSE'
                      ? 'text-red-100'
                      : 'text-white'
                  }`} />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-white">
                    {editingTransaction ? 'Update Transaction' : 'Record Transaction'}
                  </DialogTitle>
                  <DialogDescription className="text-sky-100 mt-1">
                    {editingTransaction ? 'Update the transaction record details' : 'Add a new transaction record to your financials'}
                  </DialogDescription>
                </div>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-6">
            {/* Transaction Type Selection - Prominent */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <span className="text-red-500">*</span>
                Transaction Type
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const defaultCategory = 'RENT';
                    setTransactionForm({ 
                      ...transactionForm, 
                      type: 'INCOME',
                      category: transactionForm.category && ['RENT', 'LATE_FEE', 'DEPOSIT', 'OTHER_INCOME'].includes(transactionForm.category)
                        ? transactionForm.category 
                        : defaultCategory
                    });
                  }}
                  className={`relative p-4 rounded-xl border-2 transition-all ${
                    transactionForm.type === 'INCOME'
                      ? 'border-emerald-500 bg-emerald-50 shadow-md'
                      : 'border-slate-200 bg-slate-50 hover:border-emerald-300 hover:bg-emerald-50/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      transactionForm.type === 'INCOME' ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}>
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-left">
                      <div className={`font-semibold ${transactionForm.type === 'INCOME' ? 'text-emerald-700' : 'text-slate-700'}`}>
                        Income
                      </div>
                      <div className="text-xs text-slate-500">Money received</div>
                    </div>
                  </div>
                  {transactionForm.type === 'INCOME' && (
                    <div className="absolute top-2 right-2">
                      <div className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    </div>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const defaultCategory = 'MAINTENANCE';
                    setTransactionForm({ 
                      ...transactionForm, 
                      type: 'EXPENSE',
                      category: transactionForm.category && ['MAINTENANCE', 'REPAIRS', 'UTILITIES', 'INSURANCE', 'TAXES', 'PROPERTY_MANAGEMENT', 'LISTING_ADVERTISING', 'OTHER_EXPENSE'].includes(transactionForm.category)
                        ? transactionForm.category 
                        : defaultCategory
                    });
                  }}
                  className={`relative p-4 rounded-xl border-2 transition-all ${
                    transactionForm.type === 'EXPENSE'
                      ? 'border-red-500 bg-red-50 shadow-md'
                      : 'border-slate-200 bg-slate-50 hover:border-red-300 hover:bg-red-50/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      transactionForm.type === 'EXPENSE' ? 'bg-red-500' : 'bg-slate-300'
                    }`}>
                      <TrendingDown className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-left">
                      <div className={`font-semibold ${transactionForm.type === 'EXPENSE' ? 'text-red-700' : 'text-slate-700'}`}>
                        Expense
                      </div>
                      <div className="text-xs text-slate-500">Money spent</div>
                    </div>
                  </div>
                  {transactionForm.type === 'EXPENSE' && (
                    <div className="absolute top-2 right-2">
                      <div className="h-5 w-5 rounded-full bg-red-500 flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* Property and Unit */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <span className="text-red-500">*</span>
                  Property
                </Label>
                <Select
                  value={transactionForm.propertyId}
                  onValueChange={(value) => {
                    setTransactionForm({ ...transactionForm, propertyId: value, unitId: 'PROPERTY_LEVEL' });
                  }}
                >
                  <SelectTrigger className="h-11 border-slate-300 focus:border-emerald-500 focus:ring-emerald-500">
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent className="z-[100]">
                    {properties.map(prop => (
                      <SelectItem key={prop.id} value={prop.id}>{prop.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">Unit (Optional)</Label>
                <Select
                  value={transactionForm.unitId || 'PROPERTY_LEVEL'}
                  onValueChange={(value) => setTransactionForm({ ...transactionForm, unitId: value === 'PROPERTY_LEVEL' ? '' : value })}
                  disabled={!transactionForm.propertyId}
                >
                  <SelectTrigger className="h-11 border-slate-300 focus:border-emerald-500 focus:ring-emerald-500" disabled={!transactionForm.propertyId}>
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
            </div>

            {/* Amount and Date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <span className="text-red-500">*</span>
                  Amount (PHP)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">₱</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={transactionForm.amount}
                    onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })}
                    placeholder="0.00"
                    className="h-11 pl-8 border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <span className="text-red-500">*</span>
                  Date
                </Label>
                <Input
                  type="date"
                  value={transactionForm.date}
                  onChange={(e) => setTransactionForm({ ...transactionForm, date: e.target.value })}
                  className="h-11 border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Category</Label>
              <Select
                value={transactionForm.category || (transactionForm.type === 'INCOME' ? 'RENT' : 'MAINTENANCE')}
                onValueChange={(value) => setTransactionForm({ ...transactionForm, category: value })}
              >
                <SelectTrigger className="h-11 border-slate-300 focus:border-emerald-500 focus:ring-emerald-500">
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

            {/* Description */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <span className="text-red-500">*</span>
                  Description
                </Label>
                <span className={`text-xs font-medium ${
                  getWordCount(transactionForm.description) > 15 
                    ? 'text-red-600' 
                    : getWordCount(transactionForm.description) > 12
                    ? 'text-amber-600'
                    : 'text-slate-500'
                }`}>
                  {getWordCount(transactionForm.description)} / 15 words
                </span>
              </div>
              <Input
                value={transactionForm.description}
                onChange={(e) => setTransactionForm({ ...transactionForm, description: e.target.value })}
                placeholder={transactionForm.type === 'INCOME' ? 'e.g., Rent payment, Late fee' : 'e.g., Maintenance, Utilities'}
                maxLength={200}
                className="h-11 border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
              />
              {getWordCount(transactionForm.description) > 15 && (
                <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                  <X className="h-3 w-3" />
                  Description must not exceed 15 words
                </p>
              )}
            </div>

            {/* Recurring Interval */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Repeat className="h-4 w-4 text-slate-500" />
                Recurring Interval
              </Label>
              <Select
                value={transactionForm.recurringInterval || 'NONE'}
                onValueChange={(value) => setTransactionForm({ ...transactionForm, recurringInterval: value === 'NONE' ? '' : value })}
              >
                <SelectTrigger className="h-11 border-slate-300 focus:border-emerald-500 focus:ring-emerald-500">
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

          {/* Footer */}
          <DialogFooter className="px-6 py-4 bg-slate-50 border-t border-slate-200 rounded-b-lg">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowTransactionModal(false);
                resetTransactionForm();
              }}
              className="h-11 px-6"
            >
              Cancel
            </Button>
            <Button 
              onClick={editingTransaction ? handleUpdateTransaction : handleCreateTransaction} 
              disabled={submittingTransaction || getWordCount(transactionForm.description) > 15}
              className="h-11 px-6 bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500 text-white hover:brightness-110 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {submittingTransaction ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {editingTransaction ? 'Updating...' : 'Creating...'}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  {editingTransaction ? (
                    <>
                      <Repeat className="h-4 w-4" />
                      Update Transaction
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Create Transaction
                    </>
                  )}
                </span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Download Report Modal (PDF) */}
      <Dialog open={showDownloadModal} onOpenChange={setShowDownloadModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Download Financial Report</DialogTitle>
            <DialogDescription>
              Select the data range you want to include in the PDF report.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
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
                onValueChange={(value: DateFilterType) => {
                  setPdfDateFilter(value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent className="z-[9999]">
                  <SelectItem value="ALL_TIME">All Time</SelectItem>
                  <SelectItem value="THIS_MONTH">This Month</SelectItem>
                  <SelectItem value="THIS_YEAR">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg space-y-1">
              <p className="text-sm font-semibold text-slate-700">Report will include:</p>
              <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                {pdfDateFilter === 'ALL_TIME' ? (
                  <li>All time transaction data</li>
                ) : pdfDateFilter === 'THIS_MONTH' ? (
                  <li>Transactions for this month</li>
                ) : pdfDateFilter === 'THIS_YEAR' ? (
                  <li>Transactions for this year</li>
                ) : null}
                {pdfFilterType === 'ALL_PROPERTIES' ? (
                  <li>All properties and units</li>
                ) : (
                  <li>Selected property only (all units)</li>
                )}
                <li>Summary statistics (Income, Expense, Net Profit, Margin)</li>
                <li>Detailed transaction table</li>
                <li>All amounts in Philippine Peso (₱)</li>
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
              }}
              disabled={generatingPdf}
            >
              Cancel
            </Button>
            <Button 
              onClick={generatePDF}
              disabled={
                generatingPdf || 
                (pdfFilterType === 'SPECIFIC_PROPERTY' && !pdfPropertyId)
              }
              className="bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500 text-white hover:brightness-110"
            >
              {generatingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Generate PDF
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
