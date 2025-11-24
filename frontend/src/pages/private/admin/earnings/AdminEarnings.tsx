import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import { format } from 'date-fns';
import { Loader2, RefreshCcw, Sparkles, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { getAdminEarningsRequest } from '@/api/admin/earningsApi';
import type {
  EarningsRange,
  EarningsRecord,
  EarningsSummaryResponse,
} from '@/api/admin/earningsApi';

const chartConfig = {
  earnings: {
    label: 'Earnings',
    color: '#4f46e5',
  },
} satisfies ChartConfig;

const currencyFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 0,
});

const AdminEarnings = () => {
  const currentYear = new Date().getFullYear();
  const [range, setRange] = useState<EarningsRange>('this_month');
  const [year, setYear] = useState<number>(currentYear);
  const [paymentFilter, setPaymentFilter] = useState<'ALL' | 'FEATURED' | 'STANDARD'>('ALL');
  const [data, setData] = useState<EarningsSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tablePage, setTablePage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(8);

  const fetchData = async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      const response = await getAdminEarningsRequest({
        range,
        year: range === 'year' ? year : undefined,
      });
      setData(response.data);
    } catch (error: any) {
      if (error?.name === 'CanceledError') return;
      console.error('Error fetching earnings:', error);
      toast.error(error?.response?.data?.error || 'Failed to load earnings data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchData();
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range, year]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData({ silent: true });
  };

  const tableData: EarningsRecord[] = data?.records || [];

  const filteredRecords = useMemo(() => {
    if (paymentFilter === 'FEATURED') {
      return tableData.filter((record) => Math.round(record.amount) === 150);
    }
    if (paymentFilter === 'STANDARD') {
      return tableData.filter((record) => Math.round(record.amount) === 100);
    }
    return tableData;
  }, [tableData, paymentFilter]);

  const totalAllEarnings = useMemo(
    () => tableData.reduce((sum, record) => sum + Number(record.amount || 0), 0),
    [tableData]
  );

  const filteredSummary = useMemo(() => {
    const total = filteredRecords.reduce((sum, record) => sum + Number(record.amount || 0), 0);
    return {
      total,
      count: filteredRecords.length,
    };
  }, [filteredRecords]);

  const timelineData = useMemo(() => {
    if (!filteredRecords.length) {
      return [{ label: 'No data', total: 0 }];
    }
    const map = new Map<string, { label: string; total: number }>();
    filteredRecords.forEach((record) => {
      if (!record.paymentDate) return;
      const date = new Date(record.paymentDate);
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      const label = format(date, 'MMM yyyy');
      const existing = map.get(key) ?? { label, total: 0 };
      existing.total += Number(record.amount || 0);
      map.set(key, existing);
    });
    return Array.from(map.values()).sort(
      (a, b) => new Date(a.label).getTime() - new Date(b.label).getTime()
    );
  }, [filteredRecords]);

  const summary = data?.summary;

  const filterRanges: Array<{ label: string; value: EarningsRange }> = [
    { label: 'This Month', value: 'this_month' },
    { label: 'Last 3 Months', value: 'last_3_months' },
    { label: 'This Year', value: 'this_year' },
    { label: 'Specific Year', value: 'year' },
  ];

  const selectableYears = Array.from({ length: 6 }, (_, idx) => currentYear - idx);

  const featuredMetrics = useMemo(() => {
    const featuredRecords = tableData.filter((record) => Math.round(record.amount) === 150);
    const total = featuredRecords.reduce((sum, record) => sum + Number(record.amount || 0), 0);
    return { count: featuredRecords.length, total };
  }, [tableData]);

  const standardMetrics = useMemo(() => {
    const standardRecords = tableData.filter((record) => Math.round(record.amount) === 100);
    const total = standardRecords.reduce((sum, record) => sum + Number(record.amount || 0), 0);
    return { count: standardRecords.length, total };
  }, [tableData]);

  const sparklineData = useMemo(() => {
    const source = timelineData.length ? timelineData : [{ label: 'No data', total: 0 }];
    return source.slice(-6);
  }, [timelineData]);

  const paymentTypeChartData = useMemo(
    () => [
      { label: 'Featured', total: featuredMetrics.total },
      { label: 'Standard', total: standardMetrics.total },
    ],
    [featuredMetrics.total, standardMetrics.total]
  );

  useEffect(() => {
    setTablePage(1);
  }, [rowsPerPage, tableData.length, range, year]);

  const totalTablePages = Math.max(1, Math.ceil(tableData.length / rowsPerPage));
  const paginatedTableData = useMemo(() => {
    const start = (tablePage - 1) * rowsPerPage;
    return tableData.slice(start, start + rowsPerPage);
  }, [tableData, tablePage, rowsPerPage]);

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <Skeleton key={item} className="h-32 w-full" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-2xl"
      >
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-indigo-200/80 via-sky-200/75 to-cyan-200/60 opacity-95" />
        <div className="relative m-[1px] rounded-[16px] bg-white/85 backdrop-blur-lg border border-white/60 shadow-lg">
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -top-12 -left-10 h-40 w-40 rounded-full bg-gradient-to-br from-indigo-300/50 to-sky-400/40 blur-3xl"
            initial={{ opacity: 0.4, scale: 0.85 }}
            animate={{ opacity: 0.7, scale: 1.05 }}
            transition={{ duration: 3, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -bottom-12 -right-12 h-48 w-48 rounded-full bg-gradient-to-tl from-cyan-200/40 to-indigo-200/35 blur-3xl"
            initial={{ opacity: 0.3 }}
            animate={{ opacity: 0.6 }}
            transition={{ duration: 3.5, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
          />

          <div className="px-4 sm:px-6 py-5 space-y-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4 min-w-0">
                <motion.div whileHover={{ scale: 1.05 }} className="relative flex-shrink-0">
                  <div className="relative h-11 w-11 rounded-2xl bg-gradient-to-br from-indigo-600 via-blue-600 to-sky-600 text-white grid place-items-center shadow-xl shadow-indigo-500/30">
                    <Wallet className="h-5 w-5 relative z-10" />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/15 to-transparent" />
                  </div>
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 220 }}
                    className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-white text-indigo-600 border border-indigo-100 shadow-sm grid place-items-center"
                  >
                    <Sparkles className="h-3 w-3" />
                  </motion.div>
                </motion.div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg sm:text-2xl font-semibold tracking-tight text-slate-900 truncate">
                      Platform Earnings
                    </h1>
                  </div>
                  <p className="text-sm text-slate-600 leading-6 flex items-center gap-1.5">
                    Monitor paid listing revenue across time windows
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Select value={range} onValueChange={(value: EarningsRange) => setRange(value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    {filterRanges.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {range === 'year' && (
                  <Select value={String(year)} onValueChange={(value) => setYear(Number(value))}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectableYears.map((yr) => (
                        <SelectItem key={yr} value={String(yr)}>
                          {yr}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                <Button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="h-10 rounded-xl bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500 px-4 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 hover:brightness-110 disabled:opacity-70"
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
          </div>
        </div>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.15 }}
          style={{ originX: 0 }}
          className="h-1 w-full bg-gradient-to-r from-indigo-400/80 via-sky-400/80 to-cyan-400/80"
        />
      </motion.div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          {
            key: 'ALL' as const,
            title: 'All listings',
            count: tableData.length,
            total: totalAllEarnings,
            accent: 'from-slate-50 to-slate-100 border-slate-200',
          },
          {
            key: 'FEATURED' as const,
            title: 'Featured (₱150)',
            count: featuredMetrics.count,
            total: featuredMetrics.total,
            accent: 'from-amber-50 to-orange-50 border-amber-200',
          },
          {
            key: 'STANDARD' as const,
            title: 'Standard (₱100)',
            count: standardMetrics.count,
            total: standardMetrics.total,
            accent: 'from-emerald-50 to-teal-50 border-emerald-200',
          },
        ].map((filterCard) => (
          <button
            key={filterCard.key}
            type="button"
            onClick={() => {
              setPaymentFilter(filterCard.key);
              setTablePage(1);
            }}
            className={`rounded-xl border px-4 py-3 text-left transition ${
              filterCard.accent
            } ${
              paymentFilter === filterCard.key
                ? 'ring-2 ring-indigo-300 shadow-md'
                : 'hover:shadow-sm'
            }`}
          >
            <p className="text-xs font-medium text-slate-500">{filterCard.title}</p>
            <p className="text-xl font-semibold text-slate-900 mt-1">{filterCard.count}</p>
            <p className="text-xs text-slate-500">
              {currencyFormatter.format(filterCard.total)}
            </p>
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          {
            label: 'Total earnings',
            value: currencyFormatter.format(filteredSummary.total),
            stroke: '#4f46e5',
          },
          {
            label: 'Total listings',
            value: filteredSummary.count,
            stroke: '#0ea5e9',
          },
        ].map((card) => (
          <Card key={card.label} className="border bg-white shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>{card.label}</CardDescription>
              <CardTitle className="text-2xl">{card.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-16 w-full">
                <LineChart data={sparklineData}>
                  <XAxis dataKey="label" hide />
                  <YAxis hide />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke={card.stroke}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border border-amber-100 bg-white">
          <CardHeader>
            <CardDescription>Featured listing payments (₱150)</CardDescription>
            <CardTitle className="text-2xl">{featuredMetrics.count}</CardTitle>
            <p className="text-xs text-slate-500">
              {currencyFormatter.format(featuredMetrics.total)} earned
            </p>
          </CardHeader>
        </Card>
        <Card className="border border-emerald-100 bg-white">
          <CardHeader>
            <CardDescription>Standard listing payments (₱100)</CardDescription>
            <CardTitle className="text-2xl">{standardMetrics.count}</CardTitle>
            <p className="text-xs text-slate-500">
              {currencyFormatter.format(standardMetrics.total)} earned
            </p>
          </CardHeader>
        </Card>
      </div>

      <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm">
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Earnings trend</CardTitle>
            <CardDescription>
              {summary?.range
                ? `${summary.range.label} • ${format(new Date(summary.range.start), 'MMM d, yyyy')} - ${format(new Date(summary.range.end), 'MMM d, yyyy')}`
                : 'Select a range to view timeline'}
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-indigo-600 border-indigo-200">
            {timelineData.length} data point{timelineData.length === 1 ? '' : 's'}
          </Badge>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[320px] w-full">
            <LineChart data={timelineData}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis
                tickFormatter={(value) => currencyFormatter.format(value).replace('PHP', '₱')}
                tickLine={false}
                axisLine={false}
                width={80}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(label) => label}
                    formatter={(value) => currencyFormatter.format(Number(value))}
                  />
                }
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#4f46e5"
                strokeWidth={3}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                name="Earnings"
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Featured vs Standard revenue</CardTitle>
          <CardDescription>Total earnings grouped by payment tier</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[280px] w-full">
            <BarChart data={paymentTypeChartData}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis
                tickFormatter={(value) => currencyFormatter.format(value).replace('PHP', '₱')}
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(label) => label}
                    formatter={(value) => currencyFormatter.format(Number(value))}
                  />
                }
              />
              <Bar dataKey="total" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Paid listing breakdown</CardTitle>
          <CardDescription>Property, unit, payment source, and amount</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Listing</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Payment Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-slate-500">
                      No earnings recorded for this range.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedTableData.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900">{record.propertyTitle}</span>
                          <span className="text-xs text-slate-500">{record.unitLabel}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {record.providerName ? (
                          <Badge variant="outline" className="text-xs">
                            {record.providerName}
                          </Badge>
                        ) : (
                          <span className="text-xs text-slate-500">N/A</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {record.paymentDate ? format(new Date(record.paymentDate), 'MMM d, yyyy') : '—'}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-slate-900">
                        {currencyFormatter.format(record.amount)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span>Rows per page:</span>
              <Select value={String(rowsPerPage)} onValueChange={(value) => setRowsPerPage(Number(value))}>
                <SelectTrigger className="h-8 w-[100px]">
                  <SelectValue placeholder="Rows" />
                </SelectTrigger>
                <SelectContent>
                  {[5, 8, 12, 20].map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <Button
                variant="outline"
                size="sm"
                disabled={tablePage <= 1}
                onClick={() => setTablePage((prev) => Math.max(1, prev - 1))}
              >
                Prev
              </Button>
              <span>
                Page {tablePage} of {totalTablePages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={tablePage >= totalTablePages}
                onClick={() => setTablePage((prev) => Math.min(totalTablePages, prev + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminEarnings;

