# Real Data Migration — Mock → Database

## Goal

Replace all hardcoded/mock data in Dashboard, Transactions, Budgets, Insights, and Settings pages with real data from Zustand stores (backed by Supabase). Show empty states when no data exists.

## Scope

### In Scope
- Wire all 5 pages to their respective stores
- Create reusable `EmptyState` component
- Compute aggregations client-side for Insights
- Loading states during fetch
- Fix Settings page hardcoded group info/members

### Out of Scope
- AI advisor tips (empty state for now)
- Health score computation (empty state)
- New stores or backend changes
- Realtime subscriptions (already wired separately)

---

## Page-by-Page Design

### 1. Dashboard

**Data Sources:**
- `transactionStore.transactions` — recent transactions list, income/expense totals
- `budgetStore.budgets` — budget progress summary
- `groupStore.activeGroup` — group context
- `authStore.user` — greeting

**Computed Values:**
- Balance = sum(income) - sum(expenses) for current month
- Income = sum of transactions where type='income' in current month
- Expenses = sum of transactions where type='expense' in current month
- Budget progress = sum(spent across all budgets) / sum(budget amounts)
- Trend data = monthly totals for last N months (from transactions)

**Fetch on Mount:**
- `transactionStore.fetchTransactions(activeGroup.id)` with current month date range
- `budgetStore.fetchBudgets(activeGroup.id, currentMonth)`

**Empty States:**
- No transactions → "Cargá tu primer movimiento" with CTA to add transaction modal
- No budgets → budget card shows "Sin presupuestos" with CTA
- Health score section → "Próximamente" placeholder
- Trend chart → hidden or flat line when < 2 data points

**Remove:**
- `TREND_DATA` constant
- `MOCK_TRANSACTIONS` constant
- `HEALTH_BREAKDOWN` constant
- All hardcoded financial numbers

---

### 2. Transactions

**Data Sources:**
- `transactionStore.transactions` — full list with category/user relations
- `transactionStore.filter` + `setFilter` — active filters
- `groupStore.members` — for member filter chips
- Categories from transactions (extract unique)

**Fetch on Mount:**
- `transactionStore.fetchTransactions(activeGroup.id)`

**Filter Integration:**
- Range chips → set `filter.dateRange`
- Category chips → set `filter.categories`
- Member chips → set `filter.members`
- Visibility chips → set `filter.visibility`
- Filters trigger re-fetch or client-side filtering

**Summary Calculations:**
- Income total = sum of type='income' transactions
- Expense total = sum of type='expense' transactions
- Net = income - expenses

**Empty States:**
- No transactions → "No hay movimientos todavía" with CTA
- No results after filtering → "Sin resultados para estos filtros"

**Remove:**
- `MOCK_TRANSACTIONS` constant (both desktop and mobile)
- `CATEGORIES` constant (derive from store)
- `MEMBERS` constant (derive from groupStore.members)

---

### 3. Budgets

**Data Sources:**
- `budgetStore.budgets` — budget list with category relations
- `budgetStore.goals` — savings goals list
- `groupStore.activeGroup` — group context

**Fetch on Mount:**
- `budgetStore.fetchBudgets(activeGroup.id, currentMonth)`
- `budgetStore.fetchGoals(activeGroup.id)`

**Computed Values:**
- Total budget = sum of all budget amounts
- Total spent = sum of all budget spent (need to compute from transactions or add `spent` to budget)
- Available = total - spent
- Exceeded count = budgets where spent > amount

**Note on "spent":** The Budget type doesn't have a `spent` field. Options:
1. Compute from transactions by matching category_id + month — **chosen approach**
2. This means we also need transactions fetched for the budget page

**Empty States:**
- No budgets → "Creá tu primer presupuesto" with CTA
- No goals → "Creá tu primera meta de ahorro" with CTA

**Remove:**
- `MOCK_BUDGETS` constant
- `MOCK_GOALS` constant

---

### 4. Insights

**Data Sources:**
- `transactionStore.transactions` — all transactions for aggregation
- `groupStore.activeGroup` — group context

**Fetch on Mount:**
- `transactionStore.fetchTransactions(activeGroup.id)` with broader date range (last 6-12 months for trends)

**Client-Side Aggregations:**
- Spending donut = group transactions by category, sum amounts
- Monthly trend = group by month, sum expenses
- Income vs Expense bars = group by month, separate income/expense sums
- Savings rate = (income - expenses) / income * 100
- Total spent this month / income this month

**Empty States:**
- No transactions → "Necesitás movimientos para ver insights" — all chart areas show empty state
- AI advisor section → "El asesor IA estará disponible pronto"
- Health score → empty state same as dashboard

**Remove:**
- `SPENDING_DONUT` constant
- `TREND_DATA` constant
- `BAR_INCOME` / `BAR_EXPENSE` constants
- `ADVISOR_TIPS` constant
- `HEALTH_TILES` constant
- All hardcoded stats numbers

---

### 5. Settings

**Data Sources:**
- `groupStore.activeGroup` — group name, type
- `groupStore.members` — real member list with roles
- `authStore.user` — user info (already wired)
- `settingsStore` — preferences (already wired)

**Fetch on Mount:**
- `groupStore.fetchMembers()` (if not already loaded)

**Changes:**
- Replace "Casa Pérez" → `activeGroup.name`
- Replace "3 miembros" → `${members.length} miembros`
- Replace hardcoded member list → map `groupStore.members`
- Member roles from `member.role`

**Empty States:**
- No members besides self → just show self

---

## Shared Components

### EmptyState Component

```
Props:
  icon: LucideIcon
  title: string
  subtitle?: string
  action?: { label: string; onClick: () => void }
```

Centered layout with muted icon, title text, optional subtitle, optional CTA button. Uses theme tokens. Reusable across all pages.

---

## Data Flow

```
Page Mount
  → useEffect with activeGroup.id dependency
  → store.fetch*(activeGroup.id, ...)
  → store.loading = true → show skeleton/spinner
  → store.loading = false → render data or empty state
```

All pages guard on `activeGroup` being non-null (guaranteed by AuthGate/onboarding).

---

## Implementation Order

1. Create `EmptyState` component
2. Settings page (smallest change — just group info/members)
3. Transactions page (straightforward store wiring)
4. Dashboard page (needs computed values from transactions + budgets)
5. Budgets page (needs spent computation from transactions)
6. Insights page (most aggregation logic)

Each page: remove mock constants → add store hooks → add fetch useEffect → compute derived values → render with empty state fallbacks.
