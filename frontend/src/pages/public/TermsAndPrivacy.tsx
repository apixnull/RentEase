import { useState, useEffect } from "react";
import { ArrowLeft, FileText, Shield, UserPlus, Megaphone, UserX, Ban, Scale, Lock, Eye, AlertCircle, CheckCircle2, Building2, MessageSquare, Gavel, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";

type SectionId = 
  | "avoid-rental-scams"
  | "account-creation"
  | "account-deletion"
  | "account-blocking"
  | "listings-advertising"
  | "privacy-data-collection"
  | "privacy-data-usage"
  | "privacy-data-rights"
  | "privacy-data-security"
  | "philippine-law"
  | "disputes-liability";

const TermsAndPrivacy = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<SectionId>("account-creation");

  const sections = [
    { id: "avoid-rental-scams" as SectionId, title: "Avoid Rental Scams", icon: AlertTriangle, color: "orange" },
    { id: "account-creation" as SectionId, title: "Account Creation", icon: UserPlus, color: "emerald" },
    { id: "account-deletion" as SectionId, title: "Account Deletion", icon: UserX, color: "red" },
    { id: "account-blocking" as SectionId, title: "Account Blocking", icon: Ban, color: "orange" },
    { id: "listings-advertising" as SectionId, title: "Listings & Advertising", icon: Megaphone, color: "blue" },
    { id: "privacy-data-collection" as SectionId, title: "Data Collection", icon: Eye, color: "sky" },
    { id: "privacy-data-usage" as SectionId, title: "Data Usage", icon: MessageSquare, color: "sky" },
    { id: "privacy-data-rights" as SectionId, title: "Your Data Rights", icon: Shield, color: "sky" },
    { id: "privacy-data-security" as SectionId, title: "Data Security", icon: Lock, color: "sky" },
    { id: "philippine-law" as SectionId, title: "Philippine Law", icon: Gavel, color: "purple" },
    { id: "disputes-liability" as SectionId, title: "Disputes & Liability", icon: Scale, color: "gray" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: SectionId) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      setActiveSection(id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Header with Back Button */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <motion.button
            onClick={() => navigate(-1)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors font-medium"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </motion.button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-500 to-sky-600">
        <div className="absolute inset-0 overflow-hidden z-0">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white/10"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 60 + 20}px`,
                height: `${Math.random() * 60 + 20}px`,
              }}
              animate={{
                y: [0, (Math.random() - 0.5) * 100, 0],
                x: [0, (Math.random() - 0.5) * 100, 0],
                rotate: [0, 360],
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: Math.random() * 15 + 15,
                repeat: Infinity,
                delay: Math.random() * 3,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <FileText className="w-5 h-5 text-white" />
              <span className="text-sm font-medium text-white">Legal Documents</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-white leading-tight">
              Terms & Privacy Policy
            </h1>

            <p className="text-xl md:text-2xl text-emerald-50 max-w-3xl mx-auto leading-relaxed">
              Your rights, responsibilities, and how we protect your data in accordance with Philippine law
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content with Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="sticky top-24">
              <Card className="p-4 bg-white border-2 border-gray-200 rounded-2xl shadow-lg">
                <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-emerald-600" />
                  Navigation
                </h3>
                <nav className="space-y-2">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    const isActive = activeSection === section.id;
                    const colorClasses: Record<string, { bg: string; border: string; text: string; icon: string }> = {
                      emerald: { bg: "bg-emerald-50", border: "border-emerald-500", text: "text-emerald-700", icon: "text-emerald-600" },
                      red: { bg: "bg-red-50", border: "border-red-500", text: "text-red-700", icon: "text-red-600" },
                      orange: { bg: "bg-orange-50", border: "border-orange-500", text: "text-orange-700", icon: "text-orange-600" },
                      blue: { bg: "bg-blue-50", border: "border-blue-500", text: "text-blue-700", icon: "text-blue-600" },
                      sky: { bg: "bg-sky-50", border: "border-sky-500", text: "text-sky-700", icon: "text-sky-600" },
                      purple: { bg: "bg-purple-50", border: "border-purple-500", text: "text-purple-700", icon: "text-purple-600" },
                      gray: { bg: "bg-gray-50", border: "border-gray-500", text: "text-gray-700", icon: "text-gray-600" },
                    };
                    const colors = colorClasses[section.color] || colorClasses.gray;
                    return (
                      <motion.button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        whileHover={{ x: 4 }}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
                          isActive
                            ? `${colors.bg} border-2 ${colors.border} ${colors.text} font-semibold`
                            : "text-gray-600 hover:bg-gray-50 border-2 border-transparent"
                        }`}
                      >
                        <Icon className={`h-4 w-4 ${isActive ? colors.icon : "text-gray-400"}`} />
                        <span className="text-sm">{section.title}</span>
                      </motion.button>
                    );
                  })}
                </nav>
              </Card>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 space-y-8">
            {/* Avoid Rental Scams */}
            <SectionCard
              id="avoid-rental-scams"
              title="How to Avoid Rental Scams"
              icon={AlertTriangle}
              color="orange"
            >
              <div className="space-y-6">
                <div className="p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
                  <AlertTriangle className="h-5 w-5 text-orange-600 mb-2" />
                  <p className="text-sm text-orange-800 font-semibold mb-2">
                    Protect yourself from rental scams. Follow these essential guidelines to ensure a safe rental experience.
                  </p>
                  <p className="text-sm text-orange-800">
                    If you encounter a suspicious listing or landlord, use our "Report" feature immediately. We take fraud reports seriously and will investigate promptly.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-emerald-600" />
                    1. Never Send Money Before Viewing
                  </h4>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    This is the #1 red flag of rental scams. Legitimate landlords will never ask for:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li><strong>Upfront deposits or payments</strong> before you've seen the property in person</li>
                    <li><strong>Wire transfers or gift cards</strong> as payment methods</li>
                    <li><strong>Payment through unverified third-party services</strong></li>
                    <li><strong>Rush payments</strong> with pressure to "pay now or lose the property"</li>
                  </ul>
                  <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-sm text-red-800 font-medium">
                      ⚠️ Legitimate Rule: Always view the property in person and sign a lease agreement before making any payments.
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-purple-600" />
                    2. Always Meet in Person and See the Unit Location First
                  </h4>
                  <div className="p-4 bg-purple-50 rounded-lg border-2 border-purple-200 mb-3">
                    <p className="text-sm text-purple-900 font-bold mb-2">
                      ⚠️ MOST IMPORTANT: Never commit to a rental without meeting the landlord in person and viewing the actual property location.
                    </p>
                    <p className="text-sm text-purple-800">
                      This is the #1 way to avoid scams. Legitimate landlords will always arrange in-person viewings at the property location.
                    </p>
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    Legitimate landlords will arrange property viewings. Be cautious of excuses for not meeting in person:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li><strong>Red flags:</strong> "I'm out of town," "I can't meet you," "Just send the deposit and I'll mail you the keys"</li>
                    <li><strong>Always insist on an in-person viewing at the property location</strong> before any commitment</li>
                    <li><strong>Visit during daylight hours</strong> to properly inspect the property and surrounding area</li>
                    <li><strong>Verify the address:</strong> Make sure you're viewing the actual property listed, not a different location</li>
                    <li><strong>Check the property condition:</strong> Ensure it matches the listing description and photos</li>
                    <li><strong>Inspect the neighborhood:</strong> See the area, check for safety, accessibility, and nearby amenities</li>
                    <li><strong>Bring a friend or family member</strong> for safety and a second opinion</li>
                    <li><strong>Take photos during the visit</strong> to document what you saw</li>
                  </ul>
                  <div className="mt-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <p className="text-sm text-emerald-800 font-medium">
                      ✅ Legitimate landlords will: Meet you at the property, show you around, answer questions, and allow you to inspect before any payment.
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    3. Watch for Suspicious Pricing and Pressure Tactics
                  </h4>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    Scammers often use these tactics to lure victims:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li><strong>Too good to be true:</strong> Prices significantly below market rate for the area</li>
                    <li><strong>Urgency pressure:</strong> "Pay now or someone else will take it," "Limited time offer"</li>
                    <li><strong>Emotional manipulation:</strong> Stories about personal emergencies or urgent situations</li>
                    <li><strong>Vague or incomplete information:</strong> Unwillingness to provide details or answer questions</li>
                    <li><strong>Inconsistent communication:</strong> Different contact methods, phone numbers, or email addresses</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
                    <Lock className="h-5 w-5 text-red-600" />
                    4. Protect Your Personal and Financial Information
                  </h4>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    Never share sensitive information unless you've verified the landlord and property:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li><strong>Never share:</strong> Bank account numbers, credit card details, or passwords</li>
                    <li><strong>Be cautious with:</strong> Social Security numbers, TIN, or other government IDs (only share when necessary and verified)</li>
                    <li><strong>Don't send money</strong> to unverified accounts or individuals</li>
                    <li><strong>Verify bank accounts:</strong> Cross-check account details with the landlord's verified identity</li>
                    <li><strong>Use secure communication:</strong> Prefer in-app messaging or verified contact methods</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
                    <Eye className="h-5 w-5 text-indigo-600" />
                    5. Research the Landlord and Property
                  </h4>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    Do your due diligence before committing:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li><strong>Search online:</strong> Google the landlord's name, property address, and phone number</li>
                    <li><strong>Check reviews:</strong> Look for reviews or complaints about the landlord or property</li>
                    <li><strong>Verify property ownership:</strong> Check with local government offices if possible</li>
                    <li><strong>Ask for references:</strong> Request contact information of previous tenants</li>
                    <li><strong>Visit the neighborhood:</strong> Check the area, talk to neighbors if possible</li>
                    <li><strong>Trust your instincts:</strong> If something feels off, it probably is</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    6. Get Everything in Writing
                  </h4>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    Legitimate rentals involve proper documentation:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li><strong>Lease agreement:</strong> Always sign a written lease agreement before paying</li>
                    <li><strong>Read carefully:</strong> Review all terms, conditions, and fees before signing</li>
                    <li><strong>Get copies:</strong> Ensure you receive copies of all signed documents</li>
                    <li><strong>Payment receipts:</strong> Get receipts for all payments (deposits, rent, fees)</li>
                    <li><strong>Property condition report:</strong> Document the property's condition with photos</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    7. Common Scam Patterns to Avoid
                  </h4>
                  <div className="space-y-3">
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <h5 className="font-semibold text-red-900 mb-2">The "Out of Town" Scam</h5>
                      <p className="text-sm text-red-800">
                        Landlord claims to be out of town and asks for payment before you can view the property. 
                        They promise to mail keys or arrange access after payment.
                      </p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <h5 className="font-semibold text-red-900 mb-2">The "Too Good to Be True" Scam</h5>
                      <p className="text-sm text-red-800">
                        Property is listed at an unrealistically low price. Scammer creates urgency to pressure 
                        you into quick payment without proper verification.
                      </p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <h5 className="font-semibold text-red-900 mb-2">The "Fake Property" Scam</h5>
                      <p className="text-sm text-red-800">
                        Scammer uses photos and details from a real property (often from another listing) but 
                        doesn't actually own or have access to it.
                      </p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <h5 className="font-semibold text-red-900 mb-2">The "Identity Theft" Scam</h5>
                      <p className="text-sm text-red-800">
                        Scammer poses as a legitimate landlord or property manager, using stolen identity or 
                        fake credentials to gain your trust.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-emerald-600" />
                    8. What to Do If You Suspect a Scam
                  </h4>
                  <div className="space-y-3">
                    <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                      <h5 className="font-semibold text-emerald-900 mb-2">Immediate Actions:</h5>
                      <ul className="list-disc list-inside space-y-1 text-sm text-emerald-800 ml-4">
                        <li><strong>Stop all communication</strong> with the suspicious party</li>
                        <li><strong>Do NOT send any money</strong> or personal information</li>
                        <li><strong>Report to RentEase:</strong> Use the "Report" button on the listing page</li>
                        <li><strong>Document everything:</strong> Save screenshots, messages, and any evidence</li>
                        <li><strong>Report to authorities:</strong> Contact local police or cybercrime units if you've been victimized</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h5 className="font-semibold text-blue-900 mb-2">How RentEase Helps:</h5>
                      <ul className="list-disc list-inside space-y-1 text-sm text-blue-800 ml-4">
                        <li>AI-powered content moderation detects scamming patterns</li>
                        <li>Fraud report system for users to report suspicious listings</li>
                        <li>Admin review process for flagged listings</li>
                        <li>Account blocking for confirmed fraudulent activities</li>
                        <li>Community protection through user reporting</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-br from-emerald-50 to-sky-50 rounded-xl border-2 border-emerald-200">
                  <h4 className="font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    Remember: Trust Your Instincts
                  </h4>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    If something feels off, it probably is. Legitimate landlords will:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Allow you to view the property in person</li>
                    <li>Provide proper identification and property documents</li>
                    <li>Answer your questions clearly and completely</li>
                    <li>Not pressure you into quick decisions</li>
                    <li>Use standard rental practices and documentation</li>
                    <li>Accept secure, traceable payment methods</li>
                  </ul>
                  <p className="text-gray-700 leading-relaxed mt-4 font-semibold">
                    When in doubt, walk away. There are always other rental options available.
                  </p>
                </div>
              </div>
            </SectionCard>

            {/* Account Creation */}
            <SectionCard
              id="account-creation"
              title="Account Creation Terms"
              icon={UserPlus}
              color="emerald"
            >
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-3">1. Eligibility Requirements</h4>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    To create an account on RentEase, you must:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Be at least 18 years of age (in accordance with Republic Act No. 7610)</li>
                    <li>Provide accurate, complete, and current information</li>
                    <li>Have the legal capacity to enter into binding agreements</li>
                    <li>Not have been previously banned or suspended from RentEase</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-3">2. Account Information</h4>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    When creating an account, you agree to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Provide truthful and accurate personal information</li>
                    <li>Maintain and update your information to keep it current</li>
                    <li>Use only one account per person (multiple accounts are prohibited)</li>
                    <li>Keep your account credentials secure and confidential</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-3">3. Account Types</h4>
                  <div className="space-y-3">
                    <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                      <h5 className="font-semibold text-emerald-900 mb-2">Tenant Account</h5>
                      <p className="text-sm text-emerald-800">
                        Free account for browsing properties, communicating with landlords, and managing your rental needs.
                      </p>
                    </div>
                    <div className="p-4 bg-sky-50 rounded-lg border border-sky-200">
                      <h5 className="font-semibold text-sky-900 mb-2">Landlord Account</h5>
                      <p className="text-sm text-sky-800">
                        Account for property owners to list properties, manage units, and communicate with tenants.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-3">4. Account Verification</h4>
                  <p className="text-gray-700 leading-relaxed">
                    We may require email verification or additional documentation to verify your identity, 
                    especially for landlord accounts. This helps ensure platform security and compliance with 
                    Philippine regulations.
                  </p>
                </div>
              </div>
            </SectionCard>

            {/* Account Deletion */}
            <SectionCard
              id="account-deletion"
              title="Account Deletion - What Happens?"
              icon={UserX}
              color="red"
            >
              <div className="space-y-6">
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <AlertCircle className="h-5 w-5 text-red-600 mb-2" />
                  <p className="text-sm text-red-800 font-medium">
                    Account deletion is permanent and cannot be undone. Please read this section carefully.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-3">What Gets Deleted:</h4>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Your personal account information (name, email, phone number)</li>
                    <li>Your account profile and settings</li>
                    <li>All your messages and communications</li>
                    <li>Your saved searches and preferences</li>
                    <li>Access to your account and all associated data</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-3">What Gets Retained:</h4>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>
                      <strong>Advertisement Data:</strong> Property listing information, descriptions, photos, 
                      and other advertisement content may be retained for a period as required by law or for 
                      dispute resolution purposes.
                    </li>
                    <li>
                      <strong>Legal Records:</strong> Information related to ongoing disputes, legal proceedings, 
                      or fraud reports may be retained as required by law.
                    </li>
                    <li>
                      <strong>Anonymized Data:</strong> We may retain anonymized, aggregated data that cannot 
                      identify you personally for analytics and service improvement.
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-3">What Does NOT Get Retained:</h4>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>
                      <strong>Transaction & Financial Records:</strong> Our transaction and financial tools are 
                      designed for landlords to manage their own record keeping. These records are NOT tied to 
                      our system. When you delete a property or account, all transaction and financial data 
                      associated with that property will be permanently deleted and NOT retained by RentEase.
                    </li>
                    <li>
                      <strong>Payment Tracking Data:</strong> We are NOT involved in payment processing between 
                      landlords and tenants. Any payment tracking data you may have entered is for your own 
                      record-keeping purposes only and will be deleted with your account.
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-3">Active Obligations:</h4>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    Before deleting your account, you must:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Complete or cancel any active lease agreements</li>
                    <li>Resolve any pending disputes or issues</li>
                    <li>Settle any outstanding payments or fees</li>
                    <li>Remove or transfer any active property listings</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-3">How to Delete Your Account:</h4>
                  <p className="text-gray-700 leading-relaxed">
                    You can request account deletion through your account settings or by contacting our support team. 
                    The deletion process may take up to 30 days to complete, during which your account will be 
                    deactivated but not fully deleted.
                  </p>
                </div>
              </div>
            </SectionCard>

            {/* Account Blocking */}
            <SectionCard
              id="account-blocking"
              title="Account Blocking - What Happens?"
              icon={Ban}
              color="orange"
            >
              <div className="space-y-6">
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <AlertCircle className="h-5 w-5 text-orange-600 mb-2" />
                  <p className="text-sm text-orange-800 font-medium">
                    Account blocking is a serious action taken to protect our community and maintain platform integrity.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-3">Reasons for Account Blocking:</h4>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Violation of our Terms of Service or Community Guidelines</li>
                    <li>Fraudulent activities or misrepresentation</li>
                    <li>Harassment, abuse, or threatening behavior towards other users</li>
                    <li>Posting false, misleading, or illegal property listings</li>
                    <li>Spam, phishing, or other malicious activities</li>
                    <li>Multiple violations or repeated offenses</li>
                    <li>Legal requirements or court orders</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-3">What Happens When Your Account is Blocked:</h4>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>
                      <strong>Immediate Access Loss:</strong> You will immediately lose access to your account and 
                      all platform features.
                    </li>
                    <li>
                      <strong>Listing Removal:</strong> All your active property listings will be removed from 
                      public view.
                    </li>
                    <li>
                      <strong>Communication Suspension:</strong> You will not be able to send or receive messages 
                      with other users.
                    </li>
                    <li>
                      <strong>Data Retention:</strong> Your account data will be retained for investigation, 
                      legal compliance, and dispute resolution purposes.
                    </li>
                    <li>
                      <strong>Appeal Process:</strong> You may appeal the blocking decision by contacting our 
                      support team with relevant evidence or explanations.
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-3">Temporary vs. Permanent Blocks:</h4>
                  <div className="space-y-3">
                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <h5 className="font-semibold text-yellow-900 mb-2">Temporary Block</h5>
                      <p className="text-sm text-yellow-800">
                        Usually lasts 7-30 days for minor violations. Your account may be restored after the 
                        suspension period if you agree to comply with our terms.
                      </p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <h5 className="font-semibold text-red-900 mb-2">Permanent Block - No Remedies</h5>
                      <p className="text-sm text-red-800 mb-2">
                        <strong>Fraudulent Accounts:</strong> If your account is blocked due to fraudulent activities, 
                        the block is PERMANENT with NO REMEDIES. You will not be able to appeal or restore a 
                        fraudulently blocked account.
                      </p>
                      <p className="text-sm text-red-800">
                        Permanent blocks also include a ban on creating new accounts using the same email address 
                        or any associated information.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-3">Email Account Restrictions:</h4>
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <AlertCircle className="h-5 w-5 text-red-600 mb-2" />
                    <p className="text-sm text-red-800 font-medium mb-2">
                      If an account registered with a Gmail (or any email) address is deleted, that email address 
                      CANNOT be used to register a new account again. This restriction is permanent and cannot be 
                      reversed.
                    </p>
                    <p className="text-sm text-red-800">
                      This policy helps prevent abuse and ensures platform integrity. If you need to create a new 
                      account, you must use a different email address.
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-3">Appeal Process:</h4>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    You may appeal a blocking decision ONLY if it was NOT due to fraudulent activities. Appeals for 
                    non-fraudulent blocks can be submitted by contacting our support team with relevant evidence or 
                    explanations. We will provide a response within 7-14 business days.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    <strong>Note:</strong> Fraudulent account blocks are final and cannot be appealed.
                  </p>
                </div>
              </div>
            </SectionCard>

            {/* Listings & Advertising */}
            <SectionCard
              id="listings-advertising"
              title="Listings & Advertising Guidelines"
              icon={Megaphone}
              color="blue"
            >
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-3">1. Listing Requirements</h4>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    All property listings must comply with the following:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Accurate and truthful property descriptions</li>
                    <li>Real, current photos of the actual property</li>
                    <li>Honest pricing information (no hidden fees)</li>
                    <li>Complete property details (location, size, amenities, etc.)</li>
                    <li>Compliance with local zoning and building codes in Cebu Province</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-3">2. Prohibited Listings & Content</h4>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    Listings will be immediately blocked and removed if they contain:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Properties that do not exist or are not available for rent</li>
                    <li>Content that violates local laws or regulations</li>
                    <li>Properties used for illegal activities (gambling, prostitution, etc.)</li>
                    <li><strong>Discriminatory Information:</strong> Any content that discriminates against protected classes 
                      (violates Republic Act No. 7279 - Urban Development and Housing Act)</li>
                    <li><strong>Explicit Content:</strong> Inappropriate, explicit, or offensive images or content used as 
                      property pictures</li>
                    <li><strong>Scamming Patterns:</strong> Any attempt to request upfront payments through online methods 
                      before meeting or viewing the property. Our AI content moderation system automatically detects and 
                      blocks such patterns.</li>
                    <li>False, misleading, or deceptive information</li>
                    <li>Infringement on intellectual property rights</li>
                    <li>Other misconduct patterns that violate our community standards</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-3">3. AI Content Moderation</h4>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <AlertCircle className="h-5 w-5 text-blue-600 mb-2" />
                    <p className="text-sm text-blue-800 font-medium mb-2">
                      Our platform uses AI-powered content moderation to automatically detect and block prohibited content.
                    </p>
                    <p className="text-sm text-blue-800 mb-2">
                      <strong>Scamming Pattern Detection:</strong> Our AI system automatically detects and blocks listings 
                      that contain scamming patterns, including but not limited to:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-blue-800 ml-4">
                      <li>Requests for upfront online payments before property viewing</li>
                      <li>Suspicious payment requests or methods</li>
                      <li>Phishing attempts or fraudulent contact information</li>
                      <li>Other patterns indicative of fraudulent activity</li>
                    </ul>
                    <p className="text-sm text-blue-800 mt-2">
                      Listings detected with scamming patterns will be immediately blocked from advertising on our platform.
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-3">4. Listing Blocking Consequences</h4>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    If a unit listing is blocked from advertising due to policy violations:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>The listing will be immediately removed from public view</li>
                    <li>You will be notified of the specific violation</li>
                    <li>Repeated violations may result in account suspension or termination</li>
                    <li>Blocked listings cannot be republished without addressing the violation</li>
                    <li>Fraudulent listings may result in permanent account blocking</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-3">5. Advertising Standards</h4>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    All advertisements must:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Comply with the Philippine Advertising Standards (DTI guidelines)</li>
                    <li>Not contain false or misleading claims</li>
                    <li>Respect fair competition principles</li>
                    <li>Not target vulnerable populations unfairly</li>
                    <li>Include all relevant terms and conditions clearly</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-3">6. Listing Fees and Payments</h4>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    For premium listings or featured placements:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>All fees will be clearly disclosed before payment</li>
                    <li>Payments are processed securely in accordance with Bangko Sentral ng Pilipinas (BSP) regulations</li>
                    <li>Refunds are subject to our refund policy and applicable laws</li>
                    <li>Official receipts will be provided as required by the Bureau of Internal Revenue (BIR)</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-3">7. Listing Moderation</h4>
                  <p className="text-gray-700 leading-relaxed">
                    We reserve the right to review, edit, or remove any listing that violates our guidelines. 
                    Listings may be temporarily hidden during review. Repeated violations may result in account 
                    suspension or termination.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-3">8. Listing Lifecycle & Status</h4>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Every listing goes through different stages in its lifecycle. Understanding these statuses helps 
                    you manage your listings effectively.
                  </p>

                  <div className="space-y-4 mb-6">
                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <h5 className="font-semibold text-yellow-900">WAITING_REVIEW</h5>
                      </div>
                      <p className="text-sm text-yellow-800">
                        Payment complete, waiting for admin review. Your listing is in the queue and will be reviewed 
                        by our team to ensure it meets our guidelines.
                      </p>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <h5 className="font-semibold text-green-900">VISIBLE</h5>
                      </div>
                      <p className="text-sm text-green-800">
                        Publicly visible and active. Your listing has passed review and is now live on the platform, 
                        visible to all tenants browsing for properties.
                      </p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                        <h5 className="font-semibold text-gray-900">HIDDEN</h5>
                      </div>
                      <p className="text-sm text-gray-800">
                        Temporarily hidden by landlord. You can hide your listing at any time (e.g., when the unit is 
                        temporarily unavailable). You can make it visible again when ready.
                      </p>
                    </div>

                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <h5 className="font-semibold text-orange-900">EXPIRED</h5>
                      </div>
                      <p className="text-sm text-orange-800">
                        Listing duration has ended. Your listing's advertising period has expired. You can renew or 
                        extend the listing to make it visible again.
                      </p>
                    </div>

                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <h5 className="font-semibold text-red-900">FLAGGED</h5>
                      </div>
                      <p className="text-sm text-red-800">
                        Found suspicious and will be hidden. Our AI content moderation or admin review has detected 
                        potential issues. The listing is temporarily hidden pending further review. You will be notified 
                        of the specific concerns.
                      </p>
                    </div>

                    <div className="p-4 bg-red-100 rounded-lg border-2 border-red-300">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                        <h5 className="font-semibold text-red-900">BLOCKED</h5>
                      </div>
                      <p className="text-sm text-red-900 font-medium">
                        Fully removed or deactivated due to violations. Your listing has been permanently blocked 
                        due to serious policy violations. Blocked listings cannot be restored and may result in account 
                        penalties.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h5 className="font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        How to Get Your Listing Approved (VISIBLE Status)
                      </h5>
                      <p className="text-gray-700 leading-relaxed mb-3">
                        Follow these guidelines to ensure your listing quickly passes review and becomes visible:
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                        <li><strong>Complete Information:</strong> Provide all required fields accurately - property address, 
                          size, amenities, pricing, and contact information</li>
                        <li><strong>Real Photos:</strong> Upload clear, current photos of the actual property (interior and exterior). 
                          Avoid stock photos or images from other sources</li>
                        <li><strong>Accurate Description:</strong> Write honest, detailed descriptions that match the property. 
                          Include all relevant information tenants need to know</li>
                        <li><strong>Fair Pricing:</strong> List realistic rental prices with no hidden fees. Be transparent about 
                          all costs upfront</li>
                        <li><strong>Valid Contact Information:</strong> Provide working phone numbers and email addresses that 
                          you actively monitor</li>
                        <li><strong>Compliance:</strong> Ensure your listing complies with local Cebu Province regulations and 
                          building codes</li>
                        <li><strong>No Prohibited Content:</strong> Avoid any scamming patterns, discriminatory language, explicit 
                          content, or misleading information</li>
                        <li><strong>Professional Presentation:</strong> Well-organized listings with proper formatting and 
                          clear information are reviewed faster</li>
                      </ul>
                    </div>

                    <div>
                      <h5 className="font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        How to Avoid Getting FLAGGED or BLOCKED
                      </h5>
                      <p className="text-gray-700 leading-relaxed mb-3">
                        To prevent your listing from being flagged or blocked, strictly avoid:
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                        <li><strong>Scamming Patterns:</strong> NEVER request upfront online payments before property viewing. 
                          Our AI automatically detects and blocks such requests. Always meet tenants in person first.</li>
                        <li><strong>Discriminatory Information:</strong> Do not include any language that discriminates based on 
                          race, religion, gender, age, disability, or other protected characteristics</li>
                        <li><strong>Explicit Content:</strong> Do not use inappropriate, explicit, or offensive images as property 
                          pictures. Use only property-related photos</li>
                        <li><strong>False Information:</strong> Do not misrepresent the property - location, size, amenities, or 
                          availability. All information must be accurate and truthful</li>
                        <li><strong>Fake Listings:</strong> Do not create listings for properties that don't exist or aren't 
                          available for rent</li>
                        <li><strong>Duplicate Listings:</strong> Do not create multiple listings for the same property</li>
                        <li><strong>Suspicious Contact Methods:</strong> Avoid using suspicious email addresses, phone numbers, 
                          or payment methods that trigger fraud detection</li>
                        <li><strong>Illegal Activities:</strong> Do not list properties intended for illegal activities</li>
                        <li><strong>Misleading Pricing:</strong> Do not hide fees or use deceptive pricing strategies</li>
                        <li><strong>Copyright Violations:</strong> Do not use copyrighted images or content without permission</li>
                      </ul>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h5 className="font-semibold text-blue-900 mb-2">Best Practices for Quick Approval</h5>
                      <ul className="list-disc list-inside space-y-1 text-sm text-blue-800 ml-4">
                        <li>Review your listing before submission to ensure all information is complete and accurate</li>
                        <li>Use high-quality, well-lit photos that clearly show the property</li>
                        <li>Write clear, professional descriptions without promotional language that sounds like spam</li>
                        <li>Respond promptly to any admin requests for additional information</li>
                        <li>Keep your account in good standing with no previous violations</li>
                        <li>Update your listing regularly to keep information current</li>
                      </ul>
                    </div>

                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <AlertCircle className="h-5 w-5 text-amber-600 mb-2" />
                      <p className="text-sm text-amber-800 font-medium mb-2">
                        <strong>Important:</strong> If your listing is FLAGGED, you will receive a notification explaining 
                        the concern. Address the issue promptly and contact support if you need clarification. Repeated 
                        flagging may lead to BLOCKED status.
                      </p>
                      <p className="text-sm text-amber-800">
                        If your listing is BLOCKED, it cannot be restored. Serious violations may also result in account 
                        suspension or termination.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Privacy - Data Collection */}
            <SectionCard
              id="privacy-data-collection"
              title="Data Collection & Privacy"
              icon={Eye}
              color="sky"
            >
              <div className="space-y-6">
                <div className="p-4 bg-sky-50 rounded-lg border border-sky-200">
                  <Shield className="h-5 w-5 text-sky-600 mb-2" />
                  <p className="text-sm text-sky-800 font-medium mb-2">
                    In compliance with the <strong>Data Privacy Act of 2012 (Republic Act No. 10173)</strong>, 
                    we are committed to protecting your personal information.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-3">1. Information We Collect</h4>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    We collect the following types of personal information:
                  </p>
                  
                  <div className="space-y-3">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h5 className="font-semibold text-gray-900 mb-2">Account Information</h5>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-4">
                        <li>Name, email address, phone number</li>
                        <li>Profile information and preferences</li>
                        <li>Account credentials (encrypted)</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h5 className="font-semibold text-gray-900 mb-2">Property Information (Landlords)</h5>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-4">
                        <li>Property addresses and details</li>
                        <li>Unit specifications and amenities</li>
                        <li>Property photos and documents</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h5 className="font-semibold text-gray-900 mb-2">Transaction Data</h5>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-4">
                        <li>Payment records and history</li>
                        <li>Lease agreements and documents</li>
                        <li>Financial transactions (as required by BIR)</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h5 className="font-semibold text-gray-900 mb-2">Communication Data</h5>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-4">
                        <li>Messages between landlords and tenants</li>
                        <li>Support tickets and inquiries</li>
                        <li>Feedback and reviews</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h5 className="font-semibold text-gray-900 mb-2">Usage Data</h5>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-4">
                        <li>Platform interaction and activity</li>
                        <li>Device information and IP addresses</li>
                        <li>Cookies and tracking technologies</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-3">2. Legal Basis for Collection</h4>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    Under the Data Privacy Act, we collect your information based on:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li><strong>Consent:</strong> You provide explicit consent when creating an account</li>
                    <li><strong>Contractual Necessity:</strong> Information needed to provide our services</li>
                    <li><strong>Legal Obligation:</strong> Compliance with Philippine tax and regulatory requirements</li>
                    <li><strong>Legitimate Interest:</strong> Platform security, fraud prevention, and service improvement</li>
                  </ul>
                </div>
              </div>
            </SectionCard>

            {/* Privacy - Data Usage */}
            <SectionCard
              id="privacy-data-usage"
              title="How We Use Your Data"
              icon={MessageSquare}
              color="sky"
            >
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-3">1. Primary Uses</h4>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Provide, maintain, and improve our rental platform services</li>
                    <li>Process transactions and facilitate communications between users</li>
                    <li>Send important notifications, updates, and support messages</li>
                    <li>Verify user identity and prevent fraud</li>
                    <li>Comply with legal obligations (BIR, SEC, DTI requirements)</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-3">2. Service Enhancement</h4>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Analyze usage patterns to improve user experience</li>
                    <li>Develop new features and services</li>
                    <li>Personalize content and recommendations</li>
                    <li>Conduct research and analytics (using anonymized data)</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-3">3. Communication</h4>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    We may use your contact information to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Send service-related communications (required)</li>
                    <li>Send marketing communications (with your consent, opt-out available)</li>
                    <li>Respond to your inquiries and support requests</li>
                    <li>Notify you of important policy changes</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-3">4. Data Sharing</h4>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    We do not sell your personal information. We may share data only in these circumstances:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li><strong>With Your Consent:</strong> When you explicitly authorize sharing</li>
                    <li><strong>Service Providers:</strong> Trusted third parties who assist in platform operations (under strict confidentiality agreements)</li>
                    <li><strong>Legal Requirements:</strong> When required by Philippine courts, government agencies, or law enforcement</li>
                    <li><strong>Business Transfers:</strong> In case of merger, acquisition, or sale (with user notification)</li>
                    <li><strong>Safety & Security:</strong> To protect rights, property, or safety of users and the platform</li>
                  </ul>
                </div>
              </div>
            </SectionCard>

            {/* Privacy - Data Rights */}
            <SectionCard
              id="privacy-data-rights"
              title="Your Data Rights (Data Privacy Act)"
              icon={Shield}
              color="sky"
            >
              <div className="space-y-6">
                <div className="p-4 bg-sky-50 rounded-lg border border-sky-200">
                  <Gavel className="h-5 w-5 text-sky-600 mb-2" />
                  <p className="text-sm text-sky-800 font-medium">
                    Under <strong>Republic Act No. 10173 (Data Privacy Act of 2012)</strong>, you have the following rights:
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-3">1. Right to be Informed</h4>
                  <p className="text-gray-700 leading-relaxed">
                    You have the right to be informed about the collection, processing, and sharing of your personal data. 
                    This Privacy Policy serves as our notice to you.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-3">2. Right to Access</h4>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    You can request access to your personal data, including:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>What personal information we hold about you</li>
                    <li>How your data is being used or processed</li>
                    <li>Who has access to your information</li>
                    <li>Copies of your personal data in a structured format</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-3">3. Right to Object</h4>
                  <p className="text-gray-700 leading-relaxed">
                    You can object to the processing of your personal data, especially for direct marketing purposes. 
                    You can opt-out of marketing communications at any time.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-3">4. Right to Erasure (Right to be Forgotten)</h4>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    You can request deletion of your personal data, subject to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Legal retention requirements (e.g., BIR tax records)</li>
                    <li>Ongoing legal proceedings or disputes</li>
                    <li>Legitimate business interests (fraud prevention, security)</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-3">5. Right to Data Portability</h4>
                  <p className="text-gray-700 leading-relaxed">
                    You can request your data in a machine-readable format to transfer to another service provider.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-3">6. Right to Rectification</h4>
                  <p className="text-gray-700 leading-relaxed">
                    You can request correction of inaccurate or incomplete personal information. We will update your 
                    data within 30 days of your request.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-3">7. Right to File a Complaint</h4>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    If you believe your data privacy rights have been violated, you can file a complaint with:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li><strong>RentEase Support:</strong> support@rentease.com</li>
                    <li><strong>National Privacy Commission (NPC):</strong> https://privacy.gov.ph</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-3">How to Exercise Your Rights</h4>
                  <p className="text-gray-700 leading-relaxed">
                    To exercise any of these rights, contact us at support@rentease.com with your request. 
                    We will respond within 30 days as required by the Data Privacy Act. You may be asked to 
                    verify your identity before we process your request.
                  </p>
                </div>
              </div>
            </SectionCard>

            {/* Privacy - Data Security */}
            <SectionCard
              id="privacy-data-security"
              title="Data Security Measures"
              icon={Lock}
              color="sky"
            >
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-3">1. Technical Safeguards</h4>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Encryption of data in transit (SSL/TLS) and at rest</li>
                    <li>Secure authentication and access controls</li>
                    <li>Regular security audits and vulnerability assessments</li>
                    <li>Firewall and intrusion detection systems</li>
                    <li>Secure backup and disaster recovery procedures</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-3">2. Organizational Measures</h4>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Staff training on data privacy and security</li>
                    <li>Strict confidentiality agreements with employees</li>
                    <li>Limited access to personal data on a need-to-know basis</li>
                    <li>Regular review and update of security policies</li>
                    <li>Incident response procedures for data breaches</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-3">3. Data Breach Notification</h4>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    In compliance with the Data Privacy Act, in case of a data breach that may pose a risk to your 
                    rights and freedoms, we will:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Notify the National Privacy Commission within 72 hours</li>
                    <li>Notify affected users within 72 hours of discovery</li>
                    <li>Provide details of the breach and steps taken to address it</li>
                    <li>Offer guidance on protective measures you can take</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-3">4. Your Role in Security</h4>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    You also play a crucial role in protecting your data:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Use a strong, unique password for your account</li>
                    <li>Do not share your account credentials with others</li>
                    <li>Log out from shared or public devices</li>
                    <li>Report suspicious activities immediately</li>
                    <li>Keep your contact information updated</li>
                  </ul>
                </div>
              </div>
            </SectionCard>

            {/* Philippine Law */}
            <SectionCard
              id="philippine-law"
              title="Compliance with Philippine Laws"
              icon={Gavel}
              color="purple"
            >
              <div className="space-y-6">
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <Gavel className="h-5 w-5 text-purple-600 mb-2" />
                  <p className="text-sm text-purple-800 font-medium">
                    RentEase operates in compliance with all applicable Philippine laws and regulations.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-3">1. Data Privacy Act of 2012 (R.A. 10173)</h4>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    We comply with the Data Privacy Act, which protects individual personal information in information 
                    and communications systems. Key compliance measures include:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Registration with the National Privacy Commission (NPC)</li>
                    <li>Appointment of a Data Protection Officer (DPO)</li>
                    <li>Implementation of privacy policies and procedures</li>
                    <li>User consent and notification requirements</li>
                    <li>Data breach notification protocols</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-3">2. Consumer Act of the Philippines (R.A. 7394)</h4>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    We ensure fair and transparent business practices:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Accurate advertising and marketing</li>
                    <li>Clear disclosure of terms and conditions</li>
                    <li>Protection against deceptive practices</li>
                    <li>Fair dispute resolution mechanisms</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-3">3. Tax Compliance (National Internal Revenue Code)</h4>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    <strong>Important:</strong> Since RentEase does NOT process payments between landlords and tenants, 
                    we are NOT responsible for:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-3">
                    <li>Issuance of official receipts for rental transactions (this is the responsibility of landlords)</li>
                    <li>Tax reporting and remittance for rental income (landlords must comply with BIR requirements)</li>
                    <li>Withholding tax on rental payments (tenants and landlords must handle this directly)</li>
                  </ul>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    RentEase only issues receipts for our own platform fees (e.g., listing fees), if applicable. 
                    Landlords and tenants are solely responsible for their own tax compliance regarding rental transactions.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-3">4. Urban Development and Housing Act (R.A. 7279)</h4>
                  <p className="text-gray-700 leading-relaxed">
                    We support fair housing practices and do not tolerate discrimination based on race, religion, 
                    gender, age, disability, or other protected characteristics in property listings or tenant selection.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-3">5. Electronic Commerce Act (R.A. 8792)</h4>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    Our platform complies with e-commerce regulations:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Electronic transactions and signatures are recognized</li>
                    <li>Digital contracts and agreements are legally binding</li>
                    <li>Protection of electronic data and communications</li>
                    <li>Secure platform operations and data handling</li>
                  </ul>
                  <p className="text-gray-700 leading-relaxed mt-3">
                    <strong>Note:</strong> We do not process payments between users. All payment processing is handled 
                    directly between landlords and tenants outside of our platform.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-3">6. Local Government Regulations</h4>
                  <p className="text-gray-700 leading-relaxed">
                    Property listings must comply with Cebu Province and local government unit (LGU) regulations, 
                    including building codes, zoning ordinances, and business permit requirements.
                  </p>
                </div>
              </div>
            </SectionCard>

            {/* Disputes & Liability */}
            <SectionCard
              id="disputes-liability"
              title="Disputes, Liability & Resolution"
              icon={Scale}
              color="gray"
            >
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-3">1. Platform Role</h4>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    RentEase is a platform that connects landlords and tenants. We are not a party to rental 
                    agreements between users. We do not:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Guarantee the accuracy of property listings</li>
                    <li>Verify the identity or background of users (except basic checks)</li>
                    <li>Mediate or resolve disputes between landlords and tenants</li>
                    <li>Assume liability for rental agreements or transactions</li>
                    <li><strong>Process or facilitate payments:</strong> We are NOT involved in payment processing 
                      between landlords and tenants. Our financial tools are provided solely for landlords' 
                      record-keeping purposes and are not tied to our system.</li>
                    <li><strong>Track payments:</strong> We do NOT track or monitor payments between landlords 
                      and tenants. Any payment tracking features are for your own record-keeping only.</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-3">2. User Responsibilities</h4>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    Users are responsible for:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Verifying all information before entering into agreements</li>
                    <li>Conducting due diligence on properties and other users</li>
                    <li>Drafting and executing rental agreements independently</li>
                    <li>Processing all payments directly between parties (we are not involved)</li>
                    <li>Maintaining their own payment and transaction records</li>
                    <li>Resolving disputes directly or through legal channels</li>
                    <li>Complying with all applicable laws and regulations</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-3">3. Limitation of Liability</h4>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    To the maximum extent permitted by Philippine law, RentEase shall not be liable for:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Any indirect, incidental, or consequential damages</li>
                    <li>Loss of profits, data, or business opportunities</li>
                    <li>Disputes between landlords and tenants</li>
                    <li>Property condition or rental agreement issues</li>
                    <li>Third-party actions or services</li>
                  </ul>
                  <p className="text-gray-700 leading-relaxed mt-3">
                    Our total liability shall not exceed the amount you paid to us in the 12 months preceding the claim.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-3">4. Dispute Resolution</h4>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    In case of disputes:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>
                      <strong>User Disputes:</strong> Landlords and tenants should resolve disputes directly. 
                      We may provide communication tools but do not mediate.
                    </li>
                    <li>
                      <strong>Platform Disputes:</strong> Contact our support team first. We will attempt to 
                      resolve issues amicably.
                    </li>
                    <li>
                      <strong>Legal Action:</strong> If disputes cannot be resolved, parties may pursue legal 
                      remedies through Philippine courts.
                    </li>
                    <li>
                      <strong>Jurisdiction:</strong> All disputes shall be governed by Philippine law and 
                      subject to the exclusive jurisdiction of courts in Cebu Province.
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-3">5. Indemnification</h4>
                  <p className="text-gray-700 leading-relaxed">
                    You agree to indemnify and hold RentEase harmless from any claims, damages, losses, or expenses 
                    arising from your use of the platform, violation of these terms, or infringement of any rights 
                    of another party.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-3">6. Force Majeure</h4>
                  <p className="text-gray-700 leading-relaxed">
                    We shall not be liable for any failure to perform our obligations due to circumstances beyond 
                    our reasonable control, including natural disasters, pandemics, government actions, or 
                    technical failures.
                  </p>
                </div>
              </div>
            </SectionCard>

            {/* Footer CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center pt-8"
            >
              <Card className="p-8 bg-gradient-to-br from-emerald-50 to-sky-50 border-2 border-emerald-200 rounded-2xl">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Questions About Our Terms or Privacy Policy?
                </h3>
                <p className="text-gray-700 mb-6">
                  If you have any questions, concerns, or wish to exercise your data privacy rights, please contact us.
                </p>
                <div className="space-y-2 mb-6">
                  <p className="text-sm text-gray-600">
                    <strong>Email:</strong> support@rentease.com
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Data Protection Officer:</strong> dpo@rentease.com
                  </p>
                </div>
                <motion.button
                  onClick={() => navigate(-1)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-sky-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  Go Back
                </motion.button>
              </Card>
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
};

// Section Card Component
interface SectionCardProps {
  id: SectionId;
  title: string;
  icon: React.ElementType;
  color: string;
  children: React.ReactNode;
}

const SectionCard = ({ id, title, icon: Icon, color, children }: SectionCardProps) => {
  const colorClasses: Record<string, { border: string; borderBottom: string; bg: string }> = {
    emerald: { border: "border-emerald-100", borderBottom: "border-emerald-200", bg: "bg-emerald-600" },
    red: { border: "border-red-100", borderBottom: "border-red-200", bg: "bg-red-600" },
    orange: { border: "border-orange-100", borderBottom: "border-orange-200", bg: "bg-orange-600" },
    blue: { border: "border-blue-100", borderBottom: "border-blue-200", bg: "bg-blue-600" },
    sky: { border: "border-sky-100", borderBottom: "border-sky-200", bg: "bg-sky-600" },
    purple: { border: "border-purple-100", borderBottom: "border-purple-200", bg: "bg-purple-600" },
    gray: { border: "border-gray-100", borderBottom: "border-gray-200", bg: "bg-gray-600" },
  };
  const colors = colorClasses[color] || colorClasses.gray;
  
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="scroll-mt-24"
    >
      <Card className={`p-8 bg-white border-2 ${colors.border} rounded-2xl shadow-lg`}>
        <div className={`flex items-center gap-3 mb-8 pb-4 border-b-2 ${colors.borderBottom}`}>
          <div className={`${colors.bg} p-3 rounded-lg`}>
            <Icon className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{title}</h2>
        </div>
        {children}
      </Card>
    </motion.div>
  );
};

export default TermsAndPrivacy;
