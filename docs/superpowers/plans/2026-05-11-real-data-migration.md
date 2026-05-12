# Real Data Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all hardcoded mock data in Dashboard, Transactions, Budgets, Insights, and Settings pages with real Zustand store data backed by Supabase. Show empty states when no data exists.

**Architecture:** Each page calls store `.fetch*()` in a useEffect keyed on `activeGroup.id`. Mock constants are deleted and replaced with store state + client-side aggregations. A shared `EmptyState` component renders when arrays are empty.

**Tech Stack:** React 18, Zustand, Supabase, TypeScript strict mode, Tailwind v4

---

## File Map

| Action | File | Responsibility |
|--------|------|---------------|
| Create | `src/components/ui/EmptyState.tsx` | Reusable empty state with icon, title, subtitle, CTA |
| Create | `src/lib/aggregations.ts` | Pure functions: sumByType, groupByDate, groupByCategory, monthlyTrend, budgetSpent |
| Modify | `src/pages/settings/SettingsDesktop.tsx` | Replace hardcoded group info + member list |
| Modify | `src/pages/settings/SettingsMobile.tsx` | Same |
| Modify | `src/pages/transactions/TransactionsDesktop.tsx` | Wire transactionStore, derive filters from data |
| Modify | `src/pages/transactions/TransactionsMobile.tsx` | Same |
| Modify | `src/pages/dashboard/DashboardDesktop.tsx` | Wire transactionStore + budgetStore, compute summaries |
| Modify | `src/pages/dashboard/DashboardMobile.tsx` | Same |
| Modify | `src/pages/budgets/BudgetsDesktop.tsx` | Wire budgetStore, compute spent from transactions |
| Modify | `src/pages/budgets/BudgetsMobile.tsx` | Same |
| Modify | `src/pages/insights/InsightsDesktop.tsx` | Wire transactionStore, compute all aggregations |
| Modify | `src/pages/insights/InsightsMobile.tsx` | Same |

---

### Task 1: EmptyState Component

**Files:**
- Create: `src/components/ui/EmptyState.tsx`

- [ ] **Step 1: Create EmptyState component**

```tsx
// src/components/ui/EmptyState.tsx
import { useTheme } from '@/hooks/useTheme';
import Button from '@/components/ui/Button';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  action?: { label: string; onClick: () => void };
}

export default function EmptyState({ icon: Icon, title, subtitle, action }: EmptyStateProps) {
  const t = useTheme();
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div
        className="rounded-2xl flex items-center justify-center mb-4"
        style={{ width: 56, height: 56, background: t.surface2, color: t.text3 }}
      >
        <Icon size={24} strokeWidth={1.5} />
      </div>
      <h3 className="font-sans" style={{ fontSize: 15, color: t.text, fontWeight: 500 }}>
        {title}
      </h3>
      {subtitle && (
        <p className="font-sans" style={{ fontSize: 12.5, color: t.text3, marginTop: 6, maxWidth: 280, lineHeight: 1.5 }}>
          {subtitle}
        </p>
      )}
      {action && (
        <div style={{ marginTop: 16 }}>
          <Button onClick={action.onClick} variant="secondary">{action.label}</Button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd /Users/aaronfel/Desktop/Projects/velqora-ai && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors related to EmptyState

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/EmptyState.tsx
git commit -m "feat: add reusable EmptyState component"
```

---

### Task 2: Aggregation Utilities

**Files:**
- Create: `src/lib/aggregations.ts`

These are pure functions used across Dashboard, Budgets, and Insights to compute summaries from raw transaction/budget arrays.

- [ ] **Step 1: Create aggregations module**

```tsx
// src/lib/aggregations.ts
import type { Transaction, Budget } from '@/types';

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
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd /Users/aaronfel/Desktop/Projects/velqora-ai && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/lib/aggregations.ts
git commit -m "feat: add aggregation utilities for transactions and budgets"
```

---

### Task 3: Settings Page — Real Group Data

**Files:**
- Modify: `src/pages/settings/SettingsDesktop.tsx`
- Modify: `src/pages/settings/SettingsMobile.tsx`

Replace hardcoded "Casa Pérez", "3 miembros", and static member list with `groupStore.activeGroup` and `groupStore.members`.

- [ ] **Step 1: Update SettingsDesktop.tsx**

Add imports at top:
```tsx
import { useGroupStore } from '@/stores/groupStore';
```

Add store hook inside the component (after existing hooks):
```tsx
const activeGroup = useGroupStore((s) => s.activeGroup);
const members = useGroupStore((s) => s.members);
```

Replace the hardcoded family card section. Find the section that renders "Casa Pérez" and "3 miembros" and the static member list `['Aaron', 'María', 'Lucas']`. Replace with:

- Group name: `activeGroup?.name ?? 'Sin grupo'`
- Member count: `` `${members.length} ${members.length === 1 ? 'miembro' : 'miembros'}` ``
- Member list: map `members` array, using `m.user?.name ?? 'Sin nombre'` for name and `m.role === 'owner' ? 'Owner' : m.role === 'member' ? 'Miembro' : 'Viewer'` for role label
- Member avatar initials: compute from `m.user?.name`

- [ ] **Step 2: Update SettingsMobile.tsx**

Same pattern — add `useGroupStore` import, add store hooks, replace "Casa Pérez" and member count with real data.

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd /Users/aaronfel/Desktop/Projects/velqora-ai && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/pages/settings/SettingsDesktop.tsx src/pages/settings/SettingsMobile.tsx
git commit -m "feat(settings): wire group info and members from store"
```

---

### Task 4: Transactions Page — Real Data

**Files:**
- Modify: `src/pages/transactions/TransactionsDesktop.tsx`
- Modify: `src/pages/transactions/TransactionsMobile.tsx`

Delete all `MOCK_TRANSACTIONS`, `CATEGORIES`, `MEMBERS` constants. Wire `useTransactionStore` and `useGroupStore`. Derive filter options from real data.

- [ ] **Step 1: Update TransactionsDesktop.tsx**

**Remove:** `MOCK_TRANSACTIONS` array (lines 20-102), `CATEGORIES` constant (line 106), `MEMBERS` constant (line 107), `DesktopTxRow` interface (lines 14-18), and the `TxRowData` import.

**Add imports:**
```tsx
import { useTransactionStore } from '@/stores/transactionStore';
import { useGroupStore } from '@/stores/groupStore';
import EmptyState from '@/components/ui/EmptyState';
import { groupByDate } from '@/lib/aggregations';
import { Inbox } from 'lucide-react';
```

**Add store hooks** inside the component:
```tsx
const activeGroup = useGroupStore((s) => s.activeGroup);
const members = useGroupStore((s) => s.members);
const { transactions, loading, fetchTransactions } = useTransactionStore();
```

**Add useEffect** to fetch on mount:
```tsx
useEffect(() => {
  if (activeGroup) fetchTransactions(activeGroup.id);
}, [activeGroup, fetchTransactions]);
```

**Derive filter values from real data:**
```tsx
const categories = Array.from(new Set(transactions.map((t) => t.category?.name).filter(Boolean))) as string[];
const memberNames = members.map((m) => m.user?.name ?? '').filter(Boolean);
```

**Replace `grouped` computation:**
```tsx
const grouped = groupByDate(transactions);
```

**Add empty state:** After filters, before the table. If `!loading && transactions.length === 0`:
```tsx
<EmptyState
  icon={Inbox}
  title="No hay movimientos todavía"
  subtitle="Cargá tu primer ingreso o gasto para empezar."
  action={{ label: 'Cargar movimiento', onClick: () => openModal('newTxn') }}
/>
```

**Update the CATEGORIES filter section** to use `categories` derived array instead of the constant.

**Update the MEMBERS filter section** to use `memberNames` derived array instead of the constant.

**Update the table rendering** — remove `dateGroup`, `memberInitials`, `memberColor` references. Use `txn.date` for grouping, `txn.user?.name` for member info.

Each transaction row renders using `txn` fields directly:
- Description: `txn.description`
- Category: `txn.category?.name`, `txn.category?.icon`, `txn.category?.color`
- Member: `txn.user?.name` → compute initials from it
- Visibility: `txn.is_shared`
- Date: `txn.date`
- Amount: `formatARS(Math.abs(txn.amount), false)` (already present)

- [ ] **Step 2: Update TransactionsMobile.tsx**

**Remove:** `MOCK_TRANSACTIONS` array (lines 12-85), computed `income`/`expenses`/`net` from mock (lines 87-94), `TxRowData` import.

**Add imports:**
```tsx
import { useTransactionStore } from '@/stores/transactionStore';
import { useGroupStore } from '@/stores/groupStore';
import EmptyState from '@/components/ui/EmptyState';
import { groupByDate, sumByType } from '@/lib/aggregations';
import { Inbox } from 'lucide-react';
```

**Add store hooks and useEffect** (same as desktop).

**Compute summary from real data:**
```tsx
const income = sumByType(transactions, 'income');
const expenses = sumByType(transactions, 'expense');
const net = income - expenses;
```

**Replace `groupByDate()` call** to use imported function with `transactions`.

**Add empty state** when `!loading && transactions.length === 0` — same EmptyState as desktop.

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd /Users/aaronfel/Desktop/Projects/velqora-ai && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/pages/transactions/TransactionsDesktop.tsx src/pages/transactions/TransactionsMobile.tsx
git commit -m "feat(transactions): wire real data from transactionStore, add empty state"
```

---

### Task 5: Dashboard Page — Real Data

**Files:**
- Modify: `src/pages/dashboard/DashboardDesktop.tsx`
- Modify: `src/pages/dashboard/DashboardMobile.tsx`

Delete `TREND_DATA`, `MOCK_TRANSACTIONS`, `HEALTH_BREAKDOWN`. Wire transaction + budget stores. Compute balance, income, expenses from real transactions. Show empty states.

- [ ] **Step 1: Update DashboardDesktop.tsx**

**Remove:** `TREND_DATA` (line 17), `MOCK_TRANSACTIONS` (lines 19-55), `HEALTH_BREAKDOWN` (lines 57-62), `TxRowData` import.

**Add imports:**
```tsx
import { useEffect } from 'react';
import { useTransactionStore } from '@/stores/transactionStore';
import { useBudgetStore } from '@/stores/budgetStore';
import { useGroupStore } from '@/stores/groupStore';
import EmptyState from '@/components/ui/EmptyState';
import { sumByType, monthlyTotals, currentMonthKey } from '@/lib/aggregations';
import { Inbox } from 'lucide-react';
```

(Note: `useState` is already imported. Add `useEffect` to the existing React import.)

**Add store hooks:**
```tsx
const activeGroup = useGroupStore((s) => s.activeGroup);
const { transactions, loading: txnLoading, fetchTransactions } = useTransactionStore();
const { budgets, fetchBudgets } = useBudgetStore();
```

**Add useEffect:**
```tsx
const month = currentMonthKey();

useEffect(() => {
  if (activeGroup) {
    fetchTransactions(activeGroup.id);
    fetchBudgets(activeGroup.id, month);
  }
}, [activeGroup, fetchTransactions, fetchBudgets, month]);
```

**Compute values from real data:**
```tsx
const monthTxns = transactions.filter((t) => t.date.startsWith(month));
const income = sumByType(monthTxns, 'income');
const expenses = sumByType(monthTxns, 'expense');
const balance = income - expenses;
const { expense: trendData } = monthlyTotals(transactions, 10);

const totalBudgetAmount = budgets.reduce((s, b) => s + b.amount, 0);
const budgetProgress = totalBudgetAmount > 0 ? Math.round((expenses / totalBudgetAmount) * 100) : 0;
```

**Replace hardcoded values in JSX:**
- Balance hero: use `formatARS(balance, false)` instead of `$4.820.000`
- Income: use `formatARS(income, false)` instead of `$15.000.000`
- Expenses: use `formatARS(expenses, false)` instead of `$10.180.000`
- Budget progress: use `budgetProgress` instead of `68`
- Budget amounts: use `formatARS(expenses, false)` / `formatARS(totalBudgetAmount, false)` instead of hardcoded strings
- AreaTrend data: use `trendData` instead of `TREND_DATA`

**Recent transactions section:** Replace `MOCK_TRANSACTIONS.map(...)` with `transactions.slice(0, 5).map(...)`. If empty:
```tsx
{transactions.length === 0 ? (
  <EmptyState icon={Inbox} title="Sin movimientos" subtitle="Cargá tu primer gasto o ingreso." action={{ label: 'Cargar', onClick: () => openModal('newTxn') }} />
) : (
  transactions.slice(0, 5).map((txn) => (
    <TxRow key={txn.id} txn={txn} />
  ))
)}
```

**Health score section:** Replace `HEALTH_BREAKDOWN` mapping and hardcoded score `69` with a placeholder empty state:
```tsx
<div className="flex flex-col items-center justify-center h-full" style={{ minHeight: 120 }}>
  <span className="font-sans" style={{ fontSize: 12, color: t.text3 }}>Próximamente</span>
</div>
```

- [ ] **Step 2: Update DashboardMobile.tsx**

Same pattern as desktop. **Remove** same 3 mock constants. **Add** same imports, hooks, useEffect, computed values.

Replace:
- Hero balance values with computed `balance`, `income`, `expenses`
- `TREND_DATA` with `trendData`
- `MOCK_TRANSACTIONS` mapping with `transactions.slice(0, 5)`
- `HEALTH_BREAKDOWN` section with "Próximamente" placeholder
- Health score `69` with placeholder
- Budget section hardcoded values with `budgetProgress`, `expenses`, `totalBudgetAmount`

Add empty state for transactions section when empty.

- [ ] **Step 3: Add `formatARS` import if missing**

Both dashboard files may need:
```tsx
import { formatARS } from '@/lib/constants';
```

Check if already imported; add if not.

- [ ] **Step 4: Verify TypeScript compiles**

Run: `cd /Users/aaronfel/Desktop/Projects/velqora-ai && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add src/pages/dashboard/DashboardDesktop.tsx src/pages/dashboard/DashboardMobile.tsx
git commit -m "feat(dashboard): wire real transaction and budget data, add empty states"
```

---

### Task 6: Budgets Page — Real Data

**Files:**
- Modify: `src/pages/budgets/BudgetsDesktop.tsx`
- Modify: `src/pages/budgets/BudgetsMobile.tsx`

Delete `MOCK_BUDGETS`, `MOCK_GOALS`. Wire `budgetStore` + `transactionStore` (for spent computation). The Budget type has `amount` but no `spent` — we compute spent from transactions matching each budget's `category_id` in the same month.

- [ ] **Step 1: Update BudgetsDesktop.tsx**

**Remove:** `MOCK_BUDGETS` (lines 12-19), `MOCK_GOALS` (lines 21-25).

**Add imports:**
```tsx
import { useEffect } from 'react';
import { useBudgetStore } from '@/stores/budgetStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { useGroupStore } from '@/stores/groupStore';
import EmptyState from '@/components/ui/EmptyState';
import { budgetSpentMap } from '@/lib/aggregations';
import { PiggyBank, Target } from 'lucide-react';
```

**Add store hooks:**
```tsx
const activeGroup = useGroupStore((s) => s.activeGroup);
const { budgets, goals, fetchBudgets, fetchGoals } = useBudgetStore();
const { transactions, fetchTransactions } = useTransactionStore();
```

**Update month logic** — `MONTHS` array stays (it's UI labels). The `monthIdx` state stays. Compute the actual month key:
```tsx
const now = new Date();
const selectedMonth = new Date(now.getFullYear(), now.getMonth() - monthIdx, 1);
const monthKey = `${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2, '0')}`;
```

Note: `monthIdx` is 0 for current month. When user clicks ChevronLeft, it goes backward. The existing `MONTHS` constant maps `monthIdx` to display labels — replace with computed label:
```tsx
const monthLabel = MONTHS[selectedMonth.getMonth()];
```

**Add useEffect:**
```tsx
useEffect(() => {
  if (activeGroup) {
    fetchBudgets(activeGroup.id, monthKey);
    fetchGoals(activeGroup.id);
    fetchTransactions(activeGroup.id);
  }
}, [activeGroup, fetchBudgets, fetchGoals, fetchTransactions, monthKey]);
```

**Compute spent per category:**
```tsx
const spentMap = budgetSpentMap(transactions, monthKey);
```

**Update BudgetCardLarge** to accept `spent` prop computed from `spentMap`:
The existing `BudgetCardLarge` sub-component uses `budget.spent` and `budget.total`. Since `Budget` type has `amount` (not `total`) and no `spent`, update the component to receive:
```tsx
// Change BudgetCardLarge props from mock shape to real shape:
function BudgetCardLarge({ budget, spent }: { budget: Budget; spent: number }) {
```

Where it renders, use `budget.amount` instead of `budget.total`, and `spent` prop instead of `budget.spent`. Category comes from `budget.category` relation.

When mapping budgets:
```tsx
{budgets.length === 0 ? (
  <div className="col-span-12">
    <EmptyState icon={Target} title="Sin presupuestos" subtitle="Creá presupuestos por categoría para controlar tus gastos." action={{ label: 'Crear presupuesto', onClick: () => openModal('newBudget') }} />
  </div>
) : (
  budgets.map((b) => (
    <div key={b.id} className="col-span-4">
      <BudgetCardLarge budget={b} spent={spentMap.get(b.category_id) ?? 0} />
    </div>
  ))
)}
```

**Update summary computations:**
```tsx
const totalBudget = budgets.reduce((s, b) => s + b.amount, 0);
const totalSpent = budgets.reduce((s, b) => s + (spentMap.get(b.category_id) ?? 0), 0);
const totalAvailable = totalBudget - totalSpent;
const exceededCount = budgets.filter((b) => (spentMap.get(b.category_id) ?? 0) > b.amount).length;
```

**Update GoalCardLarge** to accept `SavingsGoal` type:
```tsx
function GoalCardLarge({ goal }: { goal: SavingsGoal }) {
```

Use `goal.target_amount` instead of `goal.target`, `goal.current_amount` instead of `goal.current`. Category icon/color come from `goal.icon` and `goal.color`.

When mapping goals:
```tsx
{goals.length === 0 ? (
  <div className="col-span-12">
    <EmptyState icon={PiggyBank} title="Sin metas de ahorro" subtitle="Creá una meta y hacé un seguimiento de tu progreso." action={{ label: 'Crear meta', onClick: () => openModal('newGoal') }} />
  </div>
) : (
  goals.map((g) => (
    <div key={g.id} className="col-span-4">
      <GoalCardLarge goal={g} />
    </div>
  ))
)}
```

- [ ] **Step 2: Update BudgetsMobile.tsx**

Same pattern. Remove `MOCK_BUDGETS`, `MOCK_GOALS`. Add same imports, hooks, useEffect.

Update `BudgetCard` and `GoalCard` sub-components to accept real types with `spent` prop and `SavingsGoal` respectively.

Summary computation uses `spentMap` same as desktop.

Empty states for both tabs.

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd /Users/aaronfel/Desktop/Projects/velqora-ai && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/pages/budgets/BudgetsDesktop.tsx src/pages/budgets/BudgetsMobile.tsx
git commit -m "feat(budgets): wire real budget and goal data, compute spent from transactions"
```

---

### Task 7: Insights Page — Real Data

**Files:**
- Modify: `src/pages/insights/InsightsDesktop.tsx`
- Modify: `src/pages/insights/InsightsMobile.tsx`

Delete all mock constants. Compute all chart data client-side from transactions.

- [ ] **Step 1: Update InsightsDesktop.tsx**

**Remove:** `SPENDING_DONUT` (lines 13-21), `TREND_DATA` (line 23), `MONTH_LABELS` (line 24), `BAR_MONTHS` (line 26), `BAR_INCOME` (line 27), `BAR_EXPENSE` (line 28), `ADVISOR_TIPS` (lines 30-46), `total` (line 50).

**Add imports:**
```tsx
import { useEffect } from 'react';
import { useTransactionStore } from '@/stores/transactionStore';
import { useGroupStore } from '@/stores/groupStore';
import EmptyState from '@/components/ui/EmptyState';
import { sumByType, groupByCategory, monthlyTotals, currentMonthKey } from '@/lib/aggregations';
import { BarChart3 } from 'lucide-react';
```

**Add store hooks:**
```tsx
const activeGroup = useGroupStore((s) => s.activeGroup);
const { transactions, loading, fetchTransactions } = useTransactionStore();
```

**Add useEffect:**
```tsx
useEffect(() => {
  if (activeGroup) fetchTransactions(activeGroup.id);
}, [activeGroup, fetchTransactions]);
```

**Compute all chart data:**
```tsx
const month = currentMonthKey();
const monthTxns = transactions.filter((t) => t.date.startsWith(month));
const monthExpenses = sumByType(monthTxns, 'expense');
const monthIncome = sumByType(monthTxns, 'income');
const savingsRate = monthIncome > 0 ? Math.round(((monthIncome - monthExpenses) / monthIncome) * 100) : 0;

const donutData = groupByCategory(monthTxns);
const total = donutData.reduce((s, d) => s + d.value, 0);

const { labels: monthLabels, income: barIncome, expense: barExpense } = monthlyTotals(transactions, 7);
const trendData = barExpense;
```

**Replace hardcoded stat cards:**
- "Gasto del mes" `$340.250` → `formatARS(monthExpenses, false)`
- "Ingresos del mes" `$560.000` → `formatARS(monthIncome, false)`
- "Tasa de ahorro" `40%` → `${savingsRate}%`
- Health ring score `72` → placeholder "—" text
- Remove percentage deltas (`+8.3%`, `+3.7%`, `+2%`) — replace with empty string or hide (no historical comparison data yet)

**Replace chart data:**
- DonutChart: `data={donutData}` instead of `SPENDING_DONUT`
- AreaTrend: `data={trendData}` instead of `TREND_DATA`, labels from `monthLabels`
- BarPair: `months={monthLabels.slice(0, 6)}`, `income={barIncome.slice(0, 6)}`, `expense={barExpense.slice(0, 6)}`

**AI Advisor section:** Replace `ADVISOR_TIPS` mapping with empty state:
```tsx
<div className="flex flex-col items-center justify-center" style={{ padding: '24px 16px' }}>
  <Sparkles size={20} style={{ color: t.accent, marginBottom: 8 }} />
  <span className="font-sans text-center" style={{ fontSize: 12.5, color: t.text3, lineHeight: 1.5 }}>
    El asesor IA estará disponible pronto.
  </span>
</div>
```

**Wrap entire content in empty check:**
If `!loading && transactions.length === 0`, show full-page empty state instead of all charts:
```tsx
if (!loading && transactions.length === 0) {
  return (
    <div style={{ padding: 48 }}>
      <EmptyState
        icon={BarChart3}
        title="Necesitás movimientos para ver insights"
        subtitle="Cargá ingresos y gastos para que aparezcan tus estadísticas."
      />
    </div>
  );
}
```

- [ ] **Step 2: Update InsightsMobile.tsx**

Same pattern. **Remove** all mock constants including `HEALTH_TILES`.

Add same imports, hooks, useEffect, computed values.

Replace chart data with computed values. Replace `HEALTH_TILES` section with "Próximamente" placeholder. Replace `ADVISOR_TIPS` with empty state message.

Full-page empty state when no transactions.

- [ ] **Step 3: Add formatARS import if missing**

Both insights files need:
```tsx
import { formatARS } from '@/lib/constants';
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `cd /Users/aaronfel/Desktop/Projects/velqora-ai && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add src/pages/insights/InsightsDesktop.tsx src/pages/insights/InsightsMobile.tsx
git commit -m "feat(insights): compute all chart data from real transactions, add empty states"
```

---

### Task 8: Final Verification

- [ ] **Step 1: Full TypeScript check**

Run: `cd /Users/aaronfel/Desktop/Projects/velqora-ai && npx tsc --noEmit --pretty`
Expected: Zero errors

- [ ] **Step 2: Grep for remaining mock data**

Run: `grep -rn "MOCK_\|TREND_DATA\|HEALTH_BREAKDOWN\|HEALTH_TILES\|ADVISOR_TIPS\|SPENDING_DONUT\|BAR_INCOME\|BAR_EXPENSE\|Casa Pérez" src/pages/ --include="*.tsx"`
Expected: Zero results

- [ ] **Step 3: Start dev server and verify**

Run: `cd /Users/aaronfel/Desktop/Projects/velqora-ai && npm run dev`

Test each page:
- Dashboard: shows computed balance or empty state
- Transactions: shows real list or empty state
- Budgets: shows real budgets/goals or empty states
- Insights: shows computed charts or full empty state
- Settings: shows real group name and member list

- [ ] **Step 4: Commit any remaining fixes**

```bash
git add -A
git commit -m "chore: final cleanup after real data migration"
```
