import { ArrowLeft, MessageSquare, Users, Clock, CheckCircle2, AlertCircle, ArrowRight, MessageCircle, Bell, Shield, XCircle, Inbox, Send } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const CommunicationGuideline = () => {
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
            className="flex items-center gap-2 text-gray-600 hover:text-sky-600 transition-colors font-medium"
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
      <section className="relative py-12 overflow-hidden bg-gradient-to-br from-sky-600 via-sky-500 to-cyan-600">
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
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-sky-100 text-sm font-medium">Guidelines</p>
                <h1 className="text-3xl sm:text-4xl font-bold text-white">
                  Communication
                </h1>
              </div>
            </div>
            <p className="text-lg text-sky-100 max-w-2xl">
              Learn how to effectively communicate with tenants or landlords using RentEase's built-in messaging system.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* What is Chat Channel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="p-6 sm:p-8 bg-white border-2 border-sky-100 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-sky-600 p-3 rounded-lg">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">In-App Messaging System</h2>
            </div>

            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                RentEase provides a built-in <strong>messaging system</strong> that allows landlords and tenants to communicate directly within the platform. Each conversation between a landlord and tenant is organized into a <strong>Chat Channel</strong>.
              </p>

              <div className="p-4 bg-sky-50 rounded-xl border border-sky-200">
                <h4 className="font-semibold text-sky-900 mb-3">How It Works:</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-sky-200 text-sky-800 font-bold text-sm w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
                    <div>
                      <p className="font-medium text-sky-900">Tenant Initiates Contact</p>
                      <p className="text-sm text-sky-700">When a tenant is interested in a listing, they can send an inquiry message to the landlord</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-sky-200 text-sky-800 font-bold text-sm w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
                    <div>
                      <p className="font-medium text-sky-900">Chat Channel Created</p>
                      <p className="text-sm text-sky-700">A unique conversation channel is created between the tenant and landlord</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-sky-200 text-sky-800 font-bold text-sm w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
                    <div>
                      <p className="font-medium text-sky-900">Ongoing Communication</p>
                      <p className="text-sm text-sky-700">Both parties can exchange messages, discuss details, and coordinate viewings</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Inbox className="w-4 h-4 text-sky-600" />
                    Chat Channel Contains:
                  </h4>
                  <ul className="space-y-1.5 text-sm text-gray-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 flex-shrink-0" />
                      <span>Tenant & Landlord participants</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 flex-shrink-0" />
                      <span>Channel status (Inquiry, Active, Ended)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 flex-shrink-0" />
                      <span>Last message preview</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 flex-shrink-0" />
                      <span>Read status tracking</span>
                    </li>
                  </ul>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Send className="w-4 h-4 text-sky-600" />
                    Each Message Contains:
                  </h4>
                  <ul className="space-y-1.5 text-sm text-gray-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 flex-shrink-0" />
                      <span>Message content</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 flex-shrink-0" />
                      <span>Sender information</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 flex-shrink-0" />
                      <span>Timestamp (when sent)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 flex-shrink-0" />
                      <span>Read timestamp (when viewed)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Channel Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="p-6 sm:p-8 bg-white border-2 border-sky-100 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-indigo-600 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Channel Status Types</h2>
            </div>

            <p className="text-gray-700 mb-6">
              Each chat channel has a status that reflects the current state of the conversation:
            </p>

            <div className="space-y-4">
              {/* INQUIRY */}
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-amber-500 p-1.5 rounded-lg">
                    <MessageSquare className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="font-bold text-amber-900">INQUIRY</h4>
                  <span className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full font-medium">Default</span>
                </div>
                <p className="text-sm text-amber-800">
                  Initial status when a tenant first reaches out about a listing. The conversation is in the inquiry phase - typically discussing property details, availability, and scheduling viewings.
                </p>
              </div>

              {/* ACTIVE */}
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-emerald-500 p-1.5 rounded-lg">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="font-bold text-emerald-900">ACTIVE</h4>
                </div>
                <p className="text-sm text-emerald-800">
                  The conversation is ongoing and both parties are actively communicating. This typically happens after initial interest is confirmed and discussions are progressing toward a potential lease.
                </p>
              </div>

              {/* ENDED */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-gray-500 p-1.5 rounded-lg">
                    <XCircle className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="font-bold text-gray-900">ENDED</h4>
                </div>
                <p className="text-sm text-gray-700">
                  The conversation has concluded. This could mean the tenant found another place, the landlord filled the unit, or both parties decided not to proceed.
                </p>
              </div>
            </div>

            {/* Visual Flow */}
            <div className="mt-6 p-4 bg-sky-50 rounded-xl border border-sky-200">
              <p className="text-sm text-sky-700 text-center mb-4 font-medium">Typical Channel Flow</p>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <span className="px-3 py-1.5 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">INQUIRY</span>
                <span className="text-gray-400">→</span>
                <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium">ACTIVE</span>
                <span className="text-gray-400">→</span>
                <span className="px-3 py-1.5 bg-gray-200 text-gray-800 rounded-full text-xs font-medium">ENDED</span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Benefits of In-App Messaging */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="p-6 sm:p-8 bg-gradient-to-br from-sky-50 to-cyan-50 border-2 border-sky-200 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-sky-600 to-cyan-600 p-3 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Benefits of In-App Messaging</h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-xl border border-sky-200">
                <h4 className="font-semibold text-sky-900 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-600" />
                  Conversation History
                </h4>
                <p className="text-sm text-gray-700">
                  All messages are saved and organized. Easily refer back to previous discussions about terms, agreements, or property details.
                </p>
              </div>

              <div className="p-4 bg-white rounded-xl border border-sky-200">
                <h4 className="font-semibold text-sky-900 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-600" />
                  Read Receipts
                </h4>
                <p className="text-sm text-gray-700">
                  Know when your messages have been read. This helps you understand if the other party has seen your message.
                </p>
              </div>

              <div className="p-4 bg-white rounded-xl border border-sky-200">
                <h4 className="font-semibold text-sky-900 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-600" />
                  Organized Conversations
                </h4>
                <p className="text-sm text-gray-700">
                  Each tenant-landlord pair has a dedicated channel. No mixing up conversations or losing track of who said what.
                </p>
              </div>

              <div className="p-4 bg-white rounded-xl border border-sky-200">
                <h4 className="font-semibold text-sky-900 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-600" />
                  Documentation
                </h4>
                <p className="text-sm text-gray-700">
                  Messages serve as a record of discussions. Useful if there are any disputes about what was discussed or agreed upon.
                </p>
              </div>

              <div className="p-4 bg-white rounded-xl border border-sky-200">
                <h4 className="font-semibold text-sky-900 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-600" />
                  Privacy Protection
                </h4>
                <p className="text-sm text-gray-700">
                  Communicate without sharing personal phone numbers or email addresses until you're ready.
                </p>
              </div>

              <div className="p-4 bg-white rounded-xl border border-sky-200">
                <h4 className="font-semibold text-sky-900 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-600" />
                  Notifications
                </h4>
                <p className="text-sm text-gray-700">
                  Get notified when you receive new messages so you can respond promptly.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Response Time Expectations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="p-6 sm:p-8 bg-white border-2 border-sky-100 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-amber-500 p-3 rounded-lg">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Response Time Expectations</h2>
            </div>

            <div className="space-y-4">
              <p className="text-gray-700">
                Good communication is key to successful landlord-tenant relationships. Here are recommended response times:
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                  <h4 className="font-semibold text-emerald-900 mb-2">General Inquiries</h4>
                  <p className="text-sm text-emerald-800">
                    Respond within <strong>24-48 hours</strong>. Quick responses show professionalism and increase chances of securing good tenants.
                  </p>
                </div>

                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <h4 className="font-semibold text-amber-900 mb-2">Viewing Requests</h4>
                  <p className="text-sm text-amber-800">
                    Respond within <strong>24 hours</strong>. Tenants often have multiple options and may move on quickly.
                  </p>
                </div>

                <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                  <h4 className="font-semibold text-red-900 mb-2">Urgent Matters</h4>
                  <p className="text-sm text-red-800">
                    Respond <strong>as soon as possible</strong>. Issues like maintenance emergencies or lease concerns need immediate attention.
                  </p>
                </div>

                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">Ongoing Discussions</h4>
                  <p className="text-sm text-blue-800">
                    Keep the conversation flowing. Don't leave messages unanswered for extended periods.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Best Practices */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="p-6 sm:p-8 bg-white border-2 border-sky-100 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-emerald-600 p-3 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Communication Best Practices</h2>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <h4 className="font-semibold text-emerald-900 mb-2">✓ Be Professional and Courteous</h4>
                <p className="text-sm text-emerald-800">
                  Maintain a respectful tone in all communications. First impressions matter, and professionalism builds trust.
                </p>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <h4 className="font-semibold text-emerald-900 mb-2">✓ Be Clear and Specific</h4>
                <p className="text-sm text-emerald-800">
                  Provide clear information about property details, availability, pricing, and requirements. Avoid vague responses that lead to follow-up questions.
                </p>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <h4 className="font-semibold text-emerald-900 mb-2">✓ Respond Promptly</h4>
                <p className="text-sm text-emerald-800">
                  Quick responses show you're engaged and reliable. Set aside time daily to check and respond to messages.
                </p>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <h4 className="font-semibold text-emerald-900 mb-2">✓ Keep Records of Important Agreements</h4>
                <p className="text-sm text-emerald-800">
                  If you discuss terms, pricing, or special arrangements, summarize them in a message so both parties have a record.
                </p>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <h4 className="font-semibold text-emerald-900 mb-2">✓ Set Communication Boundaries</h4>
                <p className="text-sm text-emerald-800">
                  Let the other party know your preferred communication hours. It's okay to set expectations about response times.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Things to Avoid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="p-6 sm:p-8 bg-white border-2 border-red-100 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-red-600 p-3 rounded-lg">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Things to Avoid</h2>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  Sharing Sensitive Information Too Early
                </h4>
                <p className="text-sm text-red-800">
                  Don't share bank account details, personal IDs, or other sensitive information through chat until you've verified the other party and are ready to proceed.
                </p>
              </div>

              <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  Requesting Payments Through Chat
                </h4>
                <p className="text-sm text-red-800">
                  Never request or send payments through the messaging system. Always handle payments in person with proper documentation.
                </p>
              </div>

              <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  Ignoring Messages
                </h4>
                <p className="text-sm text-red-800">
                  Even if you're not interested, respond to let the other party know. Ghosting damages your reputation and wastes everyone's time.
                </p>
              </div>

              <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  Unprofessional Language
                </h4>
                <p className="text-sm text-red-800">
                  Avoid rude, aggressive, or inappropriate language. This can result in account warnings or suspension.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="flex justify-between items-center pt-6"
        >
          <Button
            variant="outline"
            onClick={() => navigate("/guidelines/tenant-screening")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Tenant Screening
          </Button>
          
          <Button
            onClick={() => navigate("/guidelines/lease-management")}
            className="gap-2 bg-sky-600 hover:bg-sky-700"
          >
            Next: Lease Management
            <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default CommunicationGuideline;

