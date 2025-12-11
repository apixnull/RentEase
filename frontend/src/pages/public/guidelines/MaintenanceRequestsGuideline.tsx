import { ArrowLeft, Wrench, Clock, CheckCircle, XCircle, AlertTriangle, Building, User, Image as ImageIcon, Calendar, ArrowRight, Shield, Bell, FileText, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const MaintenanceRequestsGuideline = () => {
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
            className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors font-medium"
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
      <section className="relative py-12 overflow-hidden bg-gradient-to-br from-orange-600 via-amber-500 to-yellow-600">
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
                <Wrench className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-orange-100 text-sm font-medium">Guidelines</p>
                <h1 className="text-3xl sm:text-4xl font-bold text-white">
                  Maintenance Requests
                </h1>
              </div>
            </div>
            <p className="text-lg text-orange-100 max-w-2xl">
              Learn how tenants can report maintenance issues and how landlords can manage and resolve them efficiently.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* What is Maintenance Requests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="p-6 sm:p-8 bg-white border-2 border-orange-100 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-orange-600 p-3 rounded-lg">
                <Wrench className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">What are Maintenance Requests?</h2>
            </div>

            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                <strong>Maintenance Requests</strong> allow tenants to report issues with their rental units directly to landlords through the platform. This system streamlines communication, ensures issues are tracked, and helps landlords prioritize and manage repairs efficiently.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                  <h4 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    For Tenants
                  </h4>
                  <p className="text-sm text-orange-800">
                    Submit maintenance requests with photos and descriptions. Track the status of your requests and receive notifications when landlords update them.
                  </p>
                </div>
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    For Landlords
                  </h4>
                  <p className="text-sm text-amber-800">
                    Receive notifications for new requests, update status as you work on issues, and maintain a complete history of all maintenance activities.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Maintenance Request Status Flow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="p-6 sm:p-8 bg-white border-2 border-orange-100 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-600 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Maintenance Request Status Flow</h2>
            </div>

            <div className="space-y-6">
              <p className="text-gray-700 leading-relaxed">
                Maintenance requests progress through different statuses as landlords work on resolving them:
              </p>

              {/* Status Flow Diagram */}
              <div className="space-y-4">
                {/* OPEN */}
                <div className="p-4 bg-amber-50 rounded-xl border-2 border-amber-300">
                  <div className="flex items-start gap-3">
                    <div className="bg-amber-500 p-2 rounded-lg flex-shrink-0">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-amber-900 mb-1">OPEN</h4>
                      <p className="text-sm text-amber-800 mb-2">
                        The initial status when a tenant submits a maintenance request. The landlord has been notified and can review the issue.
                      </p>
                      <div className="text-xs text-amber-700 bg-amber-100 px-2 py-1 rounded inline-block">
                        <strong>Actions:</strong> Landlord can update to IN_PROGRESS, RESOLVED, or INVALID. Tenant can cancel (only if OPEN).
                      </div>
                    </div>
                  </div>
                </div>

                {/* IN_PROGRESS */}
                <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-300">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-500 p-2 rounded-lg flex-shrink-0">
                      <Wrench className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-blue-900 mb-1">IN_PROGRESS</h4>
                      <p className="text-sm text-blue-800 mb-2">
                        The landlord has started working on the maintenance issue. The unit's condition is automatically set to UNDER_MAINTENANCE.
                      </p>
                      <div className="text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded inline-block">
                        <strong>Actions:</strong> Landlord can update to RESOLVED or INVALID. Cannot revert to OPEN.
                      </div>
                    </div>
                  </div>
                </div>

                {/* RESOLVED */}
                <div className="p-4 bg-emerald-50 rounded-xl border-2 border-emerald-300">
                  <div className="flex items-start gap-3">
                    <div className="bg-emerald-500 p-2 rounded-lg flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-emerald-900 mb-1">RESOLVED</h4>
                      <p className="text-sm text-emerald-800 mb-2">
                        The maintenance issue has been fixed. The unit's condition is automatically set back to GOOD (if no other active maintenance requests exist).
                      </p>
                      <div className="text-xs text-emerald-700 bg-emerald-100 px-2 py-1 rounded inline-block">
                        <strong>Final Status:</strong> Cannot be changed once set to RESOLVED.
                      </div>
                    </div>
                  </div>
                </div>

                {/* CANCELLED */}
                <div className="p-4 bg-gray-50 rounded-xl border-2 border-gray-300">
                  <div className="flex items-start gap-3">
                    <div className="bg-gray-500 p-2 rounded-lg flex-shrink-0">
                      <XCircle className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-1">CANCELLED</h4>
                      <p className="text-sm text-gray-800 mb-2">
                        The tenant has cancelled the maintenance request. Only tenants can cancel requests, and only if the status is OPEN.
                      </p>
                      <div className="text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded inline-block">
                        <strong>Final Status:</strong> Cannot be changed once set to CANCELLED.
                      </div>
                    </div>
                  </div>
                </div>

                {/* INVALID */}
                <div className="p-4 bg-rose-50 rounded-xl border-2 border-rose-300">
                  <div className="flex items-start gap-3">
                    <div className="bg-rose-500 p-2 rounded-lg flex-shrink-0">
                      <AlertTriangle className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-rose-900 mb-1">INVALID</h4>
                      <p className="text-sm text-rose-800 mb-2">
                        The landlord has marked the request as invalid (e.g., duplicate request, not a real issue, or outside scope of maintenance).
                      </p>
                      <div className="text-xs text-rose-700 bg-rose-100 px-2 py-1 rounded inline-block">
                        <strong>Final Status:</strong> Cannot be changed once set to INVALID.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">Important Status Rules</h4>
                    <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                      <li>Final statuses (RESOLVED, INVALID, CANCELLED) cannot be changed once set</li>
                      <li>Only tenants can cancel requests, and only if status is OPEN</li>
                      <li>Landlords cannot set status to CANCELLED (only tenants can)</li>
                      <li>When status changes to IN_PROGRESS, unit condition becomes UNDER_MAINTENANCE</li>
                      <li>When status changes to RESOLVED, unit condition becomes GOOD (if no other active requests)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* For Tenants: Creating Maintenance Requests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="p-6 sm:p-8 bg-white border-2 border-orange-100 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-green-600 p-3 rounded-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">For Tenants: Creating Maintenance Requests</h2>
            </div>

            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                As a tenant, you can submit maintenance requests for issues in your rental unit. Here's what you need to know:
              </p>

              <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                <h4 className="font-semibold text-green-900 mb-3">Requirements:</h4>
                <ul className="space-y-2 text-sm text-green-800">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Active Lease:</strong> You must have an active lease for the unit you're requesting maintenance for</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Property & Unit:</strong> Select the property and specific unit where the issue is located</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Description:</strong> Provide a clear, detailed description of the maintenance issue</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Photo:</strong> Upload a photo showing the issue (highly recommended for clarity)</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">What Happens When You Submit:</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <Bell className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <span>The landlord receives a notification about your maintenance request</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span>The request status is set to <strong>OPEN</strong> automatically</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>You can track the status of your request and receive updates when the landlord changes it</span>
                  </li>
                </ul>
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <h4 className="font-semibold text-amber-900 mb-2">Cancelling Requests</h4>
                <p className="text-sm text-amber-800">
                  You can cancel a maintenance request, but only if its status is <strong>OPEN</strong>. Once a landlord starts working on it (IN_PROGRESS) or marks it as RESOLVED/INVALID, you cannot cancel it.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* For Landlords: Managing Maintenance Requests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="p-6 sm:p-8 bg-white border-2 border-orange-100 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-purple-600 p-3 rounded-lg">
                <Building className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">For Landlords: Managing Maintenance Requests</h2>
            </div>

            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                As a landlord, you receive notifications when tenants submit maintenance requests. Here's how to manage them:
              </p>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Available Actions:</h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <h5 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                      <Wrench className="w-4 h-4" />
                      Update to IN_PROGRESS
                    </h5>
                    <p className="text-sm text-blue-800">
                      When you start working on the issue, update the status to IN_PROGRESS. This automatically sets the unit condition to UNDER_MAINTENANCE.
                    </p>
                  </div>

                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                    <h5 className="font-semibold text-emerald-900 mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Mark as RESOLVED
                    </h5>
                    <p className="text-sm text-emerald-800">
                      Once the issue is fixed, mark it as RESOLVED. The unit condition automatically returns to GOOD (if no other active requests exist).
                    </p>
                  </div>

                  <div className="p-4 bg-rose-50 rounded-xl border border-rose-200">
                    <h5 className="font-semibold text-rose-900 mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Mark as INVALID
                    </h5>
                    <p className="text-sm text-rose-800">
                      If the request is invalid (duplicate, not a real issue, or outside scope), mark it as INVALID. This is a final status.
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <h5 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <XCircle className="w-4 h-4" />
                      Cannot Cancel
                    </h5>
                    <p className="text-sm text-gray-800">
                      Landlords cannot cancel requests. Only tenants can cancel, and only if the status is OPEN.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                <h4 className="font-semibold text-purple-900 mb-2">Status Update Rules:</h4>
                <ul className="text-sm text-purple-800 space-y-1 list-disc list-inside">
                  <li>You can update OPEN requests to IN_PROGRESS, RESOLVED, or INVALID</li>
                  <li>You can update IN_PROGRESS requests to RESOLVED or INVALID</li>
                  <li>You cannot change final statuses (RESOLVED, INVALID, CANCELLED)</li>
                  <li>You cannot revert IN_PROGRESS back to OPEN</li>
                  <li>Tenants are automatically notified when you update the status</li>
                </ul>
              </div>

              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">Unit Condition Updates:</h4>
                <p className="text-sm text-blue-800 mb-2">
                  The system automatically updates unit conditions based on maintenance request status:
                </p>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li><strong>IN_PROGRESS:</strong> Unit condition becomes UNDER_MAINTENANCE</li>
                  <li><strong>RESOLVED:</strong> Unit condition becomes GOOD (only if no other active maintenance requests exist for that unit)</li>
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Maintenance Request Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="p-6 sm:p-8 bg-white border-2 border-orange-100 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-indigo-600 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Maintenance Request Information</h2>
            </div>

            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Each maintenance request contains the following information:
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                  <h4 className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Property & Unit
                  </h4>
                  <p className="text-sm text-indigo-800">
                    The property and specific unit where the maintenance issue is located.
                  </p>
                </div>

                <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                  <h4 className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Reporter
                  </h4>
                  <p className="text-sm text-indigo-800">
                    The tenant who submitted the request, including their contact information.
                  </p>
                </div>

                <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                  <h4 className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Description
                  </h4>
                  <p className="text-sm text-indigo-800">
                    Detailed description of the maintenance issue provided by the tenant.
                  </p>
                </div>

                <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                  <h4 className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Photo
                  </h4>
                  <p className="text-sm text-indigo-800">
                    Photo of the issue uploaded by the tenant (if provided).
                  </p>
                </div>

                <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                  <h4 className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Status
                  </h4>
                  <p className="text-sm text-indigo-800">
                    Current status of the request (OPEN, IN_PROGRESS, RESOLVED, CANCELLED, or INVALID).
                  </p>
                </div>

                <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                  <h4 className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Timestamps
                  </h4>
                  <p className="text-sm text-indigo-800">
                    Created date and last updated date for tracking the request timeline.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="p-6 sm:p-8 bg-white border-2 border-orange-100 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-yellow-600 p-3 rounded-lg">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
            </div>

            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                The system automatically sends notifications to keep both parties informed:
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                  <h4 className="font-semibold text-yellow-900 mb-2">For Landlords</h4>
                  <p className="text-sm text-yellow-800 mb-2">
                    You receive a notification when:
                  </p>
                  <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                    <li>A new maintenance request is submitted</li>
                  </ul>
                </div>

                <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                  <h4 className="font-semibold text-yellow-900 mb-2">For Tenants</h4>
                  <p className="text-sm text-yellow-800 mb-2">
                    You receive a notification when:
                  </p>
                  <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                    <li>Status changes to IN_PROGRESS</li>
                    <li>Status changes to RESOLVED</li>
                    <li>Status changes to INVALID</li>
                  </ul>
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
          <Card className="p-6 sm:p-8 bg-white border-2 border-orange-100 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-emerald-600 p-3 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Best Practices</h2>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">For Tenants:</h4>
                <div className="space-y-3">
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                    <h5 className="font-semibold text-emerald-900 mb-1">✓ Provide Clear Descriptions</h5>
                    <p className="text-sm text-emerald-800">
                      Describe the issue in detail, including location, severity, and when it started. This helps landlords understand and prioritize the request.
                    </p>
                  </div>

                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                    <h5 className="font-semibold text-emerald-900 mb-1">✓ Include Photos</h5>
                    <p className="text-sm text-emerald-800">
                      Photos help landlords see the issue clearly and assess the urgency. Take clear, well-lit photos from multiple angles if possible.
                    </p>
                  </div>

                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                    <h5 className="font-semibold text-emerald-900 mb-1">✓ Report Issues Promptly</h5>
                    <p className="text-sm text-emerald-800">
                      Don't wait for small issues to become big problems. Report maintenance issues as soon as you notice them.
                    </p>
                  </div>

                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                    <h5 className="font-semibold text-emerald-900 mb-1">✓ Be Patient</h5>
                    <p className="text-sm text-emerald-800">
                      Landlords may need time to assess and schedule repairs. Check the status of your request, but allow reasonable time for resolution.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">For Landlords:</h4>
                <div className="space-y-3">
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <h5 className="font-semibold text-blue-900 mb-1">✓ Respond Promptly</h5>
                    <p className="text-sm text-blue-800">
                      Acknowledge maintenance requests quickly, even if you can't fix them immediately. Update status to IN_PROGRESS when you start working on it.
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <h5 className="font-semibold text-blue-900 mb-1">✓ Prioritize Urgent Issues</h5>
                    <p className="text-sm text-blue-800">
                      Address safety issues, water leaks, and heating/cooling problems immediately. Less urgent issues can be scheduled appropriately.
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <h5 className="font-semibold text-blue-900 mb-1">✓ Update Status Regularly</h5>
                    <p className="text-sm text-blue-800">
                      Keep tenants informed by updating the status as you progress. This builds trust and reduces follow-up inquiries.
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <h5 className="font-semibold text-blue-900 mb-1">✓ Mark as Resolved When Complete</h5>
                    <p className="text-sm text-blue-800">
                      Once the issue is fixed, mark it as RESOLVED. This automatically updates the unit condition and notifies the tenant.
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <h5 className="font-semibold text-blue-900 mb-1">✓ Use INVALID Appropriately</h5>
                    <p className="text-sm text-blue-800">
                      Only mark requests as INVALID if they are truly invalid (duplicates, not real issues, or outside maintenance scope). Communicate with tenants if needed.
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
          transition={{ duration: 0.5, delay: 0.8 }}
          className="flex justify-between items-center pt-6"
        >
          <Button
            variant="outline"
            onClick={() => navigate("/guidelines/financial-tracking")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Financial Tracking
          </Button>
          
          <Button
            onClick={() => navigate("/guidelines/safety-tips")}
            className="gap-2 bg-orange-600 hover:bg-orange-700"
          >
            Next: Safety Tips
            <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default MaintenanceRequestsGuideline;

