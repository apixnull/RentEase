import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaBed,
  FaUserFriends,
  FaMoneyBillWave,
  FaRegBuilding,
  FaCheck,
  FaTimes,
  FaMapMarkerAlt,
  FaTag,
  FaList,
  FaInfoCircle,
  FaChartPie
} from "react-icons/fa";

// Define TypeScript interfaces
interface Address {
  street: string;
  barangay: string;
  municipality: string;
  city: string;
  province: string;
  zipCode: string;
}

interface PropertyInfo {
  id: string;
  title: string;
  description: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  address: Address;
  amenityTags: string[];
  propertyFeatures: string[];
  leaseRules: string[];
  propertyImageUrls: string[];
  mainImageUrl: string;
  requiresScreening: boolean;
}

interface UnitStats {
  totalUnits: number;
  available: number;
  occupied: number;
  maintenance: number;
}

interface Unit {
  id: string;
  propertyId: string;
  label: string;
  description: string;
  status: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";
  floorNumber?: number;
  maxOccupancy: number;
  unitFeatureTags: string[];
  unitImageUrls: string[];
  targetPrice: number;
  isNegotiable: boolean;
  isListed: boolean;
}

interface PropertyDetailsData {
  propertyInfo: PropertyInfo;
  unitStats: UnitStats;
  units: Unit[];
}

// UnitCard props interface
interface UnitCardProps {
  unit: Unit;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

// Updated UnitCard Component with cleaner design
const UnitCard: React.FC<UnitCardProps> = ({
  unit,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}) => {
  const statusColors = {
    AVAILABLE: {
      bg: "bg-green-100",
      text: "text-green-800",
      label: "Available",
    },
    OCCUPIED: {
      bg: "bg-amber-100",
      text: "text-amber-800",
      label: "Occupied",
    },
    MAINTENANCE: {
      bg: "bg-rose-100",
      text: "text-rose-800",
      label: "Maintenance",
    },
  };

  const status = statusColors[unit.status] || {
    bg: "bg-gray-100",
    text: "text-gray-800",
    label: unit.status,
  };

  const listingStatus = unit.isListed 
    ? { bg: "bg-blue-100", text: "text-blue-800", label: "Listed" }
    : { bg: "bg-gray-100", text: "text-gray-800", label: "Unlisted" };

  return (
    <div className={`border rounded-xl overflow-hidden transition-all relative flex flex-col h-full ${
      isSelected ? "border-blue-500 ring-2 ring-blue-100" : "border-gray-200"
    }`}>
      {/* Selection checkbox */}
      <div className="absolute top-3 left-3 z-10">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(unit.id)}
          className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
        />
      </div>

      {/* Image section */}
      <div className="relative h-48">
        {Array.isArray(unit.unitImageUrls) && unit.unitImageUrls.length > 0 ? (
          <img
            src={unit.unitImageUrls[0]}
            alt={unit.label}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="bg-gray-100 w-full h-full flex items-center justify-center">
            <div className="text-center text-gray-400">
              <div className="text-4xl">🏠</div>
              <p className="text-xs mt-1">No image</p>
            </div>
          </div>
        )}
        
        <div className="absolute bottom-2 right-2 flex gap-1">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}
          >
            {status.label}
          </span>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${listingStatus.bg} ${listingStatus.text}`}
          >
            {listingStatus.label}
          </span>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-base font-semibold text-gray-800">{unit.label}</h3>
          <p className="font-bold text-blue-700">
            ₱{unit.targetPrice.toLocaleString()}
            <span className="text-xs font-normal text-gray-500">/mo</span>
          </p>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {unit.description || "No description provided"}
        </p>

        <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
          <div className="flex items-center text-gray-600">
            <FaBed className="text-gray-500 mr-1.5" size={12} />
            <span>Floor: </span>
            <span className="font-medium ml-1">
              {unit.floorNumber !== undefined ? unit.floorNumber : "N/A"}
            </span>
          </div>

          <div className="flex items-center text-gray-600">
            <FaUserFriends className="text-gray-500 mr-1.5" size={12} />
            <span>Max: </span>
            <span className="font-medium ml-1">{unit.maxOccupancy}</span>
          </div>

          <div className="flex items-center text-gray-600">
            <div className="mr-1.5 flex items-center justify-center w-4">
              {unit.isNegotiable ? (
                <FaCheck className="text-green-500" size={10} />
              ) : (
                <FaTimes className="text-rose-500" size={10} />
              )}
            </div>
            <span>Negotiable: </span>
            <span className="font-medium ml-1">
              {unit.isNegotiable ? "Yes" : "No"}
            </span>
          </div>
        </div>

        {Array.isArray(unit.unitFeatureTags) &&
          unit.unitFeatureTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-auto">
              {unit.unitFeatureTags.slice(0, 3).map((feature, index) => (
                <span
                  key={index}
                  className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full text-xs"
                >
                  {feature}
                </span>
              ))}
              {unit.unitFeatureTags.length > 3 && (
                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                  +{unit.unitFeatureTags.length - 3}
                </span>
              )}
            </div>
          )}

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => onEdit(unit.id)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-2 rounded-lg transition-colors flex items-center justify-center"
          >
            <FaEdit className="mr-1.5" size={12} /> Edit
          </button>
          <button
            onClick={() => onDelete(unit.id)}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium py-2 rounded-lg transition-colors flex items-center justify-center"
          >
            <FaTrash className="mr-1.5" size={12} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const PropertyDetails: React.FC = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [propertyData, setPropertyData] = useState<PropertyDetailsData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [unitsPerPage] = useState(6);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [allSelected, setAllSelected] = useState(false);

  // Get active tab from URL hash
  const initialTab = location.hash === "#units" ? "units" : "details";
  const [activeTab, setActiveTab] = useState<"details" | "units">(initialTab);

  useEffect(() => {
    // Update URL hash when tab changes
    window.location.hash = activeTab;
  }, [activeTab]);

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        const response = await axios.get<PropertyDetailsData>(
          `http://localhost:4000/api/landlord/property/${propertyId}/details`,
          { withCredentials: true }
        );
        setPropertyData(response.data);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || "An error occurred");
        setLoading(false);
      }
    };

    fetchPropertyDetails();
  }, [propertyId]);

  // Navigate through property images
  const nextImage = () => {
    if (!propertyData) return;
    const images = getImagesArray();
    if (images.length === 0) return;
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    if (!propertyData) return;
    const images = getImagesArray();
    if (images.length === 0) return;
    setCurrentImageIndex(
      (prev) => (prev - 1 + images.length) % images.length
    );
  };

  // Helper to get images array safely
  const getImagesArray = () => {
    if (!propertyData) return [];
    
    const { mainImageUrl, propertyImageUrls } = propertyData.propertyInfo;
    const safePropertyImageUrls = Array.isArray(propertyImageUrls) 
      ? propertyImageUrls 
      : [];
      
    return mainImageUrl 
      ? [mainImageUrl, ...safePropertyImageUrls]
      : safePropertyImageUrls;
  };

  // Handle property actions
  const handleEdit = () => {
    navigate(`/property/${propertyId}/edit`);
  };

  const handleDelete = () => {
    if (
      window.confirm(
        "Are you sure you want to delete this property? This action cannot be undone."
      )
    ) {
      console.log("Deleting property...");
      // Implement actual delete API call here
    }
  };

  const handleToggleListing = () => {
    console.log("Toggling listing status...");
    // Implement actual listing status toggle API call here
  };

  const handleAddUnit = () => {
    navigate(`/landlord/property/${propertyId}/add-unit`);
  };

  // Handle unit selection
  const handleUnitSelect = (unitId: string) => {
    setSelectedUnits((prev) =>
      prev.includes(unitId)
        ? prev.filter((id) => id !== unitId)
        : [...prev, unitId]
    );
  };

  // Handle select all
  const toggleSelectAll = () => {
    if (!propertyData) return;

    if (allSelected) {
      setSelectedUnits([]);
    } else {
      setSelectedUnits(propertyData.units.map((unit) => unit.id));
    }
    setAllSelected(!allSelected);
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (selectedUnits.length === 0) return;

    if (
      window.confirm(
        `Are you sure you want to delete ${selectedUnits.length} selected units?`
      )
    ) {
      console.log("Deleting units:", selectedUnits);
      // Implement actual bulk delete API call here
      setSelectedUnits([]);
      setAllSelected(false);
    }
  };

  // Handle edit unit
  const handleEditUnit = (unitId: string) => {
    navigate(`/property/${propertyId}/unit/${unitId}/edit`);
  };

  // Handle delete unit
  const handleDeleteUnit = (unitId: string) => {
    if (window.confirm("Are you sure you want to delete this unit?")) {
      console.log("Deleting unit:", unitId);
      // Implement actual delete API call here
    }
  };

  // Filter units based on search term
  const filteredUnits =
    propertyData?.units.filter(
      (unit) =>
        unit.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unit.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unit.status.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  // Pagination logic
  const indexOfLastUnit = currentPage * unitsPerPage;
  const indexOfFirstUnit = indexOfLastUnit - unitsPerPage;
  const currentUnits = filteredUnits.slice(indexOfFirstUnit, indexOfLastUnit);
  const totalPages = Math.ceil(filteredUnits.length / unitsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (loading)
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );

  if (error)
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
          role="alert"
        >
          <strong className="font-bold">Error! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
        >
          Try Again
        </button>
      </div>
    );

  if (!propertyData)
    return (
      <div className="max-w-7xl mx-auto p-6 text-center">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
          <strong className="font-bold">No Data Found</strong>
          <span className="block sm:inline">
            {" "}
            This property doesn't exist or you don't have permission to view it.
          </span>
        </div>
      </div>
    );

  const images = getImagesArray();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Property Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          {propertyData.propertyInfo.mainImageUrl && (
            <div className="hidden sm:block">
              <img
                src={propertyData.propertyInfo.mainImageUrl}
                alt="Main property"
                className="w-12 h-12 rounded-lg object-cover border-2 border-white shadow-sm"
              />
            </div>
          )}
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
              {propertyData.propertyInfo.title}
            </h1>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <FaMapMarkerAlt className="mr-1.5" size={12} />
              <span>
                {propertyData.propertyInfo.address.barangay}, 
                {propertyData.propertyInfo.address.city}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleEdit}
            className="flex items-center px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            <FaEdit className="mr-1.5" size={14} /> Edit
          </button>
          <button
            onClick={handleToggleListing}
            className={`flex items-center px-3 py-2 rounded-lg transition-colors text-sm ${
              propertyData.propertyInfo.requiresScreening
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            {propertyData.propertyInfo.requiresScreening
              ? "Listed"
              : "Unlisted"}
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center px-3 py-2 bg-rose-50 border border-rose-100 text-rose-700 rounded-lg hover:bg-rose-100 transition-colors text-sm"
          >
            <FaTrash className="mr-1.5" size={14} /> Delete
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`py-2.5 px-4 font-medium text-base border-b-2 ${
            activeTab === "details"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("details")}
        >
          <div className="flex items-center">
            <FaInfoCircle className="mr-2" size={14} /> Property Details
          </div>
        </button>
        <button
          className={`py-2.5 px-4 font-medium text-base border-b-2 ${
            activeTab === "units"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("units")}
        >
          <div className="flex items-center">
            <FaList className="mr-2" size={14} /> Manage Units
          </div>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "details" ? (
        <div className="flex flex-col gap-6">
          {/* Image Gallery */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="relative bg-gray-50 rounded-xl overflow-hidden">
              {images.length > 0 ? (
                <>
                  <div className="aspect-w-16 aspect-h-9">
                    <img
                      src={images[currentImageIndex]}
                      alt={`Property view ${currentImageIndex + 1}`}
                      className="w-full h-80 object-cover"
                    />
                  </div>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white text-gray-700 p-2.5 rounded-full shadow-md hover:bg-gray-100 transition-colors"
                  >
                    <FaChevronLeft size={16} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white text-gray-700 p-2.5 rounded-full shadow-md hover:bg-gray-100 transition-colors"
                  >
                    <FaChevronRight size={16} />
                  </button>
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                </>
              ) : (
                <div className="w-full h-80 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <div className="text-5xl mb-2">🏢</div>
                    <p>No property images available</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description and Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Description Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <FaInfoCircle className="mr-2 text-blue-500" /> Description
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                {propertyData.propertyInfo.description || "No description provided for this property."}
              </p>
            </div>

            {/* Address Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <FaMapMarkerAlt className="mr-2 text-blue-500" /> Address
              </h2>
              <div className="space-y-2 text-sm text-gray-600">
                <div>{propertyData.propertyInfo.address.street}</div>
                <div>{propertyData.propertyInfo.address.barangay}</div>
                {propertyData.propertyInfo.address.municipality && (
                  <div>{propertyData.propertyInfo.address.municipality}</div>
                )}
                <div>
                  {propertyData.propertyInfo.address.city}, 
                  {propertyData.propertyInfo.address.province}
                </div>
                <div>{propertyData.propertyInfo.address.zipCode}</div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Property Features */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <FaTag className="mr-2 text-blue-500" /> Property Features
              </h2>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(propertyData.propertyInfo.propertyFeatures) &&
                propertyData.propertyInfo.propertyFeatures.length > 0 ? (
                  propertyData.propertyInfo.propertyFeatures.map(
                    (feature, index) => (
                      <span
                        key={index}
                        className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm"
                      >
                        {feature}
                      </span>
                    )
                  )
                ) : (
                  <p className="text-gray-500 text-sm italic">No features listed</p>
                )}
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <FaTag className="mr-2 text-blue-500" /> Amenities
              </h2>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(propertyData.propertyInfo.amenityTags) &&
                propertyData.propertyInfo.amenityTags.length > 0 ? (
                  propertyData.propertyInfo.amenityTags.map(
                    (amenity, index) => (
                      <span
                        key={index}
                        className="bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-sm"
                      >
                        {amenity}
                      </span>
                    )
                  )
                ) : (
                  <p className="text-gray-500 text-sm italic">No amenities listed</p>
                )}
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FaChartPie className="mr-2 text-blue-500" /> Property Statistics
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col p-4 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm text-gray-700">Total Units</div>
                  <div className="bg-blue-100 p-2 rounded-full">
                    <FaRegBuilding className="text-blue-600" size={16} />
                  </div>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {propertyData.unitStats.totalUnits}
                </div>
              </div>

              <div className="flex flex-col p-4 bg-green-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm text-gray-700">Available</div>
                  <div className="bg-green-100 p-2 rounded-full">
                    <FaBed className="text-green-600" size={16} />
                  </div>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {propertyData.unitStats.available}
                </div>
              </div>

              <div className="flex flex-col p-4 bg-amber-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm text-gray-700">Occupied</div>
                  <div className="bg-amber-100 p-2 rounded-full">
                    <FaUserFriends className="text-amber-600" size={16} />
                  </div>
                </div>
                <div className="text-2xl font-bold text-amber-600">
                  {propertyData.unitStats.occupied}
                </div>
              </div>

              <div className="flex flex-col p-4 bg-rose-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm text-gray-700">Maintenance</div>
                  <div className="bg-rose-100 p-2 rounded-full">
                    <FaMoneyBillWave className="text-rose-600" size={16} />
                  </div>
                </div>
                <div className="text-2xl font-bold text-rose-600">
                  {propertyData.unitStats.maintenance}
                </div>
              </div>
            </div>
          </div>

          {/* Lease Rules */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FaList className="mr-2 text-blue-500" /> Lease Rules
            </h2>
            {Array.isArray(propertyData.propertyInfo.leaseRules) &&
            propertyData.propertyInfo.leaseRules.length > 0 ? (
              <div className="bg-gray-50 p-5 rounded-lg">
                <ul className="space-y-3">
                  {propertyData.propertyInfo.leaseRules.map((rule, index) => (
                    <li key={index} className="flex items-start">
                      <div className="bg-gray-200 rounded-full p-1 mr-3 mt-1">
                        <div className="w-1.5 h-1.5 bg-gray-700 rounded-full"></div>
                      </div>
                      <p className="text-gray-700 text-sm">{rule}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-gray-500 text-sm italic">No lease rules specified</p>
            )}
          </div>
        </div>
      ) : (
        /* Units Tab Content */
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Manage Property Units
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {propertyData.unitStats.totalUnits} units in this property
              </p>
            </div>
            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <input
                  type="text"
                  placeholder="Search units..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              <button
                onClick={handleAddUnit}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm whitespace-nowrap"
              >
                <FaPlus className="mr-1.5" size={12} /> Add Unit
              </button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedUnits.length > 0 && (
            <div className="flex items-center gap-4 mb-6 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <div className="text-sm text-blue-800">
                <span className="font-medium">
                  {selectedUnits.length} unit
                  {selectedUnits.length > 1 ? "s" : ""} selected
                </span>
              </div>
              <button
                onClick={handleBulkDelete}
                className="flex items-center px-3 py-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors text-sm"
              >
                <FaTrash className="mr-1.5" size={12} /> Delete Selected
              </button>
            </div>
          )}

          {filteredUnits.length === 0 ? (
            <div className="text-center py-12 border border-gray-200 rounded-lg bg-gray-50">
              <div className="text-5xl mb-4 text-gray-300">🏢</div>
              <h3 className="text-base font-semibold text-gray-700 mb-1">
                No units found
              </h3>
              <p className="text-gray-500 text-sm mb-5">
                {searchTerm
                  ? "No units match your search"
                  : "This property has no units yet"}
              </p>
              <button
                onClick={handleAddUnit}
                className="flex items-center mx-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
              >
                <FaPlus className="mr-1.5" size={12} /> Add Your First Unit
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  id="select-all"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="select-all" className="text-gray-700 text-sm">
                  Select all units
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {currentUnits.map((unit) => (
                  <UnitCard
                    key={unit.id}
                    unit={unit}
                    isSelected={selectedUnits.includes(unit.id)}
                    onSelect={handleUnitSelect}
                    onEdit={handleEditUnit}
                    onDelete={handleDeleteUnit}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <nav className="flex items-center gap-1">
                    <button
                      onClick={() => paginate(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className={`px-3 py-1.5 rounded ${
                        currentPage === 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <FaChevronLeft size={12} />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (number) => (
                        <button
                          key={number}
                          onClick={() => paginate(number)}
                          className={`px-3.5 py-1.5 rounded text-sm ${
                            currentPage === number
                              ? "bg-blue-600 text-white"
                              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {number}
                        </button>
                      )
                    )}

                    <button
                      onClick={() =>
                        paginate(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1.5 rounded ${
                        currentPage === totalPages
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <FaChevronRight size={12} />
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PropertyDetails;