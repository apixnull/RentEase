import { useState, useEffect } from "react";
import { Eye, Filter, Search, X, Send, Plus, Bot } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: number;
  from: "user" | "ai";
  text: string;
}

interface Property {
  id: number;
  title: string;
  address: string;
  image: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  type: "apartment" | "house" | "condo" | "land";
  sqft: number;
  city: string;
  barangay: string;
}

const cities = ["Cebu City", "Mandaue", "Lapu-Lapu", "Talisay"];
const barangays = ["Lahug", "Talamban", "Banilad", "Mabolo", "Kasambagan", "Capitol Site", "Apas", "Luz"];

const dummyProperties: Property[] = [
  { id: 1, title: "Cozy Apartment", address: "123 Main St", image: "/prop1.jpg", price: 12000, bedrooms: 2, bathrooms: 1, type: "apartment", sqft: 850, city: "Cebu City", barangay: "Lahug" },
  { id: 2, title: "Modern Loft", address: "456 Elm St", image: "/prop2.jpg", price: 15000, bedrooms: 1, bathrooms: 1, type: "condo", sqft: 750, city: "Cebu City", barangay: "Talamban" },
  { id: 3, title: "Suburban Home", address: "789 Oak St", image: "/prop3.jpg", price: 25000, bedrooms: 3, bathrooms: 2, type: "house", sqft: 1800, city: "Mandaue", barangay: "Banilad" },
  { id: 4, title: "Downtown Condo", address: "101 City Ave", image: "/prop4.jpg", price: 18000, bedrooms: 1, bathrooms: 1, type: "condo", sqft: 650, city: "Cebu City", barangay: "Mabolo" },
  { id: 5, title: "Luxury Villa", address: "202 Hillside Dr", image: "/prop5.jpg", price: 50000, bedrooms: 4, bathrooms: 3, type: "house", sqft: 3200, city: "Lapu-Lapu", barangay: "Kasambagan" },
  { id: 6, title: "Garden Apartment", address: "303 Park Ln", image: "/prop6.jpg", price: 12000, bedrooms: 2, bathrooms: 1, type: "apartment", sqft: 950, city: "Cebu City", barangay: "Capitol Site" },
  { id: 7, title: "Studio Unit", address: "404 Tech Park", image: "/prop7.jpg", price: 10000, bedrooms: 1, bathrooms: 1, type: "condo", sqft: 500, city: "Cebu City", barangay: "Apas" },
  { id: 8, title: "Beachfront Cottage", address: "505 Coastal Rd", image: "/prop8.jpg", price: 30000, bedrooms: 2, bathrooms: 2, type: "house", sqft: 1200, city: "Lapu-Lapu", barangay: "Luz" }
];

const PropertyCard = ({ prop }: { prop: Property }) => (
  <motion.div
    className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden flex flex-col h-full"
    whileHover={{ scale: 1.02 }}
    transition={{ type: "spring", stiffness: 200 }}
  >
    <div className="relative">
      <img src={prop.image} alt={`Image of ${prop.title}`} className="w-full h-48 object-cover" />
      <span className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded">
        For Rent
      </span>
    </div>
    <div className="p-4 flex-1 flex flex-col">
      <h3 className="text-lg font-medium">{prop.title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{prop.address}</p>
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">{prop.barangay}, {prop.city}</p>
      
      <div className="grid grid-cols-3 gap-2 text-sm mb-4">
        <div className="flex flex-col items-center">
          <span className="font-medium">{prop.bedrooms}</span>
          <span className="text-xs text-gray-500">Beds</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="font-medium">{prop.bathrooms}</span>
          <span className="text-xs text-gray-500">Baths</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="font-medium">{prop.sqft}</span>
          <span className="text-xs text-gray-500">Sqft</span>
        </div>
      </div>
      
      <div className="mt-auto">
        <p className="text-lg font-semibold mb-3">
          ₱{prop.price.toLocaleString()}/mo
        </p>
        <Button asChild size="sm" className="w-full" variant="secondary">
          <Link to={`/properties/${prop.id}`} className="flex items-center justify-center">
            <Eye className="h-4 w-4 mr-1" />
            View Details
          </Link>
        </Button>
      </div>
    </div>
  </motion.div>
);

const Listing = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, from: "ai", text: "Hello! I'm your RentEase assistant. How can I help you find your perfect rental property today?" }
  ]);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    bedrooms: "",
    type: "",
    city: "",
    barangay: ""
  });
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const isMobile = windowWidth < 768;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const propertyTypes = [...new Set(dummyProperties.map(p => p.type))];

  const filteredProperties = dummyProperties.filter(p => {
    const matchesSearch = 
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.address.toLowerCase().includes(search.toLowerCase());
    
    const matchesPrice = 
      (!filters.minPrice || p.price >= Number(filters.minPrice)) &&
      (!filters.maxPrice || p.price <= Number(filters.maxPrice));
    
    const matchesBedrooms = !filters.bedrooms || p.bedrooms >= Number(filters.bedrooms);
    const matchesType = !filters.type || p.type === filters.type;
    const matchesCity = !filters.city || p.city === filters.city;
    const matchesBarangay = !filters.barangay || p.barangay === filters.barangay;
    
    return matchesSearch && matchesPrice && matchesBedrooms && matchesType && 
           matchesCity && matchesBarangay;
  });

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { id: Date.now(), from: "user", text: input };
    setMessages(msgs => [...msgs, userMsg]);
    setInput("");

    setTimeout(() => {
      const responses = [
        "I found several rental properties matching your criteria in Cebu City.",
        "Rental prices in that area typically range from ₱10,000 to ₱50,000 per month.",
        "Based on your preferences, I recommend checking out the modern condos in Lahug.",
        "Properties in that barangay average about 2-3 bedrooms. Here are some options...",
        "I can help compare rental properties. What specific features are you looking for?"
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      setMessages(msgs => [
        ...msgs,
        {
          id: Date.now() + 1,
          from: "ai",
          text: randomResponse
        }
      ]);
    }, 800);
  };

  const resetFilters = () => {
    setFilters({
      minPrice: "",
      maxPrice: "",
      bedrooms: "",
      type: "",
      city: "",
      barangay: ""
    });
  };

  return (
    <div className="relative">
      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
        {/* List Property Button */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            asChild
            className="rounded-full shadow-xl h-14 w-14 p-0 bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600"
          >
            <Link to="/list-property" className="flex items-center justify-center">
              <Plus className="h-6 w-6" />
            </Link>
          </Button>
        </motion.div>

        {/* AI Assistant Button */}
        {!isChatOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <button
              onClick={() => setIsChatOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-full p-4 shadow-xl"
              aria-label="Open AI Assistant"
            >
              <Bot className="h-6 w-6" />
            </button>
          </motion.div>
        )}
      </div>

      <motion.div
        className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Rental Properties</h1>
          <div className="flex gap-2">
            <Button 
              asChild
              variant="outline" 
              className="hidden sm:flex items-center gap-2"
            >
              <Link to="/list-property">
                <Plus className="h-4 w-4" />
                List Property
              </Link>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              {showFilters ? "Hide Filters" : "Filters"}
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search rental properties by title, address..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100"
            />
          </div>

          {showFilters && (
            <motion.div 
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.2 }}
            >
              <div>
                <label className="block text-sm font-medium mb-1">Min Price (₱)</label>
                <input
                  type="number"
                  placeholder="₱ Min"
                  value={filters.minPrice}
                  onChange={e => setFilters({...filters, minPrice: e.target.value})}
                  className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Max Price (₱)</label>
                <input
                  type="number"
                  placeholder="₱ Max"
                  value={filters.maxPrice}
                  onChange={e => setFilters({...filters, maxPrice: e.target.value})}
                  className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bedrooms</label>
                <select
                  value={filters.bedrooms}
                  onChange={e => setFilters({...filters, bedrooms: e.target.value})}
                  className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={filters.type}
                  onChange={e => setFilters({...filters, type: e.target.value})}
                  className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="">Any</option>
                  {propertyTypes.map(type => (
                    <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">City</label>
                <select
                  value={filters.city}
                  onChange={e => setFilters({...filters, city: e.target.value})}
                  className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="">Any</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Barangay</label>
                <select
                  value={filters.barangay}
                  onChange={e => setFilters({...filters, barangay: e.target.value})}
                  className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
                  disabled={!filters.city}
                >
                  <option value="">Any</option>
                  {barangays.map(brgy => (
                    <option key={brgy} value={brgy}>{brgy}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end justify-end col-span-1 md:col-span-2 lg:col-span-4">
                <Button variant="ghost" onClick={resetFilters} size="sm" title="Reset filters">
                  <X className="h-4 w-4 mr-1" />
                  Reset Filters
                </Button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Properties Section */}
        <section className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {search.trim() || Object.values(filters).some(f => f) 
                ? `Rental Properties (${filteredProperties.length})` 
                : "Featured Rentals"}
            </h2>
            {filteredProperties.length > 0 && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Sorted by: <span className="font-medium">Most Recent</span>
              </div>
            )}
          </div>

          {filteredProperties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProperties.map(prop => (
                <PropertyCard key={prop.id} prop={prop} />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
              <div className="mx-auto max-w-md">
                <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No properties found</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
                <Button 
                  variant="ghost" 
                  onClick={resetFilters} 
                  className="mt-4"
                >
                  Reset all filters
                </Button>
              </div>
            </div>
          )}
        </section>
      </motion.div>

      {/* AI Assistant Chat Window */}
      {isChatOpen && (
        <motion.div
          className={cn(
            "fixed z-50 flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-xl border dark:border-gray-700 overflow-hidden",
            isMobile ? "bottom-0 right-0 w-full h-[70vh]" : "bottom-6 right-6 w-full max-w-md h-[500px]"
          )}
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-blue-600 to-teal-500 text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                  <Bot className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div>
                <h3 className="font-bold">RentEase Assistant</h3>
                <p className="text-xs opacity-80">AI-powered property finder</p>
              </div>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="text-white/80 hover:text-white"
              aria-label="Close chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg px-4 py-2",
                    msg.from === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-gray-200 dark:bg-gray-700 dark:text-gray-100 rounded-bl-none"
                  )}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div className="p-3 border-t dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ask about rental properties..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                className="flex-1 border rounded-full px-4 py-2 text-sm dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button
                onClick={sendMessage}
                size="icon"
                className="rounded-full bg-blue-600 hover:bg-blue-700"
                disabled={!input.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Listing;