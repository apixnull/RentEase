import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  ArrowLeft, MessageSquare, Star, Heart, 
  MapPin, Check, Zap, User, Search, 
  Home as HomeIcon, Filter, X, ChevronDown, ChevronUp,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface Address {
  street: string;
  barangay: string;
  municipality: string;
  city: string;
  province: string;
  zipCode: string;
}

interface Property {
  title: string;
  address: Address;
  amenityTags: string[];
}

interface RentalUnit {
  id: string;
  status: "AVAILABLE" | "OCCUPIED";
  targetPrice: number;
  isNegotiable: boolean;
  imageUrl: string | null;
  property: Property;
}

const RentalListings = () => {
  const [showChat, setShowChat] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<{text: string, isUser: boolean}[]>([
    {text: "Hi there! I'm RentEase AI Assistant. How can I help you find your perfect rental today?", isUser: false}
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [rentalData, setRentalData] = useState<RentalUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    amenities: [] as string[],
  });
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch rental data from API
  useEffect(() => {
    const fetchRentals = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/tenant/browse/listed-units', {
          withCredentials: true
        });
        setRentalData(response.data);
      } catch (err) {
        setError('Failed to fetch rental listings. Please try again later.');
        console.error('API Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRentals();
  }, []);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Filter rentals based on search criteria
  const filteredRentals = rentalData.filter(rental => {
    // Only show available units
    if (rental.status !== "AVAILABLE") return false;
    
    const searchLower = searchTerm.toLowerCase();
    const price = rental.targetPrice;
    
    // Price filter
    if (filters.minPrice && price < Number(filters.minPrice)) return false;
    if (filters.maxPrice && price > Number(filters.maxPrice)) return false;
    
    // Amenities filter
    if (filters.amenities.length > 0) {
      const hasAllAmenities = filters.amenities.every(amenity => 
        rental.property.amenityTags.includes(amenity)
      );
      if (!hasAllAmenities) return false;
    }
    
    return (
      rental.property.title.toLowerCase().includes(searchLower) ||
      rental.property.address.city.toLowerCase().includes(searchLower) ||
      rental.property.address.province.toLowerCase().includes(searchLower) ||
      rental.property.amenityTags.some(tag => tag.toLowerCase().includes(searchLower)
    ));
  });

  const handleSendMessage = () => {
    if (message.trim()) {
      setMessages([...messages, { text: message, isUser: true }]);
      setMessage('');
      
      // Simulate AI response after a delay
      setTimeout(() => {
        const responses = [
          "I found several properties matching your criteria. Would you like me to filter the listings?",
          "Great choice! This property has excellent reviews. Would you like more details?",
          "I can help you compare different properties. What features are most important to you?",
          "Based on your preferences, I recommend these listings. Would you like to see similar properties?",
          "That's a great question! Properties in that area typically range from ₱5,000 to ₱15,000 per month.",
          "I've updated the filters based on your preferences. Here are the best matches I found."
        ];
        setMessages(prev => [
          ...prev, 
          { 
            text: responses[Math.floor(Math.random() * responses.length)], 
            isUser: false 
          }
        ]);
      }, 1000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const toggleAmenity = (amenity: string) => {
    setFilters(prev => {
      if (prev.amenities.includes(amenity)) {
        return {
          ...prev,
          amenities: prev.amenities.filter(a => a !== amenity)
        };
      } else {
        return {
          ...prev,
          amenities: [...prev.amenities, amenity]
        };
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading rental properties...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:opacity-90 transition-opacity shadow-md"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Unique amenities from all properties
  const allAmenities = Array.from(
    new Set(
      rentalData.flatMap(rental => rental.property.amenityTags)
    )
  ).sort();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Modern Header */}
      <header className="bg-gradient-to-r from-blue-800 to-indigo-900 shadow-lg sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center">
            <a href="/dashboard" className="flex items-center text-white hover:text-blue-200">
              <ArrowLeft className="w-5 h-5 mr-1" />
              <span className="hidden sm:inline">Dashboard</span>
            </a>
            <h1 className="ml-4 text-xl font-bold text-white">Rental Explorer</h1>
          </div>
          
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by location, amenities, or price..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/90 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center bg-white text-blue-800 px-4 py-2 rounded-lg hover:bg-gray-100 transition-all shadow-md"
            >
              <Filter className="w-5 h-5 mr-1.5" />
              <span className="hidden sm:inline">Filters</span>
            </button>
            
            <button 
              onClick={() => setShowChat(!showChat)}
              className="flex items-center justify-center bg-gradient-to-r from-teal-500 to-emerald-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all shadow-lg"
            >
              <MessageSquare className="w-5 h-5 mr-1.5" />
              <span className="hidden sm:inline">AI Assistant</span>
            </button>
          </div>
        </div>
      </header>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div 
            className="bg-white border-b border-gray-200 shadow-sm"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Price Range (₱)</h3>
                <div className="flex gap-3">
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={filters.minPrice}
                    onChange={e => setFilters({...filters, minPrice: e.target.value})}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={filters.maxPrice}
                    onChange={e => setFilters({...filters, maxPrice: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {allAmenities.slice(0, 5).map(amenity => (
                    <button
                      key={amenity}
                      onClick={() => toggleAmenity(amenity)}
                      className={`px-3 py-1.5 text-sm rounded-full ${
                        filters.amenities.includes(amenity)
                          ? 'bg-blue-100 text-blue-700 border border-blue-300'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {amenity}
                    </button>
                  ))}
                  {allAmenities.length > 5 && (
                    <button className="text-sm text-blue-600 hover:underline">
                      +{allAmenities.length - 5} more
                    </button>
                  )}
                </div>
              </div>
              
              <div className="flex items-end">
                <button 
                  onClick={() => setFilters({minPrice: '', maxPrice: '', amenities: []})}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  Reset Filters
                </button>
                <button 
                  onClick={() => setShowFilters(false)}
                  className="ml-auto px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 pb-16">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Find Your Perfect Home
            </h2>
            <p className="text-gray-600 mt-1">
              Browse through our curated selection of premium rentals
            </p>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-gray-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
              {filteredRentals.length} {filteredRentals.length === 1 ? 'property' : 'properties'} available
            </p>
            <div className="hidden md:flex gap-1">
              <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200">
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200">
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
        
        {filteredRentals.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full flex items-center justify-center mb-6">
              <HomeIcon className="w-12 h-12 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              We couldn't find any properties matching your search criteria. Try adjusting your filters or search terms.
            </p>
            <div className="flex justify-center gap-3">
              <button 
                onClick={() => setSearchTerm('')}
                className="px-5 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear Search
              </button>
              <button 
                onClick={() => setFilters({minPrice: '', maxPrice: '', amenities: []})}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:opacity-90 transition-opacity shadow-md"
              >
                Reset Filters
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {filteredRentals.map((rental) => (
              <motion.div 
                key={rental.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 hover:shadow-lg transition-all flex flex-col h-full"
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Property Image */}
                <div className="relative h-40 overflow-hidden">
                  {rental.imageUrl ? (
                    <img 
                      src={rental.imageUrl} 
                      alt={rental.property.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  ) : (
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 w-full h-full flex items-center justify-center">
                      <HomeIcon className="w-10 h-10 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-2 right-2 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                    Available
                  </div>
                  
                  {/* Price */}
                  <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm">
                    <div className="font-bold text-gray-900">
                      ₱{rental.targetPrice.toLocaleString()}
                      <span className="text-xs font-normal">/month</span>
                    </div>
                    {rental.isNegotiable && (
                      <span className="text-[10px] text-blue-600 font-medium">Negotiable</span>
                    )}
                  </div>
                </div>
                
                {/* Property Details */}
                <div className="p-3 flex flex-col flex-grow">
                  <div className="mb-2">
                    <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{rental.property.title}</h3>
                    <div className="flex items-center text-gray-600 mb-2 text-sm">
                      <MapPin className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                      <span className="truncate">{rental.property.address.city}, {rental.property.address.province}</span>
                    </div>
                    
                    {/* Amenity Tags */}
                    <div className="flex flex-wrap gap-1">
                      {rental.property.amenityTags.slice(0, 2).map((tag, i) => (
                        <div key={i} className="bg-blue-50 px-2 py-0.5 rounded text-xs text-blue-700 font-medium">
                          {tag}
                        </div>
                      ))}
                      {rental.property.amenityTags.length > 2 && (
                        <div className="bg-gray-100 px-2 py-0.5 rounded text-xs text-gray-700">
                          +{rental.property.amenityTags.length - 2}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="mt-auto pt-3 border-t border-gray-100 flex justify-between">
                    <button className="text-xs bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-1.5 px-3 rounded-lg transition-all shadow-sm">
                      Details
                    </button>
                    <button className="p-1.5 text-gray-500 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                      <Heart className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* AI Chat Interface */}
      <AnimatePresence>
        {showChat && (
          <motion.div 
            className="fixed bottom-4 right-4 w-full max-w-md h-[70vh] max-h-[600px] bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col z-50"
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ duration: 0.3, type: "spring", damping: 25 }}
          >
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-teal-600 to-emerald-700 p-4 flex items-center">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden">
                  <img 
                    src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExY3N0YzVmb2d4eWZ0d2MxNHc2dW1xNnY0OGt2a3d2cHl6b3hxZ2hqYSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ZgTR3UQELQA1enOZ5U/giphy.gif" 
                    alt="AI Assistant"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div className="ml-3">
                <h3 className="font-bold text-white">RentEase AI Assistant</h3>
                <p className="text-xs text-teal-100">Online • Ready to help</p>
              </div>
              <button 
                onClick={() => setShowChat(false)}
                className="ml-auto text-white hover:text-teal-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-gray-50 to-gray-100">
              {messages.map((msg, index) => (
                <motion.div 
                  key={index} 
                  className={`mb-4 flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {!msg.isUser && (
                    <div className="mr-2 flex-shrink-0">
                      <div className="w-8 h-8 rounded-full overflow-hidden">
                        <img 
                          src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExY3N0YzVmb2d4eWZ0d2MxNHc2dW1xNnY0OGt2a3d2cHl6b3hxZ2hqYSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ZgTR3UQELQA1enOZ5U/giphy.gif" 
                          alt="AI Assistant"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                  <motion.div 
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      msg.isUser 
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-none' 
                        : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
                    }`}
                    whileHover={{ scale: 1.02 }}
                  >
                    {msg.text}
                  </motion.div>
                </motion.div>
              ))}
              <div ref={chatEndRef} />
            </div>
            
            {/* Suggested Questions */}
            <div className="px-4 py-3 bg-white border-t border-gray-200">
              <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar">
                {[
                  "Show properties under ₱10,000",
                  "Find places with WiFi",
                  "Pet-friendly options?",
                  "What's available in Cebu?"
                ].map((q, i) => (
                  <motion.button
                    key={i}
                    className="flex-shrink-0 text-xs bg-gradient-to-b from-gray-50 to-gray-100 text-gray-700 px-3 py-1.5 rounded-lg border border-gray-200 hover:from-gray-100 hover:to-gray-200 transition-all"
                    onClick={() => setMessage(q)}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {q}
                  </motion.button>
                ))}
              </div>
              
              {/* Chat Input */}
              <div className="mt-2 flex">
                <input
                  type="text"
                  placeholder="Ask about rentals, pricing, or features..."
                  className="flex-1 border border-gray-300 rounded-l-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <motion.button 
                  onClick={handleSendMessage}
                  className="bg-gradient-to-r from-teal-600 to-emerald-700 text-white px-5 rounded-r-lg hover:opacity-90 transition-opacity"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating AI Button */}
      {!showChat && (
        <motion.button
          onClick={() => setShowChat(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-full shadow-xl flex items-center justify-center z-40"
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="relative w-10 h-10">
            <img 
              src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExY3N0YzVmb2d4eWZ0d2MxNHc2dW1xNnY0OGt2a3d2cHl6b3hxZ2hqYSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ZgTR3UQELQA1enOZ5U/giphy.gif" 
              alt="AI Assistant"
              className="w-full h-full rounded-full object-cover"
            />
          </div>
        </motion.button>
      )}
      
      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default RentalListings;