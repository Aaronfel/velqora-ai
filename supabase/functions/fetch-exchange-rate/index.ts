import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Fetch from dolarapi.com
    const response = await fetch('https://dolarapi.com/v1/dolares/blue');
    if (!response.ok) {
      throw new Error(`DolarAPI returned ${response.status}`);
    }

    const data = await response.json();
    const buyRate = Math.round(data.compra * 100); // Store in cents
    const sellRate = Math.round(data.venta * 100);

    // Insert into exchange_rates
    const { data: rate, error } = await supabaseAdmin
      .from('exchange_rates')
      .insert({
        from_currency: 'USD',
        to_currency: 'ARS',
        rate_type: 'blue',
        buy_rate: buyRate,
        sell_rate: sellRate,
        source: 'dolarapi.com',
        manual_override: false,
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify(rate), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
