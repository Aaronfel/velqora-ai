import { supabase } from '@/lib/supabase';

interface DolarApiResponse {
  moneda: string;
  casa: string;
  nombre: string;
  compra: number;
  venta: number;
  fechaActualizacion: string;
}

let cachedRate: { rate: number; fetchedAt: number } | null = null;
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

export async function fetchBlueRate(): Promise<number> {
  if (cachedRate && Date.now() - cachedRate.fetchedAt < CACHE_TTL) {
    return cachedRate.rate;
  }

  try {
    const res = await fetch('https://dolarapi.com/v1/dolares/blue');
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    const data: DolarApiResponse = await res.json();

    const midpoint = Math.round((data.compra + data.venta) / 2);

    cachedRate = { rate: midpoint, fetchedAt: Date.now() };

    supabase.from('exchange_rates').insert({
      from_currency: 'USD',
      to_currency: 'ARS',
      rate_type: 'blue',
      buy_rate: data.compra,
      sell_rate: data.venta,
      source: 'dolarapi.com',
    }).then(({ error }) => {
      if (error) console.error('Failed to store exchange rate:', error.message);
    });

    return midpoint;
  } catch (err) {
    console.error('Failed to fetch blue rate:', err);

    const { data } = await supabase
      .from('exchange_rates')
      .select('buy_rate, sell_rate')
      .eq('rate_type', 'blue')
      .order('fetched_at', { ascending: false })
      .limit(1)
      .single();

    if (data) {
      const fallback = Math.round((Number(data.buy_rate) + Number(data.sell_rate)) / 2);
      cachedRate = { rate: fallback, fetchedAt: Date.now() };
      return fallback;
    }

    throw new Error('No exchange rate available');
  }
}

export function usdToArs(amountCents: number, rate: number): number {
  return Math.round((amountCents / 100) * rate * 100);
}
