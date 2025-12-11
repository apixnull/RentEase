import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Loader2,
  RotateCcw,
  Percent,
  Building2,
  Home,
  Calendar,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { format, parseISO, startOfYear, endOfYear, eachMonthOfInterval, eachDayOfInterval, endOfMonth } from 'date-fns';
import { getOccupancyAnalyticsRequest, type OccupancyAnalyticsResponse } from '@/api/landlord/occupancyAnalyticsApi';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const OccupancyAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('ALL');
  const [analyticsData, setAnalyticsData] = useState<OccupancyAnalyticsResponse | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<{ month: number; unitId: string; propertyId: string } | null>(null);

  const currentYear = new Date().getFullYear();
  const years = useMemo(() => {
    // Show from 2021 to current year + 2 years (up to 2028)
    const startYear = 2021;
    const endYear = Math.max(currentYear + 2, 2028); // At least up to 2028
    return Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
  }, [currentYear]);

  const fetchAnalyticsData = async (year: number) => {
    try {
      const response = await getOccupancyAnalyticsRequest({ year });
      return response.data;
    } catch (error: any) {
      console.error(`Failed to fetch occupancy analytics for ${year}:`, error);
      return null;
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchAnalyticsData(selectedYear);
      if (data) {
        setAnalyticsData(data);
      } else {
        toast.error('Failed to load occupancy analytics');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Failed to load occupancy analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedYear]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
    toast.success('Occupancy analytics refreshed');
  };


  // Filter properties and units
  const filteredData = useMemo(() => {
    if (!analyticsData) return null;

    let filtered = { ...analyticsData };

    if (selectedPropertyId !== 'ALL') {
      filtered = {
        ...filtered,
        properties: filtered.properties.filter((p) => p.propertyId === selectedPropertyId),
      };
    }

    return filtered;
  }, [analyticsData, selectedPropertyId]);

  // Calculate timeline data for visualization (monthly)
  const getTimelineData = (unit: { leases: Array<{ startDate: string; endDate: string | null; status: string }> }) => {
    const yearStart = startOfYear(new Date(selectedYear, 0, 1));
    const yearEnd = endOfYear(new Date(selectedYear, 11, 31));
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const currentDate = new Date();
    const today = new Date(currentYear, currentMonth, currentDate.getDate());
    
    // Always show all 12 months
    const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

    return months.map((month) => {
      const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59);
      const isCurrentMonth = month.getFullYear() === currentYear && month.getMonth() === currentMonth;
      // Future month: either the entire year is in the future, or same year but month is after current month
      const isFutureMonth = selectedYear > currentYear || (selectedYear === currentYear && month.getMonth() > currentMonth);
      const isPastMonth = selectedYear < currentYear || (selectedYear === currentYear && month.getMonth() < currentMonth);
      
      // Calculate actual days occupied and reserved in this specific month
      let daysOccupiedInMonth = 0; // Past/today occupied days
      let daysReservedInMonth = 0; // Future scheduled days
      const totalDaysInMonth = monthEnd.getDate();
      const daysUpToToday = isCurrentMonth ? today.getDate() : (isPastMonth ? totalDaysInMonth : 0);

      unit.leases.forEach((lease) => {
        const leaseStart = parseISO(lease.startDate);
        let leaseEnd: Date;
        
        if (lease.status === 'ACTIVE') {
          if (lease.endDate) {
            leaseEnd = parseISO(lease.endDate);
          } else {
            leaseEnd = monthEnd;
          }
        } else {
          leaseEnd = lease.endDate ? parseISO(lease.endDate) : monthEnd;
        }

        // Check if lease overlaps with this month at all
        if (leaseStart <= monthEnd && leaseEnd >= monthStart) {
          const overlapStart = leaseStart < monthStart ? monthStart : leaseStart;
          const overlapEnd = leaseEnd > monthEnd ? monthEnd : leaseEnd;

          if (overlapStart <= overlapEnd) {
            // Calculate days for this lease in this month
            const diffTime = overlapEnd.getTime() - overlapStart.getTime();
            const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

            if (isFutureMonth) {
              // Entire month is in the future - all days are reserved
              daysReservedInMonth += Math.max(0, totalDays);
            } else if (isCurrentMonth) {
              // Current month - split between occupied (up to today) and reserved (after today)
              const todayEnd = new Date(currentYear, currentMonth, currentDate.getDate(), 23, 59, 59);
              
              // Days occupied (up to and including today)
              const occupiedOverlapStart = overlapStart;
              const occupiedOverlapEnd = new Date(Math.min(overlapEnd.getTime(), todayEnd.getTime()));
              if (occupiedOverlapStart <= occupiedOverlapEnd && occupiedOverlapStart <= todayEnd) {
                const occupiedDiff = occupiedOverlapEnd.getTime() - occupiedOverlapStart.getTime();
                const occupiedDays = Math.ceil(occupiedDiff / (1000 * 60 * 60 * 24)) + 1;
                daysOccupiedInMonth += Math.max(0, occupiedDays);
              }
              
              // Days reserved (after today)
              const tomorrowStart = new Date(currentYear, currentMonth, currentDate.getDate() + 1, 0, 0, 0);
              const reservedOverlapStart = new Date(Math.max(overlapStart.getTime(), tomorrowStart.getTime()));
              const reservedOverlapEnd = overlapEnd;
              if (reservedOverlapStart <= reservedOverlapEnd && reservedOverlapEnd >= tomorrowStart) {
                const reservedDiff = reservedOverlapEnd.getTime() - reservedOverlapStart.getTime();
                const reservedDays = Math.ceil(reservedDiff / (1000 * 60 * 60 * 24)) + 1;
                daysReservedInMonth += Math.max(0, reservedDays);
              }
            } else {
              // Past month - all days are occupied
              daysOccupiedInMonth += Math.max(0, totalDays);
            }
          }
        }
      });

      // Calculate percentages
      const occupancyPercentage = daysUpToToday > 0 ? Math.min(100, (daysOccupiedInMonth / daysUpToToday) * 100) : 0;
      const reservedPercentage = (totalDaysInMonth - daysUpToToday) > 0 
        ? Math.min(100, (daysReservedInMonth / (totalDaysInMonth - daysUpToToday)) * 100) 
        : 0;
      const totalScheduledPercentage = totalDaysInMonth > 0 
        ? Math.min(100, ((daysOccupiedInMonth + daysReservedInMonth) / totalDaysInMonth) * 100)
        : 0;
      
      const isOccupied = daysOccupiedInMonth > 0;
      const isReserved = daysReservedInMonth > 0;
      const isFullyOccupied = occupancyPercentage >= 100 && !isFutureMonth;
      const isFullyReserved = isFutureMonth && reservedPercentage >= 100;

      return {
        month: format(month, 'MMM'),
        isOccupied,
        isReserved,
        isFullyOccupied,
        isFullyReserved,
        occupancyPercentage,
        reservedPercentage,
        totalScheduledPercentage,
        daysOccupied: daysOccupiedInMonth,
        daysReserved: daysReservedInMonth,
        daysInMonth: totalDaysInMonth,
        daysUpToToday,
        monthIndex: month.getMonth(),
        isCurrentMonth,
        isFutureMonth,
        isPastMonth,
      };
    });
  };


  // Get status badge color
  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      ACTIVE: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      COMPLETED: 'bg-blue-100 text-blue-700 border-blue-200',
      TERMINATED: 'bg-red-100 text-red-700 border-red-200',
      CANCELLED: 'bg-gray-100 text-gray-700 border-gray-200',
      PENDING: 'bg-amber-100 text-amber-700 border-amber-200',
    };
    return statusColors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  // Calculate daily occupancy for a specific month
  const getDailyOccupancyData = (unit: { leases: Array<{ startDate: string; endDate: string | null; status: string; tenant: { firstName: string; lastName: string } }> }, monthIndex: number) => {
    const monthStart = new Date(selectedYear, monthIndex, 1);
    const monthEnd = endOfMonth(monthStart);
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const today = new Date(currentYear, currentMonth, currentDate.getDate());
    const isCurrentMonth = selectedYear === currentYear && monthIndex === currentMonth;
    
    // Determine if this entire month is in the future
    const isFutureMonth = selectedYear > currentYear || (selectedYear === currentYear && monthIndex > currentMonth);
    
    // Always show full month in daily breakdown (all days from 1 to end of month)
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    return days.map((day) => {
      const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0);
      const dayEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59);
      
      // A day is future if:
      // 1. The entire selected year is in the future, OR
      // 2. The entire month is in the future, OR
      // 3. It's the current month but the day is after today
      const isFuture = isFutureMonth || (isCurrentMonth && dayStart > today);
      
      let isOccupied = false;
      let isReserved = false; // Future days scheduled to be occupied
      let occupyingLease = null;

      for (const lease of unit.leases) {
        const leaseStart = parseISO(lease.startDate);
        let leaseEnd: Date;
        
        if (lease.status === 'ACTIVE') {
          // For active leases, use the actual endDate if it exists, otherwise assume it extends to month end
          if (lease.endDate) {
            leaseEnd = parseISO(lease.endDate);
          } else {
            // No endDate means ongoing - extend to month end
            leaseEnd = monthEnd;
          }
        } else {
          // For COMPLETED and TERMINATED, use the actual endDate
          leaseEnd = lease.endDate ? parseISO(lease.endDate) : monthEnd;
        }

        // Check if this specific day falls within the lease period
        if (leaseStart <= dayEnd && leaseEnd >= dayStart) {
          if (isFuture) {
            // This is a future day scheduled to be occupied
            isReserved = true;
          } else {
            // This day is in the past or today, already occupied
            isOccupied = true;
          }
          occupyingLease = lease;
          break; // Use first matching lease
        }
      }

      return {
        day: day.getDate(),
        date: day,
        isOccupied,
        isReserved,
        occupyingLease,
        isFuture,
        isToday: isCurrentMonth && dayStart.getTime() === today.getTime(),
      };
    });
  };

  if (loading && !analyticsData) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Percent className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No data available</p>
        </div>
      </div>
    );
  }

  const summary = filteredData?.summary || analyticsData.summary;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative overflow-hidden rounded-2xl"
      >
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-purple-200/80 via-violet-200/70 to-fuchsia-200/70 opacity-95" />
        <div className="relative m-[1px] rounded-[16px] bg-white/85 backdrop-blur-lg border border-white/60 shadow-lg">
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -top-12 -left-10 h-40 w-40 rounded-full bg-gradient-to-br from-purple-300/50 to-violet-400/40 blur-3xl"
            initial={{ opacity: 0.4, scale: 0.85 }}
            animate={{ opacity: 0.7, scale: 1.05 }}
            transition={{ duration: 3, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -bottom-12 -right-12 h-48 w-48 rounded-full bg-gradient-to-tl from-fuchsia-200/40 to-purple-200/35 blur-3xl"
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
                  <div className="relative h-11 w-11 rounded-2xl bg-gradient-to-br from-purple-600 via-violet-600 to-fuchsia-600 text-white grid place-items-center shadow-xl shadow-violet-500/30">
                    <Percent className="h-5 w-5 relative z-10" />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/15 to-transparent" />
                  </div>
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 220 }}
                    className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-white text-purple-600 border border-purple-100 shadow-sm grid place-items-center"
                  >
                    <Sparkles className="h-3 w-3" />
                  </motion.div>
                  <motion.div
                    className="absolute inset-0 rounded-2xl border-2 border-violet-400/30"
                    animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg sm:text-2xl font-semibold tracking-tight text-slate-900 truncate">
                      Occupancy Analytics
                    </h1>
                    <motion.div
                      animate={{ rotate: [0, 8, -8, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Sparkles className="h-4 w-4 text-fuchsia-500" />
                    </motion.div>
                  </div>
                  <p className="text-sm text-slate-600 leading-6 flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4 text-violet-500" />
                    Track occupancy rates by property and unit with detailed timeline visualization
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Select value={selectedYear.toString()} onValueChange={(val) => setSelectedYear(parseInt(val, 10))}>
                  <SelectTrigger className="w-full sm:w-[180px] h-11 rounded-xl border-slate-200 bg-white/80">
                    <Calendar className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.slice().reverse().map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="h-11 rounded-xl border-slate-200 bg-white/80 px-5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-white disabled:opacity-70"
                >
                  {refreshing ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Refreshing
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <RotateCcw className="h-4 w-4" />
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
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/80 via-violet-400/80 to-fuchsia-400/80" />
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
          </div>
        </div>
      </motion.div>


      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-sm border border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Building2 className="h-5 w-5 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{summary.totalProperties}</div>
            <p className="text-xs text-muted-foreground mt-1">Properties owned</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupied Units</CardTitle>
            <Home className="h-5 w-5 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">{summary.occupiedUnits}</div>
            <p className="text-xs text-muted-foreground mt-1">Out of {summary.totalUnits} total units</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vacant Units</CardTitle>
            <Home className="h-5 w-5 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{summary.vacantUnits}</div>
            <p className="text-xs text-muted-foreground mt-1">Available for lease</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-sm border border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <label className="text-sm font-medium text-slate-700 mb-2 block">Property</label>
              <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Properties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Properties</SelectItem>
                  {analyticsData.properties.map((property) => (
                    <SelectItem key={property.propertyId} value={property.propertyId}>
                      {property.propertyTitle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Properties and Units */}
      {filteredData && filteredData.properties.length > 0 ? (
        <div className="space-y-6">
          {filteredData.properties.map((property) => (
            <Card key={property.propertyId} className="shadow-sm border border-slate-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{property.propertyTitle}</CardTitle>
                    <CardDescription className="mt-1">
                      {property.occupiedUnits} occupied / {property.totalUnits} units
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {property.units.map((unit) => {
                    const timelineData = getTimelineData(unit);
                    return (
                      <div key={unit.unitId} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-slate-900">{unit.unitLabel}</h4>
                              {unit.leases.some(l => l.status === 'ACTIVE') && (
                                <Badge className="text-xs bg-emerald-100 text-emerald-700 border-emerald-200">
                                  Currently Occupied
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-600">
                              <span>
                                {unit.totalLeases} lease{unit.totalLeases !== 1 ? 's' : ''}
                              </span>
                              <span>•</span>
                              <span className="font-medium">
                                {unit.totalDaysOccupied} days occupied
                              </span>
                              {selectedYear === new Date().getFullYear() && (
                                <>
                                  <span>•</span>
                                  <span className="text-amber-600">
                                    {365 - unit.totalDaysOccupied} days remaining
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-sm font-semibold ${
                              unit.occupancyRate >= 80
                                ? 'border-emerald-200 text-emerald-700 bg-emerald-50'
                                : unit.occupancyRate >= 50
                                ? 'border-amber-200 text-amber-700 bg-amber-50'
                                : 'border-red-200 text-red-700 bg-red-50'
                            }`}
                          >
                            {unit.occupancyRate.toFixed(1)}%
                          </Badge>
                        </div>

                        {/* Timeline Visualization */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-slate-700">Monthly Occupancy Timeline</p>
                            <div className="flex items-center gap-3 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <div className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
                                Occupied
                              </span>
                              <span className="flex items-center gap-1">
                                <div className="h-2.5 w-2.5 rounded-sm bg-amber-400" />
                                Reserved
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            {timelineData.map((month, idx) => {
                              // Determine colors and opacity based on status
                              const hasActivity = month.isOccupied || month.isReserved;
                              const isFullMonth = month.isFullyOccupied || month.isFullyReserved;
                              const showPercentage = hasActivity && !isFullMonth;
                              const displayPercentage = month.isFutureMonth 
                                ? Math.round(month.reservedPercentage)
                                : Math.round(month.totalScheduledPercentage);
                              
                              // Get border and background colors
                              const getBorderClass = () => {
                                if (month.isOccupied && month.isReserved) {
                                  return 'border-emerald-400'; // Mixed - green border
                                } else if (month.isOccupied) {
                                  return 'border-emerald-400';
                                } else if (month.isReserved) {
                                  return 'border-amber-300';
                                }
                                return 'border-slate-200';
                              };

                              const getTitle = () => {
                                const parts = [`Click to view daily breakdown - ${month.month}`];
                                if (month.isOccupied) {
                                  parts.push(`${month.daysOccupied} days occupied`);
                                }
                                if (month.isReserved) {
                                  parts.push(`${month.daysReserved} days reserved`);
                                }
                                if (!month.isOccupied && !month.isReserved) {
                                  parts.push('Vacant');
                                }
                                if (month.isCurrentMonth) {
                                  parts.push('(Current)');
                                }
                                return parts.join(' - ');
                              };
                              
                              return (
                                <button
                                  key={idx}
                                  onClick={() => setSelectedMonth({ month: month.monthIndex, unitId: unit.unitId, propertyId: property.propertyId })}
                                  className={`flex-1 h-8 rounded border-2 transition-all relative overflow-hidden cursor-pointer hover:scale-105 hover:shadow-md ${
                                    hasActivity ? getBorderClass() : 'bg-slate-100 border-slate-200'
                                  } ${month.isCurrentMonth ? 'ring-2 ring-purple-400 ring-offset-1' : ''}`}
                                  title={getTitle()}
                                >
                                  {/* Occupied portion (green) - shown for past/current month */}
                                  {month.isOccupied && (
                                    <div 
                                      className="absolute inset-y-0 left-0 bg-gradient-to-b from-emerald-500 to-emerald-600"
                                      style={{ 
                                        width: month.isCurrentMonth && month.isReserved 
                                          ? `${(month.daysOccupied / month.daysInMonth) * 100}%` 
                                          : '100%',
                                        opacity: month.isFullyOccupied ? 1 : 0.4 + (month.occupancyPercentage / 100) * 0.6
                                      }}
                                    />
                                  )}
                                  {/* Reserved portion (yellow) - shown for future days */}
                                  {month.isReserved && (
                                    <div 
                                      className="absolute inset-y-0 bg-gradient-to-b from-amber-400 to-amber-500"
                                      style={{ 
                                        left: month.isCurrentMonth && month.isOccupied 
                                          ? `${(month.daysOccupied / month.daysInMonth) * 100}%` 
                                          : '0%',
                                        width: month.isCurrentMonth && month.isOccupied
                                          ? `${(month.daysReserved / month.daysInMonth) * 100}%`
                                          : '100%',
                                        opacity: month.isFullyReserved ? 1 : 0.4 + (month.reservedPercentage / 100) * 0.6
                                      }}
                                    />
                                  )}
                                  {/* Percentage indicator for partial months */}
                                  {showPercentage && displayPercentage > 0 && displayPercentage < 100 && (
                                    <div className="absolute inset-0 flex items-center justify-center z-10">
                                      <span className={`text-[8px] font-bold drop-shadow-sm ${
                                        month.isFutureMonth ? 'text-amber-800' : 'text-emerald-800'
                                      }`}>
                                        {displayPercentage}%
                                      </span>
                                    </div>
                                  )}
                                  {month.isCurrentMonth && (
                                    <div className="absolute -top-1 -right-1 h-2 w-2 bg-purple-500 rounded-full z-10" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                          <div className="flex justify-between text-xs text-slate-500">
                            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((monthLabel, idx) => (
                              <span key={idx} className="flex-1 text-center">
                                {monthLabel}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Lease Details - Compact Version */}
                        {unit.leases.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-slate-700">Lease History</p>
                            <div className="space-y-1.5">
                              {unit.leases.map((lease) => (
                                <div
                                  key={lease.leaseId}
                                  className="flex items-center justify-between p-2.5 bg-slate-50 rounded-md border border-slate-200"
                                >
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <Badge className={`text-xs px-1.5 py-0.5 ${getStatusBadge(lease.status)}`}>
                                      {lease.status}
                                    </Badge>
                                    <span className="text-xs font-medium text-slate-900 truncate">
                                      {lease.tenant.firstName} {lease.tenant.lastName}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3 text-xs text-slate-600 flex-shrink-0">
                                    <span className="hidden sm:inline">
                                      {format(parseISO(lease.startDate), 'MMM dd, yyyy')} -{' '}
                                      {lease.endDate
                                        ? format(parseISO(lease.endDate), 'MMM dd, yyyy')
                                        : 'Ongoing'}
                                    </span>
                                    <span className="sm:hidden">
                                      {format(parseISO(lease.startDate), 'MMM yyyy')}
                                    </span>
                                    <span className="font-semibold text-slate-900">
                                      ₱{lease.rentAmount.toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="shadow-sm border border-slate-200">
          <CardContent className="py-12 text-center">
            <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No data available for the selected filters</p>
          </CardContent>
        </Card>
      )}

      {/* Daily Occupancy Dialog */}
      {selectedMonth && analyticsData && (() => {
        const property = analyticsData.properties.find(p => p.propertyId === selectedMonth.propertyId);
        const unit = property?.units.find(u => u.unitId === selectedMonth.unitId);
        
        if (!unit) return null;

        const dailyData = getDailyOccupancyData(unit, selectedMonth.month);
        const monthName = format(new Date(selectedYear, selectedMonth.month, 1), 'MMMM yyyy');
        const daysInMonth = dailyData.length;
        const occupiedDays = dailyData.filter(d => d.isOccupied).length;
        const occupancyRate = daysInMonth > 0 ? ((occupiedDays / daysInMonth) * 100).toFixed(1) : '0.0';

        // Group days by week for calendar layout
        const weeks: Array<Array<typeof dailyData[0] | null>> = [];
        const firstDay = dailyData[0]?.date || new Date(selectedYear, selectedMonth.month, 1);
        const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
        
        // Create weeks array
        let currentWeek: Array<typeof dailyData[0] | null> = [];
        
        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDayOfWeek; i++) {
          currentWeek.push(null);
        }
        
        // Add all days of the month
        dailyData.forEach((day) => {
          currentWeek.push(day);
          // If we've filled 7 days, start a new week
          if (currentWeek.length === 7) {
            weeks.push([...currentWeek]);
            currentWeek = [];
          }
        });
        
        // Add remaining days to the last week
        if (currentWeek.length > 0) {
          // Fill remaining slots with null
          while (currentWeek.length < 7) {
            currentWeek.push(null);
          }
          weeks.push(currentWeek);
        }

        return (
          <Dialog open={!!selectedMonth} onOpenChange={(open) => !open && setSelectedMonth(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl">
                  {unit.unitLabel} - {monthName} Daily Breakdown
                </DialogTitle>
                <DialogDescription>
                  {occupiedDays} of {daysInMonth} days occupied ({occupancyRate}%)
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                {/* Weekly Calendar Grid */}
                <div className="space-y-2">
                  {/* Weekday Headers */}
                  <div className="grid grid-cols-7 gap-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <div key={day} className="text-center text-xs font-semibold text-slate-600 py-2">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  {/* Days Grid */}
                  {weeks.map((week, weekIdx) => (
                    <div key={weekIdx} className="grid grid-cols-7 gap-2">
                      {Array.from({ length: 7 }).map((_, dayIdx) => {
                        const dayData = week[dayIdx];
                        if (!dayData) {
                          return <div key={dayIdx} className="aspect-square" />; // Empty cell
                        }
                        
                        const getDayClassName = () => {
                          if (dayData.isOccupied) {
                            return 'bg-gradient-to-br from-emerald-500 to-emerald-600 border-emerald-400 text-white';
                          } else if (dayData.isReserved) {
                            return 'bg-gradient-to-br from-amber-400 to-amber-500 border-amber-300 text-white';
                          } else {
                            return 'bg-slate-100 border-slate-200 text-slate-700';
                          }
                        };

                        const getDayTitle = () => {
                          if (dayData.isOccupied && dayData.occupyingLease) {
                            return `${format(dayData.date, 'MMM dd, yyyy')}: Occupied by ${dayData.occupyingLease.tenant.firstName} ${dayData.occupyingLease.tenant.lastName}`;
                          } else if (dayData.isReserved && dayData.occupyingLease) {
                            return `${format(dayData.date, 'MMM dd, yyyy')}: Reserved/Scheduled - ${dayData.occupyingLease.tenant.firstName} ${dayData.occupyingLease.tenant.lastName}`;
                          } else {
                            return `${format(dayData.date, 'MMM dd, yyyy')}: Vacant`;
                          }
                        };

                        return (
                          <div
                            key={dayIdx}
                            className={`aspect-square rounded-lg border-2 p-2 flex flex-col items-center justify-center transition-all ${getDayClassName()}`}
                            title={getDayTitle()}
                          >
                            <span className={`text-sm font-semibold ${dayData.isOccupied || dayData.isReserved ? 'text-white' : 'text-slate-700'}`}>
                              {dayData.day}
                            </span>
                            {dayData.isOccupied && (
                              <span className="text-[10px] mt-0.5 opacity-90">
                                ✓
                              </span>
                            )}
                            {dayData.isReserved && (
                              <span className="text-[10px] mt-0.5 opacity-90">
                                ○
                              </span>
                            )}
                            {dayData.isToday && (
                              <div className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-blue-500 rounded-full border-2 border-white z-10" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>

                {/* Occupied Days Summary */}
                {occupiedDays > 0 && (
                  <div className="pt-4 border-t border-slate-200">
                    <p className="text-sm font-semibold text-slate-900 mb-3">Occupied Days</p>
                    <div className="space-y-2">
                      {unit.leases
                        .filter(lease => {
                          const leaseStart = parseISO(lease.startDate);
                          let leaseEnd: Date;
                          if (lease.status === 'ACTIVE') {
                            leaseEnd = lease.endDate ? parseISO(lease.endDate) : endOfMonth(new Date(selectedYear, selectedMonth.month, 1));
                          } else {
                            leaseEnd = lease.endDate ? parseISO(lease.endDate) : endOfMonth(new Date(selectedYear, selectedMonth.month, 1));
                          }
                          const monthStart = new Date(selectedYear, selectedMonth.month, 1);
                          const monthEnd = endOfMonth(monthStart);
                          return leaseStart <= monthEnd && leaseEnd >= monthStart;
                        })
                        .map((lease) => {
                          const leaseStart = parseISO(lease.startDate);
                          let leaseEnd: Date;
                          if (lease.status === 'ACTIVE') {
                            leaseEnd = lease.endDate ? parseISO(lease.endDate) : endOfMonth(new Date(selectedYear, selectedMonth.month, 1));
                          } else {
                            leaseEnd = lease.endDate ? parseISO(lease.endDate) : endOfMonth(new Date(selectedYear, selectedMonth.month, 1));
                          }
                          const monthStart = new Date(selectedYear, selectedMonth.month, 1);
                          const monthEnd = endOfMonth(monthStart);
                          
                          const overlapStart = leaseStart < monthStart ? monthStart : leaseStart;
                          const overlapEnd = leaseEnd > monthEnd ? monthEnd : leaseEnd;
                          
                          if (overlapStart > overlapEnd) return null;
                          
                          const daysInMonth = overlapEnd.getDate() - overlapStart.getDate() + 1;
                          const startDay = overlapStart.getDate();
                          const endDay = overlapEnd.getDate();
                          
                          return (
                            <div
                              key={lease.leaseId}
                              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                            >
                              <div className="flex items-center gap-2">
                                <Badge className={`text-xs ${getStatusBadge(lease.status)}`}>
                                  {lease.status}
                                </Badge>
                                <span className="text-sm font-medium text-slate-900">
                                  {lease.tenant.firstName} {lease.tenant.lastName}
                                </span>
                              </div>
                              <div className="text-xs text-slate-600">
                                Days {startDay}{startDay !== endDay ? `-${endDay}` : ''} ({daysInMonth} days)
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        );
      })()}
    </div>
  );
};

export default OccupancyAnalytics;
