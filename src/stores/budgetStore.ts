import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Budget, SavingsGoal } from '@/types';

interface BudgetState {
  budgets: Budget[];
  goals: SavingsGoal[];
  loading: boolean;
  fetchBudgets: (groupId: string, month: string) => Promise<void>;
  fetchGoals: (groupId: string) => Promise<void>;
  upsertBudget: (budget: Omit<Budget, 'id' | 'created_at'>) => Promise<void>;
  createGoal: (goal: Omit<SavingsGoal, 'id' | 'created_at'>) => Promise<void>;
  updateGoal: (id: string, updates: Partial<SavingsGoal>) => Promise<void>;
  contributeToGoal: (id: string, amount: number) => Promise<void>;
}

export const useBudgetStore = create<BudgetState>((set, get) => ({
  budgets: [],
  goals: [],
  loading: false,

  fetchBudgets: async (groupId, month) => {
    set({ loading: true });
    const { data } = await supabase
      .from('budgets')
      .select('*, category:categories(*)')
      .eq('group_id', groupId)
      .eq('month', month);
    set({ budgets: data ?? [], loading: false });
  },

  fetchGoals: async (groupId) => {
    const { data } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('group_id', groupId)
      .order('deadline');
    set({ goals: data ?? [] });
  },

  upsertBudget: async (budget) => {
    const { data, error } = await supabase
      .from('budgets')
      .upsert(budget, { onConflict: 'group_id,category_id,month' })
      .select('*, category:categories(*)')
      .single();
    if (error) throw error;
    set((s) => {
      const existing = s.budgets.findIndex((b) => b.category_id === data.category_id);
      if (existing >= 0) {
        const updated = [...s.budgets];
        updated[existing] = data;
        return { budgets: updated };
      }
      return { budgets: [...s.budgets, data] };
    });
  },

  createGoal: async (goal) => {
    const { data, error } = await supabase.from('savings_goals').insert(goal).select().single();
    if (error) throw error;
    set((s) => ({ goals: [...s.goals, data] }));
  },

  updateGoal: async (id, updates) => {
    const { error } = await supabase.from('savings_goals').update(updates).eq('id', id);
    if (error) throw error;
    set((s) => ({ goals: s.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)) }));
  },

  contributeToGoal: async (id, amount) => {
    const goal = get().goals.find((g) => g.id === id);
    if (!goal) return;
    const newAmount = goal.current_amount + amount;
    await get().updateGoal(id, { current_amount: newAmount });
  },
}));
