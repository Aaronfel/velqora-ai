import { useState, useEffect } from 'react';
import { Plus, ScanLine, Inbox } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/stores/authStore';
import { useModalStore } from '@/stores/modalStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { useBudgetStore } from '@/stores/budgetStore';
import { useGroupStore } from '@/stores/groupStore';
import Card from '@/components/ui/Card';
import Eyebrow from '@/components/ui/Eyebrow';
import Chip from '@/components/ui/Chip';
import ProgressBar from '@/components/ui/ProgressBar';
import AreaTrend from '@/components/charts/AreaTrend';
import TxRow from '@/components/shared/TxRow';
import AITipCard from '@/components/shared/AITipCard';
import ExchangeRateCard from '@/components/shared/ExchangeRateCard';
import EmptyState from '@/components/ui/EmptyState';
import { sumByType, monthlyTotals, currentMonthKey } from '@/lib/aggregations';
import { formatARS } from '@/lib/constants';

const PERIODS = ['Hoy', 'Semana', 'Mes', 'Año'] as const;
type Period = (typeof PERIODS)[number];

export default function DashboardDesktop() {
  const t = useTheme();
  const user = useAuthStore((s) => s.user);
  const openModal = useModalStore((s) => s.openModal);
  const [period, setPeriod] = useState<Period>('Mes');

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

  const greeting =
    new Date().getHours() < 12
      ? 'Buenos días'
      : new Date().getHours() < 19
      ? 'Buenas tardes'
      : 'Buenas noches';

  const today = new Date().toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div
      className="min-h-screen overflow-y-auto"
      style={{ background: t.bg, padding: '32px 32px 48px' }}
    >
      <div className="grid grid-cols-12 gap-4">

        {/* Greeting strip — col-span-12 */}
        <div className="col-span-12 flex items-center justify-between">
          <div>
            <Eyebrow style={{ color: t.text3 }}>{today}</Eyebrow>
            <div
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 28,
                fontWeight: 500,
                color: t.text,
                letterSpacing: '-0.02em',
                marginTop: 4,
              }}
            >
              {greeting},{' '}
              <span style={{ color: t.accent }}>
                {user?.name?.split(' ')[0] ?? 'bienvenido'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {PERIODS.map((p) => (
              <Chip key={p} active={period === p} onClick={() => setPeriod(p)}>
                {p}
              </Chip>
            ))}
          </div>
        </div>

        {/* Balance hero — col-span-8 */}
        <div className="col-span-8">
          <Card pad={24} style={{ background: t.surface, height: '100%' }}>
            <Eyebrow>Balance del mes</Eyebrow>
            <div
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 56,
                fontWeight: 500,
                color: t.text,
                letterSpacing: '-0.03em',
                lineHeight: 1.05,
                marginTop: 8,
              }}
            >
              {formatARS(balance, false)}
            </div>
            <div className="mt-4 -mx-2">
              <AreaTrend data={trendData} width={600} height={100} color={t.accent} />
            </div>
            <div
              className="grid grid-cols-3 gap-4 mt-4 pt-4"
              style={{ borderTop: `1px solid ${t.border}` }}
            >
              <div>
                <Eyebrow style={{ color: t.text3 }}>Ingresos</Eyebrow>
                <div
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 22,
                    color: t.income,
                    fontWeight: 500,
                    marginTop: 4,
                  }}
                >
                  {formatARS(income, false)}
                </div>
              </div>
              <div>
                <Eyebrow style={{ color: t.text3 }}>Gastos</Eyebrow>
                <div
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 22,
                    color: t.expense,
                    fontWeight: 500,
                    marginTop: 4,
                  }}
                >
                  {formatARS(expenses, false)}
                </div>
              </div>
              <div>
                <Eyebrow style={{ color: t.text3 }}>Ahorro</Eyebrow>
                <div
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 22,
                    color: t.accent,
                    fontWeight: 500,
                    marginTop: 4,
                  }}
                >
                  {formatARS(balance, false)}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Health score sidebar — col-span-4 */}
        <div className="col-span-4">
          <Card pad={24} style={{ background: t.surface, height: '100%' }}>
            <Eyebrow>Salud financiera</Eyebrow>
            <div className="flex flex-col items-center justify-center" style={{ minHeight: 200 }}>
              <span className="font-sans" style={{ fontSize: 13, color: t.text3 }}>Próximamente</span>
            </div>
          </Card>
        </div>

        {/* Month progress — col-span-5 */}
        <div className="col-span-5">
          <Card pad={20} style={{ background: t.surface }}>
            <div className="flex justify-between items-center mb-3">
              <Eyebrow>Presupuesto {monthName}</Eyebrow>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  color: t.text3,
                }}
              >
                {budgetProgress}%
              </span>
            </div>
            <ProgressBar value={budgetProgress} max={100} color={t.accent} height={10} />
            <div className="flex justify-between mt-3">
              <span
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 12,
                  color: t.text3,
                }}
              >
                {formatARS(expenses, false)} gastados
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 12,
                  color: t.text2,
                }}
              >
                de {formatARS(totalBudgetAmount, false)}
              </span>
            </div>
          </Card>
        </div>

        {/* Exchange rate — col-span-4 */}
        <div className="col-span-4">
          <ExchangeRateCard />
        </div>

        {/* Quick add — col-span-3 */}
        <div className="col-span-3">
          <Card
            pad={20}
            style={{
              background: 'transparent',
              border: `1.5px dashed ${t.border}`,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: 12,
            }}
          >
            <button
              onClick={() => openModal('newTxn')}
              className="w-full flex items-center gap-2 rounded-xl transition-colors hover:opacity-80"
              style={{
                padding: '10px 14px',
                background: t.accent,
                color: t.accentText,
                fontSize: 13,
                fontWeight: 500,
                fontFamily: 'var(--font-sans)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <Plus size={15} />
              Cargar movimiento
            </button>
            <button
              onClick={() => openModal('receipt')}
              className="w-full flex items-center gap-2 rounded-xl transition-colors hover:opacity-80"
              style={{
                padding: '10px 14px',
                background: t.surface2,
                color: t.text2,
                fontSize: 13,
                fontWeight: 500,
                fontFamily: 'var(--font-sans)',
                border: `1px solid ${t.border}`,
                cursor: 'pointer',
              }}
            >
              <ScanLine size={15} />
              Escanear recibo
            </button>
          </Card>
        </div>

        {/* Recent transactions — col-span-8 */}
        <div className="col-span-8">
          <Card pad={20} style={{ background: t.surface }}>
            <div className="flex items-center justify-between mb-2">
              <Eyebrow>Últimos movimientos</Eyebrow>
              <span
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 12,
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
              <div className="divide-y" style={{ borderColor: t.glassDivider }}>
                {transactions.slice(0, 5).map((txn) => (
                  <TxRow key={txn.id} txn={txn} />
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* AI Tip — col-span-4 */}
        <div className="col-span-4">
          <AITipCard />
        </div>
      </div>
    </div>
  );
}
