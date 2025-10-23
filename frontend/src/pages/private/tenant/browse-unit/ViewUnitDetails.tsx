import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  MapPin, 
  Star, 
  Eye, 
  Home, 
  Bath, 
  Users, 
  Wifi, 
  Car, 
  Snowflake,
  Utensils,
  Shield,
  MessageCircle,
  Phone,
  Facebook,
  MessageSquare,
  Calendar,
  CheckCircle,
  XCircle,
  User
} from "lucide-react";
import { getSpecificListingRequest } from "@/api/tenant/browseUnitApi";

// Types based on backend response
type Contact = {
  phoneNumber: string;
  messengerUrl: string;
  facebookUrl: string;
  whatsappUrl: string;
};

type Landlord = {
  id: string;
  fullName: string;
  avatarUrl: string;
  contact: Contact;
};

type UnitLeaseRule = {
  text: string;
  category: string;
};

type Amenity = {
  id: string;
  name: string;
  category: string;
};

type City = {
  id: string;
  name: string;
};

type Property = {
  id: string;
  title: string;
  type: string;
  street: string;
  barangay: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  mainImageUrl: string;
  nearInstitutions: string;
  city: City;
  municipality: null | any;
};

type Unit = {
  id: string;
  label: string;
  description: string;
  floorNumber: number;
  mainImageUrl: string;
  otherImages: string[];
  unitLeaseRules: UnitLeaseRule[];
  targetPrice: number;
  securityDeposit: number;
  requiresScreening: boolean;
  viewCount: number;
  avgRating: number | null;
  amenities: Amenity[];
  reviews: any[];
};

type MessageButton = {
  available: boolean;
  text: string;
};

type ListingDetails = {
  id: string;
  lifecycleStatus: string;
  expiresAt: string;
  unit: Unit;
  property: Property;
  landlord: Landlord;
  messageButton: MessageButton;
};

// Simplified Inquiry Form Types
type InquiryFormData = {
  occupants: string;
  duration: string;
  moveInDate: string;
  hasPets: boolean;
  petDetails: string;
  needsParking: boolean;
  additionalNotes: string;
};

// Chat Components
const ChatPopup = ({ 
  isOpen, 
  onClose, 
  landlord,
  initialMessage
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  landlord: Landlord;
  initialMessage?: string;
}) => {
  const [messages, setMessages] = useState<Array<{ role: "user" | "landlord"; content: string; timestamp: Date }>>([
    { 
      role: "landlord", 
      content: "Hello! Thanks for your interest in my property. How can I help you?", 
      timestamp: new Date() 
    }
  ]);
  const [newMessage, setNewMessage] = useState(initialMessage || "");

  useEffect(() => {
    if (initialMessage) {
      sendInitialMessage();
    }
  }, [initialMessage]);

  const sendInitialMessage = () => {
    if (!initialMessage) return;
    
    const userMessage = {
      role: "user" as const,
      content: initialMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Simulate landlord reply after 1-3 seconds
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: "landlord",
        content: "Thanks for your inquiry! I'll review your details and get back to you shortly.",
        timestamp: new Date()
      }]);
    }, 1000 + Math.random() * 2000);
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    
    const userMessage = {
      role: "user" as const,
      content: newMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setNewMessage("");

    // Simulate landlord reply after 1-3 seconds
    setTimeout(() => {
      const replies = [
        "I'd be happy to schedule a viewing. What time works for you?",
        "Yes, that amenity is available. Would you like to know more about it?",
        "The security deposit is refundable after the contract ends, provided there's no damage.",
        "I can show you the unit tomorrow if you're available.",
        "The rent includes basic utilities. Only electricity is separate."
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      
      setMessages(prev => [...prev, {
        role: "landlord",
        content: randomReply,
        timestamp: new Date()
      }]);
    }, 1000 + Math.random() * 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md h-[600px] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b bg-gradient-to-r from-emerald-600 to-sky-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src={landlord.avatarUrl} 
                alt={landlord.fullName}
                className="w-10 h-10 rounded-full border-2 border-white"
              />
              <div>
                <h3 className="font-semibold">{landlord.fullName}</h3>
                <p className="text-xs text-white/80">Online</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
              <XCircle className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-gray-50">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === "user"
                    ? "bg-emerald-500 text-white rounded-br-none"
                    : "bg-white border border-gray-200 rounded-bl-none"
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.role === "user" ? "text-emerald-100" : "text-gray-500"
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t bg-white">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-sm"
            />
            <Button onClick={sendMessage} className="bg-emerald-600 hover:bg-emerald-700">
              <MessageCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Simplified Inquiry Form Component
const InquiryForm = ({
  isOpen,
  onClose,
  onSubmit,
  propertyTitle,
  unitLabel
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: InquiryFormData) => void;
  propertyTitle: string;
  unitLabel: string;
}) => {
  const [formData, setFormData] = useState<InquiryFormData>({
    occupants: "",
    duration: "",
    moveInDate: "",
    hasPets: false,
    petDetails: "",
    needsParking: false,
    additionalNotes: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      occupants: "",
      duration: "",
      moveInDate: "",
      hasPets: false,
      petDetails: "",
      needsParking: false,
      additionalNotes: ""
    });
    onClose();
  };

  const handleChange = (field: keyof InquiryFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Inquire About Property</h3>
              <p className="text-sm text-gray-600">{propertyTitle} - {unitLabel}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <XCircle className="h-5 w-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Number of Occupants *</label>
                <select
                  value={formData.occupants}
                  onChange={(e) => handleChange('occupants', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-sm"
                  required
                >
                  <option value="">Select number</option>
                  <option value="1">1 person</option>
                  <option value="2">2 people</option>
                  <option value="3">3 people</option>
                  <option value="4">4 people</option>
                  <option value="5+">5+ people</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Duration of Stay (months) *</label>
                <select
                  value={formData.duration}
                  onChange={(e) => handleChange('duration', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-sm"
                  required
                >
                  <option value="">Select duration</option>
                  <option value="1-3">1-3 months</option>
                  <option value="6">6 months</option>
                  <option value="12">12 months</option>
                  <option value="24">24 months</option>
                  <option value="24+">More than 24 months</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Desired Move-in Date</label>
                <input
                  type="date"
                  value={formData.moveInDate}
                  onChange={(e) => handleChange('moveInDate', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-sm"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="hasPets"
                    checked={formData.hasPets}
                    onChange={(e) => handleChange('hasPets', e.target.checked)}
                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="hasPets" className="text-sm font-medium text-gray-700">
                    I have pets
                  </label>
                </div>
                
                {formData.hasPets && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Pet Details</label>
                    <input
                      type="text"
                      value={formData.petDetails}
                      onChange={(e) => handleChange('petDetails', e.target.value)}
                      placeholder="e.g., 1 small dog, 2 cats..."
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-sm"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="needsParking"
                  checked={formData.needsParking}
                  onChange={(e) => handleChange('needsParking', e.target.checked)}
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="needsParking" className="text-sm font-medium text-gray-700">
                  I need parking
                </label>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Additional Notes</label>
                <textarea
                  value={formData.additionalNotes}
                  onChange={(e) => handleChange('additionalNotes', e.target.value)}
                  placeholder="Any special requirements or questions..."
                  rows={3}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-sm resize-none"
                />
              </div>
            </div>

            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
              <MessageCircle className="h-4 w-4 mr-2" />
              Send Inquiry via Chat
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
};

// Amenity Icon Mapping
const getAmenityIcon = (amenityName: string) => {
  const iconMap: { [key: string]: any } = {
    'Aircon': Snowflake,
    'Electric Fan': Snowflake,
    'Power Backup / Generator': Shield,
    'Balcony': Home,
    'Garden / Outdoor Space': Home,
    'Refrigerator': Utensils,
    'Microwave': Utensils,
    'Dining Table': Utensils,
    'Bedframe & Mattress': Home,
    'Closet / Wardrobe': Home,
    'Private Bathroom': Bath,
    '24/7 Security': Shield,
    'CCTV': Shield,
    'Housekeeping Service': Users,
    'Wifi': Wifi,
    'Parking': Car,
  };
  
  return iconMap[amenityName] || Home;
};

// Format address
const formatAddress = (property: Property) => {
  return `${property.street}, ${property.barangay}, ${property.city.name}, ${property.zipCode}`;
};

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0
  }).format(amount);
};

// Google Maps URL generator
const getGoogleMapsUrl = (latitude: number, longitude: number) => {
  return `https://www.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`;
};

const ViewUnitDetails = () => {
  const { listingId } = useParams<{ listingId: string }>();
  const [listing, setListing] = useState<ListingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [showInquireOptions, setShowInquireOptions] = useState(false);
  const [inquiryFormOpen, setInquiryFormOpen] = useState(false);
  const [initialChatMessage, setInitialChatMessage] = useState("");

  useEffect(() => {
    const fetchListingDetails = async () => {
      if (!listingId) return;
      
      try {
        setLoading(true);
        const response = await getSpecificListingRequest(listingId);
        setListing(response.data.data);
      } catch (err) {
        setError("Failed to load property details");
        console.error("Error fetching listing:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchListingDetails();
  }, [listingId]);

  const handleInquirySubmit = (inquiryData: InquiryFormData) => {
    // Format the inquiry data into a structured message
    const message = `Hello! I'm interested in ${listing?.property.title} - ${listing?.unit.label}. Here are my details:

👥 Number of Occupants: ${inquiryData.occupants || "Not specified"}
📅 Desired Duration: ${inquiryData.duration || "Not specified"} months
🗓️ Move-in Date: ${inquiryData.moveInDate || "Flexible"}
🐾 Pets: ${inquiryData.hasPets ? `Yes - ${inquiryData.petDetails || "No details provided"}` : "No"}
🚗 Parking Needed: ${inquiryData.needsParking ? "Yes" : "No"}
📝 Additional Notes: ${inquiryData.additionalNotes || "None"}

I'd like to schedule a viewing. Please let me know about availability!`;

    setInitialChatMessage(message);
    setInquiryFormOpen(false);
    setChatOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Property Not Found</h3>
          <p className="text-gray-600 mb-4">{error || "The property you're looking for doesn't exist."}</p>
          <Link to="/tenant/browse-unit">
            <Button>Back to Browse</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const { unit, property, landlord } = listing;
  const allImages = [unit.mainImageUrl, ...unit.otherImages].filter(Boolean);
  const categorizedRules = unit.unitLeaseRules.reduce((acc, rule) => {
    if (!acc[rule.category]) acc[rule.category] = [];
    acc[rule.category].push(rule);
    return acc;
  }, {} as Record<string, UnitLeaseRule[]>);

  const nearInstitutions = JSON.parse(property.nearInstitutions || "[]");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/tenant/browse-unit">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Browse
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{unit.viewCount} views</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span>{unit.avgRating ? unit.avgRating.toFixed(1) : "No ratings"}</span>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Images and Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card className="overflow-hidden">
              <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                {allImages.length > 0 ? (
                  <img
                    src={allImages[activeImageIndex]}
                    alt={`${unit.label} - Image ${activeImageIndex + 1}`}
                    className="w-full h-96 object-cover"
                  />
                ) : (
                  <div className="w-full h-96 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <Home className="h-16 w-16 text-gray-400" />
                  </div>
                )}
              </div>
              
              {allImages.length > 1 && (
                <div className="p-4 border-t">
                  <div className="flex gap-2 overflow-x-auto">
                    {allImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 ${
                          activeImageIndex === index 
                            ? 'border-emerald-500' 
                            : 'border-gray-200'
                        } overflow-hidden`}
                      >
                        <img
                          src={image}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Basic Info */}
            <Card className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {property.title} • {unit.label}
                  </h1>
                  <p className="text-gray-600 mt-1">{unit.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-emerald-600">
                    {formatCurrency(unit.targetPrice)}
                    <span className="text-sm font-normal text-gray-600">/month</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Security: {formatCurrency(unit.securityDeposit)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-gray-400" />
                  <span>{property.type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span>Floor {unit.floorNumber}</span>
                </div>
                {unit.requiresScreening && (
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-amber-500" />
                    <span className="text-amber-600">Screening Required</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Tabs for Details */}
            <Tabs defaultValue="amenities" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="amenities">Amenities</TabsTrigger>
                <TabsTrigger value="rules">House Rules</TabsTrigger>
                <TabsTrigger value="location">Location</TabsTrigger>
              </TabsList>

              {/* Amenities Tab */}
              <TabsContent value="amenities" className="mt-4">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Amenities</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {unit.amenities.map((amenity) => {
                      const IconComponent = getAmenityIcon(amenity.name);
                      return (
                        <div key={amenity.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200">
                          <div className="p-2 bg-emerald-50 rounded-lg">
                            <IconComponent className="h-4 w-4 text-emerald-600" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">{amenity.name}</div>
                            <div className="text-xs text-gray-500">{amenity.category}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </TabsContent>

              {/* House Rules Tab */}
              <TabsContent value="rules" className="mt-4">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">House Rules</h3>
                  <div className="space-y-4">
                    {Object.entries(categorizedRules).map(([category, rules]) => (
                      <div key={category}>
                        <h4 className="font-medium text-gray-900 capitalize mb-2">{category} Rules</h4>
                        <ul className="space-y-2">
                          {rules.map((rule, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                              <span>{rule.text}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>

              {/* Location Tab */}
              <TabsContent value="location" className="mt-4">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Location</h3>
                  
                  {/* Google Maps */}
                  <div className="mb-6 rounded-lg overflow-hidden border border-gray-200">
                    <iframe
                      width="100%"
                      height="300"
                      frameBorder="0"
                      style={{ border: 0 }}
                      src={getGoogleMapsUrl(property.latitude, property.longitude)}
                      allowFullScreen
                    ></iframe>
                  </div>

                  {/* Address */}
                  <div className="mb-6">
                    <h4 className="font-medium mb-2">Full Address</h4>
                    <p className="text-gray-600 flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      {formatAddress(property)}
                    </p>
                  </div>

                  {/* Nearby Institutions */}
                  {nearInstitutions.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Nearby Institutions</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {nearInstitutions.map((institution: any, index: number) => (
                          <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                            <div className="p-1.5 bg-white rounded-lg border">
                              <Home className="h-3 w-3 text-gray-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium">{institution.name}</div>
                              <div className="text-xs text-gray-500 capitalize">{institution.type}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Landlord Info & Action */}
          <div className="space-y-6">
            {/* Landlord Card */}
            <Card className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={landlord.avatarUrl}
                  alt={landlord.fullName}
                  className="w-16 h-16 rounded-full border-2 border-emerald-200"
                />
                <div>
                  <h3 className="font-semibold text-gray-900">{landlord.fullName}</h3>
                  <p className="text-sm text-gray-600">Property Owner</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-3 w-3 text-yellow-400" />
                    <span className="text-xs text-gray-600">Landlord</span>
                  </div>
                </div>
              </div>

              {/* Contact Buttons */}
              <div className="space-y-2">
                {landlord.contact.phoneNumber && (
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Phone className="h-4 w-4" />
                    Call {landlord.contact.phoneNumber}
                  </Button>
                )}
                
                {landlord.contact.messengerUrl && (
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Messenger
                  </Button>
                )}
                
                {landlord.contact.facebookUrl && (
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Facebook className="h-4 w-4" />
                    Facebook
                  </Button>
                )}
              </div>

              {/* Quick Actions */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Button 
                  onClick={() => setInquiryFormOpen(true)}
                  className="w-full bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-700 hover:to-sky-700 mb-2"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Inquire Now
                </Button>
              
              </div>
            </Card>

            {/* Property Highlights */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Property Highlights</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Property Type</span>
                  <span className="font-medium">{property.type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Floor Level</span>
                  <span className="font-medium">{unit.floorNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Monthly Rent</span>
                  <span className="font-medium text-emerald-600">{formatCurrency(unit.targetPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Security Deposit</span>
                  <span className="font-medium">{formatCurrency(unit.securityDeposit)}</span>
                </div>
                {unit.requiresScreening && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Screening</span>
                    <span className="font-medium text-amber-600">Required</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Safety Tips */}
            <Card className="p-6 bg-amber-50 border-amber-200">
              <h3 className="font-semibold text-amber-900 mb-2">Safety Tips</h3>
              <ul className="text-sm text-amber-800 space-y-1">
                <li>• Always meet in public places first</li>
                <li>• Never wire money or pay in advance</li>
                <li>• Verify the property ownership</li>
                <li>• Inspect the unit thoroughly before committing</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>

      {/* Inquire Options Modal */}
      {showInquireOptions && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Contact Landlord</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowInquireOptions(false)}>
                  <XCircle className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="space-y-3">
                <Button 
                  onClick={() => {
                    setShowInquireOptions(false);
                    setInquiryFormOpen(true);
                  }}
                  className="w-full justify-start gap-3 h-12"
                >
                  <MessageCircle className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Send Inquiry</div>
                    <div className="text-xs text-gray-600">Fill out inquiry form</div>
                  </div>
                </Button>

                {landlord.contact.phoneNumber && (
                  <Button variant="outline" className="w-full justify-start gap-3 h-12">
                    <Phone className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">Call Now</div>
                      <div className="text-xs text-gray-600">{landlord.contact.phoneNumber}</div>
                    </div>
                  </Button>
                )}

                <Button variant="outline" className="w-full justify-start gap-3 h-12">
                  <Calendar className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Schedule Viewing</div>
                    <div className="text-xs text-gray-600">Book a property tour</div>
                  </div>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Simplified Inquiry Form */}
      <InquiryForm 
        isOpen={inquiryFormOpen}
        onClose={() => setInquiryFormOpen(false)}
        onSubmit={handleInquirySubmit}
        propertyTitle={property.title}
        unitLabel={unit.label}
      />

      {/* Chat Popup */}
      <ChatPopup 
        isOpen={chatOpen} 
        onClose={() => setChatOpen(false)} 
        landlord={landlord}
        initialMessage={initialChatMessage}
      />

    </div>
  );
};

export default ViewUnitDetails;