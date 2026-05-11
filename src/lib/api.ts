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

export interface AITip {
  title: string;
  body: string;
  type: 'savings' | 'spending' | 'general';
}

export async function getAIAdvice(groupId: string): Promise<AITip[]> {
  const { data, error } = await supabase.functions.invoke('ai-advisor', {
    body: { group_id: groupId },
  });
  if (error) throw error;
  return (data as { tips: AITip[] }).tips;
}

export interface NLQueryResult {
  answer: string;
  transactions: Array<{
    amount: number;
    currency: string;
    type: string;
    description: string;
    date: string;
    category: { name: string } | null;
  }>;
  total_count: number;
}

export async function nlQuery(groupId: string, query: string): Promise<NLQueryResult> {
  const { data, error } = await supabase.functions.invoke('nl-query', {
    body: { group_id: groupId, query },
  });
  if (error) throw error;
  return data as NLQueryResult;
}

export async function sendPushNotification(userId: string, title: string, body: string) {
  const { data, error } = await supabase.functions.invoke('send-push', {
    body: { user_id: userId, title, body },
  });
  if (error) throw error;
  return data as { sent: boolean; reason?: string };
}
