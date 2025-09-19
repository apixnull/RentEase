import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  User, Mail, Shield, Phone, MessageSquare, Facebook, MessageCircle,
  Calendar, Venus, Edit3, Key
} from "lucide-react";

type UserInfo = {
  id: string;
  email: string;
  role: string;
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
  birthdate?: string | null;
  gender?: string | null;
  bio?: string | null;
  phoneNumber?: string | null;
  messengerUrl?: string | null;
  facebookUrl?: string | null;
  whatsappUrl?: string | null;
  isVerified: boolean;
  isDisabled: boolean;
  lastLogin?: string | null;
  lastPasswordChange?: string | null;
  hasSeenOnboarding: boolean;
};

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

// Keeping time formatter for potential use; comment to avoid linter warning
// const formatDateTime = (iso?: string | null) => {
//   if (!iso) return "—";
//   try {
//     const d = new Date(iso);
//     return d.toLocaleString();
//   } catch {
//     return "—";
//   }
// };

const initialsOf = (first?: string | null, last?: string | null) => {
  const f = (first?.[0] ?? "").toUpperCase();
  const l = (last?.[0] ?? "").toUpperCase();
  return (f + l) || "U";
};

const AccountProfile = () => {
  // Mocked user data for design-only rendering
  const user: UserInfo = {
    id: "mock-user-id",
    email: "jane.doe@example.com",
    role: "ADMIN",
    firstName: "Jane",
    middleName: "A.",
    lastName: "Doe",
    avatarUrl: "",
    birthdate: new Date("1996-07-15").toISOString(),
    gender: "Female",
    bio: "Loves cozy apartments and plants. Passionate about sustainable living and interior design.",
    phoneNumber: "+1 555-123-4567",
    messengerUrl: "https://m.me/janedoe",
    facebookUrl: "https://facebook.com/janedoe",
    whatsappUrl: "https://wa.me/15551234567",
    isVerified: true,
    isDisabled: false,
    lastLogin: new Date().toISOString(),
    lastPasswordChange: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    hasSeenOnboarding: true,
  };

  const [emailForReset] = useState<string>(user.email);
  const [isEditing, setIsEditing] = useState(false);

  // Role-based theming to match Admin layout colors when role is ADMIN
  const isAdmin = (user.role || "").toUpperCase() === "ADMIN";
  const theme = {
    // gradients
    gradientStrongFrom: isAdmin ? "from-purple-600" : "from-emerald-600",
    gradientStrongTo: isAdmin ? "to-blue-600" : "to-sky-600",
    gradientMidFrom: isAdmin ? "from-purple-500" : "from-emerald-500",
    gradientMidTo: isAdmin ? "to-blue-500" : "to-sky-500",
    gradientSoftFrom: isAdmin ? "from-purple-100" : "from-emerald-100",
    gradientSoftTo: isAdmin ? "to-blue-100" : "to-sky-100",
    // accents
    accentBg50: isAdmin ? "bg-purple-50" : "bg-emerald-50",
    accentText600: isAdmin ? "text-purple-600" : "text-emerald-600",
    accentText700: isAdmin ? "text-purple-700" : "text-emerald-700",
    accentText800: isAdmin ? "text-purple-800" : "text-emerald-800",
    accentBorder200: isAdmin ? "border-purple-200" : "border-emerald-200",
    accentHoverBg50: isAdmin ? "hover:bg-purple-50" : "hover:bg-emerald-50",
  } as const;

  const onRequestPasswordReset = () => {
    if (!emailForReset) return toast.error("Email is required");
    // Design-only: no backend call
    toast.success("Password reset link sent to " + emailForReset);
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      toast.success("Profile updated successfully");
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 md:space-y-8 max-w-6xl mx-auto">
      {/* Header Section */}
       <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 shadow-lg">
        <div className="absolute inset-0 pointer-events-none">
          <div className={`absolute -top-20 -right-20 w-64 h-64 rounded-full bg-gradient-to-r ${theme.gradientSoftFrom} ${theme.gradientSoftTo} blur-2xl opacity-70`} />
          <div className={`absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-gradient-to-r ${theme.gradientSoftFrom} ${theme.gradientSoftTo} blur-3xl opacity-70`} />
        </div>
        
        <div className="relative p-6 flex flex-col sm:flex-row items-center gap-6">
           <div className="relative">
            <Avatar className="h-24 w-24 ring-4 ring-white shadow-lg">
              <AvatarImage src={user.avatarUrl || undefined} alt="avatar" />
              <AvatarFallback className={`bg-gradient-to-br ${theme.gradientMidFrom} ${theme.gradientMidTo} text-white text-xl font-semibold`}>
                {initialsOf(user.firstName, user.lastName)}
              </AvatarFallback>
            </Avatar>
          </div>
          
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{user.firstName} {user.lastName}</h1>
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Mail size={14} />
                <span>{user.email}</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-gray-400"></div>
              <div className="text-sm text-gray-600 capitalize">{user.role.toLowerCase()}</div>
            </div>
            <p className="mt-2 text-gray-600 max-w-xl">Manage your personal information and account security.</p>
          </div>
          
           <div className="flex gap-2 flex-wrap justify-center">
            <Button 
              onClick={toggleEdit}
              className={`gap-2 bg-gradient-to-r ${theme.gradientStrongFrom} ${theme.gradientStrongTo} hover:brightness-110 shadow-md text-white`}
            >
              <Edit3 size={16} />
              {isEditing ? "Save Changes" : "Edit Profile"}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6">
        {/* Profile Details Card */}
         <div className="bg-white rounded-2xl border border-gray-200 p-5 md:p-6 space-y-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${theme.accentBg50}`}>
                <User className={`h-5 w-5 ${theme.accentText600}`} />
              </div>
              <h2 className="font-semibold text-gray-900 text-lg">Profile Details</h2>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">First Name</label>
              <div className={`px-4 py-3 rounded-xl ${isEditing ? `${theme.accentBg50} border ${theme.accentBorder200}` : "bg-gray-50"} text-gray-900`}>
                {user.firstName || "—"}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Middle Name</label>
              <div className={`px-4 py-3 rounded-xl ${isEditing ? `${theme.accentBg50} border ${theme.accentBorder200}` : "bg-gray-50"} text-gray-900`}>
                {user.middleName || "—"}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Last Name</label>
              <div className={`px-4 py-3 rounded-xl ${isEditing ? `${theme.accentBg50} border ${theme.accentBorder200}` : "bg-gray-50"} text-gray-900`}>
                {user.lastName || "—"}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                <Calendar size={14} />
                Birthdate
              </label>
              <div className={`px-4 py-3 rounded-xl ${isEditing ? `${theme.accentBg50} border ${theme.accentBorder200}` : "bg-gray-50"} text-gray-900`}>
                {formatDate(user.birthdate)}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                <Venus size={14} />
                Gender
              </label>
              <div className={`px-4 py-3 rounded-xl ${isEditing ? `${theme.accentBg50} border ${theme.accentBorder200}` : "bg-gray-50"} text-gray-900`}>
                {user.gender || "—"}
              </div>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium text-gray-500">Bio</label>
              <div className={`px-4 py-3 rounded-xl ${isEditing ? `${theme.accentBg50} border ${theme.accentBorder200}` : "bg-gray-50"} text-gray-900 min-h-[48px]`}>
                {user.bio || "—"}
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info Card */}
         <div className="bg-white rounded-2xl border border-gray-200 p-5 md:p-6 space-y-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isAdmin ? "bg-blue-50" : "bg-sky-50"}`}>
                <Phone className={`h-5 w-5 ${isAdmin ? "text-blue-600" : "text-sky-600"}`} />
              </div>
              <h2 className="font-semibold text-gray-900 text-lg">Contact Info</h2>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                <Phone size={14} />
                Phone
              </label>
              {user.phoneNumber ? (
                <a
                  href={`tel:${user.phoneNumber}`}
                  className={`block px-4 py-3 rounded-xl ${isEditing ? `${theme.accentBg50} border ${theme.accentBorder200}` : "bg-gray-50"} ${theme.accentText700} hover:${theme.accentText800} ${theme.accentHoverBg50} transition truncate`}
                >
                   {user.phoneNumber}
                 </a>
               ) : (
                <div className={`px-4 py-3 rounded-xl ${isEditing ? `${theme.accentBg50} border ${theme.accentBorder200}` : "bg-gray-50"} text-gray-900 truncate`}>—</div>
               )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                <MessageSquare size={14} />
                Messenger
              </label>
              {user.messengerUrl ? (
                <a
                  href={user.messengerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block px-4 py-3 rounded-xl ${isEditing ? `${isAdmin ? "bg-blue-50 border border-blue-200" : "bg-emerald-50 border border-emerald-200"}` : "bg-gray-50"} ${isAdmin ? "text-blue-700 hover:text-blue-800 hover:bg-blue-50" : "text-sky-700 hover:text-sky-800 hover:bg-sky-50"} transition truncate`}
                >
                   {user.messengerUrl}
                 </a>
               ) : (
                <div className={`px-4 py-3 rounded-xl ${isEditing ? `${theme.accentBg50} border ${theme.accentBorder200}` : "bg-gray-50"} text-gray-900 truncate`}>—</div>
               )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                <Facebook size={14} />
                Facebook
              </label>
              {user.facebookUrl ? (
                <a
                  href={user.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block px-4 py-3 rounded-xl ${isEditing ? `${isAdmin ? "bg-blue-50 border border-blue-200" : "bg-emerald-50 border border-emerald-200"}` : "bg-gray-50"} ${isAdmin ? "text-blue-700 hover:text-blue-800 hover:bg-blue-50" : "text-sky-700 hover:text-sky-800 hover:bg-sky-50"} transition truncate`}
                >
                   {user.facebookUrl}
                 </a>
               ) : (
                <div className={`px-4 py-3 rounded-xl ${isEditing ? `${theme.accentBg50} border ${theme.accentBorder200}` : "bg-gray-50"} text-gray-900 truncate`}>—</div>
               )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                <MessageCircle size={14} />
                WhatsApp
              </label>
              {user.whatsappUrl ? (
                <a
                  href={user.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block px-4 py-3 rounded-xl ${isEditing ? `${theme.accentBg50} border ${theme.accentBorder200}` : "bg-gray-50"} ${theme.accentText700} hover:${theme.accentText800} ${theme.accentHoverBg50} transition truncate`}
                >
                   {user.whatsappUrl}
                 </a>
               ) : (
                <div className={`px-4 py-3 rounded-xl ${isEditing ? `${theme.accentBg50} border ${theme.accentBorder200}` : "bg-gray-50"} text-gray-900 truncate`}>—</div>
               )}
            </div>
          </div>
        </div>

        {/* Account & Security Card */}
         <div className="bg-white rounded-2xl border border-gray-200 p-5 md:p-6 space-y-5 shadow-sm hover:shadow-md transition-shadow lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`bg-gradient-to-r ${isAdmin ? "from-purple-50 to-blue-50" : "from-emerald-50 to-sky-50"} p-2 rounded-lg`}> 
                <Shield className={`h-5 w-5 ${theme.accentText600}`} />
              </div>
              <h2 className="font-semibold text-gray-900 text-lg">Account & Security</h2>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Email</label>
                <div className="px-4 py-3 rounded-xl bg-gray-50 text-gray-900 flex items-center justify-between">
                  {user.email}
                  {user.isVerified ? (
                     <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">Verified</span>
                   ) : (
                     <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full font-medium">Unverified</span>
                   )}
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Role</label>
                <div className="px-4 py-3 rounded-xl bg-gray-50 text-gray-900 capitalize">{user.role.toLowerCase()}</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Last Login</label>
                 <div className="px-4 py-3 rounded-xl bg-gray-50 text-gray-900">{formatDate(user.lastLogin)}</div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Last Password Change</label>
                 <div className="px-4 py-3 rounded-xl bg-gray-50 text-gray-900">{formatDate(user.lastPasswordChange)}</div>
              </div>
            </div>
          </div>
          
          <div className="pt-5 border-t border-gray-200">
            <Button 
              onClick={onRequestPasswordReset} 
              variant="outline"
              className={`gap-2 ${theme.accentBorder200 ? `border ${theme.accentBorder200}` : ""} ${theme.accentText700} ${theme.accentHoverBg50}`}
            >
               <Key size={16} />
               Send Password Reset
             </Button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AccountProfile;