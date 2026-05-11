import { useState } from 'react';
import { Plus, ScanLine } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/stores/authStore';
import { useModalStore } from '@/stores/modalStore';
import Card from '@/components/ui/Card';
import Eyebrow from '@/components/ui/Eyebrow';
import Chip from '@/components/ui/Chip';
import ProgressBar from '@/components/ui/ProgressBar';
import AreaTrend from '@/components/charts/AreaTrend';
import HealthRing from '@/components/charts/HealthRing';
import TxRow from '@/components/shared/TxRow';
import AITipCard from '@/components/shared/AITipCard';
import ExchangeRateCard from '@/components/shared/ExchangeRateCard';
import type { TxRowData } from '@/components/shared/TxRow';

const TREND_DATA = [42000, 38000, 51000, 47000, 53000, 49000, 61000, 58000, 63000, 70000];

const MOCK_TRANSACTIONS: TxRowData[] = [
  {
    id: '1', group_id: 'g1', user_id: 'u1', category_id: 'c1',
    amount: 1250000, currency: 'ARS', type: 'expense',
    description: 'Carrefour', date: '2026-05-10',
    receipt_url: null, is_shared: true, ai_extracted: false, created_at: '',
    category: { id: 'c1', group_id: 'g1', name: 'Mercado', icon: 'ShoppingCart', color: '#9FCEA0', type: 'expense', is_shared: true, sort_order: 0 },
  },
  {
    id: '2', group_id: 'g1', user_id: 'u1', category_id: 'c2',
    amount: 480000, currency: 'ARS', type: 'expense',
    description: 'La Cabrera', date: '2026-05-09',
    receipt_url: null, is_shared: false, ai_extracted: true, created_at: '',
    category: { id: 'c2', group_id: 'g1', name: 'Comer afuera', icon: 'Utensils', color: '#E8A37C', type: 'expense', is_shared: true, sort_order: 1 },
  },
  {
    id: '3', group_id: 'g1', user_id: 'u1', category_id: 'c3',
    amount: 15000000, currency: 'ARS', type: 'income',
    description: 'Sueldo mayo', date: '2026-05-08',
    receipt_url: null, is_shared: true, ai_extracted: false, created_at: '',
    category: { id: 'c3', group_id: 'g1', name: 'Ingresos', icon: 'Briefcase', color: '#9FCEA0', type: 'income', is_shared: true, sort_order: 10 },
  },
  {
    id: '4', group_id: 'g1', user_id: 'u1', category_id: 'c4',
    amount: 320000, currency: 'ARS', type: 'expense',
    description: 'Netflix + Spotify', date: '2026-05-07',
    receipt_url: null, is_shared: true, ai_extracted: false, created_at: '',
    category: { id: 'c4', group_id: 'g1', name: 'Suscripciones', icon: 'Tv', color: '#B89FCE', type: 'expense', is_shared: true, sort_order: 4 },
  },
  {
    id: '5', group_id: 'g1', user_id: 'u1', category_id: 'c5',
    amount: 95000, currency: 'ARS', type: 'expense',
    description: 'SUBE y Cabify', date: '2026-05-06',
    receipt_url: null, is_shared: false, ai_extracted: false, created_at: '',
    category: { id: 'c5', group_id: 'g1', name: 'Transporte', icon: 'Car', color: '#7FA5C4', type: 'expense', is_shared: true, sort_order: 2 },
  },
];

const HEALTH_BREAKDOWN = [
  { label: 'Ahorro', value: 72, color: '#9FCEA0' },
  { label: 'Presupuesto', value: 61, color: '#E8D5A8' },
  { label: 'Deuda', value: 88, color: '#7FA5C4' },
  { label: 'Tendencias', value: 55, color: '#B89FCE' },
];

const PERIODS = ['Hoy', 'Semana', 'Mes', 'Año'] as const;
type Period = (typeof PERIODS)[number];

export default function DashboardDesktop() {
  const t = useTheme();
  const user = useAuthStore((s) => s.user);
  const openModal = useModalStore((s) => s.openModal);
  const [period, setPeriod] = useState<Period>('Mes');

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
              $4.820.000
            </div>
            <div className="mt-4 -mx-2">
              <AreaTrend data={TREND_DATA} width={600} height={100} color={t.accent} />
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
                  $15.000.000
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
                  $10.180.000
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
                  $4.820.000
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Health score sidebar — col-span-4 */}
        <div className="col-span-4">
          <Card pad={24} style={{ background: t.surface, height: '100%' }}>
            <Eyebrow>Salud financiera</Eyebrow>
            <div className="flex justify-center mt-4">
              <HealthRing score={69} size={120} thickness={10} />
            </div>
            <div className="space-y-3 mt-6">
              {HEALTH_BREAKDOWN.map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between mb-1.5">
                    <span
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: 12,
                        color: t.text2,
                      }}
                    >
                      {item.label}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 12,
                        color: t.text3,
                      }}
                    >
                      {item.value}
                    </span>
                  </div>
                  <ProgressBar value={item.value} max={100} color={item.color} height={5} />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Month progress — col-span-5 */}
        <div className="col-span-5">
          <Card pad={20} style={{ background: t.surface }}>
            <div className="flex justify-between items-center mb-3">
              <Eyebrow>Presupuesto mayo</Eyebrow>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  color: t.text3,
                }}
              >
                68%
              </span>
            </div>
            <ProgressBar value={68} max={100} color={t.accent} height={10} />
            <div className="flex justify-between mt-3">
              <span
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 12,
                  color: t.text3,
                }}
              >
                $10.180.000 gastados
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 12,
                  color: t.text2,
                }}
              >
                de $15.000.000
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
            <div className="divide-y" style={{ borderColor: t.glassDivider }}>
              {MOCK_TRANSACTIONS.map((txn) => (
                <TxRow key={txn.id} txn={txn} />
              ))}
            </div>
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
