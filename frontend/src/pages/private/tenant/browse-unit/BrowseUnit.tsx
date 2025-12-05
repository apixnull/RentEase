import { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, MapPin, 
  Star, Home, Bot, X, Send, ArrowLeft, Building
} from "lucide-react";
import { getCitiesAndMunicipalitiesRequest, searchListingsRequest, sendAIChatbotMessage } from "@/api/tenant/browseUnitApi";
import { processImageUrl } from "@/api/utils";

// ============================================================================
// TYPES
// ============================================================================

type City = { id: string; name: string };
type Municipality = { id: string; name: string };
type Amenity = { id: string; name: string; category: string };

type Property = {
  id: string;
  title: string;
  type: string;
  street: string;
  barangay: string;
  zipCode: string | null;
  city: City | null;
  municipality: Municipality | null;
};

type Unit = {
  id: string;
  label: string;
  mainImageUrl: string | null;
  viewCount: number;
  targetPrice: number;
  requiresScreening: boolean;
  property: Property;
  avgRating: number | null;
  totalReviews: number;
  amenities: Amenity[];
};

type Listing = {
  id: string;
  isFeatured: boolean;
  createdAt: string;
  unit: Unit;
};

type ApiResponse = Listing[];

type ChatMessage = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
};

type FilterSnapshot = {
  query: string;
  city: string;
  municipality: string;
  priceRange: string;
  sortBy: string;
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const formatCompactAddress = (property: Property): string => {
  const parts = [];
  if (property.street) parts.push(property.street);
  if (property.barangay) parts.push(property.barangay);
  const city = property.city?.name || property.municipality?.name;
  if (city) parts.push(city);
  return parts.length > 0 ? parts.join(', ') : "Location not specified";
};

const getPropertyTypeDisplay = (type: string): string => {
  const typeMap: { [key: string]: string } = {
    'APARTMENT': 'Apartment',
    'HOUSE': 'House',
    'CONDO': 'Condominium',
    'TOWNHOUSE': 'Townhouse',
    'STUDIO': 'Studio'
  };
  return typeMap[type] || type.replace('_', ' ');
};

const isNewListing = (createdAt: string): boolean => {
  const createdDate = new Date(createdAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - createdDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 7;
};


// ============================================================================
// AI CHATBOT COMPONENT
// ============================================================================

const AIChatbot = ({ isOpen, onClose, onSearchResults, sortBy }: { 
  isOpen: boolean; 
  onClose: () => void;
  onSearchResults?: (results: Listing[]) => void;
  sortBy?: string;
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: "Hi! I'm your rental assistant. What location do you prefer? And what type of unit are you looking for? I can help you find the perfect property based on your preferences, budget, and needs.",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      // Send message to AI chatbot API
      const response = await sendAIChatbotMessage(
        currentInput,
        messages.map(m => ({ text: m.text, isUser: m.isUser })),
        sortBy
      );

      if (response.data.success) {
        const aiData = response.data.data;
        
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: aiData.message,
          isUser: false,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, aiMessage]);

        // If AI returned search results, trigger the search display
        if (aiData.shouldSearch && aiData.searchResults && aiData.searchResults.length > 0) {
          if (onSearchResults) {
            onSearchResults(aiData.searchResults);
          }
        }
      } else {
        throw new Error("AI response failed");
      }
    } catch (error) {
      console.error("Error sending message to AI:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I encountered an error. Please try again or rephrase your question.",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
        >
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />
          
          {/* Chat Container */}
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-2xl h-[80vh] sm:h-[600px] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-emerald-100 flex flex-col z-10 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-sky-600 text-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Rental AI Assistant</h3>
                    <p className="text-white/80 text-xs">Online • Ready to help</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-white hover:bg-white/20 rounded-full"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-3 ${
                      message.isUser
                        ? 'bg-gradient-to-r from-emerald-600 to-sky-600 text-white rounded-br-none'
                        : 'bg-white border border-emerald-100 text-gray-800 rounded-bl-none shadow-sm'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                    <p className={`text-xs mt-1 ${
                      message.isUser ? 'text-white/70' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-white border border-emerald-100 rounded-2xl rounded-bl-none p-3 shadow-sm">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-emerald-100 bg-white">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about properties, locations, amenities..."
                    className="w-full pl-4 pr-12 py-3 rounded-full border border-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                    disabled={isLoading}
                  />
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="rounded-full px-6 bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-700 hover:to-sky-700 disabled:opacity-50"
                  size="lg"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-600 text-center mt-2">
                Ask about pricing, locations, amenities, or property recommendations
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const BrowseUnit = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>("ALL");
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>("ALL");
  const [priceRange, setPriceRange] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("ALL");

  // AI Chatbot state
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Server-triggered search: applied snapshot
  const [appliedQuery, setAppliedQuery] = useState("");
  const [appliedCity, setAppliedCity] = useState<string>("ALL");
  const [appliedMunicipality, setAppliedMunicipality] = useState<string>("ALL");
  const [appliedPriceRange, setAppliedPriceRange] = useState<string>("ALL");
  const [appliedSortBy, setAppliedSortBy] = useState<string>("ALL");

  // State for API data
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for cities and municipalities from API
  const [cities, setCities] = useState<City[]>([]);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);

  // ============================================================================
  // EFFECTS & HANDLERS
  // ============================================================================

  useEffect(() => {
    const controller = new AbortController();

    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [listingsResponse, locationsResponse] = await Promise.all([
          searchListingsRequest({}, { signal: controller.signal }),
          getCitiesAndMunicipalitiesRequest({ signal: controller.signal }),
        ]);

        if (!listingsResponse.data?.success) {
          throw new Error("Failed to fetch listings");
        }

        setApiData(listingsResponse.data.data || []);

        if (locationsResponse.data.success && locationsResponse.data.data) {
          setCities(locationsResponse.data.data.cities || []);
          setMunicipalities(locationsResponse.data.data.municipalities || []);
        }
      } catch (err) {
        if (err instanceof Error && err.name === "CanceledError") {
          return;
        }
        setError("Failed to load properties");
        console.error("Error fetching listings:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();

    return () => {
      controller.abort();
    };
  }, []);

  const executeSearch = useCallback(
    async (overrides: Partial<FilterSnapshot> = {}) => {
      const filters: FilterSnapshot = {
        query: overrides.query ?? query,
        city: overrides.city ?? selectedCity,
        municipality: overrides.municipality ?? selectedMunicipality,
        priceRange: overrides.priceRange ?? priceRange,
        sortBy: overrides.sortBy ?? sortBy,
      };

      const trimmedQuery = filters.query.trim();
      let minPrice: number | undefined;
      let maxPrice: number | undefined;

      switch (filters.priceRange) {
        case "0-5000":
          minPrice = 0;
          maxPrice = 5000;
          break;
        case "5000-10000":
          minPrice = 5000;
          maxPrice = 10000;
          break;
        case "10000-20000":
          minPrice = 10000;
          maxPrice = 20000;
          break;
        case "20000-30000":
          minPrice = 20000;
          maxPrice = 30000;
          break;
        case "30000-50000":
          minPrice = 30000;
          maxPrice = 50000;
          break;
        case "50000+":
          minPrice = 50000;
          maxPrice = undefined;
          break;
        default:
          minPrice = undefined;
          maxPrice = undefined;
          break;
      }

      setAppliedQuery(trimmedQuery);
      setAppliedCity(filters.city);
      setAppliedMunicipality(filters.municipality);
      setAppliedPriceRange(filters.priceRange);
      setAppliedSortBy(filters.sortBy);

      try {
        setIsLoading(true);
        setError(null);

        const response = await searchListingsRequest({
          search: trimmedQuery || undefined,
          city: filters.city !== "ALL" ? filters.city : undefined,
          municipality: filters.municipality !== "ALL" ? filters.municipality : undefined,
          minPrice,
          maxPrice,
          sortBy: filters.sortBy !== "ALL" ? filters.sortBy : undefined,
        });

        if (!response.data?.success) {
          throw new Error("Search request failed");
        }

        setApiData(response.data.data || []);
      } catch (err) {
        if (err instanceof Error && err.name === "CanceledError") {
          return;
        }
        setError("Failed to search properties");
        console.error("Error searching listings:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [query, selectedCity, selectedMunicipality, priceRange, sortBy]
  );

  // Check if any filter is applied (not just search query)
  const hasActiveFilters = useMemo(() => {
    return appliedCity !== "ALL" || 
           appliedMunicipality !== "ALL" || 
           appliedPriceRange !== "ALL" || 
           appliedSortBy !== "ALL" ||
           appliedQuery.trim() !== "";
  }, [appliedCity, appliedMunicipality, appliedPriceRange, appliedSortBy, appliedQuery]);

  const priceRanges = [
    { value: "ALL", label: "Any Price" },
    { value: "0-5000", label: "Under ₱5,000" },
    { value: "5000-10000", label: "₱5,000 - ₱10,000" },
    { value: "10000-20000", label: "₱10,000 - ₱20,000" },
    { value: "20000-30000", label: "₱20,000 - ₱30,000" },
    { value: "30000-50000", label: "₱30,000 - ₱50,000" },
    { value: "50000+", label: "₱50,000+" }
  ];

  const sortOptions = [
    { value: "ALL", label: "All" },
    { value: "TOP_RATED", label: "Top Rated" },
    { value: "MOST_VIEWED", label: "Most Viewed" },
    { value: "NEW", label: "New Listings" }
  ];

  // ============================================================================
  // DATA PROCESSING
  // ============================================================================

  const allUnits = useMemo(() => {
    if (!apiData || !Array.isArray(apiData)) return [];
    
    // Remove duplicates by unit id
    const uniqueListings = apiData.filter((listing, index, self) => 
      index === self.findIndex(l => l.unit.id === listing.unit.id)
    );

    return uniqueListings;
  }, [apiData]);

  // Use cities and municipalities from API
  const uniqueCities = useMemo(() => {
    return cities.map(city => city.name);
  }, [cities]);

  const uniqueMunicipalities = useMemo(() => {
    return municipalities.map(municipality => municipality.name);
  }, [municipalities]);

  const filteredUnits = allUnits;

  // Group listings by city/municipality
  const groupedListings = useMemo(() => {
    const groups: { [key: string]: Listing[] } = {};
    
    filteredUnits.forEach((listing) => {
      const cityName = listing.unit.property.city?.name;
      const municipalityName = listing.unit.property.municipality?.name;
      
      // Prioritize city over municipality
      const groupKey = cityName || municipalityName || "Other";
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(listing);
    });

    // Sort groups by name, and within each group, sort featured listings first
    return Object.entries(groups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([location, listings]) => {
        // Sort listings: featured first, then by creation date
        const sortedListings = [...listings].sort((a, b) => {
          // Featured units always come first
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          // If both featured or both not featured, sort by creation date (newest first)
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA;
        });
        
        return {
          location,
          listings: sortedListings,
          isCity: filteredUnits.some(l => l.unit.property.city?.name === location),
          cityId: filteredUnits.find(l => l.unit.property.city?.name === location)?.unit.property.city?.id
        };
      });
  }, [filteredUnits]);

  // ============================================================================
  // RENDER COMPONENTS
  // ============================================================================

  if (isLoading) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4 max-w-[1920px] mx-auto">
        {/* Search & Filters Skeleton */}
        <Card className="p-4 mb-4">
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-12" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-3 border-t border-emerald-100">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        </Card>

        {/* Results Header Skeleton */}
        <div className="mb-6">
          <Skeleton className="h-6 w-48" />
        </div>

        {/* Grouped Properties Skeleton */}
        <div className="space-y-8">
          {Array.from({ length: 3 }).map((_, groupIndex) => (
            <div key={groupIndex} className="space-y-4">
              {/* Location Header Skeleton */}
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-20" />
              </div>

              {/* Horizontal Scrollable Cards Skeleton */}
              <div className="overflow-x-auto pb-4 -mx-4 px-4">
                <div className="flex gap-3 min-w-max">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="overflow-hidden border border-gray-200 bg-white flex-shrink-0 w-[200px] sm:w-[220px] md:w-[240px]">
                      <Skeleton className="aspect-[4/3] w-full" />
                      <div className="p-2.5 sm:p-3 space-y-1.5">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-2/3" />
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="p-8 text-center max-w-md border border-red-200 bg-white">
            <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <Home className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-lg font-medium text-red-900">Unable to load properties</h3>
            <p className="text-red-700 mt-2">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-700 hover:to-sky-700"
            >
              Try Again
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-4 max-w-[1920px] mx-auto">
      {/* ================================================================= */}
      {/* SEARCH & FILTERS SECTION */}
      {/* ================================================================= */}
      {!hasActiveFilters && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <Card className="p-3 mb-4">
            <div className="flex flex-col gap-3">
              {/* Search Bar and Search Button */}
              <div className="flex gap-2">
                <div className="relative flex-1 min-w-0">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 h-3.5 w-3.5" />
                  <input
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        executeSearch();
                      }
                    }}
                    placeholder="Search properties, locations..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400 transition-all"
                  />
                </div>
                <Button 
                  onClick={() => executeSearch()} 
                  className="px-3 py-1.5 h-auto bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-700 hover:to-sky-700 text-xs shrink-0"
                >
                  Search
                </Button>
              </div>
              
              {/* Filters Row - Responsive */}
              <div className="flex gap-1.5 flex-wrap">
                  <select
                    value={selectedCity}
                    onChange={(e) => { 
                      const newCity = e.target.value;
                      setSelectedCity(newCity);

                      if (newCity !== "ALL") {
                        setQuery("");
                        setSelectedMunicipality("ALL");
                        setPriceRange("ALL");
                        setSortBy("ALL");
                        executeSearch({
                          city: newCity,
                          municipality: "ALL",
                          priceRange: "ALL",
                          sortBy: "ALL",
                          query: "",
                        });
                      } else {
                        executeSearch({ city: "ALL" });
                      }
                    }}
                    className="px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400 bg-white min-w-[100px] flex-1 sm:flex-none sm:min-w-[100px]"
                  >
                    <option value="ALL">All Cities</option>
                    {uniqueCities.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>

                  <select
                    value={selectedMunicipality}
                    onChange={(e) => { 
                      const newMunicipality = e.target.value;
                      setSelectedMunicipality(newMunicipality);

                      if (newMunicipality !== "ALL") {
                        setQuery("");
                        setSelectedCity("ALL");
                        setPriceRange("ALL");
                        setSortBy("ALL");
                        executeSearch({
                          municipality: newMunicipality,
                          city: "ALL",
                          priceRange: "ALL",
                          sortBy: "ALL",
                          query: "",
                        });
                      } else {
                        executeSearch({ municipality: "ALL" });
                      }
                    }}
                    className="px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400 bg-white min-w-[120px] flex-1 sm:flex-none sm:min-w-[120px]"
                  >
                    <option value="ALL">All Municipalities</option>
                    {uniqueMunicipalities.map((municipality) => (
                      <option key={municipality} value={municipality}>{municipality}</option>
                    ))}
                  </select>

                  <select
                    value={priceRange}
                    onChange={(e) => { 
                      const newPriceRange = e.target.value;
                      setPriceRange(newPriceRange);

                      if (newPriceRange !== "ALL") {
                        setQuery("");
                        setSelectedCity("ALL");
                        setSelectedMunicipality("ALL");
                        setSortBy("ALL");
                        executeSearch({
                          priceRange: newPriceRange,
                          city: "ALL",
                          municipality: "ALL",
                          sortBy: "ALL",
                          query: "",
                        });
                      } else {
                        executeSearch({ priceRange: "ALL" });
                      }
                    }}
                    className="px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400 bg-white min-w-[110px] flex-1 sm:flex-none sm:min-w-[110px]"
                  >
                    {priceRanges.map((range) => (
                      <option key={range.value} value={range.value}>{range.label}</option>
                    ))}
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => { 
                      const newSortBy = e.target.value;
                      setSortBy(newSortBy);

                      if (newSortBy !== "ALL") {
                        setQuery("");
                        setSelectedCity("ALL");
                        setSelectedMunicipality("ALL");
                        setPriceRange("ALL");
                        executeSearch({
                          sortBy: newSortBy,
                          city: "ALL",
                          municipality: "ALL",
                          priceRange: "ALL",
                          query: "",
                        });
                      } else {
                        executeSearch({ sortBy: "ALL" });
                      }
                    }}
                    className="px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400 bg-white min-w-[110px] flex-1 sm:flex-none sm:min-w-[110px]"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>

                  {/* Clear Button - Only show when filters are active */}
                  {(query.trim() !== "" || selectedCity !== "ALL" || selectedMunicipality !== "ALL" || priceRange !== "ALL" || sortBy !== "ALL") && (
                    <Button 
                      variant="outline" 
                      onClick={() => { 
                        setQuery(""); 
                        setSelectedCity("ALL");
                        setSelectedMunicipality("ALL");
                        setPriceRange("ALL");
                        setSortBy("ALL");
                        executeSearch({
                          query: "",
                          city: "ALL",
                          municipality: "ALL",
                          priceRange: "ALL",
                          sortBy: "ALL",
                        });
                      }}
                      className="px-2 py-1.5 h-auto text-xs border border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 shrink-0"
                    >
                      Clear
                    </Button>
                  )}
                </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* ================================================================= */}
      {/* AI CHATBOT FLOATING BUTTON - Always visible */}
      {/* ================================================================= */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 150, damping: 20 }}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40"
      >
        <Button
          onClick={() => setIsChatOpen(true)}
          className="rounded-full w-12 h-12 sm:w-14 sm:h-14 shadow-xl bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-700 hover:to-sky-700 border-0 shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300"
          size="lg"
        >
          <Bot className="h-5 w-5 sm:h-6 sm:w-6" />
        </Button>
      </motion.div>

      {/* AI Chatbot Modal */}
      <AIChatbot 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)}
        sortBy={sortBy}
        onSearchResults={(results) => {
          setIsChatOpen(false);
          // Apply the search results to the main view
          setApiData(results);
          setSelectedCity("ALL");
          setSelectedMunicipality("ALL");
          setPriceRange("ALL");
          setSortBy("ALL");
          setAppliedQuery("AI Search Results");
          setAppliedCity("ALL");
          setAppliedMunicipality("ALL");
          setAppliedPriceRange("ALL");
          setAppliedSortBy("ALL");
          // Scroll to top to show results
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* ================================================================= */}
      {/* SEARCH/FILTER RESULTS HEADER - Big and Prominent (Always show when filters active) */}
      {/* ================================================================= */}
      {hasActiveFilters && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mb-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                {appliedQuery === "AI Search Results" ? "AI Search Results" : appliedQuery ? "Search Results" : "Filtered Results"}
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-700">
                {filteredUnits.length > 0 ? (
                  <>
                    {appliedQuery === "AI Search Results" ? (
                      <>This is what AI found: <span className="font-bold text-emerald-600">{filteredUnits.length}</span> {filteredUnits.length === 1 ? 'unit' : 'units'}</>
                    ) : (
                      <>
                        Found <span className="font-bold text-emerald-600">{filteredUnits.length}</span> {filteredUnits.length === 1 ? 'unit' : 'units'}
                        {appliedQuery && <span> for "<span className="font-semibold text-gray-900">{appliedQuery}</span>"</span>}
                      </>
                    )}
                    {!appliedQuery && (
                      <>
                        {appliedCity !== "ALL" && <span>: <span className="font-semibold text-gray-900">{appliedCity}</span></span>}
                        {appliedMunicipality !== "ALL" && <span>: <span className="font-semibold text-gray-900">{appliedMunicipality}</span></span>}
                        {appliedPriceRange !== "ALL" && <span> - <span className="font-semibold text-gray-900">{priceRanges.find(r => r.value === appliedPriceRange)?.label}</span></span>}
                        {appliedSortBy !== "ALL" && <span> - <span className="font-semibold text-gray-900">{sortOptions.find(o => o.value === appliedSortBy)?.label}</span></span>}
                      </>
                    )}
                  </>
                ) : (
                  <>
                    {appliedQuery === "AI Search Results" ? (
                      <>AI couldn't find any properties matching your criteria. Would you like to try different search parameters?</>
                    ) : appliedQuery ? (
                      <>Search results for "<span className="font-semibold text-gray-900">{appliedQuery}</span>"</>
                    ) : (
                      <>
                        Filtered Results
                        {appliedCity !== "ALL" && <span>: <span className="font-semibold text-gray-900">{appliedCity}</span></span>}
                        {appliedMunicipality !== "ALL" && <span>: <span className="font-semibold text-gray-900">{appliedMunicipality}</span></span>}
                        {appliedPriceRange !== "ALL" && <span> - <span className="font-semibold text-gray-900">{priceRanges.find(r => r.value === appliedPriceRange)?.label}</span></span>}
                        {appliedSortBy !== "ALL" && <span> - <span className="font-semibold text-gray-900">{sortOptions.find(o => o.value === appliedSortBy)?.label}</span></span>}
                      </>
                    )}
                  </>
                )}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setQuery("");
                setSelectedCity("ALL");
                setSelectedMunicipality("ALL");
                setPriceRange("ALL");
                setSortBy("ALL");
                executeSearch({
                  query: "",
                  city: "ALL",
                  municipality: "ALL",
                  priceRange: "ALL",
                  sortBy: "ALL",
                });
              }}
              className="border-emerald-100 text-gray-600 hover:bg-emerald-50 w-full sm:w-auto shrink-0 text-sm sm:text-base h-9 sm:h-10 px-3 sm:px-4"
            >
              <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
              <span className="hidden sm:inline">Back to Browse</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </div>
        </motion.div>
      )}

      {/* ================================================================= */}
      {/* RESULTS HEADER SECTION - For non-search view */}
      {/* ================================================================= */}
      {!hasActiveFilters && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mb-6"
        >
          <p className="text-sm text-gray-600">
            Found <span className="font-bold text-gray-900">{filteredUnits.length}</span> {filteredUnits.length === 1 ? 'property' : 'properties'}
            {groupedListings.length > 0 && <span> in <span className="font-medium">{groupedListings.length}</span> {groupedListings.length === 1 ? 'location' : 'locations'}</span>}
          </p>
        </motion.div>
      )}

      {/* ================================================================= */}
      {/* SEARCH/FILTER RESULTS - HORIZONTAL SCROLLABLE LAYOUT (Same as normal) */}
      {/* ================================================================= */}
      {hasActiveFilters && filteredUnits.length > 0 ? (
        <div className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-thin scrollbar-thumb-emerald-200 scrollbar-track-gray-100" style={{ scrollbarWidth: 'thin', scrollbarColor: '#10b981 #f3f4f6' }}>
          <div className="flex gap-3 min-w-max">
            {filteredUnits.map((listing, index) => {
              const unit = listing.unit;
              
              return (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05, duration: 0.3, ease: "easeOut" }}
                  whileHover={{ y: -4, transition: { duration: 0.2, ease: "easeOut" } }}
                  className="relative flex-shrink-0 w-[240px] sm:w-[260px] md:w-[280px]"
                >
                <Card 
                  className="overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-2xl hover:border-emerald-300 bg-white cursor-pointer group h-full flex flex-col"
                  onClick={() => navigate(`/tenant/browse-unit/${listing.id}/details`)}
                >
                  {/* Image container */}
                  <div className="relative aspect-[5/3] bg-gray-50 overflow-hidden">
                    {unit.mainImageUrl ? (
                      <img 
                        src={processImageUrl(unit.mainImageUrl) || unit.mainImageUrl || ""} 
                        alt={unit.label} 
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                        <Home className="h-10 w-10 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Badge overlays */}
                    {isNewListing(listing.createdAt) && (
                      <div className="absolute top-2 right-2 z-10">
                        <div className="bg-emerald-600 text-white text-xs font-semibold px-2 py-1 rounded-md shadow-lg backdrop-blur-sm">
                          New
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Content area */}
                  <div className="p-3 sm:p-4 space-y-2 sm:space-y-3 flex-1 flex flex-col">
                    {/* Title */}
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-tight line-clamp-2 mb-1">
                        {unit.property.title}
                      </h3>
                      <p className="text-xs text-gray-600 flex items-center gap-1.5">
                        <Building className="h-3.5 w-3.5 text-gray-500" />
                        <span>{getPropertyTypeDisplay(unit.property.type)} • {unit.label}</span>
                      </p>
                    </div>

                    {/* Address */}
                    <div className="flex items-start gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                        {formatCompactAddress(unit.property)}
                      </p>
                    </div>

                    {/* Rating Section */}
                    {unit.avgRating !== null && unit.totalReviews > 0 ? (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star 
                                key={star} 
                                className={`h-3 w-3 ${
                                  star <= Math.round(unit.avgRating!)
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'fill-gray-200 text-gray-200'
                                }`} 
                              />
                            ))}
                          </div>
                          <span className="text-xs font-bold text-amber-700 ml-1">
                            {unit.avgRating.toFixed(1)}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          ({unit.totalReviews} {unit.totalReviews === 1 ? 'review' : 'reviews'})
                        </span>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400">
                        No reviews yet
                      </div>
                    )}

                    {/* Viewers and Price Section */}
                    <div className="pt-2 sm:pt-3 mt-auto border-t border-gray-100 space-y-1.5 sm:space-y-2">
                      {/* Viewers - Only show if viewCount > 0 */}
                      {unit.viewCount > 0 && (
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-1.5">
                            {[1, 2, 3, 4].map((index) => (
                              <img
                                key={index}
                                src={`https://i.pravatar.cc/150?img=${index + 10}`}
                                alt={`Viewer ${index}`}
                                className="w-6 h-6 rounded-full border-2 border-white object-cover"
                              />
                            ))}
                          </div>
                          <div className="text-xs text-gray-600">
                            <span className="font-medium">{unit.viewCount}</span> viewed
                          </div>
                        </div>
                      )}

                      {/* Price */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-baseline gap-1 min-w-0">
                          <span className="font-bold text-gray-900 text-base sm:text-lg">₱{unit.targetPrice.toLocaleString()}</span>
                          <span className="text-[10px] sm:text-xs text-gray-500">/mo</span>
                        </div>
                        {unit.requiresScreening && (
                          <div className="px-1.5 sm:px-2 py-0.5 bg-blue-50 border border-blue-200 rounded text-[9px] sm:text-xs text-blue-700 font-medium whitespace-nowrap shrink-0">
                            <span className="hidden sm:inline">Screening Required</span>
                            <span className="sm:hidden">Screening</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
              );
            })}
          </div>
        </div>
      ) : hasActiveFilters && filteredUnits.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="p-8 text-center border border-dashed border-emerald-100 bg-white/90 backdrop-blur-sm">
            <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No properties found</h3>
            <p className="text-gray-600 mt-2 max-w-md mx-auto">
              {appliedQuery === "AI Search Results"
                ? "AI couldn't find any properties matching your criteria. Would you like to try different search parameters?"
                : appliedQuery 
                ? `No properties match your search for "${appliedQuery}". Try different keywords or adjust your filters.`
                : "No properties match your filters. Try adjusting your search criteria."}
            </p>
            <Button 
              onClick={() => {
                setQuery("");
                setSelectedCity("ALL");
                setSelectedMunicipality("ALL");
                setPriceRange("ALL");
                setSortBy("ALL");
                executeSearch({
                  query: "",
                  city: "ALL",
                  municipality: "ALL",
                  priceRange: "ALL",
                  sortBy: "ALL",
                });
              }}
              className="mt-4 bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-700 hover:to-sky-700"
            >
              Clear {appliedQuery ? "Search" : "Filters"}
            </Button>
          </Card>
        </motion.div>
      ) : null}

      {/* ================================================================= */}
      {/* GROUPED PROPERTIES BY LOCATION (Default View) */}
      {/* ================================================================= */}
      {!hasActiveFilters && groupedListings.length > 0 && (
        <div className="space-y-8">
          {groupedListings.map((group, groupIndex) => (
            <motion.div
              key={group.location}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: groupIndex * 0.08, duration: 0.4, ease: "easeOut" }}
              className="space-y-4"
            >
              {/* Location Header */}
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-emerald-600" />
                {group.isCity && group.cityId ? (
                  <button
                    onClick={() => {
                      setSelectedCity(group.location);
                      setSelectedMunicipality("ALL");
                      setPriceRange("ALL");
                      setSortBy("ALL");
                      executeSearch({
                        city: group.location,
                        municipality: "ALL",
                        priceRange: "ALL",
                        sortBy: "ALL",
                        query: "",
                      });
                      // Scroll to top to show filtered results
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-xl font-bold text-gray-900 hover:text-emerald-600 transition-colors cursor-pointer hover:underline"
                  >
                    {group.location}
                  </button>
                ) : (
                  <h2 className="text-xl font-bold text-gray-900">{group.location}</h2>
                )}
                <span className="text-sm text-gray-500">({group.listings.length} {group.listings.length === 1 ? 'property' : 'properties'})</span>
              </div>

              {/* Horizontal Scrollable Cards */}
              <div className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-thin scrollbar-thumb-emerald-200 scrollbar-track-gray-100" style={{ scrollbarWidth: 'thin', scrollbarColor: '#10b981 #f3f4f6' }}>
                <div className="flex gap-3 min-w-max">
                  {group.listings.map((listing, index) => {
                    const unit = listing.unit;
                    
                    return (
                      <motion.div
                        key={listing.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05, duration: 0.3, ease: "easeOut" }}
                        whileHover={{ y: -4, transition: { duration: 0.2, ease: "easeOut" } }}
                        className="relative flex-shrink-0 w-[240px] sm:w-[260px] md:w-[280px]"
                      >
                        <Card 
                          className="overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-2xl hover:border-emerald-300 bg-white cursor-pointer group h-full flex flex-col"
                          onClick={() => navigate(`/tenant/browse-unit/${listing.id}/details`)}
                        >
                          {/* Image container */}
                          <div className="relative aspect-[5/3] bg-gray-50 overflow-hidden">
                            {unit.mainImageUrl ? (
                              <img 
                                src={processImageUrl(unit.mainImageUrl) || unit.mainImageUrl || ""} 
                                alt={unit.label} 
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                                <Home className="h-10 w-10 text-gray-400" />
                              </div>
                            )}
                            
                            {/* Badge overlays */}
                            {isNewListing(listing.createdAt) && (
                              <div className="absolute top-2 right-2 z-10">
                                <div className="bg-emerald-600 text-white text-xs font-semibold px-2 py-1 rounded-md shadow-lg backdrop-blur-sm">
                                  New
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Content area */}
                          <div className="p-3 sm:p-4 space-y-2 sm:space-y-3 flex-1 flex flex-col">
                            {/* Title */}
                            <div>
                              <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-tight line-clamp-2 mb-1">
                                {unit.property.title}
                              </h3>
                              <p className="text-xs text-gray-600 flex items-center gap-1.5">
                                <Building className="h-3.5 w-3.5 text-gray-500" />
                                <span>{getPropertyTypeDisplay(unit.property.type)} • {unit.label}</span>
                              </p>
                            </div>

                            {/* Address */}
                            <div className="flex items-start gap-1.5">
                              <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0 mt-0.5" />
                              <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                                {formatCompactAddress(unit.property)}
                              </p>
                            </div>

                            {/* Rating Section */}
                            {unit.avgRating !== null && unit.totalReviews > 0 ? (
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200">
                                  <div className="flex items-center gap-0.5">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star 
                                        key={star} 
                                        className={`h-3 w-3 ${
                                          star <= Math.round(unit.avgRating!)
                                            ? 'fill-amber-400 text-amber-400'
                                            : 'fill-gray-200 text-gray-200'
                                        }`} 
                                      />
                                    ))}
                                  </div>
                                  <span className="text-xs font-bold text-amber-700 ml-1">
                                    {unit.avgRating.toFixed(1)}
                                  </span>
                                </div>
                                <span className="text-xs text-gray-500">
                                  ({unit.totalReviews} {unit.totalReviews === 1 ? 'review' : 'reviews'})
                                </span>
                              </div>
                            ) : (
                              <div className="text-xs text-gray-400">
                                No reviews yet
                              </div>
                            )}

                            {/* Viewers and Price Section */}
                            <div className="pt-2 sm:pt-3 mt-auto border-t border-gray-100 space-y-1.5 sm:space-y-2">
                              {/* Viewers - Only show if viewCount > 0 */}
                              {unit.viewCount > 0 && (
                                <div className="flex items-center gap-2">
                                  <div className="flex -space-x-1.5">
                                    {[1, 2, 3, 4].map((index) => (
                                      <img
                                        key={index}
                                        src={`https://i.pravatar.cc/150?img=${index + 10}`}
                                        alt={`Viewer ${index}`}
                                        className="w-6 h-6 rounded-full border-2 border-white object-cover"
                                      />
                                    ))}
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    <span className="font-medium">{unit.viewCount}</span> viewed
                                  </div>
                                </div>
                              )}

                              {/* Price */}
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-baseline gap-1 min-w-0">
                                  <span className="font-bold text-gray-900 text-base sm:text-lg">₱{unit.targetPrice.toLocaleString()}</span>
                                  <span className="text-[10px] sm:text-xs text-gray-500">/mo</span>
                                </div>
                                {unit.requiresScreening && (
                                  <div className="px-1.5 sm:px-2 py-0.5 bg-blue-50 border border-blue-200 rounded text-[9px] sm:text-xs text-blue-700 font-medium whitespace-nowrap shrink-0">
                                    <span className="hidden sm:inline">Screening Required</span>
                                    <span className="sm:hidden">Screening</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ================================================================= */}
      {/* NO PROPERTIES FOUND - Only show when there are truly no results */}
      {/* ================================================================= */}
      {!hasActiveFilters && groupedListings.length === 0 && allUnits.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="p-8 text-center border border-dashed border-emerald-100 bg-white">
            <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Home className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No properties found</h3>
            <p className="text-gray-600 mt-2 max-w-md mx-auto">
              Try adjusting your search criteria or browse different categories.
            </p>
            <Button 
              onClick={() => setIsChatOpen(true)}
              className="mt-4 bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-700 hover:to-sky-700"
            >
              <Bot className="h-4 w-4 mr-2" />
              Ask AI Assistant for Help
            </Button>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default BrowseUnit;