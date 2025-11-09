import { useEffect, useState, useMemo } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { getUserChatChannelsRequest } from "@/api/chatApi";
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
import PageHeader from "@/components/PageHeader";
import { 
  Search, 
  MessageCircle, 
  Building,
  Check,
  CheckCheck,
  Home,
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

type Property = {
  id: string; 
  title: string;
};

type Unit = {
  id: string;
  label: string;
  property: Property;
};

type Channel = {
  id: string;
  tenantId: string;
  landlordId: string;
  unitId: string;
  status: "INQUIRY" | "LEASE" | "PREV-LEASE";
  createdAt: string;
  updatedAt: string;
  lastMessageText: string | null;
  lastMessageAt: string | null;
  lastMessageSenderId: string | null;
  readAt: string | null;
  tenant: User;
  landlord: User;
  unit: Unit;
};

type FilterType = "ALL" | "INQUIRY" | "LEASE" | "PREV-LEASE";

// Custom Hook for Channels - Real-time updates via polling
const useChannels = () => {
  const currentUser = useAuthStore((state) => state.user);
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

  // Silent refetch for real-time updates (no loading state)
  const silentRefetch = async () => {
    try {
      const response = await getUserChatChannelsRequest();
      const channelsData = Array.isArray(response.data) ? response.data : [];
      setChannels(channelsData);
    } catch (error) {
      console.error("Failed to silently refetch channels:", error);
    }
  };

  useEffect(() => {
    if (!currentUser) return;

    // Initial load
    loadChannels();

    // Polling for real-time updates every 10 seconds
    const interval = setInterval(() => {
      silentRefetch();
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [currentUser]);

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
          <div className="flex gap-2">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 flex-1" />
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
      "LEASE": "bg-emerald-50 text-emerald-700 border-emerald-200",
      "PREV-LEASE": "bg-amber-50 text-amber-700 border-amber-200"
    };
    return colors[status as keyof typeof colors] || "bg-slate-100 text-slate-700 border-slate-200";
  };

  const getStatusDisplayText = (status: string) => {
    const texts = {
      "INQUIRY": "Inquiry",
      "LEASE": "Current Lease",
      "PREV-LEASE": "Previous Lease"
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

          <p className={`text-xs mb-2 line-clamp-2 ${
            hasUnread ? 'text-slate-800 font-medium' : 'text-slate-600'
          }`}>
            {getLastMessageDisplay(channel)}
          </p>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <Building className="w-3 h-3" />
              <span className="truncate">{channel.unit.property.title}</span>
            </div>
            <div className="flex items-center gap-1">
              <Home className="w-3 h-3" />
              <span className="truncate">{channel.unit.label}</span>
            </div>
          </div>
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
    { key: "INQUIRY", label: "Inquiries" },
    { key: "LEASE", label: "Current Leases" },
    { key: "PREV-LEASE", label: "Previous Leases" }
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
            Click any conversation to view messages and communicate with tenants about property details and lease information.
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
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
              <Building className="w-4 h-4 text-slate-500 mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-slate-900 mb-1">Filter by Property</p>
                <p className="text-xs text-slate-600">
                  Use the property and unit filters to quickly find conversations related to specific properties.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Property and Unit Filters Component
const PropertyUnitFilters = ({
  propertyFilter,
  unitFilter,
  properties,
  units,
  onPropertyFilterChange,
  onUnitFilterChange,
}: {
  propertyFilter: string;
  unitFilter: string;
  properties: Property[];
  units: Unit[];
  onPropertyFilterChange: (filter: string) => void;
  onUnitFilterChange: (filter: string) => void;
}) => {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-2">
        <Building className="w-3.5 h-3.5 text-slate-500" />
        <select
          value={propertyFilter}
          onChange={(e) => {
            onPropertyFilterChange(e.target.value);
            onUnitFilterChange("ALL");
          }}
          className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 bg-white transition-all min-w-[140px]"
        >
          <option value="ALL">All Properties</option>
          {properties.map(property => (
            <option key={property.id} value={property.id}>
              {property.title.length > 20 ? property.title.substring(0, 20) + '...' : property.title}
            </option>
          ))}
        </select>
      </div>
      
      {propertyFilter !== "ALL" && (
        <div className="flex items-center gap-2">
          <Home className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={unitFilter}
            onChange={(e) => onUnitFilterChange(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 bg-white transition-all min-w-[120px]"
          >
            <option value="ALL">All Units</option>
            {units
              .filter(unit => unit.property.id === propertyFilter)
              .map(unit => (
                <option key={unit.id} value={unit.id}>
                  {unit.label}
                </option>
              ))
            }
          </select>
        </div>
      )}
    </div>
  );
};

// Chat Channels List Component
const ChatChannelsList = ({
  channels,
  searchQuery,
  statusFilter,
  propertyFilter,
  unitFilter,
  currentUser,
  properties,
  units,
  onSearchChange,
  onStatusFilterChange,
  onPropertyFilterChange,
  onUnitFilterChange,
}: {
  channels: Channel[];
  searchQuery: string;
  statusFilter: FilterType;
  propertyFilter: string;
  unitFilter: string;
  currentUser: any;
  properties: Property[];
  units: Unit[];
  onSearchChange: (query: string) => void;
  onStatusFilterChange: (filter: FilterType) => void;
  onPropertyFilterChange: (filter: string) => void;
  onUnitFilterChange: (filter: string) => void;
}) => {
  const navigate = useNavigate();

  const getCounterpart = (channel: Channel): User => {
    return currentUser?.id === channel.tenantId ? channel.landlord : channel.tenant;
  };

  const filteredChannels = useMemo(() => {
    return channels.filter(channel => {
      if (statusFilter !== "ALL" && channel.status !== statusFilter) return false;
      if (propertyFilter !== "ALL" && channel.unit.property.id !== propertyFilter) return false;
      if (unitFilter !== "ALL" && channel.unit.id !== unitFilter) return false;

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const counterpart = getCounterpart(channel);
        const searchableText = [
          counterpart.firstName,
          counterpart.lastName,
          channel.unit.label,
          channel.unit.property.title,
          channel.lastMessageText
        ].join(" ").toLowerCase();
        return searchableText.includes(query);
      }

      return true;
    });
  }, [channels, searchQuery, statusFilter, propertyFilter, unitFilter, currentUser]);

  const sortedChannels = useMemo(() => {
    return [...filteredChannels].sort((a, b) => {
      const aDate = a.lastMessageAt || a.updatedAt || a.createdAt;
      const bDate = b.lastMessageAt || b.updatedAt || b.createdAt;
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    });
  }, [filteredChannels]);

  const handleChannelClick = (channel: Channel) => {
    navigate(`/landlord/messages/${channel.id}`);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header Section */}
      <PageHeader
        title="Messages"
        description="Manage conversations with your tenants"
        icon={MessageCircle}
        actions={
          <div className="flex items-center gap-2">
            <QuickTipsModal />
            <div className="hidden sm:flex items-center gap-2 text-sky-500/80">
              <MessageSquare className="h-4 w-4" />
              <Send className="h-4 w-4" />
            </div>
          </div>
        }
      />

      {/* Main Content */}
      <div className="space-y-4">
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
              
              {/* Filters Row - Status and Property/Unit filters together */}
              <div className="flex items-center gap-2 flex-wrap">
                <FilterButtons 
                  statusFilter={statusFilter} 
                  onStatusFilterChange={onStatusFilterChange} 
                />
                
                <div className="h-6 w-px bg-slate-200 hidden sm:block" />
                
                <PropertyUnitFilters
                  propertyFilter={propertyFilter}
                  unitFilter={unitFilter}
                  properties={properties}
                  units={units}
                  onPropertyFilterChange={onPropertyFilterChange}
                  onUnitFilterChange={onUnitFilterChange}
                />
              </div>
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
                    {searchQuery || statusFilter !== "ALL" || propertyFilter !== "ALL" 
                      ? "No matches found" 
                      : "No conversations yet"}
                  </h3>
                  <p className="text-slate-600 text-sm max-w-sm">
                    {searchQuery || statusFilter !== "ALL" || propertyFilter !== "ALL"
                      ? "Try adjusting your search or filter criteria"
                      : "Your conversations with tenants will appear here once they start messaging you"}
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
    </div>
  );
};

// Main Messages Component
const LandlordMessages = () => {
  const currentUser = useAuthStore((state) => state.user);
  const { channels, loading } = useChannels();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterType>("ALL");
  const [propertyFilter, setPropertyFilter] = useState<string>("ALL");
  const [unitFilter, setUnitFilter] = useState<string>("ALL");

  // Get unique properties and units for filters
  const { properties, units } = useMemo(() => {
    const propertyMap = new Map<string, Property>();
    const unitMap = new Map<string, Unit>();

    channels.forEach(channel => {
      propertyMap.set(channel.unit.property.id, channel.unit.property);
      unitMap.set(channel.unit.id, channel.unit);
    });

    return {
      properties: Array.from(propertyMap.values()),
      units: Array.from(unitMap.values())
    };
  }, [channels]);

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
        propertyFilter={propertyFilter}
        unitFilter={unitFilter}
        currentUser={currentUser}
        properties={properties}
        units={units}
        onSearchChange={setSearchQuery}
        onStatusFilterChange={setStatusFilter}
        onPropertyFilterChange={setPropertyFilter}
        onUnitFilterChange={setUnitFilter}
      />
    </div>
  );
};

export default LandlordMessages;