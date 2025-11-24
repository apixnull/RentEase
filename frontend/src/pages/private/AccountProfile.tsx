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
} from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
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

  const handlePasswordReset = async () => {
    if (!user.email) {
      toast.error("Email is required");
      return;
    }

    try {
      await forgotPasswordRequest({ email: user.email });
      toast.success("Password reset link sent to " + user.email);
      setIsPasswordResetModalOpen(false);
    } catch (error: any) {
      console.error("Error sending password reset email:", error);
      toast.error(
        error.response?.data?.message || "Failed to send password reset email"
      );
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
    <div className="min-h-screen p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <HeaderComponent
        title="Account Profile"
        description="Manage your personal information, account settings, and security preferences"
        icon={UserCircle}
        actions={
          <Button
            onClick={openEditModal}
            className={`gap-2 bg-gradient-to-r ${theme.buttonGradientFrom} ${theme.buttonGradientTo} hover:brightness-110 shadow-md text-white`}
          >
            <Edit3 size={16} />
            Edit Profile
          </Button>
        }
      />

      {/* Profile Overview Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg"
      >
        <div className="absolute inset-0 pointer-events-none">
          <div
            className={`absolute -top-20 -right-20 w-64 h-64 rounded-full bg-gradient-to-r ${theme.headerGradientFrom} ${theme.headerGradientTo} blur-2xl opacity-20`}
          />
          <div
            className={`absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-gradient-to-r ${theme.headerGradientFrom} ${theme.headerGradientTo} blur-3xl opacity-20`}
          />
        </div>

        <div className="relative p-6 md:p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative flex-shrink-0">
              <Avatar className="h-32 w-32 ring-4 ring-white shadow-xl">
                <AvatarImage src={user.avatarUrl || undefined} alt="avatar" />
                <AvatarFallback
                  className={`bg-gradient-to-br ${theme.iconGradientFrom} ${theme.iconGradientTo} text-white text-3xl font-bold`}
                >
                  {initialsOf(user.firstName, user.lastName)}
                </AvatarFallback>
              </Avatar>
              {user.isVerified && (
                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-2 shadow-lg border-2 border-white">
                  <BadgeCheck className="h-5 w-5 text-white" />
                </div>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left space-y-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {user.firstName} {user.lastName}
                </h1>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail size={16} />
                    <span className="font-medium">{user.email}</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                        isAdmin
                          ? "bg-purple-100 text-purple-700"
                          : isLandlord
                          ? "bg-blue-100 text-blue-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {user.role.toLowerCase()}
                    </span>
                  </div>
                </div>
              </div>

              {user.bio && (
                <div className="pt-2">
                  <p className="text-gray-700 max-w-2xl text-sm leading-relaxed">
                    {user.bio}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Profile Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg ${theme.accentBg50}`}>
              <User className={`h-5 w-5 ${theme.accentText600}`} />
            </div>
            <h2 className="font-semibold text-gray-900 text-lg">
              Profile Details
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                First Name
              </label>
              <div className="px-4 py-3 rounded-xl bg-gray-50 text-gray-900 font-medium">
                {user.firstName || "—"}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Middle Name
              </label>
              <div className="px-4 py-3 rounded-xl bg-gray-50 text-gray-900">
                {user.middleName || "—"}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Last Name
              </label>
              <div className="px-4 py-3 rounded-xl bg-gray-50 text-gray-900 font-medium">
                {user.lastName || "—"}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                <Calendar size={12} />
                Birthdate
              </label>
              <div className="px-4 py-3 rounded-xl bg-gray-50 text-gray-900">
                {formatDate(user.birthdate)}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                <Venus size={12} />
                Gender
              </label>
              <div className="px-4 py-3 rounded-xl bg-gray-50 text-gray-900">
                {user.gender || "—"}
              </div>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Bio
              </label>
              <div className="px-4 py-3 rounded-xl bg-gray-50 text-gray-900 min-h-[60px]">
                {user.bio || "—"}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contact Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-lg ${
                isAdmin ? "bg-blue-50" : "bg-sky-50"
              }`}
            >
              <Phone
                className={`h-5 w-5 ${
                  isAdmin ? "text-blue-600" : "text-sky-600"
                }`}
              />
            </div>
            <h2 className="font-semibold text-gray-900 text-lg">
              Contact Information
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                <Phone size={12} />
                Phone
              </label>
              {user.phoneNumber ? (
                <a
                  href={`tel:${user.phoneNumber}`}
                  className="block px-4 py-3 rounded-xl bg-gray-50 text-blue-700 hover:text-blue-800 hover:bg-blue-50 transition truncate font-medium"
                >
                  {user.phoneNumber}
                </a>
              ) : (
                <div className="px-4 py-3 rounded-xl bg-gray-50 text-gray-500">
                  —
                </div>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                <MessageSquare size={12} />
                Messenger
              </label>
              {user.messengerUrl ? (
                <a
                  href={user.messengerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-3 rounded-xl bg-gray-50 text-blue-700 hover:text-blue-800 hover:bg-blue-50 transition truncate"
                >
                  Open Messenger
                </a>
              ) : (
                <div className="px-4 py-3 rounded-xl bg-gray-50 text-gray-500">
                  —
                </div>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                <Facebook size={12} />
                Facebook
              </label>
              {user.facebookUrl ? (
                <a
                  href={user.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-3 rounded-xl bg-gray-50 text-blue-700 hover:text-blue-800 hover:bg-blue-50 transition truncate"
                >
                  Open Facebook
                </a>
              ) : (
                <div className="px-4 py-3 rounded-xl bg-gray-50 text-gray-500">
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
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5 shadow-sm hover:shadow-md transition-shadow lg:col-span-2"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg ${theme.accentBg50}`}>
              <Shield className={`h-5 w-5 ${theme.accentText600}`} />
            </div>
            <h2 className="font-semibold text-gray-900 text-lg">
              Account & Security
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                <Mail size={12} />
                Email Address
              </label>
              <div className="px-4 py-3 rounded-xl bg-gray-50 text-gray-900 flex items-center justify-between gap-2">
                <span className="truncate text-sm font-medium">{user.email}</span>
                {user.isVerified ? (
                  <span className="flex items-center gap-1 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0">
                    <CheckCircle2 size={10} />
                    Verified
                  </span>
                ) : (
                  <span className="flex items-center gap-1 bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0">
                    <XCircle size={10} />
                    Unverified
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                <Shield size={12} />
                Account Role
              </label>
              <div className="px-4 py-3 rounded-xl bg-gray-50 text-gray-900 capitalize font-semibold">
                {user.role.toLowerCase()}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                <User size={12} />
                Onboarding
              </label>
              <div className="px-4 py-3 rounded-xl bg-gray-50 flex items-center justify-between">
                <span className="text-gray-900 font-semibold">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 pt-4 border-t border-gray-200">
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                <Calendar size={14} />
                Account Created
              </label>
              <div className="px-4 py-3 rounded-xl bg-gray-50 text-gray-900 font-medium">
                {user.createdAt ? formatDateTime(user.createdAt) : "—"}
              </div>
            </div>

            {user.lastLogin && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                  <Clock size={14} />
                  Last Login
                </label>
                <div className="px-4 py-3 rounded-xl bg-gray-50 text-gray-900 font-medium">
                  {formatDateTime(user.lastLogin)}
                </div>
              </div>
            )}

            {user.lastPasswordChange && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                  <Key size={14} />
                  Last Password Change
                </label>
                <div className="px-4 py-3 rounded-xl bg-gray-50 text-gray-900 font-medium">
                  {formatDateTime(user.lastPasswordChange)}
                </div>
              </div>
            )}
          </div>

          <div className="pt-5 border-t border-gray-200">
            <Button
              onClick={() => setIsPasswordResetModalOpen(true)}
              variant="outline"
              className={`gap-2 border ${theme.accentBorder200} ${theme.accentText700} ${theme.accentHoverBg50}`}
            >
              <Key size={16} />
              Send Password Reset Link
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Edit Profile Modal */}
      <Dialog
        open={isEditProfileModalOpen}
        onOpenChange={setIsEditProfileModalOpen}
      >
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="h-5 w-5" />
              Edit Profile
            </DialogTitle>
            <DialogDescription>
              Update your personal information and contact details.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-20 w-20 ring-4 ring-white shadow-lg">
                  <AvatarImage
                    src={avatarPreviewUrl || undefined}
                    alt="avatar"
                  />
                  <AvatarFallback
                    className={`bg-gradient-to-br ${theme.iconGradientFrom} ${theme.iconGradientTo} text-white text-lg font-semibold`}
                  >
                    {initialsOf(user.firstName, user.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2">
                  <label htmlFor="avatar-upload" className="cursor-pointer">
                    <div
                      className={`p-2 rounded-full ${theme.accentBg50} shadow-md hover:shadow-lg transition-shadow`}
                    >
                      <Edit3 className={`h-4 w-4 ${theme.accentText600}`} />
                    </div>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              <div>
                <h3 className="font-medium">Profile Picture</h3>
                <p className="text-sm text-gray-500">
                  Click the pencil icon to change your avatar
                </p>
                {avatarError && (
                  <p className="text-red-500 text-xs mt-1">{avatarError}</p>
                )}
              </div>
            </div>

            {/* Profile Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">
                    First Name *
                  </label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                    placeholder="First Name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">
                    Middle Name
                  </label>
                  <Input
                    value={formData.middleName}
                    onChange={(e) =>
                      handleInputChange("middleName", e.target.value)
                    }
                    placeholder="Middle Name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">
                    Last Name *
                  </label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    placeholder="Last Name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-1.5">
                    <Calendar size={14} />
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
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                    <Venus size={14} />
                    Gender *
                  </label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) =>
                      handleInputChange("gender", value)
                    }
                  >
                    <SelectTrigger>
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
                  <label className="text-sm font-medium text-gray-500">
                    Bio *
                  </label>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    placeholder="Tell us about yourself..."
                    rows={3}
                    className="resize-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contact Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-1.5">
                    <Phone size={14} />
                    Phone
                  </label>
                  <Input
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      handleInputChange("phoneNumber", e.target.value)
                    }
                    placeholder="+1234567890"
                    type="tel"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-1.5">
                    <MessageSquare size={14} />
                    Messenger URL
                  </label>
                  <Input
                    value={formData.messengerUrl}
                    onChange={(e) =>
                      handleInputChange("messengerUrl", e.target.value)
                    }
                    placeholder="https://m.me/username"
                    type="url"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-1.5">
                    <Facebook size={14} />
                    Facebook URL
                  </label>
                  <Input
                    value={formData.facebookUrl}
                    onChange={(e) =>
                      handleInputChange("facebookUrl", e.target.value)
                    }
                    placeholder="https://facebook.com/username"
                    type="url"
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
              >
                <X size={16} className="mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className={`gap-2 bg-gradient-to-r ${theme.buttonGradientFrom} ${theme.buttonGradientTo} text-white`}
              >
                <Save size={16} />
                {isLoading ? "Saving..." : "Save Changes"}
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Reset Password
            </DialogTitle>
            <DialogDescription>
              We will send a password reset link to your email address.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-gray-50">
              <p className="text-sm text-gray-600">
                <strong>Email:</strong> {user.email}
              </p>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button
                variant="outline"
                onClick={() => setIsPasswordResetModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handlePasswordReset}
                className={`gap-2 bg-gradient-to-r ${theme.buttonGradientFrom} ${theme.buttonGradientTo} text-white`}
              >
                <Key size={16} />
                Send Reset Link
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AccountProfile;
