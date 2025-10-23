import { useEffect, useState, useRef } from "react";
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

const TENANT_TIPS = [
  {
    id: 1,
    title: "📅 Schedule Viewing",
    content: "Ask about available times to see the property in person",
    icon: "📅"
  },
  {
    id: 2,
    title: "💰 Rent Details",
    content: "Confirm monthly rent, security deposit, and utilities",
    icon: "💰"
  },
  {
    id: 3,
    title: "📝 Application Process",
    content: "Ask about required documents and screening criteria",
    icon: "📝"
  },
  {
    id: 4,
    title: "🏠 Amenities",
    content: "Discuss parking, laundry, pets, and other amenities",
    icon: "🏠"
  }
];

const ViewChannelMessagesTenant = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const { user: currentUser } = useAuthStore();
  const [data, setData] = useState<ChannelMessagesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
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
        return "Current Rental";
      case "ENDED":
        return "Previous Rental";
      case "INQUIRY":
        return "Rental Inquiry";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "ENDED":
        return "bg-slate-100 text-slate-800 border-slate-200";
      case "INQUIRY":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-slate-100 text-slate-800";
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

  const getLandlordParticipant = () => {
    if (!data) return null;
    return data.participants.find(participant => participant.role === "LANDLORD");
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-slate-600 font-medium">Loading conversation...</div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 font-medium mb-4">{error || "No messages found"}</div>
          <button 
            onClick={fetchMessages}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const landlordParticipant = getLandlordParticipant();
  const groupedMessages = groupMessagesByDate(data.messages);

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full bg-white shadow-sm">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <button 
                onClick={() => setShowSidebar(!showSidebar)}
                className="lg:hidden p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {landlordParticipant && (
                <>
                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center overflow-hidden shadow-sm">
                      {landlordParticipant.avatarUrl ? (
                        <img
                          src={landlordParticipant.avatarUrl}
                          alt={landlordParticipant.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-semibold text-white">
                          {landlordParticipant.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <h1 className="text-lg font-semibold text-slate-900">
                      {landlordParticipant.name}
                    </h1>
                    <div className="flex items-center space-x-3 text-sm">
                      <span className="text-slate-600 font-medium">{data.channel.unit.property.title} - {data.channel.unit.label}</span>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(data.channel.status)}`}>
                        {getStatusDisplay(data.channel.status)}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="text-right">
              <div className="text-xs text-slate-500 font-medium">Last updated</div>
              <div className="text-sm text-slate-700 font-medium">{formatDistanceToNow(lastUpdate)} ago</div>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto px-4 py-6 bg-slate-50/50"
        >
          <div className="max-w-3xl mx-auto space-y-6">
            {groupedMessages.map((group) => (
              <div key={group.date} className="space-y-4">
                {/* Date Header */}
                <div className="flex justify-center">
                  <div className="bg-white px-4 py-2 rounded-full text-sm text-slate-500 font-medium border border-slate-200 shadow-sm">
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
                      className={`flex items-start space-x-3 ${
                        isCurrentUser ? "flex-row-reverse space-x-reverse" : ""
                      }`}
                    >
                      {/* Avatar */}
                      {showAvatar && sender && !isCurrentUser && (
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex-shrink-0 overflow-hidden shadow-sm">
                          {sender.avatarUrl ? (
                            <img
                              src={sender.avatarUrl}
                              alt={sender.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="w-full h-full flex items-center justify-center text-sm font-semibold text-white">
                              {sender.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Spacer for alignment when no avatar */}
                      {!showAvatar && !isCurrentUser && <div className="w-10 flex-shrink-0"></div>}

                      {/* Message Content */}
                      <div
                        className={`max-w-[75%] ${
                          isCurrentUser ? "text-right" : ""
                        }`}
                      >
                        {showAvatar && sender && !isCurrentUser && (
                          <div className="text-sm text-slate-700 font-medium mb-1 ml-2">
                            {sender.name}
                          </div>
                        )}
                        <div
                          className={`px-4 py-3 rounded-2xl shadow-sm ${
                            isCurrentUser
                              ? "bg-blue-600 text-white rounded-br-md"
                              : "bg-white border border-slate-200 rounded-bl-md"
                          }`}
                        >
                          <p className="text-slate-900 text-sm leading-relaxed">{message.content}</p>
                        </div>
                        <div
                          className={`text-xs mt-2 ${
                            isCurrentUser ? "text-right text-blue-600" : "text-left text-slate-500"
                          } font-medium`}
                        >
                          {formatMessageTime(message.createdAt)}
                          {message.readAt && isCurrentUser && (
                            <span className="ml-2 text-blue-500">✓ Read</span>
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
        <div className="bg-white border-t border-slate-200 px-6 py-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end space-x-4">
              <div className="flex-1 border border-slate-300 rounded-xl px-4 py-3 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message about the rental..."
                  className="w-full outline-none resize-none bg-transparent text-sm max-h-32 placeholder-slate-400 text-slate-700"
                  rows={1}
                  disabled={sending}
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim() || sending}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold shadow-sm"
              >
                {sending ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Sending...</span>
                  </div>
                ) : (
                  "Send"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar - Rental Information & Tips */}
      <div 
        ref={sidebarRef}
        className={`w-80 bg-white border-l border-slate-200 transition-all duration-300 ${
          showSidebar ? "block absolute right-0 top-0 h-full z-50 shadow-xl" : "hidden"
        } lg:block lg:relative`}
      >
        <div className="p-6 h-full overflow-y-auto">
          {/* Close button for mobile */}
          <button 
            onClick={() => setShowSidebar(false)}
            className="lg:hidden absolute top-4 right-4 p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Rental Inquiry
          </h2>
          <p className="text-slate-600 text-sm mb-6">
            You're inquiring about this property with the landlord
          </p>

          {/* Property Info Card */}
          <div className="mb-6">
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Property Details
            </h3>
            <div className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600 font-medium">Property</span>
                <span className="text-sm font-semibold text-slate-900">{data.channel.unit.property.title}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600 font-medium">Unit</span>
                <span className="text-sm font-semibold text-slate-900">{data.channel.unit.label}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600 font-medium">Status</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(data.channel.status)}`}>
                  {getStatusDisplay(data.channel.status)}
                </span>
              </div>
            </div>
          </div>

          {/* Landlord Information */}
          <div className="mb-6">
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Landlord
            </h3>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              {landlordParticipant && (
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center overflow-hidden shadow-sm">
                    {landlordParticipant.avatarUrl ? (
                      <img
                        src={landlordParticipant.avatarUrl}
                        alt={landlordParticipant.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-semibold text-white">
                        {landlordParticipant.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-slate-900">{landlordParticipant.name}</div>
                    <div className="text-xs text-slate-500 font-medium">Property Owner</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Inquiry Tips */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Helpful Tips
            </h3>
            <div className="space-y-3">
              {TENANT_TIPS.map((tip) => (
                <div
                  key={tip.id}
                  className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-slate-50 border border-blue-100 hover:border-blue-200 transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-lg">{tip.icon}</div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-slate-900 mb-1">{tip.title}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">{tip.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {showSidebar && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/20 z-40"
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

export default ViewChannelMessagesTenant;