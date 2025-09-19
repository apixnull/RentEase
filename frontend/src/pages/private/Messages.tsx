import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  MessageCircle, 
  Send, 
  Search, 
  ArrowLeft,
  User,
  Check,
  CheckCheck,
  Trash2,
  Clock,
  MoreVertical,
  ImageIcon,
  Paperclip
} from "lucide-react";

type User = {
  id: string;
  name: string;
  email: string;
  role: "TENANT" | "LANDLORD";
  avatar?: string;
  lastSeen?: string;
};

type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender: User;
};

type Property = {
  id: string;
  title: string;
  type: string;
  street: string;
  barangay: string;
  city?: string;
  municipality?: string;
};

type Conversation = {
  id: string;
  title?: string;
  userAId: string;
  userBId: string;
  createdAt: string;
  updatedAt: string;
  userA: User;
  userB: User;
  property?: Property;
  messages: Message[];
  lastMessage?: Message;
  unreadCount: number;
};

// Mock data
const mockUsers: User[] = [
  { id: "u1", name: "John Doe", email: "john@example.com", role: "TENANT", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face", lastSeen: "2024-01-20T15:30:00Z" },
  { id: "u2", name: "Jane Smith", email: "jane@example.com", role: "LANDLORD", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face", lastSeen: "2024-01-20T14:45:00Z" },
  { id: "u3", name: "Mike Johnson", email: "mike@example.com", role: "TENANT", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face", lastSeen: "2024-01-19T22:15:00Z" },
  { id: "u4", name: "Sarah Wilson", email: "sarah@example.com", role: "LANDLORD", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face", lastSeen: "2024-01-20T10:20:00Z" },
];

const mockProperties: Property[] = [
  {
    id: "p1",
    title: "Sunset Apartments",
    type: "APARTMENT",
    street: "123 Mango Ave",
    barangay: "Barangay Luz",
    city: "Cebu City" 
  },
  {
    id: "p2",
    title: "Garden Villas",
    type: "CONDOMINIUM",
    street: "456 Pine Street",
    barangay: "Barangay Capitol",
    city: "Mandaue"
  },
  {
    id: "p3",
    title: "Cozy Boarding House",
    type: "BOARDING_HOUSE",
    street: "789 Oak Lane",
    barangay: "Barangay San Nicolas",
    municipality: "Toledo"
  }
];

const mockConversations: Conversation[] = [
  {
    id: "c1",
    title: "Unit 3A Inquiry",
    userAId: "u1",
    userBId: "u2",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-20T14:30:00Z",
    userA: mockUsers[0],
    userB: mockUsers[1],
    property: mockProperties[0],
    messages: [],
    lastMessage: {
      id: "m1",
      conversationId: "c1",
      senderId: "u2",
      content: "The unit is available for viewing this weekend. Would you like to schedule a visit?",
      isRead: false,
      createdAt: "2024-01-20T14:30:00Z",
      sender: mockUsers[1]
    },
    unreadCount: 2
  },
  {
    id: "c2",
    title: "Maintenance Request",
    userAId: "u1",
    userBId: "u4",
    createdAt: "2024-01-18T09:15:00Z",
    updatedAt: "2024-01-19T16:45:00Z",
    userA: mockUsers[0],
    userB: mockUsers[3],
    property: mockProperties[1],
    messages: [],
    lastMessage: {
      id: "m2",
      conversationId: "c2",
      senderId: "u1",
      content: "Thank you for fixing the leak so quickly!",
      isRead: true,
      createdAt: "2024-01-19T16:45:00Z",
      sender: mockUsers[0]
    },
    unreadCount: 0
  },
  {
    id: "c3",
    title: "Rent Payment Discussion",
    userAId: "u3",
    userBId: "u2",
    createdAt: "2024-01-10T11:20:00Z",
    updatedAt: "2024-01-20T08:15:00Z",
    userA: mockUsers[2],
    userB: mockUsers[1],
    property: mockProperties[2],
    messages: [],
    lastMessage: {
      id: "m3",
      conversationId: "c3",
      senderId: "u2",
      content: "I've received your payment. Thank you!",
      isRead: true,
      createdAt: "2024-01-20T08:15:00Z",
      sender: mockUsers[1]
    },
    unreadCount: 0
  }
];

const mockMessages: Message[] = [
  {
    id: "m1",
    conversationId: "c1",
    senderId: "u1",
    content: "Hi, I'm interested in Unit 3A. Is it still available?",
    isRead: true,
    createdAt: "2024-01-15T10:00:00Z",
    sender: mockUsers[0]
  },
  {
    id: "m2",
    conversationId: "c1",
    senderId: "u2",
    content: "Yes, it's still available! The unit is fully furnished and ready for move-in.",
    isRead: true,
    createdAt: "2024-01-15T10:15:00Z",
    sender: mockUsers[1]
  },
  {
    id: "m3",
    conversationId: "c1",
    senderId: "u1",
    content: "Great! What's the monthly rent and what's included?",
    isRead: true,
    createdAt: "2024-01-15T10:30:00Z",
    sender: mockUsers[0]
  },
  {
    id: "m4",
    conversationId: "c1",
    senderId: "u2",
    content: "The rent is ₱15,000/month. It includes WiFi, water, and basic furniture. Electricity is separate.",
    isRead: true,
    createdAt: "2024-01-15T10:45:00Z",
    sender: mockUsers[1]
  },
  {
    id: "m5",
    conversationId: "c1",
    senderId: "u2",
    content: "The unit is available for viewing this weekend. Would you like to schedule a visit?",
    isRead: false,
    createdAt: "2024-01-20T14:30:00Z",
    sender: mockUsers[1]
  }
];

const Messages = () => {
  const [currentUser] = useState<User>({ id: "u1", name: "John Doe", email: "john@example.com", role: "TENANT", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face" });
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [hoveredMessage, setHoveredMessage] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showDeleteConversationConfirm, setShowDeleteConversationConfirm] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const checkScrollPosition = useCallback(() => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      setIsAtBottom(distanceFromBottom < 100);
      setShowScrollButton(distanceFromBottom > 300);
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, []);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollPosition);
      return () => container.removeEventListener('scroll', checkScrollPosition);
    }
  }, [checkScrollPosition]);

  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom();
    }
  }, [messages, isAtBottom, scrollToBottom]);

  const selectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setMessages(mockMessages.filter(m => m.conversationId === conversation.id));
    setShowMobileChat(true);
    
    // Mark messages as read
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversation.id 
          ? { ...conv, unreadCount: 0, messages: conv.messages.map(m => ({ ...m, isRead: true })) }
          : conv
      )
    );
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message: Message = {
      id: `m${Date.now()}`,
      conversationId: selectedConversation.id,
      senderId: currentUser.id,
      content: newMessage.trim(),
      isRead: true,
      createdAt: new Date().toISOString(),
      sender: currentUser
    };

    setMessages(prev => [...prev, message]);
    setNewMessage("");

    // Update conversation last message
    setConversations(prev =>
      prev.map(conv =>
        conv.id === selectedConversation.id
          ? { ...conv, lastMessage: message, updatedAt: message.createdAt }
          : conv
      )
    );
  };

  const deleteMessage = (messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
    
    // Update conversation last message if deleted message was the last one
    if (selectedConversation) {
      const remainingMessages = messages.filter(msg => msg.id !== messageId);
      const newLastMessage = remainingMessages[remainingMessages.length - 1];
      
      setConversations(prev =>
        prev.map(conv =>
          conv.id === selectedConversation.id
            ? { ...conv, lastMessage: newLastMessage }
            : conv
        )
      );
    }
    setShowDeleteConfirm(null);
  };

  const deleteConversation = (conversationId: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== conversationId));
    if (selectedConversation?.id === conversationId) {
      setSelectedConversation(null);
      setMessages([]);
      setShowMobileChat(false);
    }
    setShowDeleteConversationConfirm(null);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const formatLastSeen = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);

    if (diffInMinutes < 1) {
      return "Just now";
    } else if (diffInMinutes < 60) {
      return `${Math.floor(diffInMinutes)}m ago`;
    } else if (diffInMinutes < 1440) { // 24 hours
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  const getOtherUser = (conversation: Conversation) => {
    return conversation.userAId === currentUser.id ? conversation.userB : conversation.userA;
  };

  const getRoleColor = (role: string) => {
    return role === "TENANT" ? "emerald" : "blue";
  };

  const getConversationLabel = (conversation: Conversation) => {
    const otherUser = getOtherUser(conversation);
    const property = conversation.property;
    if (property) {
      const location = property.city || property.municipality || '';
      return `${otherUser.name} • ${property.title} • ${location}`;
    }
    return otherUser.name;
  };

  const filteredConversations = conversations.filter(conv => {
    const otherUser = getOtherUser(conv);
    return otherUser.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           conv.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           conv.lastMessage?.content.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-100 to-sky-100 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-medium">
              <span>{currentUser.role} • Messages</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Messages</h1>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-0 min-h-0">
        {/* Conversations List */}
        <div className={`lg:col-span-1 ${showMobileChat ? 'hidden lg:block' : 'block'} border-r border-gray-200 bg-white`}>
          <div className="h-full flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className="pl-10 bg-gray-50 border-gray-200"
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length > 0 ? (
                filteredConversations.map((conversation) => {
                  const otherUser = getOtherUser(conversation);
                  const roleColor = getRoleColor(otherUser.role);
                  
                  return (
                    <div
                      key={conversation.id}
                      onClick={() => selectConversation(conversation)}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedConversation?.id === conversation.id ? 'bg-emerald-50 border-emerald-200' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative flex-shrink-0">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-100 to-sky-100 flex items-center justify-center overflow-hidden">
                            {otherUser.avatar ? (
                              <img
                                src={otherUser.avatar}
                                alt={otherUser.name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <User className="h-6 w-6 text-gray-500" />
                            )}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                            roleColor === 'emerald' ? 'bg-emerald-500' : 'bg-blue-500'
                          }`} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-gray-900 truncate text-sm">{getConversationLabel(conversation)}</h3>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500 whitespace-nowrap">
                                {conversation.lastMessage && formatTime(conversation.lastMessage.createdAt)}
                              </span>
                              {conversation.unreadCount > 0 && (
                                <span className="bg-emerald-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                  {conversation.unreadCount}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              roleColor === 'emerald' 
                                ? 'bg-emerald-100 text-emerald-700' 
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {otherUser.role}
                            </span>
                            {conversation.title && (
                              <span className="text-xs text-gray-500 truncate">{conversation.title}</span>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 line-clamp-1">
                            {conversation.lastMessage?.content || "No messages yet"}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-6 text-center">
                  <MessageCircle className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-sm font-medium text-gray-900 mb-1">No conversations found</h3>
                  <p className="text-xs text-gray-600">Try adjusting your search or start a new conversation.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className={`lg:col-span-3 ${showMobileChat ? 'block' : 'hidden lg:block'} bg-white`}>
          {selectedConversation ? (
            <div className="h-full flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-sky-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowMobileChat(false)}
                      className="lg:hidden p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </button>
                    
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-100 to-sky-100 flex items-center justify-center overflow-hidden">
                        {getOtherUser(selectedConversation).avatar ? (
                          <img
                            src={getOtherUser(selectedConversation).avatar}
                            alt={getOtherUser(selectedConversation).name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                        getRoleColor(getOtherUser(selectedConversation).role) === 'emerald' ? 'bg-emerald-500' : 'bg-blue-500'
                      }`} />
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">{getConversationLabel(selectedConversation)}</h3>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          getRoleColor(getOtherUser(selectedConversation).role) === 'emerald' 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {getOtherUser(selectedConversation).role}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>Last seen {formatLastSeen(getOtherUser(selectedConversation).lastSeen || '')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="p-2 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowDeleteConversationConfirm(selectedConversation.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="p-2 text-gray-500 hover:text-gray-700"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div 
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-gray-100"
              >
                {messages.map((message) => {
                  const isOwn = message.senderId === currentUser.id;
                  const showAvatar = !isOwn;
                  
                  return (
                    <div 
                      key={message.id} 
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}
                      onMouseEnter={() => setHoveredMessage(message.id)}
                      onMouseLeave={() => setHoveredMessage(null)}
                    >
                      <div className={`flex items-end gap-2 max-w-[75%] ${isOwn ? 'order-2' : 'order-1'}`}>
                        {showAvatar && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-100 to-sky-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {message.sender.avatar ? (
                              <img
                                src={message.sender.avatar}
                                alt={message.sender.name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <User className="h-4 w-4 text-gray-500" />
                            )}
                          </div>
                        )}
                        
                        <div className={`relative px-4 py-3 rounded-2xl shadow-sm ${
                          isOwn 
                            ? 'bg-gradient-to-r from-emerald-500 to-sky-500 text-white' 
                            : 'bg-white text-gray-900 border border-gray-200'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                          <div className={`flex items-center justify-end gap-1 mt-1 ${
                            isOwn ? 'text-white/70' : 'text-gray-500'
                          }`}>
                            <span className="text-xs">{formatTime(message.createdAt)}</span>
                            {isOwn && (
                              <div className="flex items-center">
                                {message.isRead ? (
                                  <CheckCheck className="h-3 w-3" />
                                ) : (
                                  <Check className="h-3 w-3" />
                                )}
                              </div>
                            )}
                          </div>
                          
                          {/* Delete button - only show on hover and for own messages */}
                          {isOwn && hoveredMessage === message.id && (
                            <button
                              onClick={() => setShowDeleteConfirm(message.id)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-md"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
                
                {/* Scroll to bottom button */}
                {showScrollButton && (
                  <button
                    onClick={scrollToBottom}
                    className="fixed bottom-24 right-6 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4 transform rotate-90" />
                  </button>
                )}
              </div>

              {/* Message Input */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="text-gray-500">
                    <Paperclip className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-gray-500">
                    <ImageIcon className="h-5 w-5" />
                  </Button>
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type your message..."
                    className="flex-1 rounded-full"
                  />
                  <Button 
                    onClick={sendMessage} 
                    disabled={!newMessage.trim()}
                    className="rounded-full bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-700 hover:to-sky-700"
                    size="icon"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center bg-white">
              <div className="text-center p-6">
                <div className="bg-gradient-to-r from-emerald-100 to-sky-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                <p className="text-sm text-gray-600 max-w-xs">Choose a conversation from the list to start messaging or search for someone to begin a new conversation.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Message Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-auto shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Message</h3>
            <p className="text-gray-600 mb-4">Are you sure you want to delete this message? This action cannot be undone.</p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => deleteMessage(showDeleteConfirm)}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Conversation Confirmation Modal */}
      {showDeleteConversationConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-auto shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Conversation</h3>
            <p className="text-gray-600 mb-4">Are you sure you want to delete this conversation? All messages will be permanently removed.</p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConversationConfirm(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => deleteConversation(showDeleteConversationConfirm)}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;