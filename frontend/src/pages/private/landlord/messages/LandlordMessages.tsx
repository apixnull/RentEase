import React, { useEffect, useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/stores/useAuthStore";
import { getUserChatChannelsRequest, sendAndCreateChannelRequest, searchUsersForMessagingRequest, getChannelMessagesRequest, sendMessageRequest, markMessagesAsReadRequest } from "@/api/chatApi";
import { useSocket } from "@/hooks/useSocket";
import { inviteTenantForScreeningRequest } from "@/api/landlord/screeningApi";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  MessageCircle, 
  Check,
  CheckCheck,
  MessageSquare,
  Send,
  HelpCircle,
  Sparkles,
  UserPlus,
  Loader2,
  FileText,
  Info,
  ShieldAlert,
  ShieldCheck,
  X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { format, isToday, isYesterday } from "date-fns";

// Types
type User = {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
};

type Channel = {
  id: string;
  tenantId: string;
  landlordId: string;
  status: "INQUIRY" | "ACTIVE" | "ENDED";
  createdAt: string;
  updatedAt: string;
  lastMessageText: string | null;
  lastMessageAt: string | null;
  lastMessageSenderId: string | null;
  readAt: string | null;
  tenant: User;
  landlord: User;
};

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
  channel: Channel;
  participants: Participant[];
  messages: Message[];
};

type FilterType = "ALL" | "INQUIRY" | "ACTIVE" | "ENDED";

// Custom Hook for Channels - Real-time updates via Socket.IO
const useChannels = () => {
  const currentUser = useAuthStore((state) => state.user);
  const { socket, isConnected } = useSocket();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);

  // Initial load with loading state
  const loadChannels = async () => {
    try {
      const response = await getUserChatChannelsRequest();
      const channelsData = Array.isArray(response.data) ? response.data : [];
      setChannels(channelsData);
    } catch (error) {
      console.error("Failed to load channels:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial load on mount
  useEffect(() => {
    if (!currentUser) return;
    loadChannels();
  }, [currentUser]);

  // Listen for real-time channel updates via Socket.IO
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleChannelUpdate = (updatedChannel: Channel) => {
      console.log("📩 Received channel update:", updatedChannel);
      
      setChannels((prevChannels) => {
        // Check if channel already exists
        const existingIndex = prevChannels.findIndex(
          (ch) => ch.id === updatedChannel.id
        );

        if (existingIndex >= 0) {
          // Update existing channel
          const updated = [...prevChannels];
          updated[existingIndex] = updatedChannel;
          return updated;
        } else {
          // Add new channel (if it has messages)
          if (updatedChannel.lastMessageText) {
            return [updatedChannel, ...prevChannels];
          }
          return prevChannels;
        }
      });
    };

    // Listen for channel updates
    socket.on("chat:channel:update", handleChannelUpdate);

    // Cleanup listener on unmount
    return () => {
      socket.off("chat:channel:update", handleChannelUpdate);
    };
  }, [socket, isConnected]);

  return { channels, loading, loadChannels };
};

// Custom Hook for Presence Tracking
// Tracks online users based on channel viewing (modal open/close)
const usePresence = () => {
  const { socket, isConnected } = useSocket();
  const currentUser = useAuthStore((state) => state.user);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!socket || !isConnected || !currentUser?.id) return;

    const handleUserOnline = (data: { userId: string; channelId: string }) => {
      // Only track other users, not ourselves
      if (data.userId !== currentUser.id) {
        setOnlineUsers((prev) => new Set(prev).add(data.userId));
      }
    };

    const handleUserOffline = (data: { userId: string; channelId: string }) => {
      if (data.userId !== currentUser.id) {
        setOnlineUsers((prev) => {
          const next = new Set(prev);
          next.delete(data.userId);
          return next;
        });
      }
    };

    socket.on("presence:userOnline", handleUserOnline);
    socket.on("presence:userOffline", handleUserOffline);

    return () => {
      socket.off("presence:userOnline", handleUserOnline);
      socket.off("presence:userOffline", handleUserOffline);
    };
  }, [socket, isConnected, currentUser?.id]);

  return { onlineUsers };
};

// Loading Skeleton Component
const MessagesSkeleton = () => (
  <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
    {/* Header Skeleton */}
    <div className="relative overflow-hidden rounded-2xl">
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-emerald-200/70 via-emerald-100/50 to-sky-200/70 opacity-90" />
      <div className="relative m-[1px] rounded-[15px] bg-white/70 backdrop-blur-md border border-white/50 p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
      </div>
    </div>

    {/* Main Content Skeleton */}
    <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm">
      <CardHeader>
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <div className="flex gap-2 flex-wrap">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 p-3 border rounded-lg">
              <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
                <div className="flex gap-4">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

// Channel Item Component
const ChannelItem = ({ 
  channel, 
  currentUser,
  onClick,
  isOnline
}: { 
  channel: Channel;
  currentUser: any;
  onClick: () => void;
  isOnline?: boolean;
}) => {
  const getCounterpart = (channel: Channel): User => {
    return currentUser?.id === channel.tenantId ? channel.landlord : channel.tenant;
  };

  const getLastMessageDisplay = (channel: Channel): string => {
    if (!channel.lastMessageText) return "No messages yet";
    
    const messageText = channel.lastMessageText.length > 50 
      ? channel.lastMessageText.substring(0, 50) + '...' 
      : channel.lastMessageText;
    
    return channel.lastMessageSenderId === currentUser?.id 
      ? `You: ${messageText}` 
      : messageText;
  };

  const formatTime = (dateString: string | null): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return format(date, "h:mm a");
    }
    
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    return date.toDateString() === yesterday.toDateString() 
      ? 'Yesterday' 
      : date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      "INQUIRY": "bg-blue-50 text-blue-700 border-blue-200",
      "ACTIVE": "bg-emerald-50 text-emerald-700 border-emerald-200",
      "ENDED": "bg-amber-50 text-amber-700 border-amber-200"
    };
    return colors[status as keyof typeof colors] || "bg-slate-100 text-slate-700 border-slate-200";
  };

  const getStatusDisplayText = (status: string) => {
    const texts = {
      "INQUIRY": "Inquiry",
      "ACTIVE": "Active Lease",
      "ENDED": "Ended Lease"
    };
    return texts[status as keyof typeof texts] || status;
  };

  const getStatusIcon = (channel: Channel) => {
    // If current user sent the message, show read receipts
    if (channel.lastMessageSenderId === currentUser?.id) {
      return channel.readAt ? (
        <CheckCheck className="w-3 h-3 text-slate-500" />
      ) : (
        <Check className="w-3 h-3 text-slate-400" />
      );
    }
    
    // If someone else sent and readAt is null, it's unread
    if (!channel.readAt && channel.lastMessageSenderId !== currentUser?.id) {
      return <div className="w-2 h-2 bg-blue-600 rounded-full" />;
    }
    
    return null;
  };

  const counterpart = getCounterpart(channel);
  // Unread: readAt is null AND message was sent by someone else
  const hasUnread = channel.readAt === null && channel.lastMessageSenderId !== currentUser?.id;
  const lastActivity = channel.lastMessageAt || channel.updatedAt || channel.createdAt;

  return (
    <div
      className={`group bg-white hover:bg-slate-50 border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
        hasUnread 
          ? 'border-blue-300 bg-blue-50/50 hover:bg-blue-100/50 shadow-sm' 
          : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className="relative flex-shrink-0">
          <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
            <AvatarImage src={counterpart.avatarUrl || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-sky-500 to-emerald-500 text-white font-semibold text-sm">
              {counterpart.firstName?.[0]}{counterpart.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          {hasUnread && (
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-600 border-2 border-white rounded-full" />
          )}
          {/* Presence Indicator - Messenger style green/gray circle */}
          <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
            isOnline ? 'bg-emerald-500' : 'bg-slate-400'
          }`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <h3 className={`font-semibold text-sm truncate ${
                hasUnread ? 'text-slate-900' : 'text-slate-900'
              }`}>
                {counterpart.firstName} {counterpart.lastName}
              </h3>
              <Badge 
                variant="outline" 
                className={`text-xs border ${getStatusColor(channel.status)} rounded-full px-2 py-0 hidden sm:inline-block`}
              >
                {getStatusDisplayText(channel.status)}
              </Badge>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className={`text-xs whitespace-nowrap ${
                hasUnread ? 'text-slate-700 font-medium' : 'text-slate-500'
              }`}>
                {formatTime(lastActivity)}
              </span>
              {getStatusIcon(channel)}
            </div>
          </div>

          <Badge 
            variant="outline" 
            className={`text-xs border ${getStatusColor(channel.status)} rounded-full px-2 py-0 mb-2 sm:hidden`}
          >
            {getStatusDisplayText(channel.status)}
          </Badge>

          <p className={`text-xs line-clamp-2 ${
            hasUnread ? 'text-slate-800 font-medium' : 'text-slate-600'
          }`}>
            {getLastMessageDisplay(channel)}
          </p>
        </div>
      </div>
    </div>
  );
};

// Filter Select Component
const FilterSelect = ({ 
  statusFilter, 
  onStatusFilterChange 
}: { 
  statusFilter: FilterType;
  onStatusFilterChange: (filter: FilterType) => void;
}) => {
  const filters: { key: FilterType; label: string }[] = [
    { key: "ALL", label: "All Chats" },
    { key: "INQUIRY", label: "Inquiries" },
    { key: "ACTIVE", label: "Active Leases" },
    { key: "ENDED", label: "Ended Leases" }
  ];

  return (
    <Select value={statusFilter} onValueChange={(value) => onStatusFilterChange(value as FilterType)}>
      <SelectTrigger className="w-full sm:w-[180px] h-11">
        <SelectValue placeholder="Filter by status" />
      </SelectTrigger>
      <SelectContent>
        {filters.map((filter) => (
          <SelectItem key={filter.key} value={filter.key}>
            {filter.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

// Reminders Modal Component
const RemindersModal = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-amber-600/80 hover:text-amber-700 hover:bg-amber-50"
        >
          <ShieldAlert className="h-4 w-4" />
          <span className="hidden sm:inline">Reminders</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <DialogTitle>Reminders for Landlords</DialogTitle>
          </div>
          <DialogDescription>
            Important information about messaging policies
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-medium text-blue-900 text-sm">Message Policy</h4>
                <p className="text-xs text-blue-800 leading-relaxed">
                  Messages in this conversation cannot be deleted or edited for audit purposes. All messages are permanently recorded to maintain transparency and accountability in rental communications.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 flex-shrink-0" />
              <p className="text-xs text-slate-700 leading-relaxed">
                All messages are stored permanently and cannot be modified or removed.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 flex-shrink-0" />
              <p className="text-xs text-slate-700 leading-relaxed">
                This ensures a complete audit trail for all rental-related communications.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 flex-shrink-0" />
              <p className="text-xs text-slate-700 leading-relaxed">
                Please be mindful of what you share in messages as they cannot be edited or deleted.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Message Modal Component
const MessageModal = ({
  channel,
  isOpen,
  onClose,
  currentUser
}: {
  channel: Channel | null;
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
}) => {
  const { socket, isConnected } = useSocket();
  const [data, setData] = useState<ChannelMessagesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [showScreeningConfirmation, setShowScreeningConfirmation] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "Active Lease";
      case "ENDED":
        return "Ended Lease";
      case "INQUIRY":
        return "Inquiry";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "ENDED":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "INQUIRY":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
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
    if (!data || !currentUser) return null;
    return data.participants.find(participant => participant.id !== currentUser.id);
  };

  const fetchMessages = async () => {
    if (!channel?.id) return;
    
    try {
      setLoading(true);
      const response = await getChannelMessagesRequest(channel.id);
      setData(response.data);
      
      if (currentUser) {
        await markMessagesAsReadRequest(channel.id);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !channel?.id || sending) return;

    try {
      setSending(true);
      await sendMessageRequest(channel.id, { content: newMessage.trim() });
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleInviteTenantForScreening = () => {
    const otherParticipant = getOtherParticipant();
    if (!otherParticipant) {
      toast.error("Unable to identify tenant");
      return;
    }
    setShowScreeningConfirmation(true);
  };

  const confirmInviteTenantForScreening = async () => {
    if (!channel?.id || inviting || !data) return;

    const otherParticipant = getOtherParticipant();
    if (!otherParticipant || !otherParticipant.email) {
      toast.error("Unable to get tenant email");
      setShowScreeningConfirmation(false);
      return;
    }

    try {
      setInviting(true);
      setShowScreeningConfirmation(false);
      
      const response = await inviteTenantForScreeningRequest({ tenantEmail: otherParticipant.email });
      
      if (response.data?.message) {
        toast.success(response.data.message);
      } else {
        toast.success("Tenant screening invitation sent successfully.");
      }
      
      await fetchMessages();
    } catch (err: any) {
      console.error("Error inviting for screening:", err);
      
      if (err?.response?.status === 409) {
        const errorMessage = err.response.data?.message || "A screening invitation is already pending for this tenant.";
        toast.error(errorMessage);
      } else {
        const errorMessage = err?.response?.data?.message || "Failed to send screening invitation";
        toast.error(errorMessage);
      }
    } finally {
      setInviting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Load messages when modal opens
  useEffect(() => {
    if (isOpen && channel) {
      fetchMessages();
      
      if (socket && isConnected) {
        socket.emit("join:channel", channel.id);
      }
    }

    return () => {
      if (socket && isConnected && channel) {
        socket.emit("leave:channel", channel.id);
      }
    };
  }, [isOpen, channel?.id, socket, isConnected]);

  // Listen for new messages via Socket.IO
  useEffect(() => {
    if (!socket || !isConnected || !channel?.id || !isOpen) return;

    const handleNewMessage = async (messageData: Message & { channelId: string }) => {
      if (messageData.channelId !== channel.id) return;

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

      const isFromOtherParticipant = currentUser?.id && messageData.senderId !== currentUser.id;
      if (isFromOtherParticipant && channel.id && currentUser?.id) {
        markMessagesAsReadRequest(channel.id).catch(console.error);
      }
    };

    const handleReadReceipt = (receiptData: { channelId: string; readAt: string }) => {
      if (receiptData.channelId !== channel.id) return;

      setData((prevData) => {
        if (!prevData) return prevData;

        const updatedMessages = prevData.messages.map((msg) => {
          if (msg.senderId !== currentUser?.id && !msg.readAt) {
            return { ...msg, readAt: receiptData.readAt };
          }
          if (msg.senderId === currentUser?.id && !msg.readAt) {
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
  }, [socket, isConnected, channel?.id, currentUser?.id, isOpen]);

  useEffect(() => {
    if (data?.messages) {
      scrollToBottom();
    }
  }, [data?.messages]);

  const otherParticipant = getOtherParticipant();
  const participantInitials = otherParticipant?.name
    ? otherParticipant.name
        .split(" ")
        .map((part) => part.charAt(0))
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "";
  const groupedMessages = data ? groupMessagesByDate(data.messages) : [];

  if (!channel) return null;

  const dialogTitle = otherParticipant?.name || channel?.tenant?.firstName || "Tenant";
  const dialogDescription = otherParticipant?.email || "Conversation with tenant";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col p-0" showCloseButton={false}>
        <DialogHeader className="sr-only">
          <DialogTitle>Chat with {dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="p-6 flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
          </div>
        ) : data ? (
          <>
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-sky-50 to-emerald-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  {otherParticipant && (
                    <Avatar className="h-10 w-10 border-2 border-white shadow-sm flex-shrink-0">
                      <AvatarImage src={otherParticipant.avatarUrl || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-sky-500 to-emerald-500 text-white font-semibold text-xs">
                        {participantInitials || "TN"}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold text-slate-900 truncate">
                        {otherParticipant?.name || "Conversation"}
                      </h2>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600 flex-wrap">
                      <span>{otherParticipant?.email || "Tenant conversation"}</span>
                      {otherParticipant?.role && (
                        <Badge
                          variant="outline"
                          className="text-xs border-slate-200 bg-slate-50 text-slate-700 rounded-full px-2"
                        >
                          {otherParticipant.role === "TENANT" ? "Tenant" : otherParticipant.role === "LANDLORD" ? "Landlord" : "Admin"}
                        </Badge>
                      )}
                      <Badge
                        variant="outline"
                        className={`text-xs border ${getStatusColor(data.channel.status)} rounded-full px-2`}
                      >
                        {getStatusDisplay(data.channel.status)}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {(data.channel.status === "INQUIRY" || data.channel.status === "ENDED") && (
                    <Button
                      onClick={handleInviteTenantForScreening}
                      disabled={inviting}
                      variant="outline"
                      size="sm"
                      className="gap-2 border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      Screen Tenant
                    </Button>
                  )}
                  {data.channel.status !== "ACTIVE" && (
                    <Button
                      onClick={() => {
                        onClose();
                        navigate("/landlord/leases/create");
                      }}
                      size="sm"
                      className="bg-gradient-to-r from-sky-500 to-emerald-500 text-white"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      New Lease
                    </Button>
                  )}
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
              className="flex-1 overflow-y-auto px-6 py-4 bg-slate-50/50 min-h-[400px] max-h-[60vh]"
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
                        const isCurrentUser = currentUser?.id === message.senderId;
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
                              <Avatar className="h-8 w-8 border-2 border-white shadow-sm flex-shrink-0">
                                <AvatarImage src={sender.avatarUrl || undefined} />
                                <AvatarFallback className="bg-gradient-to-br from-sky-500 to-emerald-500 text-white text-xs">
                                  {sender.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
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
            <div className="border-t border-slate-200 bg-white px-6 py-4">
              <div className="flex items-end gap-3">
                <div className="flex-1 border border-slate-200 rounded-lg px-4 py-2.5 bg-slate-50 focus-within:bg-white focus-within:border-sky-300 transition-colors">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="w-full outline-none resize-none bg-transparent text-sm max-h-32 text-slate-900 placeholder:text-slate-400"
                    rows={1}
                    disabled={sending}
                  />
                </div>
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sending}
                  className="bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-600 hover:to-emerald-600 text-white px-6 gap-2 h-11"
                >
                  <Send className="h-4 w-4" />
                  {sending ? "Sending..." : "Send"}
                </Button>
              </div>
            </div>

            {/* Screening Confirmation Dialog */}
            <AlertDialog open={showScreeningConfirmation} onOpenChange={setShowScreeningConfirmation}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Invite Tenant for Screening</AlertDialogTitle>
                  <AlertDialogDescription>
                    {otherParticipant ? (
                      <>
                        You are about to send a screening invitation to:
                        <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="text-sm font-medium text-slate-900">{otherParticipant.name}</div>
                          <div className="text-sm text-slate-600 mt-1">
                            {otherParticipant.email || "Email not available"}
                          </div>
                        </div>
                        <p className="mt-3 text-sm text-slate-700">
                          This will send an invitation email to the tenant and notify them in this conversation.
                        </p>
                      </>
                    ) : (
                      "Unable to identify tenant information."
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={inviting}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={confirmInviteTenantForScreening}
                    disabled={inviting || !otherParticipant?.email}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    {inviting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block" />
                        Sending...
                      </>
                    ) : (
                      "Send Invitation"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
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

// Quick Tips Modal Component
const QuickTipsModal = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-sky-500/80 hover:text-sky-600 hover:bg-sky-50"
        >
          <HelpCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Quick Tips</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-emerald-400 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <DialogTitle>Quick Tips</DialogTitle>
          </div>
          <DialogDescription>
            Learn how to effectively use the messaging system
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <p className="text-sm text-slate-600">
            Click any conversation to view messages and communicate with tenants about lease information.
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
              <div>
                <p className="text-sm font-medium text-slate-900 mb-1">Unread Messages</p>
                <p className="text-xs text-slate-600">
                  A blue indicator dot shows when you have unread messages from tenants.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
              <CheckCheck className="w-4 h-4 text-slate-500 mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-slate-900 mb-1">Read Receipts</p>
                <p className="text-xs text-slate-600">
                  A double check icon indicates that your message has been read by the recipient.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Search and Message Tenant Component
const SearchAndMessageTenant = ({ 
  onMessageSent,
  onChannelSelect
}: { 
  onMessageSent: () => void;
  onChannelSelect: (channelId: string) => void;
}) => {
  const { loadChannels } = useChannels();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<any | null>(null);
  const [messageContent, setMessageContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await searchUsersForMessagingRequest(searchQuery);
        console.log("🔍 Full search response:", response);
        console.log("🔍 Response data:", response.data);
        console.log("🔍 Response data.users:", response.data?.users);
        
        const users = response.data?.users || response.data || [];
        console.log("🔍 Setting search results:", users);
        console.log("🔍 Results count:", users.length);
        setSearchResults(users);
      } catch (error: any) {
        console.error("Error searching users:", error);
        console.error("Error details:", error?.response?.data);
        toast.error(error?.response?.data?.error || "Failed to search users");
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSelectTenant = (tenant: any) => {
    // If conversation exists, open it in modal instead of navigating
    if (tenant.existingChannelId) {
      onChannelSelect(tenant.existingChannelId);
      setSearchQuery("");
      setSearchResults([]);
      return;
    }
    
    setSelectedTenant(tenant);
    setSearchQuery(`${tenant.firstName} ${tenant.lastName}`);
    setSearchResults([]);
    setIsDialogOpen(true);
  };

  const handleSendMessage = async () => {
    if (!selectedTenant || !messageContent.trim()) {
      toast.error("Please select a tenant and enter a message");
      return;
    }

    // If conversation already exists, open it in modal instead of navigating
    if (selectedTenant.existingChannelId) {
      onChannelSelect(selectedTenant.existingChannelId);
      setIsDialogOpen(false);
      setSelectedTenant(null);
      setSearchQuery("");
      return;
    }

    setIsSending(true);
    try {
      const response = await sendAndCreateChannelRequest({
        recipientId: selectedTenant.id,
        content: messageContent.trim(),
      });
      
      toast.success("Message sent successfully!");
      setMessageContent("");
      setSelectedTenant(null);
      setSearchQuery("");
      setIsDialogOpen(false);
      
      // Refresh channels list
      loadChannels();
      onMessageSent();
      
      // Open the new channel in modal
      if (response.data.channelId) {
        onChannelSelect(response.data.channelId);
      }
    } catch (error: any) {
      console.error("Error sending message:", error);
      const message = error?.response?.data?.message || "Failed to send message. Please try again.";
      toast.error(message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="relative z-[100]" style={{ zIndex: 100 }}>
      <div className="relative" ref={searchContainerRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 z-10" />
          <Input
            placeholder="Search tenants to message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              // Trigger search if query exists
              if (searchQuery.length >= 2) {
                // Search will be triggered by useEffect
              }
            }}
            className="pl-10 h-11 bg-slate-50 border-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 rounded-lg text-sm"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10">
              <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
            </div>
          )}
        </div>

        {/* Search Results Dropdown */}
        {searchQuery.length >= 2 && !isSearching && searchResults.length > 0 && !selectedTenant && (
          <div className="absolute z-[10001] w-full mt-2 bg-white border border-slate-200 rounded-lg shadow-2xl max-h-60 overflow-y-auto" style={{ zIndex: 10001 }}>
            {searchResults.map((user) => (
              <button
                key={user.id}
                onClick={() => handleSelectTenant(user)}
                className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors text-left border-b last:border-b-0"
              >
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarImage src={user.avatarUrl || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-sky-500 to-emerald-500 text-white text-xs">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {user.firstName} {user.lastName}
                    </p>
                    {user.existingChannelId && (
                      <Badge variant="outline" className="text-xs px-1.5 py-0 flex-shrink-0">
                        Existing
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
                {user.existingChannelId ? (
                  <MessageCircle className="w-4 h-4 text-sky-500 flex-shrink-0" />
                ) : (
                  <UserPlus className="w-4 h-4 text-slate-400 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        )}

        {searchQuery.length >= 2 && !isSearching && searchResults.length === 0 && !selectedTenant && (
          <div className="absolute z-[10001] w-full mt-2 bg-white border border-slate-200 rounded-lg shadow-2xl p-4 text-center" style={{ zIndex: 10001 }}>
            <p className="text-sm text-slate-500">No tenants found</p>
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>

        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <Avatar className="h-10 w-10">
                <AvatarImage src={selectedTenant?.avatarUrl || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-sky-500 to-emerald-500 text-white">
                  {selectedTenant?.firstName?.[0]}{selectedTenant?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle>
                  Message {selectedTenant?.firstName} {selectedTenant?.lastName}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  {selectedTenant?.email}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Textarea
                placeholder="Type your message here..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                className="min-h-[120px] resize-none"
                disabled={isSending}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  setMessageContent("");
                }}
                disabled={isSending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendMessage}
                disabled={isSending || !messageContent.trim()}
                className="bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-600 hover:to-emerald-600 text-white"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Chat Channels List Component
const ChatChannelsList = ({
  channels,
  statusFilter,
  currentUser,
  onStatusFilterChange,
  onRefreshChannels: _onRefreshChannels,
  onlineUsers,
}: {
  channels: Channel[];
  statusFilter: FilterType;
  currentUser: any;
  onStatusFilterChange: (filter: FilterType) => void;
  onRefreshChannels: () => void;
  onlineUsers: Set<string>;
}) => {
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);

  const filteredChannels = useMemo(() => {
    return channels.filter(channel => {
      if (statusFilter !== "ALL" && channel.status !== statusFilter) return false;
      return true;
    });
  }, [channels, statusFilter]);


  const sortedChannels = useMemo(() => {
    return [...filteredChannels].sort((a, b) => {
      const aDate = a.lastMessageAt || a.updatedAt || a.createdAt;
      const bDate = b.lastMessageAt || b.updatedAt || b.createdAt;
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    });
  }, [filteredChannels]);

  const handleChannelClick = (channel: Channel) => {
    setSelectedChannel(channel);
    setIsMessageModalOpen(true);
  };

  return (
    <div className="min-h-screen space-y-6 px-4 pb-6 pt-3 sm:px-6 sm:pt-4">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative overflow-visible rounded-2xl"
        style={{ zIndex: 100 }}
      >
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-sky-200/80 via-cyan-200/75 to-emerald-200/70 opacity-95" />
        <div className="relative m-[1px] rounded-[16px] bg-white/85 backdrop-blur-lg border border-white/60 shadow-lg">
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -top-12 -left-10 h-40 w-40 rounded-full bg-gradient-to-br from-sky-300/50 to-cyan-400/40 blur-3xl"
            initial={{ opacity: 0.4, scale: 0.85 }}
            animate={{ opacity: 0.7, scale: 1.05 }}
            transition={{ duration: 3, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -bottom-12 -right-12 h-48 w-48 rounded-full bg-gradient-to-tl from-emerald-200/40 to-cyan-200/35 blur-3xl"
            initial={{ opacity: 0.3 }}
            animate={{ opacity: 0.6 }}
            transition={{ duration: 3.5, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
          />

          <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4 min-w-0">
                <motion.div
                  whileHover={{ scale: 1.05, rotate: [0, -3, 3, 0] }}
                  className="relative flex-shrink-0"
                >
                  <div className="relative h-11 w-11 rounded-2xl bg-gradient-to-br from-sky-600 via-cyan-600 to-emerald-600 text-white grid place-items-center shadow-xl shadow-cyan-500/30">
                    <MessageSquare className="h-5 w-5 relative z-10" />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/15 to-transparent" />
                  </div>
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 220 }}
                    className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-white text-sky-600 border border-sky-100 shadow-sm grid place-items-center"
                  >
                    <Sparkles className="h-3 w-3" />
                  </motion.div>
                  <motion.div
                    className="absolute inset-0 rounded-2xl border-2 border-cyan-400/30"
                    animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg sm:text-2xl font-semibold tracking-tight text-slate-900 truncate">
                      Messages
                    </h1>
                    <motion.div
                      animate={{ rotate: [0, 8, -8, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Sparkles className="h-4 w-4 text-cyan-500" />
                    </motion.div>
                  </div>
                  <p className="text-sm text-slate-600 leading-6 flex items-center gap-1.5">
                    <MessageCircle className="h-4 w-4 text-emerald-500" />
                    Collaborate with tenants and stay on top of every conversation.
                  </p>
                </div>
              </div>

              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center justify-end">
                <RemindersModal />
                <QuickTipsModal />
              </div>
            </div>

            {/* Search Tenant to Message */}
            <div className="pt-2 relative" style={{ zIndex: 100 }}>
              <SearchAndMessageTenant 
                onMessageSent={() => {}} 
                onChannelSelect={(channelId) => {
                  const channel = channels.find(c => c.id === channelId);
                  if (channel) {
                    setSelectedChannel(channel);
                    setIsMessageModalOpen(true);
                  }
                }}
              />
            </div>

          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="space-y-4 relative" style={{ zIndex: 1 }}>
        <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex flex-col gap-3">
              {/* Filter Select */}
              <FilterSelect 
                statusFilter={statusFilter} 
                onStatusFilterChange={onStatusFilterChange} 
              />
            </div>
          </CardHeader>
          <CardContent>
            {/* Channels List */}
            <div className="space-y-3">
              {sortedChannels.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-sky-100 to-emerald-100 rounded-full flex items-center justify-center mb-4">
                    <MessageCircle className="w-8 h-8 text-slate-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {statusFilter !== "ALL" 
                      ? "No matches found" 
                      : "No conversations yet"}
                  </h3>
                  <p className="text-slate-600 text-sm max-w-sm">
                    {statusFilter !== "ALL"
                      ? "Try adjusting your filter criteria"
                      : "Your conversations with tenants will appear here once they start messaging you"}
                  </p>
                </div>
              ) : (
                sortedChannels.map((channel) => {
                  const counterpart = currentUser?.id === channel.tenantId ? channel.landlord : channel.tenant;
                  const isOnline = onlineUsers.has(counterpart.id);
                  return (
                    <ChannelItem
                      key={channel.id}
                      channel={channel}
                      currentUser={currentUser}
                      onClick={() => handleChannelClick(channel)}
                      isOnline={isOnline}
                    />
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Message Modal */}
      <MessageModal
        channel={selectedChannel}
        isOpen={isMessageModalOpen}
        onClose={() => {
          setIsMessageModalOpen(false);
          setSelectedChannel(null);
        }}
        currentUser={currentUser}
      />
    </div>
  );
};

// Main Messages Component
const LandlordMessages = () => {
  const currentUser = useAuthStore((state) => state.user);
  const { channels, loading } = useChannels();
  const { onlineUsers } = usePresence();
  const [statusFilter, setStatusFilter] = useState<FilterType>("ALL");

  if (loading) {
    return (
      <div className="min-h-screen py-4">
        <MessagesSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-2">
      <ChatChannelsList
        channels={channels}
        statusFilter={statusFilter}
        currentUser={currentUser}
        onStatusFilterChange={setStatusFilter}
        onRefreshChannels={() => {}}
        onlineUsers={onlineUsers}
      />
    </div>
  );
};

export default LandlordMessages;