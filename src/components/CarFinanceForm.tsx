import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Shield, Check, ArrowRight, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Step Components
import CarDetailsStep from "./form-steps/CarDetailsStep";
import EmploymentStep from "./form-steps/EmploymentStep";
import PersonalDetailsStep from "./form-steps/PersonalDetailsStep";
import AddressHistoryStep from "./form-steps/AddressHistoryStep";
import ConsentStep from "./form-steps/ConsentStep";
import ThankYouStep from "./form-steps/ThankYouStep";

export interface Address {
  line1: string;
  line2: string;
  city: string;
  postcode: string;
  yearsAtAddress: string;
  monthsAtAddress: string;
  ownershipType?: string;
}

export interface FormData {
  // Car Details
  vehicleType: "new" | "used" | "";
  make: string;
  model: string;
  priceRange: string;
  
  // Employment
  employmentStatus: string;
  monthlyIncome: string;
  
  // Personal Details
  title: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  
  // Address History
  currentAddress: Address;
  previousAddresses: Address[];
  
  // Consent
  marketingConsent: boolean;
  privacyConsent: boolean;
  creditCheckConsent: boolean;
}

const steps = [
  { id: 1, title: "Car Details", component: CarDetailsStep },
  { id: 2, title: "Employment", component: EmploymentStep },
  { id: 3, title: "Personal Details", component: PersonalDetailsStep },
  { id: 4, title: "Address History", component: AddressHistoryStep },
  { id: 5, title: "Consent", component: ConsentStep },
  { id: 6, title: "Thank You", component: ThankYouStep },
];

const CarFinanceForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    vehicleType: "",
    make: "",
    model: "",
    priceRange: "",
    employmentStatus: "",
    monthlyIncome: "",
    title: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    email: "",
    phone: "",
    currentAddress: {
      line1: "",
      line2: "",
      city: "",
      postcode: "",
      yearsAtAddress: "",
      monthsAtAddress: "",
      ownershipType: ""
    },
    previousAddresses: [],
    marketingConsent: false,
    privacyConsent: false,
    creditCheckConsent: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  // Calculate total address duration in months
  const calculateTotalAddressDuration = (data: FormData): number => {
    const currentYears = parseInt(data.currentAddress.yearsAtAddress || "0");
    const currentMonths = parseInt(data.currentAddress.monthsAtAddress || "0");
    const currentTotal = (currentYears * 12) + currentMonths;
    
    const previousTotal = data.previousAddresses.reduce((total, address) => {
      const years = parseInt(address.yearsAtAddress || "0");
      const months = parseInt(address.monthsAtAddress || "0");
      return total + (years * 12) + months;
    }, 0);
    
    return currentTotal + previousTotal;
  };

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    // Clear errors for updated fields
    const updatedFields = Object.keys(updates);
    setErrors(prev => {
      const newErrors = { ...prev };
      updatedFields.forEach(field => delete newErrors[field]);
      return newErrors;
    });
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1: // Car Details
        if (!formData.vehicleType) newErrors.vehicleType = "Please select vehicle type";
        if (!formData.make) newErrors.make = "Please select a make";
        if (!formData.priceRange) newErrors.priceRange = "Please select a price range";
        break;
      
      case 2: // Employment
        if (!formData.employmentStatus) newErrors.employmentStatus = "Please select employment status";
        if (!formData.monthlyIncome) newErrors.monthlyIncome = "Please enter monthly income";
        break;
        
      case 3: // Personal Details
        if (!formData.title) newErrors.title = "Please select title";
        if (!formData.firstName) newErrors.firstName = "Please enter first name";
        if (!formData.lastName) newErrors.lastName = "Please enter last name";
        if (!formData.dateOfBirth) newErrors.dateOfBirth = "Please enter date of birth";
        if (!formData.email) newErrors.email = "Please enter email";
        if (!formData.phone) newErrors.phone = "Please enter phone number";
        break;
        
      case 4: // Address History
        if (!formData.currentAddress.line1) newErrors["currentAddress.line1"] = "Please enter address line 1";
        if (!formData.currentAddress.city) newErrors["currentAddress.city"] = "Please enter city";
        if (!formData.currentAddress.postcode) newErrors["currentAddress.postcode"] = "Please enter postcode";
        
        // Check that at least one duration field is filled (years OR months)
        const currentYears = formData.currentAddress.yearsAtAddress || "";
        const currentMonths = formData.currentAddress.monthsAtAddress || "";
        if (!currentYears && !currentMonths) {
          newErrors["currentAddress.yearsAtAddress"] = "Please enter duration (years or months)";
        }
        
        if (!formData.currentAddress.ownershipType) newErrors["currentAddress.ownershipType"] = "Please select ownership type";
        
        // Check if we have enough address history (36 months = 3 years)
        const totalDuration = calculateTotalAddressDuration(formData);
        
        if (totalDuration < 36) {
          // Validate that the last previous address (if any) is complete
          const lastPreviousIndex = formData.previousAddresses.length - 1;
          if (lastPreviousIndex >= 0) {
            const lastPrevious = formData.previousAddresses[lastPreviousIndex];
            if (!lastPrevious.line1) newErrors[`previousAddress.${lastPreviousIndex}.line1`] = "Please complete the previous address";
            if (!lastPrevious.city) newErrors[`previousAddress.${lastPreviousIndex}.city`] = "Please complete the previous address";
            if (!lastPrevious.postcode) newErrors[`previousAddress.${lastPreviousIndex}.postcode`] = "Please complete the previous address";
            
            // Check that at least one duration field is filled for previous address
            const prevYears = lastPrevious.yearsAtAddress || "";
            const prevMonths = lastPrevious.monthsAtAddress || "";
            if (!prevYears && !prevMonths) {
              newErrors[`previousAddress.${lastPreviousIndex}.yearsAtAddress`] = "Please enter duration (years or months)";
            }
            
            if (!lastPrevious.ownershipType) newErrors[`previousAddress.${lastPreviousIndex}.ownershipType`] = "Please select ownership type";
          }
          
          // If no validation errors for the current incomplete address, show general message
          if (Object.keys(newErrors).length === 0) {
            newErrors["addressHistory"] = `We need ${36 - totalDuration} more months of address history to reach 3 years total`;
          }
        }
        break;
        
      case 5: // Consent
        if (!formData.privacyConsent) newErrors.privacyConsent = "You must agree to the privacy policy";
        if (!formData.creditCheckConsent) newErrors.creditCheckConsent = "You must consent to credit checks";
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      }
    } else {
      toast({
        title: "Please complete all required fields",
        variant: "destructive",
      });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const submitForm = () => {
    if (validateStep(5)) {
      // Submit to backend or handle form submission
      console.log("Form submitted:", formData);
      setCurrentStep(6); // Go to thank you page
      toast({
        title: "Application submitted successfully!",
        description: "We'll be in touch within 24 hours.",
      });
    }
  };

  const progressPercentage = (currentStep / steps.length) * 100;
  const CurrentStepComponent = steps[currentStep - 1]?.component;

  if (currentStep === 6) {
    return <ThankYouStep formData={formData} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CF</span>
              </div>
              <span className="font-semibold text-lg">CarFinanced</span>
            </div>
            <Badge variant="secondary" className="security-badge">
              <Shield className="w-4 h-4" />
              Your data is secure
            </Badge>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">
                  Step {currentStep} of {steps.length - 1}: {steps[currentStep - 1]?.title}
                </h2>
                <span className="text-sm text-muted-foreground">
                  {Math.round((currentStep / (steps.length - 1)) * 100)}% Complete
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
            
            {/* Step Indicators */}
            <div className="flex items-center justify-between">
              {steps.slice(0, -1).map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`progress-step ${
                      step.id < currentStep
                        ? "completed"
                        : step.id === currentStep
                        ? "current"
                        : "pending"
                    }`}
                  >
                    {step.id < currentStep ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <span>{step.id}</span>
                    )}
                  </div>
                  {index < steps.length - 2 && (
                    <div
                      className={`h-0.5 w-16 ml-2 ${
                        step.id < currentStep
                          ? "bg-step-complete"
                          : "bg-step-pending"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg">
            <CardContent className="p-8">
              <div className="form-step">
                {CurrentStepComponent && (
                  <CurrentStepComponent
                    formData={formData}
                    updateFormData={updateFormData}
                    errors={errors}
                  />
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </Button>

                {currentStep === 5 ? (
                  <Button
                    onClick={submitForm}
                    className="flex items-center gap-2 bg-primary hover:bg-primary-hover"
                  >
                    Submit Application
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={nextStep}
                    className="flex items-center gap-2 bg-primary hover:bg-primary-hover"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Trust Indicators */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>
              🔒 Your information is protected by 256-bit SSL encryption
            </p>
            <p className="mt-2">
              By continuing, you agree to our{" "}
              <a href="https://carfinanced.co.uk/privacy?_gl=1*1cbkk17*_ga*MTIwNDU0ODg5Ni4xNzU3Njc4ODIx*_ga_6ZQ951WRXK*czE3NTc3MDAzMzckbzMkZzEkdDE3NTc3MDQ4NjgkajU4JGwwJGgw" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                Privacy Policy
              </a>{" "}
              and{" "}
              <a href="#" className="text-primary hover:underline">
                Terms of Service
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CarFinanceForm;