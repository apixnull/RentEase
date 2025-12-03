import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, subYears, isAfter, isFuture } from 'date-fns';
import { CalendarIcon, User, FileText, Home, X, Plus, AlertCircle, Briefcase, History, Sparkles, LogOut, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { tenantSubmitScreeningInfoRequest } from '@/api/tenant/screeningApi';

// Types
interface FormData {
  // Basic Info
  fullName: string;
  birthdate: Date | null;
  employmentStatus: string;
  incomeSource: string;
  monthlyIncome: string;
  
  // Employment Details
  currentEmployer: string;
  jobPosition: string;
  yearsEmployed: string;
  
  // Rental History
  previousLandlordName: string;
  previousLandlordContact: string;
  previousRentalAddress: string;
  reasonForLeaving: string;
  hadEvictionHistory: boolean;
  latePaymentHistory: boolean;
  
  // Document Indicators
  hasGovernmentId: boolean;
  hasNbiClearance: boolean;
  hasProofOfIncome: boolean;
  
  // Lifestyle
  smokes: boolean;
  drinksAlcohol: boolean;
  hasPets: boolean;
  worksNightShift: boolean;
  hasVisitors: boolean;
  noiseLevel: string;
  otherLifestyle: string[];
}

// Constants
const EMPLOYMENT_OPTIONS = [
  { value: 'STUDENT', label: 'Student' },
  { value: 'EMPLOYED', label: 'Employed' },
  { value: 'SELF_EMPLOYED', label: 'Self-Employed' },
  { value: 'UNEMPLOYED', label: 'Unemployed' },
  { value: 'RETIRED', label: 'Retired' },
];

const NOISE_LEVEL_OPTIONS = [
  { value: 'LOW', label: 'Low - Quiet lifestyle' },
  { value: 'MODERATE', label: 'Moderate - Normal activity' },
  { value: 'HIGH', label: 'High - Active social life' },
];

const YEARS_EMPLOYED_OPTIONS = [
  { value: '0', label: 'Less than 1 year' },
  { value: '1', label: '1 year' },
  { value: '2', label: '2 years' },
  { value: '3', label: '3 years' },
  { value: '4', label: '4 years' },
  { value: '5', label: '5+ years' },
];

const YEARS = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);


// Date Picker Component
const SimpleDatePicker = ({ 
  value, 
  onChange 
}: { 
  value: Date | null; 
  onChange: (date: Date | null) => void;
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(value?.getFullYear() || new Date().getFullYear() - 25);
  const [selectedMonth, setSelectedMonth] = useState<number>(value?.getMonth() || 0);
  const [selectedDay, setSelectedDay] = useState<number>(value?.getDate() || 1);

  useEffect(() => {
    if (value) {
      setSelectedYear(value.getFullYear());
      setSelectedMonth(value.getMonth());
      setSelectedDay(value.getDate());
    }
  }, [value]);

  const handleDateChange = (year: number, month: number, day: number) => {
    const newDate = new Date(year, month, day);
    if (!isFuture(newDate)) {
      onChange(newDate);
    }
  };

  const isDateValid = (year: number, month: number, day: number) => {
    const date = new Date(year, month, day);
    return date.getDate() === day && date.getMonth() === month && date.getFullYear() === year;
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      <Select
        value={selectedYear.toString()}
        onValueChange={(val) => {
          const year = parseInt(val);
          setSelectedYear(year);
          if (isDateValid(year, selectedMonth, selectedDay)) {
            handleDateChange(year, selectedMonth, selectedDay);
          }
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent className="max-h-60">
          {YEARS.map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={selectedMonth.toString()}
        onValueChange={(val) => {
          const month = parseInt(val);
          setSelectedMonth(month);
          if (isDateValid(selectedYear, month, selectedDay)) {
            handleDateChange(selectedYear, month, selectedDay);
          }
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent>
          {MONTHS.map((month, index) => (
            <SelectItem key={month} value={index.toString()}>
              {month}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={selectedDay.toString()}
        onValueChange={(val) => {
          const day = parseInt(val);
          setSelectedDay(day);
          if (isDateValid(selectedYear, selectedMonth, day)) {
            handleDateChange(selectedYear, selectedMonth, day);
          }
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Day" />
        </SelectTrigger>
        <SelectContent>
          {DAYS.map((day) => (
            <SelectItem key={day} value={day.toString()}>
              {day}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

// Step Components
const BasicInfoStep = ({ formData, handleInputChange }: { formData: FormData; handleInputChange: (field: string, value: any) => void }) => {
  const isDateValid = (date: Date | null): boolean => {
    if (!date) return false;
    if (isFuture(date)) return false;
    const eighteenYearsAgo = subYears(new Date(), 18);
    return !isAfter(date, eighteenYearsAgo);
  };

  return (
    <Card className="border border-orange-100/70 shadow-sm">
      <CardHeader className="space-y-1 rounded-t-2xl bg-gradient-to-r from-orange-50 via-amber-50 to-white border-b border-orange-100/60">
        <CardTitle className="flex items-center gap-2 text-orange-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-orange-600 via-amber-600 to-red-600 text-white shadow-sm shadow-orange-100">
            <User className="w-5 h-5" />
          </span>
          Basic Information
        </CardTitle>
        <CardDescription className="text-slate-600">
          Tell us about yourself to help landlords confirm your application quickly.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <Alert className="border-orange-200/60 bg-orange-50/70 text-orange-700">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription>
            All information you share stays private between you and the landlord who invited you.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthdate">Birthdate *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.birthdate ? format(formData.birthdate, 'PPP') : 'Select your birthdate'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4" align="start">
                <div className="space-y-4">
                  <SimpleDatePicker value={formData.birthdate} onChange={(date) => handleInputChange('birthdate', date)} />
                  {formData.birthdate && !isDateValid(formData.birthdate) && (
                    <p className="text-sm text-red-600">Must be at least 18 years old and not a future date</p>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="employmentStatus">Employment Status *</Label>
          <Select value={formData.employmentStatus} onValueChange={(value) => handleInputChange('employmentStatus', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select your employment status" />
            </SelectTrigger>
            <SelectContent>
              {EMPLOYMENT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="incomeSource">
              {formData.employmentStatus === 'STUDENT' ? 'Income Source' : 'Primary Income Source'}
            </Label>
            <Input
              id="incomeSource"
              value={formData.incomeSource}
              onChange={(e) => handleInputChange('incomeSource', e.target.value)}
              placeholder={
                formData.employmentStatus === 'STUDENT' ? 'e.g., Allowance, Part-time' :
                formData.employmentStatus === 'UNEMPLOYED' ? 'e.g., Savings, Support' :
                'e.g., Salary, Business'
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthlyIncome">
              {formData.employmentStatus === 'STUDENT' ? 'Monthly Budget (₱)' : 'Monthly Income (₱)'}
            </Label>
            <Input
              id="monthlyIncome"
              type="number"
              value={formData.monthlyIncome}
              onChange={(e) => handleInputChange('monthlyIncome', e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const EmploymentStep = ({ 
  formData, 
  handleInputChange, 
  hasPreviousRental, 
  setHasPreviousRental 
}: { 
  formData: FormData; 
  handleInputChange: (field: string, value: any) => void;
  hasPreviousRental: boolean;
  setHasPreviousRental: (value: boolean) => void;
}) => {
  return (
    <Card className="border border-blue-100/70 shadow-sm">
      <CardHeader className="space-y-1 rounded-t-2xl bg-gradient-to-r from-blue-50 via-sky-50 to-white border-b border-blue-100/60">
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm shadow-blue-100">
            <Briefcase className="w-5 h-5" />
          </span>
          Employment & Rental History
        </CardTitle>
        <CardDescription className="text-slate-600">
          Show landlords you have consistent income and understand rental responsibilities.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <Alert className="border-blue-200/60 bg-blue-50/70 text-blue-700">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription>
            These details help landlords understand your ability to maintain rent payments on time.
          </AlertDescription>
        </Alert>

        {['EMPLOYED', 'SELF_EMPLOYED'].includes(formData.employmentStatus) && (
          <div className="space-y-4">
            <h4 className="font-medium text-slate-800">Employment Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="currentEmployer">
                  {formData.employmentStatus === 'SELF_EMPLOYED' ? 'Business Name' : 'Current Employer'}
                </Label>
                <Input
                  id="currentEmployer"
                  value={formData.currentEmployer}
                  onChange={(e) => handleInputChange('currentEmployer', e.target.value)}
                  placeholder={formData.employmentStatus === 'SELF_EMPLOYED' ? 'Your business name' : 'Company name'}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobPosition">
                  {formData.employmentStatus === 'SELF_EMPLOYED' ? 'Business Type' : 'Job Position'}
                </Label>
                <Input
                  id="jobPosition"
                  value={formData.jobPosition}
                  onChange={(e) => handleInputChange('jobPosition', e.target.value)}
                  placeholder={formData.employmentStatus === 'SELF_EMPLOYED' ? 'e.g., Freelancer' : 'Your position'}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="yearsEmployed">
                {formData.employmentStatus === 'SELF_EMPLOYED' ? 'Years in Business' : 'Years with Employer'}
              </Label>
              <Select value={formData.yearsEmployed} onValueChange={(value) => handleInputChange('yearsEmployed', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select years" />
                </SelectTrigger>
                <SelectContent>
                  {YEARS_EMPLOYED_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Separator />
          </div>
        )}

        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2 text-slate-800">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-700">
              <History className="w-5 h-5" />
            </span>
            Rental History
          </h3>

          <div className="flex items-center space-x-3 p-4 border border-blue-100 rounded-lg bg-blue-50/50">
            <Checkbox
              id="hasPreviousRental"
              checked={hasPreviousRental}
              onCheckedChange={(checked) => setHasPreviousRental(checked as boolean)}
            />
            <Label htmlFor="hasPreviousRental" className="font-medium cursor-pointer flex-1">
              I have previous rental history
            </Label>
          </div>

          {hasPreviousRental && (
            <div className="space-y-4 p-4 border border-blue-100 rounded-lg bg-white shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="previousLandlordName">
                    Previous Landlord Name
                    {hasPreviousRental && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  <Input
                    id="previousLandlordName"
                    value={formData.previousLandlordName}
                    onChange={(e) => handleInputChange('previousLandlordName', e.target.value)}
                    placeholder="Name of previous landlord"
                    required={hasPreviousRental}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="previousLandlordContact">
                    Previous Landlord Contact
                    {hasPreviousRental && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  <Input
                    id="previousLandlordContact"
                    value={formData.previousLandlordContact}
                    onChange={(e) => handleInputChange('previousLandlordContact', e.target.value)}
                    placeholder="Phone or email"
                    required={hasPreviousRental}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="previousRentalAddress">
                  Previous Rental Address
                  {hasPreviousRental && <span className="text-red-500 ml-1">*</span>}
                </Label>
                <Input
                  id="previousRentalAddress"
                  value={formData.previousRentalAddress}
                  onChange={(e) => handleInputChange('previousRentalAddress', e.target.value)}
                  placeholder="Full address of previous rental"
                  required={hasPreviousRental}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reasonForLeaving">
                  Reason for Leaving
                  {hasPreviousRental && <span className="text-red-500 ml-1">*</span>}
                </Label>
                <Input
                  id="reasonForLeaving"
                  value={formData.reasonForLeaving}
                  onChange={(e) => handleInputChange('reasonForLeaving', e.target.value)}
                  placeholder="Why did you leave your previous rental?"
                  required={hasPreviousRental}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3 p-4 border rounded-lg bg-blue-50/60 border-blue-100">
                  <Checkbox
                    id="hadEvictionHistory"
                    checked={formData.hadEvictionHistory}
                    onCheckedChange={(checked) => handleInputChange('hadEvictionHistory', checked)}
                  />
                  <Label htmlFor="hadEvictionHistory" className="font-medium cursor-pointer flex-1">
                    Have you ever been evicted?
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-4 border rounded-lg bg-blue-50/60 border-blue-100">
                  <Checkbox
                    id="latePaymentHistory"
                    checked={formData.latePaymentHistory}
                    onCheckedChange={(checked) => handleInputChange('latePaymentHistory', checked)}
                  />
                  <Label htmlFor="latePaymentHistory" className="font-medium cursor-pointer flex-1">
                    History of late rent payments?
                  </Label>
                </div>
              </div>
            </div>
          )}

          {!hasPreviousRental && (
            <div className="bg-blue-50/70 p-4 rounded-lg border border-blue-100">
              <p className="text-blue-800 text-sm">
                No previous rental history? That's okay! This is common for first-time renters. 
                We'll consider other factors like employment stability.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const DocumentsStep = ({ formData, handleInputChange }: { formData: FormData; handleInputChange: (field: string, value: any) => void }) => {
  return (
    <Card className="border border-orange-100/70 shadow-sm">
      <CardHeader className="space-y-1 rounded-t-2xl bg-gradient-to-r from-orange-50 via-amber-50 to-white border-b border-orange-100/60">
        <CardTitle className="flex items-center gap-2 text-orange-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-orange-600 via-amber-600 to-red-600 text-white shadow-sm shadow-orange-100">
            <FileText className="w-5 h-5" />
          </span>
          Document Verification
        </CardTitle>
        <CardDescription className="text-slate-600">
          Let the landlord know which documents you can show during the in-person verification.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <Alert className="border-orange-200/60 bg-orange-50/70 text-orange-700">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription>
            Select all documents you can bring. You can still submit even if a document is not available yet.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-4 border border-orange-100 rounded-lg bg-white shadow-sm">
            <Checkbox
              id="hasGovernmentId"
              checked={formData.hasGovernmentId}
              onCheckedChange={(checked) => handleInputChange('hasGovernmentId', checked)}
            />
            <div className="flex-1">
              <Label htmlFor="hasGovernmentId" className="font-medium cursor-pointer">
                Government Issued ID
              </Label>
              <p className="text-sm text-gray-500 mt-1">
                Valid passport, driver's license, or national ID card
              </p>
            </div>
            <Badge variant={formData.hasGovernmentId ? "default" : "outline"}>
              {formData.hasGovernmentId ? "Can Provide" : "Not Available"}
            </Badge>
          </div>

          <div className="flex items-center space-x-3 p-4 border border-orange-100 rounded-lg bg-white shadow-sm">
            <Checkbox
              id="hasNbiClearance"
              checked={formData.hasNbiClearance}
              onCheckedChange={(checked) => handleInputChange('hasNbiClearance', checked)}
            />
            <div className="flex-1">
              <Label htmlFor="hasNbiClearance" className="font-medium cursor-pointer">
                NBI Clearance
              </Label>
              <p className="text-sm text-gray-500 mt-1">
                Valid NBI clearance certificate
              </p>
            </div>
            <Badge variant={formData.hasNbiClearance ? "default" : "outline"}>
              {formData.hasNbiClearance ? "Can Provide" : "Not Available"}
            </Badge>
          </div>

          <div className="flex items-center space-x-3 p-4 border border-orange-100 rounded-lg bg-white shadow-sm">
            <Checkbox
              id="hasProofOfIncome"
              checked={formData.hasProofOfIncome}
              onCheckedChange={(checked) => handleInputChange('hasProofOfIncome', checked)}
            />
            <div className="flex-1">
              <Label htmlFor="hasProofOfIncome" className="font-medium cursor-pointer">
                Proof of Income
              </Label>
              <p className="text-sm text-gray-500 mt-1">
                Recent payslips, bank statements, or employment certificate
              </p>
            </div>
            <Badge variant={formData.hasProofOfIncome ? "default" : "outline"}>
              {formData.hasProofOfIncome ? "Can Provide" : "Not Available"}
            </Badge>
          </div>
        </div>

        <div className="bg-amber-50/80 p-4 rounded-lg border border-amber-200">
          <h4 className="font-medium text-amber-800 mb-2">Important: Document Presentation</h4>
          <p className="text-amber-700 text-sm">
            Please bring the original documents you've indicated above when you meet with the landlord. 
            They will verify these documents in person. Don't worry if you don't have all documents available - 
            this is just to help the landlord understand what verification materials you can provide.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

const LifestyleStep = ({ 
  formData, 
  handleInputChange, 
  otherLifestyleInput, 
  setOtherLifestyleInput, 
  handleAddLifestyleTag, 
  handleRemoveLifestyleTag, 
  handleKeyPress 
}: { 
  formData: FormData; 
  handleInputChange: (field: string, value: any) => void;
  otherLifestyleInput: string;
  setOtherLifestyleInput: (value: string) => void;
  handleAddLifestyleTag: () => void;
  handleRemoveLifestyleTag: (tag: string) => void;
  handleKeyPress: (e: React.KeyboardEvent) => void;
}) => {
  return (
    <Card className="border border-emerald-100/70 shadow-sm">
      <CardHeader className="space-y-1 rounded-t-2xl bg-gradient-to-r from-emerald-50 via-green-50 to-white border-b border-emerald-100/60">
        <CardTitle className="flex items-center gap-2 text-emerald-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm shadow-emerald-100">
            <Home className="w-5 h-5" />
          </span>
          Lifestyle Information
        </CardTitle>
        <CardDescription className="text-slate-600">
          Share your living habits so we can match you with the right property and neighbors.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <Alert className="border-emerald-200/60 bg-emerald-50/70 text-emerald-700">
          <AlertCircle className="h-4 w-4 text-emerald-600" />
          <AlertDescription>
            Help us understand how you live day-to-day so your new home feels comfortable from day one.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <h4 className="font-medium text-slate-800">Habits & Preferences</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-4 border border-emerald-100 rounded-lg bg-white shadow-sm">
              <Checkbox
                id="smokes"
                checked={formData.smokes}
                onCheckedChange={(checked) => handleInputChange('smokes', checked)}
              />
              <Label htmlFor="smokes" className="font-medium cursor-pointer flex-1">
                Smokes
              </Label>
            </div>

            <div className="flex items-center space-x-3 p-4 border border-emerald-100 rounded-lg bg-white shadow-sm">
              <Checkbox
                id="drinksAlcohol"
                checked={formData.drinksAlcohol}
                onCheckedChange={(checked) => handleInputChange('drinksAlcohol', checked)}
              />
              <Label htmlFor="drinksAlcohol" className="font-medium cursor-pointer flex-1">
                Drinks Alcohol
              </Label>
            </div>

            <div className="flex items-center space-x-3 p-4 border border-emerald-100 rounded-lg bg-white shadow-sm">
              <Checkbox
                id="hasPets"
                checked={formData.hasPets}
                onCheckedChange={(checked) => handleInputChange('hasPets', checked)}
              />
              <Label htmlFor="hasPets" className="font-medium cursor-pointer flex-1">
                Has Pets
              </Label>
            </div>

            <div className="flex items-center space-x-3 p-4 border border-emerald-100 rounded-lg bg-white shadow-sm">
              <Checkbox
                id="worksNightShift"
                checked={formData.worksNightShift}
                onCheckedChange={(checked) => handleInputChange('worksNightShift', checked)}
              />
              <Label htmlFor="worksNightShift" className="font-medium cursor-pointer flex-1">
                Works Night Shift
              </Label>
            </div>

            <div className="flex items-center space-x-3 p-4 border border-emerald-100 rounded-lg bg-white shadow-sm">
              <Checkbox
                id="hasVisitors"
                checked={formData.hasVisitors}
                onCheckedChange={(checked) => handleInputChange('hasVisitors', checked)}
              />
              <Label htmlFor="hasVisitors" className="font-medium cursor-pointer flex-1">
                Regular Visitors
              </Label>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <Label htmlFor="noiseLevel">Noise Level Preference *</Label>
          <Select value={formData.noiseLevel} onValueChange={(value) => handleInputChange('noiseLevel', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select your typical noise level" />
            </SelectTrigger>
            <SelectContent>
              {NOISE_LEVEL_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-gray-500">
            This helps match you with compatible living environments and neighbors.
          </p>
        </div>

        <Separator />

        <div className="space-y-4">
          <Label htmlFor="otherLifestyle">Other Lifestyle Factors (Optional)</Label>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={otherLifestyleInput}
                onChange={(e) => setOtherLifestyleInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="e.g., Gamer, Travels Often, Works from Home"
              />
              <Button type="button" onClick={handleAddLifestyleTag} variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            {formData.otherLifestyle.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.otherLifestyle.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-200">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveLifestyleTag(tag)}
                      className="hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-green-50/80 p-4 rounded-lg border border-green-200">
          <h4 className="font-medium text-green-800 mb-2">Ready to Submit!</h4>
          <p className="text-green-700 text-sm">
            Review your information carefully before submitting. This screening helps ensure the best living environment match for you.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

// Progress Steps Component - Compact design for mobile
const ProgressSteps = ({ currentStep, progress }: { currentStep: number; progress: number }) => {
  const steps = [
    { number: 1, label: 'Basic Info', description: 'Introduce yourself', icon: User },
    { number: 2, label: 'Employment', description: 'Financial stability', icon: Briefcase },
    { number: 3, label: 'Documents', description: 'Verification items', icon: FileText },
    { number: 4, label: 'Lifestyle', description: 'Living preferences', icon: Home },
  ] as const;

  const getStepState = (stepNumber: number) => {
    if (stepNumber === currentStep) return 'current';
    if (stepNumber < currentStep) return 'complete';
    return 'upcoming';
  };

  return (
    <Card className="border border-orange-100/60 shadow-sm">
      <CardContent className="p-3 sm:p-4 space-y-3 sm:space-y-4">
        {/* Mobile: Compact horizontal progress bar with step indicators */}
        <div className="block sm:hidden">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-orange-600">Progress</p>
            <span className="text-[10px] text-slate-600">
              {currentStep}/4 · {Math.round(progress)}%
            </span>
          </div>
          <div className="relative">
            {/* Progress bar */}
            <div className="h-1.5 rounded-full bg-slate-200">
              <div
                className="h-1.5 rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            {/* Step indicators */}
            <div className="flex justify-between mt-2">
              {steps.map((step) => {
                const Icon = step.icon;
                const state = getStepState(step.number);
                return (
                  <div key={step.number} className="flex flex-col items-center gap-1">
                    <div
                      className={[
                        'flex h-6 w-6 items-center justify-center rounded-full border text-[10px]',
                        state === 'current' && 'bg-orange-600 text-white border-orange-600 shadow-sm',
                        state === 'complete' && 'bg-emerald-500 text-white border-emerald-500 shadow-sm',
                        state === 'upcoming' && 'bg-white text-slate-400 border-slate-300',
                      ].filter(Boolean).join(' ')}
                    >
                      <Icon className="w-3 h-3" />
                    </div>
                    <p
                      className={[
                        'text-[9px] font-medium text-center max-w-[50px]',
                        state === 'current' && 'text-orange-700',
                        state === 'complete' && 'text-emerald-700',
                        state === 'upcoming' && 'text-slate-500',
                      ].filter(Boolean).join(' ')}
                    >
                      {step.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Desktop: Full detailed view */}
        <div className="hidden sm:block">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-baseline gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">Screening Progress</p>
            </div>
            <div className="flex w-full items-center gap-2 sm:max-w-xs">
              <div className="h-2 rounded-full bg-slate-200 flex-1">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs text-slate-600">
                Step {currentStep} of 4 · {Math.round(progress)}%
              </span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {steps.map((step) => {
              const Icon = step.icon;
              const state = getStepState(step.number);

              return (
                <div
                  key={step.number}
                  className={[
                    'rounded-xl border px-4 py-4 transition-all duration-200',
                    state === 'current' && 'bg-white border-orange-200 shadow-sm ring-2 ring-orange-100',
                    state === 'complete' && 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200/70 text-emerald-900 shadow-sm',
                    state === 'upcoming' && 'bg-slate-50 border-slate-200 text-slate-500',
                  ].filter(Boolean).join(' ')}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={[
                        'flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold',
                        state === 'current' && 'bg-orange-600 text-white border-orange-600 shadow-sm shadow-orange-100',
                        state === 'complete' && 'bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-100',
                        state === 'upcoming' && 'bg-white text-slate-500 border-slate-200 shadow-sm',
                      ].filter(Boolean).join(' ')}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p
                        className={[
                          'text-sm font-semibold',
                          state === 'current' && 'text-orange-700',
                          state === 'complete' && 'text-emerald-700',
                          state === 'upcoming' && 'text-slate-600',
                        ].filter(Boolean).join(' ')}
                      >
                        {step.label}
                      </p>
                      <p className="text-xs text-slate-500">{step.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Main Component
const ScreeningForm = () => {
  const navigate = useNavigate();
  const { screeningId } = useParams<{ screeningId: string }>();
  const [currentStep, setCurrentStep] = useState(1);
  const [otherLifestyleInput, setOtherLifestyleInput] = useState('');
  const [hasPreviousRental, setHasPreviousRental] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  
  const [formData, setFormData] = useState<FormData>(() => {
    const defaultFullName = [user?.firstName, user?.middleName, user?.lastName]
      .filter(Boolean)
      .join(' ')
      .trim();
    const parsedBirthdate =
      user?.birthdate && !Number.isNaN(new Date(user.birthdate).getTime())
        ? new Date(user.birthdate)
        : null;

    return {
      fullName: defaultFullName || '',
      birthdate: parsedBirthdate,
      employmentStatus: '',
      incomeSource: '',
      monthlyIncome: '',
      currentEmployer: '',
      jobPosition: '',
      yearsEmployed: '',
      previousLandlordName: '',
      previousLandlordContact: '',
      previousRentalAddress: '',
      reasonForLeaving: '',
      hadEvictionHistory: false,
      latePaymentHistory: false,
      hasGovernmentId: false,
      hasNbiClearance: false,
      hasProofOfIncome: false,
      smokes: false,
      drinksAlcohol: false,
      hasPets: false,
      worksNightShift: false,
      hasVisitors: false,
      noiseLevel: '',
      otherLifestyle: [],
    };
  });

  useEffect(() => {
    if (!user) return;

    setFormData((prev) => {
      const hasName = prev.fullName.trim().length > 0;
      const nextFullName = [user.firstName, user.middleName, user.lastName]
        .filter(Boolean)
        .join(' ')
        .trim();
      const parsedBirthdate =
        user.birthdate && !Number.isNaN(new Date(user.birthdate).getTime())
          ? new Date(user.birthdate)
          : null;

      return {
        ...prev,
        fullName: hasName ? prev.fullName : nextFullName || prev.fullName,
        birthdate: prev.birthdate ?? parsedBirthdate ?? prev.birthdate,
      };
    });
  }, [user]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddLifestyleTag = () => {
    if (otherLifestyleInput.trim() && !formData.otherLifestyle.includes(otherLifestyleInput.trim())) {
      setFormData(prev => ({
        ...prev,
        otherLifestyle: [...prev.otherLifestyle, otherLifestyleInput.trim()]
      }));
      setOtherLifestyleInput('');
    }
  };

  const handleRemoveLifestyleTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      otherLifestyle: prev.otherLifestyle.filter(t => t !== tag)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddLifestyleTag();
    }
  };

  const isDateValid = (date: Date | null): boolean => {
    if (!date) return false;
    if (isFuture(date)) return false;
    const eighteenYearsAgo = subYears(new Date(), 18);
    return !isAfter(date, eighteenYearsAgo);
  };

  const getStepValidationMessage = (step: number): string => {
    switch (step) {
      case 1:
        if (!formData.fullName.trim()) {
          return 'Please enter your full name.';
        }
        if (!formData.birthdate) {
          return 'Please select your birthdate.';
        }
        if (!isDateValid(formData.birthdate)) {
          return 'Applicants must be at least 18 years old.';
        }
        if (!formData.employmentStatus) {
          return 'Please select your employment status.';
        }
        return '';
      case 2:
        if (['EMPLOYED', 'SELF_EMPLOYED'].includes(formData.employmentStatus)) {
          if (!formData.currentEmployer.trim()) {
            return 'Please provide your employer or business name.';
          }
          if (!formData.jobPosition.trim()) {
            return 'Please provide your job position or business type.';
          }
          if (!formData.yearsEmployed) {
            return 'Please select how long you have been employed.';
          }
        }

        if (hasPreviousRental) {
          if (!formData.previousLandlordName.trim()) {
            return 'Previous landlord name is required.';
          }
          if (!formData.previousLandlordContact.trim()) {
            return 'Previous landlord contact is required.';
          }
          if (!formData.previousRentalAddress.trim()) {
            return 'Previous rental address is required.';
          }
          if (!formData.reasonForLeaving.trim()) {
            return 'Please share your reason for leaving your previous rental.';
          }
        }
        return '';
      case 3:
        return '';
      case 4:
        if (!formData.noiseLevel) {
          return 'Please select your typical noise level.';
        }
        return '';
      default:
        return '';
    }
  };

  const isStepValid = (step: number) => getStepValidationMessage(step) === '';

  const nextStep = () => {
    const message = getStepValidationMessage(currentStep);
    if (message) {
      toast.error('Complete required information', {
        description: message,
      });
      return;
    }

    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const submitForm = async () => {
    const stepsToValidate = [1, 2, 4] as const;
    for (const step of stepsToValidate) {
      const message = getStepValidationMessage(step);
      if (message) {
        setCurrentStep(step);
        setConfirmDialogOpen(false);
        toast.error('Complete required information', {
          description: message,
        });
        return;
      }
    }

    if (!screeningId) {
      setConfirmDialogOpen(false);
      toast.error('Invalid screening application', {
        description: 'The screening details could not be found. Please try again.',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const payload = {
        // basic info
        fullName: formData.fullName,
        birthdate: formData.birthdate ? format(formData.birthdate, 'yyyy-MM-dd') : null,
        employmentStatus: formData.employmentStatus,
        incomeSource: formData.incomeSource,
        monthlyIncome: formData.monthlyIncome ? parseFloat(formData.monthlyIncome) : null,

        // employment details
        currentEmployer: formData.currentEmployer,
        jobPosition: formData.jobPosition,
        yearsEmployed: formData.yearsEmployed ? parseInt(formData.yearsEmployed) : null,

        // rental history
        hasPreviousRental,
        previousLandlordName: formData.previousLandlordName,
        previousLandlordContact: formData.previousLandlordContact,
        previousRentalAddress: formData.previousRentalAddress,
        reasonForLeaving: formData.reasonForLeaving,
        hadEvictionHistory: formData.hadEvictionHistory,
        latePaymentHistory: formData.latePaymentHistory,

        // documents
        hasGovernmentId: formData.hasGovernmentId,
        hasNbiClearance: formData.hasNbiClearance,
        hasProofOfIncome: formData.hasProofOfIncome,

        // lifestyle
        smokes: formData.smokes,
        drinksAlcohol: formData.drinksAlcohol,
        hasPets: formData.hasPets,
        worksNightShift: formData.worksNightShift,
        hasVisitors: formData.hasVisitors,
        noiseLevel: formData.noiseLevel,
        otherLifestyle: formData.otherLifestyle,
      };

      await tenantSubmitScreeningInfoRequest(screeningId, payload);

      toast.success('Application submitted', {
        description: 'Your screening details have been sent to the landlord.',
      });
      setConfirmDialogOpen(false);
      navigate(`/tenant/screening/${screeningId}/details`);
    } catch (error) {
      console.error('Error submitting screening form:', error);
      toast.error('Submission failed', {
        description: 'There was an error submitting your form. Please try again.',
      });
      setConfirmDialogOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    await submitForm();
  };

  const handleExit = () => {
    setExitDialogOpen(true);
  };

  const confirmExit = () => {
    setExitDialogOpen(false);
    navigate('/tenant/screening');
  };

  const progress = ((currentStep - 1) / 3) * 100;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header with similar color scheme to TenantScreeningTenant */}
        <div className="relative overflow-hidden rounded-2xl">
          {/* Gradient border effect - Orange to Amber to Red (similar to ScreeningHeader) */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-orange-300/80 via-amber-200/70 via-red-200/70 to-rose-200/60 opacity-95" />
          
          {/* Glass card with backdrop */}
          <div className="relative m-[1px] rounded-[15px] bg-white/80 backdrop-blur-lg border border-white/60 shadow-lg">
            {/* Animated decorative blobs */}
            <div className="pointer-events-none absolute -top-12 -left-12 h-48 w-48 rounded-full bg-gradient-to-br from-orange-300/50 to-amber-400/40 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-12 -right-12 h-56 w-56 rounded-full bg-gradient-to-tl from-red-300/50 to-rose-300/40 blur-3xl" />
            
            {/* Accent lines */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-orange-400/70 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[1.5px] bg-gradient-to-r from-transparent via-red-400/70 to-transparent" />
            
            {/* Content */}
            <div className="px-4 sm:px-6 py-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-600 via-amber-600 to-red-600 text-white shadow-lg shadow-orange-500/30">
                    <User className="w-5 h-5" />
                  </span>
                  <div className="space-y-1">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-600">
                      Tenant Journey
                    </p>
                    <h1 className="text-xl font-semibold bg-gradient-to-r from-gray-900 via-orange-900 to-gray-900 bg-clip-text text-transparent sm:text-2xl">
                      Tenant Screening Application
                    </h1>
                    <p className="text-sm text-slate-600">
                      Share just what landlords need and review everything before you submit.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 rounded-lg border border-orange-100 bg-orange-50/60 px-3 py-2 text-xs text-orange-700 sm:text-sm">
                    <Sparkles className="w-4 h-4" />
                    <span>{currentStep} of 4 · {Math.round(progress)}%</span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleExit}
                    className="flex items-center gap-2 border-slate-200 text-slate-700 hover:bg-slate-100"
                  >
                    <LogOut className="w-4 h-4" />
                    Exit
                  </Button>
                </div>
              </div>
              
              {/* Animated underline with gradient */}
              <div className="mt-4 relative h-1 w-full rounded-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/80 via-amber-400/80 via-red-400/80 to-rose-400/80 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <ProgressSteps currentStep={currentStep} progress={progress} />

          <form onSubmit={handleSubmit} className="space-y-6">
            {currentStep === 1 && (
              <BasicInfoStep formData={formData} handleInputChange={handleInputChange} />
            )}

            {currentStep === 2 && (
              <EmploymentStep
                formData={formData}
                handleInputChange={handleInputChange}
                hasPreviousRental={hasPreviousRental}
                setHasPreviousRental={setHasPreviousRental}
              />
            )}

            {currentStep === 3 && (
              <DocumentsStep formData={formData} handleInputChange={handleInputChange} />
            )}

            {currentStep === 4 && (
              <LifestyleStep
                formData={formData}
                handleInputChange={handleInputChange}
                otherLifestyleInput={otherLifestyleInput}
                setOtherLifestyleInput={setOtherLifestyleInput}
                handleAddLifestyleTag={handleAddLifestyleTag}
                handleRemoveLifestyleTag={handleRemoveLifestyleTag}
                handleKeyPress={handleKeyPress}
              />
            )}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="sm:w-auto w-full"
              >
                Previous
              </Button>

              {currentStep < 4 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={!isStepValid(currentStep)}
                  className="bg-orange-600 hover:bg-orange-700 sm:w-auto w-full"
                >
                  Next Step
                </Button>
              ) : (
                <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <Button
                      type="button"
                      className="bg-emerald-600 hover:bg-emerald-700 sm:w-auto w-full"
                      disabled={!isStepValid(4) || isSubmitting}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Application'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm submission</AlertDialogTitle>
                      <AlertDialogDescription>
                        Please review your details carefully. Once submitted, your landlord will immediately see your screening information.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={isSubmitting}>Go Back</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={submitForm}
                        disabled={isSubmitting}
                        className="bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-600"
                      >
                        {isSubmitting ? 'Submitting...' : 'Confirm & Submit'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </form>
        </div>

        {/* Exit Confirmation Dialog */}
        <AlertDialog open={exitDialogOpen} onOpenChange={setExitDialogOpen}>
          <AlertDialogContent className="sm:max-w-md">
            <AlertDialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-red-100">
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
                </div>
                <AlertDialogTitle className="text-xl">Exit Screening Form?</AlertDialogTitle>
              </div>
              <AlertDialogDescription className="text-base text-slate-600 pt-2">
                Are you sure you want to exit? All the information you've filled in will be lost and you'll need to start over if you return to this screening.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="bg-orange-50/50 border border-orange-200/60 rounded-lg p-4 mt-4">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-1.5">
                  <p className="text-sm font-medium text-orange-900">What will be lost:</p>
                  <ul className="text-sm text-orange-800 space-y-1 list-disc list-inside">
                    <li>All form data you've entered</li>
                    <li>Your current progress (Step {currentStep} of 4)</li>
                    <li>Any unsaved information</li>
                  </ul>
                </div>
              </div>
            </div>
            <AlertDialogFooter className="gap-2 sm:gap-0 mt-6">
              <AlertDialogCancel 
                onClick={() => setExitDialogOpen(false)}
                className="sm:w-auto w-full"
              >
                Continue Filling
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmExit}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600 sm:w-auto w-full"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Exit Anyway
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default ScreeningForm;