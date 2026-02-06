import { FormData } from "@/components/CarFinanceApplication";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, supabase } from "@/integrations/supabase/client";
import { getRuntimeConfig } from "@/config/runtimeConfig";

export interface AutoConvertPayload {
  VehicleType: string;
  CampaignCode1: string;
  CampaignCode2?: string;
  CampaignCode3?: string;
  CampaignCode4?: string;
  CampaignCode5?: string;
  SourceReference: string;
  AmountToBorrow: string;
  Term: number;
  Products: any[];
  Consent: any[];
  Affordability: any;
  FinanceDetails: any;
  CustomFields: Array<{
    Key: string;
    Value: string;
  }>;
  LoanTerm?: number;
  LoanAmount?: number;
  Vehicles: any[];
  Applicants: Array<{
    Title: string;
    Forename: string;
    Surname: string;
    Email: string;
    Mobile: string;
    DateOfBirth: string;
    MaritalStatus: string;
    DrivingLicenceType: string;
    Addresses: Array<{
      Building?: string;
      BuildingName?: string;
      BuildingNumber?: string;
      SubBuildingName?: string;
      Postcode: string;
      Street: string;
      Town: string;
      County: string;
      TimeAtAddressYears: number;
      TimeAtAddressMonths: number | null;
      ResidentialStatus: string;
    }>;
    Employments: Array<{
      JobTitle: string;
      Company?: string;
      CompanyName?: string;
      Employer?: string;
      EmploymentStatus: string;
      TimeAtEmployerYears?: number;
      TimeAtEmployerMonths?: number | null;
      TimeInEmploymentYears?: string;
      TimeInEmploymentMonths?: string;
      MonthlyIncome?: number | string;
      NetMonthlyIncome?: number | string;
    }>;
  }>;
}

export interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  fbclid?: string;
}

const supabaseNoSession = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

const mapVehicleType = (vehicleType: string): string => {
  const mapping: Record<string, string> = {
    car: "Car",
    van: "Van", 
    bike: "Motorcycle"
  };
  return mapping[vehicleType] || vehicleType;
};

const mapMaritalStatus = (maritalStatus: string): string => {
  const mapping: Record<string, string> = {
    married: "Married",
    single: "Single", 
    cohabiting: "Living Together",
    divorced: "Divorced",
    separated: "Separated",
    widowed: "Widowed",
    "civil-partnership": "Civil Partnership"
  };
  return mapping[maritalStatus] || maritalStatus;
};

const mapLicenceType = (hasFullLicence: boolean | null, licenceType: string): string => {
  if (hasFullLicence === true) return "Full UK";
  if (hasFullLicence === false) {
    const mapping: Record<string, string> = {
      "provisional-uk": "Provisional UK",
      "eu": "EU",
      "international": "International",
      "none": "None"
    };
    return mapping[licenceType] || "None";  
  }
  return "None";
};

const mapHousingSituation = (housingSituation: string): string => {
  const mapping: Record<string, string> = {
    "private-tenant": "Tenant - Private",
    "home-owner": "Homeowner",
    "council-tenant": "Tenant - Council", 
    "living-with-parents": "Living With Family"
  };
  return mapping[housingSituation] || housingSituation;
};

const mapEmploymentStatus = (employmentStatus: string): string => {
  const mapping: Record<string, string> = {
    "full-time": "Full-Time Employment",
    "part-time": "Part-Time Employment",
    "temporary": "Temporary/Contract",
    "contract": "Temporary/Contract",
    "self-employed": "Self-Employed",
    "benefits": "Benefits",
    "education": "Education",
    "retired": "Retired",
    "homemaker": "Homemaker",
    "carer": "Carer",
    "armed-services": "Armed Services",
    "other": "Other"
  };
  return mapping[employmentStatus] || employmentStatus;
};

export const mapFormDataToPayload = (formData: FormData, utmParams: UTMParams): AutoConvertPayload => {
  const splitBuildingNumber = (line: string) => {
    const cleaned = (line || "").trim();
    const match = cleaned.match(/^(\d+[A-Z]?(\s?-\s?\d+[A-Z]?)?)/i);
    if (!match) {
      return {
        buildingNumber: "",
        street: cleaned,
        buildingName: cleaned
      };
    }

    const buildingNumber = match[1].replace(/\s+/g, "");
    const street = cleaned.slice(match[0].length).trim().replace(/^,/, "").trim();

    return {
      buildingNumber,
      street,
      buildingName: ""
    };
  };

  const mapAddressFields = (line1: string, line2: string, town: string, postcode: string) => {
    const { buildingNumber, street, buildingName } = splitBuildingNumber(line1);
    const hasBuildingNumber = Boolean(buildingNumber);
    const buildingNameValue = hasBuildingNumber ? "" : buildingName;
    const streetValue = hasBuildingNumber ? (street || line1) : (line2 || line1);

    return {
      Building: buildingNameValue,
      BuildingName: buildingNameValue,
      BuildingNumber: buildingNumber,
      SubBuildingName: hasBuildingNumber ? (line2 || "") : "",
      Postcode: postcode,
      Street: streetValue,
      Town: town,
      County: ""
    };
  };

  const parseAddressParts = (address: string) => {
    const parts = address.split(",").map((part) => part.trim()).filter(Boolean);
    const postcode = parts[parts.length - 1] || "";
    const town = parts.length > 1 ? (parts[parts.length - 2] || "") : "";
    const line1 = parts[0] || address;
    const line2 = parts.length > 3 ? parts.slice(1, parts.length - 2).join(", ") : parts.slice(1, parts.length - 2).join(", ");
    return mapAddressFields(line1, line2, town, postcode);
  };

  console.log('🔄 ===== MAPPING FORM DATA TO PAYLOAD =====');
  console.log('📋 Raw Form Data Fields:', {
    vehicleType: formData.vehicleType,
    dateOfBirth: formData.dateOfBirth,
    maritalStatus: formData.maritalStatus,
    fullAddress: formData.fullAddress,
    housingSituation: formData.housingSituation,
    employmentStatus: formData.employmentStatus,
    jobTitle: formData.jobTitle,
    companyName: formData.companyName
  });

  // Create addresses array starting with current address
  const addresses = [];
  
  // Add current address - ensure we have required fields
  if (formData.fullAddress?.line1 && formData.fullAddress?.city && formData.fullAddress?.postcode) {
    addresses.push({
      ...mapAddressFields(
        formData.fullAddress.line1,
        formData.fullAddress.line2 || "",
        formData.fullAddress.city,
        formData.fullAddress.postcode
      ),
      TimeAtAddressYears: parseInt(formData.addressDurationYears || "0"),
      TimeAtAddressMonths: formData.addressDurationMonths ? parseInt(formData.addressDurationMonths) : null,
      ResidentialStatus: mapHousingSituation(formData.housingSituation || "")
    });
  } else if (formData.address) {
    const parsed = parseAddressParts(formData.address);
    addresses.push({
      ...parsed,
      TimeAtAddressYears: parseInt(formData.addressDurationYears || "0"),
      TimeAtAddressMonths: formData.addressDurationMonths ? parseInt(formData.addressDurationMonths) : null,
      ResidentialStatus: mapHousingSituation(formData.housingSituation || "")
    });
  } else {
    console.warn("Missing required current address fields", formData.fullAddress);
  }

  // Add previous addresses
  formData.previousAddresses?.forEach(prevAddr => {
    if (prevAddr.address) {
      const parsed = parseAddressParts(prevAddr.address);
      addresses.push({
        ...parsed,
        TimeAtAddressYears: parseInt(prevAddr.durationYears || "0"),
        TimeAtAddressMonths: prevAddr.durationMonths ? parseInt(prevAddr.durationMonths) : null,
        ResidentialStatus: mapHousingSituation(prevAddr.housingSituation || "")
      });
    }
  });

  console.log('🏠 Mapped Addresses:', addresses);

  // Create employments array
  const employments = [];
  if (formData.employmentStatus && formData.jobTitle && formData.companyName) {
    const employmentYears = parseInt(formData.employmentDurationYears || "0");
    const employmentMonths = formData.employmentDurationMonths ? parseInt(formData.employmentDurationMonths) : null;
    const monthlyIncome = formData.monthlyIncome ? parseInt(formData.monthlyIncome, 10) : undefined;
    employments.push({
      JobTitle: formData.jobTitle,
      Company: formData.companyName,
      CompanyName: formData.companyName,
      Employer: formData.companyName,
      EmploymentStatus: mapEmploymentStatus(formData.employmentStatus),
      TimeAtEmployerYears: employmentYears,
      TimeAtEmployerMonths: employmentMonths,
      TimeInEmploymentYears: formData.employmentDurationYears || "0",
      TimeInEmploymentMonths: formData.employmentDurationMonths || "0",
      NetMonthlyIncome: monthlyIncome
    });
  } else {
    console.warn('⚠️ Missing required employment fields:', {
      employmentStatus: formData.employmentStatus,
      jobTitle: formData.jobTitle,
      companyName: formData.companyName
    });
  }

  console.log('💼 Mapped Employments:', employments);

  // Create custom fields for UTM parameters
  const customFields = [];
  if (utmParams.utm_source) {
    customFields.push({ Key: "utm_source", Value: utmParams.utm_source });
  }
  if (utmParams.utm_medium) {
    customFields.push({ Key: "utm_medium", Value: utmParams.utm_medium });
  }
  if (utmParams.utm_campaign) {
    customFields.push({ Key: "utm_campaign", Value: utmParams.utm_campaign });
  }
  if (utmParams.utm_term) {
    customFields.push({ Key: "utm_term", Value: utmParams.utm_term });
  }
  if (utmParams.utm_content) {
    customFields.push({ Key: "utm_content", Value: utmParams.utm_content });
  }
  if (utmParams.fbclid) {
    customFields.push({ Key: "fbclid", Value: utmParams.fbclid });
  }

  // Validate required fields
  const requiredFields = {
    vehicleType: formData.vehicleType,
    dateOfBirth: formData.dateOfBirth,
    maritalStatus: formData.maritalStatus,
    title: formData.title,
    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.email,
    phoneNumber: formData.phoneNumber,
    loanAmount: formData.loanAmount
  };

  const missingFields = Object.entries(requiredFields)
    .filter(([key, value]) => !value || value === "")
    .map(([key]) => key);

  if (missingFields.length > 0) {
    console.error('❌ Missing required fields:', missingFields);
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }

  if (addresses.length === 0) {
    console.error("No addresses mapped from form data");
    throw new Error("Missing address details");
  }

  if (employments.length === 0) {
    console.error("No employment mapped from form data");
    throw new Error("Missing employment details");
  }

  const payload = {
    VehicleType: mapVehicleType(formData.vehicleType),
    CampaignCode1: utmParams.utm_source?.substring(0, 32) || "default_source",
    CampaignCode2: utmParams.utm_medium?.substring(0, 32) || "default_medium",
    CampaignCode3: utmParams.utm_campaign?.substring(0, 32) || "default_campaign",
    CampaignCode4: utmParams.utm_term?.substring(0, 32) || "default_term",
    CampaignCode5: utmParams.utm_content?.substring(0, 32) || "default_content",
    SourceReference: "Leadly applications",
    AmountToBorrow: (formData.loanAmount || "0"),
    Term: 60,
    LoanTerm: 60,
    LoanAmount: parseInt(formData.loanAmount || "0", 10),
    Products: [],
    Consent: [],
    Affordability: {},
    FinanceDetails: {},
    CustomFields: customFields,
    Vehicles: [],
    Applicants: [
      {
        Title: formData.title,
        Forename: formData.firstName,
        Surname: formData.lastName,
        Email: formData.email,
        Mobile: formData.phoneNumber,
        DateOfBirth: formData.dateOfBirth,
        MaritalStatus: mapMaritalStatus(formData.maritalStatus),
        DrivingLicenceType: mapLicenceType(formData.hasFullLicence, formData.licenceType),
        Addresses: addresses,
        Employments: employments
      }
    ]
  };

  console.log('✅ Final Payload Validation Passed');
  return payload;
};

const extractSupabaseFunctionError = async (error: any): Promise<string | undefined> => {
  try {
    const response = error?.context?.response;
    if (!response) return undefined;

    // Try JSON body from the edge function for structured error details
    const cloned = response.clone();
    const json = await cloned.json().catch(() => undefined);
    if (json?.error || json?.details) {
      return json.error ? `${json.error}${json.details ? `: ${json.details}` : ""}` : json.details;
    }

    // Fall back to plain text body
    const text = await response.text().catch(() => undefined);
    if (text) return text;

    if (typeof response.status === "number") {
      return `HTTP ${response.status}${response.statusText ? ` ${response.statusText}` : ""}`;
    }
  } catch (err) {
    console.warn("Failed to extract edge function error details", err);
  }
  return undefined;
};

export const submitToAutoConvert = async (formData: FormData, utmParams: UTMParams) => {
  console.log('🚀 ===== AUTOCONVERT SUBMISSION VIA EDGE FUNCTION STARTED =====');
  console.log('📊 Input Form Data:', JSON.stringify(formData, null, 2));
  console.log('🏷️ Input UTM Params:', JSON.stringify(utmParams, null, 2));
  
  try {
    const payload = mapFormDataToPayload(formData, utmParams);
    
    // Get API key ID from runtime config (config.json) or build-time env
    // If not set, uses default AUTOCONVERT_API_KEY
    const runtimeConfig = await getRuntimeConfig();
    const apiKeyId = runtimeConfig.autoconvertApiKeyId || import.meta.env.VITE_AUTOCONVERT_API_KEY_ID;
    
    console.log('📦 ===== MAPPED PAYLOAD FOR AUTOCONVERT =====');
    console.log(JSON.stringify(payload, null, 2));
    console.log('🔑 Using API Key ID:', apiKeyId || 'default');
    
    console.log('🌐 ===== CALLING SUPABASE EDGE FUNCTION =====');
    console.log('📤 Sending payload to submit-to-autoconvert edge function...');
    
    const invokeEdgeFunction = async (client: typeof supabase) => {
      return client.functions.invoke('submit-to-autoconvert', {
        body: {
          ...payload,
          apiKeyId
        }
      });
    };

    let { data, error } = await invokeEdgeFunction(supabase);

    if (error && error.message?.includes("non-2xx")) {
      console.warn("Edge function returned non-2xx. Retrying with anon-only client...");
      ({ data, error } = await invokeEdgeFunction(supabaseNoSession));
    }

    console.log('📨 ===== EDGE FUNCTION RESPONSE =====');
    console.log('✅ Response data:', JSON.stringify(data, null, 2));
    console.log('❌ Response error:', JSON.stringify(error, null, 2));

    if (error) {
      console.error('❌ Supabase Edge Function Error Details:', {
        name: error.name,
        message: error.message,
        context: error.context,
        details: error.details
      });

      const edgeDetails = await extractSupabaseFunctionError(error);
      if (edgeDetails) {
        throw new Error(`Edge function error: ${edgeDetails}`);
      }

      throw new Error(`Edge function error: ${error.message}`);
    }

    console.log('📨 ===== EDGE FUNCTION RESPONSE =====');
    console.log('Response from edge function:', JSON.stringify(data, null, 2));

    if (!data?.success) {
      console.error('❌ AutoConvert submission failed:', data?.error);
      throw new Error(data?.error || 'AutoConvert submission failed');
    }
    
    console.log('✅ ===== AUTOCONVERT SUCCESS VIA EDGE FUNCTION =====');
    console.log('📨 AutoConvert Data:', JSON.stringify(data.data, null, 2));
    
    return data.data;
  } catch (error) {
    console.error('❌ ===== AUTOCONVERT SUBMISSION FAILED =====');
    console.error('💥 Error Type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('📋 Error Message:', error instanceof Error ? error.message : String(error));
    console.error('🔍 Full Error Object:', error);
    
    throw error;
  }
};

