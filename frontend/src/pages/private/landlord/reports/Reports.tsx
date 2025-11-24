import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  BarChart3,
  Sparkles,
  Eye,
  ArrowRight,
  Star,
  ChartLine,
} from 'lucide-react';

const Reports = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative overflow-hidden rounded-2xl"
      >
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-teal-200/80 via-cyan-200/70 to-emerald-200/70 opacity-95" />
        <div className="relative m-[1px] rounded-[16px] bg-white/85 backdrop-blur-lg border border-white/60 shadow-lg">
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -top-12 -left-10 h-40 w-40 rounded-full bg-gradient-to-br from-teal-300/50 to-cyan-400/40 blur-3xl"
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
                  <div className="relative h-11 w-11 rounded-2xl bg-gradient-to-br from-teal-600 via-cyan-600 to-emerald-600 text-white grid place-items-center shadow-xl shadow-cyan-500/30">
                    <BarChart3 className="h-5 w-5 relative z-10" />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/15 to-transparent" />
                  </div>
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 220 }}
                    className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-white text-teal-600 border border-teal-100 shadow-sm grid place-items-center"
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
                      Portfolio Reports
                    </h1>
                    <motion.div
                      animate={{ rotate: [0, 8, -8, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Sparkles className="h-4 w-4 text-emerald-500" />
                    </motion.div>
                  </div>
                  <p className="text-sm text-slate-600 leading-6 flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4 text-cyan-500" />
                    Monitor profitability, occupancy, rent collection, and operational workload in one place.
                  </p>
                </div>
              </div>

              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                <Button
                  onClick={() => navigate('/landlord/reports/engagement')}
                  className="h-11 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg px-5 text-sm font-semibold"
                >
                  <span className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    View Engagement
                    <ArrowRight className="h-4 w-4" />
                  </span>
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
              <div className="absolute inset-0 bg-gradient-to-r from-teal-400/80 via-cyan-400/80 to-emerald-400/80" />
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Engagement Analytics Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
      >
        <Card className="border border-slate-200 bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white grid place-items-center shadow-lg shadow-purple-500/30">
                  <Eye className="h-6 w-6" />
                </div>
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 mb-2">
                    Engagement Analytics
                  </h2>
                  <p className="text-sm text-slate-600 leading-6">
                    Track how tenants and potential renters interact with your properties and units. 
                    Get detailed insights into listing views, tenant reviews, ratings, and engagement trends 
                    across your entire portfolio or filter by specific properties and units.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50/60 border border-slate-100">
                    <div className="flex-shrink-0 mt-0.5">
                      <Eye className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 mb-1">Listing Views</h3>
                      <p className="text-xs text-slate-600">
                        Monitor how many times your property listings have been viewed by potential tenants
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50/60 border border-slate-100">
                    <div className="flex-shrink-0 mt-0.5">
                      <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 mb-1">Reviews & Ratings</h3>
                      <p className="text-xs text-slate-600">
                        Track tenant reviews and average ratings to understand satisfaction levels
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50/60 border border-slate-100">
                    <div className="flex-shrink-0 mt-0.5">
                      <ChartLine className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 mb-1">Trend Analysis</h3>
                      <p className="text-xs text-slate-600">
                        View engagement trends over time with interactive charts and date range filters
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={() => navigate('/landlord/reports/engagement')}
                    className="h-10 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md px-6 text-sm font-semibold"
                  >
                    <span className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      View Engagement Analytics
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Reports;

