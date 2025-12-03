import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { 
  Home, 
  MapPin, 
  DollarSign, 
  FileText, 
  Image as ImageIcon,
  Copy as CopyIcon,
  Building2,
  Landmark,
  School
} from "lucide-react";
import { Link } from "react-router-dom";

interface PropertyUnitSectionProps {
  unitProperty: any;
  landlordInfo?: any;
  loading?: boolean;
}

const PropertyUnitSection = ({ unitProperty, landlordInfo, loading = false }: PropertyUnitSectionProps) => {
  const allowedLeaseCategories = [
    "general",
    "visitor",
    "payment",
    "maintenance",
    "safety",
    "noise",
    "pet",
    "cleaning",
    "parking",
    "other",
  ];

  const allowedInstitutionTypes = [
    "Education",
    "Healthcare",
    "Commerce",
    "Government",
    "Finance",
    "Transport",
    "Leisure",
    "Religion",
  ];

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      // noop fallback
    }
  };
  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!unitProperty) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm border-slate-200">
        <CardContent className="pt-8 pb-8">
          <div className="text-center text-gray-500">
            No unit and property data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const unit = unitProperty;
  const property = unitProperty.property;
  const landlord = landlordInfo;

  return (
    <div className="space-y-6">
      {/* Landlord Information Card */}
      {landlord && (
        <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-emerald-600" />
              <CardTitle className="text-xl">Landlord Information</CardTitle>
            </div>
            <CardDescription>Property owner profile</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-6">
              {/* Avatar */}
              {landlord.avatarUrl ? (
                <div className="flex-shrink-0">
                  <img
                    src={landlord.avatarUrl}
                    alt={`${landlord.firstName || ''} ${landlord.lastName || ''}`}
                    className="h-16 w-16 rounded-full border-2 border-emerald-200 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://via.placeholder.com/64x64?text=No+Avatar";
                    }}
                  />
                </div>
              ) : (
                <div className="h-16 w-16 rounded-full border-2 border-emerald-200 bg-gray-100" />
              )}

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Full Name</label>
                  <p className="text-gray-900">{`${landlord.firstName || ''} ${landlord.lastName || ''}`.trim() || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
                  <p className="text-gray-900">{landlord.email || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <Link
                to={`/admin/users/${landlord.id}`}
                className="text-sm text-emerald-700 hover:text-emerald-800 underline underline-offset-2"
              >
                See landlord activity record
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Unit Information Card */}
      <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Home className="h-5 w-5 text-emerald-600" />
            <CardTitle className="text-xl">Unit Information</CardTitle>
          </div>
          <CardDescription>Details about the rental unit</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Unit Basic Info */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">Unit:</span>
              <span className="text-gray-900 font-medium">{unit.label || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-emerald-600" />
              <span className="text-gray-500">Target Price:</span>
              <span className="text-gray-900">₱{unit.targetPrice?.toLocaleString() || "N/A"}</span>
            </div>
          </div>

          {/* Unit Description */}
          {unit.description && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Description</label>
              <p className="text-gray-900 whitespace-pre-wrap">{unit.description}</p>
            </div>
          )}

          <Separator />

          {/* Unit Images */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ImageIcon className="h-5 w-5 text-emerald-600" />
              <label className="text-sm font-medium text-gray-700">Unit Images</label>
            </div>
            <div className="space-y-4">
              {/* Main Image (thumbnail + link with copy) */}
              {unit.mainImageUrl && (
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 block">Main Image</label>
                  <div className="flex items-center gap-3">
                    <div className="rounded-md overflow-hidden border border-gray-200 w-20 h-20">
                      <img
                        src={unit.mainImageUrl}
                        alt="Main unit image"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://via.placeholder.com/80?text=No+Image";
                        }}
                      />
                    </div>
                    <div className="flex-1 flex items-center gap-2">
                      <Input readOnly value={unit.mainImageUrl} className="h-8 text-xs" />
                      <Button type="button" variant="outline" className="h-8 px-2" onClick={() => copyToClipboard(unit.mainImageUrl)}>
                        <CopyIcon className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Other Images */}
              {unit.otherImages && unit.otherImages.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 block">Additional Images ({unit.otherImages.length})</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {unit.otherImages.map((imageUrl: string, index: number) => (
                      <div key={index} className="space-y-1">
                        <div className="rounded-md overflow-hidden border border-gray-200 w-20 h-20">
                          <img
                            src={imageUrl}
                            alt={`Unit image ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://via.placeholder.com/80?text=No+Image";
                            }}
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <Input readOnly value={imageUrl} className="h-8 text-[10px]" />
                          <Button type="button" variant="outline" className="h-8 px-2" onClick={() => copyToClipboard(imageUrl)}>
                            <CopyIcon className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Lease Rules (grouped by category) */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-5 w-5 text-emerald-600" />
              <label className="text-sm font-medium text-gray-700">Lease Rules</label>
            </div>
            {unit.unitLeaseRules && unit.unitLeaseRules.length > 0 ? (
              <div className="space-y-4">
                {allowedLeaseCategories
                  .map((cat) => ({
                    cat,
                    items: (unit.unitLeaseRules || []).filter((r: any) => (r?.category || "other") === cat),
                  }))
                  .filter(({ items }) => items.length > 0)
                  .map(({ cat, items }) => (
                    <div key={cat} className="space-y-2">
                      <div>
                        <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">{cat}</Badge>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {items.map((rule: any, idx: number) => (
                          <div key={idx} className="p-2 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-900">
                            {rule?.text}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No unit lease rules.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Property Information Card */}
      {property && (
        <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-emerald-600" />
              <CardTitle className="text-xl">Property Information</CardTitle>
            </div>
            <CardDescription>Details about the property</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Property Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Property Title</label>
                <p className="text-gray-900">{property.title || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Property Type</label>
                <Badge variant="outline" className="mt-1">
                  {property.type || "N/A"}
                </Badge>
              </div>
            </div>

            {/* Property Address - single line with copy for coordinates */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-emerald-600" />
                <label className="text-sm font-medium text-gray-700">Address</label>
              </div>
              <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="whitespace-nowrap">
                    {[
                      property.street,
                      property.barangay,
                      property.city?.name || property.municipality?.name,
                      property.zipCode
                    ].filter(Boolean).join(", ") || "N/A"}
                  </span>
                  {property.latitude != null && property.longitude != null && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span className="text-xs text-gray-700">Lat</span>
                      <div className="flex items-center gap-1">
                        <Input readOnly value={Number(property.latitude).toFixed(6)} className="h-7 w-24 text-xs font-mono" />
                        <Button type="button" variant="outline" className="h-7 px-2" onClick={() => copyToClipboard(String(property.latitude))}>
                          <CopyIcon className="h-3 w-3" />
                        </Button>
                      </div>
                      <span className="text-xs text-gray-700">Lng</span>
                      <div className="flex items-center gap-1">
                        <Input readOnly value={Number(property.longitude).toFixed(6)} className="h-7 w-24 text-xs font-mono" />
                        <Button type="button" variant="outline" className="h-7 px-2" onClick={() => copyToClipboard(String(property.longitude))}>
                          <CopyIcon className="h-3 w-3" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Property Main Image (thumbnail + link with copy) */}
            {property.mainImageUrl && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block">Property Main Image</label>
                <div className="flex items-center gap-3">
                  <div className="rounded-md overflow-hidden border border-gray-200 w-20 h-20">
                    <img
                      src={property.mainImageUrl}
                      alt="Property main image"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://via.placeholder.com/80?text=No+Image";
                      }}
                    />
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <Input readOnly value={property.mainImageUrl} className="h-8 text-xs" />
                    <Button type="button" variant="outline" className="h-8 px-2" onClick={() => copyToClipboard(property.mainImageUrl)}>
                      <CopyIcon className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <Separator />

            {/* Nearby Institutions - grouped by category as compact chips */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Landmark className="h-5 w-5 text-emerald-600" />
                <label className="text-sm font-medium text-gray-700">Nearby Institutions</label>
              </div>
              {property.nearInstitutions && property.nearInstitutions.length > 0 ? (
                <div className="space-y-3">
                  {allowedInstitutionTypes
                    .map((type) => ({ type, items: property.nearInstitutions.filter((i: any) => i?.type === type) }))
                    .filter(({ items }) => items.length > 0)
                    .map(({ type, items }) => (
                      <div key={type} className="space-y-1">
                        <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">{type}</Badge>
                        <div className="flex flex-wrap gap-2">
                          {items.map((institution: any, index: number) => (
                            <div key={index} className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-gray-200 bg-gray-50 text-xs">
                              {type === "Education" ? (
                                <School className="h-3 w-3 text-blue-600" />
                              ) : (
                                <Landmark className="h-3 w-3 text-purple-600" />
                              )}
                              <span className="text-gray-900 whitespace-nowrap">{institution.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No nearby institutions.</p>
              )}
            </div>

            {/* Other Information */}
            {property.otherInformation && property.otherInformation.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-4 block">Additional Information</label>
                <div className="space-y-3">
                  {property.otherInformation.map((info: any, index: number) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      {info.context && (
                        <p className="text-sm font-medium text-gray-900 mb-1">{info.context}</p>
                      )}
                      {info.description && (
                        <p className="text-sm text-gray-700">{info.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PropertyUnitSection;
