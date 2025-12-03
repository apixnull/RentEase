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
  Zap,
  Loader2,
  UserCircle,
} from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNavigate } from "react-router-dom";
import { privateApi } from "@/api/axios";
import { supabase } from "@/lib/supabaseClient";
import { onboardingRequest } from "@/api/authApi";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
    // Remove all non-digit characters except + at the start
    let cleaned = raw.replace(/[^\d+]/g, "");
    
    // If it starts with +63, convert to 0 format (Philippine format)
    if (cleaned.startsWith("+63")) {
      cleaned = "0" + cleaned.substring(3);
    }
    
    // Remove + if it's not at the start with 63
    cleaned = cleaned.replace(/\+/g, "");
    
    // Only keep digits, max 11 digits
    const digits = cleaned.replace(/\D/g, "").slice(0, 11);
    
    return digits;
  };

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return "";
    
    // Format as 09XX XXX XXXX
    if (phone.length <= 4) {
      return phone;
    } else if (phone.length <= 7) {
      return `${phone.slice(0, 4)} ${phone.slice(4)}`;
    } else {
      return `${phone.slice(0, 4)} ${phone.slice(4, 7)} ${phone.slice(7)}`;
    }
  };

  const onPhoneChange = (v: string) => {
    const normalized = normalizePhone(v);
    setPhoneNumber(normalized);
  };

  const isValidPhilippinePhone = (phone: string) => {
    if (!phone) return true; // Optional field
    // Must be 11 digits and start with 09
    return phone.length === 11 && phone.startsWith("09");
  };

  const uploadAvatarToSupabase = async (): Promise<string | null> => {
    if (!avatarFile || !user?.id) return null;

    // Check if using local storage (development mode or explicit flag)
    const useLocalStorage =
      import.meta.env.VITE_USE_LOCAL_STORAGE === "true" ||
      import.meta.env.MODE === "development";

    if (useLocalStorage) {
      // Local storage mode: Upload to backend endpoint
      try {
        const formData = new FormData();
        formData.append("image", avatarFile);

        const response = await privateApi.post("/upload/avatar", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        const mockUrl = response.data.url; // e.g., "/local-images/avatars/uuid.jpg"

        // In development, prepend backend URL to make it accessible
        if (import.meta.env.MODE === "development") {
          const backendUrl = "http://localhost:5000";
          return `${backendUrl}${mockUrl}`;
        }

        // In production with local storage, return as-is
        return mockUrl;
      } catch (error: any) {
        console.error("Local upload error:", error);
        const errorMsg =
          error.response?.data?.error || "Failed to upload image to local storage";
        setAvatarError(errorMsg);
        toast.error(errorMsg);
        return null;
      }
    } else {
      // Supabase storage mode (production)
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

    if (phoneNumber && !isValidPhilippinePhone(phoneNumber)) {
      const msg = "Phone number must be 11 digits starting with 09 (e.g., 09171234567).";
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

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: "beforeChildren",
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-emerald-100/40 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Static Background Blobs */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-300/70 rounded-full blur-2xl"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-sky-300/70 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-emerald-400/65 rounded-full blur-2xl"></div>
        <div className="absolute bottom-40 right-1/3 w-64 h-64 bg-sky-400/65 rounded-full blur-2xl"></div>
      </div>

      <motion.div
        className="max-w-6xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col lg:flex-row items-stretch z-10 max-h-[95vh] lg:max-h-[90vh]"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Left Panel - Visual Design */}
        <div className="hidden lg:flex lg:w-[40%] bg-gradient-to-br from-emerald-600 via-emerald-500 to-sky-600 p-8 text-white flex-col justify-center relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-white/8"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  width: `${Math.random() * 50 + 25}px`,
                  height: `${Math.random() * 50 + 25}px`,
                }}
                animate={{
                  y: [0, (Math.random() - 0.5) * 25, 0],
                  x: [0, (Math.random() - 0.5) * 25, 0],
                  scale: [1, 1.1, 1],
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                  duration: Math.random() * 12 + 12,
                  repeat: Infinity,
                  delay: Math.random() * 3,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>

          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10"
          >
            <div className="flex items-center justify-center gap-2 mb-8">
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 5, 0],
                  scale: [1, 1.1, 1.05, 1.08, 1],
                  transition: {
                    duration: 1.5,
                    repeat: Infinity,
                    repeatType: "reverse" as const,
                  },
                }}
              >
                <Zap className="h-12 w-12 text-emerald-200" fill="currentColor" />
              </motion.div>
              <span className="text-3xl font-extrabold text-white drop-shadow-lg">
                RentEase
              </span>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                Complete Your Profile
              </h2>
              <p className="text-emerald-50 text-base leading-relaxed max-w-sm mx-auto">
                Help us get to know you better. This information helps us create a personalized experience for you.
              </p>
            </div>

            <div className="space-y-4 max-w-xs mx-auto">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20"
              >
                <div className="p-3 bg-white/20 rounded-lg">
                  <UserCircle className="h-6 w-6 text-yellow-300" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">Personal Details</p>
                  <p className="text-xs text-emerald-100">Tell us about yourself</p>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20"
              >
                <div className="p-3 bg-white/20 rounded-lg">
                  <Phone className="h-6 w-6 text-yellow-300" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">Contact Info</p>
                  <p className="text-xs text-emerald-100">Stay connected</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Right Panel - Form Section */}
        <div className="lg:w-[60%] p-6 md:p-8 flex flex-col overflow-y-auto">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center gap-3 mb-6 pb-4 border-b">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 shadow-md">
              <Zap className="w-6 h-6 text-white" fill="currentColor" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">RentEase</h1>
              <p className="text-xs text-gray-600">Complete your profile</p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-1"
          >
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Header */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-100 to-sky-100 rounded-2xl mb-4 shadow-md">
                  <div className="bg-gradient-to-br from-emerald-600 to-sky-600 p-3 rounded-xl">
                    <UserCircle className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                  Complete Your Profile
                </h1>
                <p className="text-gray-500 text-sm">
                  Fill in your details to get started
                </p>
              </div>

              {avatarError && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                  {avatarError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Avatar Section */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="relative">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-emerald-100 to-sky-100 shadow-md overflow-hidden flex items-center justify-center">
                      {avatarPreviewUrl ? (
                        <img src={avatarPreviewUrl} alt="Avatar preview" className="w-full h-full object-cover" />
                      ) : (
                        <User className="h-12 w-12 sm:h-14 sm:w-14 text-emerald-400" />
                      )}
                    </div>
                    <motion.button
                      type="button"
                      onClick={triggerFileInput}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="absolute -bottom-1 -right-1 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-r from-emerald-600 to-sky-600 text-white shadow-lg flex items-center justify-center border-2 border-white"
                    >
                      <Camera className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </motion.button>
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="font-medium text-gray-800 mb-1">Profile Photo</h3>
                    <p className="text-xs text-gray-500 mb-2">Upload a photo to help others recognize you</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={triggerFileInput}
                      className="text-xs"
                    >
                      <Camera className="h-3 w-3" />
                      Choose Photo
                    </Button>
                  </div>
                </div>

                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />

                {/* Name Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="firstName"
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. John"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="lastName"
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. Doe"
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="middleName" className="block text-sm font-medium text-gray-700 mb-2">
                    Middle Name <span className="text-gray-400 text-xs">(Optional)</span>
                  </label>
                  <Input
                    id="middleName"
                    type="text"
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                    placeholder="Optional"
                    className="w-full"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                    About You <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    id="bio"
                    required
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us a bit about yourself..."
                    rows={4}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">Keep it short and friendly</p>
                </div>

                {/* Birthdate and Gender */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="h-4 w-4 text-emerald-500" /> Birthdate <span className="text-red-500">*</span>
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full justify-between"
                        >
                          <span className="flex items-center gap-2">
                            {birthdate ? format(birthdate, "PPP") : "Select birthdate"}
                          </span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-4" align="start">
                        <SimpleDatePicker value={birthdate} onChange={setBirthdate} />
                        {birthdate && !isBirthdateValid(birthdate) && (
                          <p className="mt-3 text-sm text-red-600">
                            Must be at least 18 years old and not a future date
                          </p>
                        )}
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Venus className="h-4 w-4 text-emerald-500" /> Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={gender}
                      onChange={(e) => setGender(e.target.value as GenderOption | "")}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Select gender</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                      <option>Prefer not to say</option>
                    </select>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="pt-4 border-t">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Phone className="h-4 w-4 text-blue-500" /> Phone Number
                        <span className="text-gray-400 text-xs">(Optional)</span>
                      </label>
                      <Input
                        id="phone"
                        type="tel"
                        inputMode="tel"
                        value={formatPhoneNumber(phoneNumber)}
                        onChange={(e) => onPhoneChange(e.target.value)}
                        placeholder="09XX XXX XXXX"
                        className="w-full"
                        maxLength={13} // 09XX XXX XXXX format
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {phoneNumber ? (
                          isValidPhilippinePhone(phoneNumber) ? (
                            <span className="text-emerald-600">✓ Valid Philippine phone number</span>
                          ) : (
                            <span className="text-red-600">Must be 11 digits starting with 09</span>
                          )
                        ) : (
                          "11 digits starting with 09 (e.g., 09171234567)"
                        )}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="messenger" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                          <MessageSquare className="h-4 w-4 text-emerald-600" /> Messenger URL
                        </label>
                        <Input
                          id="messenger"
                          type="url"
                          value={messengerUrl}
                          onChange={(e) => setMessengerUrl(e.target.value)}
                          placeholder="https://m.me/your.profile"
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label htmlFor="facebook" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                          <Facebook className="h-4 w-4 text-blue-600" /> Facebook URL
                        </label>
                        <Input
                          id="facebook"
                          type="url"
                          value={facebookUrl}
                          onChange={(e) => setFacebookUrl(e.target.value)}
                          placeholder="https://facebook.com/your.profile"
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={isSubmitting ? {} : { scale: 1.02 }}
                    whileTap={isSubmitting ? {} : { scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-emerald-600 to-sky-600 text-white py-3.5 px-4 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:shadow-md flex items-center justify-center gap-2 relative overflow-hidden"
                  >
                    {isSubmitting && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-gradient-to-r from-emerald-700 to-sky-700"
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          <span>Complete Profile</span>
                        </>
                      )}
                    </span>
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Onboarding;
  