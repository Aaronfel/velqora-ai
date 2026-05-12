import { useEffect } from 'react';
import { Bell, Inbox } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/stores/authStore';
import { useModalStore } from '@/stores/modalStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { useBudgetStore } from '@/stores/budgetStore';
import { useGroupStore } from '@/stores/groupStore';
import Avatar from '@/components/ui/Avatar';
import Card from '@/components/ui/Card';
import Eyebrow from '@/components/ui/Eyebrow';
import ProgressBar from '@/components/ui/ProgressBar';
import AreaTrend from '@/components/charts/AreaTrend';
import TxRow from '@/components/shared/TxRow';
import AITipCard from '@/components/shared/AITipCard';
import ExchangeRateCard from '@/components/shared/ExchangeRateCard';
import EmptyState from '@/components/ui/EmptyState';
import { sumByType, monthlyTotals, currentMonthKey } from '@/lib/aggregations';
import { formatARS } from '@/lib/constants';

export default function DashboardMobile() {
  const t = useTheme();
  const user = useAuthStore((s) => s.user);
  const openModal = useModalStore((s) => s.openModal);

  const activeGroup = useGroupStore((s) => s.activeGroup);
  const { transactions, fetchTransactions } = useTransactionStore();
  const { budgets, fetchBudgets } = useBudgetStore();

  const month = currentMonthKey();
  const monthName = new Date().toLocaleDateString('es-AR', { month: 'long' });

  useEffect(() => {
    if (activeGroup) {
      fetchTransactions(activeGroup.id);
      fetchBudgets(activeGroup.id, month);
    }
  }, [activeGroup, fetchTransactions, fetchBudgets, month]);

  const monthTxns = transactions.filter((t) => t.date.startsWith(month));
  const income = sumByType(monthTxns, 'income');
  const expenses = sumByType(monthTxns, 'expense');
  const balance = income - expenses;
  const { expense: trendData } = monthlyTotals(transactions, 10);

  const totalBudgetAmount = budgets.reduce((s, b) => s + b.amount, 0);
  const budgetProgress = totalBudgetAmount > 0 ? Math.round((expenses / totalBudgetAmount) * 100) : 0;

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'AA';

  const greeting = new Date().getHours() < 12 ? 'Buenos días' : new Date().getHours() < 19 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <div
      className="min-h-screen overflow-y-auto"
      style={{ background: t.bg, paddingBottom: 112 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-14 pb-4">
        <div className="flex items-center gap-3">
          <Avatar initials={initials} size={38} ring />
          <div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: t.text3 }}>
              {greeting}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 18,
                color: t.text,
                fontWeight: 500,
                lineHeight: 1.1,
              }}
            >
              {user?.name?.split(' ')[0] ?? 'Hola'}
            </div>
          </div>
        </div>
        <button
          onClick={() => openModal('notifs')}
          className="flex items-center justify-center rounded-full"
          style={{
            width: 38,
            height: 38,
            background: t.surface,
            border: `1px solid ${t.border}`,
          }}
        >
          <Bell size={16} color={t.text2} />
        </button>
      </div>

      <div className="px-4 space-y-3">
        {/* Hero Balance */}
        <Card pad={18} style={{ background: t.surface }}>
          <Eyebrow>Balance del mes</Eyebrow>
          <div
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 42,
              fontWeight: 500,
              color: t.text,
              letterSpacing: '-0.03em',
              lineHeight: 1.05,
              marginTop: 6,
            }}
          >
            {formatARS(balance, false)}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 12,
                color: t.income,
                fontWeight: 500,
              }}
            >
              +{formatARS(income, false)} ingresos
            </span>
            <span style={{ color: t.text4 }}>·</span>
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 12,
                color: t.expense,
              }}
            >
              −{formatARS(expenses, false)} gastos
            </span>
          </div>
          <div className="mt-4 -mx-1">
            <AreaTrend data={trendData} width={340} height={72} color={t.accent} />
          </div>
        </Card>

        {/* Health Score Card */}
        <Card pad={16} style={{ background: t.surface }}>
          <Eyebrow>Salud financiera</Eyebrow>
          <div className="flex flex-col items-center justify-center" style={{ minHeight: 80 }}>
            <span className="font-sans" style={{ fontSize: 13, color: t.text3 }}>Próximamente</span>
          </div>
        </Card>

        {/* Month Progress */}
        <Card pad={16} style={{ background: t.surface }}>
          <div className="flex justify-between items-center mb-3">
            <Eyebrow>Presupuesto {monthName}</Eyebrow>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: t.text3,
              }}
            >
              {budgetProgress}%
            </span>
          </div>
          <ProgressBar value={budgetProgress} max={100} color={t.accent} height={8} />
          <div className="flex justify-between mt-2">
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 11,
                color: t.text3,
              }}
            >
              {formatARS(expenses, false)} gastados
            </span>
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 11,
                color: t.text2,
              }}
            >
              de {formatARS(totalBudgetAmount, false)}
            </span>
          </div>
        </Card>

        {/* AI Tip */}
        <AITipCard />

        {/* Recent Transactions */}
        <Card pad={16} style={{ background: t.surface }}>
          <div className="flex items-center justify-between mb-1">
            <Eyebrow>Últimos movimientos</Eyebrow>
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 11,
                color: t.accent,
                cursor: 'pointer',
              }}
            >
              Ver todos
            </span>
          </div>
          {transactions.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="Sin movimientos"
              subtitle="Cargá tu primer gasto o ingreso."
              action={{ label: 'Cargar', onClick: () => openModal('newTxn') }}
            />
          ) : (
            <div
              className="divide-y"
              style={{ borderColor: t.glassDivider }}
            >
              {transactions.slice(0, 5).map((txn) => (
                <TxRow key={txn.id} txn={txn} dense />
              ))}
            </div>
          )}
        </Card>

        {/* Exchange Rate */}
        <ExchangeRateCard />
      </div>
    </div>
  );
}
