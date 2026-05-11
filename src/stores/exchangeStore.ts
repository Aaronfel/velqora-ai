import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { ExchangeRate } from '@/types';

interface ExchangeState {
  rate: ExchangeRate | null;
  loading: boolean;
  fetchLatestRate: () => Promise<void>;
  manualOverride: (buyRate: number, sellRate: number) => Promise<void>;
}

export const useExchangeStore = create<ExchangeState>((set) => ({
  rate: null,
  loading: false,

  fetchLatestRate: async () => {
    set({ loading: true });
    const { data } = await supabase
      .from('exchange_rates')
      .select('*')
      .eq('rate_type', 'blue')
      .order('fetched_at', { ascending: false })
      .limit(1)
      .single();
    set({ rate: data, loading: false });
  },

  manualOverride: async (buyRate, sellRate) => {
    const { data, error } = await supabase
      .from('exchange_rates')
      .insert({
        from_currency: 'USD',
        to_currency: 'ARS',
        rate_type: 'blue',
        buy_rate: buyRate,
        sell_rate: sellRate,
        source: 'manual',
        manual_override: true,
      })
      .select()
      .single();
    if (error) throw error;
    set({ rate: data });
  },
}));
