import { ArrowLeft, FileText, Calendar, Clock, CheckCircle2, XCircle, AlertCircle, ArrowRight, FileCheck, CreditCard, Shield, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const LeaseManagementGuideline = () => {
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
            className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors font-medium"
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
      <section className="relative py-12 overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600">
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
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-indigo-100 text-sm font-medium">Guidelines</p>
                <h1 className="text-3xl sm:text-4xl font-bold text-white">
                  Lease Management
                </h1>
              </div>
            </div>
            <p className="text-lg text-indigo-100 max-w-2xl">
              Learn how to create, manage, and track rental lease agreements effectively.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* What is a Lease */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="p-6 sm:p-8 bg-white border-2 border-indigo-100 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-indigo-600 p-3 rounded-lg">
                <FileCheck className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">What is a Lease?</h2>
            </div>

            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                A <strong>Lease</strong> is a formal rental agreement between a landlord and tenant that establishes the terms and conditions for renting a unit. In RentEase, leases help you track rental periods, payments, and tenant relationships.
              </p>

              <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                <h4 className="font-semibold text-indigo-900 mb-3">Key Components of a Lease:</h4>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-indigo-800"><strong>Property & Unit</strong> - Which property and unit is being rented</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-indigo-800"><strong>Tenant & Landlord</strong> - Parties involved in the agreement</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-indigo-800"><strong>Rent Amount</strong> - Monthly rental fee</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-indigo-800"><strong>Lease Period</strong> - Start and end dates</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-indigo-800"><strong>Payment Schedule</strong> - When rent is due</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-indigo-800"><strong>Security Deposit</strong> - One-time deposit amount</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Lease Types */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="p-6 sm:p-8 bg-white border-2 border-indigo-100 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-purple-600 p-3 rounded-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Lease Types</h2>
            </div>

            <p className="text-gray-700 mb-6">
              Choose the appropriate lease type based on the rental period and agreement terms:
            </p>

            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-blue-500 p-1.5 rounded-lg">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="font-bold text-blue-900">STANDARD</h4>
                  <span className="text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full font-medium">Default</span>
                </div>
                <p className="text-sm text-blue-800">
                  Standard rental agreement for typical residential leases. Most common type for apartments, condominiums, and houses.
                </p>
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-amber-500 p-1.5 rounded-lg">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="font-bold text-amber-900">SHORT_TERM</h4>
                </div>
                <p className="text-sm text-amber-800">
                  For rentals with shorter durations, typically less than 6 months. Common for temporary stays, vacation rentals, or transitional housing.
                </p>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-emerald-500 p-1.5 rounded-lg">
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="font-bold text-emerald-900">LONG_TERM</h4>
                </div>
                <p className="text-sm text-emerald-800">
                  For extended rental periods, typically 1 year or longer. Suitable for tenants seeking stability and landlords wanting consistent occupancy.
                </p>
              </div>

              <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-indigo-500 p-1.5 rounded-lg">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="font-bold text-indigo-900">FIXED-TERM</h4>
                </div>
                <p className="text-sm text-indigo-800">
                  Lease with a specific, non-renewable end date. Both parties agree to the exact duration with no automatic renewal.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Lease Statuses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="p-6 sm:p-8 bg-white border-2 border-indigo-100 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-cyan-600 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Lease Status Flow</h2>
            </div>

            <p className="text-gray-700 mb-6">
              Each lease progresses through different statuses during its lifecycle:
            </p>

            <div className="space-y-4">
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-amber-500 p-1.5 rounded-lg">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="font-bold text-amber-900">PENDING</h4>
                  <span className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full font-medium">Default</span>
                  <span className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full font-medium">Editable</span>
                </div>
                <p className="text-sm text-amber-800 mb-2">
                  Lease has been created but not yet activated. Waiting for both parties to confirm or sign the agreement.
                </p>
                <div className="p-2 bg-amber-100 rounded-lg border border-amber-300">
                  <p className="text-xs text-amber-900 font-medium">
                    ✓ <strong>Editable:</strong> You can still modify lease details, terms, and information while in PENDING status.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-emerald-500 p-1.5 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="font-bold text-emerald-900">ACTIVE</h4>
                  <span className="text-xs bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full font-medium">Goal Status</span>
                  <span className="text-xs bg-red-200 text-red-800 px-2 py-0.5 rounded-full font-medium">Locked</span>
                </div>
                <p className="text-sm text-emerald-800 mb-2">
                  Lease is active and ongoing. Tenant is currently renting the unit, and rent payments are being tracked.
                </p>
                <div className="p-2 bg-emerald-100 rounded-lg border border-emerald-300">
                  <p className="text-xs text-emerald-900 font-medium">
                    🔒 <strong>Not Editable:</strong> Once a lease becomes ACTIVE, the lease details cannot be modified. Only payments and notes can be added.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-blue-500 p-1.5 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="font-bold text-blue-900">COMPLETED</h4>
                  <span className="text-xs bg-red-200 text-red-800 px-2 py-0.5 rounded-full font-medium">Locked</span>
                </div>
                <p className="text-sm text-blue-800 mb-2">
                  Lease has ended successfully after passing the end date. The rental period is complete, and all obligations have been fulfilled.
                </p>
                <div className="p-2 bg-blue-100 rounded-lg border border-blue-300 mb-2">
                  <p className="text-xs text-blue-900 font-medium">
                    🔒 <strong>Fully Locked:</strong> All lease information, payments, and data are locked and cannot be edited. This is a permanent status.
                  </p>
                </div>
                <div className="p-2 bg-blue-200 rounded-lg border border-blue-400">
                  <p className="text-xs text-blue-900">
                    <strong>Note:</strong> When a lease passes its end date, you can manually set it to COMPLETED or TERMINATED status.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-orange-500 p-1.5 rounded-lg">
                    <XCircle className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="font-bold text-orange-900">TERMINATED</h4>
                  <span className="text-xs bg-red-200 text-red-800 px-2 py-0.5 rounded-full font-medium">Locked</span>
                </div>
                <p className="text-sm text-orange-800 mb-2">
                  Lease was ended early before the scheduled end date, or after passing the end date. This could be due to mutual agreement, breach of contract, or other circumstances.
                </p>
                <div className="p-2 bg-orange-100 rounded-lg border border-orange-300 mb-2">
                  <p className="text-xs text-orange-900 font-medium">
                    🔒 <strong>Fully Locked:</strong> All lease information, payments, and data are locked and cannot be edited. This is a permanent status.
                  </p>
                </div>
                <div className="p-2 bg-orange-200 rounded-lg border border-orange-400">
                  <p className="text-xs text-orange-900">
                    <strong>Note:</strong> When a lease passes its end date, you can manually set it to TERMINATED if it didn't complete successfully, or COMPLETED if it ended normally.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-gray-500 p-1.5 rounded-lg">
                    <XCircle className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="font-bold text-gray-900">CANCELLED</h4>
                </div>
                <p className="text-sm text-gray-700 mb-2">
                  Lease was cancelled before it became active (while still in PENDING status). This typically happens if the agreement falls through before the start date.
                </p>
                <div className="p-2 bg-gray-100 rounded-lg border border-gray-300">
                  <p className="text-xs text-gray-800 font-medium">
                    ℹ️ <strong>Note:</strong> Cancelled leases never became active, so they remain in a cancelled state with limited functionality.
                  </p>
                </div>
              </div>
            </div>

            {/* Visual Flow */}
            <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
              <p className="text-sm text-indigo-700 text-center mb-4 font-medium">Lease Status Flow & Editability</p>
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <span className="px-3 py-1.5 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">PENDING (Editable)</span>
                  <span className="text-gray-400">→</span>
                  <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium">ACTIVE (Locked)</span>
                </div>
                <div className="text-center text-xs text-gray-600 mb-2">When lease passes end date:</div>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <span className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">COMPLETED (Fully Locked)</span>
                  <span className="text-gray-400">or</span>
                  <span className="px-3 py-1.5 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">TERMINATED (Fully Locked)</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-xs text-amber-900 text-center">
                  <strong>Important:</strong> Once a lease becomes ACTIVE, it cannot be edited. If a lease passes its end date, you can set it to COMPLETED or TERMINATED. Once in COMPLETED or TERMINATED status, all information (including payments) is permanently locked.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Payment Intervals & Due Dates */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="p-6 sm:p-8 bg-white border-2 border-indigo-100 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-green-600 p-3 rounded-lg">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Payment Intervals & Due Dates</h2>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Payment Intervals</h4>
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <p className="font-bold text-emerald-900">MONTHLY (Default & Only Option)</p>
                  </div>
                  <p className="text-sm text-emerald-800">
                    Rent is due monthly. The system is designed for monthly rental payments only. Weekly and daily payment intervals are not available.
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Due Date (Day of Month)</h4>
                <p className="text-gray-700 mb-3">
                  Set which day of the month rent is due (1-28). The system automatically adjusts if the due date falls on a day that doesn't exist in shorter months.
                </p>
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>Example:</strong> If you set due date to 5, rent will be due on the 5th of each month. If you set it to 31, it will adjust to the last day of months with fewer days.
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Security Deposit</h4>
                <p className="text-gray-700 mb-3">
                  A one-time amount held by the landlord until the lease ends. This is separate from monthly rent and is typically returned (minus any deductions) when the tenant moves out.
                </p>
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h5 className="font-semibold text-amber-900 mb-1">Important Reminder</h5>
                      <p className="text-sm text-amber-800">
                        Security deposits are for your record-keeping only. RentEase does NOT process or hold deposits. Handle all deposit transactions directly with tenants and provide proper documentation.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Lease Documents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="p-6 sm:p-8 bg-white border-2 border-indigo-100 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-purple-600 p-3 rounded-lg">
                <FileCheck className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Lease Documents</h2>
            </div>

            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                You can upload a digital copy of your signed lease agreement document. This serves as a record and reference for both parties.
              </p>

              <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                <h4 className="font-semibold text-purple-900 mb-2">Best Practices for Lease Documents:</h4>
                <ul className="space-y-2 text-sm text-purple-800">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    <span>Upload a signed copy of the lease agreement</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    <span>Ensure the document is clear and readable</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    <span>Keep physical copies as well for your records</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    <span>Update the document if lease terms change</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Landlord Notes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="p-6 sm:p-8 bg-white border-2 border-indigo-100 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-amber-600 p-3 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Landlord Notes (Private)</h2>
            </div>

            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Landlord Notes are <strong>private observations</strong> that only you (the landlord) can see. Tenants cannot view these notes. Use them to track tenant behavior, issues, or important observations throughout the lease period.
              </p>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <h4 className="font-semibold text-amber-900 mb-3">Note Categories:</h4>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm text-amber-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    <span>CLEANLINESS</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-amber-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    <span>NOISE</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-amber-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    <span>BEHAVIOR</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-amber-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    <span>COMMUNICATION</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-amber-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    <span>PROPERTY_DAMAGE</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-amber-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    <span>OTHER</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">Privacy & Use</h4>
                    <p className="text-sm text-blue-800">
                      These notes are for your personal record-keeping and documentation. They help you track patterns, document issues, and maintain a history of the tenancy. Use them responsibly and objectively.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Payment Tracking */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.65 }}
        >
          <Card className="p-6 sm:p-8 bg-white border-2 border-indigo-100 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-green-600 p-3 rounded-lg">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Payment Tracking</h2>
            </div>

            <div className="space-y-6">
              <p className="text-gray-700 leading-relaxed">
                Payment tracking allows landlords to record and monitor all payments related to a lease. This includes rent payments, penalties, adjustments, and other charges that occur during the contract period.
              </p>

              {/* Payment Status */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Payment Status</h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <h5 className="font-bold text-amber-900">PENDING</h5>
                      <span className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full font-medium">Editable</span>
                    </div>
                    <p className="text-sm text-amber-800 mb-2">
                      Payment has been created but not yet marked as paid. This is the default status for new payment records.
                    </p>
                    <div className="p-2 bg-amber-100 rounded-lg border border-amber-300">
                      <p className="text-xs text-amber-900 font-medium">
                        ✓ <strong>Can be edited or deleted:</strong> PENDING payments can be modified or removed before they are marked as paid.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <h5 className="font-bold text-emerald-900">PAID</h5>
                      <span className="text-xs bg-red-200 text-red-800 px-2 py-0.5 rounded-full font-medium">Locked</span>
                    </div>
                    <p className="text-sm text-emerald-800 mb-2">
                      Payment has been marked as paid. The payment record is now permanent and cannot be modified.
                    </p>
                    <div className="p-2 bg-emerald-100 rounded-lg border border-emerald-300">
                      <p className="text-xs text-emerald-900 font-medium">
                        🔒 <strong>Cannot be edited or deleted:</strong> Once a payment is marked as PAID, it is permanently locked and cannot be changed or removed.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Types */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Payment Types</h4>
                <p className="text-gray-700 mb-3 text-sm">
                  You can create different types of payment records depending on the nature of the payment:
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="font-semibold text-gray-900 text-sm">RENT</p>
                    <p className="text-xs text-gray-600 mt-1">Regular monthly rent payment</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="font-semibold text-gray-900 text-sm">ADVANCE PAYMENT</p>
                    <p className="text-xs text-gray-600 mt-1">Payment made before the due date</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="font-semibold text-gray-900 text-sm">PREPAYMENT</p>
                    <p className="text-xs text-gray-600 mt-1">Payment for future rent periods</p>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="font-semibold text-red-900 text-sm">PENALTY</p>
                    <p className="text-xs text-red-700 mt-1">Late payment fees or other penalties</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="font-semibold text-blue-900 text-sm">ADJUSTMENT</p>
                    <p className="text-xs text-blue-700 mt-1">Corrections or adjustments to amounts</p>
                  </div>
                </div>
              </div>

              {/* Timing Status */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Timing Status</h4>
                <p className="text-gray-700 mb-3 text-sm">
                  The system automatically tracks when payments are made relative to their due date:
                </p>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-center">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                    <p className="font-semibold text-emerald-900 text-sm">ONTIME</p>
                    <p className="text-xs text-emerald-700 mt-1">Paid on or before due date</p>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-center">
                    <Clock className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                    <p className="font-semibold text-amber-900 text-sm">LATE</p>
                    <p className="text-xs text-amber-700 mt-1">Paid after due date</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-center">
                    <ArrowRight className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                    <p className="font-semibold text-blue-900 text-sm">ADVANCE</p>
                    <p className="text-xs text-blue-700 mt-1">Paid before due date</p>
                  </div>
                </div>
              </div>

              {/* Creating Payment Records */}
              <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                <h4 className="font-semibold text-indigo-900 mb-3">Creating Payment Records</h4>
                <p className="text-sm text-indigo-800 mb-3">
                  Landlords can create new payment records for various purposes during the lease contract:
                </p>
                <ul className="space-y-2 text-sm text-indigo-800">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                    <span><strong>Regular Rent:</strong> Create monthly rent payment records</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                    <span><strong>Penalties:</strong> Record late payment fees or other penalties incurred during the contract</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                    <span><strong>Adjustments:</strong> Add corrections or adjustments to payment amounts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                    <span><strong>Other Charges:</strong> Record any additional payments that occur during the lease period</span>
                  </li>
                </ul>
              </div>

              {/* Important Notes */}
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-amber-900 mb-1">Important Reminders</h4>
                    <ul className="space-y-1.5 text-sm text-amber-800">
                      <li>• <strong>Payment tracking is for record-keeping only.</strong> RentEase does NOT process payments between landlords and tenants.</li>
                      <li>• <strong>Handle all payments directly</strong> with tenants outside the platform.</li>
                      <li>• <strong>Mark payments as PAID</strong> only after you have actually received the payment.</li>
                      <li>• <strong>PENDING payments can be edited or deleted</strong> before marking them as paid.</li>
                      <li>• <strong>PAID payments are permanent</strong> and cannot be modified or deleted.</li>
                      <li>• <strong>Use payment notes</strong> to add context or details about specific payments.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Best Practices */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Card className="p-6 sm:p-8 bg-white border-2 border-indigo-100 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-emerald-600 p-3 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Lease Management Best Practices</h2>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <h4 className="font-semibold text-emerald-900 mb-2">✓ Start Renewal Discussions Early</h4>
                <p className="text-sm text-emerald-800">
                  Begin discussing lease renewal at least 30 days before the end date. This gives both parties time to decide and prevents last-minute vacancies.
                </p>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <h4 className="font-semibold text-emerald-900 mb-2">✓ Keep Accurate Records</h4>
                <p className="text-sm text-emerald-800">
                  Document all lease terms, payments, and important communications. This helps resolve disputes and provides a clear history.
                </p>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <h4 className="font-semibold text-emerald-900 mb-2">✓ Monitor Lease Status</h4>
                <p className="text-sm text-emerald-800">
                  Regularly check your leases to see which are expiring soon, which are active, and which need attention.
                </p>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <h4 className="font-semibold text-emerald-900 mb-2">✓ Use Lease Nicknames</h4>
                <p className="text-sm text-emerald-800">
                  Give your leases descriptive nicknames (e.g., "John - Unit 3A") to easily identify them in your lease list.
                </p>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <h4 className="font-semibold text-emerald-900 mb-2">✓ Track Payments Separately</h4>
                <p className="text-sm text-emerald-800">
                  Use the payment tracking feature to record rent payments, but remember that RentEase does not process payments - handle all transactions directly with tenants.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="flex justify-between items-center pt-6"
        >
          <Button
            variant="outline"
            onClick={() => navigate("/guidelines/communication")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Communication
          </Button>
          
          <Button
            onClick={() => navigate("/guidelines/financial-tracking")}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700"
          >
            Next: Financial Tracking
            <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default LeaseManagementGuideline;

