import { useState, useEffect } from 'react';
import { Calendar, Sparkles, ArrowRight, BarChart3 } from 'lucide-react';
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

const insightsMonth = (() => {
  const label = new Date().toLocaleDateString('es-AR', { month: 'long' });
  return label.charAt(0).toUpperCase() + label.slice(1);
})();

export default function InsightsDesktop() {
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
  const monthIncome = sumByType(monthTxns, 'income');
  const savingsRate = monthIncome > 0 ? Math.round(((monthIncome - monthExpenses) / monthIncome) * 100) : 0;

  const donutData = groupByCategory(monthTxns);
  const total = donutData.reduce((s, d) => s + d.value, 0);

  const { labels: monthLabels, income: barIncome, expense: barExpense } = monthlyTotals(transactions, 7);
  const trendData = barExpense;

  const avg = trendData.length > 0 ? Math.round(trendData.reduce((a, b) => a + b, 0) / trendData.length) : 0;
  const peak = trendData.length > 0 ? Math.max(...trendData) : 0;
  const min = trendData.length > 0 ? Math.min(...trendData) : 0;

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
    <div className="min-h-screen overflow-y-auto" style={{ background: t.bg, padding: '32px 40px 48px' }}>
      {/* Header Row */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <Eyebrow style={{ marginBottom: 6 }}>Análisis & Asesoría IA</Eyebrow>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 30, fontWeight: 500, color: t.text, letterSpacing: '-0.02em' }}>
            Insights de {insightsMonth}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {PERIODS.map((p) => (
            <Chip key={p} active={period === p} onClick={() => setPeriod(p)}>
              {p}
            </Chip>
          ))}
          <button
            className="flex items-center justify-center rounded-full ml-2"
            style={{ width: 36, height: 36, background: t.surface, border: `1px solid ${t.border}` }}
            onClick={() => showToast('Próximamente: filtro por fecha', 'neutral')}
          >
            <Calendar size={15} color={t.text2} />
          </button>
        </div>
      </div>

      {/* Top stat row — 4 cards */}
      <div className="grid grid-cols-12 gap-4 mb-4">
        {/* Gasto del mes */}
        <div className="col-span-3">
          <Card pad={18}>
            <Eyebrow>Gasto del mes</Eyebrow>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 500, color: t.text, letterSpacing: '-0.02em', marginTop: 6 }}>
              {formatARS(monthExpenses, false)}
            </div>
          </Card>
        </div>
        {/* Ingresos del mes */}
        <div className="col-span-3">
          <Card pad={18}>
            <Eyebrow>Ingresos del mes</Eyebrow>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 500, color: t.text, letterSpacing: '-0.02em', marginTop: 6 }}>
              {formatARS(monthIncome, false)}
            </div>
          </Card>
        </div>
        {/* Tasa de ahorro */}
        <div className="col-span-3">
          <Card pad={18}>
            <Eyebrow>Tasa de ahorro</Eyebrow>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 500, color: t.text, letterSpacing: '-0.02em', marginTop: 6 }}>
              {savingsRate}%
            </div>
          </Card>
        </div>
        {/* Salud financiera */}
        <div className="col-span-3">
          <Card pad={18}>
            <Eyebrow style={{ marginBottom: 6 }}>Salud financiera</Eyebrow>
            <div className="flex items-center justify-center" style={{ padding: '8px 0' }}>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, color: t.text3 }}>
                Próximamente
              </span>
            </div>
          </Card>
        </div>
      </div>

      {/* Second row: Donut + Trend */}
      <div className="grid grid-cols-12 gap-4 mb-4">
        {/* Donut + categories */}
        <div className="col-span-6">
          <Card pad={20} style={{ height: '100%' }}>
            <Eyebrow style={{ marginBottom: 14 }}>Por categoría</Eyebrow>
            <div className="flex items-center gap-6">
              <div className="relative flex-shrink-0">
                <DonutChart data={donutData} size={200} thickness={28} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 9, color: t.text4, letterSpacing: '0.12em', textTransform: 'uppercase' as const }}>
                    TOTAL
                  </div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 500, color: t.text, lineHeight: 1.1 }}>
                    {formatARS(total, false)}
                  </div>
                </div>
              </div>
              <div className="flex-1 space-y-2.5">
                {donutData.map((cat) => {
                  const pct = total > 0 ? Math.round((cat.value / total) * 100) : 0;
                  return (
                    <div key={cat.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="rounded-full flex-shrink-0" style={{ width: 8, height: 8, background: cat.color }} />
                        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: t.text2 }}>
                          {cat.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: t.text3 }}>
                          {pct}%
                        </span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: t.text4, minWidth: 56, textAlign: 'right' as const }}>
                          {formatARS(cat.value, false)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>

        {/* Trend chart */}
        <div className="col-span-6">
          <Card pad={20} style={{ height: '100%' }}>
            <Eyebrow style={{ marginBottom: 14 }}>Evolución del gasto</Eyebrow>
            <AreaTrend data={trendData} width={500} height={170} color={t.expense} />
            <div className="flex justify-between mt-1 px-1">
              {monthLabels.map((m) => (
                <span key={m} style={{ fontFamily: 'var(--font-sans)', fontSize: 10, color: t.text4, letterSpacing: '0.04em' }}>
                  {m}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4 pt-4" style={{ borderTop: `1px solid ${t.border}` }}>
              {[
                { label: 'Promedio', value: formatARS(avg, false) },
                { label: 'Pico', value: formatARS(peak, false) },
                { label: 'Mínimo', value: formatARS(min, false) },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 500, color: t.text }}>
                    {item.value}
                  </div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 10, color: t.text4, marginTop: 2 }}>
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Third row: Bar chart + AI Advisor */}
      <div className="grid grid-cols-12 gap-4">
        {/* Bar chart */}
        <div className="col-span-8">
          <Card pad={20}>
            <div className="flex items-center justify-between mb-4">
              <Eyebrow>Ingresos vs Gastos</Eyebrow>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="rounded-full" style={{ width: 8, height: 8, background: t.income }} />
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: t.text3 }}>Ingresos</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="rounded-full" style={{ width: 8, height: 8, background: t.expense }} />
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: t.text3 }}>Gastos</span>
                </div>
              </div>
            </div>
            <BarPair months={monthLabels.slice(0, 6)} income={barIncome.slice(0, 6)} expense={barExpense.slice(0, 6)} />
          </Card>
        </div>

        {/* AI Advisor */}
        <div className="col-span-4">
          <Card
            pad={20}
            style={{
              height: '100%',
              background: `linear-gradient(170deg, ${t.surface2} 0%, ${t.surface} 100%)`,
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={16} color={t.accent} />
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600, color: t.text }}>
                Asesor IA
              </span>
            </div>
            <div className="flex flex-col items-center justify-center" style={{ padding: '24px 16px' }}>
              <Sparkles size={20} style={{ color: t.accent, marginBottom: 8 }} />
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, color: t.text3, lineHeight: 1.5, textAlign: 'center' }}>
                El asesor IA estará disponible pronto.
              </span>
            </div>
            <button
              onClick={() => showToast('Próximamente: chat con el asesor IA', 'neutral')}
              className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5"
              style={{ border: `1px solid ${t.accent}40`, color: t.accent, fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500 }}
            >
              Hablar con el asesor
              <ArrowRight size={14} />
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
}
