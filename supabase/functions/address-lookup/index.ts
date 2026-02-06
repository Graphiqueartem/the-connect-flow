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

    const envApiKey = Deno.env.get('EASYPOSTCODES_API_KEY');
    const clientApiKey =
      payload.apiKey ??
      url.searchParams.get('apiKey') ??
      url.searchParams.get('api-key') ??
      undefined;

    const apiKey = envApiKey || clientApiKey;

    if (!apiKey) {
      throw new Error('EASYPOSTCODES_API_KEY not configured');
    }

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

    if (action === 'postcode') {
      // EasyPostcodes: lookup addresses by postcode
      const postcode = (term || '').replace(/\s+/g, '');
      if (!postcode) {
        throw new Error('Missing postcode term');
      }

      const apiUrl = `https://api.easypostcodes.com/addresses/${encodeURIComponent(postcode)}?includeGeo=false`;
      console.log('EasyPostcodes URL:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Key': apiKey,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('EasyPostcodes error:', response.status, errorText);
        throw new Error(`EasyPostcodes API error: ${response.status}`);
      }

      const rawData = await response.json();
      console.log('EasyPostcodes results:', Array.isArray(rawData) ? rawData.length : 0, 'addresses');

      // Normalize EasyPostcodes response to a consistent format
      // EasyPostcodes returns an array of address objects
      const addresses = Array.isArray(rawData) ? rawData : [];
      data = {
        addresses: addresses.map((addr: any) => {
          const line1 = [addr.buildingName, addr.line1].filter(Boolean).join(', ') || '';
          const line2 = addr.line2 || '';
          const city = addr.postTown || '';
          const postCode = addr.postCode || postcode;
          const organisation = addr.organisationName || '';

          // Build a comma-separated display string
          const displayParts = [organisation, line1, line2, city, postCode].filter(Boolean);
          const display = displayParts.join(', ');

          return {
            display,
            line1: organisation ? `${organisation}, ${line1}` : line1,
            line2,
            city,
            postcode: postCode,
            country: 'United Kingdom',
          };
        }),
      };

    } else if (action === 'autocomplete') {
      // EasyPostcodes doesn't have a dedicated autocomplete endpoint.
      // If the term looks like a postcode, do a postcode lookup.
      // Otherwise return empty suggestions so the frontend can prompt manual entry.
      const cleaned = (term || '').replace(/\s+/g, '').toUpperCase();
      const isPostcodeLike = /^[A-Z]{1,2}[0-9]/.test(cleaned);

      if (isPostcodeLike && cleaned.length >= 5) {
        // Try postcode lookup
        const apiUrl = `https://api.easypostcodes.com/addresses/${encodeURIComponent(cleaned)}?includeGeo=false`;
        console.log('EasyPostcodes autocomplete-as-postcode URL:', apiUrl);

        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Key': apiKey,
            'Accept': 'application/json',
          },
        });

        if (response.ok) {
          const rawData = await response.json();
          const addresses = Array.isArray(rawData) ? rawData : [];
          console.log('EasyPostcodes autocomplete results:', addresses.length, 'addresses');

          // Format postcode nicely
          const formattedPostcode = cleaned.length > 3
            ? `${cleaned.slice(0, cleaned.length - 3)} ${cleaned.slice(-3)}`
            : cleaned;

          data = {
            suggestions: addresses.map((addr: any) => {
              const line1 = [addr.buildingName, addr.line1].filter(Boolean).join(', ') || '';
              const line2 = addr.line2 || '';
              const city = addr.postTown || '';
              const postCode = addr.postCode || formattedPostcode;
              const organisation = addr.organisationName || '';

              const displayParts = [organisation, line1, line2, city, postCode].filter(Boolean);

              return {
                address: displayParts.join(', '),
                postcode: postCode,
                id: null, // No separate get needed
                line1: organisation ? `${organisation}, ${line1}` : line1,
                line2,
                city,
              };
            }),
          };
        } else {
          const errorText = await response.text();
          console.error('EasyPostcodes autocomplete error:', response.status, errorText);
          data = { suggestions: [] };
        }
      } else {
        // Not enough for a postcode lookup yet
        console.log('Term not postcode-like enough for EasyPostcodes, returning empty suggestions');
        data = { suggestions: [] };
      }

    } else {
      throw new Error('Invalid action. Use "postcode" or "autocomplete"');
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
