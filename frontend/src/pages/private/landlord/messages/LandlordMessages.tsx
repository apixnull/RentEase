import { useEffect, useState, useMemo } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { getUserChatChannelsRequest } from "@/api/chatApi";
import { supabase } from "@/lib/supabaseClient";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  MessageCircle, 
  Building,
  Check,
  CheckCheck,
  Home,
  Zap
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

// Custom Hook for Channels
const useChannels = () => {
  const currentUser = useAuthStore((state) => state.user);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (!currentUser) return;

    loadChannels();

    // Real-time subscription
    const subscription = supabase
      .channel('chat_channels_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_channels'
        },
        () => {
          loadChannels();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [currentUser]);

  return { channels, loading, loadChannels };
};

// Advertisement Component
const AdvertisementSection = () => (
  <div className="bg-gradient-to-br from-purple-600 to-blue-700 rounded-xl p-4 text-white shadow-lg">
    <div className="flex items-center gap-2 mb-2">
      <Zap className="w-5 h-5 text-yellow-300" />
      <h3 className="font-bold text-base">Premium Features</h3>
    </div>
    <p className="text-purple-100 text-xs mb-3">
      Unlock advanced messaging tools and priority support.
    </p>
    <div className="space-y-1 mb-3">
      {["Unlimited message history", "Document sharing", "Smart reminders"].map((feature) => (
        <div key={feature} className="flex items-center gap-1">
          <CheckCheck className="w-3 h-3 text-green-300" />
          <span className="text-xs">{feature}</span>
        </div>
      ))}
    </div>
    <Button className="w-full bg-white text-purple-700 hover:bg-gray-100 font-semibold rounded-lg text-sm">
      Upgrade Now
    </Button>
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
      "INQUIRY": "bg-blue-100 text-blue-800 border-blue-200",
      "LEASE": "bg-green-100 text-green-800 border-green-200",
      "PREV-LEASE": "bg-orange-100 text-orange-800 border-orange-200"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200";
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
    if (!channel.readAt && channel.lastMessageSenderId !== currentUser?.id) {
      return <div className="w-2 h-2 bg-blue-500 rounded-full" />;
    }
    
    if (channel.lastMessageSenderId === currentUser?.id) {
      return channel.readAt ? (
        <CheckCheck className="w-3 h-3 text-blue-500" />
      ) : (
        <Check className="w-3 h-3 text-gray-400" />
      );
    }
    
    return null;
  };

  const counterpart = getCounterpart(channel);
  const hasUnread = !channel.readAt && channel.lastMessageSenderId !== currentUser?.id;
  const lastActivity = channel.lastMessageAt || channel.updatedAt || channel.createdAt;

  return (
    <div
      className={`group bg-white hover:bg-gray-50 border rounded-lg p-3 cursor-pointer transition-all duration-200 ${
        hasUnread 
          ? 'border-blue-300 bg-blue-50 hover:bg-blue-100' 
          : 'border-gray-200 hover:border-blue-300'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className="relative flex-shrink-0">
          <Avatar className="h-12 w-12 border-2 border-white shadow">
            <AvatarImage src={counterpart.avatarUrl || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-green-500 text-white font-semibold text-sm">
              {counterpart.firstName?.[0]}{counterpart.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          {hasUnread && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 border-2 border-white rounded-full" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <h3 className={`font-semibold text-sm truncate ${
                hasUnread ? 'text-blue-900' : 'text-gray-900'
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
                hasUnread ? 'text-blue-700 font-medium' : 'text-gray-500'
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
            hasUnread ? 'text-blue-800 font-medium' : 'text-gray-600'
          }`}>
            {getLastMessageDisplay(channel)}
          </p>

          <div className="flex items-center gap-3 text-xs text-gray-500">
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
    <div className="flex gap-1 flex-wrap justify-center sm:justify-start">
      {filters.map((filter) => (
        <Button
          key={filter.key}
          variant={statusFilter === filter.key ? "default" : "outline"}
          size="sm"
          onClick={() => onStatusFilterChange(filter.key)}
          className={`rounded-lg text-xs px-3 ${
            statusFilter === filter.key ? 'bg-blue-500 hover:bg-blue-600 text-white' : ''
          }`}
        >
          {filter.label}
        </Button>
      ))}
    </div>
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
    <div className="flex flex-col sm:flex-row gap-2">
      <div className="flex-1">
        <select
          value={propertyFilter}
          onChange={(e) => {
            onPropertyFilterChange(e.target.value);
            onUnitFilterChange("ALL");
          }}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="ALL">All Properties</option>
          {properties.map(property => (
            <option key={property.id} value={property.id}>
              {property.title}
            </option>
          ))}
        </select>
      </div>
      
      <div className="flex-1">
        <select
          value={unitFilter}
          onChange={(e) => onUnitFilterChange(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          disabled={propertyFilter === "ALL"}
        >
          <option value="ALL">
            {propertyFilter === "ALL" ? "Select a property first" : "All Units"}
          </option>
          {units
            .filter(unit => propertyFilter === "ALL" || unit.property.id === propertyFilter)
            .map(unit => (
              <option key={unit.id} value={unit.id}>
                {unit.label}
              </option>
            ))
          }
        </select>
      </div>
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
    <div className="w-full max-w-7xl mx-auto p-4">
      {/* Header Section */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
          <MessageCircle className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-2">
          Your Messages
        </h1>
        <p className="text-gray-600 text-sm">
          Connect with tenants about properties and leases
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-4">
            {/* Search and Filters */}
            <div className="flex flex-col gap-3 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-10 h-10 bg-gray-50 border-0 focus:ring-2 focus:ring-blue-500 rounded-lg text-sm"
                />
              </div>
              
              <FilterButtons 
                statusFilter={statusFilter} 
                onStatusFilterChange={onStatusFilterChange} 
              />
              
              <PropertyUnitFilters
                propertyFilter={propertyFilter}
                unitFilter={unitFilter}
                properties={properties}
                units={units}
                onPropertyFilterChange={onPropertyFilterChange}
                onUnitFilterChange={onUnitFilterChange}
              />
            </div>

            {/* Channels List */}
            <div className="space-y-2">
              {sortedChannels.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <MessageCircle className="w-12 h-12 text-gray-300 mb-3" />
                  <h3 className="text-base font-semibold text-gray-900 mb-2">
                    {searchQuery || statusFilter !== "ALL" || propertyFilter !== "ALL" 
                      ? "No matches found" 
                      : "No conversations yet"}
                  </h3>
                  <p className="text-gray-600 text-xs max-w-xs">
                    {searchQuery || statusFilter !== "ALL" || propertyFilter !== "ALL"
                      ? "Try adjusting your search or filter"
                      : "Your conversations with tenants will appear here"}
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
          </div>

          {/* Quick Tips - Mobile only */}
          <div className="lg:hidden bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4 border border-blue-200 mb-4">
            <h4 className="font-semibold text-gray-900 mb-1 flex items-center gap-2 text-sm">
              <MessageCircle className="w-4 h-4 text-blue-600" />
              Quick Tips
            </h4>
            <p className="text-xs text-gray-600">
              Tap any conversation to view messages and communicate with tenants
            </p>
          </div>
        </div>

        {/* Sidebar - Desktop only */}
        <div className="hidden lg:block space-y-4">
          <AdvertisementSection />

          {/* Quick Tips - Desktop */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4 border border-blue-200">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2 text-sm">
              <MessageCircle className="w-4 h-4 text-blue-600" />
              Quick Tips
            </h4>
            <p className="text-xs text-gray-600 mb-3">
              Click any conversation to view messages, discuss property details, and stay connected with tenants
            </p>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Blue dot indicates unread messages</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCheck className="w-3 h-3 text-blue-500" />
                <span>Double check means message was read</span>
              </div>
            </div>
          </div>
        </div>
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">Loading your conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-4">
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