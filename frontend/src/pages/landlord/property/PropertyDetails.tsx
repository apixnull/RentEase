import { useState, useEffect } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronLeft, Trash2, List, X, DollarSign, ArrowUp, ArrowDown, Home, FileText, MapPin, Tag } from "react-feather";
import { Pencil, Wrench } from "lucide-react";

const PropertyDetails = () => {
  const { property } = useLoaderData() as { property: any };
  const navigate = useNavigate();
  
  // State for active tab
  const [activeTab, setActiveTab] = useState("overview");
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState<Record<string, number>>({
    units: 1,
    maintenance: 1,
    applications: 1,
    income: 1,
    expense: 1
  });
  
  // Items per page
  const itemsPerPage = 5;
  
  // State for unit photo carousel
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<Record<string, number>>({});
  
  // Initialize photo indices for all units
  useEffect(() => {
    const initialIndices: Record<string, number> = {};
    property.Unit?.forEach((unit: any) => {
      initialIndices[unit.id] = 0;
    });
    setCurrentPhotoIndex(initialIndices);
  }, [property]);
  
  // Set active tab from URL hash on load
  useEffect(() => {
    const hash = window.location.hash.substring(1);
    if (hash && ["overview", "units", "maintenance", "financials", "applications", "location", "tags"].includes(hash)) {
      setActiveTab(hash);
    }
  }, []);

  // Helper function to format prices
  const formatPrice = (price: number | [number, number] | null, type: 'unit' | 'head') => {
    if (!price) return "N/A";
    
    if (Array.isArray(price)) {
      return `₱${price[0].toLocaleString()} - ₱${price[1].toLocaleString()}/${type}`;
    }
    
    return `₱${price.toLocaleString()}/${type}`;
  };

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "AVAILABLE": return "secondary";
      case "OCCUPIED": return "secondary";
      case "MAINTENANCE": return "destructive";
      case "OPEN": return "default";
      case "IN_PROGRESS": return "secondary";
      case "COMPLETED": return "default";
      case "PENDING": return "secondary";
      case "APPROVED": return "default";
      case "REJECTED": return "destructive";
      default: return "outline";
    }
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    window.location.hash = value;
  };

  // Handle unit photo navigation
  const handlePhotoChange = (unitId: string, direction: "next" | "prev") => {
    setCurrentPhotoIndex(prev => {
      const currentIndex = prev[unitId] || 0;
      const unitPhotos = property.Unit?.find((u: any) => u.id === unitId)?.UnitPhoto || [];
      const maxIndex = unitPhotos.length - 1;
      
      let newIndex;
      if (direction === "next") {
        newIndex = currentIndex === maxIndex ? 0 : currentIndex + 1;
      } else {
        newIndex = currentIndex === 0 ? maxIndex : currentIndex - 1;
      }
      
      return { ...prev, [unitId]: newIndex };
    });
  };

  // Calculate paginated data
  const getPaginatedData = (data: any[], key: string) => {
    const page = currentPage[key] || 1;
    const startIndex = (page - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
  };

  // Calculate total pages
  const getTotalPages = (data: any[]) => {
    return Math.ceil(data.length / itemsPerPage);
  };

  // Handle page change
  const handlePageChange = (key: string, page: number) => {
    setCurrentPage(prev => ({ ...prev, [key]: page }));
  };

  // Calculate financial summaries
  const totalIncome = property.Income?.reduce((sum: number, income: any) => sum + income.amount, 0) || 0;
  const totalExpense = property.Expense?.reduce((sum: number, expense: any) => sum + expense.amount, 0) || 0;
  const netProfit = totalIncome - totalExpense;

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        
        <div className="text-center">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">{property.title}</h1>
          <p className="text-sm text-muted-foreground">
            {property.street}, {property.city}, {property.province}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex items-center">
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button variant="outline" size="sm" className="flex items-center">
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
          <Button variant={property.isListed ? "secondary" : "default"} size="sm" className="flex items-center">
            <List className="h-4 w-4 mr-1" />
            {property.isListed ? "Unlist" : "List"}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="flex overflow-x-auto pb-2">
          <TabsTrigger value="overview" className="flex items-center">
            <Home className="h-4 w-4 mr-1" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="units" className="flex items-center">
            <Home className="h-4 w-4 mr-1" />
            Units ({property.unitCount})
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="flex items-center">
            <Wrench className="h-4 w-4 mr-1" />
            Maintenance
          </TabsTrigger>
          <TabsTrigger value="financials" className="flex items-center">
            <DollarSign className="h-4 w-4 mr-1" />
            Financials
          </TabsTrigger>
          <TabsTrigger value="applications" className="flex items-center">
            <FileText className="h-4 w-4 mr-1" />
            Applications
          </TabsTrigger>
          <TabsTrigger value="location" className="flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            Location
          </TabsTrigger>
          <TabsTrigger value="tags" className="flex items-center">
            <Tag className="h-4 w-4 mr-1" />
            Tags
          </TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Units</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Units</span>
                    <span className="font-medium">{property.unitCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center text-muted-foreground">
                      <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                      Available
                    </span>
                    <span className="font-medium">{property.unitStatusCount?.AVAILABLE || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center text-muted-foreground">
                      <span className="w-3 h-3 bg-gray-500 rounded-full mr-2"></span>
                      Occupied
                    </span>
                    <span className="font-medium">{property.unitStatusCount?.OCCUPIED || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center text-muted-foreground">
                      <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                      Maintenance
                    </span>
                    <span className="font-medium">{property.unitStatusCount?.MAINTENANCE || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pricing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Per Unit</h3>
                    <p className="font-medium">
                      {formatPrice(property.priceRangePerUnit, 'unit')}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Per Head</h3>
                    <p className="font-medium">
                      {formatPrice(property.priceRangePerHead, 'head')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Property Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                    <p className="font-medium">{property.description || "No description"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
                    <div className="flex gap-2">
                      <Badge variant={property.isListed ? "default" : "secondary"}>
                        {property.isListed ? "Listed" : "Unlisted"}
                      </Badge>
                      {property.requiresScreening && (
                        <Badge variant="secondary">
                          Screening Required
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Property Photos */}
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Property Photos</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {property.PropertyPhoto?.length > 0 ? (
                property.PropertyPhoto?.map((photo: any) => (
                  <div key={photo.id} className="rounded-xl overflow-hidden aspect-video">
                    <img
                      src={photo.url}
                      alt="Property"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))
              ) : (
                <div className="col-span-3 flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
                  <X className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">No photos available</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* UNITS TAB */}
        <TabsContent value="units">
          <div className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getPaginatedData(property.Unit || [], "units").map((unit: any) => {
                const photos = unit.UnitPhoto || [];
                const currentIndex = currentPhotoIndex[unit.id] || 0;
                const currentPhoto = photos[currentIndex];
                
                return (
                  <Card key={unit.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{unit.label}</CardTitle>
                        <Badge variant={getStatusVariant(unit.status)}>
                          {unit.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                          {unit.description || "No description provided"}
                        </p>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <h3 className="text-xs font-medium text-muted-foreground">Max Occupancy</h3>
                            <p className="font-medium">{unit.maxOccupancy} people</p>
                          </div>
                          <div>
                            <h3 className="text-xs font-medium text-muted-foreground">Pricing</h3>
                            <p className="font-medium">
                              {unit.chargePerHead 
                                ? `₱${unit.pricePerHead?.toLocaleString()}/head`
                                : `₱${unit.pricePerUnit?.toLocaleString()}/unit`}
                            </p>
                          </div>
                          <div>
                            <h3 className="text-xs font-medium text-muted-foreground">Negotiable</h3>
                            <p className="font-medium">{unit.isNegotiable ? "Yes" : "No"}</p>
                          </div>
                        </div>
                        
                        {photos.length > 0 ? (
                          <div className="relative mt-4">
                            <div className="aspect-video rounded-md overflow-hidden bg-gray-100">
                              <img
                                src={currentPhoto.url}
                                alt="Unit"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            
                            {/* Photo navigation buttons */}
                            <div className="absolute top-1/2 left-0 right-0 flex justify-between px-2 transform -translate-y-1/2">
                              <Button 
                                variant="secondary" 
                                size="icon" 
                                className="rounded-full"
                                onClick={() => handlePhotoChange(unit.id, "prev")}
                              >
                                <ChevronLeft className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="secondary" 
                                size="icon" 
                                className="rounded-full"
                                onClick={() => handlePhotoChange(unit.id, "next")}
                              >
                                <ChevronLeft className="h-4 w-4 rotate-180" />
                              </Button>
                            </div>
                            
                            {/* Photo counter */}
                            <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                              {currentIndex + 1} / {photos.length}
                            </div>
                          </div>
                        ) : (
                          <div className="mt-4 aspect-video flex items-center justify-center bg-gray-100 rounded-md">
                            <p className="text-gray-500">No photos available</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            
            {/* Unit Pagination */}
            {getTotalPages(property.Unit || []) > 1 && (
              <div className="mt-6 flex justify-center items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage.units === 1}
                  onClick={() => handlePageChange("units", currentPage.units - 1)}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {currentPage.units} of {getTotalPages(property.Unit || [])}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage.units === getTotalPages(property.Unit || [])}
                  onClick={() => handlePageChange("units", currentPage.units + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* MAINTENANCE TAB */}
        <TabsContent value="maintenance">
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Maintenance Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getPaginatedData(property.MaintenanceRequest || [], "maintenance").map((request: any) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          {new Date(request.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {request.unitId ? 
                            property.Unit?.find((u: any) => u.id === request.unitId)?.label || "N/A" : 
                            "Property"}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {request.description}
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            request.priority === "HIGH" ? "destructive" : 
                            request.priority === "MEDIUM" ? "secondary" : "default"
                          }>
                            {request.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(request.status)}>
                            {request.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {/* Maintenance Pagination */}
                {getTotalPages(property.MaintenanceRequest || []) > 1 && (
                  <div className="mt-6 flex justify-center items-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage.maintenance === 1}
                      onClick={() => handlePageChange("maintenance", currentPage.maintenance - 1)}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage.maintenance} of {getTotalPages(property.MaintenanceRequest || [])}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage.maintenance === getTotalPages(property.MaintenanceRequest || [])}
                      onClick={() => handlePageChange("maintenance", currentPage.maintenance + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* FINANCIALS TAB */}
        <TabsContent value="financials">
          <div className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Income</CardTitle>
                  <div className="bg-green-100 p-2 rounded-full">
                    <ArrowUp className="h-5 w-5 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₱{totalIncome.toLocaleString()}</div>
                  <p className="text-sm text-muted-foreground mt-1">Total income from this property</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Expenses</CardTitle>
                  <div className="bg-red-100 p-2 rounded-full">
                    <ArrowDown className="h-5 w-5 text-red-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₱{totalExpense.toLocaleString()}</div>
                  <p className="text-sm text-muted-foreground mt-1">Total expenses for this property</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Net Profit</CardTitle>
                  <div className="bg-blue-100 p-2 rounded-full">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ₱{Math.abs(netProfit).toLocaleString()} {netProfit >= 0 ? 'Profit' : 'Loss'}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Total net profit from this property</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Income Table */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Income Records</CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handlePageChange("income", currentPage.income + 1)}
                      disabled={currentPage.income === getTotalPages(property.Income || [])}
                    >
                      View More
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getPaginatedData(property.Income || [], "income").map((income: any) => (
                        <TableRow key={income.id}>
                          <TableCell>
                            {new Date(income.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{income.description}</TableCell>
                          <TableCell className="text-right text-green-600">
                            ₱{income.amount.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              
              {/* Expense Table */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Expense Records</CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handlePageChange("expense", currentPage.expense + 1)}
                      disabled={currentPage.expense === getTotalPages(property.Expense || [])}
                    >
                      View More
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getPaginatedData(property.Expense || [], "expense").map((expense: any) => (
                        <TableRow key={expense.id}>
                          <TableCell>
                            {new Date(expense.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{expense.description}</TableCell>
                          <TableCell className="text-right text-red-600">
                            ₱{expense.amount.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* APPLICATIONS TAB */}
        <TabsContent value="applications">
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Rental Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Applied At</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getPaginatedData(property.Application || [], "applications").map((app: any) => (
                      <TableRow key={app.id}>
                        <TableCell>{app.applicant?.name || "Unknown"}</TableCell>
                        <TableCell>
                          {property.Unit?.find((u: any) => u.id === app.unitId)?.label || "N/A"}
                        </TableCell>
                        <TableCell>
                          {new Date(app.appliedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(app.status)}>
                            {app.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {/* Applications Pagination */}
                {getTotalPages(property.Application || []) > 1 && (
                  <div className="mt-6 flex justify-center items-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage.applications === 1}
                      onClick={() => handlePageChange("applications", currentPage.applications - 1)}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage.applications} of {getTotalPages(property.Application || [])}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage.applications === getTotalPages(property.Application || [])}
                      onClick={() => handlePageChange("applications", currentPage.applications + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* LOCATION TAB */}
        <TabsContent value="location">
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Location Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-1">
                <div className="flex items-start mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 mt-0.5 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <div>
                    <p className="font-medium">{property.street}</p>
                    <p className="text-muted-foreground">
                      {property.barangay}, {property.city}, {property.province} {property.zipCode}
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 bg-gray-100 rounded-lg h-96 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-gray-500 mb-4">Map Placeholder</p>
                    <Button variant="outline">
                      View on Google Maps
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAGS TAB */}
        <TabsContent value="tags">
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Property Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {property.tags?.length > 0 ? (
                    property.tags.map((tag: any) => (
                      <Badge key={tag.id} variant="outline" className="px-3 py-1">
                        {tag.tag.name}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No tags added to this property</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PropertyDetails; 