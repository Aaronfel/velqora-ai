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

    const { query, group_id } = await req.json();

    // First, get categories for context
    const { data: categories } = await supabase
      .from('categories')
      .select('id, name, type')
      .eq('group_id', group_id);

    // Ask Claude to interpret the question and provide a structured filter
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
          content: `You help interpret financial queries. Given a user question in Spanish or English, return a JSON filter object to query their transactions.

Available categories: ${JSON.stringify(categories?.map(c => ({ id: c.id, name: c.name, type: c.type })))}

User question: "${query}"

Return JSON:
{
  "filter": {
    "date_from": "YYYY-MM-DD or null",
    "date_to": "YYYY-MM-DD or null",
    "category_ids": ["id1", ...] or null,
    "type": "income" | "expense" | "transfer" | null,
    "description_search": "text or null",
    "min_amount": cents or null,
    "max_amount": cents or null
  },
  "summary_type": "total" | "list" | "count" | "average",
  "answer_template": "Spanish template with {result} placeholder"
}

Return ONLY valid JSON.`
        }],
      }),
    });

    const claudeResponse = await response.json();
    const interpretation = JSON.parse(claudeResponse.content[0].text);
    const { filter, summary_type, answer_template } = interpretation;

    // Build and execute query
    let dbQuery = supabase
      .from('transactions')
      .select('amount, currency, type, description, date, category:categories(name)')
      .eq('group_id', group_id);

    if (filter.date_from) dbQuery = dbQuery.gte('date', filter.date_from);
    if (filter.date_to) dbQuery = dbQuery.lte('date', filter.date_to);
    if (filter.category_ids?.length) dbQuery = dbQuery.in('category_id', filter.category_ids);
    if (filter.type) dbQuery = dbQuery.eq('type', filter.type);
    if (filter.description_search) dbQuery = dbQuery.ilike('description', `%${filter.description_search}%`);
    if (filter.min_amount) dbQuery = dbQuery.gte('amount', filter.min_amount);
    if (filter.max_amount) dbQuery = dbQuery.lte('amount', filter.max_amount);

    const { data: results } = await dbQuery.order('date', { ascending: false }).limit(50);

    // Compute result based on summary_type
    let resultValue: string;
    const txns = results ?? [];

    if (summary_type === 'total') {
      const total = txns.reduce((sum: number, t: { amount: number }) => sum + t.amount, 0);
      resultValue = `$${(Math.abs(total) / 100).toLocaleString('es-AR')}`;
    } else if (summary_type === 'count') {
      resultValue = `${txns.length}`;
    } else if (summary_type === 'average') {
      const avg = txns.length ? txns.reduce((sum: number, t: { amount: number }) => sum + t.amount, 0) / txns.length : 0;
      resultValue = `$${(Math.abs(avg) / 100).toLocaleString('es-AR')}`;
    } else {
      resultValue = `${txns.length} transacciones`;
    }

    const answer = answer_template.replace('{result}', resultValue);

    return new Response(JSON.stringify({ answer, transactions: txns.slice(0, 10), total_count: txns.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
