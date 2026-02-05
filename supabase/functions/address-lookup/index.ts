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
    let payload: any = {};
    try {
      payload = await req.json();
    } catch {
      payload = {};
    }

    const url = new URL(req.url);
    const action = payload.action ?? url.searchParams.get('action') ?? undefined;
    const term = payload.term ?? url.searchParams.get('term') ?? undefined;
    const id = payload.id ?? url.searchParams.get('id') ?? undefined;
    const top = payload.top ?? url.searchParams.get('top') ?? undefined;
    const clientApiKey =
      payload.apiKey ??
      url.searchParams.get('apiKey') ??
      url.searchParams.get('api-key') ??
      undefined;

    const envApiKey = Deno.env.get('GETADDRESS_API_KEY');
    const apiKey = envApiKey || clientApiKey;

    if (!apiKey) {
      throw new Error('GETADDRESS_API_KEY not configured');
    }

    // Log which key source is being used (masked for security)
    const keySource = envApiKey ? 'env' : (clientApiKey ? 'client' : 'none');
    const maskedKey = apiKey ? `${apiKey.substring(0, 4)}...${apiKey.slice(-4)}` : 'none';
    console.log('Address lookup request:', { action, term, id, keySource, maskedKey });

    if (!action) {
      return new Response(
        JSON.stringify({ error: 'Missing action' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    let data;

    const parsedTop = Number(top);
    const hasTop = Number.isFinite(parsedTop);
    const autocompleteTop = hasTop ? Math.min(Math.max(parsedTop, 1), 100) : 100;
    const typeaheadTop = hasTop ? Math.min(Math.max(parsedTop, 1), 100) : 100;

    if (action === 'autocomplete') {
      // Autocomplete search - returns list of suggestions
      const response = await fetch(
        `https://api.getAddress.io/autocomplete/${encodeURIComponent(term)}?api-key=${apiKey}&all=true&top=${autocompleteTop}&show-postcode=true`,
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

    } else if (action === 'postcode') {
      // Full postcode search - returns all addresses for the postcode
      const response = await fetch(
        `https://api.getAddress.io/find/${encodeURIComponent(term)}?api-key=${apiKey}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('getAddress.io find error:', response.status, errorText);
        throw new Error(`getAddress.io API error: ${response.status}`);
      }

      data = await response.json();
      console.log('Postcode results:', Array.isArray(data?.addresses) ? data.addresses.length : 0, 'addresses');

    } else if (action === 'typeahead') {
      // Typeahead search - returns list of possible values
      const response = await fetch(
        `https://api.getAddress.io/typeahead/${encodeURIComponent(term)}?api-key=${apiKey}&top=${typeaheadTop}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('getAddress.io typeahead error:', response.status, errorText);
        throw new Error(`getAddress.io API error: ${response.status}`);
      }

      data = await response.json();
      console.log('Typeahead results:', Array.isArray(data) ? data.length : 0, 'results');

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
      throw new Error('Invalid action. Use "autocomplete", "postcode", "typeahead", or "get"');
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
