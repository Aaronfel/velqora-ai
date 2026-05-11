import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScanResult {
  amount: number; // in cents
  currency: 'ARS' | 'USD';
  description: string;
  date: string; // ISO date
  category_suggestion: string;
  confidence: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify auth
    const authHeader = req.headers.get('Authorization')!;
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { image_base64, image_url } = await req.json();

    // Build the image content for Claude
    let imageContent;
    if (image_base64) {
      imageContent = {
        type: 'image' as const,
        source: {
          type: 'base64' as const,
          media_type: 'image/jpeg' as const,
          data: image_base64,
        },
      };
    } else if (image_url) {
      imageContent = {
        type: 'image' as const,
        source: {
          type: 'url' as const,
          url: image_url,
        },
      };
    } else {
      return new Response(JSON.stringify({ error: 'No image provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Call Claude Vision API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: [
              imageContent,
              {
                type: 'text',
                text: `Analyze this receipt image and extract the following information in JSON format:
{
  "amount": <total amount in cents as integer>,
  "currency": "<ARS or USD - determine from receipt context, default ARS>",
  "description": "<brief description of purchase, e.g. store name or main items>",
  "date": "<ISO date string YYYY-MM-DD if visible, otherwise today>",
  "category_suggestion": "<one of: Mercado, Comer afuera, Transporte, Combustible, Suscripciones, Ocio, Alquiler, Servicios, Compras, Viajes, Educación, Salud>",
  "confidence": <0-1 float indicating how confident you are in the extraction>
}

Return ONLY valid JSON, no markdown or explanation.`,
              },
            ],
          },
        ],
      }),
    });

    const claudeResponse = await response.json();
    const content = claudeResponse.content[0].text;
    const result: ScanResult = JSON.parse(content);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
