import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar as ShadcnAvatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format, isToday, isYesterday } from "date-fns";
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
  Check,
  CheckCheck,
  Send,
  Loader2,
  X,
} from "lucide-react";
import { getSpecificListingRequest, recordUnitViewRequest, createUnitReviewRequest, updateUnitReviewRequest, deleteUnitReviewRequest, reportFraudulentListingRequest } from "@/api/tenant/browseUnitApi";
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

// Fraud Report Form Types
type FraudReportFormData = {
  reason: string;
  details: string;
};

// Message type
type Message = {
  id: string;
  content: string;
  createdAt: string;
  readAt: string | null;
  senderId: string;
};

type Participant = {
  id: string;
  name: string;
  avatarUrl: string | null;
  role: "TENANT" | "LANDLORD" | "ADMIN";
  email: string;
};

type ChannelMessagesResponse = {
  channel: {
    id: string;
    status: string;
  };
  participants: Participant[];
  messages: Message[];
};

// Helper function to group messages by date
const groupMessagesByDate = (messages: Message[]) => {
  const groups: { [key: string]: Message[] } = {};

  messages.forEach((message) => {
    const date = new Date(message.createdAt).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
  });

  return Object.entries(groups).map(([date, messages]) => ({
    date,
    messages: messages.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    ),
  }));
};

// Chat Modal Component (similar to TenantMessages MessageModal)
const ChatModal = ({ 
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
  const [data, setData] = useState<ChannelMessagesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "h:mm a");
  };

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return "Today";
    } else if (isYesterday(date)) {
      return "Yesterday";
    } else {
      return format(date, "MMMM dd, yyyy");
    }
  };

  const getOtherParticipant = () => {
    if (!data || !currentUserId) return null;
    return data.participants.find(participant => participant.id !== currentUserId);
  };

  const fetchMessages = useCallback(async () => {
    if (!channelId) return;
    try {
      setLoading(true);
      const response = await getChannelMessagesRequest(channelId);
      setData(response.data);
      await markMessagesAsReadRequest(channelId).catch(() => {});
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  }, [channelId]);

  useEffect(() => {
    if (isOpen && channelId) {
      fetchMessages();
      
      if (socket && isConnected) {
        socket.emit("join:channel", channelId);
      }
    } else if (isOpen && !channelId) {
      setData(null);
    }

    return () => {
      if (socket && isConnected && channelId) {
        socket.emit("leave:channel", channelId);
      }
    };
  }, [isOpen, channelId, socket, isConnected, fetchMessages]);

  useEffect(() => {
    if (!socket || !channelId || !isOpen || !isConnected) return;

    const handleNewMessage = async (messageData: Message & { channelId: string }) => {
      if (messageData.channelId !== channelId) return;

      setData((prevData) => {
        if (!prevData) return prevData;

        const messageExists = prevData.messages.some((msg) => msg.id === messageData.id);
        if (messageExists) return prevData;

        return {
          ...prevData,
          messages: [...prevData.messages, messageData],
        };
      });

      setTimeout(() => scrollToBottom(), 100);

      const isFromOtherParticipant = messageData.senderId !== currentUserId;
      if (isFromOtherParticipant && channelId) {
        markMessagesAsReadRequest(channelId).catch(() => {});
      }
    };

    const handleReadReceipt = (receiptData: { channelId: string; readAt: string }) => {
      if (receiptData.channelId !== channelId) return;

      setData((prevData) => {
        if (!prevData) return prevData;

        const updatedMessages = prevData.messages.map((msg) => {
          if (msg.senderId !== currentUserId && !msg.readAt) {
            return { ...msg, readAt: receiptData.readAt };
          }
          if (msg.senderId === currentUserId && !msg.readAt) {
            return { ...msg, readAt: receiptData.readAt };
          }
          return msg;
        });

        return {
          ...prevData,
          messages: updatedMessages,
        };
      });
    };

    socket.on("chat:message:new", handleNewMessage);
    socket.on("chat:message:read", handleReadReceipt);

    return () => {
      socket.off("chat:message:new", handleNewMessage);
      socket.off("chat:message:read", handleReadReceipt);
    };
  }, [socket, isConnected, channelId, currentUserId, isOpen]);

  useEffect(() => {
    if (data?.messages) {
      scrollToBottom();
    }
  }, [data?.messages]);

  const sendMessage = async () => {
    const content = newMessage.trim();
    if (!content || !channelId || sending) return;

    try {
      setSending(true);
      await sendMessageRequest(channelId, { content });
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const otherParticipant = getOtherParticipant();
  const participantInitials = otherParticipant?.name
    ? otherParticipant.name
        .split(" ")
        .map((part) => part.charAt(0))
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : landlord.fullName
        .split(" ")
        .map((part) => part.charAt(0))
        .join("")
        .slice(0, 2)
        .toUpperCase();
  const groupedMessages = data ? groupMessagesByDate(data.messages) : [];

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col p-0" showCloseButton={false}>
        <DialogHeader className="sr-only">
          <DialogTitle>Chat with {landlord.fullName}</DialogTitle>
          <DialogDescription>Conversation with {landlord.fullName}</DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="p-6 flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
          </div>
        ) : data ? (
          <>
            {/* Header */}
            <div className="px-4 sm:px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-sky-50 to-emerald-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <ShadcnAvatar className="h-10 w-10 border-2 border-white shadow-sm flex-shrink-0">
                    <AvatarImage src={landlord.avatarUrl || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-sky-500 to-emerald-500 text-white font-semibold text-xs">
                      {participantInitials || "LD"}
                    </AvatarFallback>
                  </ShadcnAvatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-lg font-semibold text-slate-900 truncate">
                        {landlord.fullName}
                      </h2>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600 flex-wrap">
                      <span className="truncate">{landlord.email || "Landlord"}</span>
                      {otherParticipant?.role && (
                        <Badge
                          variant="outline"
                          className="text-xs border-slate-200 bg-slate-50 text-slate-700 rounded-full px-2"
                        >
                          {otherParticipant.role === "TENANT" ? "Tenant" : otherParticipant.role === "LANDLORD" ? "Landlord" : "Admin"}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages Container */}
            <div 
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 bg-slate-50/50 min-h-[300px] max-h-[50vh] sm:max-h-[60vh]"
            >
              <div className="space-y-6">
                {groupedMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-sky-100 to-emerald-100 rounded-full flex items-center justify-center mb-4">
                      <MessageCircle className="w-8 h-8 text-slate-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No messages yet</h3>
                    <p className="text-slate-600 text-sm max-w-sm">
                      Start the conversation by sending a message
                    </p>
                  </div>
                ) : (
                  groupedMessages.map((group) => (
                    <div key={group.date} className="space-y-4">
                      <div className="flex justify-center">
                        <div className="bg-white border border-slate-200 px-3 py-1 rounded-full text-xs text-slate-600 shadow-sm">
                          {formatDateHeader(group.date)}
                        </div>
                      </div>

                      {group.messages.map((message) => {
                        const sender = data.participants.find(p => p.id === message.senderId);
                        const isCurrentUser = currentUserId === message.senderId;
                        const isOtherParticipant = !isCurrentUser;
                        const showAvatar = isOtherParticipant;

                        return (
                          <div
                            key={message.id}
                            className={`flex items-end gap-3 ${
                              isCurrentUser ? "flex-row-reverse" : ""
                            }`}
                          >
                            {showAvatar && sender && (
                              <ShadcnAvatar className="h-8 w-8 border-2 border-white shadow-sm flex-shrink-0">
                                <AvatarImage src={sender.avatarUrl || undefined} />
                                <AvatarFallback className="bg-gradient-to-br from-sky-500 to-emerald-500 text-white text-xs">
                                  {sender.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </ShadcnAvatar>
                            )}

                            {!showAvatar && <div className="w-8 flex-shrink-0"></div>}

                            <div
                              className={`max-w-[75%] sm:max-w-[70%] ${
                                isCurrentUser ? "text-right" : ""
                              }`}
                            >
                              {showAvatar && sender && (
                                <div className={`text-xs text-slate-600 mb-1 ${isCurrentUser ? 'text-right mr-2' : 'ml-2'}`}>
                                  {sender.name}
                                </div>
                              )}
                              <div
                                className={`px-4 py-2.5 rounded-2xl shadow-sm ${
                                  isCurrentUser
                                    ? "bg-gradient-to-r from-sky-500 to-emerald-500 text-white rounded-br-md"
                                    : "bg-white border border-slate-200 rounded-bl-md"
                                }`}
                              >
                                <p className="text-sm whitespace-pre-wrap leading-relaxed text-left">{message.content}</p>
                              </div>
                              <div
                                className={`text-xs mt-1.5 flex items-center gap-1 ${
                                  isCurrentUser ? "justify-end text-slate-500" : "text-slate-500"
                                }`}
                              >
                                <span>{formatMessageTime(message.createdAt)}</span>
                                {message.readAt && isCurrentUser && (
                                  <CheckCheck className="h-3 w-3 text-sky-500" />
                                )}
                                {!message.readAt && isCurrentUser && (
                                  <Check className="h-3 w-3 text-slate-400" />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <div className="border-t border-slate-200 bg-white px-4 sm:px-6 py-4">
              <div className="flex items-end gap-3">
                <div className="flex-1 border border-slate-200 rounded-lg px-4 py-2.5 bg-slate-50 focus-within:bg-white focus-within:border-sky-300 transition-colors">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="w-full outline-none resize-none bg-transparent text-sm max-h-32 text-slate-900 placeholder:text-slate-400"
                    rows={1}
                    disabled={sending || !channelId}
                  />
                </div>
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sending || !channelId}
                  className="bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-600 hover:to-emerald-600 text-white px-4 sm:px-6 gap-2 h-11"
                >
                  <Send className="h-4 w-4" />
                  <span className="hidden sm:inline">{sending ? "Sending..." : "Send"}</span>
                </Button>
              </div>
            </div>
          </>
        ) : channelId ? (
          <div className="p-6 flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
          </div>
        ) : (
          <div className="p-6 flex flex-col items-center justify-center min-h-[400px] text-center">
            <MessageCircle className="w-12 h-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No conversation yet</h3>
            <p className="text-slate-600 text-sm max-w-sm">
              Send an inquiry to start a conversation with the landlord
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
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

// Fraud Report Form Component
const FraudReportForm = ({
  isOpen,
  onClose,
  onSubmit,
  propertyTitle,
  unitLabel,
  submitting,
  submitted
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FraudReportFormData) => void;
  propertyTitle: string;
  unitLabel: string;
  submitting?: boolean;
  submitted?: boolean;
}) => {
  const [formData, setFormData] = useState<FraudReportFormData>({
    reason: "",
    details: "",
  });
  const [errors, setErrors] = useState<{ reason?: string; details?: string }>({});

  useEffect(() => {
    if (isOpen && !submitted) {
      setFormData({ reason: "", details: "" });
      setErrors({});
    }
  }, [isOpen, submitted]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { reason?: string; details?: string } = {};

    if (!formData.reason.trim()) {
      newErrors.reason = "Please select a reason";
    }

    if (!formData.details.trim()) {
      newErrors.details = "Please provide details about the fraud";
    } else if (formData.details.trim().length < 10) {
      newErrors.details = "Please provide at least 10 characters";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  if (!isOpen) return null;

  // Show success message after submission
  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <div className="p-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Report Submitted Successfully</h3>
              <p className="text-sm text-gray-600 mb-6">
                Thank you for reporting this listing. We will email you once we have confirmed your report and taken appropriate action.
              </p>
              <Button
                onClick={onClose}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Close
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Report Fraudulent Listing</h3>
              <p className="text-sm text-gray-600">{propertyTitle} - {unitLabel}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <XCircle className="h-5 w-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Reason <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.reason}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, reason: e.target.value }));
                  if (errors.reason) {
                    setErrors(prev => ({ ...prev, reason: undefined }));
                  }
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-sm ${
                  errors.reason ? "border-red-300" : "border-gray-300"
                }`}
                required
              >
                <option value="">Select a reason</option>
                <option value="scam">Scam / Fraud</option>
                <option value="fake_info">Fake Information</option>
                <option value="discriminatory">Discriminatory Practices</option>
                <option value="illegal">Illegal Activity</option>
                <option value="inappropriate">Inappropriate Content</option>
                <option value="other">Other</option>
              </select>
              {errors.reason && (
                <p className="text-xs text-red-500 mt-1">{errors.reason}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Details <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.details}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, details: e.target.value }));
                  if (errors.details) {
                    setErrors(prev => ({ ...prev, details: undefined }));
                  }
                }}
                placeholder="Please provide details about the fraudulent activity..."
                rows={6}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-sm resize-none ${
                  errors.details ? "border-red-300" : "border-gray-300"
                }`}
                required
              />
              {errors.details && (
                <p className="text-xs text-red-500 mt-1">{errors.details}</p>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/50 border-t-white rounded-full animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Flag className="h-4 w-4 mr-2" />
                    Submit Report
                  </>
                )}
              </Button>
            </div>
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

// Get time ago string
const getTimeAgo = (date: Date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }
  if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }
  if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  }
  const years = Math.floor(diffInSeconds / 31536000);
  return `${years} ${years === 1 ? 'year' : 'years'} ago`;
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
  const [fraudReportFormOpen, setFraudReportFormOpen] = useState(false);
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);

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

  const handleFraudReportSubmit = async (reportData: FraudReportFormData) => {
    if (!listing?.id) return;

    try {
      setSubmittingReport(true);
      await reportFraudulentListingRequest({
        listingId: listing.id,
        reason: reportData.reason,
        details: reportData.details,
      });
      setReportSubmitted(true);
    } catch (error: any) {
      console.error("Error submitting fraud report:", error);
      toast.error(error?.response?.data?.error || "Failed to submit report. Please try again.");
    } finally {
      setSubmittingReport(false);
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
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
          {/* Mobile: Stack everything vertically, Desktop: Use PageHeader layout */}
          <div className="flex flex-col sm:block gap-3 sm:gap-0">
            {/* Top Row: Icon, Title, Description */}
            <div className="flex items-start gap-3 sm:gap-4">
              <Link to="/tenant/browse-unit" className="flex-shrink-0 mt-0.5">
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-sky-500 text-white grid place-items-center shadow-md hover:from-emerald-600 hover:to-sky-600 transition-colors">
                  <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
              </Link>
              <div className="flex-1 min-w-0">
                <h1 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 truncate mb-1">
                  {property.title} • {unit.label}
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 break-words leading-relaxed">
                  {formatAddress(property)} • {property.type} • Floor {unit.floorNumber}{unit.requiresScreening ? " • Screening required" : ""}
                </p>
              </div>
            </div>
            
            {/* Bottom Row: Price, Views, Reviews - Full width on mobile, right-aligned on desktop */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-end gap-2 sm:gap-3 sm:mt-2">
              {/* Price Block */}
              <div className="bg-gradient-to-br from-emerald-500 to-sky-500 text-white px-3 sm:px-4 py-2 rounded-lg shadow-md sm:shadow-sm w-full sm:w-auto">
                <div className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-center sm:text-left">
                  {formatCurrency(unit.targetPrice)}
                  <span className="text-xs sm:text-sm font-normal opacity-90">/month</span>
                </div>
              </div>
              
              {/* Views Block */}
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-3 sm:px-4 py-2 rounded-lg sm:shadow-sm w-full sm:w-auto">
                <div className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium">
                  <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="whitespace-nowrap">{unit.viewCount} views</span>
                </div>
              </div>
              
              {/* Reviews Block */}
              <div className="bg-amber-50 border border-amber-200 text-amber-700 px-3 sm:px-4 py-2 rounded-lg sm:shadow-sm w-full sm:w-auto">
                <div className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium">
                  <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-amber-500" />
                  <span className="whitespace-nowrap">{totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* 1. Location and Landlord Info Section (60/40 split) */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 sm:gap-6 items-start">
          {/* Left: Location Section (60%) */}
          <Card className="lg:col-span-6 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Location</h3>
            
            {/* Leaflet Map */}
            <div className="mb-4 sm:mb-6 rounded-lg overflow-hidden border border-gray-200" style={{ height: '250px', position: 'relative', zIndex: 0, isolation: 'isolate' }}>
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
            <div className="mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                <h4 className="font-medium text-xs sm:text-sm md:text-base">Full Address</h4>
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
              <p className="text-xs sm:text-sm md:text-base text-gray-600 flex items-start gap-2 break-words">
                <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 mt-0.5 flex-shrink-0" />
                <span>{formatAddress(property)}</span>
              </p>
            </div>

            {/* Nearby Institutions */}
            {nearInstitutions.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4 flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-100 rounded-lg">
                    <Building2 className="h-4 w-4 text-emerald-600" />
                  </div>
                  Nearby Institutions
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {nearInstitutions.map((institution: any, index: number) => {
                    const InstitutionIcon = getInstitutionIcon(institution.type);
                    const iconColors: { [key: string]: string } = {
                      'Education': 'bg-blue-50 text-blue-600',
                      'Healthcare': 'bg-red-50 text-red-600',
                      'Commerce': 'bg-green-50 text-green-600',
                      'Government': 'bg-purple-50 text-purple-600',
                      'Finance': 'bg-yellow-50 text-yellow-600',
                      'Transport': 'bg-indigo-50 text-indigo-600',
                      'Leisure': 'bg-pink-50 text-pink-600',
                      'Religion': 'bg-gray-50 text-gray-600',
                    };
                    const colorClass = iconColors[institution.type] || 'bg-gray-50 text-gray-600';
                    
                    return (
                      <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-200 hover:border-emerald-300 hover:shadow-sm transition-all">
                        <div className={`p-2.5 rounded-lg ${colorClass} flex-shrink-0`}>
                          <InstitutionIcon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-gray-900 truncate">{institution.name}</div>
                          <div className="text-xs text-gray-500 capitalize mt-0.5">{institution.type}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>

          {/* Right: Landlord Info and Reminder Section (40%) */}
          <Card className="lg:col-span-4 p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 md:space-y-5 self-start">
            {/* Anti-scam reminder (compact) */}
            <div className="p-3 rounded-lg border-2 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300 shadow-sm">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-amber-100 rounded-lg">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-700" />
                    </div>
                    <h4 className="font-semibold text-amber-900 text-xs sm:text-sm">Avoid Rental Scams</h4>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Link to="/terms-privacy#avoid-rental-scams" className="flex-shrink-0">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-7 px-2.5 text-xs font-medium bg-white/80 hover:bg-white border-amber-300 text-amber-700 hover:text-amber-800 hover:border-amber-400 shadow-sm transition-all"
                      >
                        <Info className="h-3 w-3 mr-1" />
                        <span className="hidden sm:inline">Read more</span>
                        <span className="sm:hidden">Info</span>
                      </Button>
                    </Link>
                    <Button 
                      onClick={() => setFraudReportFormOpen(true)}
                      variant="outline"
                      size="sm"
                      className="h-7 px-2.5 text-xs font-medium bg-white/80 hover:bg-red-50 border-red-300 text-red-600 hover:text-red-700 hover:border-red-400 shadow-sm transition-all"
                    >
                      <Flag className="h-3 w-3 mr-1" />
                      <span className="hidden sm:inline">Report</span>
                      <span className="sm:hidden">Flag</span>
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Never send money before viewing. Verify ownership. Meet in person. Use secure payment methods.
                </p>
              </div>
            </div>

            {/* Landlord info (larger) */}
            <div>
              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <Avatar
                  src={landlord.avatarUrl}
                  alt={landlord.fullName}
                  className="border-2 border-emerald-200"
                  size="lg"
                  name={landlord.fullName}
                />
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base">{landlord.fullName}</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Property Owner</p>
                  {landlord.email && (
                    <span className="text-xs sm:text-sm text-gray-700 break-all">{landlord.email}</span>
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
        <Card className="p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Unit Images (50%) */}
            {unitImages.length > 0 && (
              <div>
                <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                  <img
                    src={unitImages[activeImageIndex]}
                    alt={`${unit.label} - Image ${activeImageIndex + 1}`}
                    className="w-full h-64 sm:h-80 md:h-96 object-cover"
                  />
                </div>
                <p className="text-xs sm:text-sm text-gray-600 italic mt-2 mb-2 sm:mb-3">This is what the unit looks like</p>
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
              <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">About this unit</h3>
              <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6 leading-relaxed">{unit.description}</p>
              
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
        <Card className="p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Amenities this unit have</h3>
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
        <Card className="p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Lease Rules</h3>
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
          <Card className="p-4 sm:p-6 border-2 border-emerald-100 bg-gradient-to-br from-white to-emerald-50/30 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Star className="h-5 w-5 text-emerald-600 fill-emerald-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">My Review</h3>
              </div>
            </div>
            
            {userReview ? (
              <div className="p-4 sm:p-5 border-2 border-emerald-200 rounded-xl bg-white shadow-sm">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar
                      src={currentUser.avatarUrl}
                      alt={currentUser.firstName || "You"}
                      className="border-2 border-emerald-200 flex-shrink-0"
                      size="md"
                      name={currentUser.firstName ? `${currentUser.firstName} ${currentUser.lastName || ""}`.trim() : undefined}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-gray-900">Your Review</div>
                      <div className="text-xs text-gray-500">
                        {new Date(userReview.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-bold text-gray-900">{userReview.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditReview(userReview)}
                        className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteReview(userReview.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                {userReview.comment && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-700 break-words leading-relaxed">{userReview.comment}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 px-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
                  <Star className="h-8 w-8 text-emerald-600" />
                </div>
                <p className="text-sm font-medium text-gray-700 mb-1">You haven't reviewed this unit yet.</p>
                <p className="text-xs text-gray-500 mb-6">Share your experience with other tenants</p>
                <Button
                  onClick={() => {
                    setEditingReview(null);
                    setReviewFormOpen(true);
                  }}
                  className="bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-700 hover:to-sky-700 text-white shadow-md hover:shadow-lg transition-all px-6"
                  disabled={submittingReview}
                >
                  <Star className="h-4 w-4 mr-2 fill-white" />
                  Write Your Review
                </Button>
              </div>
            )}
          </Card>
        )}

        {/* 7. All Reviews Section - Google Play Style */}
        <Card className="p-4 sm:p-6 border border-gray-200 shadow-sm bg-white">
          {/* Header with Rating Summary */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Star className="h-5 w-5 text-gray-700 fill-gray-700" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Reviews</h3>
                {unit.avgRating && totalReviews > 0 && (
                  <div className="flex items-baseline gap-2 mt-1">
                    <div className="flex items-center gap-1">
                      <span className="text-2xl font-bold text-gray-900">{unit.avgRating.toFixed(1)}</span>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              unit.avgRating !== null && star <= Math.round(unit.avgRating)
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})</span>
                  </div>
                )}
              </div>
            </div>

            {/* Rating Distribution Chart (Google Play Style) */}
            {totalReviews > 0 && (() => {
              const ratingCounts = [5, 4, 3, 2, 1].map(rating => ({
                rating,
                count: unit.reviews.filter((r: any) => r.rating === rating).length,
                percentage: (unit.reviews.filter((r: any) => r.rating === rating).length / totalReviews) * 100
              }));

              return (
                <div className="space-y-2 mb-6">
                  {ratingCounts.map(({ rating, count, percentage }) => (
                    <button
                      key={rating}
                      onClick={() => {
                        if (selectedRatingFilter === rating) {
                          setSelectedRatingFilter(null);
                        } else {
                          setSelectedRatingFilter(rating);
                        }
                      }}
                      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex items-center gap-1.5 min-w-[60px]">
                        <span className="text-sm font-medium text-gray-700">{rating}</span>
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      </div>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            selectedRatingFilter === rating
                              ? "bg-yellow-500"
                              : "bg-yellow-400"
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-600 min-w-[40px] text-right">
                        {count}
                      </span>
                    </button>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* Filter Buttons */}
          {totalReviews > 0 && (
            <div className="mb-6 pb-4 border-b border-gray-200">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setSelectedRatingFilter(null)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedRatingFilter === null
                      ? "bg-gray-800 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All
                </button>
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = unit.reviews.filter((r: any) => r.rating === rating).length;
                  if (count === 0) return null;
                  return (
                    <button
                      key={rating}
                      onClick={() => {
                        if (selectedRatingFilter === rating) {
                          setSelectedRatingFilter(null);
                        } else {
                          setSelectedRatingFilter(rating);
                        }
                      }}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                        selectedRatingFilter === rating
                          ? "bg-gray-200 text-gray-800 border border-gray-300"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <Star className={`h-4 w-4 ${selectedRatingFilter === rating ? "fill-yellow-500 text-yellow-500" : "text-gray-400"}`} />
                      <span>{rating} star{rating !== 1 ? 's' : ''}</span>
                      <span className="text-xs opacity-75">({count})</span>
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
                    const reviewDate = new Date(r.createdAt);
                    const timeAgo = getTimeAgo(reviewDate);
                    
                    return (
                      <div key={r.id} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                        <div className="flex items-start gap-3">
                          <Avatar
                            src={r.tenant?.avatarUrl}
                            alt={tenantFullName}
                            className="flex-shrink-0 border-2 border-gray-200"
                            size="md"
                            name={tenantFullName !== "Anonymous" ? tenantFullName : undefined}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-gray-900 text-sm">{tenantFullName}</span>
                                  {isOwnReview && (
                                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                                      You
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="flex items-center gap-0.5">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star
                                        key={star}
                                        className={`h-4 w-4 ${
                                          star <= r.rating
                                            ? "text-yellow-400 fill-yellow-400"
                                            : "text-gray-300"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-xs text-gray-500">{timeAgo}</span>
                                </div>
                              </div>
                              {isOwnReview && (
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditReview(r)}
                                    className="h-7 w-7 p-0 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                  >
                                    <Edit className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteReview(r.id)}
                                    className="h-7 w-7 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              )}
                            </div>
                            {r.comment && (
                              <p className="text-sm text-gray-800 leading-relaxed break-words mt-2">
                                {r.comment}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {!showAllReviews && filteredReviews.length > 6 && (
                  <div className="mt-6 text-center">
                    <Button
                      variant="outline"
                      onClick={() => setShowAllReviews(true)}
                      className="text-sm font-semibold border-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 shadow-sm px-6"
                    >
                      Show All Reviews ({filteredReviews.length})
                    </Button>
                  </div>
                )}
                {showAllReviews && filteredReviews.length > 6 && (
                  <div className="mt-6 text-center">
                    <Button
                      variant="outline"
                      onClick={() => setShowAllReviews(false)}
                      className="text-sm font-semibold border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 shadow-sm px-6"
                    >
                      Show Less
                    </Button>
                  </div>
                )}
              </>
            );
          })() : (
            <div className="text-center py-12 px-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Star className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-700 mb-1">
                {currentUser && userReview 
                  ? "No other reviews yet for this unit." 
                  : "No reviews yet for this unit."}
              </p>
              {!currentUser && (
                <p className="text-xs text-gray-500 mt-2">Sign in to write a review</p>
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

      {/* Chat Modal */}
      <ChatModal 
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

      {/* Fraud Report Form */}
      <FraudReportForm
        isOpen={fraudReportFormOpen}
        onClose={() => {
          setFraudReportFormOpen(false);
          setReportSubmitted(false);
        }}
        onSubmit={handleFraudReportSubmit}
        propertyTitle={property.title}
        unitLabel={unit.label}
        submitting={submittingReport}
        submitted={reportSubmitted}
      />

    </div>
  );
};

export default ViewUnitDetails;
