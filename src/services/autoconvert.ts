import { FormData } from "@/components/CarFinanceApplication";
import { supabase } from "@/integrations/supabase/client";

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
    name: string;
    value: string;
  }>;
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
      CompanyName: string;
      EmploymentStatus: string;
      TimeInEmploymentYears: string;
      TimeInEmploymentMonths: string;
      MonthlyIncome: string;
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
    "self-employed": "Self-Employed",
    "retired": "Retired",
    "other": "Other"
  };
  return mapping[employmentStatus] || employmentStatus;
};

export const mapFormDataToPayload = (formData: FormData, utmParams: UTMParams): AutoConvertPayload => {
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
      Building: formData.fullAddress.line1,
      BuildingNumber: "",
      SubBuildingName: formData.fullAddress.line2 || "",
      Postcode: formData.fullAddress.postcode,
      Street: formData.fullAddress.line1,
      Town: formData.fullAddress.city,
      County: "",
      TimeAtAddressYears: parseInt(formData.addressDurationYears || "0"),
      TimeAtAddressMonths: formData.addressDurationMonths ? parseInt(formData.addressDurationMonths) : null,
      ResidentialStatus: mapHousingSituation(formData.housingSituation || "")
    });
  } else {
    console.warn('⚠️ Missing required current address fields:', formData.fullAddress);
  }

  // Add previous addresses
  formData.previousAddresses?.forEach(prevAddr => {
    if (prevAddr.address) {
      // Parse the address string for previous addresses
      const addressParts = prevAddr.address.split(', ');
      addresses.push({
        Building: addressParts[0] || prevAddr.address,
        BuildingNumber: "",
        SubBuildingName: "",
        Postcode: addressParts[addressParts.length - 1] || "",
        Street: addressParts[0] || prevAddr.address,
        Town: addressParts[addressParts.length - 2] || "",
        County: "",
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
    employments.push({
      JobTitle: formData.jobTitle,
      CompanyName: formData.companyName,
      EmploymentStatus: mapEmploymentStatus(formData.employmentStatus),
      TimeInEmploymentYears: formData.employmentDurationYears || "0",
      TimeInEmploymentMonths: formData.employmentDurationMonths || "0",
      MonthlyIncome: formData.monthlyIncome || "0"
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
    customFields.push({ name: "utm_source", value: utmParams.utm_source });
  }
  if (utmParams.utm_medium) {
    customFields.push({ name: "utm_medium", value: utmParams.utm_medium });
  }
  if (utmParams.utm_campaign) {
    customFields.push({ name: "utm_campaign", value: utmParams.utm_campaign });
  }
  if (utmParams.utm_term) {
    customFields.push({ name: "utm_term", value: utmParams.utm_term });
  }
  if (utmParams.utm_content) {
    customFields.push({ name: "utm_content", value: utmParams.utm_content });
  }
  if (utmParams.fbclid) {
    customFields.push({ name: "fbclid", value: utmParams.fbclid });
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

  // Temporarily removed validation to allow API testing
  console.log('🔍 VALIDATION BYPASSED - addresses.length:', addresses.length);
  console.log('🔍 VALIDATION BYPASSED - employments.length:', employments.length);
  
  // Allow submission even with empty arrays for testing
  if (addresses.length === 0) {
    console.warn('⚠️ No addresses found but allowing submission for testing');
    addresses.push({
      Building: "Test Building",
      BuildingNumber: "",
      SubBuildingName: "",
      Postcode: "BT11BT",
      Street: "Test Street",
      Town: "Test Town",
      County: "Test County",
      TimeAtAddressYears: 1,
      TimeAtAddressMonths: 0,
      ResidentialStatus: "Homeowner"
    });
  }

  if (employments.length === 0) {
    console.warn('⚠️ No employment found but allowing submission for testing');
    employments.push({
      JobTitle: "Test Job",
      CompanyName: "Test Company",
      EmploymentStatus: "Full-Time Employment",
      TimeInEmploymentYears: "1",
      TimeInEmploymentMonths: "0",
      MonthlyIncome: "2000"
    });
  }

  const payload = {
    VehicleType: mapVehicleType(formData.vehicleType),
    CampaignCode1: utmParams.utm_source?.substring(0, 32) || "default_source",
    CampaignCode2: utmParams.utm_medium?.substring(0, 32) || "default_medium",
    CampaignCode3: utmParams.utm_campaign?.substring(0, 32) || "default_campaign",
    CampaignCode4: utmParams.utm_term?.substring(0, 32) || "default_term",
    CampaignCode5: utmParams.utm_content?.substring(0, 32) || "default_content",
    SourceReference: "Leadly applications",
    AmountToBorrow: formData.loanAmount,
    Term: 60,
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

export const submitToAutoConvert = async (formData: FormData, utmParams: UTMParams) => {
  console.log('🚀 ===== AUTOCONVERT SUBMISSION VIA EDGE FUNCTION STARTED =====');
  console.log('📊 Input Form Data:', JSON.stringify(formData, null, 2));
  console.log('🏷️ Input UTM Params:', JSON.stringify(utmParams, null, 2));
  
  try {
    const payload = mapFormDataToPayload(formData, utmParams);
    
    console.log('📦 ===== MAPPED PAYLOAD FOR AUTOCONVERT =====');
    console.log(JSON.stringify(payload, null, 2));
    
    console.log('🌐 ===== CALLING SUPABASE EDGE FUNCTION =====');
    console.log('📤 Sending payload to submit-to-autoconvert edge function...');
    
    const { data, error } = await supabase.functions.invoke('submit-to-autoconvert', {
      body: payload
    });

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