import { useState } from 'react';
import { Calendar, Sparkles } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useModalStore } from '@/stores/modalStore';
import Card from '@/components/ui/Card';
import Chip from '@/components/ui/Chip';
import Eyebrow from '@/components/ui/Eyebrow';
import DonutChart from '@/components/charts/DonutChart';
import AreaTrend from '@/components/charts/AreaTrend';
import BarPair from '@/components/charts/BarPair';

const SPENDING_DONUT = [
  { label: 'Mercado', value: 124800, color: '#9FCEA0' },
  { label: 'Comer afuera', value: 86300, color: '#E8A37C' },
  { label: 'Combustible', value: 42300, color: '#C9B27E' },
  { label: 'Transporte', value: 24100, color: '#7FA5C4' },
  { label: 'Ocio', value: 18900, color: '#E89FC4' },
  { label: 'Servicios', value: 18400, color: '#E8C75A' },
  { label: 'Suscripciones', value: 12490, color: '#B89FCE' },
];

const TREND_DATA = [280000, 310000, 295000, 340000, 325000, 360000, 340000];
const MONTHS = ['Nov', 'Dic', 'Ene', 'Feb', 'Mar', 'Abr', 'May'];

const BAR_MONTHS = ['Nov', 'Dic', 'Ene', 'Feb', 'Mar', 'Abr'];
const BAR_INCOME = [520000, 580000, 560000, 590000, 570000, 610000];
const BAR_EXPENSE = [310000, 350000, 340000, 320000, 360000, 340000];

const ADVISOR_TIPS = [
  {
    dot: '#9FCEA0',
    text: 'Tu gasto en mercado bajó un 12% respecto al mes anterior. ¡Buen trabajo!',
  },
  {
    dot: '#E8C75A',
    text: 'Comer afuera representó el 26% de tu gasto. Considera cocinar más en casa.',
  },
  {
    dot: '#E89FC4',
    text: 'Tus suscripciones sumaron $12.490. Revisá si usás todos los servicios.',
  },
];

const HEALTH_TILES = [
  { label: 'Tasa de ahorro', value: '40%', delta: '+2%', deltaColor: '#9FCEA0' },
  { label: 'Adherencia', value: '62%', delta: '-5%', deltaColor: '#E89FC4' },
  { label: 'Ratio deuda', value: '0.12', delta: 'Bajo', deltaColor: '#9FCEA0' },
  { label: 'Tendencia', value: '↗', delta: 'Mejora', deltaColor: '#9FCEA0' },
];

const PERIODS = ['Semana', 'Mes', 'Año', 'Todo'];

const total = SPENDING_DONUT.reduce((s, d) => s + d.value, 0);

export default function InsightsMobile() {
  const t = useTheme();
  const showToast = useModalStore((s) => s.showToast);
  const [period, setPeriod] = useState('Mes');

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
            $340.250
          </div>
          <div className="flex items-center gap-1 mt-1">
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: t.bad, fontWeight: 500 }}>
              +8.3% vs mes anterior
            </span>
          </div>
          <div className="mt-4 -mx-1">
            <AreaTrend data={TREND_DATA} width={340} height={72} color={t.expense} />
          </div>
          <div className="flex justify-between mt-1 px-1">
            {MONTHS.map((m) => (
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
              <DonutChart data={SPENDING_DONUT} size={140} thickness={20} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 9, color: t.text4, letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>
                  TOTAL
                </div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 15, fontWeight: 500, color: t.text, lineHeight: 1.1 }}>
                  $327k
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              {SPENDING_DONUT.map((cat) => (
                <div key={cat.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full flex-shrink-0" style={{ width: 7, height: 7, background: cat.color }} />
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: t.text2 }}>
                      {cat.label}
                    </span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: t.text3 }}>
                    {Math.round((cat.value / total) * 100)}%
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
          <BarPair months={BAR_MONTHS} income={BAR_INCOME} expense={BAR_EXPENSE} />
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
          <div className="space-y-3">
            {ADVISOR_TIPS.map((tip, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="rounded-full flex-shrink-0 mt-1" style={{ width: 7, height: 7, background: tip.dot }} />
                <p style={{ fontFamily: 'var(--font-serif)', fontSize: 13, fontStyle: 'italic', color: t.text2, lineHeight: 1.45 }}>
                  {tip.text}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Health Breakdown Card */}
        <Card pad={18}>
          <Eyebrow style={{ marginBottom: 12 }}>Salud financiera</Eyebrow>
          <div className="grid grid-cols-2 gap-2">
            {HEALTH_TILES.map((tile) => (
              <div
                key={tile.label}
                className="rounded-xl flex flex-col gap-1"
                style={{ background: t.surface2, border: `1px solid ${t.border}`, padding: '12px 14px' }}
              >
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: t.text4 }}>
                  {tile.label}
                </div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 500, color: t.text, lineHeight: 1 }}>
                  {tile.value}
                </div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: tile.deltaColor, fontWeight: 500 }}>
                  {tile.delta}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
