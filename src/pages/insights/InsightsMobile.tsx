import { useState, useEffect } from 'react';
import { Calendar, Sparkles, BarChart3 } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useModalStore } from '@/stores/modalStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { useGroupStore } from '@/stores/groupStore';
import { sumByType, groupByCategory, monthlyTotals, currentMonthKey } from '@/lib/aggregations';
import { formatARS } from '@/lib/constants';
import Card from '@/components/ui/Card';
import Chip from '@/components/ui/Chip';
import Eyebrow from '@/components/ui/Eyebrow';
import EmptyState from '@/components/ui/EmptyState';
import DonutChart from '@/components/charts/DonutChart';
import AreaTrend from '@/components/charts/AreaTrend';
import BarPair from '@/components/charts/BarPair';

const PERIODS = ['Semana', 'Mes', 'Año', 'Todo'];

export default function InsightsMobile() {
  const t = useTheme();
  const showToast = useModalStore((s) => s.showToast);
  const [period, setPeriod] = useState('Mes');

  const activeGroup = useGroupStore((s) => s.activeGroup);
  const { transactions, loading, fetchTransactions } = useTransactionStore();

  useEffect(() => {
    if (activeGroup) fetchTransactions(activeGroup.id);
  }, [activeGroup, fetchTransactions]);

  const month = currentMonthKey();
  const monthTxns = transactions.filter((tx) => tx.date.startsWith(month));
  const monthExpenses = sumByType(monthTxns, 'expense');

  const donutData = groupByCategory(monthTxns);
  const total = donutData.reduce((s, d) => s + d.value, 0);

  const { labels: monthLabels, income: barIncome, expense: barExpense } = monthlyTotals(transactions, 7);
  const trendData = barExpense;

  if (!loading && transactions.length === 0) {
    return (
      <div className="min-h-screen" style={{ background: t.bg, padding: '32px 40px 48px' }}>
        <EmptyState
          icon={BarChart3}
          title="Necesitás movimientos para ver insights"
          subtitle="Cargá ingresos y gastos para que aparezcan tus estadísticas."
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-y-auto" style={{ background: t.bg, paddingBottom: 112 }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-14 pb-3">
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 500, color: t.text, letterSpacing: '-0.02em' }}>
          Insights
        </div>
        <button
          className="flex items-center justify-center rounded-full"
          style={{ width: 38, height: 38, background: t.surface, border: `1px solid ${t.border}` }}
          onClick={() => showToast('Próximamente: filtro por fecha', 'neutral')}
        >
          <Calendar size={16} color={t.text2} />
        </button>
      </div>

      {/* Period Chips */}
      <div className="flex gap-2 px-5 pb-4">
        {PERIODS.map((p) => (
          <Chip key={p} active={period === p} onClick={() => setPeriod(p)}>
            {p}
          </Chip>
        ))}
      </div>

      <div className="px-4 space-y-3">
        {/* Hero Stat Card */}
        <Card pad={18}>
          <Eyebrow>Gasto mensual</Eyebrow>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 38, fontWeight: 500, color: t.text, letterSpacing: '-0.03em', lineHeight: 1.05, marginTop: 6 }}>
            {formatARS(monthExpenses, false)}
          </div>
          <div className="mt-4 -mx-1">
            <AreaTrend data={trendData} width={340} height={72} color={t.expense} />
          </div>
          <div className="flex justify-between mt-1 px-1">
            {monthLabels.map((m) => (
              <span key={m} style={{ fontFamily: 'var(--font-sans)', fontSize: 9, color: t.text4, letterSpacing: '0.04em' }}>
                {m}
              </span>
            ))}
          </div>
        </Card>

        {/* Donut Card */}
        <Card pad={18}>
          <Eyebrow>Por categoría</Eyebrow>
          <div className="flex items-center gap-4 mt-3">
            <div className="relative flex-shrink-0">
              <DonutChart data={donutData} size={140} thickness={20} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 9, color: t.text4, letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>
                  TOTAL
                </div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 15, fontWeight: 500, color: t.text, lineHeight: 1.1 }}>
                  {formatARS(total, false)}
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              {donutData.map((cat) => (
                <div key={cat.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full flex-shrink-0" style={{ width: 7, height: 7, background: cat.color }} />
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: t.text2 }}>
                      {cat.label}
                    </span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: t.text3 }}>
                    {total > 0 ? Math.round((cat.value / total) * 100) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Income vs Expense Card */}
        <Card pad={18}>
          <div className="flex items-center justify-between mb-3">
            <Eyebrow>Ingresos vs Gastos</Eyebrow>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="rounded-full" style={{ width: 7, height: 7, background: t.income }} />
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 10, color: t.text3 }}>Ingresos</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="rounded-full" style={{ width: 7, height: 7, background: t.expense }} />
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 10, color: t.text3 }}>Gastos</span>
              </div>
            </div>
          </div>
          <BarPair months={monthLabels.slice(0, 6)} income={barIncome.slice(0, 6)} expense={barExpense.slice(0, 6)} />
        </Card>

        {/* AI Advisor Card */}
        <Card
          pad={18}
          style={{ background: `linear-gradient(135deg, ${t.surface2} 0%, ${t.surface} 100%)` }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={15} color={t.accent} />
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, color: t.text }}>
              Asesor IA
            </span>
          </div>
          <div className="flex flex-col items-center justify-center py-4">
            <Sparkles size={18} style={{ color: t.accent, marginBottom: 8 }} />
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: t.text3, textAlign: 'center' }}>
              El asesor IA estará disponible pronto.
            </span>
          </div>
        </Card>

        {/* Health Breakdown Card */}
        <Card pad={18}>
          <Eyebrow style={{ marginBottom: 12 }}>Salud financiera</Eyebrow>
          <div className="flex flex-col items-center justify-center py-4">
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, color: t.text3 }}>
              Próximamente
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}
