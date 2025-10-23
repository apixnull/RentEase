import { useState } from 'react';
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
import { CalendarIcon, User, FileText, Home, X, Plus, AlertCircle, Briefcase, History } from 'lucide-react';
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Basic Information
        </CardTitle>
        <CardDescription>Tell us about yourself for the screening process</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>All information provided will be kept confidential and used solely for screening purposes.</AlertDescription>
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
                <Button variant="outline" className="w-full justify-start text-left font-normal">
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
              {formData.employmentStatus === 'STUDENT' ? 'Monthly Budget ($)' : 'Monthly Income ($)'}
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="w-5 h-5" />
          Employment & Rental History
        </CardTitle>
        <CardDescription>
          Provide details about your employment stability and previous rental experience
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>This information helps verify your ability to maintain consistent rent payments.</AlertDescription>
        </Alert>

        {['EMPLOYED', 'SELF_EMPLOYED'].includes(formData.employmentStatus) && (
          <div className="space-y-4">
            <h4 className="font-medium">Employment Details</h4>
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
          <h3 className="font-semibold flex items-center gap-2">
            <History className="w-5 h-5" />
            Rental History
          </h3>

          <div className="flex items-center space-x-3 p-4 border rounded-lg">
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
            <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="previousLandlordName">Previous Landlord Name</Label>
                  <Input
                    id="previousLandlordName"
                    value={formData.previousLandlordName}
                    onChange={(e) => handleInputChange('previousLandlordName', e.target.value)}
                    placeholder="Name of previous landlord"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="previousLandlordContact">Previous Landlord Contact</Label>
                  <Input
                    id="previousLandlordContact"
                    value={formData.previousLandlordContact}
                    onChange={(e) => handleInputChange('previousLandlordContact', e.target.value)}
                    placeholder="Phone or email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="previousRentalAddress">Previous Rental Address</Label>
                <Input
                  id="previousRentalAddress"
                  value={formData.previousRentalAddress}
                  onChange={(e) => handleInputChange('previousRentalAddress', e.target.value)}
                  placeholder="Full address of previous rental"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reasonForLeaving">Reason for Leaving</Label>
                <Input
                  id="reasonForLeaving"
                  value={formData.reasonForLeaving}
                  onChange={(e) => handleInputChange('reasonForLeaving', e.target.value)}
                  placeholder="Why did you leave your previous rental?"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3 p-4 border rounded-lg bg-white">
                  <Checkbox
                    id="hadEvictionHistory"
                    checked={formData.hadEvictionHistory}
                    onCheckedChange={(checked) => handleInputChange('hadEvictionHistory', checked)}
                  />
                  <Label htmlFor="hadEvictionHistory" className="font-medium cursor-pointer flex-1">
                    Have you ever been evicted?
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-4 border rounded-lg bg-white">
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
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-blue-700 text-sm">
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Document Verification
        </CardTitle>
        <CardDescription>
          Confirm which documents you can present to the landlord for verification
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            These documents will be verified in person with the landlord. Please indicate which ones you can provide.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-4 border rounded-lg">
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

          <div className="flex items-center space-x-3 p-4 border rounded-lg">
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

          <div className="flex items-center space-x-3 p-4 border rounded-lg">
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

        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Home className="w-5 h-5" />
          Lifestyle Information
        </CardTitle>
        <CardDescription>
          Help us understand your living preferences for property compatibility
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This information helps ensure the property is a good fit for your lifestyle and neighbors.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <h4 className="font-medium">Habits & Preferences</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-4 border rounded-lg">
              <Checkbox
                id="smokes"
                checked={formData.smokes}
                onCheckedChange={(checked) => handleInputChange('smokes', checked)}
              />
              <Label htmlFor="smokes" className="font-medium cursor-pointer flex-1">
                Smokes
              </Label>
            </div>

            <div className="flex items-center space-x-3 p-4 border rounded-lg">
              <Checkbox
                id="drinksAlcohol"
                checked={formData.drinksAlcohol}
                onCheckedChange={(checked) => handleInputChange('drinksAlcohol', checked)}
              />
              <Label htmlFor="drinksAlcohol" className="font-medium cursor-pointer flex-1">
                Drinks Alcohol
              </Label>
            </div>

            <div className="flex items-center space-x-3 p-4 border rounded-lg">
              <Checkbox
                id="hasPets"
                checked={formData.hasPets}
                onCheckedChange={(checked) => handleInputChange('hasPets', checked)}
              />
              <Label htmlFor="hasPets" className="font-medium cursor-pointer flex-1">
                Has Pets
              </Label>
            </div>

            <div className="flex items-center space-x-3 p-4 border rounded-lg">
              <Checkbox
                id="worksNightShift"
                checked={formData.worksNightShift}
                onCheckedChange={(checked) => handleInputChange('worksNightShift', checked)}
              />
              <Label htmlFor="worksNightShift" className="font-medium cursor-pointer flex-1">
                Works Night Shift
              </Label>
            </div>

            <div className="flex items-center space-x-3 p-4 border rounded-lg">
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
              <Button type="button" onClick={handleAddLifestyleTag} variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            {formData.otherLifestyle.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.otherLifestyle.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
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

        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h4 className="font-medium text-green-800 mb-2">Ready to Submit!</h4>
          <p className="text-green-700 text-sm">
            Review your information carefully before submitting. This screening helps ensure the best living environment match for you.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

// Progress Steps Component
const ProgressSteps = ({ currentStep, progress }: { currentStep: number; progress: number }) => {
  const steps = [
    { number: 1, label: 'Basic Info' },
    { number: 2, label: 'Employment' },
    { number: 3, label: 'Documents' },
    { number: 4, label: 'Lifestyle' },
  ];

  return (
    <>
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Step {currentStep} of 4</span>
          <span className="text-sm font-medium text-gray-700">{Math.round(progress)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {steps.map((step) => (
          <div key={step.number} className="text-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 ${
              step.number === currentStep 
                ? 'bg-blue-600 text-white' 
                : step.number < currentStep 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-300 text-gray-600'
            }`}>
              {step.number}
            </div>
            <span className={`text-sm font-medium ${
              step.number === currentStep ? 'text-blue-600' : 'text-gray-600'
            }`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </>
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
  
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    birthdate: null,
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
  });

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

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.fullName.trim() && 
               formData.birthdate && 
               isDateValid(formData.birthdate) && 
               formData.employmentStatus;
      
      case 2:
        if (['EMPLOYED', 'SELF_EMPLOYED'].includes(formData.employmentStatus)) {
          return formData.currentEmployer.trim() && 
                 formData.jobPosition.trim() && 
                 formData.yearsEmployed;
        }
        return true;
      
      case 3:
        return true;
      
      case 4:
        return formData.noiseLevel;
      
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (isStepValid(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    } else {
      alert(`Please complete all required fields in step ${currentStep} before proceeding.`);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isStepValid(4)) {
      alert('Please complete all required fields in the lifestyle section before submitting.');
      return;
    }

    if (!screeningId) {
      alert('Invalid screening application. Please try again.');
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

          // employment detials
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
      
      alert('Screening form submitted successfully!');
      navigate(`/tenant/screening/:${screeningId}/details`);
    } catch (error) {
      console.error('Error submitting screening form:', error);
      alert('There was an error submitting your form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = ((currentStep - 1) / 3) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Tenant Screening Application</h1>
          <p className="text-gray-600 mt-2">Complete your screening application to proceed with your rental application</p>
        </div>

        <ProgressSteps currentStep={currentStep} progress={progress} />

        <form onSubmit={handleSubmit}>
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

          <div className="flex justify-between mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              Previous
            </Button>

            {currentStep < 4 ? (
              <Button
                type="button"
                onClick={nextStep}
                disabled={!isStepValid(currentStep)}
              >
                Next Step
              </Button>
            ) : (
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700"
                disabled={!isStepValid(4) || isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScreeningForm;