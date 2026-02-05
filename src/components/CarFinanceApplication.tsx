import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowRight, ArrowLeft, Shield, Timer, CalendarDays } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import AddressAutocomplete from "./AddressAutocomplete";
import { Checkbox } from "@/components/ui/checkbox";
import carfinancedLogoNew from "@/assets/carfinanced-logo-new.png";
import carfinancedHeaderLogo from "@/assets/carfinanced-header-logo.svg";
import trustpilotLogo from "@/assets/trustpilot-logo.png";
import carProgressInlineSvg from "@/assets/car-progress-inline.svg?raw";
import confettiTexture from "@/assets/confetti-texture.svg";
import carIcon from "@/assets/drive.png";
import vanIcon from "@/assets/delivery.png";
import ThankYouPage from "./ThankYouPage";
import { submitToAutoConvert, UTMParams } from "@/services/autoconvert";

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
const isValidPhoneNumber = (value: string) => {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("0")) {
    return digits.length === 11;
  }
  if (digits.startsWith("44")) {
    return digits.length === 12;
  }
  return false;
};

export interface FormData {
  // Step 1: Vehicle Type
  vehicleType: "car" | "van" | "";
  
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
  employmentStatus: "full-time" | "part-time" | "self-employed" | "retired" | "education" | "benefits" | "other" | "";
  
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

const FORM_STORAGE_KEY = "carFinanceAppState";
const CAR_SVG_WIDTH = 134;
const CAR_SVG_HEIGHT = 56;
const CAR_ASPECT_RATIO = CAR_SVG_WIDTH / CAR_SVG_HEIGHT;
const CAR_BASE_WIDTH = 168;
// Anchors tuned to the SVG wheel contact point and nose length.
const CAR_ANCHOR_X_RATIO = 0.727;
const CAR_WHEEL_CONTACT_RATIO = 0.5;
const CAR_VERTICAL_OFFSET = -8;
const CAR_SIZE_BOOST_DESKTOP = 1.144;
const CAR_SIZE_BOOST_MOBILE = 1.18;

// Step Components (defined before main component to avoid temporal dead zone issues)
const EmploymentStep = ({ formData, updateFormData, onNext }: { 
  formData: FormData; 
  updateFormData: (updates: Partial<FormData>) => void;
  onNext?: () => void;
}) => {
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  const handleSelection = (employmentStatus: string) => {
    updateFormData({ employmentStatus: employmentStatus as any });
    setTimeout(() => onNext?.(), 300); // Auto-advance after selection
  };

  return (
    <div>
      <h1 className="text-[38px] font-bold mb-12">
        <span className="text-gray-900">What is your </span>
        <span className="text-[#FF585E]">employment status?</span>
      </h1>
      
      <div className="flex flex-col items-center gap-8 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 w-full max-w-[900px] justify-items-center">
          {[
            { value: "full-time", label: "Full-Time Employment" },
            { value: "self-employed", label: "Self-Employed" },
            { value: "part-time", label: "Part-Time Employment" },
            { value: "retired", label: "Retired" },
            { value: "education", label: "Education" },
            { value: "__more", label: showMoreOptions ? "Hide options" : "More options", isToggle: true },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => option.isToggle ? setShowMoreOptions((prev) => !prev) : handleSelection(option.value)}
              className={`w-[280px] max-w-full h-14 sm:h-16 rounded-2xl border-2 text-base font-medium text-center transition-all flex items-center justify-center ${
                !option.isToggle && formData.employmentStatus === option.value 
                  ? 'bg-[#DFFFC7] border-black border-[3px] text-foreground' 
                  : 'bg-background border-gray-300 text-foreground'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {showMoreOptions && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 w-full max-w-[900px] justify-items-center">
            {[
              { value: "benefits", label: "Benefits" },
              { value: "temporary", label: "Temporary/Contract" },
              { value: "homemaker", label: "Homemaker" },
              { value: "armed-services", label: "Armed Services" },
              { value: "other", label: "Other" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelection(option.value)}
                className={`w-[280px] max-w-full h-14 sm:h-16 rounded-2xl border-2 text-base font-medium text-center transition-all flex items-center justify-center ${
                  formData.employmentStatus === option.value 
                    ? 'bg-[#DFFFC7] border-black border-[3px] text-foreground' 
                    : 'bg-background border-gray-300 text-foreground'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const JobDetailsStep = ({ formData, updateFormData }: { formData: FormData; updateFormData: (updates: Partial<FormData>) => void }) => (
  <div>
    <h1 className="text-[38px] font-bold mb-6">
      <span className="text-gray-900">Great! What's your </span>
      <span className="text-[#FF585E]">current job title?</span>
    </h1>
    
    <p className="text-gray-600 text-base mb-12">
      (We won't contact your employer)
    </p>
    
    <div className="max-w-xs mx-auto space-y-6">
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
    <h1 className="text-[38px] font-bold mb-12">
      <span className="text-gray-900">How long have you </span>
      <span className="text-[#FF585E]">worked at {formData.companyName}?</span>
    </h1>
    
    <div className="flex flex-row flex-nowrap items-center gap-3 justify-center w-full max-w-[640px] mx-auto">
      <input
        type="number"
        placeholder="Years"
        value={formData.employmentDurationYears}
        onChange={(e) => updateFormData({ employmentDurationYears: e.target.value })}
        className="address-input duration-input"
        min="0"
        max="99"
        inputMode="numeric"
        pattern="[0-9]*"
      />
      <input
        type="number"
        placeholder="Month"
        value={formData.employmentDurationMonths}
        onChange={(e) => updateFormData({ employmentDurationMonths: e.target.value })}
        className="address-input duration-input"
        min="0"
        max="11"
        inputMode="numeric"
        pattern="[0-9]*"
      />
    </div>
  </div>
);

const MonthlyIncomeStep = ({ formData, updateFormData }: { formData: FormData; updateFormData: (updates: Partial<FormData>) => void }) => {
  return (
    <div>
      <h1 className="text-[38px] font-bold mb-12">
        <span className="text-gray-900">Roughly, how much do you </span>
        <span className="text-[#FF585E]">earn each month?</span>
      </h1>
      
      <div className="max-w-[640px] mx-auto mb-8">
        <div className="relative">
          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground text-base">{"\u00A3"}</span>
          <input
            type="text"
            placeholder="Enter amount"
            value={formData.monthlyIncome}
            onChange={(e) => updateFormData({ monthlyIncome: e.target.value.replace(/[^0-9]/g, "").slice(0, 7) })}
            className="amount-input pl-12"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={7}
          />
        </div>
      </div>
      
    </div>
  );
};
const LoanAmountStep = ({ formData, updateFormData }: { formData: FormData; updateFormData: (updates: Partial<FormData>) => void }) => (
  <div>
    <h1 className="text-[38px] font-bold mb-4">
      <span className="text-gray-900">How much would </span>
      <span className="text-[#FF585E]">you like to borrow?</span>
    </h1>
    <p className="text-muted-foreground text-base mb-8">
      You can change this amount later
    </p>
    
    <div className="max-w-[640px] mx-auto">
      <div className="relative">
        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground text-base">{"\u00A3"}</span>
        <input
          type="text"
          placeholder="Enter amount"
          value={formData.loanAmount}
          onChange={(e) => updateFormData({ loanAmount: e.target.value.replace(/[^0-9]/g, "").slice(0, 7) })}
          className="amount-input pl-12"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={7}
        />
      </div>
    </div>
  </div>
);const PersonalDetailsStep = ({ formData, updateFormData, onNext }: { 
  formData: FormData; 
  updateFormData: (updates: Partial<FormData>) => void;
  onNext?: () => void;
}) => {
  const handleTitleSelection = (title: string) => {
    updateFormData({ title: title as any });
  };

  return (
    <div>
      <h1 className="text-[38px] font-bold mb-12">
        <span className="text-gray-900">Almost done, let us </span>
        <span className="text-[#FF585E]">know who you are?</span>
      </h1>
      
      <div className="max-w-xs mx-auto space-y-8">
        <div className="flex items-center justify-center">
          <div className="flex gap-4 justify-center">
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
                    ? 'bg-[#DFFFC7] border-black border-[3px] text-foreground' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-[640px] mx-auto">
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

const ContactDetailsStep = ({
  formData,
  updateFormData,
  onSubmit,
}: {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  onSubmit?: () => void;
}) => {
  const emailInvalid = formData.email.trim().length > 0 && !isValidEmail(formData.email);
  const phoneInvalid = formData.phoneNumber.trim().length > 0 && !isValidPhoneNumber(formData.phoneNumber);

  return (
  <div>
    <h1 className="text-[38px] font-bold mb-12">
      <span className="text-gray-900">Finally, where should </span>
      <span className="text-[#FF585E]">we send your quote?</span>
    </h1>
    
    <div className="max-w-xs mx-auto space-y-6">
      <input
        type="email"
        placeholder="Email address"
        value={formData.email}
        onChange={(e) => updateFormData({ email: e.target.value })}
        className={`address-input ${emailInvalid ? "border-red-500 focus:border-red-500" : ""}`}
        aria-invalid={emailInvalid}
      />
      
      <input
        type="tel"
        placeholder="Phone number"
        value={formData.phoneNumber}
        onChange={(e) => updateFormData({ phoneNumber: e.target.value })}
        className={`address-input ${phoneInvalid ? "border-red-500 focus:border-red-500" : ""}`}
        aria-invalid={phoneInvalid}
      />
      
      <div className="flex items-start gap-3 mt-4">
        <Checkbox
          id="terms"
          checked={formData.termsAccepted}
          onCheckedChange={(checked) => updateFormData({ termsAccepted: checked === true })}
          className="mt-1 h-6 w-6 border-gray-400 data-[state=checked]:border-success data-[state=checked]:bg-success data-[state=checked]:text-white"
        />
        <label htmlFor="terms" className="text-muted-foreground text-left">
          I have read and agree to the{" "}
          <a href="#" className="text-primary hover:underline whitespace-nowrap">
            {"terms\u00A0and\u00A0conditions"}
          </a>
        </label>
      </div>

      {onSubmit ? (
        <div className="pt-3 flex flex-col items-center gap-3">
          <button 
            onClick={onSubmit}
            className="flex items-center justify-center gap-2 px-12 py-3 text-white bg-success hover:bg-success/90 rounded-full font-semibold transition-all text-lg shadow-lg hover:shadow-xl"
          >
            <span>Submit</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <div className="mt-3 sm:mt-4 flex justify-center">
            <a
              href="https://uk.trustpilot.com/review/carfinanced.co.uk"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex"
            >
              <img
                src={trustpilotLogo}
                alt="Trustpilot rating"
                className="h-4 sm:h-5 md:h-6 w-auto"
              />
            </a>
          </div>
        </div>
      ) : null}
    </div>
    
    <div className="mt-10 max-w-xs mx-auto">
      <p className="text-muted-foreground text-sm text-center">
        The personal information we have collected from you will be shared with fraud prevention agencies who will use it to prevent fraud and money laundering and to verify your identity. If fraud is detected, you could be refused finance.
      </p>
    </div>
  </div>
  );
};

const CarFinanceApplication = () => {
  const navigate = useNavigate();
  const { stepNumber } = useParams();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [utmParams, setUtmParams] = useState<Record<string, string>>({});
  const [carScreenPosition, setCarScreenPosition] = useState<{ x: number; y: number; angle: number; scale: number }>({
    x: 0,
    y: 100,
    angle: 0,
    scale: 0.5,
  });
  const progressPathRef = useRef<SVGPathElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const nextStepRef = useRef<() => void>(() => {});
  const progressAnimationRef = useRef<number | null>(null);
  const lineAnimationRef = useRef<number | null>(null);
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
  const hasHydratedFromStorage = useRef(false);
  const mainScrollRef = useRef<HTMLDivElement | null>(null);
  const employmentSlugs = [
    "/employment",
    "/job-details",
    "/employment-duration",
    "/monthly-income",
    "/personal-details",
    "/contact-details",
  ];
  const isEmploymentPath = employmentSlugs.some((slug) =>
    location.pathname.endsWith(slug)
  );

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
    
    console.log('?? Captured UTM parameters from URL:', utmData);
    setUtmParams(utmData);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Enter" || event.defaultPrevented) return;
      if (isSubmitted || location.pathname === "/thankyou") return;

      const target = event.target as HTMLElement | null;
      if (!target) return;

      if (target.isContentEditable) return;

      const tagName = target.tagName?.toLowerCase();
      if (tagName === "textarea" || tagName === "button") return;

      if (tagName === "input") {
        const input = target as HTMLInputElement;
        const inputType = input.type?.toLowerCase();
        if (["checkbox", "radio", "button", "submit", "file"].includes(inputType)) return;
      }

      event.preventDefault();
      nextStepRef.current();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSubmitted, location.pathname]);

  // Hydrate from localStorage on first render
  useEffect(() => {
    if (hasHydratedFromStorage.current) return;
    try {
      const raw = localStorage.getItem(FORM_STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.formData) {
          setFormData((prev) => ({ ...prev, ...saved.formData }));
        }
        const currentPath = window.location.pathname;
        const shouldRestoreStep = currentPath === "/" || currentPath === "";
        if (shouldRestoreStep && typeof saved.currentStep === "number" && saved.currentStep >= 1) {
          const total = getTotalSteps();
          setCurrentStep(Math.min(Math.max(1, saved.currentStep), total));
        }
        if (saved.utmParams) {
          setUtmParams((prev) => ({ ...saved.utmParams, ...prev }));
        }
      }
    } catch (err) {
      console.warn("Failed to hydrate form state", err);
    } finally {
      hasHydratedFromStorage.current = true;
    }
  }, []);

  // Persist form and step to localStorage
  useEffect(() => {
    if (!hasHydratedFromStorage.current) return;
    const payload = {
      formData,
      currentStep,
      utmParams,
      ts: Date.now(),
    };
    try {
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(payload));
    } catch (err) {
      console.warn("Failed to persist form state", err);
    }
  }, [formData, currentStep, utmParams]);

  // Step to slug mapping - DYNAMIC based on address history
  const getStepSlug = (step: number): string => {
    // Base steps that are always the same
    const baseSteps: Record<number, string> = {
      1: 'vehicle-type',
      2: 'loan-amount',
      3: 'driving-licence',
      4: 'marital-status',
      5: 'date-of-birth',
      6: 'address1',
      7: 'housing-situation1',
      8: 'address-duration1',
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
        [employmentStartStep + 4]: 'personal-details',
        [employmentStartStep + 5]: 'contact-details',
      };
      return employmentSteps[step] || `step-${step}`;
    }

    // This is address section - build dynamically
    if (step > 8) {
      const addressIndex = Math.floor((step - 9) / 3) + 1; // Which address (1, 2, 3, 4, 5)
      const stepType = (step - 9) % 3; // 0=address, 1=housing, 2=duration
      
      const stepTypes = ['address', 'housing-situation', 'address-duration'];
      return `${stepTypes[stepType]}${addressIndex + 1}`;
    }

    return baseSteps[step] || `step-${step}`;
  };

  const getStepFromSlug = (slug: string): number => {
    // Base slugs that are always the same
    const baseSlugToStep: Record<string, number> = {
      'vehicle-type': 1,
      'loan-amount': 2,
      'driving-licence': 3,
      'marital-status': 4,
      'date-of-birth': 5,
      'address1': 6,
      'housing-situation1': 7,
      'address-duration1': 8,
    };

    // Check for employment slugs first
    const employmentStartStep = getEmploymentStep();
    const employmentSlugs: Record<string, number> = {
      'employment': employmentStartStep,
      'job-details': employmentStartStep + 1,
      'employment-duration': employmentStartStep + 2,
      'monthly-income': employmentStartStep + 3,
      'personal-details': employmentStartStep + 4,
      'contact-details': employmentStartStep + 5,
    };

    // Check employment slugs first
    if (employmentSlugs[slug]) {
      console.log('?? getStepFromSlug:', slug, 'employmentStartStep:', employmentStartStep, 'result:', employmentSlugs[slug]);
      return employmentSlugs[slug];
    }

    // Check base steps
    if (baseSlugToStep[slug]) {
      console.log('?? getStepFromSlug:', slug, 'employmentStartStep:', employmentStartStep, 'result:', baseSlugToStep[slug]);
      return baseSlugToStep[slug];
    }

    // Handle dynamic address slugs (address2, housing-situation2, etc.)
    const addressMatch = slug.match(/^(address|housing-situation|address-duration)(\d+)$/);
    if (addressMatch) {
      const stepType = addressMatch[1];
      const addressNum = parseInt(addressMatch[2]);
      
      if (addressNum === 1) {
        // These should be handled by baseSlugToStep above, but just in case
        const stepMap = { 'address': 6, 'housing-situation': 7, 'address-duration': 8 };
        return stepMap[stepType as keyof typeof stepMap] || 1;
      } else {
        // For address2+, calculate step number
        const addressIndex = addressNum - 2; // address2 = index 0, address3 = index 1, etc.
        const stepTypeMap = { 'address': 0, 'housing-situation': 1, 'address-duration': 2 };
        const stepNum = 9 + (addressIndex * 3) + (stepTypeMap[stepType as keyof typeof stepTypeMap] || 0);
        
        console.log('?? getStepFromSlug:', slug, 'employmentStartStep:', employmentStartStep, 'result:', stepNum);
        return stepNum;
      }
    }

    console.log('?? getStepFromSlug:', slug, 'employmentStartStep:', employmentStartStep, 'result: 1 (fallback)');
    return 1;
  };

  // Handle step URL routing
  useEffect(() => {
    const path = location.pathname;
    console.log('?? URL routing effect triggered - path:', path, 'previousAddresses.length:', formData.previousAddresses.length);
    
    if (path === '/thankyou') {
      setIsSubmitted(true);
    } else if (path !== '/' && path !== '') {
      const slug = path.replace('/', '');
      console.log('?? Processing slug:', slug);
      
      const stepNum = getStepFromSlug(slug);
      console.log('?? getStepFromSlug returned:', stepNum, 'for slug:', slug);
      
      if (stepNum >= 1) {
        console.log('?? URL routing: Setting currentStep to', stepNum, 'from slug', slug);
        setCurrentStep(stepNum);
      } else {
        console.log('?? Invalid step number, redirecting to step 1');
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
        console.log('?? Using current URL UTM parameters for initial redirect:', utmString);
      } else if (Object.keys(utmParams).length > 0) {
        // Use captured UTM parameters
        utmString = new URLSearchParams(utmParams).toString();
        console.log('?? Using captured UTM parameters for initial redirect:', utmString);
      }
      
      const redirectUrl = `/vehicle-type${utmString ? `?${utmString}` : ''}`;
      console.log('?? Initial redirect to:', redirectUrl);
      navigate(redirectUrl, { replace: true });
    }
  }, [navigate, location.pathname, currentStep, utmParams]);

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  // ENHANCED navigateToStep with UTM preservation
  const navigateToStep = (step: number) => {
    console.log('?? navigateToStep called with step:', step);
    
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
      console.log('?? Using current URL UTM parameters for navigation:', finalUtmParams);
    } else {
      // Fall back to stored UTM parameters
      finalUtmParams = utmParams;
      console.log('?? Using stored UTM parameters for navigation:', finalUtmParams);
    }
    
    if (step === getTotalSteps() + 1) {
      // Navigate to thank you page
      const utmString = new URLSearchParams(finalUtmParams).toString();
      const url = `/thankyou${utmString ? `?${utmString}` : ''}`;
      console.log('?? Navigating to thank you page:', url);
      navigate(url);
    } else {
      // Navigate to specific step with UTM parameters
      const stepSlug = getStepSlug(step);
      const utmString = new URLSearchParams(finalUtmParams).toString();
      const url = `/${stepSlug}${utmString ? `?${utmString}` : ''}`;
      console.log('?? Navigating to step slug:', stepSlug, 'URL:', url);
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

  const isPreviousAddressBlank = (address?: FormData["previousAddresses"][number]) => {
    if (!address) return true;
    return !address.address && !address.housingSituation && !address.durationYears && !address.durationMonths;
  };

  const getExpectedPreviousAddressCount = (step: number) => {
    if (step <= 8) return 0;
    if (isEmploymentPath) return 0;
    const fromStep = Math.floor((step - 9) / 3) + 1;
    return Math.min(fromStep, formData.previousAddresses.length);
  };

  const getEffectivePreviousAddressLength = (step: number) => {
    const expectedCount = getExpectedPreviousAddressCount(step);
    let length = formData.previousAddresses.length;
    while (length > expectedCount && isPreviousAddressBlank(formData.previousAddresses[length - 1])) {
      length -= 1;
    }
    return length;
  };

  const needsMoreAddressHistory = () => {
    const totalTime = getTotalAddressTime();
    const hasMaxAddresses = getEffectivePreviousAddressLength(currentStep) >= 4; // Maximum 4 previous addresses (5 total including current)
    return totalTime < 36 && !hasMaxAddresses; // Less than 3 years (36 months) AND haven't reached max addresses
  };
  
  // Get the step number for the employment section based on current form state
  const getEmploymentStep = () => {
    // Calculate total address time to determine if we need more addresses
    const totalAddressTime = getTotalAddressTime();
    const baseSteps = 8; // Steps 1-8 (vehicle type through address duration 1)
    
    const effectivePreviousAddresses = getEffectivePreviousAddressLength(currentStep);

    console.log('?? getEmploymentStep calculation:', {
      totalAddressTime,
      previousAddressesLength: formData.previousAddresses.length,
      effectivePreviousAddresses,
      hasEnoughTime: totalAddressTime >= 36,
      hasMaxAddresses: effectivePreviousAddresses >= 4
    });
    
    // If we have enough time (36+ months) OR reached max addresses, go to employment
    if (totalAddressTime >= 36 || effectivePreviousAddresses >= 4) {
      // Employment starts right after the last address step we actually need
      const neededPreviousAddresses = Math.min(effectivePreviousAddresses, 4); // Max 4 previous addresses
      const employmentStep = baseSteps + 1 + (neededPreviousAddresses * 3); // +1 to skip to employment
      
      console.log('?? Employment starts at step:', employmentStep, 'with', neededPreviousAddresses, 'previous addresses');
      return employmentStep;
    }
    
    // Otherwise, we still need more addresses - this shouldn't be called when we need more addresses
    console.log('?? getEmploymentStep called but still need more addresses');
    return baseSteps + 1 + ((formData.previousAddresses.length + 1) * 3);
  };

  // Calculate total steps dynamically 
  const getTotalSteps = () => {
    const employmentStartStep = getEmploymentStep();
    return employmentStartStep + 5; // employment + 5 more steps to completion
  };

  const nextStep = async () => {
    console.log('?? nextStep called - currentStep:', currentStep, 'totalSteps:', getTotalSteps());
    console.log('?? Current URL:', location.pathname);
    
    // Validate current step
    if (currentStep === 1 && !formData.vehicleType) {
      toast({ title: "Please select a vehicle type", variant: "destructive" });
      return;
    }
    if (currentStep === 2 && !formData.loanAmount) {
      toast({ title: "Please enter how much you'd like to borrow", variant: "destructive" });
      return;
    }
    if (currentStep === 3 && formData.hasFullLicence === null) {
      toast({ title: "Please answer the licence question", variant: "destructive" });
      return;
    }
    if (currentStep === 3 && formData.hasFullLicence === false && !formData.licenceType) {
      toast({ title: "Please select your licence type", variant: "destructive" });
      return;
    }
    if (currentStep === 4 && !formData.maritalStatus) {
      toast({ title: "Please select your marital status", variant: "destructive" });
      return;
    }
    if (currentStep === 5 && !formData.dateOfBirth) {
      toast({ title: "Please enter your date of birth", variant: "destructive" });
      return;
    }
    // Enhanced 18+ age validation
    if (currentStep === 5 && formData.dateOfBirth) {
      const selectedDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = Math.floor((today.getTime() - selectedDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      
      if (age < 18) {
        toast({ title: "You must be 18 or older to apply for vehicle finance", variant: "destructive" });
        return;
      }
    }
    if (currentStep === 6 && !formData.address) {
      toast({ title: "Please enter your address", variant: "destructive" });
      return;
    }
    if (currentStep === 7 && !formData.housingSituation) {
      toast({ title: "Please select your housing situation", variant: "destructive" });
      return;
    }
    if (currentStep === 8 && (!formData.addressDurationYears && !formData.addressDurationMonths)) {
      toast({ title: "Please enter how long you've lived at this address (months optional)", variant: "destructive" });
      return;
    }
    
    // Dynamic validation for previous addresses
    for (let i = 0; i < formData.previousAddresses.length; i++) {
      const baseStep = 9 + (i * 3);
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
    if (currentStep === employmentStartStep + 4 && (!formData.title || !formData.firstName || !formData.lastName)) {
      toast({ title: "Please enter your personal details", variant: "destructive" });
      return;
    }
    if (currentStep === employmentStartStep + 5) {
      if (!formData.email || !formData.phoneNumber || !formData.termsAccepted) {
        toast({ title: "Please complete all contact details and accept terms", variant: "destructive" });
        return;
      }
      if (!isValidEmail(formData.email)) {
        toast({ title: "Please enter a valid email address", variant: "destructive" });
        return;
      }
      if (!isValidPhoneNumber(formData.phoneNumber)) {
        toast({ title: "Please enter a valid phone number", variant: "destructive" });
        return;
      }
    }

    if (currentStep < getTotalSteps()) {
      console.log('?? Processing step progression...');
      
      // Handle step progression logic
      let nextStepNumber = currentStep + 1;
      console.log('?? Default nextStepNumber:', nextStepNumber);
      
    // Handle step progression for address flow - DYNAMIC detection
    const employmentStartStep = getEmploymentStep();
    const isAddressDurationStep = currentStep === 8 || (currentStep > 8 && currentStep < employmentStartStep && (currentStep - 8) % 3 === 0);
    
    if (isAddressDurationStep && (currentStep === 8 || formData.previousAddresses.length > 0)) {
        console.log('?? After address duration step');
        console.log('?? Current total address time (months):', getTotalAddressTime());
        console.log('?? Needs more address history:', needsMoreAddressHistory());
        console.log('?? Current previousAddresses:', formData.previousAddresses.length);
        
        // Recalculate total time after user input
        const totalTime = getTotalAddressTime();
        const hasEnoughHistory = totalTime >= 36; // 3 years = 36 months
        const effectivePreviousAddresses = getEffectivePreviousAddressLength(currentStep);
        const hasMaxAddresses = effectivePreviousAddresses >= 4; // Maximum 4 previous addresses
        const expectedCount = getExpectedPreviousAddressCount(currentStep);
        
        // Check if more address history is needed
        if (!hasEnoughHistory && !hasMaxAddresses) {
          console.log('?? Needs more address history - adding previous address');
          
          // Add a new previous address entry if needed
          if (currentStep === 8 ||
              (currentStep > 8 && effectivePreviousAddresses === expectedCount)) {
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
          console.log('?? No more address history needed - going to employment');
          console.log('?? Total address time:', totalTime, 'months (>=36 needed)');
          console.log('?? Has enough history:', hasEnoughHistory);
          console.log('?? Has max addresses:', hasMaxAddresses);
          nextStepNumber = getEmploymentStep();
          console.log('?? Going to employment step:', nextStepNumber);
        }
      } else {
        console.log('?? Regular step progression');
      }
      
      console.log('?? Final nextStepNumber:', nextStepNumber);
      console.log('?? About to call navigateToStep...');
      navigateToStep(nextStepNumber);
      console.log('?? navigateToStep called!');
    } else {
      console.log('?? ===== FINAL STEP REACHED - SUBMITTING FORM =====');
      console.log('?? Current step:', currentStep, 'Total steps:', getTotalSteps());
      
      try {
        // Submit form and show thank you page
        const response = await submitFormData();
        console.log('?? Form submission completed successfully, navigating to thank you page...');
        navigateToStep(getTotalSteps() + 1);
      } catch (error) {
        console.error('? Form submission failed:', error);
      }
    }
  };

  const prevStep = () => {
    console.log('?? prevStep called - currentStep:', currentStep);
    
    if (currentStep > 1) {
      // Handle special case: going back from employment to last address step
      const employmentStartStep = getEmploymentStep();
      if (currentStep === employmentStartStep && formData.previousAddresses.length > 0) {
        // Go back to the last address duration step
        const lastAddressDurationStep = 8 + (formData.previousAddresses.length * 3);
        console.log('?? Going back from employment to last address duration step:', lastAddressDurationStep);
        navigateToStep(lastAddressDurationStep);
      } else {
        navigateToStep(currentStep - 1);
      }
    }
  };

  // ENHANCED submitFormData with UTM preservation
  const submitFormData = async () => {
    console.log('?? ===== FINAL FORM SUBMISSION STARTED =====');
    console.log('?? Complete Form Data:', JSON.stringify(formData, null, 2));
    
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
      console.log('?? Final UTM parameters from current URL for submission:', finalUtmParams);
    } else {
      // Use stored UTM parameters
      finalUtmParams = utmParams;
      console.log('?? Final UTM parameters from storage for submission:', finalUtmParams);
    }
    
    console.log('??? FINAL UTM Parameters being sent to AutoConvert:', JSON.stringify(finalUtmParams, null, 2));
    
    try {
      // Prepare form data with final UTM parameters
      const submissionData = {
        ...formData,
        utmParams: finalUtmParams,
        submissionTime: new Date().toISOString(),
        referrer: document.referrer,
      };

      console.log('?? Prepared Submission Data with Enhanced UTM:', JSON.stringify(submissionData, null, 2));

      // Submit to AutoConvert API with enhanced UTM parameters
      console.log('?? Sending complete form data to AutoConvert API...');
      console.log('?? API URL: https://api.autoconvert.co.uk/application/submit');
      console.log('?? ENHANCED UTM parameters being sent to AutoConvert:', finalUtmParams);
      
      const autoConvertResponse = await submitToAutoConvert(formData, finalUtmParams as UTMParams);
      
      console.log('�o. ===== AUTOCONVERT SUBMISSION SUCCESSFUL =====');
      console.log('dY"" AutoConvert Response:', JSON.stringify(autoConvertResponse, null, 2));

      // Clear saved session on successful submit
      try {
        localStorage.removeItem(FORM_STORAGE_KEY);
      } catch (err) {
        console.warn("Failed to clear persisted form state", err);
      }

      toast({
        title: "Application submitted successfully!", 
        description: "Your application is currently under review."
      });

      return autoConvertResponse;

    } catch (error) {
      console.error('? ===== FORM SUBMISSION FAILED =====');
      console.error('?? Error Details:', error);
      console.error('?? Error Message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('?? Stack Trace:', error instanceof Error ? error.stack : 'No stack trace');
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      const userMessage = errorMessage.startsWith("Edge function error:")
        ? errorMessage.replace("Edge function error: ", "")
        : errorMessage;

      toast({ 
        title: "Submission failed", 
        description: userMessage || "Something went wrong while submitting. Please try again.",
        variant: "destructive" 
      });
      throw error;
    }
  };
  nextStepRef.current = nextStep;

  const totalSteps = getTotalSteps();
  const isThankYou = isSubmitted || location.pathname === "/thankyou";
  const progressDenominator = Math.max(totalSteps - 1, 1);
  const rawProgress = isThankYou
    ? 1
    : Math.min(1, Math.max(0, (currentStep - 1) / progressDenominator));
  const lineProgress = rawProgress;
  const [animatedProgress, setAnimatedProgress] = useState(lineProgress);
  const animatedProgressRef = useRef(lineProgress);
  const [lineAnimatedProgress, setLineAnimatedProgress] = useState(lineProgress);
  const lineAnimatedProgressRef = useRef(lineProgress);
  const [lineProgressDisplay, setLineProgressDisplay] = useState(lineProgress);
  const safeLineProgress = Math.max(0, Math.min(1, lineProgressDisplay));
  const lineDashGap = Math.max(0, 1 - safeLineProgress);
  const [carBounceOffset, setCarBounceOffset] = useState(0);
  const [carBounceActive, setCarBounceActive] = useState(false);

  useEffect(() => {
    animatedProgressRef.current = animatedProgress;
  }, [animatedProgress]);

  useEffect(() => {
    lineAnimatedProgressRef.current = lineAnimatedProgress;
  }, [lineAnimatedProgress]);

  useEffect(() => {
    const from = animatedProgressRef.current;
    const to = lineProgress;
    if (from === to) return;

    if (progressAnimationRef.current) {
      cancelAnimationFrame(progressAnimationRef.current);
      progressAnimationRef.current = null;
    }

    const start = performance.now();
    const durationMs = 525;
    const easeInOut = (t: number) =>
      t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = easeInOut(t);
      setAnimatedProgress(from + (to - from) * eased);
      if (t < 1) {
        progressAnimationRef.current = requestAnimationFrame(tick);
      } else {
        progressAnimationRef.current = null;
      }
    };

    progressAnimationRef.current = requestAnimationFrame(tick);

    return () => {
      if (progressAnimationRef.current) {
        cancelAnimationFrame(progressAnimationRef.current);
        progressAnimationRef.current = null;
      }
    };
  }, [lineProgress]);

  useEffect(() => {
    const from = lineAnimatedProgressRef.current;
    const to = lineProgress;
    if (from === to) return;

    if (lineAnimationRef.current) {
      cancelAnimationFrame(lineAnimationRef.current);
      lineAnimationRef.current = null;
    }

    const start = performance.now();
    const durationMs = 525;
    const easeInOut = (t: number) =>
      t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = easeInOut(t);
      setLineAnimatedProgress(from + (to - from) * eased);
      if (t < 1) {
        lineAnimationRef.current = requestAnimationFrame(tick);
      } else {
        lineAnimationRef.current = null;
      }
    };

    lineAnimationRef.current = requestAnimationFrame(tick);

    return () => {
      if (lineAnimationRef.current) {
        cancelAnimationFrame(lineAnimationRef.current);
        lineAnimationRef.current = null;
      }
    };
  }, [lineProgress]);

  useLayoutEffect(() => {
    const updateCarPosition = () => {
      const path = progressPathRef.current;
      const header = headerRef.current;
      if (!path || !header) return;

      const svg = path.ownerSVGElement;
      if (!svg) return;

      const totalLength = path.getTotalLength();
      const delta = Math.max(0.5, totalLength * 0.002);
      const ctm = path.getScreenCTM();
      if (!ctm) return;

      const headerRect = header.getBoundingClientRect();
      const svgRect = svg.getBoundingClientRect();
      if (!svgRect.height || !svgRect.width) return;
      const baseScale = svgRect.height / 180;
      const sizeBoost = window.innerWidth < 640 ? CAR_SIZE_BOOST_MOBILE : CAR_SIZE_BOOST_DESKTOP;
      const scale = baseScale * sizeBoost;

      const carWidth = CAR_BASE_WIDTH * scale;
      const carYOffset = CAR_VERTICAL_OFFSET * scale;

      const toScreen = (svgPoint: DOMPoint) => svgPoint.matrixTransform(ctm);
      const getScreenPoints = (length: number) => {
        const point = path.getPointAtLength(length);
        const prevPoint = path.getPointAtLength(Math.max(0, length - delta));
        const nextPoint = path.getPointAtLength(Math.min(totalLength, length + delta));
        const screenPoint = toScreen(new DOMPoint(point.x, point.y));
        const screenPrev = toScreen(new DOMPoint(prevPoint.x, prevPoint.y));
        const screenNext = toScreen(new DOMPoint(nextPoint.x, nextPoint.y));
        const tangentLength = Math.hypot(screenNext.x - screenPrev.x, screenNext.y - screenPrev.y);
        return { screenPoint, screenPrev, screenNext, tangentLength };
      };

      const carProgress = animatedProgress;
      const carLength = totalLength * carProgress;
      const carPoints = getScreenPoints(carLength);
      if (!carPoints.tangentLength) return;

      const angleDeg =
        (Math.atan2(carPoints.screenNext.y - carPoints.screenPrev.y, carPoints.screenNext.x - carPoints.screenPrev.x) * 180) /
        Math.PI;

      const lineProgress = Math.max(0, animatedProgress);

      setCarScreenPosition({
        x: carPoints.screenPoint.x - headerRect.left,
        y: carPoints.screenPoint.y - headerRect.top + carYOffset,
        angle: angleDeg,
        scale,
      });
      setLineProgressDisplay(lineProgress);
    };

    updateCarPosition();
    window.addEventListener("resize", updateCarPosition);
    return () => window.removeEventListener("resize", updateCarPosition);
  }, [animatedProgress, lineAnimatedProgress]);

  // Gentle bounce to imply motion without distorting the car
  // Trigger a short bounce after each progress update
  useEffect(() => {
    setCarBounceActive(true);
    const timeout = setTimeout(() => setCarBounceActive(false), 900);
    return () => clearTimeout(timeout);
  }, [lineProgress]);

  // Bounce animation loop (decays quickly)
  useEffect(() => {
    let frame: number | undefined;
    const start = performance.now();

    const tick = (now: number) => {
      const t = (now - start) / 1000; // seconds
      const amplitude = carBounceActive ? 3 : 0;
      const frequency = 2.5; // Hz
      const decay = Math.exp(-2 * t); // quick damping
      const offset = amplitude * Math.sin(t * Math.PI * 2 * frequency) * decay;
      setCarBounceOffset(offset);
      if (carBounceActive && offset > 0.1) {
        frame = requestAnimationFrame(tick);
      } else {
        setCarBounceOffset(0);
      }
    };

    if (carBounceActive) {
      frame = requestAnimationFrame(tick);
    } else {
      setCarBounceOffset(0);
    }

    return () => {
      if (frame) cancelAnimationFrame(frame);
    };
  }, [carBounceActive]);

  // Trim trailing empty previous-address entries so the flow doesn't skip ahead.
  useEffect(() => {
    const expectedCount = getExpectedPreviousAddressCount(currentStep);
    const trimmed = [...formData.previousAddresses];

    while (trimmed.length > expectedCount && isPreviousAddressBlank(trimmed[trimmed.length - 1])) {
      trimmed.pop();
    }

    if (trimmed.length !== formData.previousAddresses.length) {
      setFormData((prev) => ({
        ...prev,
        previousAddresses: trimmed,
      }));
    }
  }, [currentStep, formData.previousAddresses]);

  // Hide the scrollbar when content fits; enable it only if needed.
  useEffect(() => {
    const container = mainScrollRef.current;
    if (!container) return;

    const updateOverflow = () => {
      const styles = window.getComputedStyle(container);
      const paddingBottom = parseFloat(styles.paddingBottom) || 0;
      const overflow = container.scrollHeight - container.clientHeight;
      const needsScroll = overflow > paddingBottom + 1;
      container.style.overflowY = needsScroll ? "auto" : "hidden";
      if (!needsScroll && container.scrollTop !== 0) {
        container.scrollTop = 0;
      }
    };

    container.scrollTop = 0;
    updateOverflow();
    const resizeObserver = new ResizeObserver(updateOverflow);
    resizeObserver.observe(container);
    Array.from(container.children).forEach((child) => resizeObserver.observe(child));
    window.addEventListener("resize", updateOverflow);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateOverflow);
    };
  }, [currentStep, formData]);

  if (isSubmitted || location.pathname === '/thankyou') {
    return <ThankYouPage formData={formData} utmParams={utmParams} />;
  }

  const showNextButton =
    (([2, 5, 6, 8, 9, 11, 12, 14, 15, 17, 18, 20].includes(currentStep) && currentStep !== getEmploymentStep()) ||
      currentStep >= getEmploymentStep() + 1);

  return (
    <div className="h-screen bg-white relative overflow-hidden flex flex-col">
      {/* Header with Wave Bottom */}
      <div
        ref={headerRef}
        className="relative pb-[56px] sm:pb-[60px] overflow-hidden"
        style={{
          backgroundColor: "#FF585E",
        }}
      >
        <img
          src={confettiTexture}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 z-0 w-[70px] sm:w-[160px] md:w-[200px] h-auto"
        />
        <img
          src={confettiTexture}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-0 z-0 w-[70px] sm:w-[160px] md:w-[200px] h-auto"
        />

        {/* Logo Centered */}
        <div className="relative z-10 pt-4 sm:pt-6 pb-2 sm:pb-3 px-4 sm:px-6 text-center">
          <a href="https://carfinanced.co.uk/" target="_blank" rel="noopener noreferrer" className="inline-block">
            <img 
              src={carfinancedHeaderLogo} 
              alt="Car Financed Logo" 
              className="h-7 sm:h-8 md:h-10"
            />
          </a>
          <div className="mt-2 mb-2 sm:mb-3 flex items-center justify-center gap-1.5 text-[11px] sm:text-xs text-white font-semibold">
            <Timer className="h-3 w-3 sm:h-3.5 sm:w-3.5" aria-hidden="true" />
            <span>Takes around 2 minutes to complete</span>
          </div>
        </div>

        {/* Wave at bottom with white fill and yellow progress line - more pronounced arch */}
        <svg
          viewBox="0 0 1440 180"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          style={{
            position: "absolute",
            bottom: "-4px",
            left: "0",
            width: "100%",
            height: "94px",
          }}
        >
          {/* White background curve - deeper arch */}
          <path
            d="M 0,180 L 0,100 Q 720,0 1440,100 L 1440,180 Z"
            fill="#ffffff"
          />
          {/* White seam cover to avoid red hairline at the curve */}
          <path
            d="M 0,100 Q 720,0 1440,100"
            fill="none"
            stroke="#ffffff"
            strokeWidth="4"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          
           {/* Yellow progress line along the curve */}
           <path
             id="progress-path"
             d="M 0,100 Q 720,0 1440,100"
             fill="none"
             stroke="#FFD700"
            strokeWidth="5"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            pathLength="1"
            ref={progressPathRef}
            style={{
              strokeDasharray: `${safeLineProgress} 999`,
              strokeDashoffset: "0",
              opacity: safeLineProgress > 0.001 ? 1 : 0,
            }}
          />
          
        </svg>

        {(() => {
          const carWidth = CAR_BASE_WIDTH * carScreenPosition.scale;
          const carHeight = (CAR_BASE_WIDTH / CAR_ASPECT_RATIO) * carScreenPosition.scale;
          const anchorX = carWidth * CAR_ANCHOR_X_RATIO;
          const anchorY = carHeight * CAR_WHEEL_CONTACT_RATIO;
          const bounceOffset = carBounceOffset * carScreenPosition.scale;

          return (
            <div
              className="pointer-events-none absolute left-0 top-0 hidden sm:block"
              style={{
                transform: `translate(${carScreenPosition.x}px, ${carScreenPosition.y}px) rotate(${carScreenPosition.angle}deg) translate(${-anchorX}px, ${-anchorY}px)`,
                zIndex: 5,
              }}
            >
              <div
                style={{
                  width: `${carWidth}px`,
                  height: `${carHeight}px`,
                  transform: `translateY(${bounceOffset}px)`,
                }}
              >
                <div
                  className="w-full h-full drop-shadow-md [&>svg]:block [&>svg]:h-full [&>svg]:w-full"
                  role="img"
                  aria-label="Progress car"
                  dangerouslySetInnerHTML={{ __html: carProgressInlineSvg }}
                />
              </div>
            </div>
          );
        })()}
      </div>

      {/* Main Content with White Background - fit to viewport */}
      <main
        ref={mainScrollRef}
        className="bg-white pt-0 sm:pt-1 pb-12 sm:pb-20 flex-1 min-h-0 flex flex-col overflow-y-auto"
      >
      <div className="max-w-3xl mx-auto w-full flex-grow flex flex-col justify-start gap-0.5 sm:gap-1 px-4 sm:px-6 lg:px-8">
          {currentStep > 1 && (
            <div className="w-full flex items-center gap-2 pt-0 pb-1 sm:pt-1 sm:pb-2 text-gray-800">
              <button
                onClick={prevStep}
                className="flex items-center gap-2 text-gray-800 hover:text-gray-900 font-semibold underline underline-offset-4 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous step</span>
              </button>
            </div>
          )}

          {/* Step Content */}
          <div className={`form-container flex flex-1 flex-col items-center sm:items-stretch justify-start ${currentStep === 1 ? "" : "form-step-rounded"}`}>

            {/* Step Components - Only render the current step */}
            <div className="w-full text-center">
              {/* Base Steps 1-7 */}
              {currentStep === 1 && <VehicleTypeStep formData={formData} updateFormData={updateFormData} onNext={() => navigateToStep(currentStep + 1)} />}
              {currentStep === 2 && <LoanAmountStep formData={formData} updateFormData={updateFormData} />}
              {currentStep === 3 && <DrivingLicenceStep formData={formData} updateFormData={updateFormData} onNext={() => navigateToStep(currentStep + 1)} />}
              {currentStep === 4 && <MaritalStatusStep formData={formData} updateFormData={updateFormData} onNext={() => navigateToStep(currentStep + 1)} />}
              {currentStep === 5 && <DateOfBirthStep formData={formData} updateFormData={updateFormData} />}
              {currentStep === 6 && <AddressStep formData={formData} updateFormData={updateFormData} />}
              {currentStep === 7 && <HousingSituationStep formData={formData} updateFormData={updateFormData} onNext={() => navigateToStep(currentStep + 1)} />}
              {currentStep === 8 && <AddressDurationStep formData={formData} updateFormData={updateFormData} />}
              
              {/* Previous Address Steps 8-19 (only if needed) */}
              {currentStep === 9 && currentStep < getEmploymentStep() && <PreviousAddressStep formData={formData} updateFormData={updateFormData} addressIndex={0} />}
              {currentStep === 10 && currentStep < getEmploymentStep() && <PreviousHousingSituationStep formData={formData} updateFormData={updateFormData} addressIndex={0} onNext={() => navigateToStep(currentStep + 1)} />}
              {currentStep === 11 && currentStep < getEmploymentStep() && <PreviousAddressDurationStep formData={formData} updateFormData={updateFormData} addressIndex={0} />}
              
              {currentStep === 12 && currentStep < getEmploymentStep() && <PreviousAddressStep formData={formData} updateFormData={updateFormData} addressIndex={1} />}
              {currentStep === 13 && currentStep < getEmploymentStep() && <PreviousHousingSituationStep formData={formData} updateFormData={updateFormData} addressIndex={1} onNext={() => navigateToStep(currentStep + 1)} />}
              {currentStep === 14 && currentStep < getEmploymentStep() && <PreviousAddressDurationStep formData={formData} updateFormData={updateFormData} addressIndex={1} />}
              
              {currentStep === 15 && currentStep < getEmploymentStep() && <PreviousAddressStep formData={formData} updateFormData={updateFormData} addressIndex={2} />}
              {currentStep === 16 && currentStep < getEmploymentStep() && <PreviousHousingSituationStep formData={formData} updateFormData={updateFormData} addressIndex={2} onNext={() => navigateToStep(currentStep + 1)} />}
              {currentStep === 17 && currentStep < getEmploymentStep() && <PreviousAddressDurationStep formData={formData} updateFormData={updateFormData} addressIndex={2} />}
              
              {currentStep === 18 && currentStep < getEmploymentStep() && <PreviousAddressStep formData={formData} updateFormData={updateFormData} addressIndex={3} />}
              {currentStep === 19 && currentStep < getEmploymentStep() && <PreviousHousingSituationStep formData={formData} updateFormData={updateFormData} addressIndex={3} onNext={() => navigateToStep(currentStep + 1)} />}
              {currentStep === 20 && currentStep < getEmploymentStep() && <PreviousAddressDurationStep formData={formData} updateFormData={updateFormData} addressIndex={3} />}
              
              {/* Employment and Final Steps */}
              {(() => {
                const employmentStartStep = getEmploymentStep();
                return (
                  <>
                    {currentStep === employmentStartStep && <EmploymentStep formData={formData} updateFormData={updateFormData} onNext={() => navigateToStep(currentStep + 1)} />}
                    {currentStep === employmentStartStep + 1 && <JobDetailsStep formData={formData} updateFormData={updateFormData} />}
                    {currentStep === employmentStartStep + 2 && <EmploymentDurationStep formData={formData} updateFormData={updateFormData} />}
                    {currentStep === employmentStartStep + 3 && <MonthlyIncomeStep formData={formData} updateFormData={updateFormData} />}
                    {currentStep === employmentStartStep + 4 && <PersonalDetailsStep formData={formData} updateFormData={updateFormData} />}
                    {currentStep === employmentStartStep + 5 && (
                      <ContactDetailsStep
                        formData={formData}
                        updateFormData={updateFormData}
                        onSubmit={nextStep}
                      />
                    )}
                  </>
                );
              })()}
            </div>

            {/* Navigation - Show Next button centered at bottom for input steps */}
            {currentStep !== 1 && currentStep < getTotalSteps() && (
            <div className="mt-4 sm:mt-5 flex flex-col items-center gap-3 max-w-md mx-auto px-0 sm:px-4 w-full">
              {/* Show Next button for input-type steps (DOB, addresses, durations, job details, income, loan, personal details, contact), but skip employment selection (auto-advances) */}
              <div className="w-full sm:flex sm:items-center sm:justify-center min-h-[52px]">
                {showNextButton ? (
                  <button
                    onClick={nextStep}
                    className="flex items-center justify-center gap-2 px-12 py-3 text-white bg-[#FF5A5F] hover:bg-[#E54B50] rounded-full font-semibold transition-all text-lg shadow-lg hover:shadow-xl"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                ) : null}
              </div>
              
              <div className="flex flex-col items-center gap-2 mt-3 sm:mt-4">
                <div className="flex justify-center">
                  <a
                    href="https://uk.trustpilot.com/review/carfinanced.co.uk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex"
                  >
                    <img
                      src={trustpilotLogo}
                      alt="Trustpilot rating"
                      className="h-4 sm:h-5 md:h-6 w-auto"
                    />
                  </a>
                </div>
              </div>
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
    setTimeout(() => onNext(), 300); // Auto-advance after selection
  };

  return (
    <div className="py-4">
      <h1 className="text-2xl md:text-3xl font-bold mb-8 px-4" style={{ fontFamily: 'Inter, sans-serif' }}>
        <span className="text-gray-900">What would you like </span>
        <span className="text-[#FF585E]">to finance?</span>
      </h1>
      
      {/* Vehicle Selection Buttons - Auto advance on selection */}
      <div className="flex flex-wrap sm:flex-nowrap justify-center items-stretch gap-4 md:gap-6 w-full max-w-xs sm:max-w-md mx-auto mb-12">
        {[
          { 
            value: "car", 
            label: "Car",
            icon: (
              <img src={carIcon} alt="" className="h-12 w-12 object-contain scale-x-[-1]" />
            )
          },
          { 
            value: "van", 
            label: "Van",
            icon: (
              <img src={vanIcon} alt="" className="h-12 w-12 object-contain" />
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
                ? 'bg-[#DFFFC7] border-black border-[3px] text-gray-900' 
                : 'bg-white border-gray-300 text-gray-700'
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

      {/* Bottom Navigation - Privacy policy only (Back button is fixed at top) */}
      <div className="flex flex-col items-center gap-6 max-w-md mx-auto px-4 mt-4 sm:mt-5">
        <div className="flex justify-center">
          <a
            href="https://uk.trustpilot.com/review/carfinanced.co.uk"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex"
          >
            <img
              src={trustpilotLogo}
              alt="Trustpilot rating"
              className="h-4 sm:h-5 md:h-6 w-auto"
            />
          </a>
        </div>
        <p className="text-gray-600 text-center text-sm">
          By starting your quote you're agreeing to our{" "}
          <a href="https://carfinanced.co.uk/privacy" className="text-black font-bold underline hover:underline" target="_blank" rel="noopener noreferrer">privacy policy</a>.
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
    if (hasFullLicence) {
      setTimeout(() => onNext(), 300); // Auto-advance if Yes
    }
  };

  const handleLicenceTypeSelection = (licenceType: string) => {
    updateFormData({ licenceType: licenceType as any });
    setTimeout(() => onNext(), 300); // Auto-advance after licence type selection
  };

  return (
    <div>
      <h1 className="text-[38px] font-bold mb-12">
        <span className="text-gray-900">Do you have a </span>
        <span className="text-[#FF585E]">full UK driving licence?</span>
      </h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 max-w-[600px] mx-auto justify-items-center">
        <button
          onClick={() => handleLicenceSelection(true)}
          className={`w-[280px] max-w-full h-14 sm:h-16 rounded-2xl border-2 text-base font-medium transition-all flex items-center justify-center ${
            formData.hasFullLicence === true 
              ? 'bg-[#DFFFC7] border-black border-[3px] text-foreground' 
              : 'bg-background border-gray-300 text-foreground'
          }`}
        >
          Yes
        </button>
        <button
          onClick={() => handleLicenceSelection(false)}
          className={`w-[280px] max-w-full h-14 sm:h-16 rounded-2xl border-2 text-base font-medium transition-all flex items-center justify-center ${
            formData.hasFullLicence === false 
              ? 'bg-[#DFFFC7] border-black border-[3px] text-foreground' 
              : 'bg-background border-gray-300 text-foreground'
          }`}
        >
          No
        </button>
      </div>

      {formData.hasFullLicence === false && (
        <div className="mt-12">
          <h2 className="text-xl font-bold text-foreground mb-8">
            What licence do you have?
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-[600px] mx-auto justify-items-center">
            {[
              { value: "none", label: "None" },
              { value: "provisional-uk", label: "Provisional UK" },
              { value: "eu", label: "EU" },
              { value: "international", label: "International" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleLicenceTypeSelection(option.value)}
                className={`w-[280px] max-w-full h-14 sm:h-16 rounded-2xl border-2 text-base font-medium transition-all flex items-center justify-center text-center ${
                  formData.licenceType === option.value 
                    ? 'bg-[#DFFFC7] border-black border-[3px] text-foreground' 
                    : 'bg-background border-gray-300 text-foreground'
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
    setTimeout(() => onNext(), 300); // Auto-advance after selection
  };

  return (
    <div>
      <h1 className="text-[38px] font-bold mb-12">
        <span className="text-gray-900">Which best </span>
        <span className="text-[#FF585E]">describes you?</span>
      </h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-3xl mx-auto justify-items-center">
        {[
          { value: "married", label: "Married" },
          { value: "single", label: "Single" },
          { value: "cohabiting", label: "Cohabiting" },
          { value: "divorced", label: "Divorced" },
          { value: "separated", label: "Separated" },
          { value: "widowed", label: "Widowed" },
          { value: "civil-partnership", label: "Civil Partnership" },
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => handleSelection(option.value)}
            className={`w-[280px] max-w-full h-14 sm:h-16 rounded-2xl border-2 text-base font-medium transition-all flex items-center justify-center text-center ${
              formData.maritalStatus === option.value 
                ? 'bg-[#DFFFC7] border-black border-[3px] text-foreground' 
                : 'bg-background border-gray-300 text-foreground'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

const DateOfBirthStep = ({ formData, updateFormData }: { formData: FormData; updateFormData: (updates: Partial<FormData>) => void }) => {
  const handleDateChange = (value: string) => {
    updateFormData({ dateOfBirth: value });
  };
  const [displayDate, setDisplayDate] = useState("");
  const dateInputRef = useRef<HTMLInputElement | null>(null);
  const [isIOS, setIsIOS] = useState(false);

  const formatIsoToDisplay = (value: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const [year, month, day] = value.split("-");
    return `${day}/${month}/${year}`;
  };

  const formatDisplayInput = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  };

  const parseDisplayToIso = (value: string) => {
    const cleaned = value.trim();
    if (!/^\d{2}[\/-]\d{2}[\/-]\d{4}$/.test(cleaned)) return null;
    const parts = cleaned.split(/[\/-]/);
    const day = Number(parts[0]);
    const month = Number(parts[1]);
    const year = Number(parts[2]);
    if (!day || !month || !year) return null;
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
      return null;
    }
    const isoMonth = String(month).padStart(2, "0");
    const isoDay = String(day).padStart(2, "0");
    return `${year}-${isoMonth}-${isoDay}`;
  };

  useEffect(() => {
    setDisplayDate(formatIsoToDisplay(formData.dateOfBirth || ""));
  }, [formData.dateOfBirth]);

  useEffect(() => {
    if (typeof navigator === "undefined") return;
    const isIOSDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    setIsIOS(isIOSDevice);
  }, []);

  const handleDisplayChange = (value: string) => {
    const formatted = formatDisplayInput(value);
    setDisplayDate(formatted);
    const iso = parseDisplayToIso(formatted);
    if (iso) {
      handleDateChange(iso);
    }
  };

  const handleDisplayBlur = () => {
    const formatted = formatDisplayInput(displayDate);
    setDisplayDate(formatted);
    const iso = parseDisplayToIso(formatted);
    if (iso) {
      handleDateChange(iso);
      setDisplayDate(formatIsoToDisplay(iso));
    }
  };

  const openCalendar = () => {
    const input = dateInputRef.current;
    if (!input) return;
    const picker = (input as HTMLInputElement & { showPicker?: () => void }).showPicker;
    if (picker) {
      picker.call(input);
    } else {
      input.click();
      input.focus();
    }
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
      <h1 className="text-[38px] font-bold mb-12">
        <span className="text-gray-900">What is your </span>
        <span className="text-[#FF585E]">date of birth?</span>
      </h1>
      
      <div className="mx-auto w-full max-w-[640px]">
        <div className="relative">
          <input
            type="text"
            value={displayDate}
            onChange={(e) => handleDisplayChange(e.target.value)}
            onBlur={handleDisplayBlur}
            placeholder="DD/MM/YYYY"
            inputMode="numeric"
            className={`w-full px-5 py-4 pr-12 rounded-2xl border-2 text-lg font-medium transition-all ${
              isUnder18 
                ? 'border-red-500 focus:border-red-500' 
                : 'border-border focus:border-foreground/30'
            } bg-background text-foreground focus:outline-none`}
          />
          {isIOS ? (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
              <CalendarDays className="h-5 w-5" />
            </span>
          ) : (
            <button
              type="button"
              onClick={openCalendar}
              aria-label="Open calendar"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              <CalendarDays className="h-5 w-5" />
            </button>
          )}
          <input
            ref={dateInputRef}
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => {
              handleDateChange(e.target.value);
              setDisplayDate(formatIsoToDisplay(e.target.value));
            }}
            max={new Date(Date.now() - 18 * 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
            aria-label="Date of birth"
            className={
              isIOS
                ? "absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 opacity-0 cursor-pointer z-10"
                : "sr-only"
            }
            tabIndex={isIOS ? 0 : -1}
          />
        </div>
        
        
      </div>
    </div>
  );
};

const AddressStep = ({ formData, updateFormData }: { formData: FormData; updateFormData: (updates: Partial<FormData>) => void }) => {
  const handleAddressChange = (address: string, details?: any) => {
    updateFormData({ address });
    if (details?.line1 || details?.postcode) {
      updateFormData({
        fullAddress: {
          line1: details.line1 || "",
          line2: details.line2 || "",
          city: details.city || "",
          postcode: details.postcode || ""
        }
      });
      return;
    }
    
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
      <h1 className="text-[38px] font-bold mb-12">
        <span className="text-gray-900">Next, where </span>
        <span className="text-[#FF585E]">do you live?</span>
      </h1>
      
      <p className="text-gray-600 text-base mb-6">
        Just start typing your postcode or address..
      </p>
      <div className="w-full max-w-[640px] mx-auto">
        <AddressAutocomplete
          value={formData.address}
          onChange={handleAddressChange}
          className="address-autocomplete"
          placeholder="e.g 'M24 1SL' or 'Moston Road'"
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
    setTimeout(() => onNext(), 300); // Auto-advance after selection
  };

  return (
    <div>
      <h1 className="text-[38px] font-bold mb-12">
        <span className="text-gray-900">Ok, Which best </span>
        <span className="text-[#FF585E]">describes you?</span>
      </h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto justify-items-center">
        {[
          { value: "private-tenant", label: "Private tenant" },
          { value: "home-owner", label: "Home owner" },
          { value: "council-tenant", label: "Council tenant" },
          { value: "living-with-parents", label: "Living with parents" },
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => handleSelection(option.value)}
            className={`w-[280px] max-w-full h-14 sm:h-16 rounded-2xl border-2 text-base font-medium transition-all flex items-center justify-center text-center ${
              formData.housingSituation === option.value 
                ? 'bg-[#DFFFC7] border-black border-[3px] text-foreground' 
                : 'bg-background border-gray-300 text-foreground'
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
    <h1 className="text-[38px] font-bold mb-8">
      <span className="text-gray-900">How long have you </span>
      <span className="text-[#FF585E]">lived at {formData.address}?</span>
    </h1>
    
    <p className="text-muted-foreground text-base mb-12">
      Lenders ask for 3 years' address history.
    </p>
    
    <div className="flex flex-row flex-nowrap items-center gap-3 justify-center w-full max-w-[640px] mx-auto">
      <input
        type="number"
        placeholder="Years"
        value={formData.addressDurationYears}
        onChange={(e) => updateFormData({ addressDurationYears: e.target.value })}
        className="address-input duration-input"
        min="0"
        max="99"
        inputMode="numeric"
        pattern="[0-9]*"
      />
      <input
        type="number"
        placeholder="Months"
        value={formData.addressDurationMonths}
        onChange={(e) => updateFormData({ addressDurationMonths: e.target.value })}
        className="address-input duration-input"
        min="0"
        max="11"
        inputMode="numeric"
        pattern="[0-9]*"
      />
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
      <h1 className="text-[38px] font-bold mb-12">
        <span className="text-gray-900">And what was your </span>
        <span className="text-[#FF585E]">previous address?</span>
      </h1>
      
      <p className="text-gray-600 text-base mb-6">
        Just start typing your postcode or address..
      </p>
      <div className="w-full max-w-[640px] mx-auto">
        <AddressAutocomplete
          value={formData.previousAddresses[addressIndex]?.address || ""}
          onChange={handleAddressChange}
          className="address-autocomplete"
          placeholder="e.g 'M24 1SL' or 'Moston Road'"
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
    console.log('?? Housing situation selection:', housingSituation, 'for addressIndex:', addressIndex);
    
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
    
    console.log('?? Updated addresses:', updatedAddresses);
    updateFormData({ previousAddresses: updatedAddresses });
    setTimeout(() => onNext?.(), 300); // Auto-advance after selection
  };

  return (
    <div>
      <h1 className="text-[38px] font-bold mb-12">
        <span className="text-gray-900">Ok, Which best </span>
        <span className="text-[#FF585E]">describes you?</span>
      </h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto justify-items-center">
        {[
          { value: "private-tenant", label: "Private tenant" },
          { value: "home-owner", label: "Home owner" },
          { value: "council-tenant", label: "Council tenant" },
          { value: "living-with-parents", label: "Living with parents" },
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => handleSituationChange(option.value)}
            className={`w-[280px] max-w-full h-14 sm:h-16 rounded-2xl border-2 text-base font-medium transition-all flex items-center justify-center text-center ${
              formData.previousAddresses[addressIndex]?.housingSituation === option.value 
                ? 'bg-[#DFFFC7] border-black border-[3px] text-foreground' 
                : 'bg-background border-gray-300 text-foreground'
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
      <h1 className="text-[38px] font-bold mb-8">
        <span className="text-gray-900">How long did you </span>
        <span className="text-[#FF585E]">live at {address}?</span>
      </h1>
      
      <div className="max-w-xs mx-auto mb-8">
        <p className="text-muted-foreground text-base">
          Lenders require 3 years of complete address history.
        </p>
      </div>
      
      <div className="flex flex-row flex-nowrap items-center gap-3 w-full max-w-[640px] mx-auto mb-8 justify-center">
        <input
          type="number"
          placeholder="Years"
          value={formData.previousAddresses[addressIndex]?.durationYears || ""}
          onChange={(e) => handleYearsChange(e.target.value)}
          className="address-input duration-input"
          min="0"
          max="99"
          inputMode="numeric"
          pattern="[0-9]*"
        />
        <input
          type="number"
          placeholder="Months"
          value={formData.previousAddresses[addressIndex]?.durationMonths || ""}
          onChange={(e) => handleMonthsChange(e.target.value)}
          className="address-input duration-input"
          min="0"
          max="11"
          inputMode="numeric"
          pattern="[0-9]*"
        />
      </div>
      
      {(hasEnoughHistory || hasMaxAddresses) && (
        <div className="max-w-xs mx-auto">
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
        <div className="max-w-xs mx-auto mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-foreground font-semibold text-sm mb-4">
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
            className="text-primary font-semibold underline text-sm hover:text-primary/80"
          >
            I don't have any more previous addresses
          </button>
        </div>
      )}
    </div>
  );
};

export default CarFinanceApplication;












































