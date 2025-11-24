import { useEffect, useMemo, useRef, useState } from "react";
import { motion, type Variants } from "framer-motion";
import {
  User,
  Calendar,
  Venus,
  Phone,
  MessageSquare,
  Facebook,
  CheckCircle,
  Camera,
  Sparkles,
  Zap,
} from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { onboardingRequest } from "@/api/authApi";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, subYears, isAfter, isFuture } from "date-fns";

type GenderOption = "Male" | "Female" | "Other" | "Prefer not to say";

const MAX_AVATAR_BYTES = 5 * 1024 * 1024; // 5 MB

const YEARS = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

const SimpleDatePicker = ({
  value,
  onChange,
}: {
  value: Date | null;
  onChange: (date: Date | null) => void;
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(
    value?.getFullYear() || new Date().getFullYear() - 25,
  );
  const [selectedMonth, setSelectedMonth] = useState<number>(value?.getMonth() ?? 0);
  const [selectedDay, setSelectedDay] = useState<number>(value?.getDate() ?? 1);

  useEffect(() => {
    if (value) {
      setSelectedYear(value.getFullYear());
      setSelectedMonth(value.getMonth());
      setSelectedDay(value.getDate());
    }
  }, [value]);

  const handleDateChange = (year: number, month: number, day: number) => {
    const newDate = new Date(year, month, day);
    if (!isFuture(newDate)) {
      onChange(newDate);
    }
  };

  const isDateValid = (year: number, month: number, day: number) => {
    const date = new Date(year, month, day);
    return (
      date.getDate() === day &&
      date.getMonth() === month &&
      date.getFullYear() === year
    );
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      <Select
        value={selectedYear.toString()}
        onValueChange={(val) => {
          const year = parseInt(val, 10);
          setSelectedYear(year);
          if (isDateValid(year, selectedMonth, selectedDay)) {
            handleDateChange(year, selectedMonth, selectedDay);
          }
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent className="max-h-60">
          {YEARS.map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={selectedMonth.toString()}
        onValueChange={(val) => {
          const month = parseInt(val, 10);
          setSelectedMonth(month);
          if (isDateValid(selectedYear, month, selectedDay)) {
            handleDateChange(selectedYear, month, selectedDay);
          }
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent>
          {MONTHS.map((month, index) => (
            <SelectItem key={month} value={index.toString()}>
              {month}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={selectedDay.toString()}
        onValueChange={(val) => {
          const day = parseInt(val, 10);
          setSelectedDay(day);
          if (isDateValid(selectedYear, selectedMonth, day)) {
            handleDateChange(selectedYear, selectedMonth, day);
          }
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Day" />
        </SelectTrigger>
        <SelectContent>
          {DAYS.map((day) => (
            <SelectItem key={day} value={day.toString()}>
              {day}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, when: "beforeChildren" },
  },
};

const Onboarding = () => {
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarError, setAvatarError] = useState<string>("");
  const [birthdate, setBirthdate] = useState<Date | null>(null);
  const [gender, setGender] = useState<GenderOption | "">("");
  const [bio, setBio] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [messengerUrl, setMessengerUrl] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isBirthdateValid = (date: Date | null) => {
    if (!date) return false;
    if (isFuture(date)) return false;
    const eighteenYearsAgo = subYears(new Date(), 18);
    return !isAfter(date, eighteenYearsAgo);
  };

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
      const msg = "Please select an image file.";
      setAvatarError(msg);
      toast.error(msg);
      setAvatarFile(null);
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      const msg = "Image must be 5MB or smaller.";
      setAvatarError(msg);
      toast.error(msg);
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

  const uploadAvatarToSupabase = async (): Promise<string | null> => {
    if (!avatarFile || !user?.id) return null;

    const fileExtension = avatarFile.name.split(".").pop() || "jpg";
    const filePath = `avatars/${uuidv4()}.${fileExtension}`;

    try {
      const { error } = await supabase.storage
        .from("rentease-images")
        .upload(filePath, avatarFile, { cacheControl: "3600", upsert: true });

      if (error) {
        console.error("Upload failed:", error);
        setAvatarError("Upload failed. Check bucket permissions.");
        toast.error("Upload failed. Check bucket permissions.");
        return null;
      }

      const { data: publicData } = supabase.storage
        .from("rentease-images")
        .getPublicUrl(filePath);

      return publicData?.publicUrl || null;
    } catch (err) {
      console.error("Unexpected error:", err);
      setAvatarError("Unexpected error. See console.");
      toast.error("Unexpected error while uploading avatar");
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName || !lastName || !birthdate || !gender || !bio) {
      const msg = "Please fill out all required fields.";
      setAvatarError(msg);
      toast.error(msg);
      return;
    }

    if (isFuture(birthdate)) {
      const msg = "Birthdate cannot be a future date.";
      setAvatarError(msg);
      toast.error(msg);
      return;
    }

    if (!isBirthdateValid(birthdate)) {
      const msg = "You must be at least 18 years old.";
      setAvatarError(msg);
      toast.error(msg);
      return;
    }

    setAvatarError("");
    setIsSubmitting(true);
    try {
      let avatarUrl = null;
      if (avatarFile) {
        avatarUrl = await uploadAvatarToSupabase();
      }

      const formattedBirthdate = birthdate ? format(birthdate, "yyyy-MM-dd") : undefined;

      const onboardingData = {
        firstName,
        middleName: middleName || undefined,
        lastName,
        avatarUrl,
        birthdate: formattedBirthdate,
        gender,
        bio,
        phoneNumber: phoneNumber || undefined,
        messengerUrl: messengerUrl || undefined,
        facebookUrl: facebookUrl || undefined,
      };

      await onboardingRequest(onboardingData);

      const targetUrl =
        user?.role === "ADMIN"
          ? "/admin"
          : user?.role === "LANDLORD"
          ? "/landlord"
          : "/tenant";

      navigate(targetUrl, { replace: true });
      window.location.replace(targetUrl);
    } catch (error) {
      console.error(error);
      setAvatarError("Failed to complete onboarding. Please try again.");
      toast.error("Failed to complete onboarding. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const progressColor = "from-green-500 to-blue-500";
  const bgColor = "from-emerald-50 to-sky-50";

  return (
    <div className={`fixed inset-0 bg-gradient-to-br ${bgColor} flex items-center justify-center p-4 overflow-y-auto lg:overflow-hidden`}>
      {/* Ambient Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-28 -left-28 w-[32rem] h-[32rem] rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="absolute -bottom-28 -right-16 w-[28rem] h-[28rem] rounded-full bg-sky-400/10 blur-3xl" />
      </div>

      {/* Decorative sparkles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }}
            animate={{ y: [0, -18, 0], rotate: [0, 160, 320] }}
            transition={{ duration: Math.random() * 14 + 9, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles size={Math.random() * 14 + 8} className={i % 2 === 0 ? "text-green-300/20" : "text-blue-300/20"} />
          </motion.div>
        ))}
      </div>

      {/* Main Creative Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-6xl h-auto lg:h-[90dvh] bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/50 overflow-hidden flex flex-col"
      >
        {/* Header with Logo */}
        <div className="px-8 py-6 border-b border-gray-100/50 bg-gradient-to-r from-white/50 to-gray-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-r from-emerald-500 to-sky-500 shadow-lg">
                <Zap className="w-7 h-7 text-white" fill="currentColor" />
              </div>
              <div>
                <h1 className="text-2xl font-black bg-gradient-to-r from-emerald-600 via-sky-600 to-emerald-600 bg-clip-text text-transparent">
                  RentEase
                </h1>
                <p className="text-sm text-gray-600">Complete your profile</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-gray-600">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <span className="text-sm">One-step setup</span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8 flex-1 overflow-y-auto lg:overflow-hidden">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12"
          >
            {/* Left Column */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-black text-gray-800 tracking-tight mb-2">Personal Information</h2>
                <p className="text-gray-600">Tell us about yourself</p>
                {avatarError && (
                  <p className="mt-3 text-sm text-red-600 bg-red-50 p-2 rounded-lg">{avatarError}</p>
                )}
              </div>

              <>
                  {/* Avatar Section */}
                  <div className="flex items-center gap-6 flex-wrap sm:flex-nowrap">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-emerald-100 to-sky-100 shadow-lg overflow-hidden flex items-center justify-center">
                        {avatarPreviewUrl ? (
                          <img src={avatarPreviewUrl} alt="Avatar preview" className="w-full h-full object-cover" />
                        ) : (
                          <User className="h-16 w-16 text-emerald-400" />
                        )}
                      </div>
                      <motion.button
                        type="button"
                        onClick={triggerFileInput}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg flex items-center justify-center"
                      >
                        <Camera className="h-4 w-4" />
                      </motion.button>
                    </div>

                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                          <input
                            type="text"
                            required
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="e.g. John"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                          <input
                            type="text"
                            required
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="e.g. Doe"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Middle Name</label>
                        <input
                          type="text"
                          value={middleName}
                          onChange={(e) => setMiddleName(e.target.value)}
                          placeholder="Optional"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />

                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">About You *</label>
                    <textarea
                      required
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us a bit about yourself..."
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">Keep it short and friendly</p>
                  </div>

                  
              </>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
                <>
                  {/* Contact Information */}
                  <div className="space-y-6">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Phone className="h-4 w-4 text-blue-500" /> Phone Number
                      </label>
                      <input
                        type="tel"
                        inputMode="tel"
                        value={phoneNumber}
                        onChange={(e) => onPhoneChange(e.target.value)}
                        placeholder="e.g. +15551234567"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">Digits and leading + only</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                          <MessageSquare className="h-4 w-4 text-emerald-600" /> Messenger URL (optional)
                        </label>
                        <input
                          type="url"
                          value={messengerUrl}
                          onChange={(e) => setMessengerUrl(e.target.value)}
                          placeholder="https://m.me/your.profile"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                          <Facebook className="h-4 w-4 text-blue-600" /> Facebook URL (optional)
                        </label>
                        <input
                          type="url"
                          value={facebookUrl}
                          onChange={(e) => setFacebookUrl(e.target.value)}
                          placeholder="https://facebook.com/your.profile"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Birthdate and Gender */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Birthdate & Gender</h3>
                    <div className="grid grid-cols-1 gap-6 mb-6">
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <Calendar className="h-4 w-4 text-emerald-500" /> Birthdate *
                        </label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full justify-between rounded-xl border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-white"
                            >
                              <span className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-emerald-500" />
                                {birthdate ? format(birthdate, "PPP") : "Select your birthdate"}
                              </span>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80 p-4" align="start">
                            <SimpleDatePicker value={birthdate} onChange={setBirthdate} />
                            {birthdate && !isBirthdateValid(birthdate) && (
                              <p className="mt-3 text-sm text-red-600">
                                Must be at least 18 years old and not a future date
                              </p>
                            )}
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Venus className="h-4 w-4 text-emerald-500" /> Gender *
                      </label>
                      <select
                        required
                        value={gender}
                        onChange={(e) => setGender(e.target.value as GenderOption | "")}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      >
                        <option value="">Select gender</option>
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                        <option>Prefer not to say</option>
                      </select>
                    </div>
                  </div>

                 
                </>
            </div>
          </motion.div>
        </div>

        {/* Bottom Actions */}
        <div className="px-8 py-6 border-t border-gray-100/50 bg-gradient-to-r from-gray-50/50 to-white/50">
          <div className="flex items-center justify-between">
            <div />

            <form onSubmit={handleSubmit}>
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`bg-gradient-to-r ${progressColor} text-white py-3 px-8 rounded-xl font-medium transition-all shadow-lg hover:shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isSubmitting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                    Processing...
                  </>
                ) : (
                  <>
                    Complete Profile
                    <CheckCircle className="h-4 w-4" />
                  </>
                )}
              </motion.button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Onboarding;
  