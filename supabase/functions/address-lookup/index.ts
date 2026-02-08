import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
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
    const action = payload.action ?? url.searchParams.get('action');
    const term = payload.term ?? url.searchParams.get('term');
    const id = payload.id ?? url.searchParams.get('id');
    const pathfilter = payload.pathfilter ?? url.searchParams.get('pathfilter');

    const apiKey = Deno.env.get('POSTCODER_API_KEY');

    if (!apiKey) {
      throw new Error('POSTCODER_API_KEY not configured');
    }

    const maskedKey = `${apiKey.substring(0, 4)}...${apiKey.slice(-4)}`;
    console.log('Address lookup request:', { action, term, id, pathfilter, maskedKey });

    if (!action) {
      return new Response(
        JSON.stringify({ error: 'Missing action' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let data;

    if (action === 'postcode') {
      // Direct postcode/address lookup using Postcoder /address endpoint
      const searchterm = (term || '').trim();
      if (!searchterm) throw new Error('Missing search term');

      const apiUrl = `https://ws.postcoder.com/pcw/${apiKey}/address/uk/${encodeURIComponent(searchterm)}?format=json&lines=3&include=posttown,postcode`;
      console.log('Postcoder address URL:', apiUrl.replace(apiKey, '***'));

      const response = await fetch(apiUrl);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Postcoder address error:', response.status, errorText);
        throw new Error(`Postcoder API error: ${response.status}`);
      }

      const rawData = await response.json();
      const addresses = Array.isArray(rawData) ? rawData : [];
      console.log('Postcoder address results:', addresses.length, 'addresses');

      data = {
        addresses: addresses.map((addr: any) => ({
          display: addr.summaryline || '',
          line1: addr.addressline1 || '',
          line2: addr.addressline2 || '',
          city: addr.posttown || '',
          postcode: addr.postcode || '',
          county: addr.county || '',
          country: 'United Kingdom',
        })),
      };

    } else if (action === 'autocomplete') {
      // Postcoder autocomplete/find - free suggestions as user types
      const query = (term || '').trim();
      if (!query) throw new Error('Missing search query');

      let apiUrl = `https://ws.postcoder.com/pcw/autocomplete/find?query=${encodeURIComponent(query)}&country=uk&apikey=${apiKey}`;
      if (pathfilter) {
        apiUrl += `&pathfilter=${encodeURIComponent(pathfilter)}`;
      }
      console.log('Postcoder autocomplete URL:', apiUrl.replace(apiKey, '***'));

      const response = await fetch(apiUrl);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Postcoder autocomplete error:', response.status, errorText);
        throw new Error(`Postcoder API error: ${response.status}`);
      }

      const rawData = await response.json();
      const suggestions = Array.isArray(rawData) ? rawData : [];
      console.log('Postcoder autocomplete results:', suggestions.length, 'suggestions');

      data = {
        suggestions: suggestions.map((s: any) => ({
          display: s.summaryline || '',
          id: s.id || null,
          type: s.type || '', // "ADD" for address, others are groups/containers
        })),
      };

    } else if (action === 'retrieve') {
      // Postcoder autocomplete/retrieve - get full address for a suggestion ID
      if (!id) throw new Error('Missing suggestion id for retrieve');
      const query = (term || '').trim();

      const apiUrl = `https://ws.postcoder.com/pcw/autocomplete/retrieve?id=${encodeURIComponent(id)}&query=${encodeURIComponent(query)}&country=uk&apikey=${apiKey}&format=json&lines=3&include=posttown,postcode`;
      console.log('Postcoder retrieve URL:', apiUrl.replace(apiKey, '***'));

      const response = await fetch(apiUrl);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Postcoder retrieve error:', response.status, errorText);
        throw new Error(`Postcoder API error: ${response.status}`);
      }

      const rawData = await response.json();
      const addresses = Array.isArray(rawData) ? rawData : [];
      console.log('Postcoder retrieve results:', addresses.length, 'addresses');

      data = {
        addresses: addresses.map((addr: any) => ({
          display: addr.summaryline || '',
          line1: addr.addressline1 || '',
          line2: addr.addressline2 || '',
          city: addr.posttown || '',
          postcode: addr.postcode || '',
          county: addr.county || '',
          country: 'United Kingdom',
        })),
      };

    } else {
      throw new Error('Invalid action. Use "postcode", "autocomplete", or "retrieve"');
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in address-lookup function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
