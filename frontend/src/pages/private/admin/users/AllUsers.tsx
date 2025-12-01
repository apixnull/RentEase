import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, 
  Search, 
  Mail, 
  Calendar, 
  UserCheck, 
  UserX, 
  Building2, 
  Home,
  RefreshCcw,
  Loader2,
  Sparkles,
  Shield
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getAllUsersRequest, type User } from '@/api/admin/userApi';
import { format } from 'date-fns';

const AllUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<'all' | 'day' | 'week' | 'month' | 'year'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'LANDLORD' | 'TENANT'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'blocked' | 'verified'>('all');
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
    const nonAdminUsers = users.filter(u => u.role !== 'ADMIN');
    const landlordCount = nonAdminUsers.filter(u => u.role === 'LANDLORD').length;
    const tenantCount = nonAdminUsers.filter(u => u.role === 'TENANT').length;
    const blockedCount = nonAdminUsers.filter(u => u.isDisabled).length;
    const verifiedCount = nonAdminUsers.filter(u => u.isVerified).length;

    return {
      total: nonAdminUsers.length,
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
      // Exclude admin users
      if (user.role === 'ADMIN') return false;

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
      bg: 'bg-blue-50 border-blue-100',
      text: 'text-blue-700',
      isActive: roleFilter === 'all' && statusFilter === 'all',
    },
    {
      key: 'landlords',
      label: 'Landlords',
      value: stats.landlords,
      bg: 'bg-blue-50 border-blue-100',
      text: 'text-blue-700',
      isActive: roleFilter === 'LANDLORD',
    },
    {
      key: 'tenants',
      label: 'Tenants',
      value: stats.tenants,
      bg: 'bg-emerald-50 border-emerald-100',
      text: 'text-emerald-700',
      isActive: roleFilter === 'TENANT',
    },
    {
      key: 'blocked',
      label: 'Blocked',
      value: stats.blocked,
      bg: 'bg-red-50 border-red-100',
      text: 'text-red-700',
      isActive: statusFilter === 'blocked',
    },
    {
      key: 'verified',
      label: 'Verified',
      value: stats.verified,
      bg: 'bg-amber-50 border-amber-100',
      text: 'text-amber-700',
      isActive: statusFilter === 'verified',
    },
  ];

  const goToUserDetails = (userId: string) => {
    navigate(`/admin/users/${userId}`);
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-48 mb-2" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative overflow-hidden rounded-2xl"
        >
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-purple-200/80 via-indigo-200/75 to-blue-200/70 opacity-95" />
          <div className="relative m-[1px] rounded-[16px] bg-white/85 backdrop-blur-lg border border-white/60 shadow-lg">
            <motion.div
              aria-hidden
              className="pointer-events-none absolute -top-12 -left-10 h-40 w-40 rounded-full bg-gradient-to-br from-purple-300/50 to-indigo-400/40 blur-3xl"
              initial={{ opacity: 0.4, scale: 0.85 }}
              animate={{ opacity: 0.7, scale: 1.05 }}
              transition={{ duration: 3, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
            />
            <motion.div
              aria-hidden
              className="pointer-events-none absolute -bottom-12 -right-12 h-48 w-48 rounded-full bg-gradient-to-tl from-blue-200/40 to-indigo-200/35 blur-3xl"
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
                    <div className="relative h-11 w-11 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 text-white grid place-items-center shadow-xl shadow-indigo-500/30">
                      <Users className="h-5 w-5 relative z-10" />
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/15 to-transparent" />
                    </div>
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 220 }}
                      className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-white text-purple-600 border border-purple-100 shadow-sm grid place-items-center"
                    >
                      <Shield className="h-3 w-3" />
                    </motion.div>
                    <motion.div
                      className="absolute inset-0 rounded-2xl border-2 border-indigo-400/30"
                      animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h1 className="text-lg sm:text-2xl font-semibold tracking-tight text-slate-900 truncate">
                        User Management
                      </h1>
                      <motion.div
                        animate={{ rotate: [0, 8, -8, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <Sparkles className="h-4 w-4 text-indigo-500" />
                      </motion.div>
                    </div>
                    <p className="text-sm text-slate-600 leading-6 flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-purple-500" />
                      Manage landlords and tenants, monitor activity, and control access
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
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
                style={{ originX: 0 }}
                className="relative h-1 w-full rounded-full overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/80 via-indigo-400/80 to-blue-400/80" />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
                />
              </motion.div>
            </div>
          </div>
        </motion.div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, or phone number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={(value: 'all' | 'LANDLORD' | 'TENANT') => { setRoleFilter(value); setPage(1); }}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="LANDLORD">Landlord</SelectItem>
                <SelectItem value="TENANT">Tenant</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(value: 'all' | 'blocked' | 'verified') => { setStatusFilter(value); setPage(1); }}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
            <Select value={timeRange} onValueChange={(value: 'all' | 'day' | 'week' | 'month' | 'year') => { setTimeRange(value); setPage(1); }}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Time Range" />
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
                Reset
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {statsConfig.map((stat) => (
              <button
                type="button"
                key={stat.key}
                onClick={() => {
                  handleStatFilter(stat.key);
                  setPage(1);
                }}
                className={`rounded-lg border text-left p-3 transition-all ${stat.bg} ${
                  stat.isActive ? 'ring-2 ring-blue-300' : 'hover:shadow-sm'
                }`}
              >
                <p className="text-xs font-medium text-gray-600">{stat.label}</p>
                <p className={`text-xl font-semibold mt-1 ${stat.text}`}>{stat.value}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
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
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Login</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers.map((user) => {
                    const RoleIcon = getRoleIcon(user.role);
                    return (
                      <TableRow
                        key={user.id}
                        className="cursor-pointer"
                        onClick={() => goToUserDetails(user.id)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatarUrl || undefined} alt={getUserFullName(user)} />
                              <AvatarFallback className="bg-blue-100 text-blue-700">
                                {getUserInitials(user)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900">{getUserFullName(user)}</span>
                                {user.isVerified && <UserCheck className="h-4 w-4 text-emerald-600" />}
                                {user.isDisabled && <UserX className="h-4 w-4 text-red-500" />}
                              </div>
                              {user.phoneNumber && (
                                <p className="text-sm text-gray-500">{user.phoneNumber}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{user.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${getRoleBadgeClasses(user.role)}`}>
                            <RoleIcon className="h-3 w-3" />
                            {user.role}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {user.isVerified && (
                              <span className="text-xs text-emerald-600 font-medium">Verified</span>
                            )}
                            {user.isDisabled && (
                              <span className="text-xs text-red-600 font-medium">Blocked</span>
                            )}
                            {!user.isVerified && !user.isDisabled && (
                              <span className="text-xs text-gray-500">Active</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{format(new Date(user.createdAt), 'MMM d, yyyy')}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.lastLogin ? (
                            <span className="text-sm text-gray-600">
                              {format(new Date(user.lastLogin), 'MMM d, yyyy')}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">Never</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {filteredUsers.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t pt-4 mt-4">
                  <div className="text-sm text-gray-600">
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
                      <span className="text-sm text-gray-600">
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
            </>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default AllUsers;

