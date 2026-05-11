import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Transaction, TransactionFilter } from '@/types';

interface TransactionState {
  transactions: Transaction[];
  loading: boolean;
  filter: TransactionFilter;
  setFilter: (filter: Partial<TransactionFilter>) => void;
  fetchTransactions: (groupId: string) => Promise<void>;
  addTransaction: (txn: Omit<Transaction, 'id' | 'created_at' | 'category' | 'user'>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  loading: false,
  filter: { visibility: 'all', type: 'all' },

  setFilter: (partial) => set((s) => ({ filter: { ...s.filter, ...partial } })),

  fetchTransactions: async (groupId) => {
    set({ loading: true });
    let query = supabase
      .from('transactions')
      .select('*, category:categories(*), user:users(id, name, avatar_url)')
      .eq('group_id', groupId)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(100);

    const { filter } = get();
    if (filter.dateRange) {
      query = query.gte('date', filter.dateRange.from).lte('date', filter.dateRange.to);
    }
    if (filter.categories?.length) {
      query = query.in('category_id', filter.categories);
    }
    if (filter.members?.length) {
      query = query.in('user_id', filter.members);
    }
    if (filter.visibility === 'shared') {
      query = query.eq('is_shared', true);
    } else if (filter.visibility === 'personal') {
      query = query.eq('is_shared', false);
    }
    if (filter.type && filter.type !== 'all') {
      query = query.eq('type', filter.type);
    }

    const { data } = await query;
    set({ transactions: data ?? [], loading: false });
  },

  addTransaction: async (txn) => {
    const { data, error } = await supabase
      .from('transactions')
      .insert(txn)
      .select('*, category:categories(*), user:users(id, name, avatar_url)')
      .single();
    if (error) throw error;
    set((s) => ({ transactions: [data, ...s.transactions] }));
  },

  updateTransaction: async (id, updates) => {
    const { error } = await supabase.from('transactions').update(updates).eq('id', id);
    if (error) throw error;
    set((s) => ({
      transactions: s.transactions.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
  },

  deleteTransaction: async (id) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) throw error;
    set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) }));
  },
}));
