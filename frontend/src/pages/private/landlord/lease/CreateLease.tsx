import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Save, FileText, User, Home, Calendar, DollarSign, Shield, Upload, Link, Search, Building, MapPin } from 'lucide-react';

interface Property {
  id: string;
  title: string;
  type: string;
  street: string;
  barangay: string;
}

interface Unit {
  id: string;
  label: string;
  propertyId: string;
  targetPrice: number;
  status: string;
}

interface Tenant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  interactionCount: number;
}

const CreateLease = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  // Mock data
  const properties: Property[] = [
    { id: '1', title: 'Sunset Apartments', type: 'APARTMENT', street: '123 Sunset Blvd', barangay: 'Barangay 1' },
    { id: '2', title: 'River View Complex', type: 'CONDOMINIUM', street: '456 River St', barangay: 'Barangay 2' },
    { id: '3', title: 'Downtown Towers', type: 'CONDOMINIUM', street: '789 Downtown Ave', barangay: 'Barangay 3' }
  ];

  const units: Unit[] = [
    { id: '1', label: 'A101', propertyId: '1', targetPrice: 1500, status: 'AVAILABLE' },
    { id: '2', label: 'A102', propertyId: '1', targetPrice: 1400, status: 'AVAILABLE' },
    { id: '3', label: 'B201', propertyId: '2', targetPrice: 1800, status: 'AVAILABLE' },
    { id: '4', label: 'C301', propertyId: '3', targetPrice: 2200, status: 'AVAILABLE' }
  ];

  const tenants: Tenant[] = [
    { id: '1', firstName: 'John', lastName: 'Doe', email: 'john.doe@email.com', phoneNumber: '+1234567890', interactionCount: 15 },
    { id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@email.com', phoneNumber: '+1234567891', interactionCount: 8 },
    { id: '3', firstName: 'Mike', lastName: 'Johnson', email: 'mike.johnson@email.com', phoneNumber: '+1234567892', interactionCount: 3 },
    { id: '4', firstName: 'Sarah', lastName: 'Wilson', email: 'sarah.wilson@email.com', phoneNumber: '+1234567893', interactionCount: 12 },
    { id: '5', firstName: 'David', lastName: 'Brown', email: 'david.brown@email.com', phoneNumber: '+1234567894', interactionCount: 6 }
  ];

  // Form state
  const [formData, setFormData] = useState({
    // Step 1: Property & Unit & Tenant
    propertyId: '',
    unitId: '',
    tenantId: '',
    leaseNickname: '',
    leaseType: 'STANDARD' as 'STANDARD' | 'SHORT_TERM' | 'LONG_TERM' | 'FIXED_TERM',
    
    // Step 2: Dates & Financial
    startDate: '',
    endDate: '',
    rentAmount: '',
    securityDeposit: '',
    advanceMonths: '0',
    interval: 'MONTHLY' as 'DAILY' | 'WEEKLY' | 'MONTHLY',
    dueDate: '1',
    
    // Step 3: Documents
    leaseDocumentUrl: '',
    leaseDocumentFile: null as File | null,
    documentOption: 'link' as 'link' | 'upload',
    landlordSignatureUrl: '',
    tenantSignatureUrl: ''
  });

  const [filteredUnits, setFilteredUnits] = useState<Unit[]>([]);
  const [suggestedTenants, setSuggestedTenants] = useState<Tenant[]>([]);
  const [leaseDurationError, setLeaseDurationError] = useState('');

  // Filter units based on selected property
  useEffect(() => {
    if (formData.propertyId) {
      const unitsForProperty = units.filter(unit => unit.propertyId === formData.propertyId);
      setFilteredUnits(unitsForProperty);
    } else {
      setFilteredUnits([]);
    }
  }, [formData.propertyId]);

  // Filter and sort tenants based on search and interaction frequency
  useEffect(() => {
    let filtered = tenants;
    
    if (searchTerm) {
      filtered = tenants.filter(tenant =>
        tenant.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tenant.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tenant.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    filtered.sort((a, b) => b.interactionCount - a.interactionCount);
    setSuggestedTenants(filtered);
  }, [searchTerm]);

  // Auto-generate lease nickname when property, unit, or tenant changes
  useEffect(() => {
    const property = properties.find(p => p.id === formData.propertyId);
    const unit = units.find(u => u.id === formData.unitId);
    const tenant = tenants.find(t => t.id === formData.tenantId);

    if (property && unit && tenant) {
      const nickname = `${tenant.firstName} ${tenant.lastName} - ${property.title} ${unit.label}`;
      setFormData(prev => ({ ...prev, leaseNickname: nickname }));
    }
  }, [formData.propertyId, formData.unitId, formData.tenantId]);

  // Validate lease duration based on lease type
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const durationMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      
      let error = '';
      
      switch (formData.leaseType) {
        case 'SHORT_TERM':
          if (durationMonths > 6) {
            error = 'Short term lease cannot exceed 6 months';
          } else if (durationMonths < 1) {
            error = 'Lease must be at least 1 month';
          }
          break;
        case 'STANDARD':
          if (durationMonths < 11 || durationMonths > 13) {
            error = 'Standard lease should be 12 months (±1 month)';
          }
          break;
        case 'LONG_TERM':
          if (durationMonths < 13) {
            error = 'Long term lease must be at least 13 months';
          }
          break;
        case 'FIXED_TERM':
          if (durationMonths < 1) {
            error = 'Lease must be at least 1 month';
          }
          break;
      }
      
      setLeaseDurationError(error);
    } else {
      setLeaseDurationError('');
    }
  }, [formData.startDate, formData.endDate, formData.leaseType]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, leaseDocumentFile: file }));
    }
  };

  const handleTenantSelect = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setFormData(prev => ({ ...prev, tenantId: tenant.id }));
    setSearchTerm(`${tenant.firstName} ${tenant.lastName}`);
  };

  const clearTenantSelection = () => {
    setSelectedTenant(null);
    setFormData(prev => ({ ...prev, tenantId: '' }));
    setSearchTerm('');
  };

  const nextStep = () => {
    if (currentStep < 3 && isStepValid()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only submit if we're on the last step
    if (currentStep !== 3) {
      nextStep();
      return;
    }

    if (!isStepValid()) {
      alert('Please complete all required fields correctly');
      return;
    }

    setLoading(true);

    try {
      // Submit lease creation logic here
      console.log('Creating lease with data:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Lease created successfully!');
      navigate('/leases');
    } catch (error) {
      console.error('Failed to create lease:', error);
      alert('Failed to create lease. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getSelectedProperty = () => properties.find(p => p.id === formData.propertyId);
  const getSelectedUnit = () => units.find(u => u.id === formData.unitId);
  const getSelectedTenant = () => tenants.find(t => t.id === formData.tenantId);

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.propertyId && formData.unitId && formData.tenantId && formData.leaseNickname.trim();
      case 2:
        return formData.startDate && formData.endDate && !leaseDurationError && formData.rentAmount;
      case 3:
        return true; // Documents are optional
      default:
        return false;
    }
  };

  const getProgressPercentage = () => {
    return (currentStep / 3) * 100;
  };

  const steps = [
    { number: 1, title: 'Basic Info', description: 'Property, unit, and tenant details', icon: Building },
    { number: 2, title: 'Terms & Financial', description: 'Lease duration and payment details', icon: DollarSign },
    { number: 3, title: 'Documents', description: 'Upload agreements and signatures', icon: FileText }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
          Create New Lease
        </h1>
        <p className="text-gray-600 mt-2">Set up a rental agreement in 3 simple steps</p>
      </div>

      {/* Progress Bar */}
      <Card className="mb-8 shadow-lg border-0">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-semibold text-gray-800 text-lg">Step {currentStep} of 3</h3>
              <p className="text-gray-600">{steps[currentStep - 1]?.description}</p>
            </div>
            <Badge variant="secondary" className="text-sm px-3 py-1 bg-blue-100 text-blue-700">
              {getProgressPercentage().toFixed(0)}% Complete
            </Badge>
          </div>
          <Progress value={getProgressPercentage()} className="h-3 bg-gray-200" />
          
          {/* Step Indicators */}
          <div className="flex justify-between mt-8">
            {steps.map((step) => {
              const IconComponent = step.icon;
              return (
                <div key={step.number} className="flex flex-col items-center text-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-all ${
                      step.number === currentStep
                        ? 'bg-blue-600 text-white border-blue-600 scale-110'
                        : step.number < currentStep
                        ? 'bg-green-500 text-white border-green-500'
                        : 'bg-white text-gray-400 border-gray-300'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="mt-3">
                    <p className={`text-sm font-medium ${
                      step.number === currentStep ? 'text-blue-600' : step.number < currentStep ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                  <div className="w-full h-1 bg-gray-200 mt-3 relative">
                    {step.number < 3 && (
                      <div
                        className={`absolute top-0 left-0 h-full transition-all ${
                          step.number < currentStep ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                        style={{ width: step.number < currentStep ? '100%' : '0%' }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Form - 3/4 width */}
          <div className="lg:col-span-3">
            <Card className="shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                <CardTitle className="flex items-center gap-3 text-xl text-gray-800">
                  <div className={`p-2 rounded-lg ${
                    currentStep === 1 ? 'bg-blue-100 text-blue-600' :
                    currentStep === 2 ? 'bg-green-100 text-green-600' :
                    'bg-purple-100 text-purple-600'
                  }`}>
                    {currentStep === 1 && <Building className="w-5 h-5" />}
                    {currentStep === 2 && <DollarSign className="w-5 h-5" />}
                    {currentStep === 3 && <FileText className="w-5 h-5" />}
                  </div>
                  <div>
                    <div>{steps[currentStep - 1]?.title}</div>
                    <CardDescription className="text-gray-600 mt-1">
                      {steps[currentStep - 1]?.description}
                    </CardDescription>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                {/* Step 1: Basic Info */}
                {currentStep === 1 && (
                  <div className="space-y-8">
                    {/* Property & Unit Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <Label htmlFor="propertyId" className="text-sm font-medium flex items-center gap-2">
                          <Home className="w-4 h-4 text-blue-600" />
                          Property <span className="text-red-500">*</span>
                        </Label>
                        <Select value={formData.propertyId} onValueChange={(value) => handleInputChange('propertyId', value)}>
                          <SelectTrigger className="h-12 text-base">
                            <SelectValue placeholder="Select property" />
                          </SelectTrigger>
                          <SelectContent>
                            {properties.map((property) => (
                              <SelectItem key={property.id} value={property.id}>
                                <div className="flex items-center gap-3">
                                  <Building className="w-4 h-4 text-gray-400" />
                                  <div>
                                    <div className="font-medium">{property.title}</div>
                                    <div className="text-xs text-gray-500">
                                      {property.street}, {property.barangay}
                                    </div>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-4">
                        <Label htmlFor="unitId" className="text-sm font-medium flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-green-600" />
                          Unit <span className="text-red-500">*</span>
                        </Label>
                        <Select 
                          value={formData.unitId} 
                          onValueChange={(value) => handleInputChange('unitId', value)}
                          disabled={!formData.propertyId}
                        >
                          <SelectTrigger className="h-12 text-base">
                            <SelectValue placeholder={formData.propertyId ? "Select unit" : "Select property first"} />
                          </SelectTrigger>
                          <SelectContent>
                            {filteredUnits.map((unit) => (
                              <SelectItem key={unit.id} value={unit.id}>
                                <div className="flex items-center gap-3">
                                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                    <span className="text-xs font-medium text-green-600">#</span>
                                  </div>
                                  <div>
                                    <div className="font-medium">{unit.label}</div>
                                    <div className="text-xs text-gray-500">
                                      ${unit.targetPrice}/month • {unit.status}
                                    </div>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Tenant Search Section */}
                    <div className="space-y-4">
                      <Label htmlFor="tenantSearch" className="text-sm font-medium flex items-center gap-2">
                        <User className="w-4 h-4 text-purple-600" />
                        Search Tenant <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Search tenant by name or email..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-12 h-12 text-base"
                          disabled={!!selectedTenant}
                        />
                        {selectedTenant && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={clearTenantSelection}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                          >
                            ×
                          </Button>
                        )}
                      </div>
                      
                      {selectedTenant && (
                        <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-green-600" />
                              </div>
                              <div>
                                <div className="font-medium text-sm">
                                  {selectedTenant.firstName} {selectedTenant.lastName}
                                </div>
                                <div className="text-xs text-gray-600">{selectedTenant.email}</div>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs bg-white text-green-700 border-green-300">
                              Selected
                            </Badge>
                          </div>
                        </div>
                      )}

                      {!selectedTenant && suggestedTenants.length > 0 && (
                        <div className="space-y-3">
                          <Label className="text-sm font-medium text-gray-600">Suggested Tenants</Label>
                          <div className="space-y-3 max-h-60 overflow-y-auto">
                            {suggestedTenants.map((tenant) => (
                              <div
                                key={tenant.id}
                                className="p-4 border border-gray-200 rounded-lg cursor-pointer transition-all hover:border-blue-300 hover:bg-blue-50 hover:shadow-sm"
                                onClick={() => handleTenantSelect(tenant)}
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                      <User className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                      <div className="font-medium text-sm">
                                        {tenant.firstName} {tenant.lastName}
                                      </div>
                                      <div className="text-xs text-gray-500">{tenant.email}</div>
                                      <div className="text-xs text-gray-500">{tenant.phoneNumber}</div>
                                    </div>
                                  </div>
                                  <Badge variant="outline" className="text-xs bg-white">
                                    {tenant.interactionCount} interactions
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Lease Details */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <Label htmlFor="leaseNickname" className="text-sm font-medium">
                          Lease Nickname <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          placeholder="e.g., John's Sunset Apartment Lease"
                          value={formData.leaseNickname}
                          onChange={(e) => handleInputChange('leaseNickname', e.target.value)}
                          className="h-12 text-base"
                          required
                        />
                        <p className="text-xs text-gray-500">
                          Auto-generated based on tenant, property, and unit
                        </p>
                      </div>

                      <div className="space-y-4">
                        <Label htmlFor="leaseType" className="text-sm font-medium">
                          Lease Type <span className="text-red-500">*</span>
                        </Label>
                        <Select value={formData.leaseType} onValueChange={(value: any) => handleInputChange('leaseType', value)}>
                          <SelectTrigger className="h-12 text-base">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SHORT_TERM">Short Term (1-6 months)</SelectItem>
                            <SelectItem value="STANDARD">Standard (12 months)</SelectItem>
                            <SelectItem value="LONG_TERM">Long Term (13+ months)</SelectItem>
                            <SelectItem value="FIXED_TERM">Fixed Term (Custom duration)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Terms & Financial */}
                {currentStep === 2 && (
                  <div className="space-y-8">
                    {/* Dates Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <Label htmlFor="startDate" className="text-sm font-medium flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-orange-600" />
                          Start Date <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => handleInputChange('startDate', e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="h-12 text-base"
                          required
                        />
                      </div>

                      <div className="space-y-4">
                        <Label htmlFor="endDate" className="text-sm font-medium flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-orange-600" />
                          End Date <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => handleInputChange('endDate', e.target.value)}
                          min={formData.startDate || new Date().toISOString().split('T')[0]}
                          className="h-12 text-base"
                          required
                        />
                      </div>
                    </div>

                    {leaseDurationError && (
                      <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                        <p className="text-red-700 text-sm flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          {leaseDurationError}
                        </p>
                      </div>
                    )}

                    {formData.startDate && formData.endDate && !leaseDurationError && (
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-medium text-blue-800 text-sm mb-2 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Lease Duration
                        </h4>
                        <p className="text-blue-700 text-sm">
                          {formData.leaseType}: {new Date(formData.startDate).toLocaleDateString()} to {new Date(formData.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}

                    {/* Financial Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <Label htmlFor="rentAmount" className="text-sm font-medium flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          Monthly Rent Amount <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            type="number"
                            placeholder="0.00"
                            className="pl-12 h-12 text-base"
                            value={formData.rentAmount}
                            onChange={(e) => handleInputChange('rentAmount', e.target.value)}
                            min="0"
                            max="100000"
                            step="0.01"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Label htmlFor="securityDeposit" className="text-sm font-medium flex items-center gap-2">
                          <Shield className="w-4 h-4 text-blue-600" />
                          Security Deposit
                        </Label>
                        <div className="relative">
                          <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            type="number"
                            placeholder="0.00"
                            className="pl-12 h-12 text-base"
                            value={formData.securityDeposit}
                            onChange={(e) => handleInputChange('securityDeposit', e.target.value)}
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Label htmlFor="advanceMonths" className="text-sm font-medium">
                          Advance Months
                        </Label>
                        <Select value={formData.advanceMonths} onValueChange={(value) => handleInputChange('advanceMonths', value)}>
                          <SelectTrigger className="h-12 text-base">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">No advance payment</SelectItem>
                            <SelectItem value="1">1 month advance</SelectItem>
                            <SelectItem value="2">2 months advance</SelectItem>
                            <SelectItem value="3">3 months advance</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-4">
                        <Label htmlFor="interval" className="text-sm font-medium">
                          Payment Interval <span className="text-red-500">*</span>
                        </Label>
                        <Select value={formData.interval} onValueChange={(value: any) => handleInputChange('interval', value)}>
                          <SelectTrigger className="h-12 text-base">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MONTHLY">Monthly</SelectItem>
                            <SelectItem value="WEEKLY">Weekly</SelectItem>
                            <SelectItem value="DAILY">Daily</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-4">
                        <Label htmlFor="dueDate" className="text-sm font-medium">
                          Due Date (Day of Month) <span className="text-red-500">*</span>
                        </Label>
                        <Select value={formData.dueDate} onValueChange={(value) => handleInputChange('dueDate', value)}>
                          <SelectTrigger className="h-12 text-base">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                              <SelectItem key={day} value={day.toString()}>
                                {day}
                                {day === 1 && 'st'}
                                {day === 2 && 'nd'}
                                {day === 3 && 'rd'}
                                {day > 3 && 'th'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Documents */}
                {currentStep === 3 && (
                  <div className="space-y-8">
                    <div className="space-y-6">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <FileText className="w-4 h-4 text-purple-600" />
                        Lease Document
                      </Label>
                      
                      <div className="flex gap-4 mb-6">
                        <Button
                          type="button"
                          variant={formData.documentOption === 'link' ? 'default' : 'outline'}
                          onClick={() => handleInputChange('documentOption', 'link')}
                          className="flex items-center gap-2 h-12 px-6"
                        >
                          <Link className="w-4 h-4" />
                          Use Link
                        </Button>
                        <Button
                          type="button"
                          variant={formData.documentOption === 'upload' ? 'default' : 'outline'}
                          onClick={() => handleInputChange('documentOption', 'upload')}
                          className="flex items-center gap-2 h-12 px-6"
                        >
                          <Upload className="w-4 h-4" />
                          Upload File
                        </Button>
                      </div>

                      {formData.documentOption === 'link' ? (
                        <div className="space-y-4">
                          <Input
                            placeholder="https://example.com/lease-document.pdf"
                            value={formData.leaseDocumentUrl}
                            onChange={(e) => handleInputChange('leaseDocumentUrl', e.target.value)}
                            className="h-12 text-base"
                          />
                          <p className="text-xs text-gray-500">
                            Provide a link to the digital lease agreement document
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileChange}
                            className="h-12"
                          />
                          <p className="text-xs text-gray-500">
                            Upload lease agreement document (PDF, DOC, DOCX)
                          </p>
                          {formData.leaseDocumentFile && (
                            <div className="p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                              Selected: {formData.leaseDocumentFile.name}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <Label htmlFor="landlordSignatureUrl" className="text-sm font-medium">
                          Landlord Signature URL (Optional)
                        </Label>
                        <Input
                          placeholder="https://example.com/landlord-signature.png"
                          value={formData.landlordSignatureUrl}
                          onChange={(e) => handleInputChange('landlordSignatureUrl', e.target.value)}
                          className="h-12 text-base"
                        />
                      </div>

                      <div className="space-y-4">
                        <Label htmlFor="tenantSignatureUrl" className="text-sm font-medium">
                          Tenant Signature URL (Optional)
                        </Label>
                        <Input
                          placeholder="https://example.com/tenant-signature.png"
                          value={formData.tenantSignatureUrl}
                          onChange={(e) => handleInputChange('tenantSignatureUrl', e.target.value)}
                          className="h-12 text-base"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-8 border-t mt-8">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="h-12 px-8"
                  >
                    Previous
                  </Button>
                  
                  {currentStep < 3 ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      disabled={!isStepValid()}
                      className="h-12 px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                    >
                      Continue to {steps[currentStep]?.title}
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={!isStepValid() || loading}
                      className="h-12 px-8 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                    >
                      <Save className="w-5 h-5 mr-2" />
                      {loading ? 'Creating Lease...' : 'Create Lease'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - 1/4 width */}
          <div className="space-y-6">
            {/* Summary Card */}
            <Card className="shadow-lg border-0 sticky top-6">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b">
                <CardTitle className="text-lg">Lease Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                {formData.propertyId && (
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <Home className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm text-blue-800">Property</p>
                      <p className="text-blue-700 text-sm">{getSelectedProperty()?.title}</p>
                    </div>
                  </div>
                )}

                {formData.unitId && (
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm text-green-800">Unit</p>
                      <p className="text-green-700 text-sm">{getSelectedUnit()?.label}</p>
                    </div>
                  </div>
                )}

                {formData.tenantId && (
                  <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                    <User className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm text-purple-800">Tenant</p>
                      <p className="text-purple-700 text-sm">
                        {getSelectedTenant()?.firstName} {getSelectedTenant()?.lastName}
                      </p>
                    </div>
                  </div>
                )}

                {formData.leaseNickname && (
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <p className="font-medium text-sm text-orange-800">Lease Nickname</p>
                    <p className="text-orange-700 text-sm">{formData.leaseNickname}</p>
                  </div>
                )}

                {formData.leaseType && (
                  <div className="p-3 bg-indigo-50 rounded-lg">
                    <p className="font-medium text-sm text-indigo-800">Lease Type</p>
                    <Badge variant="secondary" className="text-xs bg-white text-indigo-700 mt-1">
                      {formData.leaseType.replace('_', ' ')}
                    </Badge>
                  </div>
                )}

                {formData.rentAmount && (
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <DollarSign className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm text-green-800">Rent Amount</p>
                      <p className="text-green-700 text-sm font-semibold">
                        ${parseFloat(formData.rentAmount).toLocaleString()} / {formData.interval.toLowerCase()}
                      </p>
                    </div>
                  </div>
                )}

                {formData.startDate && (
                  <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm text-amber-800">Start Date</p>
                      <p className="text-amber-700 text-sm">
                        {new Date(formData.startDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}

                {!formData.propertyId && (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">
                      Complete the steps to see lease summary
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateLease;