import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, MapPin, Filter, ChevronLeft, ChevronRight, 
  Eye, Star, Crown, Home, Bot, X, Send, Heart
} from "lucide-react";
import { getVisibleListingsForTenantRequest } from "@/api/tenant/browseUnitApi";

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
  amenities: Amenity[];
};

type Listing = {
  id: string;
  isFeatured: boolean;
  unit: Unit;
};

type ApiResponse = {
  featured: Listing[];
  mostViewed: Listing[];
  mostRated: Listing[];
  newlyListed: Listing[];
};

type ChatMessage = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const formatFullAddress = (property: Property): string => {
  const city = property.city?.name || property.municipality?.name || "";
  return `${property.street}, ${property.barangay}, ${city}`;
};

const formatShortAddress = (property: Property): string => {
  return property.city?.name || property.municipality?.name || "Location not specified";
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

const StarRating = ({ rating, size = 10, showNumber = false }: { rating: number | null; size?: number; showNumber?: boolean }) => {
  if (rating === null || rating === 0) {
    return (
      <div className="flex items-center gap-1">
        <span className="text-[10px] text-gray-400">No ratings</span>
      </div>
    );
  }

  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => {
        if (i < fullStars) {
          return <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />;
        } else if (i === fullStars && hasHalfStar) {
          return <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />;
        } else {
          return <Star key={i} className="h-3 w-3 text-gray-300" />;
        }
      })}
      {showNumber && <span className="text-[10px] text-gray-600 ml-1">{rating.toFixed(1)}</span>}
    </div>
  );
};

// ============================================================================
// AI CHATBOT COMPONENT
// ============================================================================

const AIChatbot = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: "Hi! I'm your rental assistant. I can help you find the perfect property based on your preferences, budget, and needs. What are you looking for today?",
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
    setInputMessage('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponses = [
        "I understand you're looking for a rental property. Based on your preferences, I recommend checking our featured properties in that area. Would you like me to filter the results for you?",
        "That's a great choice! I can help you find properties with those specific amenities. Let me check what's available in your preferred location.",
        "For that budget range, we have several excellent options available. Would you like to see properties with the best value in that price range?",
        "I've found some great matches for your criteria! You might want to check the 'Top Rated' section for highly recommended properties.",
        "Based on your needs, I suggest considering properties in our newly listed section. They often have the best availability and newest amenities."
      ];
      
      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: randomResponse,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000);
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
            className="relative w-full max-w-2xl h-[80vh] sm:h-[600px] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border-0 flex flex-col z-10 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-400 to-sky-400 text-white p-4">
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
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-sky-50/30">
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
                        ? 'bg-gradient-to-r from-emerald-400 to-sky-400 text-white rounded-br-none'
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
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
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
                    className="w-full pl-4 pr-12 py-3 rounded-full border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 bg-white"
                    disabled={isLoading}
                  />
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="rounded-full px-6 bg-gradient-to-r from-emerald-400 to-sky-400 hover:from-emerald-500 hover:to-sky-500 disabled:opacity-50"
                  size="lg"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-emerald-600 text-center mt-2">
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
  const [selectedAmenity, setSelectedAmenity] = useState<string>("ALL");
  const [priceRange, setPriceRange] = useState<string>("ALL");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // AI Chatbot state
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Server-triggered search: applied snapshot
  const [appliedQuery, setAppliedQuery] = useState("");
  const [appliedCity, setAppliedCity] = useState<string>("ALL");
  const [appliedMunicipality, setAppliedMunicipality] = useState<string>("ALL");
  const [appliedAmenity, setAppliedAmenity] = useState<string>("ALL");
  const [appliedPriceRange, setAppliedPriceRange] = useState<string>("ALL");
  const [activeCategory, setActiveCategory] = useState<"FEATURED" | "MOST_VIEWED" | "TOP_RATED" | "NEWLY_LISTED">("FEATURED");

  // State for API data
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // EFFECTS & HANDLERS
  // ============================================================================

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getVisibleListingsForTenantRequest();
        setApiData(response.data.data);
      } catch (err) {
        setError("Failed to load properties");
        console.error("Error fetching listings:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const executeSearch = () => {
    setAppliedQuery(query);
    setAppliedCity(selectedCity);
    setAppliedMunicipality(selectedMunicipality);
    setAppliedAmenity(selectedAmenity);
    setAppliedPriceRange(priceRange);
    setPage(1);
  };

  const priceRanges = [
    { value: "ALL", label: "Any Price" },
    { value: "0-5000", label: "Under ₱5,000" },
    { value: "5000-10000", label: "₱5,000 - ₱10,000" },
    { value: "10000-20000", label: "₱10,000 - ₱20,000" },
    { value: "20000-30000", label: "₱20,000 - ₱30,000" },
    { value: "30000-50000", label: "₱30,000 - ₱50,000" },
    { value: "50000+", label: "₱50,000+" }
  ];

  // ============================================================================
  // DATA PROCESSING
  // ============================================================================

  const allUnits = useMemo(() => {
    if (!apiData) return [];
    
    const featured = apiData.featured || [];
    const mostViewed = apiData.mostViewed || [];
    const mostRated = apiData.mostRated || [];
    const newlyListed = apiData.newlyListed || [];

    let listings: Listing[] = [];

    switch (activeCategory) {
      case "FEATURED":
        listings = featured;
        break;
      case "MOST_VIEWED":
        listings = mostViewed;
        break;
      case "TOP_RATED":
        listings = mostRated;
        break;
      case "NEWLY_LISTED":
      default:
        listings = newlyListed;
        break;
    }

    const uniqueListings = listings.filter((listing, index, self) => 
      index === self.findIndex(l => l.unit.id === listing.unit.id)
    );

    return uniqueListings;
  }, [apiData, activeCategory]);

  const uniqueCities = useMemo(() => {
    const names = allUnits
      .map((listing) => listing.unit.property.city?.name)
      .filter(Boolean) as string[];
    return Array.from(new Set(names));
  }, [allUnits]);

  const uniqueMunicipalities = useMemo(() => {
    const names = allUnits
      .map((listing) => listing.unit.property.municipality?.name)
      .filter(Boolean) as string[];
    return Array.from(new Set(names));
  }, [allUnits]);

  const uniqueAmenities = useMemo(() => {
    const amenitySet = new Set<string>();
    allUnits.forEach(listing => {
      listing.unit.amenities?.forEach(amenity => {
        amenitySet.add(amenity.name);
      });
    });
    return Array.from(amenitySet);
  }, [allUnits]);

  const filteredUnits = useMemo(() => {
    const q = appliedQuery.trim().toLowerCase();
    const filtered = allUnits.filter((listing) => {
      const u = listing.unit;
      
      if (appliedCity !== "ALL") {
        const cityName = u.property.city?.name || "";
        if (cityName !== appliedCity) return false;
      }

      if (appliedMunicipality !== "ALL") {
        const municipalityName = u.property.municipality?.name || "";
        if (municipalityName !== appliedMunicipality) return false;
      }

      if (appliedAmenity !== "ALL") {
        const unitAmenityNames = new Set(u.amenities?.map((a) => a.name) || []);
        if (!unitAmenityNames.has(appliedAmenity)) return false;
      }

      if (appliedPriceRange !== "ALL") {
        const price = u.targetPrice;
        switch (appliedPriceRange) {
          case "0-5000":
            if (price > 5000) return false;
            break;
          case "5000-10000":
            if (price < 5000 || price > 10000) return false;
            break;
          case "10000-20000":
            if (price < 10000 || price > 20000) return false;
            break;
          case "20000-30000":
            if (price < 20000 || price > 30000) return false;
            break;
          case "30000-50000":
            if (price < 30000 || price > 50000) return false;
            break;
          case "50000+":
            if (price < 50000) return false;
            break;
        }
      }

      if (!q) return true;
      return (
        u.label.toLowerCase().includes(q) ||
        u.property.title.toLowerCase().includes(q) ||
        formatFullAddress(u.property).toLowerCase().includes(q)
      );
    });

    return filtered;
  }, [allUnits, appliedQuery, appliedCity, appliedMunicipality, appliedAmenity, appliedPriceRange]);

  const totalPages = Math.max(1, Math.ceil(filteredUnits.length / pageSize));
  const current = filteredUnits.slice((page - 1) * pageSize, page * pageSize);

  const goToPage = (next: number) => {
    const clamped = Math.min(Math.max(1, next), totalPages);
    setPage(clamped);
  };

  // ============================================================================
  // RENDER COMPONENTS
  // ============================================================================

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-sky-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-emerald-700"
          >
            Finding amazing properties...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-sky-50 flex items-center justify-center">
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
              className="mt-4 bg-gradient-to-r from-emerald-400 to-sky-400 hover:from-emerald-500 hover:to-sky-500"
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
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="p-4 mb-4 border border-emerald-100 bg-white/80 backdrop-blur-sm shadow-sm">
          <div className="flex flex-col gap-3">
            {/* Search Bar */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 h-4 w-4" />
                <input
                  value={query}
                  onChange={(e) => { setPage(1); setQuery(e.target.value); }}
                  placeholder="Search properties, locations, amenities..."
                  className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-emerald-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300"
                />
              </div>
              <Button 
                onClick={executeSearch} 
                className="px-4 bg-gradient-to-r from-emerald-400 to-sky-400 hover:from-emerald-500 hover:to-sky-500 text-sm"
              >
                Search
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowFilters(!showFilters)}
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 px-3"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            {/* Filters Grid */}
            <motion.div
              initial={false}
              animate={{ height: showFilters ? 'auto' : 0, opacity: showFilters ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-3 border-t border-emerald-100">
                <div>
                  <label className="block text-sm font-medium text-emerald-700 mb-1">City</label>
                  <select
                    value={selectedCity}
                    onChange={(e) => { setSelectedCity(e.target.value); setPage(1); }}
                    className="w-full px-3 py-2 text-sm border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300"
                  >
                    <option value="ALL">All Cities</option>
                    {uniqueCities.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-emerald-700 mb-1">Municipality</label>
                  <select
                    value={selectedMunicipality}
                    onChange={(e) => { setSelectedMunicipality(e.target.value); setPage(1); }}
                    className="w-full px-3 py-2 text-sm border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300"
                  >
                    <option value="ALL">All Municipalities</option>
                    {uniqueMunicipalities.map((municipality) => (
                      <option key={municipality} value={municipality}>{municipality}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-emerald-700 mb-1">Price Range</label>
                  <select
                    value={priceRange}
                    onChange={(e) => { setPriceRange(e.target.value); setPage(1); }}
                    className="w-full px-3 py-2 text-sm border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300"
                  >
                    {priceRanges.map((range) => (
                      <option key={range.value} value={range.value}>{range.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-emerald-700 mb-1">Amenity</label>
                  <select
                    value={selectedAmenity}
                    onChange={(e) => { setSelectedAmenity(e.target.value); setPage(1); }}
                    className="w-full px-3 py-2 text-sm border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300"
                  >
                    <option value="ALL">All Amenities</option>
                    {uniqueAmenities.map((amenity) => (
                      <option key={amenity} value={amenity}>{amenity}</option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>

            {/* Category Tabs and Reset */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              <Button 
                variant="outline" 
                onClick={() => { 
                  setQuery(""); 
                  setSelectedCity("ALL");
                  setSelectedMunicipality("ALL");
                  setSelectedAmenity("ALL");
                  setPriceRange("ALL");
                  setPage(1); 
                  setAppliedQuery(""); 
                  setAppliedCity("ALL");
                  setAppliedMunicipality("ALL");
                  setAppliedAmenity("ALL");
                  setAppliedPriceRange("ALL");
                }}
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 text-sm"
              >
                Clear Filters
              </Button>
              
              <div className="flex items-center gap-1 flex-wrap justify-center">
                {[
                  { key: "FEATURED" as const, label: "Featured" },
                  { key: "NEWLY_LISTED" as const, label: "New" },
                  { key: "MOST_VIEWED" as const, label: "Popular" },
                  { key: "TOP_RATED" as const, label: "Top Rated" },
                ].map((tab) => (
                  <motion.button
                    key={tab.key}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setActiveCategory(tab.key); setPage(1); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                      activeCategory === tab.key 
                        ? 'bg-gradient-to-r from-emerald-400 to-sky-400 text-white shadow-sm' 
                        : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
                    }`}
                  >
                    {tab.label}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* ================================================================= */}
      {/* AI CHATBOT FLOATING BUTTON */}
      {/* ================================================================= */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
        className="fixed bottom-6 right-6 z-40"
      >
        <Button
          onClick={() => setIsChatOpen(true)}
          className="rounded-full w-14 h-14 shadow-xl bg-gradient-to-r from-emerald-400 to-sky-400 hover:from-emerald-500 hover:to-sky-500 border-0 shadow-emerald-400/25 hover:shadow-emerald-400/40 transition-all duration-300"
          size="lg"
        >
          <Bot className="h-6 w-6" />
        </Button>
      </motion.div>

      {/* AI Chatbot Modal */}
      <AIChatbot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      {/* ================================================================= */}
      {/* RESULTS HEADER SECTION */}
      {/* ================================================================= */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4"
      >
        <div>
          <p className="text-sm text-emerald-700">
            Found <span className="font-bold text-emerald-600">{filteredUnits.length}</span> properties
            {appliedQuery && <span> for "<span className="font-medium">{appliedQuery}</span>"</span>}
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm text-emerald-700">
          <div className="flex items-center gap-2">
            <span>Page</span>
            <span className="font-bold text-emerald-600">{page}</span>
            <span>of</span>
            <span className="font-bold text-emerald-600">{totalPages}</span>
          </div>
        </div>
      </motion.div>

      {/* ================================================================= */}
      {/* PROPERTIES GRID SECTION */}
      {/* ================================================================= */}
      {current.length > 0 ? (
        <>
          <motion.div
            layout
            className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4"
          >
            {current.map((listing, index) => {
              const unit = listing.unit;
              const isFeatured = listing.isFeatured;
              
              return (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="relative"
                >
                  <Card 
                    className="overflow-hidden border border-emerald-100 transition-all duration-300 hover:shadow-md bg-white cursor-pointer group"
                    onClick={() => navigate(`/tenant/browse-unit/${listing.id}/details`)}
                  >
                    {/* Image container */}
                    <div className="relative aspect-[4/3] bg-gradient-to-br from-emerald-50 to-sky-50 overflow-hidden">
                      {unit.mainImageUrl ? (
                        <img 
                          src={unit.mainImageUrl} 
                          alt={unit.label} 
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className={`h-full w-full flex items-center justify-center ${
                          isFeatured 
                            ? 'bg-gradient-to-br from-amber-50 to-yellow-50' 
                            : 'bg-gradient-to-br from-emerald-50 to-sky-50'
                        }`}>
                          <Home className={`h-8 w-8 ${
                            isFeatured ? 'text-amber-400' : 'text-emerald-400'
                          }`} />
                        </div>
                      )}
                      
                      {/* Heart icon for favorites */}
                      <button 
                        className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Add to favorites logic here
                        }}
                      >
                        <Heart className="h-4 w-4 text-emerald-600 hover:text-red-500" />
                      </button>
                      
                      {/* Featured badge */}
                      {isFeatured && (
                        <div className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1 font-bold shadow-sm">
                          <Crown className="h-3 w-3" />
                          Featured
                        </div>
                      )}
                    </div>
                    
                    {/* Content area */}
                    <div className="p-3 space-y-2">
                      {/* Title and rating row */}
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-1 flex-1 pr-2">
                          {unit.property.title}
                        </h3>
                        <div className="flex items-center gap-1 shrink-0">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          <span className="text-xs font-medium text-gray-900">
                            {unit.avgRating ? unit.avgRating.toFixed(1) : 'New'}
                          </span>
                        </div>
                      </div>

                      {/* Property details */}
                      <div className="space-y-1">
                        <p className="text-xs text-emerald-600 line-clamp-1">
                          {getPropertyTypeDisplay(unit.property.type)} • {unit.label}
                        </p>
                        <p className="text-xs text-emerald-500 line-clamp-1 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {formatShortAddress(unit.property)}
                        </p>
                      </div>

                      {/* Price */}
                      <div className="flex items-baseline gap-1">
                        <span className="font-bold text-emerald-700">₱{unit.targetPrice.toLocaleString()}</span>
                        <span className="text-xs text-emerald-500">night</span>
                      </div>

                      {/* View count */}
                      <div className="flex items-center gap-1 text-xs text-emerald-500">
                        <Eye className="h-3 w-3" />
                        <span>{unit.viewCount} views</span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>

          {/* ============================================================= */}
          {/* PAGINATION SECTION */}
          {/* ============================================================= */}
          {totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-6 border-t border-emerald-100"
            >
              <p className="text-sm text-emerald-700">
                Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, filteredUnits.length)} of {filteredUnits.length} properties
              </p>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => goToPage(page - 1)} 
                  disabled={page === 1} 
                  className="gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 text-sm"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (page <= 3) pageNum = i + 1;
                    else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = page - 2 + i;
                    return (
                      <Button 
                        key={pageNum} 
                        variant={page === pageNum ? "default" : "outline"} 
                        className={`min-w-8 h-8 text-sm ${
                          page === pageNum 
                            ? 'bg-gradient-to-r from-emerald-400 to-sky-400' 
                            : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                        }`} 
                        onClick={() => goToPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => goToPage(page + 1)} 
                  disabled={page === totalPages} 
                  className="gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 text-sm"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="p-8 text-center border border-dashed border-emerald-200 bg-white/80 backdrop-blur-sm">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-emerald-100 to-sky-100 flex items-center justify-center mb-4">
              <Home className="h-8 w-8 text-emerald-400" />
            </div>
            <h3 className="text-lg font-medium text-emerald-900">No properties found</h3>
            <p className="text-emerald-600 mt-2 max-w-md mx-auto">
              Try adjusting your search criteria or browse different categories.
            </p>
            <Button 
              onClick={() => setIsChatOpen(true)}
              className="mt-4 bg-gradient-to-r from-emerald-400 to-sky-400 hover:from-emerald-500 hover:to-sky-500"
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