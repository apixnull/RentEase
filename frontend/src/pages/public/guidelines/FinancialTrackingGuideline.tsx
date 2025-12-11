import { ArrowLeft, CreditCard, TrendingUp, TrendingDown, DollarSign, Calendar, Filter, BarChart3, FileText, CheckCircle2, AlertCircle, ArrowRight, Repeat, Download, Trash2, Edit, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const FinancialTrackingGuideline = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Header with Back Button */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <motion.button
            onClick={() => navigate(-1)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors font-medium"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </motion.button>
          
          <Button
            variant="outline"
            onClick={() => navigate("/guidelines")}
            className="text-sm"
          >
            All Guidelines
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative py-12 overflow-hidden bg-gradient-to-br from-green-600 via-emerald-500 to-teal-600">
        <div className="absolute inset-0 overflow-hidden z-0">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white/10"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 40 + 20}px`,
                height: `${Math.random() * 40 + 20}px`,
              }}
              animate={{
                y: [0, (Math.random() - 0.5) * 50, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-green-100 text-sm font-medium">Guidelines</p>
                <h1 className="text-3xl sm:text-4xl font-bold text-white">
                  Financial Tracking
                </h1>
              </div>
            </div>
            <p className="text-lg text-green-100 max-w-2xl">
              Understand your property's financial position with comprehensive income and expense tracking tools.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* What is Financial Tracking */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="p-6 sm:p-8 bg-white border-2 border-green-100 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-green-600 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">What is Financial Tracking?</h2>
            </div>

            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                <strong>Financial Tracking</strong> is a tool designed to help landlords understand their current financial position across their rental properties. It allows you to record, monitor, and analyze income and expenses to get a clear picture of your property's profitability.
              </p>

              <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-green-900 mb-1">Important: Record-Keeping Tool Only</h4>
                    <p className="text-sm text-green-800">
                      Financial tracking is <strong>NOT a payment processor</strong>. It's a tool for your personal record-keeping to help you understand where you are financially. All payments are handled directly between you and tenants outside the platform.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                  <h4 className="font-semibold text-emerald-900 mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Track Income
                  </h4>
                  <p className="text-sm text-emerald-800">
                    Record all money received from rentals, fees, deposits, and other income sources.
                  </p>
                </div>
                <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                  <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                    <TrendingDown className="w-4 h-4" />
                    Track Expenses
                  </h4>
                  <p className="text-sm text-red-800">
                    Record all money spent on maintenance, repairs, utilities, taxes, and other property-related costs.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Transaction Types */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="p-6 sm:p-8 bg-white border-2 border-green-100 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-600 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Transaction Types</h2>
            </div>

            <div className="space-y-6">
              {/* Income Categories */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  Income Categories
                </h4>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <p className="font-semibold text-emerald-900 text-sm">RENT</p>
                    <p className="text-xs text-emerald-700 mt-1">Regular rental income from tenants</p>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <p className="font-semibold text-emerald-900 text-sm">LATE_FEE</p>
                    <p className="text-xs text-emerald-700 mt-1">Late payment fees charged to tenants</p>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <p className="font-semibold text-emerald-900 text-sm">DEPOSIT</p>
                    <p className="text-xs text-emerald-700 mt-1">Security deposits received</p>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <p className="font-semibold text-emerald-900 text-sm">OTHER_INCOME</p>
                    <p className="text-xs text-emerald-700 mt-1">Any other income sources</p>
                  </div>
                </div>
              </div>

              {/* Expense Categories */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                  Expense Categories
                </h4>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="font-semibold text-red-900 text-sm">MAINTENANCE</p>
                    <p className="text-xs text-red-700 mt-1">Regular property maintenance costs</p>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="font-semibold text-red-900 text-sm">REPAIRS</p>
                    <p className="text-xs text-red-700 mt-1">Property repair expenses</p>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="font-semibold text-red-900 text-sm">UTILITIES</p>
                    <p className="text-xs text-red-700 mt-1">Water, electricity, internet, etc.</p>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="font-semibold text-red-900 text-sm">INSURANCE</p>
                    <p className="text-xs text-red-700 mt-1">Property insurance premiums</p>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="font-semibold text-red-900 text-sm">TAXES</p>
                    <p className="text-xs text-red-700 mt-1">Property taxes and related fees</p>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="font-semibold text-red-900 text-sm">PROPERTY_MANAGEMENT</p>
                    <p className="text-xs text-red-700 mt-1">Property management service fees</p>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="font-semibold text-red-900 text-sm">LISTING_ADVERTISING</p>
                    <p className="text-xs text-red-700 mt-1">Listing fees and advertising costs</p>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="font-semibold text-red-900 text-sm">OTHER_EXPENSE</p>
                    <p className="text-xs text-red-700 mt-1">Any other property-related expenses</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Property-Level vs Unit-Level */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="p-6 sm:p-8 bg-white border-2 border-green-100 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-purple-600 p-3 rounded-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Property-Level vs Unit-Level Transactions</h2>
            </div>

            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Transactions can be recorded at two levels depending on what you're tracking:
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                  <h4 className="font-semibold text-purple-900 mb-2">Property-Level Transactions</h4>
                  <p className="text-sm text-purple-800 mb-3">
                    Expenses or income that apply to the entire property, not a specific unit.
                  </p>
                  <ul className="space-y-1.5 text-xs text-purple-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                      <span>Property-wide maintenance</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                      <span>Building insurance</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                      <span>Property taxes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                      <span>Common area utilities</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                  <h4 className="font-semibold text-indigo-900 mb-2">Unit-Level Transactions</h4>
                  <p className="text-sm text-indigo-800 mb-3">
                    Expenses or income specific to a particular unit within a property.
                  </p>
                  <ul className="space-y-1.5 text-xs text-indigo-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                      <span>Rent from specific unit</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                      <span>Unit-specific repairs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                      <span>Unit utilities</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                      <span>Unit maintenance</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Recurring Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="p-6 sm:p-8 bg-white border-2 border-green-100 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-cyan-600 p-3 rounded-lg">
                <Repeat className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Recurring Transactions</h2>
            </div>

            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                For transactions that happen regularly, you can set them as <strong>recurring</strong>. The system will automatically calculate the total amount based on how many times the transaction occurs within your selected date range.
              </p>

              <div className="p-4 bg-cyan-50 rounded-xl border border-cyan-200">
                <h4 className="font-semibold text-cyan-900 mb-3">Recurring Intervals:</h4>
                <div className="grid sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-white rounded-lg border border-cyan-200 text-center">
                    <p className="font-semibold text-cyan-900 text-sm">DAILY</p>
                    <p className="text-xs text-cyan-700 mt-1">Every day</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-cyan-200 text-center">
                    <p className="font-semibold text-cyan-900 text-sm">WEEKLY</p>
                    <p className="text-xs text-cyan-700 mt-1">Every week</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-cyan-200 text-center">
                    <p className="font-semibold text-cyan-900 text-sm">MONTHLY</p>
                    <p className="text-xs text-cyan-700 mt-1">Every month</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-cyan-200 text-center">
                    <p className="font-semibold text-cyan-900 text-sm">YEARLY</p>
                    <p className="text-xs text-cyan-700 mt-1">Every year</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-amber-900 mb-1">How Recurring Transactions Work</h4>
                    <p className="text-sm text-amber-800">
                      When you set a transaction as recurring, the system calculates how many times it occurs within your selected date filter (This Month, This Year, or All Time). For example, a monthly rent of ₱10,000 set as MONTHLY will show as ₱10,000 × 12 = ₱120,000 when viewing "This Year".
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Financial Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="p-6 sm:p-8 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-green-600 to-emerald-600 p-3 rounded-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Financial Metrics & Insights</h2>
            </div>

            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                The Financial Overview provides key metrics to help you understand your property's financial health:
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-xl border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                    <h4 className="font-semibold text-emerald-900">Total Income</h4>
                  </div>
                  <p className="text-sm text-emerald-800">
                    Sum of all income transactions (rent, fees, deposits) within your selected period.
                  </p>
                </div>

                <div className="p-4 bg-white rounded-xl border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="w-5 h-5 text-red-600" />
                    <h4 className="font-semibold text-red-900">Total Expense</h4>
                  </div>
                  <p className="text-sm text-red-800">
                    Sum of all expense transactions (maintenance, repairs, utilities) within your selected period.
                  </p>
                </div>

                <div className="p-4 bg-white rounded-xl border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-blue-900">Net Profit</h4>
                  </div>
                  <p className="text-sm text-blue-800">
                    Income minus expenses. Shows whether your property is profitable (positive) or losing money (negative).
                  </p>
                </div>

                <div className="p-4 bg-white rounded-xl border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                    <h4 className="font-semibold text-purple-900">Profit Margin</h4>
                  </div>
                  <p className="text-sm text-purple-800">
                    Percentage of income that remains as profit. Calculated as (Net Profit / Income) × 100%.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-white rounded-xl border border-green-200">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-green-600" />
                  Visual Timeline Chart
                </h4>
                <p className="text-sm text-gray-700">
                  The timeline chart shows income and expenses over time, helping you visualize trends and patterns. You can view data by day (This Month), by month (This Year), or by year (All Time).
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Filtering & Date Ranges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="p-6 sm:p-8 bg-white border-2 border-green-100 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-indigo-600 p-3 rounded-lg">
                <Filter className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Filtering & Date Ranges</h2>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Date Filters</h4>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <Calendar className="w-4 h-4 text-gray-600 mb-1" />
                    <p className="font-semibold text-gray-900 text-sm">This Month</p>
                    <p className="text-xs text-gray-600 mt-1">Current month's transactions</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <Calendar className="w-4 h-4 text-gray-600 mb-1" />
                    <p className="font-semibold text-gray-900 text-sm">This Year</p>
                    <p className="text-xs text-gray-600 mt-1">Current year's transactions</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <Calendar className="w-4 h-4 text-gray-600 mb-1" />
                    <p className="font-semibold text-gray-900 text-sm">All Time</p>
                    <p className="text-xs text-gray-600 mt-1">All historical transactions</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Scope Filters</h4>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="font-semibold text-blue-900 text-sm">All Properties</p>
                    <p className="text-xs text-blue-700 mt-1">View transactions across all properties</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="font-semibold text-blue-900 text-sm">Specific Property</p>
                    <p className="text-xs text-blue-700 mt-1">View transactions for one property (property-level and all units)</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="font-semibold text-blue-900 text-sm">Specific Unit</p>
                    <p className="text-xs text-blue-700 mt-1">View transactions for one specific unit</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Type Filters</h4>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <p className="font-semibold text-emerald-900 text-sm">Income Only</p>
                    <p className="text-xs text-emerald-700 mt-1">Show only income transactions</p>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="font-semibold text-red-900 text-sm">Expense Only</p>
                    <p className="text-xs text-red-700 mt-1">Show only expense transactions</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Managing Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Card className="p-6 sm:p-8 bg-white border-2 border-green-100 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-amber-600 p-3 rounded-lg">
                <Edit className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Managing Transactions</h2>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Creating Transactions</h4>
                <p className="text-gray-700 mb-3 text-sm">
                  To record a new transaction, click "Record Transaction" and fill in:
                </p>
                <ul className="space-y-2 text-sm text-gray-700 ml-4">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span><strong>Type:</strong> Income or Expense</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span><strong>Property:</strong> Which property (required)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span><strong>Unit:</strong> Optional - leave as "Property-level" or select a specific unit</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span><strong>Amount:</strong> Transaction amount in PHP</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span><strong>Date:</strong> When the transaction occurred</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span><strong>Category:</strong> Select appropriate category</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span><strong>Description:</strong> Brief description (max 15 words)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span><strong>Recurring:</strong> Optional - set if transaction repeats</span>
                  </li>
                </ul>
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <h4 className="font-semibold text-amber-900 mb-2">Description Word Limit</h4>
                <p className="text-sm text-amber-800">
                  Transaction descriptions are limited to <strong>15 words maximum</strong>. Keep descriptions concise and clear (e.g., "Monthly rent payment from Unit 3A").
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Editing & Deleting Transactions</h4>
                <p className="text-gray-700 mb-3 text-sm">
                  Click on any transaction in the table to edit it. You can modify all fields including type, amount, date, category, and description.
                </p>
                <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                  <div className="flex items-start gap-3">
                    <Trash2 className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h5 className="font-semibold text-red-900 mb-1">Deleting Transactions</h5>
                      <p className="text-sm text-red-800">
                        You can delete any transaction record using the delete button. This action cannot be undone, so make sure you want to remove the record permanently.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* PDF Reports */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <Card className="p-6 sm:p-8 bg-white border-2 border-green-100 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-red-600 p-3 rounded-lg">
                <Download className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">PDF Financial Reports</h2>
            </div>

            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Generate professional PDF reports of your financial data for record-keeping, tax preparation, or sharing with accountants.
              </p>

              <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                <h4 className="font-semibold text-red-900 mb-3">Report Options:</h4>
                <ul className="space-y-2 text-sm text-red-800">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span><strong>All Properties:</strong> Generate a report for all your properties combined</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span><strong>Specific Property:</strong> Generate a report for one property (includes all units)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span><strong>Date Range:</strong> This Month, This Year, or All Time</span>
                  </li>
                </ul>
              </div>

              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">What's Included in the PDF:</h4>
                <ul className="space-y-1.5 text-sm text-blue-800">
                  <li>• Summary statistics (Total Income, Total Expense, Net Profit, Profit Margin)</li>
                  <li>• Detailed transaction table with all information</li>
                  <li>• Recurring transaction calculations</li>
                  <li>• Property and unit information</li>
                  <li>• Date range and generation timestamp</li>
                  <li>• Professional RentEase branding</li>
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Best Practices */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
        >
          <Card className="p-6 sm:p-8 bg-white border-2 border-green-100 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-emerald-600 p-3 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Best Practices</h2>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <h4 className="font-semibold text-emerald-900 mb-2">✓ Record Transactions Regularly</h4>
                <p className="text-sm text-emerald-800">
                  Enter transactions as they occur to maintain accurate, up-to-date financial records. Don't let them pile up.
                </p>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <h4 className="font-semibold text-emerald-900 mb-2">✓ Use Appropriate Categories</h4>
                <p className="text-sm text-emerald-800">
                  Categorize transactions correctly to get meaningful insights. This helps you understand where your money is coming from and going to.
                </p>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <h4 className="font-semibold text-emerald-900 mb-2">✓ Set Recurring for Regular Items</h4>
                <p className="text-sm text-emerald-800">
                  Use recurring transactions for monthly rent, regular maintenance, or other predictable income/expenses. This saves time and ensures accuracy.
                </p>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <h4 className="font-semibold text-emerald-900 mb-2">✓ Review Financial Metrics Regularly</h4>
                <p className="text-sm text-emerald-800">
                  Check your net profit and profit margin regularly to understand your property's financial health and make informed decisions.
                </p>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <h4 className="font-semibold text-emerald-900 mb-2">✓ Generate Reports for Tax Season</h4>
                <p className="text-sm text-emerald-800">
                  Use the PDF report feature to generate comprehensive financial reports for tax preparation or accounting purposes.
                </p>
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-amber-900 mb-1">Remember: This is a Tool, Not a Payment Processor</h4>
                    <p className="text-sm text-amber-800">
                      Financial tracking helps you understand your financial position, but all actual payments are handled directly between you and tenants. Keep receipts and documentation for all transactions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.0 }}
          className="flex justify-between items-center pt-6"
        >
          <Button
            variant="outline"
            onClick={() => navigate("/guidelines/lease-management")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Lease Management
          </Button>
          
          <Button
            onClick={() => navigate("/guidelines/maintenance")}
            className="gap-2 bg-green-600 hover:bg-green-700"
          >
            Next: Maintenance Requests
            <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default FinancialTrackingGuideline;

