import { ArrowLeft, Lightbulb, Eye, EyeOff, Clock, Ban, Flag, FileSearch, Star, Camera, FileText, CheckCircle2, AlertCircle, XCircle, Shield, ArrowRight, Sparkles, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ListingBestPracticesGuideline = () => {
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
            className="flex items-center gap-2 text-gray-600 hover:text-amber-600 transition-colors font-medium"
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
      <section className="relative py-12 overflow-hidden bg-gradient-to-br from-amber-500 via-amber-400 to-yellow-500">
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
                <Lightbulb className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-amber-100 text-sm font-medium">Guidelines</p>
                <h1 className="text-3xl sm:text-4xl font-bold text-white">
                  Listing Best Practices
                </h1>
              </div>
            </div>
            <p className="text-lg text-amber-100 max-w-2xl">
              Learn how to create effective listings that attract quality tenants and get approved quickly.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* What is a Listing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="p-6 sm:p-8 bg-white border-2 border-amber-100 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-amber-500 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">What is a Listing?</h2>
            </div>

            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                A <strong>Listing</strong> is an advertisement for your unit that makes it visible to prospective tenants browsing on RentEase. When you create a listing, your unit's information (along with its parent property details) becomes searchable and viewable by tenants looking for their next home.
              </p>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Key Points About Listings
                </h4>
                <ul className="space-y-2 text-sm text-amber-800">
                  <li>• A listing is created for a <strong>specific unit</strong> within a property</li>
                  <li>• The listing displays both property info (address, main image) and unit info (price, amenities)</li>
                  <li>• Listings require payment and admin review before becoming visible</li>
                  <li>• Each listing has a lifecycle status that tracks its current state</li>
                  <li>• You can optionally make your listing <strong>Featured</strong> for more visibility</li>
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Listing Lifecycle Statuses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="p-6 sm:p-8 bg-white border-2 border-amber-100 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-purple-600 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Listing Lifecycle Statuses</h2>
            </div>

            <p className="text-gray-700 mb-6">
              Every listing goes through different stages. Understanding these statuses helps you manage your listings effectively.
            </p>

            <div className="space-y-4">
              {/* WAITING_REVIEW */}
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-purple-500 p-1.5 rounded-lg">
                    <FileSearch className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="font-bold text-purple-900">WAITING_REVIEW</h4>
                </div>
                <p className="text-sm text-purple-800">
                  Payment complete, waiting for admin review. Your listing is in the queue and will be reviewed by our team to ensure it meets our guidelines.
                </p>
              </div>

              {/* VISIBLE */}
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-emerald-500 p-1.5 rounded-lg">
                    <Eye className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="font-bold text-emerald-900">VISIBLE</h4>
                  <span className="text-xs bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full font-medium">Goal Status</span>
                </div>
                <p className="text-sm text-emerald-800">
                  Publicly visible and active! Your listing has passed review and is now live on the platform, visible to all tenants browsing for properties.
                </p>
              </div>

              {/* HIDDEN */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-gray-500 p-1.5 rounded-lg">
                    <EyeOff className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="font-bold text-gray-900">HIDDEN</h4>
                </div>
                <p className="text-sm text-gray-700">
                  Temporarily hidden by you. You can hide your listing at any time (e.g., when the unit is temporarily unavailable). You can make it visible again when ready.
                </p>
              </div>

              {/* EXPIRED */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-slate-500 p-1.5 rounded-lg">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="font-bold text-slate-900">EXPIRED</h4>
                </div>
                <p className="text-sm text-slate-700">
                  Listing duration has ended. Your listing's advertising period has expired. You can renew or extend the listing to make it visible again.
                </p>
              </div>

              {/* FLAGGED */}
              <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-orange-500 p-1.5 rounded-lg">
                    <Flag className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="font-bold text-orange-900">FLAGGED</h4>
                  <span className="text-xs bg-orange-200 text-orange-800 px-2 py-0.5 rounded-full font-medium">Warning</span>
                </div>
                <p className="text-sm text-orange-800">
                  Found suspicious and will be hidden. Our AI moderation or admin review has detected potential issues. The listing is temporarily hidden pending further review. You will be notified of the specific concerns.
                </p>
              </div>

              {/* BLOCKED */}
              <div className="p-4 bg-red-50 rounded-xl border-2 border-red-300">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-red-600 p-1.5 rounded-lg">
                    <Ban className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="font-bold text-red-900">BLOCKED</h4>
                  <span className="text-xs bg-red-200 text-red-800 px-2 py-0.5 rounded-full font-medium">Serious</span>
                </div>
                <p className="text-sm text-red-800 font-medium">
                  Fully removed or deactivated due to violations. Your listing has been permanently blocked due to serious policy violations. Blocked listings cannot be restored and may result in account penalties.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Featured Listings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <Card className="p-6 sm:p-8 bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-yellow-500 to-amber-500 p-3 rounded-lg">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Featured Listings</h2>
            </div>

            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                <strong>Featured listings</strong> get priority placement in search results and browse pages, making them more visible to prospective tenants.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-xl border border-yellow-200">
                  <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-yellow-600" />
                    Benefits of Featured
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Appears at top of search results</li>
                    <li>• Special "Featured" badge displayed</li>
                    <li>• Higher visibility to tenants</li>
                    <li>• Faster tenant inquiries</li>
                  </ul>
                </div>
                <div className="p-4 bg-white rounded-xl border border-yellow-200">
                  <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-yellow-600" />
                    How to Get Featured
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Select "Featured" option when creating listing</li>
                    <li>• Pay the featured listing fee</li>
                    <li>• Pass admin review</li>
                    <li>• Your listing gets priority placement</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* AI Moderation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="p-6 sm:p-8 bg-white border-2 border-amber-100 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-indigo-600 p-3 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">AI Content Moderation</h2>
            </div>

            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Our platform uses <strong>AI-powered content moderation</strong> to automatically detect and flag prohibited content before admin review. This helps maintain a safe and trustworthy platform.
              </p>

              <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                <h4 className="font-semibold text-indigo-900 mb-3">What AI Checks For:</h4>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="flex items-start gap-2 text-sm text-indigo-800">
                    <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span><strong>Scam patterns</strong> - Requests for upfront online payments</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-indigo-800">
                    <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span><strong>Fake info</strong> - Misleading or false information</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-indigo-800">
                    <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span><strong>Discriminatory</strong> - Content that discriminates</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-indigo-800">
                    <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span><strong>Illegal content</strong> - Prohibited activities</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-indigo-800">
                    <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span><strong>Inappropriate</strong> - Explicit or offensive content</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-indigo-800">
                    <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span><strong>Other violations</strong> - Policy breaches</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-amber-900 mb-1">What Happens If Flagged?</h4>
                    <p className="text-sm text-amber-800">
                      If AI detects issues, your listing will be flagged and the problematic content will be logged for admin review. You'll be notified and given a chance to correct the issue before resubmitting.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* How to Get Approved */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          <Card className="p-6 sm:p-8 bg-white border-2 border-emerald-200 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-emerald-600 p-3 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">How to Get Your Listing Approved</h2>
            </div>

            <p className="text-gray-700 mb-6">
              Follow these guidelines to ensure your listing quickly passes review and becomes <strong>VISIBLE</strong>:
            </p>

            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <h4 className="font-semibold text-emerald-900 mb-2 flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  Quality Photos
                </h4>
                <ul className="text-sm text-emerald-800 space-y-1">
                  <li>• Upload clear, well-lit photos of the actual unit</li>
                  <li>• Include interior shots showing rooms, layout, and amenities</li>
                  <li>• Use recent photos that reflect current condition</li>
                  <li>• Avoid stock photos or images from other sources</li>
                  <li>• Take photos during daytime for best lighting</li>
                </ul>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <h4 className="font-semibold text-emerald-900 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Accurate Information
                </h4>
                <ul className="text-sm text-emerald-800 space-y-1">
                  <li>• Provide honest, detailed descriptions that match the property</li>
                  <li>• Set realistic rental prices with no hidden fees</li>
                  <li>• Ensure all fields are complete and accurate</li>
                  <li>• List actual amenities available in the unit</li>
                  <li>• Keep lease rules clear and reasonable</li>
                </ul>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <h4 className="font-semibold text-emerald-900 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Complete All Details
                </h4>
                <ul className="text-sm text-emerald-800 space-y-1">
                  <li>• Fill in property address completely</li>
                  <li>• Add max occupancy and floor number</li>
                  <li>• Select applicable amenities</li>
                  <li>• Set unit condition accurately</li>
                  <li>• Enable screening requirement if needed</li>
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* How to Avoid Getting Flagged/Blocked */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="p-6 sm:p-8 bg-white border-2 border-red-200 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-red-600 p-3 rounded-lg">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">How to Avoid Getting Flagged or Blocked</h2>
            </div>

            <p className="text-gray-700 mb-6">
              To prevent your listing from being flagged or blocked, <strong>strictly avoid</strong> the following:
            </p>

            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  Scamming Patterns
                </h4>
                <p className="text-sm text-red-800">
                  <strong>NEVER</strong> request upfront online payments before property viewing. Our AI automatically detects and blocks such requests. Always meet tenants in person first.
                </p>
              </div>

              <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  Discriminatory Information
                </h4>
                <p className="text-sm text-red-800">
                  Do not include any language that discriminates based on race, religion, gender, age, disability, or other protected characteristics.
                </p>
              </div>

              <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  False or Misleading Information
                </h4>
                <p className="text-sm text-red-800">
                  Do not misrepresent the property - location, size, amenities, condition, or availability. All information must be accurate and truthful.
                </p>
              </div>

              <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  Inappropriate Content
                </h4>
                <p className="text-sm text-red-800">
                  Do not use inappropriate, explicit, or offensive images as property pictures. Use only property-related photos.
                </p>
              </div>

              <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  Duplicate or Fake Listings
                </h4>
                <p className="text-sm text-red-800">
                  Do not create multiple listings for the same unit or listings for properties that don't exist or aren't available for rent.
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-amber-900 mb-1">Important Warning</h4>
                  <p className="text-sm text-amber-800">
                    Repeated flagging may lead to <strong>BLOCKED</strong> status. Blocked listings cannot be restored, and serious violations may result in <strong>account suspension or termination</strong>.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Quick Tips Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
        >
          <Card className="p-6 sm:p-8 bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-amber-500 p-3 rounded-lg">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Quick Tips for Success</h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Review your listing before submission</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Use high-quality, well-lit photos</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Write clear, professional descriptions</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Set competitive, honest pricing</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Respond promptly to admin requests</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Keep your account in good standing</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Update listings regularly</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Consider Featured for faster results</span>
                </div>
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
            onClick={() => navigate("/guidelines/property-management")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Property Management
          </Button>
          
          <Button
            onClick={() => navigate("/guidelines/tenant-screening")}
            className="gap-2 bg-amber-500 hover:bg-amber-600"
          >
            Next: Tenant Screening
            <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default ListingBestPracticesGuideline;

