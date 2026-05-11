import type { Transaction, Budget } from '@/types';

interface HealthBreakdown {
  savings_rate: number;      // 0-25 points
  budget_adherence: number;  // 0-25 points
  debt_ratio: number;        // 0-25 points (unused for now, give full 25)
  spending_trends: number;   // 0-25 points
}

interface HealthResult {
  score: number;
  breakdown: HealthBreakdown;
}

export function calculateHealthScore(
  transactions: Transaction[],
  budgets: Budget[],
  currentMonth: string // YYYY-MM
): HealthResult {
  const monthTxns = transactions.filter((t) => t.date.startsWith(currentMonth));

  // 1. Savings Rate (0-25): income - expenses / income
  const income = monthTxns.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = monthTxns.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  let savingsRate = 0;
  if (income > 0) {
    const ratio = (income - expenses) / income;
    // 20%+ savings = full points, 0% = 0 points
    savingsRate = Math.min(25, Math.round(Math.max(0, ratio) * 125));
  }

  // 2. Budget Adherence (0-25): avg % under budget across categories
  let budgetAdherence = 25; // default full if no budgets
  if (budgets.length > 0) {
    const adherenceScores = budgets.map((b) => {
      const catSpending = monthTxns
        .filter((t) => t.category_id === b.category_id && t.type === 'expense')
        .reduce((s, t) => s + t.amount, 0);
      const ratio = b.amount > 0 ? catSpending / b.amount : 0;
      // Under budget = 1.0, at budget = 0.5, 50% over = 0
      return Math.max(0, Math.min(1, 1.5 - ratio));
    });
    const avg = adherenceScores.reduce((s, v) => s + v, 0) / adherenceScores.length;
    budgetAdherence = Math.round(avg * 25);
  }

  // 3. Debt Ratio (0-25): placeholder — full points for now (no debt tracking)
  const debtRatio = 25;

  // 4. Spending Trends (0-25): compare this month vs previous month
  const prevMonth = getPrevMonth(currentMonth);
  const prevTxns = transactions.filter((t) => t.date.startsWith(prevMonth));
  const prevExpenses = prevTxns.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  let spendingTrends = 15; // neutral default
  if (prevExpenses > 0) {
    const change = (expenses - prevExpenses) / prevExpenses;
    // Spending decreased = full 25, same = 15, increased 50%+ = 0
    if (change <= -0.1) spendingTrends = 25;
    else if (change <= 0) spendingTrends = 20;
    else if (change <= 0.1) spendingTrends = 15;
    else if (change <= 0.3) spendingTrends = 8;
    else spendingTrends = 0;
  }

  const score = savingsRate + budgetAdherence + debtRatio + spendingTrends;

  return {
    score: Math.min(100, Math.max(0, score)),
    breakdown: {
      savings_rate: savingsRate,
      budget_adherence: budgetAdherence,
      debt_ratio: debtRatio,
      spending_trends: spendingTrends,
    },
  };
}

function getPrevMonth(month: string): string {
  const [year, m] = month.split('-').map(Number);
  const prev = m === 1 ? { y: year - 1, m: 12 } : { y: year, m: m - 1 };
  return `${prev.y}-${String(prev.m).padStart(2, '0')}`;
}
