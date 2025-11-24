import { useEffect, useState, useMemo } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { getUserChatChannelsRequest } from "@/api/chatApi";
import { useSocket } from "@/hooks/useSocket";
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
import MessagesHeader from "@/components/MessagesHeader";
import { 
  Search, 
  MessageCircle, 
  Check,
  CheckCheck,
  MessageSquare,
  Send,
  HelpCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  onClick 
}: { 
  channel: Channel;
  currentUser: any;
  onClick: () => void;
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
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
      "INQUIRY": "My Inquiry",
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

// Filter Buttons Component
const FilterButtons = ({ 
  statusFilter, 
  onStatusFilterChange 
}: { 
  statusFilter: FilterType;
  onStatusFilterChange: (filter: FilterType) => void;
}) => {
  const filters: { key: FilterType; label: string }[] = [
    { key: "ALL", label: "All Chats" },
    { key: "INQUIRY", label: "My Inquiry" },
    { key: "ACTIVE", label: "Active Lease" },
    { key: "ENDED", label: "Ended Lease" }
  ];

  return (
    <div className="flex gap-1 flex-wrap">
      {filters.map((filter) => (
        <Button
          key={filter.key}
          variant={statusFilter === filter.key ? "default" : "outline"}
          size="sm"
          onClick={() => onStatusFilterChange(filter.key)}
          className={`rounded-lg text-xs px-4 transition-all ${
            statusFilter === filter.key 
              ? 'bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-600 hover:to-emerald-600 text-white shadow-sm' 
              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
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
            Click any conversation to view messages and communicate with landlords about lease information.
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
              <div>
                <p className="text-sm font-medium text-slate-900 mb-1">Unread Messages</p>
                <p className="text-xs text-slate-600">
                  A blue indicator dot shows when you have unread messages from landlords.
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

// Chat Channels List Component
const ChatChannelsList = ({
  channels,
  searchQuery,
  statusFilter,
  currentUser,
  onSearchChange,
  onStatusFilterChange,
}: {
  channels: Channel[];
  searchQuery: string;
  statusFilter: FilterType;
  currentUser: any;
  onSearchChange: (query: string) => void;
  onStatusFilterChange: (filter: FilterType) => void;
}) => {
  const navigate = useNavigate();

  const getCounterpart = (channel: Channel): User => {
    return currentUser?.id === channel.tenantId ? channel.landlord : channel.tenant;
  };

  const filteredChannels = useMemo(() => {
    return channels.filter(channel => {
      if (statusFilter !== "ALL" && channel.status !== statusFilter) return false;

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const counterpart = getCounterpart(channel);
        const searchableText = [
          counterpart.firstName,
          counterpart.lastName,
          channel.lastMessageText
        ].join(" ").toLowerCase();
        return searchableText.includes(query);
      }

      return true;
    });
  }, [channels, searchQuery, statusFilter, currentUser]);

  const sortedChannels = useMemo(() => {
    return [...filteredChannels].sort((a, b) => {
      const aDate = a.lastMessageAt || a.updatedAt || a.createdAt;
      const bDate = b.lastMessageAt || b.updatedAt || b.createdAt;
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    });
  }, [filteredChannels]);

  const handleChannelClick = (channel: Channel) => {
    navigate(`/tenant/messages/${channel.id}`);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header Section */}
      <MessagesHeader
        title="Messages"
        description="Connect with landlords and manage your conversations"
        actions={
          <div className="flex items-center gap-2">
            <QuickTipsModal />
          </div>
        }
      />

      {/* Main Content */}
      <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 h-11 bg-slate-50 border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 rounded-lg text-sm"
              />
            </div>
            
            {/* Filters Row */}
            <FilterButtons 
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
                  {searchQuery || statusFilter !== "ALL" 
                    ? "No matches found" 
                    : "No conversations yet"}
                </h3>
                <p className="text-slate-600 text-sm max-w-sm">
                  {searchQuery || statusFilter !== "ALL" 
                    ? "Try adjusting your search or filter criteria"
                    : "Your conversations with landlords will appear here once you start messaging"}
                </p>
              </div>
            ) : (
              sortedChannels.map((channel) => (
                <ChannelItem
                  key={channel.id}
                  channel={channel}
                  currentUser={currentUser}
                  onClick={() => handleChannelClick(channel)}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Main Messages Component
const TenantMessages = () => {
  const currentUser = useAuthStore((state) => state.user);
  const { channels, loading } = useChannels();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterType>("ALL");

  if (loading) {
    return (
      <div className="min-h-screen py-4">
        <MessagesSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-4">
      <ChatChannelsList
        channels={channels}
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        currentUser={currentUser}
        onSearchChange={setSearchQuery}
        onStatusFilterChange={setStatusFilter}
      />
    </div>
  );
};

export default TenantMessages;