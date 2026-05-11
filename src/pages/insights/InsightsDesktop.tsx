import { useState } from 'react';
import { Calendar, Sparkles, ArrowRight } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useModalStore } from '@/stores/modalStore';
import Card from '@/components/ui/Card';
import Chip from '@/components/ui/Chip';
import Eyebrow from '@/components/ui/Eyebrow';
import DonutChart from '@/components/charts/DonutChart';
import AreaTrend from '@/components/charts/AreaTrend';
import BarPair from '@/components/charts/BarPair';
import HealthRing from '@/components/charts/HealthRing';

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
const MONTH_LABELS = ['Nov', 'Dic', 'Ene', 'Feb', 'Mar', 'Abr', 'May'];

const BAR_MONTHS = ['Nov', 'Dic', 'Ene', 'Feb', 'Mar', 'Abr'];
const BAR_INCOME = [520000, 580000, 560000, 590000, 570000, 610000];
const BAR_EXPENSE = [310000, 350000, 340000, 320000, 360000, 340000];

const ADVISOR_TIPS = [
  {
    dot: '#9FCEA0',
    title: 'Buen control de mercado',
    desc: 'Tu gasto en mercado bajó un 12% respecto al mes anterior.',
  },
  {
    dot: '#E8C75A',
    title: 'Revisar comer afuera',
    desc: 'Representó el 26% del gasto total. Cocinar más podría ayudar.',
  },
  {
    dot: '#E89FC4',
    title: 'Auditar suscripciones',
    desc: 'Sumaron $12.490. Verificá si usás todos los servicios activos.',
  },
];

const PERIODS = ['Semana', 'Mes', 'Año', 'Todo'];

const total = SPENDING_DONUT.reduce((s, d) => s + d.value, 0);

export default function InsightsDesktop() {
  const t = useTheme();
  const showToast = useModalStore((s) => s.showToast);
  const [period, setPeriod] = useState('Mes');

  return (
    <div className="min-h-screen overflow-y-auto" style={{ background: t.bg, padding: '32px 40px 48px' }}>
      {/* Header Row */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <Eyebrow style={{ marginBottom: 6 }}>Análisis & Asesoría IA</Eyebrow>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 30, fontWeight: 500, color: t.text, letterSpacing: '-0.02em' }}>
            Insights de enero
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
              $340.250
            </div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: t.bad, fontWeight: 500, marginTop: 2 }}>
              +8.3% vs enero ant.
            </div>
          </Card>
        </div>
        {/* Ingresos del mes */}
        <div className="col-span-3">
          <Card pad={18}>
            <Eyebrow>Ingresos del mes</Eyebrow>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 500, color: t.text, letterSpacing: '-0.02em', marginTop: 6 }}>
              $560.000
            </div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: t.income, fontWeight: 500, marginTop: 2 }}>
              +3.7% vs enero ant.
            </div>
          </Card>
        </div>
        {/* Tasa de ahorro */}
        <div className="col-span-3">
          <Card pad={18}>
            <Eyebrow>Tasa de ahorro</Eyebrow>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 500, color: t.text, letterSpacing: '-0.02em', marginTop: 6 }}>
              40%
            </div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: t.income, fontWeight: 500, marginTop: 2 }}>
              +2% vs enero ant.
            </div>
          </Card>
        </div>
        {/* Salud financiera */}
        <div className="col-span-3">
          <Card pad={18}>
            <Eyebrow style={{ marginBottom: 6 }}>Salud financiera</Eyebrow>
            <div className="flex items-center gap-3">
              <HealthRing score={72} size={52} thickness={6} />
              <div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 500, color: t.text, lineHeight: 1 }}>
                  Buena
                </div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: t.text3, marginTop: 2 }}>
                  72 / 100
                </div>
              </div>
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
                <DonutChart data={SPENDING_DONUT} size={200} thickness={28} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 9, color: t.text4, letterSpacing: '0.12em', textTransform: 'uppercase' as const }}>
                    TOTAL
                  </div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 500, color: t.text, lineHeight: 1.1 }}>
                    $327k
                  </div>
                </div>
              </div>
              <div className="flex-1 space-y-2.5">
                {SPENDING_DONUT.map((cat) => {
                  const pct = Math.round((cat.value / total) * 100);
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
                          ${cat.value.toLocaleString('es-AR')}
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
            <AreaTrend data={TREND_DATA} width={500} height={170} color={t.expense} />
            <div className="flex justify-between mt-1 px-1">
              {MONTH_LABELS.map((m) => (
                <span key={m} style={{ fontFamily: 'var(--font-sans)', fontSize: 10, color: t.text4, letterSpacing: '0.04em' }}>
                  {m}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4 pt-4" style={{ borderTop: `1px solid ${t.border}` }}>
              {[
                { label: 'Promedio', value: '$320k' },
                { label: 'Pico', value: '$360k' },
                { label: 'Mínimo', value: '$280k' },
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
            <BarPair months={BAR_MONTHS} income={BAR_INCOME} expense={BAR_EXPENSE} />
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
            <div className="space-y-3 mb-5">
              {ADVISOR_TIPS.map((tip, i) => (
                <div
                  key={i}
                  className="rounded-xl"
                  style={{ background: `${t.bg}88`, border: `1px solid ${t.border}`, padding: '12px 14px' }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="rounded-full flex-shrink-0" style={{ width: 7, height: 7, background: tip.dot }} />
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600, color: t.text }}>
                      {tip.title}
                    </span>
                  </div>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: t.text3, lineHeight: 1.45, paddingLeft: 15 }}>
                    {tip.desc}
                  </p>
                </div>
              ))}
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
