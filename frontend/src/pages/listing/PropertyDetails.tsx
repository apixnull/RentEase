import { useState } from "react";
import { ArrowLeft, Phone, Mail, MapPin, User, Calendar, FileText, Star, Facebook, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface ApplicationFormData {
  fullName: string;
  email: string;
  phone: string;
  moveInDate: string;
  message: string;
}

const PropertyDetails = () => {
  const navigate = useNavigate();
  
  // Hardcoded property data with complete address and social contacts
  const property = {
    id: 1,
    title: "Modern Loft in Downtown Cebu",
    address: {
      street: "123 IT Park Avenue",
      barangay: "Apas",
      city: "Cebu City",
      province: "Cebu",
      postalCode: "6000"
    },
    image: "/prop1.jpg",
    price: 25000,
    bedrooms: 2,
    bathrooms: 1,
    type: "Condo",
    sqft: 850,
    description: "This modern loft features floor-to-ceiling windows with stunning city views, an open floor plan, and high-end finishes throughout. Located in the heart of IT Park with easy access to restaurants, shopping, and entertainment.",
    amenities: ["Swimming Pool", "Fitness Center", "24/7 Security", "Parking", "WiFi"],
    contact: {
      name: "Maria Santos",
      phone: "+63 912 345 6789",
      email: "maria.santos@example.com",
      facebook: "MariaSantosProperties",
      messenger: "m.me/MariaSantosProperties"
    },
    rating: 4.7,
    reviews: 28,
    leaseDocuments: {
      agreement: "/documents/lease-agreement.pdf",
      conditionReport: "/documents/condition-report.pdf"
    }
  };

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState<ApplicationFormData>({
    fullName: '',
    email: '',
    phone: '',
    moveInDate: '',
    message: ''
  });
  const [errors, setErrors] = useState<Partial<ApplicationFormData>>({});

  const validateForm = () => {
    const newErrors: Partial<ApplicationFormData> = {};
    if (!formData.fullName) newErrors.fullName = "Full name is required";
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }
    if (!formData.phone) newErrors.phone = "Phone number is required";
    if (!formData.moveInDate) newErrors.moveInDate = "Move-in date is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("Application submitted:", formData);
      setIsSubmitted(true);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div 
      className="max-w-7xl mx-auto p-4 md:p-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants}>
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)} 
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Listings
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Property Details */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div variants={itemVariants}>
            <h1 className="text-3xl font-bold">{property.title}</h1>
            
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-2">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <span>{property.rating} ({property.reviews} reviews)</span>
              </div>
            </div>
          </motion.div>

          {/* Address */}
          <motion.div variants={itemVariants} className="flex items-start gap-1 text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <p>{property.address.street}</p>
              <p>{property.address.barangay}</p>
              <p>{property.address.city}, {property.address.province}</p>
              <p>{property.address.postalCode}</p>
            </div>
          </motion.div>

          {/* Image Gallery */}
          <motion.div 
            variants={itemVariants}
            className="rounded-lg overflow-hidden shadow-lg"
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.3 }}
          >
            <img 
              src={property.image} 
              alt={property.title} 
              className="w-full h-96 object-cover"
            />
          </motion.div>

          {/* Price and Quick Facts */}
          <motion.div 
            variants={itemVariants}
            className="bg-gradient-to-r from-blue-500 to-green-500 p-6 rounded-lg shadow text-white"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">₱{property.price.toLocaleString()}/mo</h2>
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                For Rent
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {[
                { value: property.bedrooms, label: "Bedrooms" },
                { value: property.bathrooms, label: "Bathrooms" },
                { value: property.sqft, label: "Area (sqft)" },
                { value: property.type, label: "Type" }
              ].map((item, index) => (
                <div key={index} className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                  <div className="font-medium">{item.value}</div>
                  <div className="text-sm opacity-80">{item.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Description */}
          <motion.div 
            variants={itemVariants}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow"
          >
            <h2 className="text-xl font-semibold mb-4">Description</h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {property.description}
            </p>
          </motion.div>

          {/* Amenities */}
          <motion.div 
            variants={itemVariants}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow"
          >
            <h2 className="text-xl font-semibold mb-4">Amenities</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {property.amenities.map((amenity, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-green-500"></div>
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Lease Documents */}
          <motion.div 
            variants={itemVariants}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow"
          >
            <h2 className="text-xl font-semibold mb-4">Lease Documents</h2>
            <div className="space-y-3">
              <a 
                href={property.leaseDocuments.agreement} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-medium">Lease Agreement</h3>
                  <p className="text-sm text-gray-500">PDF Document</p>
                </div>
              </a>
              <a 
                href={property.leaseDocuments.conditionReport} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-medium">Condition Report</h3>
                  <p className="text-sm text-gray-500">PDF Document</p>
                </div>
              </a>
            </div>
          </motion.div>
        </div>

        {/* Contact and Application Form */}
        <div className="space-y-6">
          {/* Contact Information */}
          <motion.div 
            variants={itemVariants}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow"
          >
            <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full text-white">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">Property Manager</h3>
                  <p>{property.contact.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full text-white">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">Phone</h3>
                  <a 
                    href={`tel:${property.contact.phone.replace(/\D/g, '')}`} 
                    className="hover:underline text-blue-600 dark:text-blue-400"
                  >
                    {property.contact.phone}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full text-white">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">Email</h3>
                  <a 
                    href={`mailto:${property.contact.email}`} 
                    className="hover:underline text-blue-600 dark:text-blue-400"
                  >
                    {property.contact.email}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full text-white">
                  <Facebook className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">Facebook</h3>
                  <a 
                    href={`https://facebook.com/${property.contact.facebook}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:underline text-blue-600 dark:text-blue-400"
                  >
                    @{property.contact.facebook}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full text-white">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">Messenger</h3>
                  <a 
                    href={property.contact.messenger} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:underline text-blue-600 dark:text-blue-400"
                  >
                    Message directly
                  </a>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Application Form */}
          <motion.div 
            variants={itemVariants}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow"
          >
            <h2 className="text-xl font-semibold mb-4">Rental Application</h2>
            
            {isSubmitted ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center p-6"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">Application Submitted!</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Thank you for your application. The property manager will contact you shortly.
                </p>
                <Button 
                  onClick={() => {
                    setIsSubmitted(false);
                    setFormData({
                      fullName: '',
                      email: '',
                      phone: '',
                      moveInDate: '',
                      message: ''
                    });
                  }}
                  className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white"
                >
                  Submit Another Application
                </Button>
              </motion.div>
            ) : (
              <motion.form 
                onSubmit={handleSubmit} 
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium mb-1">
                    Full Name *
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 ${
                      errors.fullName ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">
                    Email *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 ${
                      errors.email ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-1">
                    Phone Number *
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 ${
                      errors.phone ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="moveInDate" className="block text-sm font-medium mb-1">
                    Desired Move-In Date *
                  </label>
                  <div className="relative">
                    <input
                      id="moveInDate"
                      name="moveInDate"
                      type="date"
                      value={formData.moveInDate}
                      onChange={handleChange}
                      className={`w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 pl-10 ${
                        errors.moveInDate ? 'border-red-500' : ''
                      }`}
                    />
                    <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                  {errors.moveInDate && (
                    <p className="text-red-500 text-sm mt-1">{errors.moveInDate}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-1">
                    Additional Information
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={3}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white"
                >
                  Submit Application
                </Button>
              </motion.form>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default PropertyDetails;