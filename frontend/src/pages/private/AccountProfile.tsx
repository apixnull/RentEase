import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  User,
  Mail,
  Shield,
  Phone,
  MessageSquare,
  Facebook,
  Calendar,
  Venus,
  Edit3,
  Key,
  X,
  Save,
  CheckCircle2,
  XCircle,
  Clock,
  UserCircle,
  BadgeCheck,
  AlertCircle,
  Lock,
} from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { privateApi } from "@/api/axios";
import { supabase } from "@/lib/supabaseClient";
import { v4 as uuidv4 } from "uuid";
import { forgotPasswordRequest, updateProfileRequest } from "@/api/authApi";
import PageHeader from "@/components/PageHeader";
import AdminPageHeader from "@/components/AdminPageHeader";
import { motion } from "framer-motion";

const MAX_AVATAR_BYTES = 5 * 1024 * 1024; // 5 MB

const formatDate = (iso?: string | null) => {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "—";
  }
};

const formatDateTime = (iso?: string | null) => {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
};

const initialsOf = (first?: string | null, last?: string | null) => {
  const f = (first?.[0] ?? "").toUpperCase();
  const l = (last?.[0] ?? "").toUpperCase();
  return f + l || "U";
};

const AccountProfile = () => {
  const user = useAuthStore((state) => state.user);

  const [isLoading, setIsLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarError, setAvatarError] = useState<string>("");
  const [isPasswordResetModalOpen, setIsPasswordResetModalOpen] =
    useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetCooldown, setResetCooldown] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    birthdate: "",
    gender: "",
    bio: "",
    phoneNumber: "",
    messengerUrl: "",
    facebookUrl: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        middleName: user.middleName || "",
        lastName: user.lastName || "",
        birthdate: user.birthdate || "",
        gender: user.gender || "",
        bio: user.bio || "",
        phoneNumber: user.phoneNumber || "",
        messengerUrl: user.messengerUrl || "",
        facebookUrl: user.facebookUrl || "",
      });
    }
  }, [user]);

  if (!user) {
    return (
      <div className="p-6 text-center text-gray-500">Loading profile...</div>
    );
  }

  // Role-based theming
  const isAdmin = (user.role || "").toUpperCase() === "ADMIN";
  const isLandlord = (user.role || "").toUpperCase() === "LANDLORD";

  const theme = {
    // Header gradients
    headerGradientFrom: isAdmin ? "from-purple-200/70" : "from-emerald-200/70",
    headerGradientVia: isAdmin ? "via-blue-200/50" : "via-emerald-100/50",
    headerGradientTo: isAdmin ? "to-purple-200/70" : "to-sky-200/70",
    // Card accents
    accentBg50: isAdmin ? "bg-purple-50" : "bg-emerald-50",
    accentBg100: isAdmin ? "bg-purple-100" : "bg-emerald-100",
    accentText600: isAdmin ? "text-purple-600" : "text-emerald-600",
    accentText700: isAdmin ? "text-purple-700" : "text-emerald-700",
    accentBorder200: isAdmin ? "border-purple-200" : "border-emerald-200",
    accentHoverBg50: isAdmin ? "hover:bg-purple-50" : "hover:bg-emerald-50",
    // Button gradients
    buttonGradientFrom: isAdmin ? "from-purple-600" : "from-emerald-600",
    buttonGradientTo: isAdmin ? "to-blue-600" : "to-sky-600",
    // Icon gradients
    iconGradientFrom: isAdmin ? "from-purple-600" : "from-emerald-600",
    iconGradientTo: isAdmin ? "to-blue-600" : "to-sky-600",
  } as const;

  const HeaderComponent = isAdmin ? AdminPageHeader : PageHeader;

  const avatarPreviewUrl = avatarFile
    ? URL.createObjectURL(avatarFile)
    : user.avatarUrl || "";

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

  const uploadAvatarToSupabase = async (): Promise<string | null> => {
    if (!avatarFile) return null;

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
        setAvatarError(
          error.response?.data?.error || "Failed to upload image to local storage"
        );
        return null;
      }
    } else {
      // Supabase storage mode (production)
      try {
        const fileExtension = avatarFile.name.split(".").pop() || "jpg";
        const filePath = `avatars/${uuidv4()}.${fileExtension}`;

        const { error } = await supabase.storage
          .from("rentease-images")
          .upload(filePath, avatarFile, {
            cacheControl: "3600",
            upsert: true,
          });

        if (error) throw error;

        const {
          data: { publicUrl },
        } = supabase.storage.from("rentease-images").getPublicUrl(filePath);

        return publicUrl;
      } catch (error) {
        console.error("Error uploading avatar:", error);
        setAvatarError("Failed to upload image. Please try again.");
        return null;
      }
    }
  };

  const handleSave = async () => {
    setIsLoading(true);

    try {
      const birthdateError = isValidBirthdate(formData.birthdate);
      if (birthdateError) {
        toast.error(birthdateError);
        setIsLoading(false);
        return;
      }
      let avatarUrl = user?.avatarUrl;

      if (avatarFile) {
        const uploadedUrl = await uploadAvatarToSupabase();
        if (uploadedUrl) avatarUrl = uploadedUrl;
      }

      const payload = {
        ...formData,
        avatarUrl,
      };

      await updateProfileRequest(payload);

      useAuthStore.setState((state) => ({
        user: state.user
          ? {
              ...state.user,
              ...payload,
            }
          : state.user,
      }));

      toast.success("Profile updated successfully");

      setIsEditProfileModalOpen(false);
      setAvatarFile(null);
      setAvatarError("");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const isValidBirthdate = (birthdate: string): string | null => {
    if (!birthdate) return "Birthdate is required";

    const date = new Date(birthdate);
    const today = new Date();

    if (date > today) {
      return "Birthdate cannot be in the future";
    }

    const ageDiff = today.getFullYear() - date.getFullYear();
    const hasBirthdayPassed =
      today.getMonth() > date.getMonth() ||
      (today.getMonth() === date.getMonth() &&
        today.getDate() >= date.getDate());

    const age = hasBirthdayPassed ? ageDiff : ageDiff - 1;

    if (age < 18) {
      return "You must be at least 18 years old";
    }

    return null;
  };

  const handleCancel = () => {
    setFormData({
      firstName: user.firstName || "",
      middleName: user.middleName || "",
      lastName: user.lastName || "",
      birthdate: user.birthdate || "",
      gender: user.gender || "",
      bio: user.bio || "",
      phoneNumber: user.phoneNumber || "",
      messengerUrl: user.messengerUrl || "",
      facebookUrl: user.facebookUrl || "",
    });
    setAvatarFile(null);
    setAvatarError("");
    setIsEditProfileModalOpen(false);
  };

  // Calculate if password reset can be requested (3-day cooldown)
  const canRequestPasswordReset = () => {
    if (!user.lastPasswordChange) return true;
    const now = new Date();
    const lastChange = new Date(user.lastPasswordChange);
    const diffMs = now.getTime() - lastChange.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays >= 3;
  };

  // Calculate time until next reset can be requested
  const getTimeUntilNextReset = () => {
    if (!user.lastPasswordChange) return null;
    const now = new Date();
    const lastChange = new Date(user.lastPasswordChange);
    const threeDaysLater = new Date(lastChange.getTime() + 3 * 24 * 60 * 60 * 1000);
    const diffMs = threeDaysLater.getTime() - now.getTime();
    if (diffMs <= 0) return null;
    return diffMs;
  };

  // Format time remaining
  const formatTimeRemaining = (ms: number) => {
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} and ${hours} hour${hours > 1 ? 's' : ''}`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} and ${minutes} minute${minutes > 1 ? 's' : ''}`;
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  };

  // Update cooldown timer
  useEffect(() => {
    if (!user.lastPasswordChange || canRequestPasswordReset()) {
      setResetCooldown(null);
      return;
    }

    const updateCooldown = () => {
      const timeRemaining = getTimeUntilNextReset();
      if (timeRemaining && timeRemaining > 0) {
        setResetCooldown(timeRemaining);
      } else {
        setResetCooldown(null);
      }
    };

    updateCooldown();
    const interval = setInterval(updateCooldown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [user.lastPasswordChange]);

  const handlePasswordReset = async () => {
    if (!user.email) {
      toast.error("Email is required");
      return;
    }

    if (!canRequestPasswordReset()) {
      const timeRemaining = getTimeUntilNextReset();
      if (timeRemaining) {
        toast.error(`You can request a password reset in ${formatTimeRemaining(timeRemaining)}`);
      }
      return;
    }

    setIsResettingPassword(true);
    try {
      await forgotPasswordRequest({ email: user.email });
      toast.success("Password reset link sent to " + user.email);
      setIsPasswordResetModalOpen(false);
      // Note: The backend now tracks daily requests, so we don't need to update lastPasswordChange
      // The cooldown is based on lastPasswordChange (3 days) and daily request limit
    } catch (error: any) {
      console.error("Error sending password reset email:", error);
      // Show error message from backend, or fallback to default message
      const errorMessage = error.response?.data?.message || "Failed to send password reset email";
      toast.error(errorMessage);
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const openEditModal = () => {
    setIsEditProfileModalOpen(true);
    setFormData({
      firstName: user.firstName || "",
      middleName: user.middleName || "",
      lastName: user.lastName || "",
      birthdate: user.birthdate || "",
      gender: user.gender || "",
      bio: user.bio || "",
      phoneNumber: user.phoneNumber || "",
      messengerUrl: user.messengerUrl || "",
      facebookUrl: user.facebookUrl || "",
    });
    setAvatarFile(null);
    setAvatarError("");
  };

  return (
    <div className="min-h-screen p-4 md:p-6 space-y-4 max-w-7xl mx-auto relative">
      <div className="relative z-10">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-4"
        >
          <HeaderComponent
            title="Account Profile"
            description="Manage your personal information, account settings, and security preferences"
            icon={UserCircle}
            actions={
              <Button
                onClick={openEditModal}
                className={`gap-2 bg-gradient-to-r ${theme.buttonGradientFrom} ${theme.buttonGradientTo} hover:brightness-110 shadow-lg hover:shadow-xl transition-all duration-300 text-white`}
              >
                <Edit3 size={16} />
                Edit Profile
              </Button>
            }
          />
        </motion.div>

        {/* Profile Overview Card - Compact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl p-4"
        >
          <div className="flex items-center gap-4">
            <motion.div
              className="relative flex-shrink-0"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Avatar className="h-16 w-16 ring-2 ring-white shadow-md">
                <AvatarImage src={user.avatarUrl || undefined} alt="avatar" />
                <AvatarFallback
                  className={`bg-gradient-to-br ${theme.iconGradientFrom} ${theme.iconGradientTo} text-white text-xl font-bold`}
                >
                  {initialsOf(user.firstName, user.lastName)}
                </AvatarFallback>
              </Avatar>
              {user.isVerified && (
                <motion.div
                  className="absolute -bottom-0.5 -right-0.5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full p-1 shadow-md border-2 border-white"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                >
                  <BadgeCheck className="h-3.5 w-3.5 text-white" />
                </motion.div>
              )}
            </motion.div>

            <div className="flex-1 min-w-0">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 truncate mb-1">
                {user.firstName} {user.lastName}
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/60 backdrop-blur-sm border border-gray-200/50 shadow-sm">
                  <Mail size={14} className={theme.accentText600} />
                  <span className="font-medium text-gray-700 text-xs truncate max-w-[200px]">{user.email}</span>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-md text-xs font-bold capitalize shadow-sm ${
                    isAdmin
                      ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white"
                      : isLandlord
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                      : "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white"
                  }`}
                >
                  {user.role.toLowerCase()}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6 mt-6">
        {/* Profile Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 p-5 md:p-6 space-y-4 shadow-xl hover:shadow-2xl transition-all duration-300"
        >
          <div className="flex items-center gap-3 pb-3 border-b border-gray-200/50">
            <div className={`p-2.5 rounded-xl ${theme.accentBg50} shadow-md`}>
              <User className={`h-5 w-5 ${theme.accentText600}`} />
            </div>
            <h2 className="font-bold text-gray-900 text-lg">
              Profile Details
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-2">
                <User size={13} className={theme.accentText600} />
                First Name
              </label>
              <div className="px-4 py-2.5 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200/50 text-gray-900 font-semibold text-sm shadow-sm">
                {user.firstName || "—"}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-2">
                <User size={13} className={theme.accentText600} />
                Middle Name
              </label>
              <div className="px-4 py-2.5 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200/50 text-gray-900 text-sm shadow-sm">
                {user.middleName || "—"}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-2">
                <User size={13} className={theme.accentText600} />
                Last Name
              </label>
              <div className="px-4 py-2.5 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200/50 text-gray-900 font-semibold text-sm shadow-sm">
                {user.lastName || "—"}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-2">
                <Calendar size={13} className={theme.accentText600} />
                Birthdate
              </label>
              <div className="px-4 py-2.5 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200/50 text-gray-900 text-sm shadow-sm">
                {formatDate(user.birthdate)}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-2">
                <Venus size={13} className={theme.accentText600} />
                Gender
              </label>
              <div className="px-4 py-2.5 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200/50 text-gray-900 text-sm shadow-sm">
                {user.gender || "—"}
              </div>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Bio
              </label>
              <div className="px-4 py-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200/50 text-gray-900 min-h-[70px] text-sm shadow-sm leading-relaxed">
                {user.bio || "—"}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contact Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 p-5 md:p-6 space-y-4 shadow-xl hover:shadow-2xl transition-all duration-300"
        >
          <div className="flex items-center gap-3 pb-3 border-b border-gray-200/50">
            <div
              className={`p-2.5 rounded-xl shadow-md ${
                isAdmin ? "bg-blue-50" : "bg-sky-50"
              }`}
            >
              <Phone
                className={`h-5 w-5 ${
                  isAdmin ? "text-blue-600" : "text-sky-600"
                }`}
              />
            </div>
            <h2 className="font-bold text-gray-900 text-lg">
              Contact Information
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-2">
                <Phone size={13} className="text-blue-600" />
                Phone
              </label>
              {user.phoneNumber ? (
                <a
                  href={`tel:${user.phoneNumber}`}
                  className="block px-4 py-2.5 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/50 text-blue-700 hover:text-blue-800 hover:from-blue-100 hover:to-blue-200 transition-all duration-300 truncate font-semibold text-sm shadow-sm hover:shadow-md"
                >
                  {user.phoneNumber}
                </a>
              ) : (
                <div className="px-4 py-2.5 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200/50 text-gray-500 text-sm shadow-sm">
                  —
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-2">
                <MessageSquare size={13} className="text-emerald-600" />
                Messenger
              </label>
              {user.messengerUrl ? (
                <a
                  href={user.messengerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-2.5 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200/50 text-emerald-700 hover:text-emerald-800 hover:from-emerald-100 hover:to-emerald-200 transition-all duration-300 truncate font-semibold text-sm shadow-sm hover:shadow-md"
                >
                  Open Messenger
                </a>
              ) : (
                <div className="px-4 py-2.5 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200/50 text-gray-500 text-sm shadow-sm">
                  —
                </div>
              )}
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-2">
                <Facebook size={13} className="text-blue-600" />
                Facebook
              </label>
              {user.facebookUrl ? (
                <a
                  href={user.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-2.5 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/50 text-blue-700 hover:text-blue-800 hover:from-blue-100 hover:to-blue-200 transition-all duration-300 truncate font-semibold text-sm shadow-sm hover:shadow-md"
                >
                  Open Facebook
                </a>
              ) : (
                <div className="px-4 py-2.5 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200/50 text-gray-500 text-sm shadow-sm">
                  —
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Account & Security Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 p-5 md:p-6 space-y-4 shadow-xl hover:shadow-2xl transition-all duration-300 lg:col-span-2 mt-5"
        >
          <div className="flex items-center gap-3 pb-3 border-b border-gray-200/50">
            <div className={`p-2.5 rounded-xl ${theme.accentBg50} shadow-md`}>
              <Shield className={`h-5 w-5 ${theme.accentText600}`} />
            </div>
            <h2 className="font-bold text-gray-900 text-lg">
              Account & Security
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-2">
                <Mail size={13} className={theme.accentText600} />
                Email Address
              </label>
              <div className="px-4 py-2.5 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200/50 text-gray-900 flex items-center justify-between gap-2 shadow-sm">
                <span className="truncate text-sm font-semibold">{user.email}</span>
                {user.isVerified ? (
                  <span className="flex items-center gap-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs px-2.5 py-0.5 rounded-full font-bold flex-shrink-0 shadow-md">
                    <CheckCircle2 size={11} />
                    Verified
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs px-2.5 py-0.5 rounded-full font-bold flex-shrink-0 shadow-md">
                    <XCircle size={11} />
                    Unverified
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-2">
                <Shield size={13} className={theme.accentText600} />
                Account Role
              </label>
              <div className="px-4 py-2.5 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200/50 text-gray-900 capitalize font-bold text-sm shadow-sm">
                {user.role.toLowerCase()}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-2">
                <User size={13} className={theme.accentText600} />
                Onboarding
              </label>
              <div className="px-4 py-2.5 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200/50 flex items-center justify-between shadow-sm">
                <span className="text-gray-900 font-bold text-sm">
                  {user.hasSeenOnboarding ? "Completed" : "Pending"}
                </span>
                {user.hasSeenOnboarding ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                ) : (
                  <Clock className="h-4 w-4 text-amber-500 flex-shrink-0" />
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-gray-200/50">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-2">
                <Calendar size={13} className={theme.accentText600} />
                Account Created
              </label>
              <div className="px-4 py-2.5 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200/50 text-gray-900 font-semibold text-sm shadow-sm">
                {user.createdAt ? formatDateTime(user.createdAt) : "—"}
              </div>
            </div>

            {user.lastLogin && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-2">
                  <Clock size={13} className={theme.accentText600} />
                  Last Login
                </label>
                <div className="px-4 py-2.5 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200/50 text-gray-900 font-semibold text-sm shadow-sm">
                  {formatDateTime(user.lastLogin)}
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-2">
                <Key size={13} className={theme.accentText600} />
                Last Password Change
              </label>
              <div className="px-4 py-2.5 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200/50 text-gray-900 font-semibold text-sm shadow-sm">
                {user.lastPasswordChange ? formatDateTime(user.lastPasswordChange) : "Never changed"}
              </div>
            </div>
          </div>

          {/* Password Reset Section */}
          <div className="pt-6 border-t border-gray-200/50">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-100">
                  <Lock className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Password Security</h3>
                  <p className="text-xs text-gray-600">
                    Request a password reset link via email
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setIsPasswordResetModalOpen(true)}
                variant="outline"
                disabled={isResettingPassword}
                className={`gap-2 border-2 ${theme.accentBorder200} ${theme.accentText700} ${theme.accentHoverBg50} hover:shadow-md transition-all duration-300 font-semibold`}
              >
                <Key size={16} />
                {isResettingPassword ? "Sending..." : "Reset Password"}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Edit Profile Modal */}
      <Dialog
        open={isEditProfileModalOpen}
        onOpenChange={setIsEditProfileModalOpen}
      >
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full bg-white/95 backdrop-blur-xl border-white/50 shadow-2xl">
          <DialogHeader className="pb-4 border-b border-gray-200/50">
            <DialogTitle className="flex items-center gap-3 text-2xl font-bold">
              <div className={`p-2 rounded-xl ${theme.accentBg50}`}>
                <Edit3 className={`h-6 w-6 ${theme.accentText600}`} />
              </div>
              Edit Profile
            </DialogTitle>
            <DialogDescription className="text-base mt-2">
              Update your personal information and contact details.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-6 p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200/50">
              <motion.div
                className="relative"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Avatar className="h-24 w-24 ring-4 ring-white shadow-xl">
                  <AvatarImage
                    src={avatarPreviewUrl || undefined}
                    alt="avatar"
                  />
                  <AvatarFallback
                    className={`bg-gradient-to-br ${theme.iconGradientFrom} ${theme.iconGradientTo} text-white text-xl font-bold`}
                  >
                    {initialsOf(user.firstName, user.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2">
                  <label htmlFor="avatar-upload" className="cursor-pointer">
                    <motion.div
                      className={`p-2.5 rounded-full ${theme.accentBg50} shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-white`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Edit3 className={`h-5 w-5 ${theme.accentText600}`} />
                    </motion.div>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </motion.div>
              <div>
                <h3 className="font-bold text-lg mb-1">Profile Picture</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Click the pencil icon to change your avatar
                </p>
                {avatarError && (
                  <p className="text-red-600 text-sm mt-2 font-medium bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                    {avatarError}
                  </p>
                )}
              </div>
            </div>

            {/* Profile Details */}
            <div className="space-y-5">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-200/50">
                <div className={`p-2 rounded-xl ${theme.accentBg50}`}>
                  <User className={`h-5 w-5 ${theme.accentText600}`} />
                </div>
                <h3 className="font-bold text-lg text-gray-900">
                  Profile Details
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    First Name *
                  </label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                    placeholder="First Name"
                    className="h-11 border-2 focus:border-emerald-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Middle Name
                  </label>
                  <Input
                    value={formData.middleName}
                    onChange={(e) =>
                      handleInputChange("middleName", e.target.value)
                    }
                    placeholder="Middle Name"
                    className="h-11 border-2 focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Last Name *
                  </label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    placeholder="Last Name"
                    className="h-11 border-2 focus:border-emerald-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Calendar size={14} className={theme.accentText600} />
                    Birthdate *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {/* Year Dropdown */}
                    <Select
                      value={
                        formData.birthdate
                          ? (() => {
                              try {
                                const date = new Date(formData.birthdate);
                                if (!isNaN(date.getTime())) {
                                  return String(date.getFullYear());
                                }
                              } catch {}
                              return "";
                            })()
                          : ""
                      }
                      onValueChange={(year) => {
                        const currentDate = formData.birthdate
                          ? (() => {
                              try {
                                const d = new Date(formData.birthdate);
                                return !isNaN(d.getTime()) ? d : new Date();
                              } catch {
                                return new Date();
                              }
                            })()
                          : new Date();
                        const month = currentDate.getMonth() + 1;
                        const day = currentDate.getDate();
                        // Validate date (e.g., Feb 30 becomes Mar 2)
                        const validDate = new Date(parseInt(year), month - 1, Math.min(day, new Date(parseInt(year), month, 0).getDate()));
                        const formatted = `${year}-${String(validDate.getMonth() + 1).padStart(2, '0')}-${String(validDate.getDate()).padStart(2, '0')}`;
                        handleInputChange("birthdate", formatted);
                      }}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px] z-[100]">
                        {Array.from({ length: new Date().getFullYear() - 1899 }, (_, i) => {
                          const year = new Date().getFullYear() - i;
                          return (
                            <SelectItem key={year} value={String(year)}>
                              {year}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>

                    {/* Month Dropdown */}
                    <Select
                      value={
                        formData.birthdate
                          ? (() => {
                              try {
                                const date = new Date(formData.birthdate);
                                if (!isNaN(date.getTime())) {
                                  return String(date.getMonth() + 1);
                                }
                              } catch {}
                              return "";
                            })()
                          : ""
                      }
                      onValueChange={(month) => {
                        const currentDate = formData.birthdate
                          ? (() => {
                              try {
                                const d = new Date(formData.birthdate);
                                return !isNaN(d.getTime()) ? d : new Date();
                              } catch {
                                return new Date();
                              }
                            })()
                          : new Date();
                        const year = currentDate.getFullYear() || new Date().getFullYear();
                        const day = currentDate.getDate();
                        const daysInMonth = new Date(year, parseInt(month), 0).getDate();
                        const validDay = Math.min(day, daysInMonth);
                        const formatted = `${year}-${String(month).padStart(2, '0')}-${String(validDay).padStart(2, '0')}`;
                        handleInputChange("birthdate", formatted);
                      }}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Month" />
                      </SelectTrigger>
                      <SelectContent className="z-[100]">
                        {[
                          "January", "February", "March", "April", "May", "June",
                          "July", "August", "September", "October", "November", "December"
                        ].map((month, index) => (
                          <SelectItem key={index + 1} value={String(index + 1)}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Day Dropdown */}
                    <Select
                      value={
                        formData.birthdate
                          ? (() => {
                              try {
                                const date = new Date(formData.birthdate);
                                if (!isNaN(date.getTime())) {
                                  return String(date.getDate());
                                }
                              } catch {}
                              return "";
                            })()
                          : ""
                      }
                      onValueChange={(day) => {
                        const currentDate = formData.birthdate
                          ? (() => {
                              try {
                                const d = new Date(formData.birthdate);
                                return !isNaN(d.getTime()) ? d : new Date();
                              } catch {
                                return new Date();
                              }
                            })()
                          : new Date();
                        const year = currentDate.getFullYear() || new Date().getFullYear();
                        const month = currentDate.getMonth() + 1 || 1;
                        const formatted = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        handleInputChange("birthdate", formatted);
                      }}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Day" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px] z-[100]">
                        {(() => {
                          const currentDate = formData.birthdate
                            ? (() => {
                                try {
                                  const d = new Date(formData.birthdate);
                                  return !isNaN(d.getTime()) ? d : new Date();
                                } catch {
                                  return new Date();
                                }
                              })()
                            : new Date();
                          const year = currentDate.getFullYear() || new Date().getFullYear();
                          const month = currentDate.getMonth() + 1 || 1;
                          const daysInMonth = new Date(year, month, 0).getDate();
                          return Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
                            <SelectItem key={day} value={String(day)}>
                              {day}
                            </SelectItem>
                          ));
                        })()}
                      </SelectContent>
                    </Select>
                  </div>
                  {formData.birthdate && (
                    <p className="text-xs text-gray-500 mt-1">
                      {(() => {
                        try {
                          const date = new Date(formData.birthdate);
                          if (!isNaN(date.getTime())) {
                            const today = new Date();
                            const age = today.getFullYear() - date.getFullYear();
                            const monthDiff = today.getMonth() - date.getMonth();
                            const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate()) 
                              ? age - 1 
                              : age;
                            return `Age: ${actualAge} years old`;
                          }
                        } catch {}
                        return "";
                      })()}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Venus size={14} className={theme.accentText600} />
                    Gender *
                  </label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) =>
                      handleInputChange("gender", value)
                    }
                  >
                    <SelectTrigger className="h-11 border-2 focus:border-emerald-500">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent className="z-[100]">
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                      <SelectItem value="Prefer not to say">
                        Prefer not to say
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Bio *
                  </label>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    className="resize-none border-2 focus:border-emerald-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-5">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-200/50">
                <div className={`p-2 rounded-xl ${isAdmin ? "bg-blue-50" : "bg-sky-50"}`}>
                  <Phone className={`h-5 w-5 ${isAdmin ? "text-blue-600" : "text-sky-600"}`} />
                </div>
                <h3 className="font-bold text-lg text-gray-900">
                  Contact Information
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Phone size={14} className="text-blue-600" />
                    Phone
                  </label>
                  <Input
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      handleInputChange("phoneNumber", e.target.value)
                    }
                    placeholder="+1234567890"
                    type="tel"
                    className="w-full h-11 border-2 focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <MessageSquare size={14} className="text-emerald-600" />
                    Messenger URL
                  </label>
                  <Input
                    value={formData.messengerUrl}
                    onChange={(e) =>
                      handleInputChange("messengerUrl", e.target.value)
                    }
                    placeholder="https://m.me/username"
                    type="url"
                    className="w-full h-11 border-2 focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Facebook size={14} className="text-blue-600" />
                    Facebook URL
                  </label>
                  <Input
                    value={formData.facebookUrl}
                    onChange={(e) =>
                      handleInputChange("facebookUrl", e.target.value)
                    }
                    placeholder="https://facebook.com/username"
                    type="url"
                    className="w-full h-11 border-2 focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end pt-6 border-t border-gray-200/50">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
                className="px-6 font-semibold border-2 hover:bg-gray-50 transition-all duration-300"
              >
                <X size={16} className="mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className={`gap-2 bg-gradient-to-r ${theme.buttonGradientFrom} ${theme.buttonGradientTo} hover:brightness-110 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 font-semibold`}
              >
                {isLoading ? (
                  <>
                    <motion.div
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Password Reset Modal */}
      <Dialog
        open={isPasswordResetModalOpen}
        onOpenChange={setIsPasswordResetModalOpen}
      >
        <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-xl border-white/50 shadow-2xl">
          <DialogHeader className="pb-4 border-b border-gray-200/50">
            <DialogTitle className="flex items-center gap-3 text-xl font-bold">
              <div className={`p-2 rounded-xl ${theme.accentBg50}`}>
                <Key className={`h-5 w-5 ${theme.accentText600}`} />
              </div>
              Reset Password
            </DialogTitle>
            <DialogDescription className="text-base mt-2">
              We will send a password reset link to your email address.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 pt-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200/50 shadow-sm">
              <p className="text-sm font-semibold text-gray-700 mb-1">Email Address</p>
              <p className="text-base text-gray-900 font-medium">{user.email}</p>
            </div>

            {!canRequestPasswordReset() && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-bold text-amber-900 mb-1">Rate Limit Active</h4>
                    <p className="text-sm text-amber-800 mb-2">
                      For security reasons, you can only request a password reset once every 3 days.
                    </p>
                    {resetCooldown && (
                      <div className="mt-2 p-2 rounded-lg bg-white/60 border border-amber-200">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-amber-600" />
                          <span className="font-semibold text-amber-700">
                            Try again in: {formatTimeRemaining(resetCooldown)}
                          </span>
                        </div>
                      </div>
                    )}
                    {user.lastPasswordChange && (
                      <p className="text-xs text-amber-700 mt-2">
                        Last changed: {formatDateTime(user.lastPasswordChange)}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            <div className="flex gap-3 justify-end pt-2">
              <Button
                variant="outline"
                onClick={() => setIsPasswordResetModalOpen(false)}
                className="px-6 font-semibold border-2"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePasswordReset}
                disabled={!canRequestPasswordReset() || isResettingPassword}
                className={`gap-2 bg-gradient-to-r ${theme.buttonGradientFrom} ${theme.buttonGradientTo} hover:brightness-110 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 font-semibold disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isResettingPassword ? (
                  <>
                    <motion.div
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Sending...
                  </>
                ) : (
                  <>
                    <Key size={16} />
                    Send Reset Link
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
};

export default AccountProfile;
