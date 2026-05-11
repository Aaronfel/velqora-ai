import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useGroupStore } from '@/stores/groupStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { useBudgetStore } from '@/stores/budgetStore';
import { useExchangeStore } from '@/stores/exchangeStore';

export function useRealtime() {
  const activeGroup = useGroupStore((s) => s.activeGroup);

  useEffect(() => {
    if (!activeGroup) return;

    const channel = supabase
      .channel(`group-${activeGroup.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `group_id=eq.${activeGroup.id}` }, () => {
        useTransactionStore.getState().fetchTransactions(activeGroup.id);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'budgets', filter: `group_id=eq.${activeGroup.id}` }, () => {
        const month = new Date().toISOString().slice(0, 7);
        useBudgetStore.getState().fetchBudgets(activeGroup.id, month);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'savings_goals', filter: `group_id=eq.${activeGroup.id}` }, () => {
        useBudgetStore.getState().fetchGoals(activeGroup.id);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'group_members', filter: `group_id=eq.${activeGroup.id}` }, () => {
        useGroupStore.getState().fetchMembers();
      })
      .subscribe();

    const rateChannel = supabase
      .channel('exchange-rates')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'exchange_rates' }, () => {
        useExchangeStore.getState().fetchLatestRate();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(rateChannel);
    };
  }, [activeGroup]);
}
