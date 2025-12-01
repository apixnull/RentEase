import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText,
  Sparkles,
  BarChart3,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';


const AdminReportsAndAnalytics = () => {

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
                    <BarChart3 className="h-5 w-5 relative z-10" />
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
                      Reports and Analytics
                    </h1>
                  </div>
                  <p className="text-sm text-slate-600 leading-6 flex items-center gap-1.5">
                    <BarChart3 className="h-4 w-4 text-indigo-500" />
                    Comprehensive platform insights and performance metrics
                  </p>
                </div>
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

      {/* Analytics Navigation Cards */}
      <div className="space-y-4">
        {/* User Analytics Navigation Card */}
        <Card className="bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 border-purple-200 hover:border-purple-300 transition-colors">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 text-white grid place-items-center shadow-lg shadow-purple-500/30">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-lg">User Analytics</CardTitle>
                  <CardDescription>User engagement, login statistics, and activity metrics</CardDescription>
                </div>
              </div>
              <Button asChild className="rounded-xl bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 text-white shadow-md shadow-indigo-500/30 hover:brightness-110">
                <Link to="/admin/reports/user-analytics">
                  View Analytics
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Listing Analytics Navigation Card */}
        <Card className="bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 border-blue-200 hover:border-blue-300 transition-colors">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 text-white grid place-items-center shadow-lg shadow-blue-500/30">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-lg">Listing & Earnings Analytics</CardTitle>
                  <CardDescription>Advertisement trends, listing performance, and earnings metrics</CardDescription>
                </div>
              </div>
              <Button asChild className="rounded-xl bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 text-white shadow-md shadow-blue-500/30 hover:brightness-110">
                <Link to="/admin/reports/listing-analytics">
                  View Analytics
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Fraud Reports Analytics Navigation Card */}
        <Card className="bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 border-red-200 hover:border-red-300 transition-colors">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-600 via-orange-600 to-amber-600 text-white grid place-items-center shadow-lg shadow-red-500/30">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-lg">Fraud Reports Analytics</CardTitle>
                  <CardDescription>Fraud report statistics and status breakdowns</CardDescription>
                </div>
              </div>
              <Button asChild className="rounded-xl bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/30 hover:brightness-110">
                <Link to="/admin/reports/fraud-report-analytics">
                  View Analytics
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
        </Card>
      </div>

    </div>
  );
};

export default AdminReportsAndAnalytics;

