import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, Home, ChevronLeft, Image as ImageIcon } from "lucide-react";

interface Unit {
  id: string;
  label: string;
  description: string;
  status: string;
  floorNumber: number | null;
  maxOccupancy: number;
  targetPrice: number;
  isNegotiable: boolean;
  unitFeatureTags: string[];
  unitImageUrls: string[];
  leaseRules: string[];
  createdAt: string;
  updatedAt: string;
}

const ManageUnit = () => {
  const { propertyId, unitId } = useParams<{ propertyId: string; unitId: string }>();
  const navigate = useNavigate();
  const [unit, setUnit] = useState<Unit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUnit = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `http://localhost:4000/api/landlord/property/${propertyId}/unit/${unitId}`,
          { withCredentials: true }
        );
        const u = res.data.unit;
        setUnit({
          ...u,
          unitFeatureTags: u.unitFeatureTags || [],
          unitImageUrls: u.unitImageUrls || [],
          leaseRules: u.leaseRules || [],
        });
        setError(null);
      } catch (err) {
        setError("Failed to load unit details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchUnit();
  }, [propertyId, unitId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-32 mb-4" />
        <Skeleton className="h-48 w-full mb-6" />
        <Skeleton className="h-6 w-1/2 mb-2" />
        <Skeleton className="h-4 w-1/3 mb-2" />
        <Skeleton className="h-4 w-1/4 mb-2" />
      </div>
    );
  }

  if (error || !unit) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-red-50 text-red-700 p-6 rounded-lg inline-flex flex-col items-center max-w-md mx-auto">
          <Home size={48} className="mb-4" />
          <h2 className="text-xl font-bold mb-2">Unable to Load Unit</h2>
          <p className="mb-4">{error || "Unit details could not be found."}</p>
          <Button 
            variant="outline"
            onClick={() => navigate(-1)}
            className="border-gray-300"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Home size={22} className="text-blue-600" />
          Manage Unit: <span className="ml-2">{unit.label}</span>
        </h1>
      </div>

      {/* Main Actions */}
      <div className="flex flex-wrap justify-end gap-3 mb-8">
        <Button
          variant="secondary"
          onClick={() => alert('Edit unit (not implemented)')}
          className="flex items-center gap-2"
        >
          <Edit size={16} /> Edit
        </Button>
        <Button
          variant="destructive"
          onClick={() => alert('Delete unit (not implemented)')}
          className="flex items-center gap-2"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m5 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /></svg>
          Delete
        </Button>
        <Button
          variant={unit.status === 'AVAILABLE' ? 'outline' : 'secondary'}
          onClick={() => alert('Toggle listing (not implemented)')}
          className="flex items-center gap-2"
        >
          {unit.status === 'AVAILABLE' ? (
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          ) : (
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye-off"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.81 21.81 0 0 1 5.06-7.94"/><path d="M1 1l22 22"/><path d="M9.53 9.53A3 3 0 0 0 12 15a3 3 0 0 0 2.47-5.47"/></svg>
          )}
          {unit.status === 'AVAILABLE' ? 'Unlist' : 'List'}
        </Button>
        <Button
          variant="default"
          onClick={() => navigate(`/landlord/property/${propertyId}/unit/${unitId}/lease/add`)}
          className="flex items-center gap-2"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-plus"><path d="M14 2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
          Create Lease
        </Button>
      </div>

      {/* Images */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="flex items-center gap-2">
            <ImageIcon size={18} className="text-gray-600" />
            Unit Images
          </CardTitle>
        </CardHeader>
        <CardContent>
          {unit.unitImageUrls.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto">
              {unit.unitImageUrls.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt={`Unit image ${idx + 1}`}
                  className="h-32 w-48 object-cover rounded-md border"
                />
              ))}
            </div>
          ) : (
            <div className="text-gray-500 py-6 text-center">No images available</div>
          )}
        </CardContent>
      </Card>

      {/* Basic Info */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-500 mb-1">Label</div>
              <div className="font-medium text-gray-900">{unit.label}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Status</div>
              <div className="font-medium text-gray-900">{unit.status}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Floor Number</div>
              <div className="font-medium text-gray-900">{unit.floorNumber ?? 'N/A'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Max Occupancy</div>
              <div className="font-medium text-gray-900">{unit.maxOccupancy}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Target Price</div>
              <div className="font-medium text-gray-900">₱{unit.targetPrice.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Negotiable</div>
              <div className="font-medium text-gray-900">{unit.isNegotiable ? 'Yes' : 'No'}</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-xs text-gray-500 mb-1">Description</div>
            <div className="text-gray-800">{unit.description || 'No description provided.'}</div>
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Features</CardTitle>
          
        </CardHeader>
        <CardContent>
          {unit.unitFeatureTags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {unit.unitFeatureTags.map((feature, idx) => (
                <span key={idx} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">
                  {feature.replace(/^\d+\.\s*/, "")}
                </span>
              ))}
            </div>
          ) : (
            <div className="text-gray-500">No features listed.</div>
          )}
        </CardContent>
      </Card>

      {/* Lease Rules */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Lease Rules</CardTitle>
        </CardHeader>
        <CardContent>
          {unit.leaseRules.length > 0 ? (
            <ul className="list-disc ml-5 text-gray-800">
              {unit.leaseRules.map((rule, idx) => (
                <li key={idx}>{rule.replace(/^\d+\.\s*/, "")}</li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-500">No lease rules specified.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageUnit; 