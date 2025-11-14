import { useState, useEffect } from "react";
import { ArrowRight, ArrowLeft, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import AddressAutocomplete from "./AddressAutocomplete";
import carfinancedLogoNew from "@/assets/carfinanced-logo-new.png";
import carfinancedHeaderLogo from "@/assets/carfinanced-header-logo.png";
import trustpilotLogo from "@/assets/trustpilot-logo.png";
import ThankYouPage from "./ThankYouPage";
import { submitToAutoConvert, UTMParams } from "@/services/autoconvert";

export interface FormData {
  // Step 1: Vehicle Type
  vehicleType: "car" | "van" | "bike" | "";
  
  // Step 2: Driving Licence
  hasFullLicence: boolean | null;
  licenceType: "none" | "provisional-uk" | "eu" | "international" | "";
  
  // Step 3: Marital Status
  maritalStatus: "married" | "single" | "cohabiting" | "divorced" | "separated" | "widowed" | "civil-partnership" | "";
  
  // Step 4: Date of Birth
  dateOfBirth: string;
  
  // Step 5: Address
  address: string;
  fullAddress: {
    line1: string;
    line2?: string;
    city: string;
    postcode: string;
  };
  
  // Step 6: Housing Situation
  housingSituation: "private-tenant" | "home-owner" | "council-tenant" | "living-with-parents" | "";
  
  // Step 7: Address Duration
  addressDurationYears: string;
  addressDurationMonths: string;
  
  // Step 8: Previous Addresses (dynamic - can be multiple)
  previousAddresses: Array<{
    address: string;
    housingSituation: "private-tenant" | "home-owner" | "council-tenant" | "living-with-parents" | "";
    durationYears: string;
    durationMonths: string;
  }>;
  
  // Step 9/8: Employment Status
  employmentStatus: "full-time" | "part-time" | "self-employed" | "retired" | "other" | "";
  
  // Step 10/9: Job Details
  jobTitle: string;
  companyName: string;
  
  // Step 11/10: Employment Duration
  employmentDurationYears: string;
  employmentDurationMonths: string;
  
  // Step 12/11: Monthly Income
  monthlyIncome: string;
  
  // Step 13/12: Loan Amount
  loanAmount: string;
  
  // Step 14/13: Personal Details
  title: "Mr" | "Mrs" | "Miss" | "Ms" | "";
  firstName: string;
  lastName: string;
  
  // Step 15/14: Contact Details
  email: string;
  phoneNumber: string;
  termsAccepted: boolean;
}

// Step Components (defined before main component to avoid temporal dead zone issues)
const EmploymentStep = ({ formData, updateFormData, onNext }: { 
  formData: FormData; 
  updateFormData: (updates: Partial<FormData>) => void;
  onNext?: () => void;
}) => {
  const handleSelection = (employmentStatus: string) => {
    updateFormData({ employmentStatus: employmentStatus as any });
  };

  return (
    <div>
      <h1 className="text-[38px] font-bold text-gray-900 mb-12">
        What is your employment status?
      </h1>
      
      <div className="flex flex-col items-center gap-4 max-w-3xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
          {[
            { value: "full-time", label: "Full-Time Employment" },
            { value: "self-employed", label: "Self-Employed" },
            { value: "part-time", label: "Part-Time Employment" },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelection(option.value)}
              className={`px-10 py-5 rounded-2xl border-2 text-lg font-medium transition-all ${
                formData.employmentStatus === option.value 
                  ? 'bg-[#c8f5cd] border-[#4a5f4c] text-foreground' 
                  : 'bg-background border-border text-foreground hover:border-foreground/30'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
          {[
            { value: "retired", label: "Retired" },
            { value: "education", label: "Education" },
            { value: "career", label: "Career" },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelection(option.value)}
              className={`px-10 py-5 rounded-2xl border-2 text-lg font-medium transition-all ${
                formData.employmentStatus === option.value 
                  ? 'bg-[#c8f5cd] border-[#4a5f4c] text-foreground' 
                  : 'bg-background border-border text-foreground hover:border-foreground/30'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
          {[
            { value: "benefits", label: "Benefits" },
            { value: "temporary", label: "Temporary/Contract" },
            { value: "homemaker", label: "Homemaker" },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelection(option.value)}
              className={`px-10 py-5 rounded-2xl border-2 text-lg font-medium transition-all ${
                formData.employmentStatus === option.value 
                  ? 'bg-[#c8f5cd] border-[#4a5f4c] text-foreground' 
                  : 'bg-background border-border text-foreground hover:border-foreground/30'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
          {[
            { value: "armed-services", label: "Armed Services" },
            { value: "other", label: "Other" },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelection(option.value)}
              className={`px-10 py-5 rounded-2xl border-2 text-lg font-medium transition-all ${
                formData.employmentStatus === option.value 
                  ? 'bg-[#c8f5cd] border-[#4a5f4c] text-foreground' 
                  : 'bg-background border-border text-foreground hover:border-foreground/30'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const JobDetailsStep = ({ formData, updateFormData }: { formData: FormData; updateFormData: (updates: Partial<FormData>) => void }) => (
  <div>
    <h1 className="text-[38px] font-bold text-gray-900 mb-6">
      Great! What's your current job title?
    </h1>
    
    <p className="text-gray-600 text-base mb-12">
      (We won't contact your employer)
    </p>
    
    <div className="max-w-2xl mx-auto space-y-6">
      <input
        type="text"
        placeholder="Your job title"
        value={formData.jobTitle}
        onChange={(e) => updateFormData({ jobTitle: e.target.value })}
        className="address-input"
      />
      
      <input
        type="text"
        placeholder="Which company do you work for?"
        value={formData.companyName}
        onChange={(e) => updateFormData({ companyName: e.target.value })}
        className="address-input"
      />
    </div>
  </div>
);

const EmploymentDurationStep = ({ formData, updateFormData }: { formData: FormData; updateFormData: (updates: Partial<FormData>) => void }) => (
  <div>
    <h1 className="text-[38px] font-bold text-gray-900 mb-12">
      How long have you worked at {formData.companyName}?
    </h1>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
      <div>
        <input
          type="number"
          placeholder="Year"
          value={formData.employmentDurationYears}
          onChange={(e) => updateFormData({ employmentDurationYears: e.target.value })}
          className="address-input"
          min="0"
          max="99"
        />
      </div>
      <div>
        <input
          type="number"
          placeholder="Month"
          value={formData.employmentDurationMonths}
          onChange={(e) => updateFormData({ employmentDurationMonths: e.target.value })}
          className="address-input"
          min="0"
          max="11"
        />
      </div>
    </div>
  </div>
);

const MonthlyIncomeStep = ({ formData, updateFormData }: { formData: FormData; updateFormData: (updates: Partial<FormData>) => void }) => {
  const income = parseFloat(formData.monthlyIncome) || 0;
  const showWarning = income > 10000;
  
  return (
    <div>
      <h1 className="text-[38px] font-bold text-gray-900 mb-12">
        Roughly, how much do you earn each month?
      </h1>
      
      <div className="max-w-2xl mx-auto mb-8">
        <div className="relative">
          <input
            type="number"
            placeholder="Enter Amount"
            value={formData.monthlyIncome}
            onChange={(e) => updateFormData({ monthlyIncome: e.target.value })}
            className="address-input pr-12"
            min="0"
          />
          <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground text-base">$</span>
        </div>
      </div>
      
      {showWarning && (
        <p className="text-red-500 text-center mb-8">
          This looks quite high. Please enter the monthly income you take home after tax.
        </p>
      )}
    </div>
  );
};

const LoanAmountStep = ({ formData, updateFormData }: { formData: FormData; updateFormData: (updates: Partial<FormData>) => void }) => (
  <div>
    <h1 className="text-[38px] font-bold text-gray-900 mb-12">
      Roughly how much would you like to borrow?
    </h1>
    
    <div className="max-w-2xl mx-auto">
      <div className="relative">
        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground text-base">$</span>
        <input
          type="number"
          placeholder="Enter Amount"
          value={formData.loanAmount}
          onChange={(e) => updateFormData({ loanAmount: e.target.value })}
          className="address-input pl-12"
          min="0"
        />
      </div>
    </div>
  </div>
);

const PersonalDetailsStep = ({ formData, updateFormData, onNext }: { 
  formData: FormData; 
  updateFormData: (updates: Partial<FormData>) => void;
  onNext?: () => void;
}) => {
  const handleTitleSelection = (title: string) => {
    updateFormData({ title: title as any });
  };

  return (
    <div>
      <h1 className="text-[38px] font-bold text-gray-900 mb-12">
        Almost done, let us know who you are?
      </h1>
      
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center justify-center gap-8">
          <p className="text-gray-900 font-normal text-base">Your title</p>
          <div className="flex gap-4">
            {[
              { value: "Mr", label: "Mr" },
              { value: "Mrs", label: "Mrs" },
              { value: "Miss", label: "Miss" },
              { value: "Ms", label: "Ms" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleTitleSelection(option.value)}
                className={`w-16 h-16 rounded-full border-2 text-base font-normal transition-all ${
                  formData.title === option.value 
                    ? 'bg-gray-900 border-gray-900 text-white' 
                    : 'bg-white border-gray-300 text-gray-900 hover:border-gray-400'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="space-y-4">
          <input
            type="text"
            placeholder="First name"
            value={formData.firstName}
            onChange={(e) => updateFormData({ firstName: e.target.value })}
            className="address-input"
          />
          
          <input
            type="text"
            placeholder="Last name"
            value={formData.lastName}
            onChange={(e) => updateFormData({ lastName: e.target.value })}
            className="address-input"
          />
        </div>
      </div>
    </div>
  );
};

const ContactDetailsStep = ({ formData, updateFormData }: { formData: FormData; updateFormData: (updates: Partial<FormData>) => void }) => (
  <div>
    <h1 className="text-[38px] font-bold text-gray-900 mb-12">
      Finally, how should we contact you?
    </h1>
    
    <div className="max-w-2xl mx-auto space-y-6">
      <input
        type="email"
        placeholder="Email address"
        value={formData.email}
        onChange={(e) => updateFormData({ email: e.target.value })}
        className="address-input"
      />
      
      <input
        type="tel"
        placeholder="Phone number"
        value={formData.phoneNumber}
        onChange={(e) => updateFormData({ phoneNumber: e.target.value })}
        className="address-input"
      />
      
      <div className="flex items-start gap-3 pt-8">
        <input
          type="checkbox"
          id="terms"
          checked={formData.termsAccepted}
          onChange={(e) => updateFormData({ termsAccepted: e.target.checked })}
          className="mt-1"
        />
        <label htmlFor="terms" className="text-muted-foreground text-left">
          I have read and agree to the{" "}
          <a href="#" className="text-primary hover:underline">
            terms and conditions
          </a>
        </label>
      </div>
    </div>
    
    <div className="mt-12 max-w-2xl mx-auto">
      <p className="text-muted-foreground text-sm text-center">
        The personal information we have collected from you will be shared with fraud prevention agencies who will use it to prevent fraud and money laundering and to verify your identity. If fraud is detected, you could be refused finance{" "}
        <a href="https://carfinanced.co.uk/privacy?_gl=1*1cbkk17*_ga*MTIwNDU0ODg5Ni4xNzU3Njc4ODIx*_ga_6ZQ951WRXK*czE3NTc3MDAzMzckbzMkZzEkdDE3NTc3MDQ4NjgkajU4JGwwJGgw" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
          privacy-policy
        </a>.
      </p>
    </div>
  </div>
);

const CarFinanceApplication = () => {
  const navigate = useNavigate();
  const { stepNumber } = useParams();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [utmParams, setUtmParams] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<FormData>({
    vehicleType: "",
    hasFullLicence: null,
    licenceType: "",
    maritalStatus: "",
    dateOfBirth: "",
    address: "",
    fullAddress: {
      line1: "",
      city: "",
      postcode: "",
    },
    housingSituation: "",
    addressDurationYears: "",
    addressDurationMonths: "",
    previousAddresses: [],
    employmentStatus: "",
    jobTitle: "",
    companyName: "",
    employmentDurationYears: "",
    employmentDurationMonths: "",
    monthlyIncome: "",
    loanAmount: "",
    title: "",
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    termsAccepted: false,
  });

  const { toast } = useToast();

  // Capture UTM parameters on component mount - ENHANCED VERSION
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const utmData: Record<string, string> = {};
    
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'].forEach(param => {
      const value = urlParams.get(param);
      if (value) {
        utmData[param] = value;
      }
    });
    
    console.log('🔗 Captured UTM parameters from URL:', utmData);
    setUtmParams(utmData);
  }, []);

  // Step to slug mapping - DYNAMIC based on address history
  const getStepSlug = (step: number): string => {
    // Base steps that are always the same
    const baseSteps: Record<number, string> = {
      1: 'vehicle-type',
      2: 'driving-licence',
      3: 'marital-status',
      4: 'date-of-birth',
      5: 'address1',
      6: 'housing-situation1',
      7: 'address-duration1',
    };

    // Check if this step is employment or beyond
    const employmentStartStep = getEmploymentStep();
    
    if (step >= employmentStartStep) {
      // This is employment section
      const employmentSteps: Record<number, string> = {
        [employmentStartStep]: 'employment',
        [employmentStartStep + 1]: 'job-details',
        [employmentStartStep + 2]: 'employment-duration',
        [employmentStartStep + 3]: 'monthly-income',
        [employmentStartStep + 4]: 'loan-amount',
        [employmentStartStep + 5]: 'personal-details',
        [employmentStartStep + 6]: 'contact-details',
      };
      return employmentSteps[step] || `step-${step}`;
    }

    // This is address section - build dynamically
    if (step > 7) {
      const addressIndex = Math.floor((step - 8) / 3) + 1; // Which address (1, 2, 3, 4, 5)
      const stepType = (step - 8) % 3; // 0=address, 1=housing, 2=duration
      
      const stepTypes = ['address', 'housing-situation', 'address-duration'];
      return `${stepTypes[stepType]}${addressIndex + 1}`;
    }

    return baseSteps[step] || `step-${step}`;
  };

  const getStepFromSlug = (slug: string): number => {
    // Base slugs that are always the same
    const baseSlugToStep: Record<string, number> = {
      'vehicle-type': 1,
      'driving-licence': 2,
      'marital-status': 3,
      'date-of-birth': 4,
      'address1': 5,
      'housing-situation1': 6,
      'address-duration1': 7,
    };

    // Check for employment slugs first
    const employmentStartStep = getEmploymentStep();
    const employmentSlugs: Record<string, number> = {
      'employment': employmentStartStep,
      'job-details': employmentStartStep + 1,
      'employment-duration': employmentStartStep + 2,
      'monthly-income': employmentStartStep + 3,
      'loan-amount': employmentStartStep + 4,
      'personal-details': employmentStartStep + 5,
      'contact-details': employmentStartStep + 6,
    };

    // Check employment slugs first
    if (employmentSlugs[slug]) {
      console.log('🔧 getStepFromSlug:', slug, 'employmentStartStep:', employmentStartStep, 'result:', employmentSlugs[slug]);
      return employmentSlugs[slug];
    }

    // Check base steps
    if (baseSlugToStep[slug]) {
      console.log('🔧 getStepFromSlug:', slug, 'employmentStartStep:', employmentStartStep, 'result:', baseSlugToStep[slug]);
      return baseSlugToStep[slug];
    }

    // Handle dynamic address slugs (address2, housing-situation2, etc.)
    const addressMatch = slug.match(/^(address|housing-situation|address-duration)(\d+)$/);
    if (addressMatch) {
      const stepType = addressMatch[1];
      const addressNum = parseInt(addressMatch[2]);
      
      if (addressNum === 1) {
        // These should be handled by baseSlugToStep above, but just in case
        const stepMap = { 'address': 5, 'housing-situation': 6, 'address-duration': 7 };
        return stepMap[stepType as keyof typeof stepMap] || 1;
      } else {
        // For address2+, calculate step number
        const addressIndex = addressNum - 2; // address2 = index 0, address3 = index 1, etc.
        const stepTypeMap = { 'address': 0, 'housing-situation': 1, 'address-duration': 2 };
        const stepNum = 8 + (addressIndex * 3) + (stepTypeMap[stepType as keyof typeof stepTypeMap] || 0);
        
        console.log('🔧 getStepFromSlug:', slug, 'employmentStartStep:', employmentStartStep, 'result:', stepNum);
        return stepNum;
      }
    }

    console.log('🔧 getStepFromSlug:', slug, 'employmentStartStep:', employmentStartStep, 'result: 1 (fallback)');
    return 1;
  };

  // Handle step URL routing
  useEffect(() => {
    const path = location.pathname;
    console.log('🔧 URL routing effect triggered - path:', path, 'previousAddresses.length:', formData.previousAddresses.length);
    
    if (path === '/thankyou') {
      setIsSubmitted(true);
    } else if (path !== '/' && path !== '') {
      const slug = path.replace('/', '');
      console.log('🔧 Processing slug:', slug);
      
      const stepNum = getStepFromSlug(slug);
      console.log('🔧 getStepFromSlug returned:', stepNum, 'for slug:', slug);
      
      if (stepNum >= 1) {
        console.log('🔧 URL routing: Setting currentStep to', stepNum, 'from slug', slug);
        setCurrentStep(stepNum);
      } else {
        console.log('🔧 Invalid step number, redirecting to step 1');
        setCurrentStep(1);
      }
    } else {
      setCurrentStep(1);
    }
  }, [location.pathname, formData.previousAddresses.length]);

  // Handle initial navigation to first step - ENHANCED UTM PRESERVATION
  useEffect(() => {
    if (location.pathname === '/' && currentStep === 1) {
      // Get UTM parameters from current URL first, then fall back to captured ones
      const currentUrlParams = new URLSearchParams(window.location.search);
      const hasCurrentUtmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid']
        .some(param => currentUrlParams.has(param));
      
      let utmString = '';
      if (hasCurrentUtmParams) {
        // Use current URL parameters if they exist (fresh page load)
        utmString = currentUrlParams.toString();
        console.log('🔗 Using current URL UTM parameters for initial redirect:', utmString);
      } else if (Object.keys(utmParams).length > 0) {
        // Use captured UTM parameters
        utmString = new URLSearchParams(utmParams).toString();
        console.log('🔗 Using captured UTM parameters for initial redirect:', utmString);
      }
      
      const redirectUrl = `/vehicle-type${utmString ? `?${utmString}` : ''}`;
      console.log('🔗 Initial redirect to:', redirectUrl);
      navigate(redirectUrl, { replace: true });
    }
  }, [navigate, location.pathname, currentStep, utmParams]);

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  // ENHANCED navigateToStep with UTM preservation
  const navigateToStep = (step: number) => {
    console.log('🚀 navigateToStep called with step:', step);
    
    // Always check current URL first for UTM parameters
    const currentUrlParams = new URLSearchParams(window.location.search);
    const hasCurrentUtmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid']
      .some(param => currentUrlParams.has(param));
    
    let finalUtmParams: Record<string, string> = {};
    
    if (hasCurrentUtmParams) {
      // Use current URL parameters (most reliable)
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'].forEach(param => {
        const value = currentUrlParams.get(param);
        if (value) {
          finalUtmParams[param] = value;
        }
      });
      console.log('🔗 Using current URL UTM parameters for navigation:', finalUtmParams);
    } else {
      // Fall back to stored UTM parameters
      finalUtmParams = utmParams;
      console.log('🔗 Using stored UTM parameters for navigation:', finalUtmParams);
    }
    
    if (step === getTotalSteps() + 1) {
      // Navigate to thank you page
      const utmString = new URLSearchParams(finalUtmParams).toString();
      const url = `/thankyou${utmString ? `?${utmString}` : ''}`;
      console.log('🚀 Navigating to thank you page:', url);
      navigate(url);
    } else {
      // Navigate to specific step with UTM parameters
      const stepSlug = getStepSlug(step);
      const utmString = new URLSearchParams(finalUtmParams).toString();
      const url = `/${stepSlug}${utmString ? `?${utmString}` : ''}`;
      console.log('🚀 Navigating to step slug:', stepSlug, 'URL:', url);
      navigate(url);
    }
  };

  // Calculate if user needs more address history (less than 3 years total)
  const getTotalAddressTime = () => {
    // Current address time (first address)
    const currentYears = parseInt(formData.addressDurationYears) || 0;
    const currentMonths = parseInt(formData.addressDurationMonths) || 0;
    let totalMonths = (currentYears * 12) + currentMonths;
    
    // Add previous addresses time
    formData.previousAddresses.forEach(addr => {
      const years = parseInt(addr.durationYears) || 0;
      const months = parseInt(addr.durationMonths) || 0;
      totalMonths += (years * 12) + months;
    });
    
    return totalMonths;
  };

  const needsMoreAddressHistory = () => {
    const totalTime = getTotalAddressTime();
    const hasMaxAddresses = formData.previousAddresses.length >= 4; // Maximum 4 previous addresses (5 total including current)
    return totalTime < 36 && !hasMaxAddresses; // Less than 3 years (36 months) AND haven't reached max addresses
  };
  
  // Get the step number for the employment section based on current form state
  const getEmploymentStep = () => {
    // Calculate total address time to determine if we need more addresses
    const totalAddressTime = getTotalAddressTime();
    const baseSteps = 7; // Steps 1-7 (vehicle type through address duration 1)
    
    console.log('📊 getEmploymentStep calculation:', {
      totalAddressTime,
      previousAddressesLength: formData.previousAddresses.length,
      hasEnoughTime: totalAddressTime >= 36,
      hasMaxAddresses: formData.previousAddresses.length >= 4
    });
    
    // If we have enough time (36+ months) OR reached max addresses, go to employment
    if (totalAddressTime >= 36 || formData.previousAddresses.length >= 4) {
      // Employment starts right after the last address step we actually need
      const neededPreviousAddresses = Math.min(formData.previousAddresses.length, 4); // Max 4 previous addresses
      const employmentStep = baseSteps + 1 + (neededPreviousAddresses * 3); // +1 to skip to employment
      
      console.log('📊 Employment starts at step:', employmentStep, 'with', neededPreviousAddresses, 'previous addresses');
      return employmentStep;
    }
    
    // Otherwise, we still need more addresses - this shouldn't be called when we need more addresses
    console.log('⚠️ getEmploymentStep called but still need more addresses');
    return baseSteps + 1 + ((formData.previousAddresses.length + 1) * 3);
  };

  // Calculate total steps dynamically 
  const getTotalSteps = () => {
    const employmentStartStep = getEmploymentStep();
    return employmentStartStep + 6; // employment + 6 more steps to completion
  };

  const nextStep = async () => {
    console.log('🔧 nextStep called - currentStep:', currentStep, 'totalSteps:', getTotalSteps());
    console.log('🔧 Current URL:', location.pathname);
    
    // Validate current step
    if (currentStep === 1 && !formData.vehicleType) {
      toast({ title: "Please select a vehicle type", variant: "destructive" });
      return;
    }
    if (currentStep === 2 && formData.hasFullLicence === null) {
      toast({ title: "Please answer the licence question", variant: "destructive" });
      return;
    }
    if (currentStep === 2 && formData.hasFullLicence === false && !formData.licenceType) {
      toast({ title: "Please select your licence type", variant: "destructive" });
      return;
    }
    if (currentStep === 3 && !formData.maritalStatus) {
      toast({ title: "Please select your marital status", variant: "destructive" });
      return;
    }
    if (currentStep === 4 && !formData.dateOfBirth) {
      toast({ title: "Please enter your date of birth", variant: "destructive" });
      return;
    }
    // Enhanced 18+ age validation
    if (currentStep === 4 && formData.dateOfBirth) {
      const selectedDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = Math.floor((today.getTime() - selectedDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      
      if (age < 18) {
        toast({ title: "You must be 18 or older to apply for vehicle finance", variant: "destructive" });
        return;
      }
    }
    if (currentStep === 5 && !formData.address) {
      toast({ title: "Please enter your address", variant: "destructive" });
      return;
    }
    if (currentStep === 6 && !formData.housingSituation) {
      toast({ title: "Please select your housing situation", variant: "destructive" });
      return;
    }
    if (currentStep === 7 && (!formData.addressDurationYears || !formData.addressDurationMonths)) {
      toast({ title: "Please enter how long you've lived at this address", variant: "destructive" });
      return;
    }
    
    // Dynamic validation for previous addresses
    for (let i = 0; i < formData.previousAddresses.length; i++) {
      const baseStep = 8 + (i * 3);
      if (currentStep === baseStep && !formData.previousAddresses[i].address) {
        toast({ title: "Please enter your previous address", variant: "destructive" });
        return;
      }
      if (currentStep === baseStep + 1 && !formData.previousAddresses[i].housingSituation) {
        toast({ title: "Please select your previous housing situation", variant: "destructive" });
        return;
      }
      if (currentStep === baseStep + 2 && !formData.previousAddresses[i].durationYears) {
        toast({ title: "Please enter how long you lived at your previous address (years required)", variant: "destructive" });
        return;
      }
    }
    
    // Employment and final steps validation
    const employmentStartStep = getEmploymentStep();
    console.log('Current step:', currentStep, 'Employment start step:', employmentStartStep);
    console.log('Form data employment duration:', {
      years: formData.employmentDurationYears,
      months: formData.employmentDurationMonths,
      yearsTruthy: !!formData.employmentDurationYears,
      monthsTruthy: !!formData.employmentDurationMonths
    });
    
    if (currentStep === employmentStartStep && !formData.employmentStatus) {
      toast({ title: "Please select your employment status", variant: "destructive" });
      return;
    }
    if (currentStep === employmentStartStep + 1 && (!formData.jobTitle || !formData.companyName)) {
      toast({ title: "Please enter your job title and company name", variant: "destructive" });
      return;
    }
    if (currentStep === employmentStartStep + 2 && (!formData.employmentDurationYears && !formData.employmentDurationMonths)) {
      console.log('Employment duration validation failed:', {
        years: formData.employmentDurationYears,
        months: formData.employmentDurationMonths
      });
      toast({ title: "Please enter how long you've worked at this company", variant: "destructive" });
      return;
    }
    if (currentStep === employmentStartStep + 3 && !formData.monthlyIncome) {
      toast({ title: "Please enter your monthly income", variant: "destructive" });
      return;
    }
    if (currentStep === employmentStartStep + 4 && !formData.loanAmount) {
      toast({ title: "Please enter how much you'd like to borrow", variant: "destructive" });
      return;
    }
    if (currentStep === employmentStartStep + 5 && (!formData.title || !formData.firstName || !formData.lastName)) {
      toast({ title: "Please enter your personal details", variant: "destructive" });
      return;
    }
    if (currentStep === employmentStartStep + 6 && (!formData.email || !formData.phoneNumber || !formData.termsAccepted)) {
      toast({ title: "Please complete all contact details and accept terms", variant: "destructive" });
      return;
    }

    if (currentStep < getTotalSteps()) {
      console.log('🔧 Processing step progression...');
      
      // Handle step progression logic
      let nextStepNumber = currentStep + 1;
      console.log('🔧 Default nextStepNumber:', nextStepNumber);
      
    // Handle step progression for address flow - DYNAMIC detection
    const employmentStartStep = getEmploymentStep();
    const isAddressDurationStep = currentStep === 7 || (currentStep > 7 && currentStep < employmentStartStep && (currentStep - 7) % 3 === 0);
    
    if (isAddressDurationStep && (currentStep === 7 || formData.previousAddresses.length > 0)) {
        console.log('🔧 After address duration step');
        console.log('🔧 Current total address time (months):', getTotalAddressTime());
        console.log('🔧 Needs more address history:', needsMoreAddressHistory());
        console.log('🔧 Current previousAddresses:', formData.previousAddresses.length);
        
        // Recalculate total time after user input
        const totalTime = getTotalAddressTime();
        const hasEnoughHistory = totalTime >= 36; // 3 years = 36 months
        const hasMaxAddresses = formData.previousAddresses.length >= 4; // Maximum 4 previous addresses
        
        // Check if more address history is needed
        if (!hasEnoughHistory && !hasMaxAddresses) {
          console.log('🔧 Needs more address history - adding previous address');
          
          // Add a new previous address entry if needed
          if (currentStep === 7 || 
              (currentStep > 7 && formData.previousAddresses.length === Math.floor((currentStep - 7) / 3))) {
            const newPreviousAddress = {
              address: "",
              housingSituation: "" as const,
              durationYears: "",
              durationMonths: "",
            };
            
            setFormData(prev => ({ 
              ...prev, 
              previousAddresses: [...prev.previousAddresses, newPreviousAddress] 
            }));
          }
          
          // Navigate to next address step
          nextStepNumber = currentStep + 1;
        } else {
          console.log('🔧 No more address history needed - going to employment');
          console.log('🔧 Total address time:', totalTime, 'months (>=36 needed)');
          console.log('🔧 Has enough history:', hasEnoughHistory);
          console.log('🔧 Has max addresses:', hasMaxAddresses);
          nextStepNumber = getEmploymentStep();
          console.log('🔧 Going to employment step:', nextStepNumber);
        }
      } else {
        console.log('🔧 Regular step progression');
      }
      
      console.log('🔧 Final nextStepNumber:', nextStepNumber);
      console.log('🔧 About to call navigateToStep...');
      navigateToStep(nextStepNumber);
      console.log('🔧 navigateToStep called!');
    } else {
      console.log('🔧 ===== FINAL STEP REACHED - SUBMITTING FORM =====');
      console.log('🔧 Current step:', currentStep, 'Total steps:', getTotalSteps());
      
      try {
        // Submit form and show thank you page
        const response = await submitFormData();
        console.log('🎉 Form submission completed successfully, navigating to thank you page...');
        navigateToStep(getTotalSteps() + 1);
      } catch (error) {
        console.error('❌ Form submission failed:', error);
      }
    }
  };

  const prevStep = () => {
    console.log('⬅️ prevStep called - currentStep:', currentStep);
    
    if (currentStep > 1) {
      // Handle special case: going back from employment to last address step
      const employmentStartStep = getEmploymentStep();
      if (currentStep === employmentStartStep && formData.previousAddresses.length > 0) {
        // Go back to the last address duration step
        const lastAddressDurationStep = 7 + (formData.previousAddresses.length * 3);
        console.log('🔧 Going back from employment to last address duration step:', lastAddressDurationStep);
        navigateToStep(lastAddressDurationStep);
      } else {
        navigateToStep(currentStep - 1);
      }
    }
  };

  // ENHANCED submitFormData with UTM preservation
  const submitFormData = async () => {
    console.log('🚀 ===== FINAL FORM SUBMISSION STARTED =====');
    console.log('📊 Complete Form Data:', JSON.stringify(formData, null, 2));
    
    // Enhanced UTM parameter handling - prioritize current URL params
    const currentUrlParams = new URLSearchParams(window.location.search);
    const hasCurrentUtmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid']
      .some(param => currentUrlParams.has(param));
    
    let finalUtmParams: Record<string, string> = {};
    
    if (hasCurrentUtmParams) {
      // Use current URL parameters (most reliable for submission)
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'].forEach(param => {
        const value = currentUrlParams.get(param);
        if (value) {
          finalUtmParams[param] = value;
        }
      });
      console.log('🔗 Final UTM parameters from current URL for submission:', finalUtmParams);
    } else {
      // Use stored UTM parameters
      finalUtmParams = utmParams;
      console.log('🔗 Final UTM parameters from storage for submission:', finalUtmParams);
    }
    
    console.log('🏷️ FINAL UTM Parameters being sent to AutoConvert:', JSON.stringify(finalUtmParams, null, 2));
    
    try {
      // Prepare form data with final UTM parameters
      const submissionData = {
        ...formData,
        utmParams: finalUtmParams,
        submissionTime: new Date().toISOString(),
        referrer: document.referrer,
      };

      console.log('📦 Prepared Submission Data with Enhanced UTM:', JSON.stringify(submissionData, null, 2));

      // Submit to AutoConvert API with enhanced UTM parameters
      console.log('📤 Sending complete form data to AutoConvert API...');
      console.log('🔗 API URL: https://api.autoconvert.co.uk/application/submit');
      console.log('🔗 ENHANCED UTM parameters being sent to AutoConvert:', finalUtmParams);
      
      const autoConvertResponse = await submitToAutoConvert(formData, finalUtmParams as UTMParams);
      
      console.log('✅ ===== AUTOCONVERT SUBMISSION SUCCESSFUL =====');
      console.log('📨 AutoConvert Response:', JSON.stringify(autoConvertResponse, null, 2));

      toast({ 
        title: "Application submitted successfully!", 
        description: "Your application has been processed and sent to AutoConvert."
      });

      return autoConvertResponse;

    } catch (error) {
      console.error('❌ ===== FORM SUBMISSION FAILED =====');
      console.error('💥 Error Details:', error);
      console.error('📋 Error Message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('🔍 Stack Trace:', error instanceof Error ? error.stack : 'No stack trace');
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      toast({ 
        title: "Submission failed", 
        description: `Please check all fields are complete. Error: ${errorMessage}`,
        variant: "destructive" 
      });
      throw error;
    }
  };

  const progressPercentage = (currentStep / getTotalSteps()) * 100;

  if (isSubmitted || location.pathname === '/thankyou') {
    return <ThankYouPage formData={formData} utmParams={utmParams} />;
  }

  return (
    <div className="min-h-screen bg-white relative overflow-x-hidden">
      {/* Header with Wave Bottom */}
      <div style={{ background: "#FF585E", position: "relative", paddingBottom: "75px" }}>
        {/* Confetti Decorations */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-8 left-[5%] w-3 h-8 bg-blue-400 rotate-45 rounded-sm"></div>
          <div className="absolute top-12 left-[15%] w-4 h-4 bg-yellow-300 rotate-12 rounded-sm"></div>
          <div className="absolute top-6 left-[25%] w-2 h-6 bg-green-400 -rotate-12 rounded-sm"></div>
          <div className="absolute top-16 left-[35%] w-3 h-3 bg-purple-400 rotate-45 rounded-sm"></div>
          <div className="absolute top-10 left-[45%] w-2 h-8 bg-pink-300 -rotate-45 rounded-sm"></div>
          <div className="absolute top-14 left-[55%] w-4 h-4 bg-orange-400 rotate-12 rounded-sm"></div>
          <div className="absolute top-8 left-[65%] w-3 h-6 bg-cyan-400 -rotate-12 rounded-sm"></div>
          <div className="absolute top-12 left-[75%] w-2 h-4 bg-red-400 rotate-45 rounded-sm"></div>
          <div className="absolute top-6 left-[85%] w-4 h-8 bg-indigo-400 -rotate-45 rounded-sm"></div>
          <div className="absolute top-16 left-[95%] w-2 h-3 bg-lime-400 rotate-12 rounded-sm"></div>
          
          {/* Additional confetti for density */}
          <div className="absolute top-4 left-[10%] w-2 h-4 bg-yellow-400 rotate-45 rounded-sm"></div>
          <div className="absolute top-18 left-[20%] w-3 h-3 bg-blue-300 -rotate-12 rounded-sm"></div>
          <div className="absolute top-7 left-[40%] w-2 h-5 bg-green-300 rotate-12 rounded-sm"></div>
          <div className="absolute top-15 left-[60%] w-4 h-3 bg-pink-400 -rotate-45 rounded-sm"></div>
          <div className="absolute top-5 left-[80%] w-2 h-6 bg-purple-300 rotate-45 rounded-sm"></div>
          <div className="absolute top-11 left-[90%] w-3 h-4 bg-orange-300 -rotate-12 rounded-sm"></div>
        </div>

        {/* Logo Centered */}
        <div className="relative z-10 pt-4 sm:pt-6 pb-2 sm:pb-3 px-4 sm:px-6 text-center">
          <a href="https://carfinanced.co.uk/" target="_blank" rel="noopener noreferrer" className="inline-block">
            <img 
              src={carfinancedHeaderLogo} 
              alt="Car Financed Logo" 
              className="h-7 sm:h-8 md:h-10"
            />
          </a>
        </div>

        {/* Trustpilot Stars */}
        <div className="relative z-10 pb-5 sm:pb-7 px-4 sm:px-6 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg" className="sm:w-6 sm:h-6">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
          </svg>
          <span className="text-white font-semibold text-sm sm:text-base">Trustpilot</span>
          <div className="flex gap-0.5 sm:gap-1 ml-1 sm:ml-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-4 h-4 sm:w-5 sm:h-5 bg-[#00B67A] flex items-center justify-center">
                <svg width="11" height="11" viewBox="0 0 20 20" fill="white" xmlns="http://www.w3.org/2000/svg" className="sm:w-3.5 sm:h-3.5">
                  <path d="M10 2L12.09 6.26L17 6.77L13.5 10.14L14.18 15.02L10 12.77L5.82 15.02L6.5 10.14L3 6.77L7.91 6.26L10 2Z"/>
                </svg>
              </div>
            ))}
          </div>
          <span className="text-white text-xs sm:text-sm ml-0.5 sm:ml-1">Based on <span className="underline font-semibold">456 reviews</span></span>
        </div>

        {/* Wave at bottom with white fill and yellow progress line - more pronounced arch */}
        <svg
          viewBox="0 0 1440 150"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          style={{
            position: "absolute",
            bottom: "-2px",
            left: "0",
            width: "100%",
            height: "90px",
          }}
        >
          {/* White background curve - deeper arch */}
          <path
            d="M 0,150 L 0,100 Q 720,20 1440,100 L 1440,150 Z"
            fill="#ffffff"
          />
          
          {/* Yellow progress line along the curve */}
          <path
            d="M 0,100 Q 720,20 1440,100"
            fill="none"
            stroke="#FFD700"
            strokeWidth="5"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            style={{
              strokeDasharray: "2880",
              strokeDashoffset: 2880 - (2880 * (currentStep / getTotalSteps())),
              transition: "stroke-dashoffset 0.3s ease-in-out"
            }}
          />
        </svg>
      </div>

      {/* Main Content with White Background */}
      <main className="bg-white pt-4 pb-8 min-h-screen -mt-2 flex flex-col">
        <div className="max-w-3xl mx-auto px-6 w-full flex-grow flex flex-col">

          {/* Step Content */}
          <div className="form-container flex-grow flex flex-col">

            {/* Step Components - Only render the current step */}
            <div className="text-center flex-grow">
              {/* Base Steps 1-7 */}
              {currentStep === 1 && <VehicleTypeStep formData={formData} updateFormData={updateFormData} onNext={() => navigateToStep(currentStep + 1)} />}
              {currentStep === 2 && <DrivingLicenceStep formData={formData} updateFormData={updateFormData} onNext={() => navigateToStep(currentStep + 1)} />}
              {currentStep === 3 && <MaritalStatusStep formData={formData} updateFormData={updateFormData} onNext={() => navigateToStep(currentStep + 1)} />}
              {currentStep === 4 && <DateOfBirthStep formData={formData} updateFormData={updateFormData} />}
              {currentStep === 5 && <AddressStep formData={formData} updateFormData={updateFormData} />}
              {currentStep === 6 && <HousingSituationStep formData={formData} updateFormData={updateFormData} onNext={() => navigateToStep(currentStep + 1)} />}
              {currentStep === 7 && <AddressDurationStep formData={formData} updateFormData={updateFormData} />}
              
              {/* Previous Address Steps 8-19 (only if needed) */}
              {currentStep === 8 && currentStep < getEmploymentStep() && <PreviousAddressStep formData={formData} updateFormData={updateFormData} addressIndex={0} />}
              {currentStep === 9 && currentStep < getEmploymentStep() && <PreviousHousingSituationStep formData={formData} updateFormData={updateFormData} addressIndex={0} onNext={() => navigateToStep(currentStep + 1)} />}
              {currentStep === 10 && currentStep < getEmploymentStep() && <PreviousAddressDurationStep formData={formData} updateFormData={updateFormData} addressIndex={0} />}
              
              {currentStep === 11 && currentStep < getEmploymentStep() && <PreviousAddressStep formData={formData} updateFormData={updateFormData} addressIndex={1} />}
              {currentStep === 12 && currentStep < getEmploymentStep() && <PreviousHousingSituationStep formData={formData} updateFormData={updateFormData} addressIndex={1} onNext={() => navigateToStep(currentStep + 1)} />}
              {currentStep === 13 && currentStep < getEmploymentStep() && <PreviousAddressDurationStep formData={formData} updateFormData={updateFormData} addressIndex={1} />}
              
              {currentStep === 14 && currentStep < getEmploymentStep() && <PreviousAddressStep formData={formData} updateFormData={updateFormData} addressIndex={2} />}
              {currentStep === 15 && currentStep < getEmploymentStep() && <PreviousHousingSituationStep formData={formData} updateFormData={updateFormData} addressIndex={2} onNext={() => navigateToStep(currentStep + 1)} />}
              {currentStep === 16 && currentStep < getEmploymentStep() && <PreviousAddressDurationStep formData={formData} updateFormData={updateFormData} addressIndex={2} />}
              
              {currentStep === 17 && currentStep < getEmploymentStep() && <PreviousAddressStep formData={formData} updateFormData={updateFormData} addressIndex={3} />}
              {currentStep === 18 && currentStep < getEmploymentStep() && <PreviousHousingSituationStep formData={formData} updateFormData={updateFormData} addressIndex={3} onNext={() => navigateToStep(currentStep + 1)} />}
              {currentStep === 19 && currentStep < getEmploymentStep() && <PreviousAddressDurationStep formData={formData} updateFormData={updateFormData} addressIndex={3} />}
              
              {/* Employment and Final Steps */}
              {(() => {
                const employmentStartStep = getEmploymentStep();
                return (
                  <>
                    {currentStep === employmentStartStep && <EmploymentStep formData={formData} updateFormData={updateFormData} onNext={() => navigateToStep(currentStep + 1)} />}
                    {currentStep === employmentStartStep + 1 && <JobDetailsStep formData={formData} updateFormData={updateFormData} />}
                    {currentStep === employmentStartStep + 2 && <EmploymentDurationStep formData={formData} updateFormData={updateFormData} />}
                    {currentStep === employmentStartStep + 3 && <MonthlyIncomeStep formData={formData} updateFormData={updateFormData} />}
                    {currentStep === employmentStartStep + 4 && <LoanAmountStep formData={formData} updateFormData={updateFormData} />}
                    {currentStep === employmentStartStep + 5 && <PersonalDetailsStep formData={formData} updateFormData={updateFormData} />}
                    {currentStep === employmentStartStep + 6 && <ContactDetailsStep formData={formData} updateFormData={updateFormData} />}
                  </>
                );
              })()}
            </div>

            {/* Navigation - Only show Next button for DOB step (step 4), Back button for all other steps */}
            {currentStep !== 1 && currentStep < getTotalSteps() && (
            <div className="mt-8 pt-6 flex flex-col items-center gap-6 max-w-md mx-auto px-4">
              <div className="flex items-center justify-center gap-4 w-full">
                <button 
                  onClick={prevStep}
                  className="flex-1 max-w-[175px] px-8 py-4 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-full font-semibold transition-colors text-lg"
                >
                  Back
                </button>
                {currentStep === 4 && (
                  <button 
                    onClick={nextStep}
                    className="flex-1 max-w-[175px] px-8 py-4 text-white bg-[#FF6B8A] hover:bg-[#FF5579] rounded-full font-semibold transition-colors text-lg"
                  >
                    Next
                  </button>
                )}
              </div>
              
              <p className="text-gray-600 text-center text-sm">
                By starting your quote you're agreeing to our{" "}
                <a href="https://carfinanced.co.uk/privacy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">privacy policy</a>.
              </p>
          </div>
            )}
            
            {/* Final submit button */}
            {currentStep === getTotalSteps() && (
              <div className="mt-8 pt-6 flex flex-col items-center gap-6 max-w-md mx-auto px-4">
                <div className="flex items-center justify-center gap-4 w-full">
                  <button 
                    onClick={prevStep}
                    className="flex-1 max-w-[175px] px-8 py-4 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-full font-semibold transition-colors text-lg"
                  >
                    Back
                  </button>
                  <button 
                    onClick={nextStep}
                    className="flex-1 max-w-[175px] px-8 py-4 text-white bg-[#FF6B8A] hover:bg-[#FF5579] rounded-full font-semibold transition-colors text-lg"
                  >
                    Submit
                  </button>
                </div>
                
                <p className="text-gray-600 text-center text-sm">
                  By starting your quote you're agreeing to our{" "}
                  <a href="https://carfinanced.co.uk/privacy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">privacy policy</a>.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

// Step Components
const VehicleTypeStep = ({ formData, updateFormData, onNext }: { 
  formData: FormData; 
  updateFormData: (updates: Partial<FormData>) => void;
  onNext: () => void;
}) => {
  const handleSelection = (vehicleType: string) => {
    updateFormData({ vehicleType: vehicleType as any });
  };

  return (
    <div className="py-4">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 px-4" style={{ fontFamily: 'Inter, sans-serif' }}>
        What would you like a finance quote for?
      </h1>
      
      {/* Vehicle Selection Buttons */}
      <div className="flex flex-row justify-center items-stretch gap-4 md:gap-6 max-w-2xl mx-auto mb-32 px-4">
        {[
          { 
            value: "car", 
            label: "Car",
            icon: (
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 28H6V24L10 16H38L42 24V28H38M10 28V32M10 28H38M38 28V32M14 32C14 33.1046 13.1046 34 12 34C10.8954 34 10 33.1046 10 32M14 32C14 30.8954 13.1046 30 12 30C10.8954 30 10 30.8954 10 32M38 32C38 33.1046 37.1046 34 36 34C34.8954 34 34 33.1046 34 32M38 32C38 30.8954 37.1046 30 36 30C34.8954 30 34 30.8954 34 32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )
          },
          { 
            value: "van", 
            label: "Van",
            icon: (
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 28H4V22L8 14H32V28M8 28V32M8 28H32M32 28V14M32 28V32M32 14H40L44 22V28H40M40 28V32M12 32C12 33.1046 11.1046 34 10 34C8.89543 34 8 33.1046 8 32M12 32C12 30.8954 11.1046 30 10 30C8.89543 30 8 30.8954 8 32M36 32C36 33.1046 35.1046 34 34 34C32.8954 34 32 33.1046 32 32M36 32C36 30.8954 35.1046 30 34 30C32.8954 30 32 30.8954 32 32M40 32C40 33.1046 39.1046 34 38 34C36.8954 34 36 33.1046 36 32M40 32C40 30.8954 39.1046 30 38 30C36.8954 30 36 30.8954 36 32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )
          },
          { 
            value: "bike", 
            label: "Bike",
            icon: (
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="32" r="6" stroke="currentColor" strokeWidth="2"/>
                <circle cx="36" cy="32" r="6" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 32L20 16H24L28 20M36 32L28 20M28 20H32M18 12H24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )
          },
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => handleSelection(option.value)}
            className={`
              flex flex-col items-center justify-center gap-3 
              min-w-[120px] sm:min-w-[140px] md:min-w-[160px] 
              aspect-square
              rounded-2xl border-2 
              transition-all duration-200
              ${formData.vehicleType === option.value 
                ? 'bg-[#C8E6C9] border-[#81C784] text-gray-900' 
                : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
              }
            `}
          >
            <div className={formData.vehicleType === option.value ? 'text-gray-900' : 'text-gray-600'}>
              {option.icon}
            </div>
            <span className="text-base font-semibold">{option.label}</span>
          </button>
        ))}
      </div>

      {/* Bottom Navigation */}
      <div className="flex flex-col items-center gap-6 max-w-md mx-auto px-4">
        <div className="flex items-center justify-center gap-4 w-full">
          <button 
            onClick={() => window.location.href = 'https://carfinanced.co.uk/'}
            className="flex-1 max-w-[140px] px-6 py-3 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-full font-semibold transition-colors"
          >
            Back
          </button>
          <button 
            onClick={() => formData.vehicleType && onNext()}
            disabled={!formData.vehicleType}
            className="flex-1 max-w-[140px] px-6 py-3 text-white bg-[#FF6B8A] hover:bg-[#FF5579] disabled:bg-gray-300 disabled:cursor-not-allowed rounded-full font-semibold transition-colors"
          >
            Next
          </button>
        </div>

        <p className="text-gray-600 text-center text-sm">
          By starting your quote you're agreeing to our{" "}
          <a href="https://carfinanced.co.uk/privacy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">privacy policy</a>.
        </p>
      </div>
    </div>
  );
};

const DrivingLicenceStep = ({ formData, updateFormData, onNext }: { 
  formData: FormData; 
  updateFormData: (updates: Partial<FormData>) => void;
  onNext: () => void;
}) => {
  const handleLicenceSelection = (hasFullLicence: boolean) => {
    updateFormData({ hasFullLicence, licenceType: "" });
  };

  const handleLicenceTypeSelection = (licenceType: string) => {
    updateFormData({ licenceType: licenceType as any });
  };

  return (
    <div>
      <h1 className="text-[38px] font-bold text-foreground mb-12">
        Do you have a full UK driving licence?
      </h1>
      
      <div className="flex justify-center gap-6 mb-8">
        <button
          onClick={() => handleLicenceSelection(true)}
          className={`px-16 py-6 rounded-2xl border-2 text-lg font-medium transition-all ${
            formData.hasFullLicence === true 
              ? 'bg-[#c8f5cd] border-[#4a5f4c] text-foreground' 
              : 'bg-background border-border text-foreground hover:border-foreground/30'
          }`}
        >
          Yes
        </button>
        <button
          onClick={() => handleLicenceSelection(false)}
          className={`px-16 py-6 rounded-2xl border-2 text-lg font-medium transition-all ${
            formData.hasFullLicence === false 
              ? 'bg-[#c8f5cd] border-[#4a5f4c] text-foreground' 
              : 'bg-background border-border text-foreground hover:border-foreground/30'
          }`}
        >
          Nope
        </button>
      </div>

      {formData.hasFullLicence === false && (
        <div className="mt-12">
          <h2 className="text-xl font-bold text-foreground mb-8">
            What licence do you have?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {[
              { value: "none", label: "None" },
              { value: "provisional-uk", label: "Provisional UK" },
              { value: "eu", label: "EU" },
              { value: "international", label: "International" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleLicenceTypeSelection(option.value)}
                className={`px-8 py-4 rounded-2xl border-2 text-base font-medium transition-all ${
                  formData.licenceType === option.value 
                    ? 'bg-[#c8f5cd] border-[#4a5f4c] text-foreground' 
                    : 'bg-background border-border text-foreground hover:border-foreground/30'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const MaritalStatusStep = ({ formData, updateFormData, onNext }: { 
  formData: FormData; 
  updateFormData: (updates: Partial<FormData>) => void;
  onNext: () => void;
}) => {
  const handleSelection = (maritalStatus: string) => {
    updateFormData({ maritalStatus: maritalStatus as any });
  };

  return (
    <div>
      <h1 className="text-[38px] font-bold text-foreground mb-12">
        Which best describes you?
      </h1>
      
      <div className="flex flex-col items-center gap-4 max-w-2xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
          {[
            { value: "married", label: "Married" },
            { value: "single", label: "Single" },
            { value: "cohabiting", label: "Cohabiting" },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelection(option.value)}
              className={`px-8 py-4 rounded-2xl border-2 text-base font-medium transition-all ${
                formData.maritalStatus === option.value 
                  ? 'bg-[#c8f5cd] border-[#4a5f4c] text-foreground' 
                  : 'bg-background border-border text-foreground hover:border-foreground/30'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
          {[
            { value: "divorced", label: "Divorced" },
            { value: "separated", label: "Separated" },
            { value: "widowed", label: "Widowed" },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelection(option.value)}
              className={`px-8 py-4 rounded-2xl border-2 text-base font-medium transition-all ${
                formData.maritalStatus === option.value 
                  ? 'bg-[#c8f5cd] border-[#4a5f4c] text-foreground' 
                  : 'bg-background border-border text-foreground hover:border-foreground/30'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="w-full md:max-w-[calc(33.333%-0.5rem)] md:mx-auto">
          <button
            onClick={() => handleSelection("civil-partnership")}
            className={`w-full px-8 py-4 rounded-2xl border-2 text-base font-medium transition-all ${
              formData.maritalStatus === "civil-partnership" 
                ? 'bg-[#c8f5cd] border-[#4a5f4c] text-foreground' 
                : 'bg-background border-border text-foreground hover:border-foreground/30'
            }`}
          >
            Civil Partnership
          </button>
        </div>
      </div>
    </div>
  );
};

const DateOfBirthStep = ({ formData, updateFormData }: { formData: FormData; updateFormData: (updates: Partial<FormData>) => void }) => {
  const handleDateChange = (value: string) => {
    updateFormData({ dateOfBirth: value });
  };

  // Calculate age for validation display
  const getAge = () => {
    if (!formData.dateOfBirth) return null;
    const selectedDate = new Date(formData.dateOfBirth);
    const today = new Date();
    return Math.floor((today.getTime() - selectedDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  };

  const age = getAge();
  const isUnder18 = age !== null && age < 18;

  return (
    <div>
      <h1 className="text-[38px] font-bold text-foreground mb-12">
        What is your date of birth?
      </h1>
      
      <div className="max-w-xl mx-auto">
        <input
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => handleDateChange(e.target.value)}
          placeholder="DD / MM / YYYY"
          className={`w-full px-7 py-5 rounded-2xl border-2 text-lg font-medium transition-all ${
            isUnder18 
              ? 'border-red-500 focus:border-red-500' 
              : 'border-border focus:border-foreground/30'
          } bg-background text-foreground focus:outline-none`}
          max={new Date(Date.now() - 18 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
        />
        
        {isUnder18 && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm font-medium mb-2">
              ⚠️ Age Requirement Not Met
            </p>
            <p className="text-red-700 text-sm">
              You must be 18 years or older to apply for vehicle finance. 
              You are currently {age} years old.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const AddressStep = ({ formData, updateFormData }: { formData: FormData; updateFormData: (updates: Partial<FormData>) => void }) => {
  const handleAddressChange = (address: string, details?: any) => {
    updateFormData({ address });
    
    // Only process Google Maps details if available
    if (details && details.address_components) {
      const components = details.address_components;
      const fullAddress = {
        line1: "",
        line2: "",
        city: "",
        postcode: "",
      };

      components.forEach((component: any) => {
        const types = component.types;
        if (types.includes("street_number")) {
          fullAddress.line1 = component.long_name + " ";
        }
        if (types.includes("route")) {
          fullAddress.line1 += component.long_name;
        }
        if (types.includes("locality") || types.includes("postal_town")) {
          fullAddress.city = component.long_name;
        }
        if (types.includes("postal_code")) {
          fullAddress.postcode = component.long_name;
        }
      });

      updateFormData({ fullAddress });
    }
  };

  return (
    <div>
      <h1 className="text-[38px] font-bold text-gray-900 mb-12">
        Next, where do you live?
      </h1>
      
      <div className="max-w-2xl mx-auto">
        <AddressAutocomplete
          value={formData.address}
          onChange={handleAddressChange}
          className="address-input"
          placeholder="Just start typing your postcode or address.."
        />
      </div>
    </div>
  );
};

const HousingSituationStep = ({ formData, updateFormData, onNext }: { 
  formData: FormData; 
  updateFormData: (updates: Partial<FormData>) => void;
  onNext: () => void;
}) => {
  const handleSelection = (housingSituation: string) => {
    updateFormData({ housingSituation: housingSituation as any });
  };

  return (
    <div>
      <h1 className="text-[38px] font-bold text-foreground mb-12">
        Ok, Which best describes you?
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl mx-auto">
        {[
          { value: "private-tenant", label: "Private tenant" },
          { value: "home-owner", label: "Home owner" },
          { value: "council-tenant", label: "Council tenant" },
          { value: "living-with-parents", label: "Living with parents" },
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => handleSelection(option.value)}
            className={`px-8 py-4 rounded-2xl border-2 text-base font-medium transition-all ${
              formData.housingSituation === option.value 
                ? 'bg-[#c8f5cd] border-[#4a5f4c] text-foreground' 
                : 'bg-background border-border text-foreground hover:border-foreground/30'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

const AddressDurationStep = ({ formData, updateFormData }: { formData: FormData; updateFormData: (updates: Partial<FormData>) => void }) => (
  <div>
    <h1 className="text-[38px] font-bold text-gray-900 mb-8">
      How long have you lived at {formData.address}?
    </h1>
    
    <p className="text-muted-foreground text-base mb-12">
      Lenders ask for 3 years' address history.
    </p>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
      <div>
        <input
          type="number"
          placeholder="Years"
          value={formData.addressDurationYears}
          onChange={(e) => updateFormData({ addressDurationYears: e.target.value })}
          className="address-input"
          min="0"
          max="99"
        />
      </div>
      <div>
        <input
          type="number"
          placeholder="Months"
          value={formData.addressDurationMonths}
          onChange={(e) => updateFormData({ addressDurationMonths: e.target.value })}
          className="address-input"
          min="0"
          max="11"
        />
      </div>
    </div>
  </div>
);

const PreviousAddressStep = ({ formData, updateFormData, addressIndex }: { 
  formData: FormData; 
  updateFormData: (updates: Partial<FormData>) => void;
  addressIndex: number;
}) => {
  const handleAddressChange = (address: string) => {
    const updatedAddresses = [...formData.previousAddresses];
    updatedAddresses[addressIndex] = { ...updatedAddresses[addressIndex], address };
    updateFormData({ previousAddresses: updatedAddresses });
  };

  return (
    <div>
      <h1 className="text-[38px] font-bold text-gray-900 mb-12">
        And what was your previous address?
      </h1>
      
      <div className="max-w-2xl mx-auto">
        <AddressAutocomplete
          value={formData.previousAddresses[addressIndex]?.address || ""}
          onChange={handleAddressChange}
          className="address-input"
          placeholder="Just start typing your postcode or address.."
        />
      </div>
    </div>
  );
};

const PreviousHousingSituationStep = ({ formData, updateFormData, addressIndex, onNext }: { 
  formData: FormData; 
  updateFormData: (updates: Partial<FormData>) => void;
  addressIndex: number;
  onNext?: () => void;
}) => {
  const handleSituationChange = (housingSituation: string) => {
    console.log('🏠 Housing situation selection:', housingSituation, 'for addressIndex:', addressIndex);
    
    // Ensure the address exists in the array
    const updatedAddresses = [...formData.previousAddresses];
    if (!updatedAddresses[addressIndex]) {
      // Create the address object if it doesn't exist
      updatedAddresses[addressIndex] = {
        address: "",
        housingSituation: "" as const,
        durationYears: "",
        durationMonths: ""
      };
    }
    
    updatedAddresses[addressIndex] = { 
      ...updatedAddresses[addressIndex], 
      housingSituation: housingSituation as any 
    };
    
    console.log('🏠 Updated addresses:', updatedAddresses);
    updateFormData({ previousAddresses: updatedAddresses });
  };

  return (
    <div>
      <h1 className="text-[38px] font-bold text-gray-900 mb-12">
        Ok, Which best describes you?
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl mx-auto">
        {[
          { value: "private-tenant", label: "Private tenant" },
          { value: "home-owner", label: "Home owner" },
          { value: "council-tenant", label: "Council tenant" },
          { value: "living-with-parents", label: "Living with parents" },
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => handleSituationChange(option.value)}
            className={`px-8 py-4 rounded-2xl border-2 text-base font-medium transition-all ${
              formData.previousAddresses[addressIndex]?.housingSituation === option.value 
                ? 'bg-[#c8f5cd] border-[#4a5f4c] text-foreground' 
                : 'bg-background border-border text-foreground hover:border-foreground/30'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

const PreviousAddressDurationStep = ({ formData, updateFormData, addressIndex }: { 
  formData: FormData; 
  updateFormData: (updates: Partial<FormData>) => void;
  addressIndex: number;
}) => {
  const handleYearsChange = (years: string) => {
    const updatedAddresses = [...formData.previousAddresses];
    updatedAddresses[addressIndex] = { ...updatedAddresses[addressIndex], durationYears: years };
    updateFormData({ previousAddresses: updatedAddresses });
  };

  const handleMonthsChange = (months: string) => {
    const updatedAddresses = [...formData.previousAddresses];
    updatedAddresses[addressIndex] = { ...updatedAddresses[addressIndex], durationMonths: months };
    updateFormData({ previousAddresses: updatedAddresses });
  };

  // Calculate total address history including current input
  const getTotalAddressTime = () => {
    const currentYears = parseInt(formData.addressDurationYears) || 0;
    const currentMonths = parseInt(formData.addressDurationMonths) || 0;
    let totalMonths = currentYears * 12 + currentMonths;

    formData.previousAddresses.forEach((addr) => {
      const years = parseInt(addr.durationYears) || 0;
      const months = parseInt(addr.durationMonths) || 0;
      totalMonths += years * 12 + months;
    });

    return totalMonths;
  };

  const address = formData.previousAddresses[addressIndex]?.address || "this address";
  const hasEnoughHistory = getTotalAddressTime() >= 36; // 3 years = 36 months
  const hasMaxAddresses = formData.previousAddresses.length >= 5; // Maximum 5 previous addresses
  const canSkipMoreHistory = hasMaxAddresses || formData.previousAddresses.length >= 2; // Allow skipping after 2+ addresses

  return (
    <div>
      <h1 className="text-[38px] font-bold text-gray-900 mb-8">
        How long did you live at {address}?
      </h1>
      
      <div className="max-w-2xl mx-auto mb-8">
        <p className="text-muted-foreground text-base">
          Lenders require 3 years of complete address history.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-8">
        <div>
          <input
            type="number"
            placeholder="Years"
            value={formData.previousAddresses[addressIndex]?.durationYears || ""}
            onChange={(e) => handleYearsChange(e.target.value)}
            className="address-input"
            min="0"
            max="99"
          />
        </div>
        <div>
          <input
            type="number"
            placeholder="Months"
            value={formData.previousAddresses[addressIndex]?.durationMonths || ""}
            onChange={(e) => handleMonthsChange(e.target.value)}
            className="address-input"
            min="0"
            max="11"
          />
        </div>
      </div>
      
      {(hasEnoughHistory || hasMaxAddresses) && (
        <div className="max-w-2xl mx-auto">
          <p className="text-muted-foreground text-base">
            {hasEnoughHistory 
              ? "Great, that's enough address history for your application."
              : "That's enough addresses for now. We can proceed with your application."
            }
          </p>
        </div>
      )}
      
      {/* Option to skip if user doesn't have more addresses */}
      {!hasEnoughHistory && !hasMaxAddresses && canSkipMoreHistory && (
        <div className="max-w-2xl mx-auto mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-blue-800 text-sm mb-4">
            Don't have more addresses to add? You can continue with what you've provided.
          </p>
          <button
            onClick={() => {
              // Mark that user wants to skip more addresses by setting a flag
              const updatedFormData = { ...formData };
              updatedFormData.previousAddresses = [...updatedFormData.previousAddresses];
              // We'll handle this in the navigation logic
              window.dispatchEvent(new CustomEvent('skipMoreAddresses'));
            }}
            className="text-blue-600 hover:text-blue-700 underline text-sm font-medium"
          >
            I don't have any more previous addresses
          </button>
        </div>
      )}
    </div>
  );
};

export default CarFinanceApplication;
