import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import { FaUser, FaEnvelope, FaPhone, FaFacebook, FaComment, FaCreditCard, FaMoneyBillWave, FaCog, FaEdit, FaSave, FaCamera } from "react-icons/fa";
import { v4 as uuidv4 } from 'uuid';
import { supabase } from "@/lib/supabaseClient";


// Define TypeScript interfaces
interface UserProfile {
  userId: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
}

interface UserContactInfo {
  userId: string;
  phoneNumber: string | null;
  messengerUrl: string | null;
  facebookUrl: string | null;
}

interface User {
  id: string;
  email: string;
  role: string;
  isVerified: boolean;
  isDisabled: boolean;
  UserProfile: UserProfile | null;
  ContactInfo: UserContactInfo | null;
}

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState("account");
  const [userData, setUserData] = useState<User>({
    id: "",
    email: "",
    role: "",
    isVerified: false,
    isDisabled: false,
    UserProfile: null,
    ContactInfo: null
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [messenger, setMessenger] = useState("");
  const [facebook, setFacebook] = useState("");

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/landlord/settings/get-profile", {
          withCredentials: true,
        });
        const user = res.data;
        setUserData(user);
        setFirstName(user.UserProfile?.firstName || "");
        setLastName(user.UserProfile?.lastName || "");
        setPhone(user.ContactInfo?.phoneNumber || "");
        setMessenger(user.ContactInfo?.messengerUrl || "");
        setFacebook(user.ContactInfo?.facebookUrl || "");
        
        // Set avatar preview if exists
        if (user.UserProfile?.avatarUrl) {
          setAvatarPreview(user.UserProfile.avatarUrl);
        }
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Handle avatar selection
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Delete oldest avatar in user's folder
  const deleteOldestAvatar = async (folderPath: string) => {
    try {
      // List all files in user's avatar folder
      const { data: files, error: listError } = await supabase.storage
        .from('rentease-images')
        .list(folderPath, {
          sortBy: { column: 'created_at', order: 'asc' },
          limit: 100
        });

      if (listError) throw listError;

      // If there are files, delete the oldest one
      if (files && files.length > 0) {
        const oldestFile = files[0];
        const { error: deleteError } = await supabase.storage
          .from('rentease-images')
          .remove([`${folderPath}/${oldestFile.name}`]);

        if (deleteError) {
          console.error("Error deleting oldest avatar:", deleteError);
        } else {
          console.log(`Deleted oldest avatar: ${oldestFile.name}`);
        }
      }
    } catch (err) {
      console.error("Failed to clean up old avatars:", err);
    }
  };

  // Upload avatar to Supabase
  const uploadAvatar = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const folderPath = `user/${userData.id}/photos`;
    
    // Delete oldest avatar before uploading new one
    await deleteOldestAvatar(folderPath);

    const filePath = `${folderPath}/${fileName}`;
    
    const { error } = await supabase.storage
      .from('rentease-images')
      .upload(filePath, file);
    
    if (error) {
      console.error("Error uploading avatar:", error);
      throw error;
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('rentease-images')
      .getPublicUrl(filePath);
    
    return publicUrl;
  };

  // Save profile to backend
  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      let newAvatarUrl = userData.UserProfile?.avatarUrl || null;
      
      // Upload new avatar if selected
      if (avatarFile) {
        newAvatarUrl = await uploadAvatar(avatarFile);
      }
      
     // Prepare FLAT updated data (corrected structure)
    const updatedData = {
      firstName: firstName || null,
      lastName: lastName || null,
      avatarUrl: newAvatarUrl,
      phoneNumber: phone || null,
      messengerUrl: messenger || null,
      facebookUrl: facebook || null
    };
      
      // Send to backend
      await axios.patch(
        "http://localhost:4000/api/landlord/settings/edit-profile",
        updatedData,
        { withCredentials: true }
      );
      
      // Update local state
      setUserData(prev => ({
        ...prev,
        UserProfile: {
          ...prev.UserProfile!,
          firstName: firstName || null,
          lastName: lastName || null,
          avatarUrl: newAvatarUrl
        },
        ContactInfo: {
          ...prev.ContactInfo!,
          phoneNumber: phone || null,
          messengerUrl: messenger || null,
          facebookUrl: facebook || null
        }
      }));
      
      // Reset file state
      setAvatarFile(null);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to save profile:", err);
      alert("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Helper function to display empty values
  const displayValue = (value: string | null | undefined, fallback = "Not provided") => {
    return value ? value : fallback;
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-8 text-center text-gray-600">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64">
          <div className="bg-white rounded-xl shadow-md p-6 sticky top-8">
            <div className="flex items-center gap-4 mb-8">
              {userData.UserProfile?.avatarUrl ? (
                <img 
                  src={userData.UserProfile.avatarUrl} 
                  alt="Profile" 
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
              )}
              <div>
                <h2 className="font-bold text-lg">
                  {displayValue(userData.UserProfile?.firstName)} {displayValue(userData.UserProfile?.lastName)}
                </h2>
                <p className="text-gray-600 text-sm">{userData.email}</p>
                <p className="text-xs text-gray-500 capitalize">{userData.role.toLowerCase()}</p>
              </div>
            </div>
            
            <nav className="space-y-2">
              <button
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left ${
                  activeTab === "account" 
                    ? "bg-blue-50 text-blue-600 font-medium" 
                    : "text-gray-600 hover:bg-gray-50"
                }`}
                onClick={() => setActiveTab("account")}
              >
                <FaUser className="text-lg" />
                <span>Account</span>
              </button>
              
              <button
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left ${
                  activeTab === "applications" 
                    ? "bg-blue-50 text-blue-600 font-medium" 
                    : "text-gray-600 hover:bg-gray-50"
                }`}
                onClick={() => setActiveTab("applications")}
              >
                <FaEnvelope className="text-lg" />
                <span>Applications</span>
              </button>
              
              <button
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left ${
                  activeTab === "billing" 
                    ? "bg-blue-50 text-blue-600 font-medium" 
                    : "text-gray-600 hover:bg-gray-50"
                }`}
                onClick={() => setActiveTab("billing")}
              >
                <FaCreditCard className="text-lg" />
                <span>Notifications</span>
              </button>
              
              <button
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left ${
                  activeTab === "payments" 
                    ? "bg-blue-50 text-blue-600 font-medium" 
                    : "text-gray-600 hover:bg-gray-50"
                }`}
                onClick={() => setActiveTab("payments")}
              >
                <FaMoneyBillWave className="text-lg" />
                <span>Rent Payments</span>
              </button>
            </nav>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1">
          {/* Account Section */}
          {activeTab === "account" && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Account Settings</h1>
                {isEditing ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                      disabled={saving}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
                      disabled={saving}
                    >
                      <FaSave /> {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <FaEdit /> Edit Profile
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Personal Info */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
                    <FaUser className="text-blue-500" /> Personal Information
                  </h2>
                  
                  <div className="space-y-4">
                    {isEditing ? (
                      <>
                        {/* Avatar Upload */}
                        <div className="flex items-center gap-6">
                          <div className="relative">
                            {avatarPreview ? (
                              <img 
                                src={avatarPreview} 
                                alt="Avatar preview" 
                                className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
                              />
                            ) : (
                              <div className="bg-gray-200 border-2 border-dashed rounded-full w-24 h-24" />
                            )}
                            <button
                              type="button"
                              onClick={triggerFileInput}
                              className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md border border-gray-300 hover:bg-gray-100"
                            >
                              <FaCamera className="text-gray-700" />
                            </button>
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleAvatarChange}
                              accept="image/*"
                              className="hidden"
                            />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-2">Upload a profile picture</p>
                            <p className="text-xs text-gray-500">
                              JPG, PNG or GIF. Max size 2MB
                            </p>
                          </div>
                        </div>
                        
                        {/* Name Fields */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                          <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                          <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                          <input
                            type="email"
                            value={userData.email}
                            disabled
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                          />
                          <p className="text-sm text-gray-500 mt-1">Contact support to change your email</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between py-3 border-b">
                          <span className="text-gray-600">First Name</span>
                          <span className="font-medium">{displayValue(userData.UserProfile?.firstName)}</span>
                        </div>
                        <div className="flex justify-between py-3 border-b">
                          <span className="text-gray-600">Last Name</span>
                          <span className="font-medium">{displayValue(userData.UserProfile?.lastName)}</span>
                        </div>
                        <div className="flex justify-between py-3 border-b">
                          <span className="text-gray-600">Email Address</span>
                          <span className="font-medium">{userData.email}</span>
                        </div>
                        <div className="flex justify-between py-3 border-b">
                          <span className="text-gray-600">Account Role</span>
                          <span className="font-medium capitalize">{userData.role.toLowerCase()}</span>
                        </div>
                        <div className="flex justify-between py-3 border-b">
                          <span className="text-gray-600">Account Status</span>
                          <span className="font-medium">
                            {userData.isVerified 
                              ? <span className="text-green-600">Verified</span> 
                              : <span className="text-yellow-600">Pending Verification</span>}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Contact Info */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
                    <FaPhone className="text-blue-500" /> Contact Information
                  </h2>
                  
                  <div className="space-y-4">
                    {isEditing ? (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="+1 (555) 123-4567"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Messenger URL</label>
                          <input
                            type="url"
                            value={messenger}
                            onChange={(e) => setMessenger(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="https://m.me/username"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Facebook Profile</label>
                          <input
                            type="url"
                            value={facebook}
                            onChange={(e) => setFacebook(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="https://facebook.com/username"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-4 py-3 border-b">
                          <div className="bg-blue-100 p-3 rounded-full">
                            <FaPhone className="text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Phone Number</p>
                            <p className="font-medium">
                              {displayValue(userData.ContactInfo?.phoneNumber)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 py-3 border-b">
                          <div className="bg-blue-100 p-3 rounded-full">
                            <FaComment className="text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Messenger</p>
                            <p className="font-medium">
                              {userData.ContactInfo?.messengerUrl ? (
                                <a 
                                  href={userData.ContactInfo.messengerUrl} 
                                  className="text-blue-600 hover:underline"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Messenger Profile
                                </a>
                              ) : "Not provided"}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 py-3 border-b">
                          <div className="bg-blue-100 p-3 rounded-full">
                            <FaFacebook className="text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Facebook Profile</p>
                            <p className="font-medium">
                              {userData.ContactInfo?.facebookUrl ? (
                                <a 
                                  href={userData.ContactInfo.facebookUrl} 
                                  className="text-blue-600 hover:underline"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Facebook Profile
                                </a>
                              ) : "Not provided"}
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Security Section */}
              <div className="mt-12">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
                  <FaCog className="text-blue-500" /> Security
                </h2>
                
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h3 className="font-medium text-gray-800">Two-Factor Authentication</h3>
                      <p className="text-gray-600 text-sm mt-1">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
                      Enable 2FA
                    </button>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h3 className="font-medium text-gray-800">Change Password</h3>
                      <p className="text-gray-600 text-sm mt-1">
                        Update your account password
                      </p>
                    </div>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Change Password
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Applications Section */}
          {activeTab === "applications" && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-6">Applications</h1>
              <div className="text-center py-12 text-gray-500">
                <p>No rental applications found</p>
                <p className="text-sm mt-2">Your rental applications will appear here</p>
              </div>
            </div>
          )}
          
          {/* Billing Section */}
          {activeTab === "billing" && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-6">Billing Information</h1>
              <div className="text-center py-12 text-gray-500">
                <p>No billing information available</p>
                <p className="text-sm mt-2">Your billing details will appear here</p>
              </div>
            </div>
          )}
          
          {/* Rent Payments Section */}
          {activeTab === "payments" && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-6">Rent Payments</h1>
              <div className="text-center py-12 text-gray-500">
                <p>No payment history found</p>
                <p className="text-sm mt-2">Your rent payment history will appear here</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;