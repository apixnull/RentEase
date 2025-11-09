import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { getChannelMessagesRequest, sendMessageRequest, markMessagesAsReadRequest } from "@/api/chatApi";
import { inviteTenantForScreeningRequest } from "@/api/landlord/screeningApi";
import { format, isToday, isYesterday, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import PageHeader from "@/components/PageHeader";
import {
  MessageCircle,
  Send,
  Check,
  CheckCheck,
  Clock,
  FileCheck,
  FileText,
  Info,
  ShieldAlert
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

interface Unit {
  id: string;
  label: string;
  property: {
    id: string;
    title: string;
  };
}

interface Channel {
  id: string;
  status: "INQUIRY" | "ACTIVE" | "ENDED";
  tenantId: string;
  landlordId: string;
  unit: Unit
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
  const [data, setData] = useState<ChannelMessagesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [invitingToLease, setInvitingToLease] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showScreeningConfirmation, setShowScreeningConfirmation] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "Current Lease";
      case "ENDED":
        return "Previous Lease";
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
      await fetchMessages();
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

  const inviteTenantToLease = async () => {
    if (!channelId || invitingToLease) return;

    try {
      setInvitingToLease(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await sendMessageRequest(channelId, { 
        content: "I'd like to invite you to proceed with the lease agreement. Let's discuss the lease terms and move forward with the rental process." 
      });
      
      await fetchMessages();
    } catch (err) {
      setError("Failed to send lease invitation");
      console.error("Error inviting to lease:", err);
    } finally {
      setInvitingToLease(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    fetchMessages();
    
    const interval = setInterval(() => {
      fetchMessages();
    }, 5000);

    return () => clearInterval(interval);
  }, [channelId]);

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
  const groupedMessages = groupMessagesByDate(data.messages);

  // Custom title with role badge
  const pageHeaderTitle: React.ReactNode = (
    <div className="flex items-center gap-2 flex-wrap">
      <span>{otherParticipant?.name || ''}</span>
      {otherParticipant?.role && (
        <Badge 
          variant="outline" 
          className={`text-xs font-semibold border ${
            otherParticipant.role === "LANDLORD"
              ? "bg-purple-50 text-purple-700 border-purple-200 shadow-sm"
              : otherParticipant.role === "TENANT"
              ? "bg-blue-50 text-blue-700 border-blue-200 shadow-sm"
              : "bg-slate-50 text-slate-700 border-slate-200 shadow-sm"
          }`}
        >
          {otherParticipant.role}
        </Badge>
      )}
    </div>
  );

  // Description with highlighted status badge
  const pageHeaderDescription: React.ReactNode = (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-gray-600">
        {otherParticipant?.email || ''} • {data.channel.unit.property.title} • {data.channel.unit.label}
      </span>
      <Badge 
        variant="outline" 
        className={`text-xs font-semibold border ${
          data.channel.status === "INQUIRY" 
            ? "bg-blue-100 text-blue-700 border-blue-300 shadow-sm animate-pulse" 
            : getStatusColor(data.channel.status)
        }`}
      >
        {getStatusDisplay(data.channel.status)}
      </Badge>
    </div>
  );

  // Custom icon component that displays avatar with MessageCircle icon
  // This component will be used in place of the default icon in PageHeader
  const AvatarWithIcon = () => {
    if (!otherParticipant) return null;
    return (
      <div className="relative h-10 w-10">
        <Avatar className="h-10 w-10 border-2 border-white shadow-md">
          <AvatarImage src={otherParticipant.avatarUrl || undefined} />
          <AvatarFallback className="bg-gradient-to-br from-sky-500 to-emerald-500 text-white font-semibold text-sm">
            {otherParticipant.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-gradient-to-br from-emerald-600 to-emerald-500 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
          <MessageCircle className="h-3 w-3 text-white" />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-4">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Page Header */}
        {otherParticipant && (
          <PageHeader
            title={pageHeaderTitle}
            description={pageHeaderDescription}
            customIcon={<AvatarWithIcon />}
            actions={
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Invite Actions - Show based on status */}
                {data.channel.status === "INQUIRY" && (
                  <>
                    <Button
                      onClick={handleInviteTenantForScreening}
                      disabled={inviting}
                      size="sm"
                      className="gap-1.5 h-8 px-2.5 text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                      variant="outline"
                    >
                      <FileCheck className="h-3 w-3" />
                      <span className="hidden sm:inline">Screening</span>
                    </Button>
                    <Button
                      onClick={inviteTenantToLease}
                      disabled={invitingToLease}
                      size="sm"
                      className="gap-1.5 h-8 px-2.5 text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                      variant="outline"
                    >
                      <FileText className="h-3 w-3" />
                      <span className="hidden sm:inline">Lease</span>
                    </Button>
                  </>
                )}
                {data.channel.status === "ENDED" && (
                  <>
                    <Button
                      onClick={handleInviteTenantForScreening}
                      disabled={inviting}
                      size="sm"
                      className="gap-1.5 h-8 px-2.5 text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                      variant="outline"
                    >
                      <FileCheck className="h-3 w-3" />
                      <span className="hidden sm:inline">Screening</span>
                    </Button>
                    <Button
                      onClick={inviteTenantToLease}
                      disabled={invitingToLease}
                      size="sm"
                      className="gap-1.5 h-8 px-2.5 text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                      variant="outline"
                    >
                      <FileText className="h-3 w-3" />
                      <span className="hidden sm:inline">Lease</span>
                    </Button>
                  </>
                )}
                {/* Last updated */}
                <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
                  <Clock className="h-3 w-3" />
                  <span>{formatDistanceToNow(lastUpdate)} ago</span>
                </div>
              </div>
            }
          />
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Messages Area - Takes 2 columns on large screens */}
          <div className="lg:col-span-2 flex flex-col h-[calc(100vh-16rem)] min-h-[500px] max-w-full">
            <Card className="flex-1 flex flex-col overflow-hidden border-slate-200 shadow-sm">
              {/* Messages Container - Scrollable */}
              <div 
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 bg-slate-50/50"
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
