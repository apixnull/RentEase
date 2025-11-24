import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { getChannelMessagesRequest, sendMessageRequest, markMessagesAsReadRequest } from "@/api/chatApi";
import { useSocket } from "@/hooks/useSocket";
import { inviteTenantForScreeningRequest } from "@/api/landlord/screeningApi";
import { format, isToday, isYesterday, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MessageCircle,
  Send,
  Check,
  CheckCheck,
  Clock,
  FileText,
  Info,
  ShieldAlert,
  ShieldCheck,
  Users
} from "lucide-react";
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
import { motion } from "framer-motion";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  readAt: string | null;
  senderId: string;
}

interface Participant {
  id: string;
  name: string;
  avatarUrl: string | null;
  role: "TENANT" | "LANDLORD" | "ADMIN";
  email: string;
}

interface Channel {
  id: string;
  status: "INQUIRY" | "ACTIVE" | "ENDED";
  tenantId: string;
  landlordId: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ChannelMessagesResponse {
  channel: Channel;
  participants: Participant[];
  messages: Message[];
}

// Loading Skeleton Component
const MessagesSkeleton = () => (
  <div className="min-h-screen p-4 sm:p-6">
    <div className="max-w-7xl mx-auto space-y-6">
      <Skeleton className="h-24 w-full rounded-2xl" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-end gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-16 w-64 rounded-lg" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        <div className="hidden lg:block">
          <Card>
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </div>
);

const ViewChannelMessagesLandlord = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const { user: currentUser } = useAuthStore();
  const { socket, isConnected } = useSocket();
  const [data, setData] = useState<ChannelMessagesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showScreeningConfirmation, setShowScreeningConfirmation] = useState(false);
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
    return format(date, "HH:mm");
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

  // Get the OTHER participant (the one we're talking to, not the current user)
  const getOtherParticipant = () => {
    if (!data || !currentUser) return null;
    // Find the participant who is NOT the current user
    return data.participants.find(participant => participant.id !== currentUser.id);
  };

  const fetchMessages = async () => {
    if (!channelId) return;
    
    try {
      setError(null);
      const response = await getChannelMessagesRequest(channelId);
      setData(response.data);
      setLastUpdate(new Date());
      
      if (currentUser) {
        await markMessagesAsReadRequest(channelId);
      }
    } catch (err) {
      setError("Failed to load messages");
      console.error("Error fetching messages:", err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !channelId || sending) return;

    try {
      setSending(true);
      await sendMessageRequest(channelId, { content: newMessage.trim() });
      setNewMessage("");
      // Don't need to fetch - Socket.IO will update in real-time
    } catch (err) {
      setError("Failed to send message");
      console.error("Error sending message:", err);
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
    if (!channelId || inviting || !data) return;

    const otherParticipant = getOtherParticipant();
    if (!otherParticipant || !otherParticipant.email) {
      toast.error("Unable to get tenant email");
      setShowScreeningConfirmation(false);
      return;
    }

    try {
      setInviting(true);
      setShowScreeningConfirmation(false);
      
      // Call the screening invitation API - send to the other participant (tenant)
      const response = await inviteTenantForScreeningRequest({ tenantEmail: otherParticipant.email });
      
      // Show success toast with backend message
      if (response.data?.message) {
        toast.success(response.data.message);
      } else {
        toast.success("Tenant screening invitation sent successfully.");
      }
      
      // No need to send a pre-generated message - just refresh messages
      await fetchMessages();
    } catch (err: any) {
      console.error("Error inviting for screening:", err);
      
      // Handle specific error cases - only show toast, don't set error state
      if (err?.response?.status === 409) {
        // A screening invitation is already pending
        const errorMessage = err.response.data?.message || "A screening invitation is already pending for this tenant.";
        toast.error(errorMessage);
      } else {
        // Other errors
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

  // Initial load and join channel room
  useEffect(() => {
    if (!channelId) return;
    
    fetchMessages();
    
    // Join channel room for real-time updates
    if (socket && isConnected) {
      socket.emit("join:channel", channelId);
    }

    return () => {
      // Leave channel room on unmount
      if (socket && isConnected) {
        socket.emit("leave:channel", channelId);
      }
    };
  }, [channelId, socket, isConnected]);

  // Listen for new messages via Socket.IO
  useEffect(() => {
    if (!socket || !isConnected || !channelId) return;

    const handleNewMessage = async (messageData: Message & { channelId: string }) => {
      // Only process messages for this channel
      if (messageData.channelId !== channelId) return;

      console.log("📩 Received new message:", messageData);
      console.log("Current user ID:", currentUser?.id);
      console.log("Message sender ID:", messageData.senderId);
      
      // Check if message is from the other participant (not current user)
      const isFromOtherParticipant = currentUser?.id && messageData.senderId !== currentUser.id;
      console.log("Is from other participant:", isFromOtherParticipant);
      
      setData((prevData) => {
        if (!prevData) return prevData;

        // Check if message already exists (avoid duplicates)
        const messageExists = prevData.messages.some((msg) => msg.id === messageData.id);
        if (messageExists) return prevData;

        // Add new message to the list
        return {
          ...prevData,
          messages: [...prevData.messages, messageData],
        };
      });

      setLastUpdate(new Date());
      // Scroll to bottom after a short delay to ensure DOM is updated
      setTimeout(() => scrollToBottom(), 100);

      // IMMEDIATELY mark messages as read if the incoming message is from the other participant
      // User is viewing the channel (component is mounted), so mark as read right away
      if (isFromOtherParticipant && channelId && currentUser?.id) {
        console.log("🔄 Calling markMessagesAsReadRequest for channel:", channelId);
        markMessagesAsReadRequest(channelId)
          .then(() => {
            console.log("✅ Successfully marked messages as read");
          })
          .catch((err) => {
            console.error("❌ Error marking messages as read:", err);
          });
      } else {
        console.log("⏭️ Skipping mark as read - isFromOtherParticipant:", isFromOtherParticipant, "channelId:", channelId, "currentUser:", !!currentUser?.id);
      }
    };

    const handleReadReceipt = (receiptData: { channelId: string; readAt: string }) => {
      // Only process read receipts for this channel
      if (receiptData.channelId !== channelId) return;

      console.log("✅ Received read receipt:", receiptData);
      
      setData((prevData) => {
        if (!prevData) return prevData;

        // Update readAt for messages sent BY the other participant (messages we received)
        // This happens when we mark their messages as read
        const updatedMessages = prevData.messages.map((msg) => {
          // If message was sent by the other participant and not yet read, mark as read
          if (msg.senderId !== currentUser?.id && !msg.readAt) {
            return { ...msg, readAt: receiptData.readAt };
          }
          // Also update messages sent BY current user if they were read by the other participant
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
  }, [socket, isConnected, channelId, currentUser?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [data?.messages]);

  if (loading) {
    return <MessagesSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="text-red-500 mb-4">{error || "No messages found"}</div>
            <Button onClick={fetchMessages} variant="default">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const otherParticipant = getOtherParticipant();
  const participantInitials = otherParticipant?.name
    ? otherParticipant.name
        .split(" ")
        .map((part) => part.charAt(0))
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "";
  const groupedMessages = groupMessagesByDate(data.messages);

  return (
    <div className="min-h-screen space-y-6 px-4 pb-6 pt-3 sm:px-6 sm:pt-4">
      <div className="space-y-6">
        {/* Page Header */}
        {otherParticipant && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative overflow-hidden rounded-2xl"
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
              <div className="px-4 sm:px-6 py-5 space-y-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-4 min-w-0">
                    {otherParticipant && (
                      <motion.div
                        whileHover={{ scale: 1.03 }}
                        className="relative h-12 w-12 flex-shrink-0"
                      >
                        <Avatar className="h-12 w-12 border-2 border-white shadow-md">
                          <AvatarImage src={otherParticipant.avatarUrl || undefined} />
                          <AvatarFallback className="bg-gradient-to-br from-sky-500 to-emerald-500 text-white font-semibold text-sm">
                            {participantInitials || "TN"}
                          </AvatarFallback>
                        </Avatar>
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: 0.2, type: "spring", stiffness: 220 }}
                          className="absolute -bottom-1.5 -right-1.5 h-6 w-6 rounded-full bg-gradient-to-br from-sky-600 via-cyan-600 to-emerald-600 border-2 border-white text-white shadow-sm grid place-items-center"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                        </motion.div>
                      </motion.div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h1 className="text-lg sm:text-2xl font-semibold tracking-tight text-slate-900 truncate">
                          {otherParticipant?.name || "Conversation"}
                        </h1>
                        <motion.div
                          animate={{ rotate: [0, 8, -8, 0] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <Users className="h-4 w-4 text-emerald-500" />
                        </motion.div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                        <span className="text-sm text-slate-600">{otherParticipant?.email || "Tenant conversation"}</span>
                        <Badge
                          variant="outline"
                          className={`text-xs font-semibold border ${
                            data.channel.status === "INQUIRY"
                              ? "bg-blue-100 text-blue-700 border-blue-300 shadow-sm"
                              : getStatusColor(data.channel.status)
                          } rounded-full px-3`}
                        >
                          {getStatusDisplay(data.channel.status)}
                        </Badge>
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Clock className="h-3 w-3" />
                          Updated {formatDistanceToNow(lastUpdate)} ago
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                    {(data.channel.status === "INQUIRY" || data.channel.status === "ENDED") && (
                      <Button
                        onClick={handleInviteTenantForScreening}
                        disabled={inviting}
                        variant="outline"
                        className="gap-2 rounded-xl border-emerald-200 bg-white/70 text-emerald-700 hover:bg-emerald-50"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        Screen Tenant
                      </Button>
                    )}
                    <Button
                      onClick={() => navigate("/landlord/leases/create")}
                      className="rounded-xl bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500 px-5 text-sm font-semibold text-white shadow-md shadow-cyan-500/30 hover:brightness-110"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      New Lease
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Messages Area - Takes 2 columns on large screens */}
          <div className="lg:col-span-2 flex flex-col max-w-full min-h-[550px]">
            <Card className="flex-1 flex flex-col overflow-hidden border-slate-200 shadow-sm h-full">
              {/* Messages Container - Scrollable */}
              <div 
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 bg-slate-50/50 max-h-[70vh]"
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
                        {/* Date Header */}
                        <div className="flex justify-center">
                          <div className="bg-white border border-slate-200 px-3 py-1 rounded-full text-xs text-slate-600 shadow-sm">
                            {formatDateHeader(group.date)}
                          </div>
                        </div>

                        {/* Messages */}
                        {group.messages.map((message) => {
                          const sender = data.participants.find(p => p.id === message.senderId);
                          const isCurrentUser = currentUser?.id === message.senderId;
                          const isOtherParticipant = !isCurrentUser;
                          // Only show avatar for other participant (never for current user)
                          const showAvatar = isOtherParticipant;

                          return (
                            <div
                              key={message.id}
                              className={`flex items-end gap-3 ${
                                isCurrentUser ? "flex-row-reverse" : ""
                              }`}
                            >
                              {/* Avatar - only show for other participant, never for current user */}
                              {showAvatar && sender && (
                                <Avatar className="h-8 w-8 border-2 border-white shadow-sm flex-shrink-0">
                                  <AvatarImage src={sender.avatarUrl || undefined} />
                                  <AvatarFallback className="bg-gradient-to-br from-sky-500 to-emerald-500 text-white text-xs">
                                    {sender.name.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                              )}

                              {/* Spacer for alignment - only needed when avatar is not shown */}
                              {!showAvatar && <div className="w-8 flex-shrink-0"></div>}

                              {/* Message Content */}
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
                                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
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

              {/* Input Area - Fixed at bottom */}
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
            </Card>
          </div>

          {/* Reminders Sidebar - Right Section */}
          <div className="hidden lg:block">
            <Card className="border-slate-200 shadow-sm sticky top-6">
              <CardHeader className="pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-amber-600" />
                  <h3 className="font-semibold text-slate-900 text-sm">Reminders for Landlords</h3>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
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
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Screening Invitation Confirmation Dialog */}
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
      </div>

    </div>
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

export default ViewChannelMessagesLandlord;
