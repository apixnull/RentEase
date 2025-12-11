import { ArrowLeft, Users, ClipboardCheck, FileText, Briefcase, Home, Heart, Brain, CheckCircle2, Clock, XCircle, AlertCircle, ArrowRight, Shield, UserCheck, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const TenantScreeningGuideline = () => {
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
            className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors font-medium"
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
      <section className="relative py-12 overflow-hidden bg-gradient-to-br from-purple-600 via-purple-500 to-indigo-600">
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
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-purple-100 text-sm font-medium">Guidelines</p>
                <h1 className="text-3xl sm:text-4xl font-bold text-white">
                  Tenant Screening
                </h1>
              </div>
            </div>
            <p className="text-lg text-purple-100 max-w-2xl">
              Understand the tenant screening process to find reliable tenants and make informed leasing decisions.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* What is Tenant Screening */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="p-6 sm:p-8 bg-white border-2 border-purple-100 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-purple-600 p-3 rounded-lg">
                <ClipboardCheck className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">What is Tenant Screening?</h2>
            </div>

            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                <strong>Tenant Screening</strong> is a verification process that allows landlords to gather and review important information about prospective tenants <strong>before signing a lease agreement</strong>. This helps landlords make informed decisions and find reliable tenants.
              </p>

              <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                <h4 className="font-semibold text-purple-900 mb-3">How the Process Works:</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-200 text-purple-800 font-bold text-sm w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
                    <div>
                      <p className="font-medium text-purple-900">Landlord Invites Tenant</p>
                      <p className="text-sm text-purple-700">Landlord sends a screening invitation to a prospective tenant's email</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-200 text-purple-800 font-bold text-sm w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
                    <div>
                      <p className="font-medium text-purple-900">Tenant Fills Out Form</p>
                      <p className="text-sm text-purple-700">Tenant completes the screening form with personal, employment, and rental history info</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-200 text-purple-800 font-bold text-sm w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
                    <div>
                      <p className="font-medium text-purple-900">AI Analyzes Submission</p>
                      <p className="text-sm text-purple-700">Our AI system generates a risk assessment and summary based on the provided information</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-200 text-purple-800 font-bold text-sm w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">4</div>
                    <div>
                      <p className="font-medium text-purple-900">Landlord Reviews & Decides</p>
                      <p className="text-sm text-purple-700">Landlord reviews the screening report and approves or rejects the application</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-amber-900 mb-1">Enable Screening for Your Units</h4>
                    <p className="text-sm text-amber-800">
                      To use tenant screening, enable the <strong>"Requires Screening"</strong> option when creating or editing your unit. This allows you to invite prospective tenants for screening before signing a lease.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Screening Status Flow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="p-6 sm:p-8 bg-white border-2 border-purple-100 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-indigo-600 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Screening Status Flow</h2>
            </div>

            <p className="text-gray-700 mb-6">
              Each screening application goes through the following statuses:
            </p>

            <div className="space-y-4">
              {/* PENDING */}
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-amber-500 p-1.5 rounded-lg">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="font-bold text-amber-900">PENDING</h4>
                </div>
                <p className="text-sm text-amber-800">
                  Invitation has been sent to the tenant. Waiting for the tenant to complete and submit the screening form.
                </p>
              </div>

              {/* SUBMITTED */}
              <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-indigo-500 p-1.5 rounded-lg">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="font-bold text-indigo-900">SUBMITTED</h4>
                </div>
                <p className="text-sm text-indigo-800">
                  Tenant has submitted their screening form. The landlord can now review the information and AI assessment to make a decision.
                </p>
              </div>

              {/* APPROVED */}
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-emerald-500 p-1.5 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="font-bold text-emerald-900">APPROVED</h4>
                </div>
                <p className="text-sm text-emerald-800">
                  Landlord has approved the tenant's application. The tenant is cleared to proceed with the lease signing process.
                </p>
              </div>

              {/* REJECTED */}
              <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-red-500 p-1.5 rounded-lg">
                    <XCircle className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="font-bold text-red-900">REJECTED</h4>
                </div>
                <p className="text-sm text-red-800">
                  Landlord has declined the tenant's application. A reason or remark may be provided to the tenant.
                </p>
              </div>
            </div>

            {/* Visual Flow */}
            <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-sm text-gray-600 text-center mb-4 font-medium">Status Flow</p>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <span className="px-3 py-1.5 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">PENDING</span>
                <span className="text-gray-400">→</span>
                <span className="px-3 py-1.5 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">SUBMITTED</span>
                <span className="text-gray-400">→</span>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium">APPROVED</span>
                  <span className="text-gray-400 hidden sm:inline">or</span>
                  <span className="text-gray-400 sm:hidden">or</span>
                  <span className="px-3 py-1.5 bg-red-100 text-red-800 rounded-full text-xs font-medium">REJECTED</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Information Collected */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="p-6 sm:p-8 bg-white border-2 border-purple-100 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-sky-600 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Information Collected from Tenants</h2>
            </div>

            <p className="text-gray-700 mb-6">
              The screening form collects the following information to help landlords assess tenant suitability:
            </p>

            <div className="space-y-4">
              {/* Basic Info */}
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <UserCheck className="w-5 h-5 text-blue-600" />
                  <h4 className="font-semibold text-blue-900">Basic Information</h4>
                </div>
                <ul className="grid sm:grid-cols-2 gap-2 text-sm text-blue-800">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                    <span>Full Name</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                    <span>Birthdate</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                    <span>Employment Status (Student, Employed, Self-Employed, Unemployed)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                    <span>Income Source (Salary, Business, Allowance)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                    <span>Monthly Income</span>
                  </li>
                </ul>
              </div>

              {/* Document Checks */}
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-5 h-5 text-emerald-600" />
                  <h4 className="font-semibold text-emerald-900">Document & Identity Verification</h4>
                </div>
                <p className="text-xs text-emerald-700 mb-2 italic">Tenant confirms availability of these documents (landlord may verify in person)</p>
                <ul className="grid sm:grid-cols-2 gap-2 text-sm text-emerald-800">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <span>Has Valid Government ID</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <span>Has NBI Clearance</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <span>Has Proof of Income</span>
                  </li>
                </ul>
              </div>

              {/* Employment History */}
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <div className="flex items-center gap-2 mb-3">
                  <Briefcase className="w-5 h-5 text-amber-600" />
                  <h4 className="font-semibold text-amber-900">Employment History</h4>
                </div>
                <ul className="grid sm:grid-cols-2 gap-2 text-sm text-amber-800">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    <span>Current Employer</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    <span>Job Position/Role</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    <span>Years Employed</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    <span>Employment Remarks</span>
                  </li>
                </ul>
              </div>

              {/* Rental History */}
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                <div className="flex items-center gap-2 mb-3">
                  <Home className="w-5 h-5 text-purple-600" />
                  <h4 className="font-semibold text-purple-900">Rental History</h4>
                </div>
                <ul className="grid sm:grid-cols-2 gap-2 text-sm text-purple-800">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
                    <span>Previous Landlord Name</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
                    <span>Previous Landlord Contact</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
                    <span>Previous Rental Address</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
                    <span>Reason for Leaving</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                    <span>Eviction History (Yes/No)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                    <span>Late Payment History (Yes/No)</span>
                  </li>
                </ul>
              </div>

              {/* Lifestyle */}
              <div className="p-4 bg-pink-50 rounded-xl border border-pink-200">
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="w-5 h-5 text-pink-600" />
                  <h4 className="font-semibold text-pink-900">Lifestyle Indicators</h4>
                </div>
                <p className="text-xs text-pink-700 mb-2 italic">Used to assess compatibility with property rules</p>
                <ul className="grid sm:grid-cols-2 gap-2 text-sm text-pink-800">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-pink-500 flex-shrink-0" />
                    <span>Smokes (Yes/No)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-pink-500 flex-shrink-0" />
                    <span>Drinks Alcohol (Yes/No)</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* AI Risk Assessment */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="p-6 sm:p-8 bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-3 rounded-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">AI Risk Assessment</h2>
            </div>

            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                After a tenant submits their screening form, our <strong>AI system analyzes the information</strong> and generates a risk assessment to help landlords make informed decisions.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-xl border border-indigo-200">
                  <h4 className="font-semibold text-indigo-900 mb-3">AI Generates:</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Risk Score</strong> - 0.0 to 1.0 (lower is better)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Risk Level</strong> - LOW, MEDIUM, or HIGH</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Summary</strong> - Readable assessment result</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Detailed Findings</strong> - By category</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 bg-white rounded-xl border border-indigo-200">
                  <h4 className="font-semibold text-indigo-900 mb-3">AI Evaluates:</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• Financial stability</li>
                    <li>• Employment history</li>
                    <li>• Identity verification</li>
                    <li>• Document availability</li>
                    <li>• Rental history</li>
                    <li>• Eviction risk</li>
                    <li>• Payment behavior</li>
                    <li>• Lifestyle compatibility</li>
                    <li>• Overall assessment</li>
                  </ul>
                </div>
              </div>

              {/* Risk Level Indicators */}
              <div className="p-4 bg-white rounded-xl border border-indigo-200">
                <h4 className="font-semibold text-gray-900 mb-3">Risk Level Indicators:</h4>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-center">
                    <div className="w-8 h-8 bg-emerald-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                    <p className="font-bold text-emerald-900">LOW</p>
                    <p className="text-xs text-emerald-700">Good candidate</p>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-center">
                    <div className="w-8 h-8 bg-amber-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-white" />
                    </div>
                    <p className="font-bold text-amber-900">MEDIUM</p>
                    <p className="text-xs text-amber-700">Some concerns</p>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-center">
                    <div className="w-8 h-8 bg-red-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-white" />
                    </div>
                    <p className="font-bold text-red-900">HIGH</p>
                    <p className="text-xs text-red-700">Review carefully</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-amber-900 mb-1">AI is a Tool, Not a Decision Maker</h4>
                    <p className="text-sm text-amber-800">
                      The AI assessment is meant to <strong>assist</strong> landlords, not replace their judgment. Always review the full application and consider meeting the tenant in person before making your final decision.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Best Practices for Landlords */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="p-6 sm:p-8 bg-white border-2 border-purple-100 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-emerald-600 p-3 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Best Practices for Landlords</h2>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <h4 className="font-semibold text-emerald-900 mb-2">✓ Verify Documents in Person</h4>
                <p className="text-sm text-emerald-800">
                  The screening form confirms document availability. Always verify actual documents (ID, NBI clearance, proof of income) when meeting the tenant in person.
                </p>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <h4 className="font-semibold text-emerald-900 mb-2">✓ Contact Previous Landlords</h4>
                <p className="text-sm text-emerald-800">
                  If the tenant provided previous landlord contact info, reach out to verify rental history and get a reference.
                </p>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <h4 className="font-semibold text-emerald-900 mb-2">✓ Consider the Full Picture</h4>
                <p className="text-sm text-emerald-800">
                  Don't rely solely on the AI risk score. Consider the tenant's overall situation, communication, and your personal interaction during property viewings.
                </p>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <h4 className="font-semibold text-emerald-900 mb-2">✓ Provide Clear Feedback</h4>
                <p className="text-sm text-emerald-800">
                  If rejecting an application, provide a brief, respectful remark explaining the decision. This maintains professionalism and helps tenants understand.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex justify-between items-center pt-6"
        >
          <Button
            variant="outline"
            onClick={() => navigate("/guidelines/listing-best-practices")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Listing Best Practices
          </Button>
          
          <Button
            onClick={() => navigate("/guidelines/communication")}
            className="gap-2 bg-purple-600 hover:bg-purple-700"
          >
            Next: Communication
            <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default TenantScreeningGuideline;

