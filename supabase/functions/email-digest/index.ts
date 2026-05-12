import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DigestData {
  totalIncome: number;
  totalExpenses: number;
  topCategories: Array<{ name: string; amount: number }>;
  transactionCount: number;
  savingsRate: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { period = 'weekly' } = await req.json().catch(() => ({}));

    // Calculate date range
    const now = new Date();
    const from = new Date(now);
    if (period === 'weekly') {
      from.setDate(from.getDate() - 7);
    } else {
      from.setMonth(from.getMonth() - 1);
    }
    const fromDate = from.toISOString().slice(0, 10);
    const toDate = now.toISOString().slice(0, 10);

    // Get all users (in a real app, filter by digest preference)
    const { data: users } = await supabaseAdmin
      .from('users')
      .select('id, email, name');

    if (!users?.length) {
      return new Response(JSON.stringify({ sent: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let sentCount = 0;

    for (const user of users) {
      // Get user's groups
      const { data: memberships } = await supabaseAdmin
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id);

      if (!memberships?.length) continue;

      const groupIds = memberships.map((m) => m.group_id);

      // Get transactions for the period
      const { data: transactions } = await supabaseAdmin
        .from('transactions')
        .select('amount, type, category:categories(name)')
        .in('group_id', groupIds)
        .gte('date', fromDate)
        .lte('date', toDate);

      if (!transactions?.length) continue;

      // Compile digest data
      const income = transactions
        .filter((t) => t.type === 'income')
        .reduce((s, t) => s + t.amount, 0);
      const expenses = transactions
        .filter((t) => t.type === 'expense')
        .reduce((s, t) => s + t.amount, 0);

      // Top spending categories
      const categoryTotals: Record<string, number> = {};
      transactions
        .filter((t) => t.type === 'expense')
        .forEach((t) => {
          const catName = (t.category as { name: string } | null)?.name ?? 'Otros';
          categoryTotals[catName] = (categoryTotals[catName] || 0) + t.amount;
        });

      const topCategories = Object.entries(categoryTotals)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, amount]) => ({ name, amount }));

      const digest: DigestData = {
        totalIncome: income,
        totalExpenses: expenses,
        topCategories,
        transactionCount: transactions.length,
        savingsRate: income > 0 ? Math.round(((income - expenses) / income) * 100) : 0,
      };

      // Send email via Resend
      const html = buildDigestEmail(user.name, period, fromDate, toDate, digest);

      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'VelqoraAI <noreply@velqora.app>',
          to: [user.email],
          subject: period === 'weekly'
            ? `Tu resumen semanal — VelqoraAI`
            : `Tu resumen mensual — VelqoraAI`,
          html,
        }),
      });

      if (emailResponse.ok) sentCount++;
    }

    return new Response(JSON.stringify({ sent: sentCount }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function buildDigestEmail(
  name: string,
  period: string,
  from: string,
  to: string,
  data: DigestData
): string {
  const formatAmount = (cents: number) => `$${(cents / 100).toLocaleString('es-AR')}`;
  const periodLabel = period === 'weekly' ? 'Semana' : 'Mes';

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0B0907;font-family:system-ui,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
    <h1 style="color:#E8D5A8;font-size:24px;margin-bottom:4px;">VelqoraAI</h1>
    <p style="color:#B4A993;font-size:14px;margin-top:0;">Resumen ${periodLabel.toLowerCase()} · ${from} al ${to}</p>

    <p style="color:#F5EFE3;font-size:16px;">Hola ${name},</p>

    <div style="background:#16120E;border-radius:16px;padding:24px;margin:24px 0;border:1px solid #2A2218;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="color:#B4A993;font-size:12px;padding-bottom:4px;">Ingresos</td>
          <td style="color:#B4A993;font-size:12px;padding-bottom:4px;text-align:right;">Gastos</td>
        </tr>
        <tr>
          <td style="color:#9FCEA0;font-size:20px;font-weight:600;">${formatAmount(data.totalIncome)}</td>
          <td style="color:#E8A37C;font-size:20px;font-weight:600;text-align:right;">${formatAmount(data.totalExpenses)}</td>
        </tr>
      </table>

      <div style="margin-top:16px;padding-top:16px;border-top:1px solid #2A2218;">
        <p style="color:#B4A993;font-size:12px;margin:0 0 8px;">Top categorías</p>
        ${data.topCategories.map((c) => `
          <div style="display:flex;justify-content:space-between;padding:4px 0;">
            <span style="color:#F5EFE3;font-size:14px;">${c.name}</span>
            <span style="color:#B4A993;font-size:14px;">${formatAmount(c.amount)}</span>
          </div>
        `).join('')}
      </div>

      <div style="margin-top:16px;padding-top:16px;border-top:1px solid #2A2218;">
        <p style="color:#B4A993;font-size:12px;margin:0;">Tasa de ahorro: <span style="color:#E8D5A8;font-weight:600;">${data.savingsRate}%</span></p>
        <p style="color:#B4A993;font-size:12px;margin:4px 0 0;">Transacciones: <span style="color:#F5EFE3;">${data.transactionCount}</span></p>
      </div>
    </div>

    <p style="color:#74695A;font-size:12px;text-align:center;">VelqoraAI · Finanzas inteligentes para familias</p>
  </div>
</body>
</html>`;
}
