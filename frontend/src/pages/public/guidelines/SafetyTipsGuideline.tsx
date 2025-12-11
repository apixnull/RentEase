import { ArrowLeft, Shield, AlertTriangle, Building, FileText, Lock, Eye, CheckCircle2, XCircle, ArrowRight, Ban, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const SafetyTipsGuideline = () => {
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
            className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors font-medium"
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
      <section className="relative py-12 overflow-hidden bg-gradient-to-br from-red-600 via-rose-500 to-pink-600">
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
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-red-100 text-sm font-medium">Guidelines</p>
                <h1 className="text-3xl sm:text-4xl font-bold text-white">
                  Safety Tips & Fraud Prevention
                </h1>
              </div>
            </div>
            <p className="text-lg text-red-100 max-w-2xl">
              Protect yourself and your properties from fraudulent tenants and scams. Learn how to identify red flags and prevent fraud when using RentEase.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Critical Warning */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="p-6 sm:p-8 bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-300 rounded-2xl shadow-lg">
            <div className="flex items-start gap-4">
              <div className="bg-red-600 p-3 rounded-lg flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-red-900 mb-3">⚠️ Important Safety Warning</h2>
                <p className="text-red-800 leading-relaxed mb-4">
                  As a landlord, it's crucial to remain vigilant against fraudulent tenants and scams. Always verify tenant information, use secure payment methods, conduct proper screening, and report suspicious behavior immediately.
                </p>
                <div className="p-4 bg-red-100 rounded-xl border border-red-300">
                  <p className="text-sm font-semibold text-red-900 mb-2">If you encounter suspicious activity:</p>
                  <ul className="text-sm text-red-800 space-y-1 list-disc list-inside">
                    <li>Do not proceed with any lease or transaction</li>
                    <li>Report the tenant or application immediately</li>
                    <li>Contact RentEase support</li>
                    <li>If you've been scammed, contact local authorities</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* For Landlords: Preventing Fraud */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="p-6 sm:p-8 bg-white border-2 border-red-100 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-purple-600 p-3 rounded-lg">
                <Building className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">For Landlords: Preventing Fraud</h2>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 text-lg">Common Fraudulent Activities to Watch For:</h3>
                
                <div className="space-y-4">
                  {/* Fake Tenant Applications */}
                  <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                    <div className="flex items-start gap-3 mb-2">
                      <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-red-900">Fake Tenant Applications</h4>
                        <p className="text-sm text-red-800 mt-1">
                          Scammers may submit applications with fake identities, forged documents, or stolen personal information to gain access to properties.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Overpayment Scams */}
                  <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                    <div className="flex items-start gap-3 mb-2">
                      <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-red-900">Overpayment Scams</h4>
                        <p className="text-sm text-red-800 mt-1">
                          A "tenant" sends a check or payment for more than the required amount and asks you to refund the difference. The original payment is fake and will bounce, leaving you out of money.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Identity Theft */}
                  <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                    <div className="flex items-start gap-3 mb-2">
                      <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-red-900">Identity Theft Attempts</h4>
                        <p className="text-sm text-red-800 mt-1">
                          Scammers may try to obtain your personal information, property details, or financial information through fake inquiries or applications.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Property Damage/Theft */}
                  <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                    <div className="flex items-start gap-3 mb-2">
                      <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-red-900">Property Damage or Theft</h4>
                        <p className="text-sm text-red-800 mt-1">
                          Fraudulent tenants may cause intentional damage, steal appliances or fixtures, or use the property for illegal activities.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Fake References */}
                  <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                    <div className="flex items-start gap-3 mb-2">
                      <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-red-900">Fake References or Documents</h4>
                        <p className="text-sm text-red-800 mt-1">
                          Scammers may provide fake employment letters, bank statements, or references from accomplices posing as previous landlords or employers.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Squatting */}
                  <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                    <div className="flex items-start gap-3 mb-2">
                      <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-red-900">Squatting or Illegal Occupancy</h4>
                        <p className="text-sm text-red-800 mt-1">
                          Fraudulent tenants may move in without proper lease documentation or refuse to leave after lease expiration, making eviction difficult.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3 text-lg">How to Protect Yourself:</h3>
                
                <div className="space-y-3">
                  <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-purple-900 mb-1">Use Tenant Screening</h4>
                        <p className="text-sm text-purple-800">
                          Always use the platform's tenant screening feature. Verify identity, employment, income, and rental history. Don't skip background checks, even if a tenant seems trustworthy.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-purple-900 mb-1">Verify All Documents</h4>
                        <p className="text-sm text-purple-800">
                          Check employment letters, bank statements, and references independently. Call employers and previous landlords directly using publicly listed numbers, not numbers provided by the applicant.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-purple-900 mb-1">Meet Tenants in Person</h4>
                        <p className="text-sm text-purple-800">
                          Always meet prospective tenants in person before signing a lease. Verify their identity matches their application. Be cautious of tenants who refuse to meet or only communicate online.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-purple-900 mb-1">Require Proper Lease Documentation</h4>
                        <p className="text-sm text-purple-800">
                          Never allow tenants to move in without a signed lease. Ensure all terms are clearly documented, including rent amount, deposit, lease duration, and responsibilities. Keep copies of all documents.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-purple-900 mb-1">Be Wary of Overpayments</h4>
                        <p className="text-sm text-purple-800">
                          If a tenant sends more than required and asks for a refund, this is almost always a scam. Wait for payments to fully clear before refunding any amount. Better yet, only accept exact amounts.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-purple-900 mb-1">Check Payment Methods</h4>
                        <p className="text-sm text-purple-800">
                          Use secure, traceable payment methods. Be cautious of checks, money orders, or wire transfers from unknown sources. Wait for payments to clear before providing keys or access.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-purple-900 mb-1">Protect Your Personal Information</h4>
                        <p className="text-sm text-purple-800">
                          Don't share sensitive information like bank account details, social security numbers, or passwords. Use the platform's secure messaging system for communication.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-purple-900 mb-1">Conduct Regular Property Inspections</h4>
                        <p className="text-sm text-purple-800">
                          Schedule regular inspections (with proper notice) to ensure the property is being maintained and not used for illegal activities. Document the property condition regularly.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-purple-900 mb-1">Trust Your Instincts</h4>
                        <p className="text-sm text-purple-800">
                          If something feels off about an applicant or situation, trust your instincts. Don't let pressure or urgency rush you into a decision. There are always other tenants.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-amber-900 mb-1">Red Flags to Watch For:</h4>
                    <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                      <li>Tenant refuses to provide identification or screening information</li>
                      <li>Overpayment with request for refund</li>
                      <li>Rush to move in without proper documentation</li>
                      <li>Unwillingness to meet in person</li>
                      <li>Fake or suspicious documents</li>
                      <li>References that can't be verified</li>
                      <li>Unusual payment methods or requests</li>
                      <li>Poor communication or evasive answers</li>
                      <li>Inconsistent information in application</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* General Safety Tips for Landlords */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="p-6 sm:p-8 bg-white border-2 border-red-100 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-green-600 p-3 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">General Safety Tips for Landlords</h2>
            </div>

            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Protect Your Account
                  </h4>
                  <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
                    <li>Use a strong, unique password</li>
                    <li>Enable two-factor authentication if available</li>
                    <li>Never share your login credentials</li>
                    <li>Log out from shared devices</li>
                  </ul>
                </div>

                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Verify Tenant Information
                  </h4>
                  <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
                    <li>Verify tenant identity through multiple sources</li>
                    <li>Check employment and income independently</li>
                    <li>Verify contact information and references</li>
                    <li>Research tenant background before approving</li>
                  </ul>
                </div>

                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Document Everything
                  </h4>
                  <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
                    <li>Keep copies of all tenant communications</li>
                    <li>Save payment receipts and transaction records</li>
                    <li>Document property condition before and after</li>
                    <li>Keep signed lease and contract copies</li>
                  </ul>
                </div>

                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                    <Ban className="w-4 h-4" />
                    Report Suspicious Activity
                  </h4>
                  <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
                    <li>Report fraudulent tenants immediately</li>
                    <li>Flag suspicious applications or behavior</li>
                    <li>Contact RentEase support</li>
                    <li>File police reports if scammed</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* What to Do If You've Been Scammed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="p-6 sm:p-8 bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-300 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-red-600 p-3 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-red-900">What to Do If You've Been Scammed</h2>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-white rounded-xl border border-red-200">
                <h4 className="font-semibold text-red-900 mb-2">Immediate Actions:</h4>
                <ol className="text-sm text-red-800 space-y-2 list-decimal list-inside">
                  <li><strong>Stop all communication</strong> with the fraudulent tenant immediately</li>
                  <li><strong>Document everything:</strong> Save all messages, emails, screenshots, application documents, and transaction records</li>
                  <li><strong>Report to RentEase:</strong> Contact support immediately with all evidence</li>
                  <li><strong>Report to authorities:</strong> File a report with local police and relevant fraud agencies</li>
                  <li><strong>Contact your bank:</strong> If you've received fraudulent payments or sent refunds, contact your bank immediately</li>
                  <li><strong>Secure your property:</strong> If a fraudulent tenant has access, take appropriate legal steps to secure your property</li>
                  <li><strong>Monitor your accounts:</strong> Watch for unauthorized transactions or identity theft</li>
                </ol>
              </div>

              <div className="p-4 bg-white rounded-xl border border-red-200">
                <h4 className="font-semibold text-red-900 mb-2">Information to Provide:</h4>
                <ul className="text-sm text-red-800 space-y-1 list-disc list-inside">
                  <li>Tenant username or profile information</li>
                  <li>Screenshots of conversations and applications</li>
                  <li>Transaction records and payment details</li>
                  <li>Property address and unit information</li>
                  <li>Tenant screening reports and documents</li>
                  <li>Timeline of events</li>
                  <li>Any other relevant evidence</li>
                </ul>
              </div>

              <div className="p-4 bg-red-100 rounded-xl border border-red-300">
                <p className="text-sm text-red-900">
                  <strong>Remember:</strong> While RentEase works to prevent fraud, you are ultimately responsible for verifying tenant information and conducting proper screening. Always exercise caution, verify all documents independently, and use the platform's screening tools before approving any tenant or signing a lease.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex justify-between items-center pt-6"
        >
          <Button
            variant="outline"
            onClick={() => navigate("/guidelines/maintenance")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Maintenance Requests
          </Button>
          
          <Button
            onClick={() => navigate("/guidelines")}
            className="gap-2 bg-red-600 hover:bg-red-700"
          >
            All Guidelines
            <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default SafetyTipsGuideline;

