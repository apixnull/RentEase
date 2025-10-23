import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { getChannelMessagesRequest, sendMessageRequest, markMessagesAsReadRequest } from "@/api/chatApi";
import { format, isToday, isYesterday, formatDistanceToNow } from "date-fns";

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
  unit: Unit;
}

interface ChannelMessagesResponse {
  channel: Channel;
  participants: Participant[];
  messages: Message[];
}

const TIPS_AND_ADS = [
  {
    id: 1,
    type: "tip",
    title: "💡 Screening Tip",
    content: "Always verify tenant documents before scheduling viewings",
  },
  {
    id: 2,
    type: "ad",
    title: "🏠 Premium Listing",
    content: "Get your property featured on our homepage!",
  },
  {
    id: 3,
    type: "tip",
    title: "📝 Document Checklist",
    content: "Request ID, proof of income, and rental history for screening",
  }
];

const ViewChannelMessagesLandlord = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const { user: currentUser } = useAuthStore();
  const [data, setData] = useState<ChannelMessagesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [showSidebar, setShowSidebar] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "Current Tenant";
      case "ENDED":
        return "Previous Tenant";
      case "INQUIRY":
        return "Prospective Tenant";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800 border-green-200";
      case "ENDED":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "INQUIRY":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800";
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

  const getTenantParticipant = () => {
    if (!data) return null;
    return data.participants.find(participant => participant.role === "TENANT");
  };

  const fetchMessages = async () => {
    if (!channelId) return;
    
    try {
      setError(null);
      const response = await getChannelMessagesRequest(channelId);
      setData(response.data);
      setLastUpdate(new Date());
      
      // Mark messages as read when fetching new messages
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
      // Refresh messages to show the new one
      await fetchMessages();
    } catch (err) {
      setError("Failed to send message");
      console.error("Error sending message:", err);
    } finally {
      setSending(false);
    }
  };

  const inviteTenantForScreening = async () => {
    if (!channelId || inviting) return;

    try {
      setInviting(true);
      // TODO: Replace with actual screening invitation API
      // await inviteForScreeningRequest(channelId);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Send automated message about screening
      await sendMessageRequest(channelId, { 
        content: "I'd like to invite you for a tenant screening process. This will help us move forward with your application. Please let me know your availability." 
      });
      
      // Refresh messages
      await fetchMessages();
      
    } catch (err) {
      setError("Failed to send screening invitation");
      console.error("Error inviting for screening:", err);
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

  // Simulate real-time updates with polling
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
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-400 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-600">Loading conversation...</div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">{error || "No messages found"}</div>
          <button 
            onClick={fetchMessages}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const tenantParticipant = getTenantParticipant();
  const groupedMessages = groupMessagesByDate(data.messages);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <button 
                onClick={() => setShowSidebar(!showSidebar)}
                className="lg:hidden p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {tenantParticipant && (
                <>
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                      {tenantParticipant.avatarUrl ? (
                        <img
                          src={tenantParticipant.avatarUrl}
                          alt={tenantParticipant.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-medium text-gray-600">
                          {tenantParticipant.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <h1 className="text-lg font-semibold text-gray-900">
                      {tenantParticipant.name}
                    </h1>
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-gray-600">{data.channel.unit.property.title} - {data.channel.unit.label}</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded border ${getStatusColor(data.channel.status)}`}>
                        {getStatusDisplay(data.channel.status)}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center space-x-3">


              <div className="text-right">
                <div className="text-xs text-gray-500">Last updated</div>
                <div className="text-sm text-gray-700">{formatDistanceToNow(lastUpdate)} ago</div>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto px-4 py-6"
        >
          <div className="space-y-6">
            {groupedMessages.map((group) => (
              <div key={group.date} className="space-y-4">
                {/* Date Header */}
                <div className="flex justify-center">
                  <div className="bg-gray-200 px-3 py-1 rounded-full text-sm text-gray-600">
                    {formatDateHeader(group.date)}
                  </div>
                </div>

                {/* Messages */}
                {group.messages.map((message, index) => {
                  const sender = data.participants.find(p => p.id === message.senderId);
                  const isCurrentUser = currentUser?.id === message.senderId;
                  const showAvatar = index === 0 || group.messages[index - 1]?.senderId !== message.senderId;

                  return (
                    <div
                      key={message.id}
                      className={`flex items-end space-x-3 ${
                        isCurrentUser ? "flex-row-reverse space-x-reverse" : ""
                      }`}
                    >
                      {/* Avatar */}
                      {showAvatar && sender && !isCurrentUser && (
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0 overflow-hidden">
                          {sender.avatarUrl ? (
                            <img
                              src={sender.avatarUrl}
                              alt={sender.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="w-full h-full flex items-center justify-center text-xs font-medium text-gray-600">
                              {sender.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Spacer for alignment when no avatar */}
                      {!showAvatar && !isCurrentUser && <div className="w-8 flex-shrink-0"></div>}

                      {/* Message Content */}
                      <div
                        className={`max-w-[70%] ${
                          isCurrentUser ? "text-right" : ""
                        }`}
                      >
                        {showAvatar && sender && !isCurrentUser && (
                          <div className="text-xs text-gray-600 mb-1 ml-2">
                            {sender.name}
                          </div>
                        )}
                        <div
                          className={`px-4 py-2 rounded-2xl ${
                            isCurrentUser
                              ? "bg-blue-600 text-white rounded-br-none"
                              : "bg-white border border-gray-200 rounded-bl-none"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        </div>
                        <div
                          className={`text-xs mt-1 ${
                            isCurrentUser ? "text-right text-blue-600" : "text-left text-gray-500"
                          }`}
                        >
                          {formatMessageTime(message.createdAt)}
                          {message.readAt && isCurrentUser && (
                            <span className="ml-1">✓ Read</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex items-end space-x-4">
            <div className="flex-1 border border-gray-300 rounded-lg px-4 py-2 bg-white">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="w-full outline-none resize-none bg-transparent text-sm max-h-32"
                rows={1}
                disabled={sending}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || sending}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar - Landlord Tools & Info */}
      <div 
        ref={sidebarRef}
        className={`w-80 bg-white border-l border-gray-200 transition-all duration-300 ${
          showSidebar ? "block absolute right-0 top-0 h-full z-50 shadow-2xl" : "hidden"
        } lg:block lg:relative`}
      >
        <div className="p-6 h-full overflow-y-auto">
          {/* Close button for mobile */}
          <button 
            onClick={() => setShowSidebar(false)}
            className="lg:hidden absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Landlord Tools
          </h2>

          {/* Quick Actions */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={inviteTenantForScreening}
                disabled={inviting || data.channel.status !== "INQUIRY"}
                className="w-full bg-green-50 text-green-700 px-4 py-3 rounded-lg border border-green-200 hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium text-left flex items-center space-x-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Invite for Tenant Screening</span>
              </button>
              
            </div>
          </div>

          {/* Property Info Card */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-3">Property Details</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Property</span>
                <span className="text-sm font-medium">{data.channel.unit.property.title}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Unit</span>
                <span className="text-sm font-medium">{data.channel.unit.label}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Status</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(data.channel.status)}`}>
                  {getStatusDisplay(data.channel.status)}
                </span>
              </div>
            </div>
          </div>

          {/* Tenant Info */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-3">Tenant Information</h3>
            <div className="space-y-3">
              {tenantParticipant && (
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                    {tenantParticipant.avatarUrl ? (
                      <img
                        src={tenantParticipant.avatarUrl}
                        alt={tenantParticipant.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium text-gray-600">
                        {tenantParticipant.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{tenantParticipant.name}</div>
                    <div className="text-xs text-gray-500">Prospective Tenant</div>
                  </div>
                </div>
              )}
              <div className="text-xs text-gray-600">
                {data.channel.status === "INQUIRY" && "This tenant has expressed interest in your property"}
                {data.channel.status === "ACTIVE" && "This tenant is currently renting your property"}
                {data.channel.status === "ENDED" && "This tenant previously rented your property"}
              </div>
            </div>
          </div>

          {/* Landlord Tips */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Landlord Tips</h3>
            <div className="space-y-3">
              {TIPS_AND_ADS.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-lg bg-gray-50 border border-gray-200"
                >
                  <h4 className="font-medium text-sm text-gray-900 mb-1">{item.title}</h4>
                  <p className="text-xs text-gray-600">{item.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {showSidebar && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/30 z-40"
          onClick={() => setShowSidebar(false)}
        />
      )}
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