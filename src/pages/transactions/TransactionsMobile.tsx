import { useState } from 'react';
import { Filter, Search, Sparkles, Camera, Plus } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useModalStore } from '@/stores/modalStore';
import Card from '@/components/ui/Card';
import Chip from '@/components/ui/Chip';
import TxRow from '@/components/shared/TxRow';
import { formatARS } from '@/lib/constants';
import type { TxRowData } from '@/components/shared/TxRow';

// ─── Mock Data ─────────────────────────────────────────────────────────────
const MOCK_TRANSACTIONS: (TxRowData & { dateGroup: string })[] = [
  {
    id: '1', group_id: 'g1', user_id: 'u1', category_id: 'c1',
    amount: 1250000, currency: 'ARS', type: 'expense',
    description: 'Carrefour', date: '2026-05-11',
    receipt_url: null, is_shared: true, ai_extracted: false, created_at: '',
    dateGroup: 'Hoy',
    category: { id: 'c1', group_id: 'g1', name: 'Mercado', icon: 'ShoppingCart', color: '#9FCEA0', type: 'expense', is_shared: true, sort_order: 0 },
  },
  {
    id: '2', group_id: 'g1', user_id: 'u1', category_id: 'c2',
    amount: 85000, currency: 'ARS', type: 'expense',
    description: 'Uber', date: '2026-05-11',
    receipt_url: null, is_shared: true, ai_extracted: true, created_at: '',
    dateGroup: 'Hoy',
    category: { id: 'c2', group_id: 'g1', name: 'Transporte', icon: 'Car', color: '#7FA5C4', type: 'expense', is_shared: true, sort_order: 2 },
  },
  {
    id: '3', group_id: 'g1', user_id: 'u1', category_id: 'c3',
    amount: 48000, currency: 'ARS', type: 'expense',
    description: 'La Cabrera', date: '2026-05-10',
    receipt_url: null, is_shared: false, ai_extracted: true, created_at: '',
    dateGroup: 'Ayer',
    category: { id: 'c3', group_id: 'g1', name: 'Comer afuera', icon: 'Utensils', color: '#E8A37C', type: 'expense', is_shared: true, sort_order: 1 },
  },
  {
    id: '4', group_id: 'g1', user_id: 'u1', category_id: 'c4',
    amount: 15000000, currency: 'ARS', type: 'income',
    description: 'Sueldo mayo', date: '2026-05-10',
    receipt_url: null, is_shared: true, ai_extracted: false, created_at: '',
    dateGroup: 'Ayer',
    category: { id: 'c4', group_id: 'g1', name: 'Ingresos', icon: 'Briefcase', color: '#9FCEA0', type: 'income', is_shared: true, sort_order: 10 },
  },
  {
    id: '5', group_id: 'g1', user_id: 'u1', category_id: 'c5',
    amount: 320000, currency: 'ARS', type: 'expense',
    description: 'Netflix + Spotify', date: '2026-05-09',
    receipt_url: null, is_shared: true, ai_extracted: false, created_at: '',
    dateGroup: 'Vie 9 may',
    category: { id: 'c5', group_id: 'g1', name: 'Suscripciones', icon: 'Tv', color: '#B89FCE', type: 'expense', is_shared: true, sort_order: 4 },
  },
  {
    id: '6', group_id: 'g1', user_id: 'u1', category_id: 'c6',
    amount: 950000, currency: 'ARS', type: 'expense',
    description: 'YPF combustible', date: '2026-05-09',
    receipt_url: null, is_shared: false, ai_extracted: false, created_at: '',
    dateGroup: 'Vie 9 may',
    category: { id: 'c6', group_id: 'g1', name: 'Combustible', icon: 'Fuel', color: '#C9B27E', type: 'expense', is_shared: true, sort_order: 3 },
  },
  {
    id: '7', group_id: 'g1', user_id: 'u1', category_id: 'c7',
    amount: 280000, currency: 'ARS', type: 'expense',
    description: 'Farmacity', date: '2026-05-08',
    receipt_url: null, is_shared: true, ai_extracted: true, created_at: '',
    dateGroup: 'Jue 8 may',
    category: { id: 'c7', group_id: 'g1', name: 'Salud', icon: 'Heart', color: '#D97A6C', type: 'expense', is_shared: true, sort_order: 12 },
  },
  {
    id: '8', group_id: 'g1', user_id: 'u1', category_id: 'c8',
    amount: 3500000, currency: 'ARS', type: 'expense',
    description: 'Alquiler mayo', date: '2026-05-08',
    receipt_url: null, is_shared: true, ai_extracted: false, created_at: '',
    dateGroup: 'Jue 8 may',
    category: { id: 'c8', group_id: 'g1', name: 'Alquiler', icon: 'Home', color: '#E8D5A8', type: 'expense', is_shared: true, sort_order: 6 },
  },
  {
    id: '9', group_id: 'g1', user_id: 'u1', category_id: 'c9',
    amount: 450000, currency: 'ARS', type: 'expense',
    description: 'Edesur', date: '2026-05-07',
    receipt_url: null, is_shared: true, ai_extracted: false, created_at: '',
    dateGroup: 'Mié 7 may',
    category: { id: 'c9', group_id: 'g1', name: 'Servicios', icon: 'Zap', color: '#E8C75A', type: 'expense', is_shared: true, sort_order: 7 },
  },
];

// ─── Summary ─────────────────────────────────────────────────────────────────
const income = MOCK_TRANSACTIONS
  .filter((t) => t.type === 'income')
  .reduce((s, t) => s + t.amount, 0);
const expenses = MOCK_TRANSACTIONS
  .filter((t) => t.type === 'expense')
  .reduce((s, t) => s + t.amount, 0);
const net = income - expenses;

// ─── Group by date ─────────────────────────────────────────────────────────
function groupByDate(txns: typeof MOCK_TRANSACTIONS) {
  const map = new Map<string, typeof MOCK_TRANSACTIONS>();
  for (const txn of txns) {
    const list = map.get(txn.dateGroup) ?? [];
    list.push(txn);
    map.set(txn.dateGroup, list);
  }
  return map;
}

// ─── Filter chip labels ─────────────────────────────────────────────────────
const RANGE_CHIPS = ['Mayo 2026', 'Última semana', 'Este mes', 'Personalizado'];
const VIS_CHIPS = ['Todos', 'Compartidos', 'Privados'];

export default function TransactionsMobile() {
  const t = useTheme();
  const openModal = useModalStore((s) => s.openModal);

  const [activeRange, setActiveRange] = useState('Mayo 2026');
  const [activeVis, setActiveVis] = useState('Todos');

  const grouped = groupByDate(MOCK_TRANSACTIONS);

  return (
    <div
      className="min-h-screen overflow-y-auto"
      style={{ background: t.bg, paddingBottom: 112 }}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 pt-14 pb-3">
        <div
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 28,
            fontWeight: 500,
            color: t.text,
            letterSpacing: '-0.02em',
          }}
        >
          Movimientos
        </div>
        <button
          onClick={() => {/* open filter panel */}}
          className="flex items-center justify-center rounded-full"
          style={{
            width: 38,
            height: 38,
            background: t.surface,
            border: `1px solid ${t.border}`,
          }}
        >
          <Filter size={16} color={t.text2} />
        </button>
      </div>

      {/* ── NL Search bar ── */}
      <div className="px-4 mb-3">
        <button
          onClick={() => openModal('nlSearch')}
          className="w-full flex items-center gap-2 rounded-2xl"
          style={{
            height: 44,
            background: t.surface,
            border: `1px solid ${t.border}`,
            padding: '0 14px',
          }}
        >
          <Search size={15} color={t.text3} />
          <span
            className="flex-1 text-left"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 13.5,
              color: t.text4,
            }}
          >
            Buscar o filtrar por lenguaje natural…
          </span>
          <Sparkles size={14} color={t.accent} />
        </button>
      </div>

      {/* ── Filter chips ── */}
      <div
        className="flex gap-2 px-4 mb-3 overflow-x-auto"
        style={{ scrollbarWidth: 'none' }}
      >
        {RANGE_CHIPS.map((chip) => (
          <Chip key={chip} active={activeRange === chip} onClick={() => setActiveRange(chip)}>
            {chip}
          </Chip>
        ))}
        {VIS_CHIPS.map((chip) => (
          <Chip key={chip} active={activeVis === chip} onClick={() => setActiveVis(chip)}>
            {chip}
          </Chip>
        ))}
      </div>

      {/* ── Summary bar ── */}
      <div
        className="mx-4 mb-4 grid grid-cols-3 gap-px rounded-2xl overflow-hidden"
        style={{ border: `1px solid ${t.border}`, background: t.border }}
      >
        {[
          { label: 'Ingresos', value: income, color: t.income },
          { label: 'Gastos', value: expenses, color: t.expense },
          { label: 'Neto', value: net, color: t.accent },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="flex flex-col items-center py-3"
            style={{ background: t.surface }}
          >
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 10,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: t.text3,
                fontWeight: 500,
              }}
            >
              {label}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 13,
                fontWeight: 600,
                color,
                marginTop: 2,
              }}
            >
              {value >= 0 ? '' : '−'}
              {formatARS(Math.abs(value), false)}
            </span>
          </div>
        ))}
      </div>

      {/* ── Transaction groups ── */}
      <div className="px-4 space-y-2">
        {Array.from(grouped.entries()).map(([dateLabel, txns]) => (
          <div key={dateLabel}>
            {/* Sticky date header */}
            <div
              className="sticky top-0 z-10 flex items-center mb-1 py-1"
              style={{
                background: t.bg + 'ee',
                backdropFilter: 'blur(8px)',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 10.5,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: t.text3,
                  fontWeight: 600,
                }}
              >
                {dateLabel}
              </span>
            </div>

            {/* Card wrapping rows */}
            <Card pad={0} style={{ overflow: 'hidden' }}>
              <div
                className="divide-y"
                style={{ '--tw-divide-opacity': '1', borderColor: t.glassDivider } as React.CSSProperties}
              >
                {txns.map((txn) => (
                  <div key={txn.id} className="px-4">
                    <TxRow txn={txn} dense />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        ))}
      </div>

      {/* ── FAB cluster ── */}
      <div
        className="fixed bottom-24 right-4 flex flex-col items-end gap-3 z-20"
      >
        {/* Camera FAB (small) */}
        <button
          onClick={() => openModal('receipt')}
          className="flex items-center justify-center rounded-full"
          style={{
            width: 44,
            height: 44,
            background: t.glassStrong,
            backdropFilter: 'blur(40px) saturate(1.8)',
            border: `1px solid ${t.glassEdge}`,
            boxShadow: `0 12px 28px -6px ${t.shadow}, inset 0 0.5px 0 0 ${t.glassEdgeStrong}`,
          }}
        >
          <Camera size={18} color={t.text2} />
        </button>

        {/* Plus FAB (large, accent) */}
        <button
          onClick={() => openModal('newTxn')}
          className="flex items-center justify-center rounded-full"
          style={{
            width: 56,
            height: 56,
            background: t.accent,
            boxShadow: `0 12px 28px -6px ${t.shadow}, inset 0 0.5px 0 0 ${t.glassEdgeStrong}`,
          }}
        >
          <Plus size={22} color={t.accentText} />
        </button>
      </div>
    </div>
  );
}
