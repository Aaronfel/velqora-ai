import { Bell } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/stores/authStore';
import { useModalStore } from '@/stores/modalStore';
import Avatar from '@/components/ui/Avatar';
import Card from '@/components/ui/Card';
import Eyebrow from '@/components/ui/Eyebrow';
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

export default function DashboardMobile() {
  const t = useTheme();
  const user = useAuthStore((s) => s.user);
  const openModal = useModalStore((s) => s.openModal);

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
            $4.820.000
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
              +$15.000.000 ingresos
            </span>
            <span style={{ color: t.text4 }}>·</span>
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 12,
                color: t.expense,
              }}
            >
              −$10.180.000 gastos
            </span>
          </div>
          <div className="mt-4 -mx-1">
            <AreaTrend data={TREND_DATA} width={340} height={72} color={t.accent} />
          </div>
        </Card>

        {/* Health Score Card */}
        <Card pad={16} style={{ background: t.surface }}>
          <div className="flex items-center gap-4">
            <HealthRing score={69} size={80} thickness={8} />
            <div className="flex-1 space-y-2">
              <Eyebrow>Salud financiera</Eyebrow>
              {HEALTH_BREAKDOWN.map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between mb-1">
                    <span
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: 11,
                        color: t.text2,
                      }}
                    >
                      {item.label}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 11,
                        color: t.text3,
                      }}
                    >
                      {item.value}
                    </span>
                  </div>
                  <ProgressBar value={item.value} max={100} color={item.color} height={4} />
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Month Progress */}
        <Card pad={16} style={{ background: t.surface }}>
          <div className="flex justify-between items-center mb-3">
            <Eyebrow>Presupuesto mayo</Eyebrow>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: t.text3,
              }}
            >
              68%
            </span>
          </div>
          <ProgressBar value={68} max={100} color={t.accent} height={8} />
          <div className="flex justify-between mt-2">
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 11,
                color: t.text3,
              }}
            >
              $10.180.000 gastados
            </span>
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 11,
                color: t.text2,
              }}
            >
              de $15.000.000
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
          <div
            className="divide-y"
            style={{ borderColor: t.glassDivider }}
          >
            {MOCK_TRANSACTIONS.map((txn) => (
              <TxRow key={txn.id} txn={txn} dense />
            ))}
          </div>
        </Card>

        {/* Exchange Rate */}
        <ExchangeRateCard />
      </div>
    </div>
  );
}
