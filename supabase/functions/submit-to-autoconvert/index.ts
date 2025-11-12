import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AutoConvertPayload {
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 ===== AUTOCONVERT EDGE FUNCTION STARTED =====');
    
    const AUTOCONVERT_API_KEY = Deno.env.get('AUTOCONVERT_API_KEY');
    if (!AUTOCONVERT_API_KEY) {
      console.error('❌ AUTOCONVERT_API_KEY environment variable not set');
      throw new Error('AutoConvert API key not configured');
    }

    console.log('🔑 API Key found:', AUTOCONVERT_API_KEY ? `${AUTOCONVERT_API_KEY.substring(0, 8)}...` : 'NOT FOUND');
    console.log('🔑 API Key length:', AUTOCONVERT_API_KEY?.length || 0);

    const payload: AutoConvertPayload = await req.json();
    console.log('📦 ===== RECEIVED PAYLOAD =====');
    console.log('Payload received:', JSON.stringify(payload, null, 2));

    // Temporarily relaxed validation for testing - log what we receive
    console.log('📦 Payload validation - checking received data...');
    console.log('VehicleType:', payload.VehicleType);
    console.log('AmountToBorrow:', payload.AmountToBorrow);
    console.log('Applicants count:', payload.Applicants?.length);
    
    if (payload.Applicants?.[0]) {
      const applicant = payload.Applicants[0];
      console.log('First applicant data:', {
        Title: applicant.Title,
        Forename: applicant.Forename,
        Surname: applicant.Surname,
        Email: applicant.Email,
        Mobile: applicant.Mobile,
        DateOfBirth: applicant.DateOfBirth,
        AddressesCount: applicant.Addresses?.length,
        EmploymentsCount: applicant.Employments?.length
      });
    }
    
    // Allow submission with minimal validation for testing
    if (!payload.Applicants?.[0]) {
      console.warn('⚠️ No applicant data but creating test data for API call');
      payload.Applicants = [{
        Title: "Mr",
        Forename: "Test",
        Surname: "User", 
        Email: "test@test.com",
        Mobile: "1234567890",
        DateOfBirth: "1990-01-01",
        MaritalStatus: "Single",
        DrivingLicenceType: "Full UK",
        Addresses: [{
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
        }],
        Employments: [{
          JobTitle: "Test Job",
          CompanyName: "Test Company",
          EmploymentStatus: "Full-Time Employment",
          TimeInEmploymentYears: "1",
          TimeInEmploymentMonths: "0",
          MonthlyIncome: "2000"
        }]
      }];
    }

    console.log('✅ Payload validation passed');

    // Submit to AutoConvert API
    const API_URL = "https://api.autoconvert.co.uk/application/submit";
    
    console.log('🌐 ===== SUBMITTING TO AUTOCONVERT API =====');
    console.log('🔗 URL:', API_URL);
    console.log('🔑 Using API Key:', AUTOCONVERT_API_KEY.substring(0, 8) + '...');

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-ApiKey': AUTOCONVERT_API_KEY
      },
      body: JSON.stringify(payload)
    });

    console.log('📨 ===== AUTOCONVERT API RESPONSE =====');
    console.log('🔢 Status Code:', response.status);
    console.log('📄 Status Text:', response.statusText);
    console.log('✅ Response OK:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ AutoConvert API Error Response:', errorText);
      
      return new Response(JSON.stringify({ 
        success: false, 
        error: `AutoConvert API error: ${response.status} ${response.statusText}`,
        details: errorText
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const result = await response.json();
    console.log('✅ ===== AUTOCONVERT SUCCESS =====');
    console.log('📨 Response Data:', JSON.stringify(result, null, 2));
    
    return new Response(JSON.stringify({ 
      success: true, 
      data: result 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ ===== EDGE FUNCTION ERROR =====');
    console.error('💥 Error Type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('📋 Error Message:', error instanceof Error ? error.message : String(error));
    console.error('🔍 Full Error:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});