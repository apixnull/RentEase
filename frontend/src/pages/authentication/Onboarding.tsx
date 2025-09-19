import { useEffect, useMemo, useRef, useState } from "react";
import { motion, type Variants, AnimatePresence } from "framer-motion";
import { 
  User, Calendar, Venus, Phone, MessageSquare, Facebook, MessageCircle,
  CheckCircle, ArrowRight, Award
} from "lucide-react";

type GenderOption = "Male" | "Female" | "Other" | "Prefer not to say";

const MAX_AVATAR_BYTES = 5 * 1024 * 1024; // 5 MB

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, when: "beforeChildren" },
  },
};

const Onboarding = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarError, setAvatarError] = useState<string>("");
  const [birthdate, setBirthdate] = useState<string>("");
  const [gender, setGender] = useState<GenderOption | "">("");
  const [bio, setBio] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [messengerUrl, setMessengerUrl] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [whatsappUrl, setWhatsappUrl] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const avatarPreviewUrl = useMemo(() => {
    if (!avatarFile) return "";
    return URL.createObjectURL(avatarFile);
  }, [avatarFile]);

  useEffect(() => {
    return () => {
      if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
    };
  }, [avatarPreviewUrl]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setAvatarError("");
    if (!file) {
      setAvatarFile(null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      setAvatarError("Please select an image file.");
      setAvatarFile(null);
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError("Image must be 5MB or smaller.");
      setAvatarFile(null);
      return;
    }
    setAvatarFile(file);
  };

  const normalizePhone = (raw: string) => {
    const digits = raw.replace(/[^\d+]/g, "");
    return digits.replace(/\s+/g, "");
  };

  const onPhoneChange = (v: string) => {
    const normalized = normalizePhone(v);
    setPhoneNumber(normalized);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (avatarError) return;
    
    if (step < 2) {
      setStep(2);
      return;
    }
    
    // Final submission
    console.log("Onboarding completed!", {
      firstName,
      middleName,
      lastName,
      birthdate,
      gender,
      bio,
      phoneNumber,
      messengerUrl,
      facebookUrl,
      whatsappUrl
    });
    
    // Redirect to dashboard
    window.location.href = "/";
  };

  const goToPreviousStep = () => {
    if (step > 1) {
      setStep(1);
    }
  };

  const getProgressPercentage = () => (step / 2) * 100;
  const progressPercentage = getProgressPercentage();
  const progressColor = "from-emerald-500 to-teal-600";
  const bgColor = step === 1 ? "from-emerald-50 to-teal-50" : "from-blue-50 to-cyan-50";

  return (
    <div className={`min-h-screen bg-gradient-to-br ${bgColor} relative overflow-hidden`}>
      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-br from-white/30 to-white/10"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 60 + 30}px`,
              height: `${Math.random() * 60 + 30}px`,
              filter: "blur(1px)",
            }}
            animate={{
              y: [0, (Math.random() - 0.5) * 80, 0],
              x: [0, (Math.random() - 0.5) * 80, 0],
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{ 
              duration: Math.random() * 15 + 20, 
              repeat: Infinity,
              delay: Math.random() * 8
            }}
          />
        ))}
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header Section */}
        <motion.div 
          className="px-6 pt-8 pb-6 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
                    <motion.h1 
            className="text-3xl font-bold text-gray-600 mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            User OnBoarding
          </motion.h1>
          {/* Progress Bar */}
          <div className="flex justify-center mb-8">
            <div className="w-full max-w-xs">
              {/* Progress Text */}
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Profile</span>
                <span>Contact Info</span>
              </div>
              
              {/* Progress Bar Container */}
              <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div 
                  className={`absolute top-0 left-0 h-full bg-gradient-to-r ${progressColor}`}
                  initial={{ width: "0%" }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              
              {/* Step Indicators */}
              <div className="flex justify-between mt-2">
                <motion.div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    step >= 1 
                      ? `bg-gradient-to-r ${progressColor} text-white` 
                      : 'bg-gray-300 text-gray-600'
                  }`}
                  animate={{
                    scale: step === 1 ? [1, 1.2, 1] : 1,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  1
                </motion.div>
                <motion.div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    step >= 2 
                      ? `bg-gradient-to-r ${progressColor} text-white` 
                      : 'bg-gray-300 text-gray-600'
                  }`}
                  animate={{
                    scale: step === 2 ? [1, 1.2, 1] : 1,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  2
                </motion.div>
              </div>
            </div>
          </div>
          

          


        </motion.div>

        {/* Form Content */}
        <motion.div 
          className="flex-1 px-6 pb-8"
          variants={containerVariants} 
          initial="hidden" 
          animate="visible"
        >
          <div className="max-w-2xl mx-auto">
            <motion.div 
              className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <form onSubmit={onSubmit}>
                <AnimatePresence mode="wait">
                  {step === 1 && <ProfileStep 
                    firstName={firstName} setFirstName={setFirstName}
                    middleName={middleName} setMiddleName={setMiddleName}
                    lastName={lastName} setLastName={setLastName}
                    avatarError={avatarError}
                    birthdate={birthdate} setBirthdate={setBirthdate}
                    gender={gender} setGender={setGender}
                    bio={bio} setBio={setBio}
                    fileInputRef={fileInputRef}
                    handleAvatarChange={handleAvatarChange}
                    avatarPreviewUrl={avatarPreviewUrl}
                  />}
                  {step === 2 && <ContactStep 
                    phoneNumber={phoneNumber} onPhoneChange={onPhoneChange}
                    messengerUrl={messengerUrl} setMessengerUrl={setMessengerUrl}
                    facebookUrl={facebookUrl} setFacebookUrl={setFacebookUrl}
                    whatsappUrl={whatsappUrl} setWhatsappUrl={setWhatsappUrl}
                  />}
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                  <motion.button 
                    type="button" 
                    onClick={goToPreviousStep}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      step === 1 
                        ? "text-gray-300 cursor-not-allowed" 
                        : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                    }`}
                    disabled={step === 1}
                    whileHover={step > 1 ? { x: -2 } : {}}
                  >
                    <ArrowRight className="h-4 w-4 rotate-180" />
                    Previous
                  </motion.button>

                  <motion.button 
                    type="submit" 
                    whileHover={{ scale: 1.02 }} 
                    whileTap={{ scale: 0.98 }}
                    className={`bg-gradient-to-r ${progressColor} text-white py-3 px-8 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl flex items-center gap-2`}
                  >
                    {step === 2 ? "Complete Journey" : "Continue"}
                    {step < 2 && <ArrowRight className="h-4 w-4" />}
                    {step === 2 && <CheckCircle className="h-4 w-4" />}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Step Components (unchanged from your original code)
const ProfileStep = ({ 
  firstName, setFirstName, middleName, setMiddleName, lastName, setLastName,
  avatarError, birthdate, setBirthdate,
  gender, setGender, bio, setBio, fileInputRef, handleAvatarChange, avatarPreviewUrl
}: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.5 }}
    className="space-y-6"
  >
    {/* Avatar Section */}
    <div className="text-center mb-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-3xl mb-4 shadow-lg"
      >
        {avatarPreviewUrl ? (
          <img src={avatarPreviewUrl} alt="Avatar preview" className="w-20 h-20 rounded-2xl object-cover" />
        ) : (
          <User className="h-12 w-12 text-emerald-600" />
        )}
      </motion.div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Profile Picture</h3>
      <p className="text-gray-600 text-sm mb-4">Add a photo to help others recognize you</p>
      <input 
        ref={fileInputRef} 
        type="file" 
        accept="image/*" 
        onChange={handleAvatarChange} 
        className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition-all" 
      />
      {avatarError && <p className="text-red-600 text-xs mt-2">{avatarError}</p>}
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">First name</label>
        <input 
          type="text" 
          value={firstName} 
          onChange={(e) => setFirstName(e.target.value)} 
          placeholder="e.g. John" 
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm shadow-sm transition-all" 
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Middle name</label>
        <input 
          type="text" 
          value={middleName} 
          onChange={(e) => setMiddleName(e.target.value)} 
          placeholder="Optional" 
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm shadow-sm transition-all" 
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Last name</label>
        <input 
          type="text" 
          value={lastName} 
          onChange={(e) => setLastName(e.target.value)} 
          placeholder="e.g. Doe" 
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm shadow-sm transition-all" 
        />
      </div>
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <Calendar className="h-4 w-4 text-gray-500" /> 
          Birthdate
        </label>
        <input 
          type="date" 
          value={birthdate} 
          onChange={(e) => setBirthdate(e.target.value)} 
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm shadow-sm transition-all" 
        />
      </div>
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <Venus className="h-4 w-4 text-gray-500" /> 
          Gender
        </label>
        <select 
          value={gender} 
          onChange={(e) => setGender(e.target.value as GenderOption | "")} 
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm shadow-sm bg-white transition-all"
        >
          <option value="">Select gender</option>
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
          <option>Prefer not to say</option>
        </select>
      </div>
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">About You</label>
        <textarea 
          value={bio} 
          onChange={(e) => setBio(e.target.value)} 
          placeholder="Tell us a bit about yourself, your interests, and what you're looking for..." 
          rows={3} 
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm shadow-sm resize-none transition-all" 
        />
      </div>
    </div>
  </motion.div>
);

const ContactStep = ({ 
  phoneNumber, onPhoneChange, messengerUrl, setMessengerUrl, 
  facebookUrl, setFacebookUrl, whatsappUrl, setWhatsappUrl 
}: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.5 }}
    className="space-y-6"
  >
    {/* Contact Icons Section */}
    <div className="text-center mb-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-3xl mb-4 shadow-lg"
      >
        <Phone className="h-12 w-12 text-blue-600" />
      </motion.div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Contact Information</h3>
      <p className="text-gray-600 text-sm mb-4">Help others reach you easily (all fields are optional)</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <Phone className="h-4 w-4 text-gray-500" />
          Phone Number
        </label>
        <input 
          type="tel" 
          inputMode="tel" 
          value={phoneNumber} 
          onChange={(e) => onPhoneChange(e.target.value)} 
          placeholder="e.g. +15551234567" 
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm shadow-sm transition-all" 
        />
        <p className="text-xs text-gray-500 mt-1">Digits and leading + only. We'll normalize the format.</p>
      </div>
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <MessageSquare className="h-4 w-4 text-gray-500" />
          Messenger URL
        </label>
        <input 
          type="url" 
          value={messengerUrl} 
          onChange={(e) => setMessengerUrl(e.target.value)} 
          placeholder="https://m.me/your.profile" 
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm shadow-sm transition-all" 
        />
      </div>
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <Facebook className="h-4 w-4 text-gray-500" />
          Facebook URL
        </label>
        <input 
          type="url" 
          value={facebookUrl} 
          onChange={(e) => setFacebookUrl(e.target.value)} 
          placeholder="https://facebook.com/your.profile" 
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm shadow-sm transition-all" 
        />
      </div>
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <MessageCircle className="h-4 w-4 text-gray-500" />
          WhatsApp URL
        </label>
        <input 
          type="url" 
          value={whatsappUrl} 
          onChange={(e) => setWhatsappUrl(e.target.value)} 
          placeholder="https://wa.me/15551234567" 
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm shadow-sm transition-all" 
        />
      </div>
    </div>

    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100"
    >
      <motion.div
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full mb-3"
      >
        <Award className="h-6 w-6 text-white" />
      </motion.div>
      <h4 className="font-semibold text-blue-800 mb-2">Journey Almost Complete!</h4>
      <p className="text-sm text-blue-700">
        You're just one step away from discovering your perfect rental experience
      </p>
    </motion.div>
  </motion.div>
);

export default Onboarding;