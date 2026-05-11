import type { Transaction } from '@/types';

export function sumByType(txns: Transaction[], type: 'income' | 'expense'): number {
  return txns
    .filter((t) => t.type === type)
    .reduce((sum, t) => sum + t.amount, 0);
}

export function groupByDate(txns: Transaction[]): Map<string, Transaction[]> {
  const map = new Map<string, Transaction[]>();
  for (const txn of txns) {
    const group = map.get(txn.date) ?? [];
    group.push(txn);
    map.set(txn.date, group);
  }
  return map;
}

export function groupByCategory(txns: Transaction[]): { label: string; value: number; color: string }[] {
  const map = new Map<string, { value: number; color: string }>();
  for (const txn of txns) {
    if (txn.type !== 'expense' || !txn.category) continue;
    const key = txn.category.name;
    const existing = map.get(key) ?? { value: 0, color: txn.category.color };
    existing.value += txn.amount;
    map.set(key, existing);
  }
  return Array.from(map.entries())
    .map(([label, { value, color }]) => ({ label, value, color }))
    .sort((a, b) => b.value - a.value);
}

export function monthlyTotals(
  txns: Transaction[],
  months: number = 7,
): { labels: string[]; income: number[]; expense: number[] } {
  const now = new Date();
  const labels: string[] = [];
  const income: number[] = [];
  const expense: number[] = [];
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    labels.push(monthNames[d.getMonth()]);

    const monthTxns = txns.filter((t) => t.date.startsWith(key));
    income.push(monthTxns.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0));
    expense.push(monthTxns.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0));
  }
  return { labels, income, expense };
}

export function budgetSpentMap(txns: Transaction[], month: string): Map<string, number> {
  const map = new Map<string, number>();
  for (const txn of txns) {
    if (txn.type !== 'expense' || !txn.date.startsWith(month)) continue;
    const current = map.get(txn.category_id) ?? 0;
    map.set(txn.category_id, current + txn.amount);
  }
  return map;
}

export function currentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}
