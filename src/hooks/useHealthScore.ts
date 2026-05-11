import { useMemo } from 'react';
import { useTransactionStore } from '@/stores/transactionStore';
import { useBudgetStore } from '@/stores/budgetStore';
import { calculateHealthScore } from '@/lib/healthScore';

export function useHealthScore() {
  const transactions = useTransactionStore((s) => s.transactions);
  const budgets = useBudgetStore((s) => s.budgets);
  const currentMonth = useMemo(() => new Date().toISOString().slice(0, 7), []);

  return useMemo(
    () => calculateHealthScore(transactions, budgets, currentMonth),
    [transactions, budgets, currentMonth]
  );
}
