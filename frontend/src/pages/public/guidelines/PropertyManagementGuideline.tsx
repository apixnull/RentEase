import { ArrowLeft, Home, Building, Layers, Image, MapPin, CheckCircle2, AlertCircle, Lightbulb, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PropertyManagementGuideline = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Header with Back Button */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <motion.button
            onClick={() => navigate(-1)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors font-medium"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </motion.button>
          
          <Button
            variant="outline"
            onClick={() => navigate("/guidelines")}
            className="text-sm"
          >
            All Guidelines
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative py-12 overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-sky-600">
        <div className="absolute inset-0 overflow-hidden z-0">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white/10"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 40 + 20}px`,
                height: `${Math.random() * 40 + 20}px`,
              }}
              animate={{
                y: [0, (Math.random() - 0.5) * 50, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                <Home className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-blue-100 text-sm font-medium">Guidelines</p>
                <h1 className="text-3xl sm:text-4xl font-bold text-white">
                  Property Management
                </h1>
              </div>
            </div>
            <p className="text-lg text-blue-100 max-w-2xl">
              Understand how properties and units work together in RentEase to organize your rental portfolio effectively.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Property & Unit Relationship */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="p-6 sm:p-8 bg-white border-2 border-blue-100 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-600 p-3 rounded-lg">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Understanding Properties & Units</h2>
            </div>

            <div className="space-y-6">
              <div className="p-5 bg-blue-50 rounded-xl border border-blue-200">
                <h3 className="font-bold text-lg text-blue-900 mb-3">The Property-Unit Structure</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  In RentEase, a <strong>Property</strong> is the main building or location (like an apartment building, condominium, or boarding house), while <strong>Units</strong> are the individual rentable spaces within that property (like rooms, apartments, or floors).
                </p>
                <div className="flex items-center gap-3 text-sm text-blue-800 bg-blue-100 p-3 rounded-lg">
                  <Building className="w-5 h-5 flex-shrink-0" />
                  <span><strong>Example:</strong> "Sunshine Apartments" (Property) → Unit 1A, Unit 1B, Unit 2A (Units)</span>
                </div>
              </div>

              {/* Property Information - Full Width */}
              <div className="p-5 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center gap-2 mb-4">
                  <Home className="w-5 h-5 text-blue-600" />
                  <h4 className="font-semibold text-gray-900">Property Information (Shared by All Units)</h4>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2 text-sm text-gray-700">
                    <p className="font-medium text-blue-800 mb-2">Basic Details:</p>
                    <li className="flex items-start gap-2 list-none">
                      <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Title</strong> - Property name for listings</span>
                    </li>
                    <li className="flex items-start gap-2 list-none">
                      <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Type</strong> - Apartment, Condominium, Boarding House, or Single House</span>
                    </li>
                    <li className="flex items-start gap-2 list-none">
                      <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Main Image</strong> - Featured photo of the property</span>
                    </li>
                  </div>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p className="font-medium text-blue-800 mb-2">Address & Location:</p>
                    <li className="flex items-start gap-2 list-none">
                      <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Street, Barangay, Zip Code</strong></span>
                    </li>
                    <li className="flex items-start gap-2 list-none">
                      <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span><strong>City or Municipality</strong></span>
                    </li>
                    <li className="flex items-start gap-2 list-none">
                      <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Map Coordinates</strong> - For Google Maps location</span>
                    </li>
                  </div>
                  <div className="space-y-2 text-sm text-gray-700 sm:col-span-2">
                    <p className="font-medium text-blue-800 mb-2">Additional Info:</p>
                    <li className="flex items-start gap-2 list-none">
                      <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Nearby Institutions</strong> - Schools, hospitals, malls, transport, banks, churches, etc.</span>
                    </li>
                    <li className="flex items-start gap-2 list-none">
                      <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Other Information</strong> - Custom notes about the property</span>
                    </li>
                  </div>
                </div>
              </div>

              {/* Unit Information - Full Width */}
              <div className="p-5 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="flex items-center gap-2 mb-4">
                  <Layers className="w-5 h-5 text-emerald-600" />
                  <h4 className="font-semibold text-gray-900">Unit Information (Unique to Each Unit)</h4>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2 text-sm text-gray-700">
                    <p className="font-medium text-emerald-800 mb-2">Basic Details:</p>
                    <li className="flex items-start gap-2 list-none">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Label</strong> - Unit identifier (e.g., "Unit 3A", "Room 5")</span>
                    </li>
                    <li className="flex items-start gap-2 list-none">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Description</strong> - Detailed unit description</span>
                    </li>
                    <li className="flex items-start gap-2 list-none">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Floor Number</strong> - Which floor the unit is on</span>
                    </li>
                    <li className="flex items-start gap-2 list-none">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Max Occupancy</strong> - How many people can stay</span>
                    </li>
                  </div>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p className="font-medium text-emerald-800 mb-2">Pricing & Settings:</p>
                    <li className="flex items-start gap-2 list-none">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Target Price</strong> - Monthly rental rate</span>
                    </li>
                    <li className="flex items-start gap-2 list-none">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Requires Screening</strong> - Enable tenant screening</span>
                    </li>
                    <li className="flex items-start gap-2 list-none">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Unit Condition</strong> - Good, Under Maintenance, or Unusable</span>
                    </li>
                  </div>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p className="font-medium text-emerald-800 mb-2">Media:</p>
                    <li className="flex items-start gap-2 list-none">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Main Image</strong> - Primary unit photo</span>
                    </li>
                    <li className="flex items-start gap-2 list-none">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Other Images</strong> - Up to 6 additional photos</span>
                    </li>
                  </div>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p className="font-medium text-emerald-800 mb-2">Features:</p>
                    <li className="flex items-start gap-2 list-none">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Amenities</strong> - WiFi, AC, parking, etc.</span>
                    </li>
                    <li className="flex items-start gap-2 list-none">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Lease Rules</strong> - Visitor, pet, noise, parking policies, etc.</span>
                    </li>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Shared Property Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="p-6 sm:p-8 bg-white border-2 border-blue-100 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-sky-600 p-3 rounded-lg">
                <Image className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Shared Property Information</h2>
            </div>

            <div className="space-y-6">
              <div className="p-5 bg-amber-50 rounded-xl border border-amber-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-amber-900 mb-2">Important: Property Info is Shared Across Units</h4>
                    <p className="text-sm text-amber-800">
                      The property's <strong>main image</strong> and <strong>address</strong> are shared by all units within that property. When a tenant views any unit listing, they will see the property's main image and address.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Image className="w-5 h-5 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900">Main Property Image</h4>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">
                    This is typically the building exterior or a representative photo of the property. It appears on all unit listings belonging to this property.
                  </p>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-sm text-blue-800">
                      <strong>Tip:</strong> Choose a clear, well-lit photo of your building's facade that helps tenants identify the property when they visit.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <MapPin className="w-5 h-5 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900">Property Address</h4>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">
                    The full address (street, barangay, city/municipality, zip code) is set at the property level. All units under this property automatically use this address.
                  </p>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-sm text-blue-800">
                      <strong>Tip:</strong> Ensure your address is accurate and complete. This helps tenants find your property and appears in search results.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Visual Diagram */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="p-6 sm:p-8 bg-gradient-to-br from-blue-50 to-sky-50 border-2 border-blue-200 rounded-2xl shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">How It Works Together</h3>
            
            <div className="flex flex-col items-center space-y-4">
              {/* Property Box */}
              <div className="w-full max-w-lg p-5 bg-white rounded-xl border-2 border-blue-400 shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-600 p-2 rounded-lg">
                    <Building className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-blue-600 font-medium">PROPERTY</p>
                    <p className="font-bold text-gray-900">Sunshine Apartments</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <p className="font-medium text-blue-700 mb-1">Shared Info:</p>
                    <p>• Main Image</p>
                    <p>• Full Address</p>
                    <p>• Map Location</p>
                    <p>• Nearby Places</p>
                  </div>
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <p className="font-medium text-blue-700 mb-1">Type:</p>
                    <p>Apartment</p>
                    <p className="font-medium text-blue-700 mt-2 mb-1">Address:</p>
                    <p>123 Main St, Lahug</p>
                    <p>Cebu City, 6000</p>
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex flex-col items-center text-blue-400">
                <div className="h-4 w-0.5 bg-blue-300"></div>
                <p className="text-xs text-gray-500 my-1 font-medium">contains multiple units</p>
                <div className="h-4 w-0.5 bg-blue-300"></div>
              </div>

              {/* Units Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg">
                {[
                  { label: "Unit 1A", price: "₱8,000/mo", occupancy: "2 persons" },
                  { label: "Unit 1B", price: "₱10,000/mo", occupancy: "3 persons" },
                  { label: "Unit 2A", price: "₱12,000/mo", occupancy: "4 persons" }
                ].map((unit, i) => (
                  <div key={i} className="p-3 bg-white rounded-lg border-2 border-emerald-300 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Layers className="w-4 h-4 text-emerald-600" />
                      <p className="font-semibold text-gray-900 text-sm">{unit.label}</p>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <p className="text-emerald-700 font-medium">{unit.price}</p>
                      <p>• {unit.occupancy}</p>
                      <p>• Own photos</p>
                      <p>• Amenities</p>
                      <p>• Lease rules</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg max-w-lg w-full mt-4">
                <p className="text-sm text-amber-800 text-center">
                  <strong>Key Point:</strong> Each unit inherits the property's address, main image, and nearby institutions. But each unit has its own price, photos, amenities, condition, and lease rules.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Best Practices */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="p-6 sm:p-8 bg-white border-2 border-blue-100 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-emerald-600 p-3 rounded-lg">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Best Practices</h2>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <h4 className="font-semibold text-emerald-900 mb-2">✓ Use Descriptive Names</h4>
                <p className="text-sm text-emerald-800">
                  Name your properties and units clearly (e.g., "Green Valley Residences - Studio Unit A") so tenants can easily identify them.
                </p>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <h4 className="font-semibold text-emerald-900 mb-2">✓ Upload Unit-Specific Photos</h4>
                <p className="text-sm text-emerald-800">
                  While the main property image is shared, each unit should have its own photos showing the interior, layout, and unique features.
                </p>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <h4 className="font-semibold text-emerald-900 mb-2">✓ Keep Information Updated</h4>
                <p className="text-sm text-emerald-800">
                  Regularly update property and unit information to reflect current conditions, prices, and availability.
                </p>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <h4 className="font-semibold text-emerald-900 mb-2">✓ Complete All Details</h4>
                <p className="text-sm text-emerald-800">
                  Fill in all fields for both property and units. Complete listings attract more tenants and get approved faster.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex justify-between items-center pt-6"
        >
          <Button
            variant="outline"
            onClick={() => navigate("/guidelines")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            All Guidelines
          </Button>
          
          <Button
            onClick={() => navigate("/guidelines/listing-best-practices")}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            Next: Listing Best Practices
            <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default PropertyManagementGuideline;

