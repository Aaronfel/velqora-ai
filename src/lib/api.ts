import { supabase } from './supabase';

export async function scanReceipt(imageBase64: string) {
  const { data, error } = await supabase.functions.invoke('scan-receipt', {
    body: { image_base64: imageBase64 },
  });
  if (error) throw error;
  return data as {
    amount: number;
    currency: 'ARS' | 'USD';
    description: string;
    date: string;
    category_suggestion: string;
    confidence: number;
  };
}

export async function fetchExchangeRate() {
  const { data, error } = await supabase.functions.invoke('fetch-exchange-rate');
  if (error) throw error;
  return data as {
    id: string;
    from_currency: string;
    to_currency: string;
    rate_type: string;
    buy_rate: number;
    sell_rate: number;
    source: string;
    fetched_at: string;
    manual_override: boolean;
  };
}
