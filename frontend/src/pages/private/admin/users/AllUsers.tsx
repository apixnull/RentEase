import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, 
  Search, 
  Mail, 
  Calendar, 
  Shield, 
  UserCheck, 
  UserX, 
  Building2, 
  Home,
  RefreshCcw,
  Loader2,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAllUsersRequest, type User } from '@/api/admin/userApi';
import { format } from 'date-fns';

const AllUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<'all' | 'day' | 'week' | 'month' | 'year'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'ADMIN' | 'LANDLORD' | 'TENANT'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'blocked' | 'verified'>('all');
  const [panelOpen, setPanelOpen] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async ({ silent = false }: { silent?: boolean } = {}) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      setRefreshing(true);
      const response = await getAllUsersRequest();
      setUsers(response.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      if (!silent) {
        setLoading(false);
      }
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    if (!refreshing) {
      fetchUsers({ silent: true });
    }
  };

  const stats = useMemo(() => {
    const adminCount = users.filter(u => u.role === 'ADMIN').length;
    const landlordCount = users.filter(u => u.role === 'LANDLORD').length;
    const tenantCount = users.filter(u => u.role === 'TENANT').length;
    const blockedCount = users.filter(u => u.isDisabled).length;
    const verifiedCount = users.filter(u => u.isVerified).length;

    return {
      total: users.length,
      admins: adminCount,
      landlords: landlordCount,
      tenants: tenantCount,
      blocked: blockedCount,
      verified: verifiedCount,
    };
  }, [users]);

  const filteredUsers = useMemo(() => {
    const now = Date.now();
    const rangeMap: Record<'day' | 'week' | 'month' | 'year', number> = {
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
      year: 365 * 24 * 60 * 60 * 1000,
    };

    return users.filter((user) => {
      const searchLower = searchTerm.toLowerCase();
      const fullName = `${user.firstName || ''} ${user.middleName || ''} ${user.lastName || ''}`.toLowerCase();
      const matchesSearch =
        user.email.toLowerCase().includes(searchLower) ||
        fullName.includes(searchLower) ||
        user.role.toLowerCase().includes(searchLower) ||
        (user.phoneNumber && user.phoneNumber.includes(searchTerm));

      if (!matchesSearch) return false;

      if (roleFilter !== 'all' && user.role !== roleFilter) {
        return false;
      }

      if (statusFilter === 'blocked' && !user.isDisabled) {
        return false;
      }

      if (statusFilter === 'verified' && !user.isVerified) {
        return false;
      }

      if (timeRange !== 'all') {
        const createdAt = new Date(user.createdAt).getTime();
        if (Number.isNaN(createdAt)) return false;
        const windowMs = rangeMap[timeRange];
        if (now - createdAt > windowMs) {
          return false;
        }
      }

      return true;
    });
  }, [users, searchTerm, roleFilter, statusFilter, timeRange]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  const getRoleBadgeClasses = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white';
      case 'LANDLORD':
        return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'TENANT':
        return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return Shield;
      case 'LANDLORD':
        return Building2;
      case 'TENANT':
        return Home;
      default:
        return Users;
    }
  };

  const getUserInitials = (user: User) => {
    const first = user.firstName?.[0]?.toUpperCase() || '';
    const last = user.lastName?.[0]?.toUpperCase() || '';
    return first + last || user.email[0].toUpperCase();
  };

  const getUserFullName = (user: User) => {
    const parts = [user.firstName, user.middleName, user.lastName].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : 'No name';
  };

  const handleStatFilter = (type: string) => {
    switch (type) {
      case 'total':
        setRoleFilter('all');
        setStatusFilter('all');
        break;
      case 'admins':
        setRoleFilter('ADMIN');
        setStatusFilter('all');
        break;
      case 'landlords':
        setRoleFilter('LANDLORD');
        setStatusFilter('all');
        break;
      case 'tenants':
        setRoleFilter('TENANT');
        setStatusFilter('all');
        break;
      case 'blocked':
        setRoleFilter('all');
        setStatusFilter('blocked');
        break;
      case 'verified':
        setRoleFilter('all');
        setStatusFilter('verified');
        break;
      default:
        break;
    }
  };

  const statsConfig = [
    {
      key: 'total',
      label: 'Total Users',
      value: stats.total,
      bg: 'bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-100',
      text: 'text-purple-700',
      isActive: roleFilter === 'all' && statusFilter === 'all',
    },
    {
      key: 'admins',
      label: 'Admins',
      value: stats.admins,
      bg: 'bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200',
      text: 'text-slate-700',
      isActive: roleFilter === 'ADMIN',
    },
    {
      key: 'landlords',
      label: 'Landlords',
      value: stats.landlords,
      bg: 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-100',
      text: 'text-blue-700',
      isActive: roleFilter === 'LANDLORD',
    },
    {
      key: 'tenants',
      label: 'Tenants',
      value: stats.tenants,
      bg: 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100',
      text: 'text-emerald-700',
      isActive: roleFilter === 'TENANT',
    },
    {
      key: 'blocked',
      label: 'Blocked',
      value: stats.blocked,
      bg: 'bg-gradient-to-br from-red-50 to-rose-50 border-red-100',
      text: 'text-red-700',
      isActive: statusFilter === 'blocked',
    },
    {
      key: 'verified',
      label: 'Verified',
      value: stats.verified,
      bg: 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100',
      text: 'text-amber-700',
      isActive: statusFilter === 'verified',
    },
  ];

  const goToUserDetails = (userId: string) => {
    navigate(`/admin/users/${userId}`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-2xl"
      >
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-purple-200/80 via-indigo-200/75 to-blue-200/70 opacity-95" />
        <div className="relative m-[1px] rounded-[16px] bg-white/85 backdrop-blur-lg border border-white/60 shadow-lg">
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -top-12 -left-10 h-40 w-40 rounded-full bg-gradient-to-br from-purple-300/50 to-indigo-400/40 blur-3xl"
            initial={{ opacity: 0.4, scale: 0.85 }}
            animate={{ opacity: 0.7, scale: 1.05 }}
            transition={{ duration: 3, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -bottom-12 -right-12 h-48 w-48 rounded-full bg-gradient-to-tl from-blue-200/40 to-indigo-200/35 blur-3xl"
            initial={{ opacity: 0.3 }}
            animate={{ opacity: 0.6 }}
            transition={{ duration: 3.5, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
          />

          <div className="px-4 sm:px-6 py-5 space-y-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4 min-w-0">
                <motion.div whileHover={{ scale: 1.05 }} className="relative flex-shrink-0">
                  <div className="relative h-11 w-11 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 text-white grid place-items-center shadow-xl shadow-indigo-500/30">
                    <Users className="h-5 w-5 relative z-10" />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/15 to-transparent" />
                  </div>
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 220 }}
                    className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-white text-purple-600 border border-purple-100 shadow-sm grid place-items-center"
                  >
                    <Sparkles className="h-3 w-3" />
                  </motion.div>
                </motion.div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg sm:text-2xl font-semibold tracking-tight text-slate-900 truncate">
                      User Management
                    </h1>
                  </div>
                  <p className="text-sm text-slate-600 leading-6 flex items-center gap-1.5">
                    <Shield className="h-4 w-4 text-indigo-500" />
                    Monitor registrations, roles, and account status
                  </p>
                </div>
              </div>

              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                <Button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="h-11 rounded-xl bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 px-5 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 hover:brightness-110 disabled:opacity-70"
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
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.15 }}
              style={{ originX: 0 }}
              className="relative h-1 w-full rounded-full overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/80 via-indigo-400/80 to-blue-400/80" />
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
              />
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Controls Panel */}
      <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-slate-900">Directory Filters & Insights</CardTitle>
              <CardDescription>Search, filter, and segment user accounts</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3"
              onClick={() => setPanelOpen((prev) => !prev)}
            >
              {panelOpen ? 'Hide' : 'Show'}
            </Button>
          </div>
        </CardHeader>
        {panelOpen && (
          <CardContent className="space-y-6 pt-2">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users by name, email, or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={timeRange} onValueChange={(value: 'all' | 'day' | 'week' | 'month' | 'year') => { setTimeRange(value); setPage(1); }}>
                <SelectTrigger className="w-full lg:w-[220px]">
                  <SelectValue placeholder="Created timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="day">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
              {(roleFilter !== 'all' || statusFilter !== 'all' || timeRange !== 'all' || searchTerm) && (
                <Button
                  variant="outline"
                  className="w-full lg:w-auto"
                  onClick={() => {
                    setRoleFilter('all');
                    setStatusFilter('all');
                    setTimeRange('all');
                    setSearchTerm('');
                    setPage(1);
                  }}
                >
                  Reset Filters
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-3">
              {statsConfig.map((stat) => (
                <button
                  type="button"
                  key={stat.key}
                  onClick={() => {
                    handleStatFilter(stat.key);
                    setPage(1);
                  }}
                  className={`rounded-xl border text-left p-3 transition-all text-sm ${stat.bg} ${
                    stat.isActive ? 'ring-2 ring-indigo-300 shadow-md' : 'hover:shadow-sm'
                  }`}
                >
                  <p className="text-xs font-medium text-slate-500">{stat.label}</p>
                  <p className={`text-2xl font-semibold mt-1 ${stat.text}`}>{stat.value}</p>
                </button>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Users List */}
      <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>User Directory</CardTitle>
          <CardDescription>
            {filteredUsers.length} result{filteredUsers.length === 1 ? '' : 's'} • Page {currentPage} of {totalPages}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">No users found</p>
              <p className="text-sm text-gray-500 mt-1">
                {searchTerm ? 'Try adjusting your search terms' : 'No users registered yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {paginatedUsers.map((user, index) => {
                const RoleIcon = getRoleIcon(user.role);
                return (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <Card
                      role="button"
                      tabIndex={0}
                      onClick={() => goToUserDetails(user.id)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          goToUserDetails(user.id);
                        }
                      }}
                      className="hover:shadow-sm transition-shadow cursor-pointer"
                    >
                      <CardContent className="p-1.5 sm:p-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8 border border-gray-200">
                            <AvatarImage src={user.avatarUrl || undefined} alt={getUserFullName(user)} />
                            <AvatarFallback className="bg-gradient-to-br from-purple-100 to-blue-100 text-purple-700 font-semibold">
                              {getUserInitials(user)}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <h3 className="font-semibold text-gray-900 truncate text-sm">
                                {getUserFullName(user)}
                              </h3>
                              {user.isVerified && <UserCheck className="h-4 w-4 text-emerald-600" />}
                              {user.isDisabled && <UserX className="h-4 w-4 text-red-500" />}
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-gray-600 mt-0.5">
                              <div className="flex items-center gap-1 min-w-0 max-w-[180px]">
                                <Mail className="h-3 w-3" />
                                <span className="truncate">{user.email}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>Since {format(new Date(user.createdAt), 'MMM d, yyyy')}</span>
                              </div>
                              {user.lastLogin && (
                                <div className="text-gray-500">
                                  Last login: {format(new Date(user.lastLogin), 'MMM d')}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1.5 min-w-[110px]">
                            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1 ${getRoleBadgeClasses(user.role)}`}>
                              <RoleIcon className="h-3 w-3" />
                              {user.role}
                            </span>
                            <span className="text-[10px] text-indigo-600 font-semibold uppercase tracking-wide">
                              View details
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}

          {filteredUsers.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 mt-4 pt-4 text-xs text-slate-600">
              <div>
                Showing {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredUsers.length)} of {filteredUsers.length}
              </div>
              <div className="flex items-center gap-3">
                <Select value={String(pageSize)} onValueChange={(value) => { setPageSize(Number(value)); setPage(1); }}>
                  <SelectTrigger className="h-8 w-[120px]">
                    <SelectValue placeholder="Rows" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 / page</SelectItem>
                    <SelectItem value="20">20 / page</SelectItem>
                    <SelectItem value="50">50 / page</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3"
                    disabled={currentPage <= 1}
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  >
                    Prev
                  </Button>
                  <span>
                    {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3"
                    disabled={currentPage >= totalPages}
                    onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AllUsers;

