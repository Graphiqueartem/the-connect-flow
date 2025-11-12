import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, term, id } = await req.json();
    const apiKey = Deno.env.get('GETADDRESS_API_KEY');

    if (!apiKey) {
      throw new Error('GETADDRESS_API_KEY not configured');
    }

    console.log('Address lookup request:', { action, term, id });

    let data;

    if (action === 'autocomplete') {
      // Autocomplete search - returns list of suggestions
      const response = await fetch(
        `https://api.getAddress.io/autocomplete/${encodeURIComponent(term)}?api-key=${apiKey}&all=true`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('getAddress.io autocomplete error:', response.status, errorText);
        throw new Error(`getAddress.io API error: ${response.status}`);
      }

      data = await response.json();
      console.log('Autocomplete results:', data.suggestions?.length || 0, 'suggestions');

    } else if (action === 'get') {
      // Get full address details by ID
      const response = await fetch(
        `https://api.getAddress.io/get/${encodeURIComponent(id)}?api-key=${apiKey}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('getAddress.io get error:', response.status, errorText);
        throw new Error(`getAddress.io API error: ${response.status}`);
      }

      data = await response.json();
      console.log('Address details retrieved:', data);

    } else {
      throw new Error('Invalid action. Use "autocomplete" or "get"');
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in address-lookup function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
