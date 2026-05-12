import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization')!;
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { group_id } = await req.json();

    // Fetch recent transactions (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const { data: transactions } = await supabase
      .from('transactions')
      .select('amount, currency, type, description, date, category:categories(name)')
      .eq('group_id', group_id)
      .gte('date', thirtyDaysAgo)
      .order('date', { ascending: false });

    // Fetch budgets for current month
    const month = new Date().toISOString().slice(0, 7);
    const { data: budgets } = await supabase
      .from('budgets')
      .select('amount, currency, category:categories(name)')
      .eq('group_id', group_id)
      .eq('month', month);

    const summary = JSON.stringify({ transactions: transactions?.slice(0, 50), budgets });

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 512,
        messages: [{
          role: 'user',
          content: `You are a financial advisor for a family/couple in Argentina. Analyze their recent spending and budgets, and provide 2-3 brief, actionable tips in Spanish. Be warm and encouraging.

Data (amounts in cents):
${summary}

Return JSON array of tips:
[{"title": "short title", "body": "1-2 sentence tip", "type": "savings"|"spending"|"general"}]

Return ONLY valid JSON.`
        }],
      }),
    });

    const claudeResponse = await response.json();
    const tips = JSON.parse(claudeResponse.content[0].text);

    return new Response(JSON.stringify({ tips }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
