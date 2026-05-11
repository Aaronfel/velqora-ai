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
