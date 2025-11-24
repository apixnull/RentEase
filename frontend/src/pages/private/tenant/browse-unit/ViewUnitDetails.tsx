import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import PageHeader from "@/components/PageHeader";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  MapPin, 
  Star, 
  Eye, 
  Home, 
  Bath, 
  Users, 
  Wifi, 
  Car, 
  Snowflake,
  Utensils,
  Shield,
  MessageCircle,
  Phone,
  Facebook,
  MessageSquare,
  Calendar,
  CheckCircle,
  XCircle,
  GraduationCap,
  Building2,
  ShoppingBag,
  Landmark,
  Banknote,
  Bus,
  Gamepad2,
  Church,
  ExternalLink,
  Zap,
  Building,
  Bed,
  Lock,
  Sparkles,
  UserCheck,
  DollarSign,
  Wrench,
  AlertTriangle,
  Volume2,
  Dog,
  Droplet,
  MoreHorizontal,
  Flag,
  Info,
  Edit,
  Trash2,
  User,
} from "lucide-react";
import { getSpecificListingRequest, recordUnitViewRequest, createUnitReviewRequest, updateUnitReviewRequest, deleteUnitReviewRequest } from "@/api/tenant/browseUnitApi";
import { getUserChatChannelsRequest, getChannelMessagesRequest, sendMessageRequest, sendAndCreateChannelRequest, markMessagesAsReadRequest } from "@/api/chatApi";
import { useAuthStore } from "@/stores/useAuthStore";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useSocket } from "@/hooks/useSocket";

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Types based on backend response
type Contact = {
  phoneNumber: string;
  messengerUrl: string;
  facebookUrl: string;
  whatsappUrl: string;
};

type Landlord = {
  id: string;
  fullName: string;
  avatarUrl: string;
  contact: Contact;
  email: string;
};

type UnitLeaseRule = {
  text: string;
  category: string;
};

type Amenity = {
  id: string;
  name: string;
  category: string;
};

type City = {
  id: string;
  name: string;
};

type Property = {
  id: string;
  title: string;
  type: string;
  street: string;
  barangay: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  mainImageUrl: string;
  nearInstitutions: any; // Can be an array from backend or a JSON string
  otherInformation?: Array<{ context: string; description: string }>;
  city: City;
  municipality: null | any;
};

type Unit = {
  id: string;
  label: string;
  description: string;
  floorNumber: number;
  mainImageUrl: string;
  otherImages: string[];
  unitLeaseRules: UnitLeaseRule[];
  targetPrice: number;
  securityDeposit?: number;
  requiresScreening: boolean;
  viewCount: number;
  avgRating: number | null;
  amenities: Amenity[];
  reviews: any[];
  totalReviews?: number;
};

type MessageButton = {
  available: boolean;
  text: string;
};

type ListingDetails = {
  id: string;
  lifecycleStatus: string;
  expiresAt: string;
  unit: Unit;
  property: Property;
  landlord: Landlord;
  messageButton: MessageButton;
};

// Simplified Inquiry Form Types
type InquiryFormData = {
  occupants: string;
  duration: string;
  moveInDate: string;
  hasPets: boolean;
  petDetails: string;
  needsParking: boolean;
  additionalNotes: string;
};

// Review Form Types
type ReviewFormData = {
  rating: number;
  comment: string;
};

// Message type
type Message = {
  id: string;
  content: string;
  createdAt: string;
  readAt: string | null;
  senderId: string;
};

// Chat Components
const ChatPopup = ({ 
  isOpen, 
  onClose, 
  landlord,
  channelId,
  currentUserId
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  landlord: Landlord;
  channelId: string | null;
  currentUserId: string;
}) => {
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = useCallback(async () => {
    if (!channelId) return;
    try {
      setLoading(true);
      const response = await getChannelMessagesRequest(channelId);
      const data = response.data;
      setMessages(data.messages || []);
      await markMessagesAsReadRequest(channelId).catch(() => {});
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  }, [channelId]);

  useEffect(() => {
    if (isOpen && channelId) {
      fetchMessages();
    } else if (isOpen && !channelId) {
      setMessages([]);
    }
  }, [isOpen, channelId, fetchMessages]);

  useEffect(() => {
    if (!socket || !channelId || !isOpen || !isConnected) return;
    socket.emit("join:channel", channelId);
    return () => {
      socket.emit("leave:channel", channelId);
    };
  }, [socket, isConnected, channelId, isOpen]);

  useEffect(() => {
    if (!socket || !channelId || !isOpen || !isConnected) return;

    const handleNewMessage = (messageData: Message & { channelId: string }) => {
      if (messageData.channelId !== channelId) return;
      setMessages((prev) => {
        const exists = prev.some((msg) => msg.id === messageData.id);
        if (exists) return prev;
        return [...prev, messageData];
      });
      if (messageData.senderId !== currentUserId) {
        markMessagesAsReadRequest(channelId).catch(() => {});
      }
    };

    socket.on("chat:message:new", handleNewMessage);

    return () => {
      socket.off("chat:message:new", handleNewMessage);
    };
  }, [socket, isConnected, channelId, currentUserId, isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    const content = newMessage.trim();
    if (!content || !channelId) return;

    try {
      setSending(true);
      await sendMessageRequest(channelId, { content });
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <Card className="w-full max-w-md h-[600px] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-4 border-b bg-gradient-to-r from-emerald-600 to-sky-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar
                src={landlord.avatarUrl}
                alt={landlord.fullName}
                className="border-2 border-white"
                size="md"
                name={landlord.fullName}
              />
              <div>
                <h3 className="font-semibold truncate max-w-[180px] sm:max-w-[220px]">{landlord.fullName}</h3>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
              <XCircle className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-gray-50">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => {
              const isUser = message.senderId === currentUserId;
              return (
                <div
                  key={message.id}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      isUser
                        ? "bg-emerald-500 text-white rounded-br-none"
                        : "bg-white border border-gray-200 rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      isUser ? "text-emerald-100" : "text-gray-500"
                    }`}>
                      {formatTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t bg-white">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !sending && sendMessage()}
              placeholder="Type your message..."
              disabled={!channelId || sending}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-sm disabled:opacity-50"
            />
            <Button 
              onClick={sendMessage} 
              disabled={!channelId || sending || !newMessage.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
            >
              {sending ? (
                <div className="h-4 w-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
              ) : (
                <MessageCircle className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Simplified Inquiry Form Component
const InquiryForm = ({
  isOpen,
  onClose,
  onSubmit,
  propertyTitle,
  unitLabel
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: InquiryFormData) => void;
  propertyTitle: string;
  unitLabel: string;
}) => {
  const [formData, setFormData] = useState<InquiryFormData>({
    occupants: "",
    duration: "",
    moveInDate: "",
    hasPets: false,
    petDetails: "",
    needsParking: false,
    additionalNotes: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      occupants: "",
      duration: "",
      moveInDate: "",
      hasPets: false,
      petDetails: "",
      needsParking: false,
      additionalNotes: ""
    });
    onClose();
  };

  const handleChange = (field: keyof InquiryFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Inquire About Property</h3>
              <p className="text-sm text-gray-600">{propertyTitle} - {unitLabel}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <XCircle className="h-5 w-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Number of Occupants *</label>
                <select
                  value={formData.occupants}
                  onChange={(e) => handleChange('occupants', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-sm"
                  required
                >
                  <option value="">Select number</option>
                  <option value="1">1 person</option>
                  <option value="2">2 people</option>
                  <option value="3">3 people</option>
                  <option value="4">4 people</option>
                  <option value="5+">5+ people</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Duration of Stay (months) *</label>
                <select
                  value={formData.duration}
                  onChange={(e) => handleChange('duration', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-sm"
                  required
                >
                  <option value="">Select duration</option>
                  <option value="1-3">1-3 months</option>
                  <option value="6">6 months</option>
                  <option value="12">12 months</option>
                  <option value="24">24 months</option>
                  <option value="24+">More than 24 months</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Desired Move-in Date</label>
                <input
                  type="date"
                  value={formData.moveInDate}
                  onChange={(e) => handleChange('moveInDate', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-sm"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="hasPets"
                    checked={formData.hasPets}
                    onChange={(e) => handleChange('hasPets', e.target.checked)}
                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="hasPets" className="text-sm font-medium text-gray-700">
                    I have pets
                  </label>
                </div>
                
                {formData.hasPets && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Pet Details</label>
                    <input
                      type="text"
                      value={formData.petDetails}
                      onChange={(e) => handleChange('petDetails', e.target.value)}
                      placeholder="e.g., 1 small dog, 2 cats..."
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-sm"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="needsParking"
                  checked={formData.needsParking}
                  onChange={(e) => handleChange('needsParking', e.target.checked)}
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="needsParking" className="text-sm font-medium text-gray-700">
                  I need parking
                </label>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Additional Notes</label>
                <textarea
                  value={formData.additionalNotes}
                  onChange={(e) => handleChange('additionalNotes', e.target.value)}
                  placeholder="Any special requirements or questions..."
                  rows={3}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-sm resize-none"
                />
              </div>
            </div>

            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
              <MessageCircle className="h-4 w-4 mr-2" />
              Send Inquiry via Chat
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
};

// Review Form Component
const ReviewForm = ({
  isOpen,
  onClose,
  onSubmit,
  unitLabel,
  existingReview
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ReviewFormData) => void;
  unitLabel: string;
  existingReview?: any;
}) => {
  const [formData, setFormData] = useState<ReviewFormData>({
    rating: 0,
    comment: "",
  });
  const [wordCount, setWordCount] = useState(0);
  const [errors, setErrors] = useState<{ rating?: string; comment?: string }>({});

  useEffect(() => {
    if (isOpen && existingReview) {
      setFormData({
        rating: existingReview.rating,
        comment: existingReview.comment || "",
      });
      const words = (existingReview.comment || "").trim().split(/\s+/).filter((w: string) => w.length > 0);
      setWordCount(words.length);
    } else if (isOpen) {
      setFormData({ rating: 0, comment: "" });
      setWordCount(0);
      setErrors({});
    }
  }, [isOpen, existingReview]);

  const handleCommentChange = (value: string) => {
    setFormData(prev => ({ ...prev, comment: value }));
    const words = value.trim().split(/\s+/).filter((w: string) => w.length > 0);
    setWordCount(words.length);
    if (errors.comment) {
      setErrors(prev => ({ ...prev, comment: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { rating?: string; comment?: string } = {};

    if (!formData.rating || formData.rating < 1 || formData.rating > 5) {
      newErrors.rating = "Please select a rating";
    }

    if (!formData.comment.trim()) {
      newErrors.comment = "Comment is required";
    } else if (wordCount > 15) {
      newErrors.comment = `Comment must contain a maximum of 15 words (currently ${wordCount})`;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
    setFormData({ rating: 0, comment: "" });
    setWordCount(0);
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">{existingReview ? "Edit Review" : "Write a Review"}</h3>
              <p className="text-sm text-gray-600">{unitLabel}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <XCircle className="h-5 w-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Rating */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Rating <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, rating: star }));
                      if (errors.rating) {
                        setErrors(prev => ({ ...prev, rating: undefined }));
                      }
                    }}
                    className={`p-2 rounded-lg transition-colors ${
                      formData.rating >= star
                        ? "bg-yellow-100 text-yellow-500"
                        : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                    }`}
                  >
                    <Star
                      className={`h-6 w-6 ${
                        formData.rating >= star ? "fill-current" : ""
                      }`}
                    />
                  </button>
                ))}
              </div>
              {errors.rating && (
                <p className="text-xs text-red-500 mt-1">{errors.rating}</p>
              )}
            </div>

            {/* Comment */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Comment <span className="text-red-500">*</span>
                <span className="text-xs font-normal text-gray-500 ml-2">
                  ({wordCount}/15 words maximum)
                </span>
              </label>
              <textarea
                value={formData.comment}
                onChange={(e) => handleCommentChange(e.target.value)}
                placeholder="Share your experience with this unit. Maximum 15 words..."
                rows={6}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-sm resize-none ${
                  errors.comment ? "border-red-300" : "border-gray-300"
                }`}
                required
              />
              {errors.comment && (
                <p className="text-xs text-red-500 mt-1">{errors.comment}</p>
              )}
              {!errors.comment && wordCount > 15 && (
                <p className="text-xs text-red-500 mt-1">
                  {wordCount - 15} word{wordCount - 15 !== 1 ? "s" : ""} over the limit
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              disabled={wordCount > 15 || wordCount === 0 || !formData.rating}
            >
              <Star className="h-4 w-4 mr-2" />
              Submit Review
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
};

// Amenity Icon Mapping
const getAmenityIcon = (amenityName: string) => {
  const iconMap: { [key: string]: any } = {
    'Aircon': Snowflake,
    'Electric Fan': Snowflake,
    'Power Backup / Generator': Shield,
    'Balcony': Home,
    'Garden / Outdoor Space': Home,
    'Refrigerator': Utensils,
    'Microwave': Utensils,
    'Dining Table': Utensils,
    'Bedframe & Mattress': Home,
    'Closet / Wardrobe': Home,
    'Private Bathroom': Bath,
    '24/7 Security': Shield,
    'CCTV': Shield,
    'Housekeeping Service': Users,
    'Wifi': Wifi,
    'Parking': Car,
    'Water Heater': Utensils,
    'Swimming Pool': Home,
    'Gym / Fitness Center': Users,
    'Parking Space': Car,
    'Stove / Cooktop': Utensils,
    'Shared Kitchen': Utensils,
    'Study Table / Desk': Home,
    'Shared Bathroom': Bath,
    'Fire Alarm System': Shield,
    'Laundry Area': Users,
  };
  
  return iconMap[amenityName] || Home;
};

// Amenity Category Icon Mapping
const getCategoryIcon = (category: string) => {
  const categoryMap: { [key: string]: any } = {
    'Utility': Zap,
    'Facility': Building,
    'Kitchen': Utensils,
    'Room Feature': Bed,
    'Security': Lock,
    'Service': Sparkles,
  };
  
  return categoryMap[category] || Home;
};

// Lease Rule Category Icon Mapping
const getLeaseRuleCategoryIcon = (category: string) => {
  const categoryMap: { [key: string]: any } = {
    'general': Home,
    'visitor': UserCheck,
    'payment': DollarSign,
    'maintenance': Wrench,
    'safety': AlertTriangle,
    'noise': Volume2,
    'pet': Dog,
    'cleaning': Droplet,
    'parking': Car,
    'other': MoreHorizontal,
  };
  
  return categoryMap[category.toLowerCase()] || Home;
};

// Format address
const formatAddress = (property: Property) => {
  return `${property.street}, ${property.barangay}, ${property.city.name}, ${property.zipCode}`;
};

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0
  }).format(amount);
};

// Institution Icon Mapping
const getInstitutionIcon = (type: string) => {
  const iconMap: { [key: string]: any } = {
    'Education': GraduationCap,
    'Healthcare': Building2,
    'Commerce': ShoppingBag,
    'Government': Landmark,
    'Finance': Banknote,
    'Transport': Bus,
    'Leisure': Gamepad2,
    'Religion': Church,
  };
  
  return iconMap[type] || Home;
};

// Google Maps URL generator
const getGoogleMapsUrl = (latitude: number, longitude: number) => {
  return `https://www.google.com/maps?q=${latitude},${longitude}`;
};

// Avatar component with placeholder
const Avatar = ({ 
  src, 
  alt, 
  className = "", 
  size = "md",
  name 
}: { 
  src?: string | null; 
  alt?: string; 
  className?: string;
  size?: "sm" | "md" | "lg";
  name?: string;
}) => {
  const [imageError, setImageError] = useState(false);
  
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-16 h-16",
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-8 w-8",
  };

  const getInitials = (name: string) => {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Reset error state when src changes
  useEffect(() => {
    if (src) {
      setImageError(false);
    }
  }, [src]);

  if (src && !imageError) {
    return (
      <img
        src={src}
        alt={alt || "Avatar"}
        className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-gray-200 flex items-center justify-center border border-gray-300 ${className}`}>
      {name ? (
        <span className={`text-gray-600 font-medium ${size === "sm" ? "text-xs" : size === "md" ? "text-sm" : "text-base"}`}>
          {getInitials(name)}
        </span>
      ) : (
        <User className={`${iconSizes[size]} text-gray-400`} />
      )}
    </div>
  );
};

const ViewUnitDetails = () => {
  const { listingId } = useParams<{ listingId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const [listing, setListing] = useState<ListingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [showInquireOptions, setShowInquireOptions] = useState(false);
  const [inquiryFormOpen, setInquiryFormOpen] = useState(false);
  const [channelId, setChannelId] = useState<string | null>(null);
  const [channelsLoading, setChannelsLoading] = useState(false);
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [editingReview, setEditingReview] = useState<any | null>(null);
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<number | null>(null);
  const [showAllReviews, setShowAllReviews] = useState(false);

  useEffect(() => {
    const fetchListingDetails = async () => {
      if (!listingId) return;
      
      try {
        setLoading(true);
        const response = await getSpecificListingRequest(listingId);
        setListing(response.data.data);
      } catch (err) {
        setError("Failed to load property details");
        console.error("Error fetching listing:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchListingDetails();
  }, [listingId]);

  // Record unit view after 20 seconds
  useEffect(() => {
    if (!listing?.unit?.id) return;

    // Wait 20 seconds, then record the view
    const timer = setTimeout(async () => {
      try {
        await recordUnitViewRequest(listing.unit.id);
      } catch (error) {
        console.error("Failed to record view:", error);
        // Silently fail - don't show error to user
      }
    }, 20000); // 20 seconds

    return () => clearTimeout(timer);
  }, [listing?.unit?.id]);

  useEffect(() => {
    if (!currentUser?.id || !listing?.landlord?.id) return;
    const abortController = new AbortController();
    let isMounted = true;
    setChannelsLoading(true);

    getUserChatChannelsRequest({ signal: abortController.signal })
      .then((response) => {
        if (!isMounted) return;
        const channels = Array.isArray(response.data) ? response.data : [];
        const existingChannel = channels.find((channel: any) =>
          (channel.tenantId === currentUser.id && channel.landlordId === listing.landlord.id) ||
          (channel.landlordId === currentUser.id && channel.tenantId === listing.landlord.id)
        );
        setChannelId(existingChannel ? existingChannel.id : null);
      })
      .catch((error) => {
        if (!isMounted || error?.name === "CanceledError") return;
        console.error("Error preloading chat channels:", error);
        setChannelId(null);
      })
      .finally(() => {
        if (isMounted) {
          setChannelsLoading(false);
        }
      });

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [currentUser?.id, listing?.landlord?.id]);

  // Check for existing channel when inquiry button is clicked
  const handleInquireClick = async () => {
    if (!currentUser || !listing || channelsLoading) return;

    if (channelId) {
      setInquiryFormOpen(false);
      setChatOpen(true);
    } else {
      setInquiryFormOpen(true);
    }
  };

  const handleInquirySubmit = async (inquiryData: InquiryFormData) => {
    if (!currentUser || !listing) return;

    const message = `Hello! I'm interested in ${listing.property.title} - ${listing.unit.label}. Here are my details:

👥 Number of Occupants: ${inquiryData.occupants || "Not specified"}
📅 Desired Duration: ${inquiryData.duration || "Not specified"} months
🗓️ Move-in Date: ${inquiryData.moveInDate || "Flexible"}
🐾 Pets: ${inquiryData.hasPets ? `Yes - ${inquiryData.petDetails || "No details provided"}` : "No"}
🚗 Parking Needed: ${inquiryData.needsParking ? "Yes" : "No"}
📝 Additional Notes: ${inquiryData.additionalNotes || "None"}

I'd like to schedule a viewing. Please let me know about availability!`;

    try {
      const response = await sendAndCreateChannelRequest({
        recipientId: listing.landlord.id,
        content: message
      });

      const newChannelId = response.data?.channelId;
      if (newChannelId) {
        setChannelId(newChannelId);
        setChatOpen(true);
        setInquiryFormOpen(false);
      }
    } catch (error) {
      console.error("Error creating channel and sending message:", error);
      setInquiryFormOpen(false);
      setChatOpen(true);
    }
  };

  const handleReviewSubmit = async (reviewData: ReviewFormData) => {
    if (!currentUser || !listing?.unit?.id) return;

    try {
      setSubmittingReview(true);
      
      if (editingReview) {
        // Update existing review
        await updateUnitReviewRequest(editingReview.id, reviewData.rating, reviewData.comment);
        toast.success("Review updated successfully!");
      } else {
        // Create new review
        await createUnitReviewRequest(listing.unit.id, reviewData.rating, reviewData.comment);
        toast.success("Review submitted successfully!");
      }
      
      // Refresh listing data to show the updated review
      const response = await getSpecificListingRequest(listingId!);
      setListing(response.data.data);
      
      setReviewFormOpen(false);
      setEditingReview(null);
    } catch (error: any) {
      console.error("Error submitting review:", error);
      toast.error(error?.response?.data?.message || "Failed to submit review. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleEditReview = (review: any) => {
    setEditingReview(review);
    setReviewFormOpen(true);
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;

    try {
      await deleteUnitReviewRequest(reviewId);
      toast.success("Review deleted successfully!");
      
      // Refresh listing data
      const response = await getSpecificListingRequest(listingId!);
      setListing(response.data.data);
    } catch (error: any) {
      console.error("Error deleting review:", error);
      toast.error(error?.response?.data?.message || "Failed to delete review. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
          {/* Header skeleton */}
          <div className="bg-white/95 border rounded-lg p-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <Skeleton className="h-7 w-28 rounded-full" />
                <div className="min-w-0 space-y-2">
                  <Skeleton className="h-5 w-64" />
                  <Skeleton className="h-4 w-80" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-6 w-24 ml-auto" />
                <Skeleton className="h-5 w-28 ml-auto" />
              </div>
            </div>
          </div>

          {/* Property image skeleton */}
          <Card className="overflow-hidden">
            <Skeleton className="w-full h-[120px]" />
            <div className="p-2 border-t bg-white flex items-center justify-between">
              <Skeleton className="h-4 w-56" />
              <Skeleton className="h-8 w-28 rounded-md" />
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6 space-y-3">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </Card>
              <Card className="p-6 space-y-4">
                <Skeleton className="h-5 w-32" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </Card>
            </div>
            {/* Right column */}
            <div className="space-y-6">
              <Card className="p-6 space-y-3">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-10 w-full rounded-md" />
              </Card>
              <Card className="p-6 space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Property Not Found</h3>
          <p className="text-gray-600 mb-4">{error || "The property you're looking for doesn't exist."}</p>
          <Link to="/tenant/browse-unit">
            <Button>Back to Browse</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const { unit, property, landlord } = listing;
  const unitImages = [unit.mainImageUrl, ...unit.otherImages].filter(Boolean);
  const categorizedRules = unit.unitLeaseRules.reduce((acc, rule) => {
    if (!acc[rule.category]) acc[rule.category] = [];
    acc[rule.category].push(rule);
    return acc;
  }, {} as Record<string, UnitLeaseRule[]>);

  const nearInstitutions = Array.isArray(property.nearInstitutions)
    ? property.nearInstitutions
    : JSON.parse(property.nearInstitutions || "[]");
  
  const totalReviews = unit.reviews?.length ?? 0;
  
  // Check if current user has already reviewed this unit
  const userReview = currentUser?.id 
    ? unit.reviews?.find((r: any) => r.tenant?.id === currentUser.id)
    : null;

  // Group amenities by category
  const categorizedAmenities = unit.amenities.reduce((acc, amenity) => {
    if (!acc[amenity.category]) acc[amenity.category] = [];
    acc[amenity.category].push(amenity);
    return acc;
  }, {} as Record<string, Amenity[]>);

  return (
    <div className="min-h-screen">
      {/* Page Header styled via shared PageHeader */}
      <div className="bg-transparent border-b">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-2">
          <PageHeader
            title={
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 min-w-0">
                <Link to="/tenant/browse-unit" className="flex-shrink-0">
                  <div
                    className="group inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/90 px-2 sm:px-3 py-1 shadow-sm hover:bg-gray-50 transition-colors"
                    role="button"
                    aria-label="Back to Browse"
                  >
                    <div className="grid h-6 w-6 sm:h-7 sm:w-7 place-items-center rounded-full text-white transition-colors bg-gradient-to-br from-emerald-400 to-sky-400 group-hover:from-emerald-500 group-hover:to-sky-500">
                      <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-gray-800 hidden sm:inline">Back</span>
                  </div>
                </Link>
                <span className="text-sm sm:text-base truncate max-w-full">{property.title} • {unit.label}</span>
              </div>
            }
            description={
              <span className="text-xs sm:text-sm">
                {formatAddress(property)} • {property.type} • Floor {unit.floorNumber}{unit.requiresScreening ? " • Screening required" : ""}
              </span>
            }
            customIcon={
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-sky-500 text-white grid place-items-center shadow-md flex-shrink-0">
                <Home className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            }
            actions={
              <div className="text-right space-y-1 mt-2 sm:mt-0">
                <div className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900">
                  {formatCurrency(unit.targetPrice)}
                  <span className="text-xs sm:text-sm font-normal text-gray-500">/month</span>
                </div>
                <div className="flex items-center justify-end gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 flex-wrap">
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="whitespace-nowrap">{unit.viewCount} views</span>
                  </div>
                  <span className="text-gray-300 hidden sm:inline">•</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400" />
                    <span className="whitespace-nowrap">{totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}</span>
                  </div>
                </div>
              </div>
            }
            className="bg-transparent"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* 1. Location and Landlord Info Section (60/40 split) */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 items-start">
          {/* Left: Location Section (60%) */}
          <Card className="lg:col-span-6 p-6">
            <h3 className="text-lg font-semibold mb-4">Location</h3>
            
            {/* Leaflet Map */}
            <div className="mb-6 rounded-lg overflow-hidden border border-gray-200" style={{ height: '300px', position: 'relative', zIndex: 0, isolation: 'isolate' }}>
              <MapContainer
                center={[property.latitude, property.longitude]}
                zoom={15}
                style={{ height: '100%', width: '100%', zIndex: 0 }}
                scrollWheelZoom={false}
                className="leaflet-container"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[property.latitude, property.longitude]}>
                  <Popup>{property.title}</Popup>
                </Marker>
              </MapContainer>
            </div>

            {/* Address */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                <h4 className="font-medium text-sm sm:text-base">Full Address</h4>
                <a
                  href={getGoogleMapsUrl(property.latitude, property.longitude)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs sm:text-sm text-emerald-600 hover:text-emerald-700 font-medium self-start sm:self-auto"
                >
                  <span className="whitespace-nowrap">Open in Google Maps</span>
                  <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                </a>
              </div>
              <p className="text-sm sm:text-base text-gray-600 flex items-start gap-2 break-words">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{formatAddress(property)}</span>
              </p>
            </div>

            {/* Nearby Institutions */}
            {nearInstitutions.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Nearby Institutions</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {nearInstitutions.map((institution: any, index: number) => {
                    const InstitutionIcon = getInstitutionIcon(institution.type);
                    return (
                      <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                        <div className="p-1.5 bg-white rounded-lg border">
                          <InstitutionIcon className="h-3 w-3 text-gray-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium">{institution.name}</div>
                          <div className="text-xs text-gray-500 capitalize">{institution.type}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>

          {/* Right: Landlord Info and Reminder Section (40%) */}
          <Card className="lg:col-span-4 p-4 sm:p-6 space-y-4 sm:space-y-5 self-start">
            {/* Anti-scam reminder (expanded) */}
            <div className="p-3 sm:p-4 rounded-lg border bg-amber-50 border-amber-200">
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-2">
                  <h4 className="font-semibold text-amber-900 text-sm sm:text-base">Reminder: Avoid Rental Scams</h4>
                  <div className="flex flex-wrap items-center gap-2">
                    <Link to="/privacy-policy" className="flex-shrink-0">
                      <Button variant="outline" size="sm" className="whitespace-nowrap text-xs h-7 px-2 sm:px-3 flex items-center gap-1.5">
                        <Info className="h-3 w-3" />
                        <span className="hidden sm:inline">Read more</span>
                        <span className="sm:hidden">Info</span>
                      </Button>
                    </Link>
                    <Button 
                      onClick={() => {
                        // Navigate to report page with listing ID
                        navigate(`/tenant/report-property?listingId=${listing.id}`);
                      }}
                      variant="outline"
                      size="sm"
                      className="whitespace-nowrap text-xs h-7 px-2 sm:px-3 flex items-center gap-1.5 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 flex-shrink-0"
                    >
                      <Flag className="h-3 w-3" />
                      <span className="hidden sm:inline">Report</span>
                      <span className="sm:hidden">Flag</span>
                    </Button>
                  </div>
                </div>
                <ul className="text-sm text-amber-800 space-y-1.5 list-disc pl-5">
                  <li>Do not send deposits or payments before an in-person viewing and signed agreement.</li>
                  <li>Verify ownership/authority to rent. Ask for valid ID and property documents.</li>
                  <li>Meet at the property location; be cautious of excuses for not meeting in person.</li>
                  <li>Use secure, traceable payment methods. Avoid wire transfers or gift cards.</li>
                  <li>Be wary of prices that are too good to be true or pressure to "pay now."</li>
                  <li>Never share personal financial information or send money to unverified accounts.</li>
                  <li>Research the landlord and property online before committing.</li>
                  <li>Trust your instincts - if something feels off, it probably is.</li>
                </ul>
              </div>
            </div>

            {/* Landlord info (larger) */}
            <div>
              <div className="flex items-center gap-4 mb-4">
                <Avatar
                  src={landlord.avatarUrl}
                  alt={landlord.fullName}
                  className="border-2 border-emerald-200"
                  size="lg"
                  name={landlord.fullName}
                />
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900 truncate text-base">{landlord.fullName}</h3>
                  <p className="text-sm text-gray-600">Property Owner</p>
                  {landlord.email && (
                    <span className="text-sm text-gray-700 break-all">{landlord.email}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2.5 mb-4">
                {landlord.contact?.phoneNumber && (
                  <a href={`tel:${landlord.contact.phoneNumber}`} className="block">
                    <Button variant="outline" size="default" className="w-full justify-start gap-2 text-sm h-10">
                      <Phone className="h-4 w-4" />
                      <span className="truncate">Call {landlord.contact.phoneNumber}</span>
                    </Button>
                  </a>
                )}
                {landlord.contact?.messengerUrl && (
                  <a href={landlord.contact.messengerUrl} target="_blank" rel="noopener noreferrer" className="block">
                    <Button variant="outline" size="default" className="w-full justify-start gap-2 text-sm h-10">
                      <MessageSquare className="h-4 w-4" />
                      Messenger
                    </Button>
                  </a>
                )}
                {landlord.contact?.facebookUrl && (
                  <a href={landlord.contact.facebookUrl} target="_blank" rel="noopener noreferrer" className="block">
                    <Button variant="outline" size="default" className="w-full justify-start gap-2 text-sm h-10">
                      <Facebook className="h-4 w-4" />
                      Facebook
                    </Button>
                  </a>
                )}
                {landlord.contact?.whatsappUrl && (
                  <a href={landlord.contact.whatsappUrl} target="_blank" rel="noopener noreferrer" className="block">
                    <Button variant="outline" size="default" className="w-full justify-start gap-2 text-sm h-10">
                      <MessageCircle className="h-4 w-4" />
                      WhatsApp
                    </Button>
                  </a>
                )}
              </div>

              <Button 
                onClick={handleInquireClick}
                disabled={channelsLoading}
                className="w-full bg-gradient-to-r from-emerald-400 to-sky-400 hover:from-emerald-500 hover:to-sky-500 text-white text-sm h-10 font-medium disabled:opacity-50"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                {channelsLoading ? "Checking..." : channelId ? "Continue Conversation" : "Inquire Now"}
              </Button>
            </div>
          </Card>
        </div>

        {/* 3. Unit Images, Description and Other Information Section */}
        <Card className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Unit Images (50%) */}
            {unitImages.length > 0 && (
              <div>
                <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                  <img
                    src={unitImages[activeImageIndex]}
                    alt={`${unit.label} - Image ${activeImageIndex + 1}`}
                    className="w-full h-96 object-cover"
                  />
                </div>
                <p className="text-sm text-gray-600 italic mt-2 mb-3">This is what the unit looks like</p>
                {unitImages.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {unitImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 ${
                          activeImageIndex === index 
                            ? 'border-emerald-500' 
                            : 'border-gray-200'
                        } overflow-hidden`}
                      >
                        <img
                          src={image}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Right: Unit Description (50%) */}
            <div>
              <h3 className="text-lg font-semibold mb-3">About this unit</h3>
              <p className="text-gray-700 mb-6">{unit.description}</p>
              
              {/* Other Information (JSON) */}
              {Array.isArray(property.otherInformation) && property.otherInformation.length > 0 && (
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-3">Other Information</h4>
                  <div className="space-y-3">
                    {property.otherInformation.map((info, idx) => (
                      <div key={idx} className="p-3 rounded-lg border border-gray-200 bg-gray-50">
                        <div className="text-sm font-medium text-gray-900">{info.context}</div>
                        <div className="text-sm text-gray-700">{info.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* 4. Amenities Section */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Amenities this unit have</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(categorizedAmenities).map(([category, amenities]) => {
              const CategoryIcon = getCategoryIcon(category);
              return (
                <div key={category} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 bg-emerald-50 rounded-lg">
                      <CategoryIcon className="h-4 w-4 text-emerald-600" />
                    </div>
                    <h4 className="font-semibold text-sm text-gray-900">{category}</h4>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {amenities.map((amenity) => {
                      const IconComponent = getAmenityIcon(amenity.name);
                      return (
                        <div key={amenity.id} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                          <div className="p-1.5 bg-white rounded-lg border">
                            <IconComponent className="h-3 w-3 text-emerald-600" />
                          </div>
                          <div className="text-xs font-medium text-gray-900">{amenity.name}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* 5. Lease Rules Section */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Lease Rules</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(categorizedRules).map(([category, rules]) => {
              const CategoryIcon = getLeaseRuleCategoryIcon(category);
              return (
                <div key={category} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 bg-emerald-50 rounded-lg">
                      <CategoryIcon className="h-4 w-4 text-emerald-600" />
                    </div>
                    <h4 className="font-semibold text-sm text-gray-900 capitalize">{category} Rules</h4>
                  </div>
                  <ul className="space-y-2">
                    {rules.map((rule, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-3 w-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>{rule.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </Card>

        {/* 6. My Review Section (if user is logged in) */}
        {currentUser && (
          <Card className="p-4 sm:p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Star className="h-5 w-5 text-gray-700" />
                My Review
              </h3>
            </div>
            
            {userReview ? (
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <Avatar
                      src={currentUser.avatarUrl}
                      alt={currentUser.firstName || "You"}
                      className="border border-gray-300"
                      size="md"
                      name={currentUser.firstName ? `${currentUser.firstName} ${currentUser.lastName || ""}`.trim() : undefined}
                    />
                    <div>
                      <div className="text-sm font-semibold text-gray-900">Your Review</div>
                      <div className="text-xs text-gray-500">
                        {new Date(userReview.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="h-4 w-4 fill-yellow-400" />
                      <span className="text-sm font-medium text-gray-800">{userReview.rating}</span>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditReview(userReview)}
                        className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteReview(userReview.id)}
                        className="h-8 w-8 p-0 text-gray-600 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                {userReview.comment && (
                  <p className="text-sm text-gray-700 break-words mt-2">{userReview.comment}</p>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-gray-600 mb-4">You haven't reviewed this unit yet.</p>
                <Button
                  onClick={() => {
                    setEditingReview(null);
                    setReviewFormOpen(true);
                  }}
                  className="bg-gray-900 hover:bg-gray-800 text-white"
                  disabled={submittingReview}
                >
                  <Star className="h-4 w-4 mr-2" />
                  Write Your Review
                </Button>
              </div>
            )}
          </Card>
        )}

        {/* 7. All Reviews Section */}
        <Card className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
            <div className="flex items-center justify-between sm:justify-start gap-3">
              <h3 className="text-lg font-semibold">All Reviews</h3>
              {unit.avgRating && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <span>{unit.avgRating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Star Rating Filter */}
          {totalReviews > 0 && (
            <div className="mb-4 pb-4 border-b">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Filter by rating:</span>
                <button
                  onClick={() => setSelectedRatingFilter(null)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedRatingFilter === null
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All
                </button>
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = unit.reviews.filter((r: any) => r.rating === rating).length;
                  return (
                    <button
                      key={rating}
                      onClick={() => setSelectedRatingFilter(rating)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                        selectedRatingFilter === rating
                          ? "bg-yellow-100 text-yellow-700 border-2 border-yellow-400"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <Star className={`h-4 w-4 ${selectedRatingFilter === rating ? "fill-yellow-500" : ""}`} />
                      <span>{rating}</span>
                      <span className="text-xs text-gray-500">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          
          {totalReviews > 0 ? (() => {
            // Filter reviews by rating (exclude user's own review from "All Reviews" since it's shown separately)
            const otherReviews = currentUser?.id 
              ? unit.reviews.filter((r: any) => r.tenant?.id !== currentUser.id)
              : unit.reviews;
            
            const filteredReviews = selectedRatingFilter !== null
              ? otherReviews.filter((r: any) => r.rating === selectedRatingFilter)
              : otherReviews;

            // Pagination: show first 6, then all if showAllReviews is true
            const displayedReviews = showAllReviews || filteredReviews.length <= 6
              ? filteredReviews
              : filteredReviews.slice(0, 6);

            return (
              <>
                <div className="space-y-4">
                  {displayedReviews.map((r: any) => {
                    const tenantFullName = r.tenant?.fullName || "Anonymous";
                    const isOwnReview = currentUser?.id && r.tenant?.id === currentUser.id;
                    
                    return (
                      <div key={r.id} className="p-3 sm:p-4 border rounded-lg bg-gray-50">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                            <Avatar
                              src={r.tenant?.avatarUrl}
                              alt={tenantFullName}
                              className="flex-shrink-0"
                              size="sm"
                              name={tenantFullName !== "Anonymous" ? tenantFullName : undefined}
                            />
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">{tenantFullName}</div>
                              <div className="text-xs text-gray-500">
                                {new Date(r.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="ml-2 inline-flex items-center gap-1 text-yellow-500 flex-shrink-0">
                              <Star className="h-4 w-4 fill-yellow-400" />
                              <span className="text-sm font-medium text-gray-800">{r.rating}</span>
                            </div>
                            {isOwnReview && (
                              <div className="flex items-center gap-1 ml-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditReview(r)}
                                  className="h-7 w-7 p-0 text-gray-600 hover:text-emerald-600"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteReview(r.id)}
                                  className="h-7 w-7 p-0 text-gray-600 hover:text-red-600"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                        {r.comment && (
                          <p className="mt-3 text-sm text-gray-700 break-words">{r.comment}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
                {!showAllReviews && filteredReviews.length > 6 && (
                  <div className="mt-4 text-center">
                    <Button
                      variant="outline"
                      onClick={() => setShowAllReviews(true)}
                      className="text-sm"
                    >
                      Show All Reviews ({filteredReviews.length})
                    </Button>
                  </div>
                )}
                {showAllReviews && filteredReviews.length > 6 && (
                  <div className="mt-4 text-center">
                    <Button
                      variant="outline"
                      onClick={() => setShowAllReviews(false)}
                      className="text-sm"
                    >
                      Show Less
                    </Button>
                  </div>
                )}
              </>
            );
          })() : (
            <div className="text-center py-8">
              <div className="text-sm text-gray-600 mb-4">
                {currentUser && userReview 
                  ? "No other reviews yet for this unit." 
                  : "No reviews yet for this unit."}
              </div>
              {!currentUser && (
                <p className="text-xs text-gray-500">Sign in to write a review</p>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Inquire Options Modal */}
      {showInquireOptions && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Contact Landlord</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowInquireOptions(false)}>
                  <XCircle className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="space-y-3">
                <Button 
                  onClick={() => {
                    setShowInquireOptions(false);
                    setInquiryFormOpen(true);
                  }}
                  className="w-full justify-start gap-3 h-12"
                >
                  <MessageCircle className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Send Inquiry</div>
                    <div className="text-xs text-gray-600">Fill out inquiry form</div>
                  </div>
                </Button>

                {landlord.contact.phoneNumber && (
                  <Button variant="outline" className="w-full justify-start gap-3 h-12">
                    <Phone className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">Call Now</div>
                      <div className="text-xs text-gray-600">{landlord.contact.phoneNumber}</div>
                    </div>
                  </Button>
                )}

                <Button variant="outline" className="w-full justify-start gap-3 h-12">
                  <Calendar className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Schedule Viewing</div>
                    <div className="text-xs text-gray-600">Book a property tour</div>
                  </div>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Simplified Inquiry Form */}
      <InquiryForm 
        isOpen={inquiryFormOpen}
        onClose={() => setInquiryFormOpen(false)}
        onSubmit={handleInquirySubmit}
        propertyTitle={property.title}
        unitLabel={unit.label}
      />

      {/* Chat Popup */}
      <ChatPopup 
        isOpen={chatOpen} 
        onClose={() => {
          setChatOpen(false);
        }} 
        landlord={landlord}
        channelId={channelId}
        currentUserId={currentUser?.id || ""}
      />

      {/* Review Form */}
      <ReviewForm
        isOpen={reviewFormOpen}
        onClose={() => {
          setReviewFormOpen(false);
          setEditingReview(null);
        }}
        onSubmit={handleReviewSubmit}
        unitLabel={unit.label}
        existingReview={editingReview || userReview}
      />

    </div>
  );
};

export default ViewUnitDetails;
