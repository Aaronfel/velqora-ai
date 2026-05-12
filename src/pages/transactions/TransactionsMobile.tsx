import { useState, useEffect } from 'react';
import { Filter, Search, Sparkles, Camera, Plus, Inbox } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useModalStore } from '@/stores/modalStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { useGroupStore } from '@/stores/groupStore';
import Card from '@/components/ui/Card';
import Chip from '@/components/ui/Chip';
import TxRow from '@/components/shared/TxRow';
import EmptyState from '@/components/ui/EmptyState';
import { formatARS } from '@/lib/constants';
import { groupByDate, sumByType } from '@/lib/aggregations';

// ─── Filter chip labels ─────────────────────────────────────────────────────
const RANGE_CHIPS = ['Mayo 2026', 'Última semana', 'Este mes', 'Personalizado'];
const VIS_CHIPS = ['Todos', 'Compartidos', 'Privados'];

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (dateStr === today.toISOString().slice(0, 10)) return 'Hoy';
  if (dateStr === yesterday.toISOString().slice(0, 10)) return 'Ayer';

  return d.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' });
}

export default function TransactionsMobile() {
  const t = useTheme();
  const openModal = useModalStore((s) => s.openModal);

  const activeGroup = useGroupStore((s) => s.activeGroup);
  const { transactions, loading, fetchTransactions } = useTransactionStore();

  useEffect(() => {
    if (activeGroup) fetchTransactions(activeGroup.id);
  }, [activeGroup, fetchTransactions]);

  const [activeRange, setActiveRange] = useState('Mayo 2026');
  const [activeVis, setActiveVis] = useState('Todos');

  const income = sumByType(transactions, 'income');
  const expenses = sumByType(transactions, 'expense');
  const net = income - expenses;

  const grouped = groupByDate(transactions);

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
        {!loading && transactions.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="Sin movimientos"
            subtitle="Agregá tu primera transacción para empezar a ver tus finanzas."
            action={{ label: 'Nuevo movimiento', onClick: () => openModal('newTxn') }}
          />
        ) : (
          Array.from(grouped.entries()).map(([dateStr, txns]) => (
            <div key={dateStr}>
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
                  {formatDateLabel(dateStr)}
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
          ))
        )}
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
