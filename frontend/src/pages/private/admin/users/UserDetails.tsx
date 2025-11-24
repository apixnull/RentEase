import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Shield,
  Mail,
  UserCircle2,
  ShieldCheck,
  Ban,
  Lock,
  CalendarClock,
  AlertTriangle,
  ListChecks,
  RefreshCcw,
  Loader2,
  Sparkles,
  UserCog,
  ShieldAlert,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getUserDetailsRequest, updateUserStatusRequest, type LandlordOffense, type UserDetails } from '@/api/admin/userApi';

const roleThemes: Record<string, string> = {
  ADMIN: 'bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 border border-purple-200',
  LANDLORD: 'bg-blue-100 text-blue-700 border border-blue-200',
  TENANT: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
};

const severityThemes: Record<string, string> = {
  LOW: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  MEDIUM: 'bg-amber-50 text-amber-700 border border-amber-100',
  HIGH: 'bg-red-50 text-red-700 border border-red-100',
};

const severityRowBg: Record<string, string> = {
  HIGH: 'bg-rose-50/90 border-rose-100',
  MEDIUM: 'bg-amber-50/80 border-amber-100',
  LOW: 'bg-emerald-50/80 border-emerald-100',
};

const formatDate = (value: string | null, pattern = 'MMM d, yyyy p') => {
  if (!value) return '—';
  try {
    return format(new Date(value), pattern);
  } catch {
    return '—';
  }
};

const displayValue = (value: string | null | undefined) => value?.trim() || '—';

const UserDetails = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'block' | 'unblock' | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const fetchDetails = useCallback(
    async ({ silent = false } = {}) => {
      if (!userId) {
        setError('User ID not provided.');
        setLoading(false);
        return;
      }
      try {
        if (!silent) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }
        setError(null);
        const response = await getUserDetailsRequest(userId);
        setUser(response.user);
      } catch (err: any) {
        setError(err?.response?.data?.error || 'Failed to load user details.');
      } finally {
        if (!silent) {
          setLoading(false);
        }
        setRefreshing(false);
      }
    },
    [userId]
  );

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const profileFields = useMemo(
    () => [
      { label: 'First name', value: user?.firstName },
      { label: 'Middle name', value: user?.middleName },
      { label: 'Last name', value: user?.lastName },
      { label: 'Birthdate', value: formatDate(user?.birthdate ?? null, 'MMM d, yyyy') },
      { label: 'Gender', value: user?.gender },
      { label: 'Bio', value: user?.bio },
    ],
    [user]
  );

  const contactFields = useMemo(
    () => [
      { label: 'Phone number', value: user?.phoneNumber },
      { label: 'Messenger URL', value: user?.messengerUrl },
      { label: 'Facebook URL', value: user?.facebookUrl },
    ],
    [user]
  );

  const securityFields = useMemo(
    () => [
      { label: 'Verified status', value: user?.isVerified ? 'Verified' : 'Not verified' },
      { label: 'Account status', value: user?.isDisabled ? 'Disabled' : 'Active' },
      {
        label: 'Last password change',
        value: formatDate(user?.lastPasswordChange ?? null),
      },
    ],
    [user]
  );

  const auditFields = useMemo(
    () => [
      { label: 'Last login', value: formatDate(user?.lastLogin ?? null) },
      { label: 'Created at', value: formatDate(user?.createdAt ?? null) },
      { label: 'Updated at', value: formatDate(user?.updatedAt ?? null) },
    ],
    [user]
  );

const renderInfoGrid = (
  items: { label: string; value: string | null | undefined }[],
  columns: 1 | 2 = 2
) => (
  <div className={`grid gap-3 ${columns === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
    {items.map((item) => (
      <div key={item.label}>
        <p className="text-xs uppercase tracking-wide text-slate-500">{item.label}</p>
        <p className="text-sm font-medium text-slate-900 mt-0.5 break-words">{displayValue(item.value)}</p>
      </div>
    ))}
  </div>
);

  const handleRefresh = () => fetchDetails({ silent: true });

  const openConfirm = (action: 'block' | 'unblock') => {
    setConfirmAction(action);
    setConfirmOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!user || !confirmAction) return;
    setActionLoading(true);
    try {
      await updateUserStatusRequest(user.id, confirmAction);
      toast.success(`User ${confirmAction === 'block' ? 'blocked' : 'unblocked'} successfully.`);
      await fetchDetails({ silent: true });
      setConfirmOpen(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Unable to update user status.');
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-10 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-56" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(4)].map((_, idx) => (
                <Skeleton key={idx} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              Unable to load user
            </CardTitle>
            <CardDescription className="text-red-600">{error}</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Go back
            </Button>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const offenses: LandlordOffense[] = user.landlordOffenses ?? [];

  return (
    <div className="space-y-6 p-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-2xl"
      >
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-sky-200/80 via-cyan-200/75 to-teal-200/70 opacity-95" />
        <div className="relative m-[1px] rounded-[16px] bg-white/85 backdrop-blur-lg border border-white/60 shadow-lg">
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -top-12 -left-10 h-40 w-40 rounded-full bg-gradient-to-br from-sky-300/50 to-teal-400/40 blur-3xl"
            initial={{ opacity: 0.4, scale: 0.85 }}
            animate={{ opacity: 0.7, scale: 1.05 }}
            transition={{ duration: 3, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -bottom-12 -right-12 h-48 w-48 rounded-full bg-gradient-to-tl from-teal-200/40 to-cyan-200/35 blur-3xl"
            initial={{ opacity: 0.3 }}
            animate={{ opacity: 0.6 }}
            transition={{ duration: 3.5, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
          />

          <div className="px-4 sm:px-6 py-5 space-y-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4 min-w-0">
                <motion.div whileHover={{ scale: 1.05 }} className="relative flex-shrink-0">
                  <div className="relative h-11 w-11 rounded-2xl bg-gradient-to-br from-cyan-600 via-teal-600 to-emerald-600 text-white grid place-items-center shadow-xl shadow-teal-500/30">
                    <UserCog className="h-5 w-5 relative z-10" />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/15 to-transparent" />
                  </div>
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 220 }}
                    className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-white text-teal-600 border border-teal-100 shadow-sm grid place-items-center"
                  >
                    <Sparkles className="h-3 w-3" />
                  </motion.div>
                </motion.div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg sm:text-2xl font-semibold tracking-tight text-slate-900 truncate">
                      User Insight Center
                    </h1>
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <Sparkles className="h-4 w-4 text-teal-500" />
                    </motion.div>
                  </div>
                  <p className="text-sm text-slate-600 leading-6 flex items-center gap-1.5">
                    <Shield className="h-4 w-4 text-cyan-500" />
                    Review identity, contact channels, and security posture
                  </p>
                </div>
              </div>

              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                <Button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="h-11 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 px-5 text-sm font-semibold text-white shadow-md shadow-teal-500/30 hover:brightness-110 disabled:opacity-70"
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
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/80 via-teal-400/80 to-emerald-400/80" />
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
              />
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-4 lg:grid-cols-[0.4fr_0.6fr]">
        <Card className="border-0 shadow-xl overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserCircle2 className="h-4 w-4 text-indigo-500" />
              Profile & Contact
            </CardTitle>
            <CardDescription>Identity snapshot & reachability</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 p-6 bg-gradient-to-br from-white via-slate-50 to-slate-100">
            <div className="flex items-start gap-4">
              <div className="relative">
                <Avatar className="h-16 w-16 border-2 border-white shadow-lg">
                  <AvatarImage src={user.avatarUrl || undefined} alt={user.email} />
                  <AvatarFallback className="bg-gradient-to-br from-indigo-100 to-cyan-100 text-indigo-700 text-lg font-semibold">
                    {user.firstName?.[0]?.toUpperCase() ||
                      user.lastName?.[0]?.toUpperCase() ||
                      user.email[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute -bottom-1 -right-1 rounded-full border border-white bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600 shadow-sm">
                  {user.role}
                </span>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Full name</p>
                  <p className="text-xl font-semibold text-slate-900">
                    {user.firstName || user.lastName
                      ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                      : 'No name provided'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className={roleThemes[user.role] ?? 'bg-slate-100 text-slate-800 border'}>
                    <Shield className="h-3.5 w-3.5 mr-1" />
                    {user.role}
                  </Badge>
                  {user.bio && (
                    <Badge variant="outline" className="text-xs text-slate-600 border-slate-200 bg-white/60">
                      {user.bio.slice(0, 36)}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-inner">
              <p className="text-xs uppercase tracking-wide text-slate-500 mb-3">Profile details</p>
              {renderInfoGrid(profileFields)}
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-inner">
              <p className="text-xs uppercase tracking-wide text-slate-500 mb-3">Contact links</p>
              {renderInfoGrid(contactFields)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-slate-200" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.15),_transparent_55%)]" />
          <CardHeader className="relative text-slate-900">
            <CardTitle className="flex items-center gap-2 text-base text-slate-900">
              <Lock className="h-4 w-4 text-blue-500" />
              Account status & security
            </CardTitle>
            <CardDescription className="text-slate-600">
              Email verification, access guardrails, and audit trail
            </CardDescription>
          </CardHeader>
          <CardContent className="relative space-y-4 text-slate-900">
            <div className="flex flex-wrap items-center gap-2">
              {user.isVerified ? (
                <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                  Verified
                </Badge>
              ) : (
                <Badge className="bg-amber-100 text-amber-700 border border-amber-200">
                  Pending verification
                </Badge>
              )}
              <Badge
                className={
                  user.isDisabled
                    ? 'bg-rose-100 text-rose-700 border border-rose-200'
                    : 'bg-blue-100 text-blue-700 border border-blue-200'
                }
              >
                <Ban className="h-3.5 w-3.5 mr-1" />
                {user.isDisabled ? 'Blocked' : 'Active'}
              </Badge>
            </div>

            <div className="rounded-xl border border-white/70 bg-white px-4 py-3 shadow-inner">
              <p className="text-xs uppercase text-slate-500">Primary email</p>
              <p className="text-sm font-semibold flex items-center gap-2 mt-1 break-all text-slate-900">
                <Mail className="h-4 w-4 text-blue-500" />
                {user.email}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">Security checkpoints</p>
              {renderInfoGrid(securityFields, 1)}
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 mb-2 flex items-center gap-1.5">
                <CalendarClock className="h-3.5 w-3.5 text-blue-500" />
                Audit trail
              </p>
              {renderInfoGrid(auditFields, 1)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-indigo-100 bg-white/90 backdrop-blur-sm shadow-sm">
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <ListChecks className="h-4 w-4 text-indigo-500" />
              Landlord offenses
            </CardTitle>
            <CardDescription>
              Recorded misconduct linked to listings {(user.role !== 'LANDLORD' || offenses.length === 0) && '(if applicable)'}
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCcw className="h-3.5 w-3.5" />}
              <span className="ml-1 text-xs font-medium">Refresh</span>
            </Button>
            <Button
              variant={user.isDisabled ? 'secondary' : 'destructive'}
              size="sm"
              className="h-8 px-3"
              onClick={() => openConfirm(user.isDisabled ? 'unblock' : 'block')}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : user.isDisabled ? (
                <ShieldCheck className="h-3.5 w-3.5" />
              ) : (
                <ShieldAlert className="h-3.5 w-3.5" />
              )}
              <span className="ml-1 text-xs font-semibold uppercase tracking-wide">
                {user.isDisabled ? 'Unblock' : 'Block'}
              </span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {user.role !== 'LANDLORD' ? (
            <p className="text-sm text-slate-600">
              Offense tracking only applies to landlord accounts. This user is currently a {user.role.toLowerCase()}.
            </p>
          ) : offenses.length === 0 ? (
            <div className="text-center py-8 text-sm text-slate-500">
              <ShieldCheck className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
              No offenses have been recorded for this landlord.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-100">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/80">
                    <TableHead className="text-xs font-semibold text-slate-600">Type</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-600">Severity</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-600">Listing</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-600">Detected</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-600">Source</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-600">Description & Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {offenses.map((offense) => (
                    <TableRow
                      key={offense.id}
                      className={`border-b text-sm ${severityRowBg[offense.severity] ?? ''}`}
                    >
                      <TableCell className="font-semibold text-slate-900 capitalize">
                        {offense.type.replace('_', ' ')}
                      </TableCell>
                      <TableCell>
                        <Badge className={severityThemes[offense.severity] ?? 'bg-slate-100 text-slate-700 border'}>
                          {offense.severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-700">
                        {offense.listing ? (
                          <div className="flex flex-col">
                            <span className="font-mono text-xs">
                              #{offense.listing.id.slice(0, 8)}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {offense.listing.lifecycleStatus}
                            </span>
                          </div>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell className="text-slate-700">{formatDate(offense.detectedAt)}</TableCell>
                      <TableCell className="uppercase text-[11px] tracking-wide text-slate-600">
                        {displayValue(offense.detectedBy)}
                      </TableCell>
                      <TableCell>
                        {offense.description ? (
                          <p className="italic text-slate-700">“{offense.description}”</p>
                        ) : (
                          <span className="text-slate-500">No description</span>
                        )}
                        <div className="mt-2 flex flex-wrap gap-4 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <CalendarClock className="h-3.5 w-3.5 text-blue-500" />
                            Logged {formatDate(offense.createdAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Lock className="h-3.5 w-3.5 text-purple-500" />
                            Updated {formatDate(offense.updatedAt)}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction === 'block' ? 'Block user account?' : 'Unblock user account?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction === 'block'
                ? 'This will immediately disable access for this account until you manually restore it.'
                : 'This will re-enable access for this account. Make sure any outstanding issues are resolved.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction} disabled={actionLoading}>
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserDetails;

