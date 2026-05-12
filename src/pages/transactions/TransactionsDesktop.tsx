import { useState, useEffect } from 'react';
import { Search, Sparkles, Camera, Plus, Check, Inbox } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useModalStore } from '@/stores/modalStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { useGroupStore } from '@/stores/groupStore';
import Card from '@/components/ui/Card';
import Chip from '@/components/ui/Chip';
import Eyebrow from '@/components/ui/Eyebrow';
import Avatar from '@/components/ui/Avatar';
import CatIcon from '@/components/ui/CatIcon';
import EmptyState from '@/components/ui/EmptyState';
import { formatARS } from '@/lib/constants';
import { groupByDate } from '@/lib/aggregations';

// ─── Filter config ────────────────────────────────────────────────────────
const RANGE_CHIPS = ['Este mes', 'Última semana', 'Últimos 30 días', 'Personalizado'];
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

export default function TransactionsDesktop() {
  const t = useTheme();
  const openModal = useModalStore((s) => s.openModal);

  const activeGroup = useGroupStore((s) => s.activeGroup);
  const members = useGroupStore((s) => s.members);
  const { transactions, loading, fetchTransactions } = useTransactionStore();

  useEffect(() => {
    if (activeGroup) fetchTransactions(activeGroup.id);
  }, [activeGroup, fetchTransactions]);

  const [activeRange, setActiveRange] = useState('Este mes');
  const [activeVis, setActiveVis] = useState('Todos');
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [activeMembers, setActiveMembers] = useState<string[]>([]);

  function toggleCategory(cat: string) {
    setActiveCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  function toggleMember(m: string) {
    setActiveMembers((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
    );
  }

  const categories = Array.from(new Set(transactions.map((t) => t.category?.name).filter(Boolean))) as string[];
  const memberNames = members.map((m) => m.user?.name ?? '').filter(Boolean);
  const grouped = groupByDate(transactions);

  const monthLabel = (() => {
    const label = new Date().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
    return label.charAt(0).toUpperCase() + label.slice(1);
  })();

  return (
    <div
      className="min-h-screen"
      style={{ background: t.bg, padding: '32px 32px 48px' }}
    >
      {/* ── 12-col grid ── */}
      <div className="grid grid-cols-12 gap-6">

        {/* ── Header row (col-span-12) ── */}
        <div className="col-span-12 flex items-end justify-between">
          <div>
            <Eyebrow>Finanzas personales</Eyebrow>
            <div
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 36,
                fontWeight: 500,
                color: t.text,
                letterSpacing: '-0.025em',
                lineHeight: 1.1,
                marginTop: 6,
              }}
            >
              {monthLabel}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            {/* NL search bar */}
            <button
              onClick={() => openModal('nlSearch')}
              className="flex items-center gap-2 rounded-2xl"
              style={{
                height: 40,
                padding: '0 16px',
                background: t.surface,
                border: `1px solid ${t.border}`,
                minWidth: 240,
              }}
            >
              <Search size={14} color={t.text3} />
              <span
                className="flex-1 text-left"
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 13,
                  color: t.text4,
                }}
              >
                Buscar…
              </span>
              <Sparkles size={13} color={t.accent} />
            </button>

            {/* Receipt button */}
            <button
              onClick={() => openModal('receipt')}
              className="flex items-center gap-1.5 rounded-xl"
              style={{
                height: 40,
                padding: '0 16px',
                background: t.surface,
                border: `1px solid ${t.border}`,
                fontFamily: 'var(--font-sans)',
                fontSize: 13,
                color: t.text2,
                fontWeight: 500,
              }}
            >
              <Camera size={15} color={t.text2} />
              Recibo
            </button>

            {/* New transaction button */}
            <button
              onClick={() => openModal('newTxn')}
              className="flex items-center gap-1.5 rounded-xl"
              style={{
                height: 40,
                padding: '0 18px',
                background: t.accent,
                fontFamily: 'var(--font-sans)',
                fontSize: 13,
                color: t.accentText,
                fontWeight: 600,
              }}
            >
              <Plus size={15} color={t.accentText} />
              Nuevo
            </button>
          </div>
        </div>

        {/* ── Filter sidebar (col-span-3) ── */}
        <div className="col-span-3">
          <div className="sticky top-8 space-y-5">
            <Card pad={20}>
              {/* Range chips */}
              <div className="mb-4">
                <Eyebrow style={{ marginBottom: 10 }}>Período</Eyebrow>
                <div className="flex flex-wrap gap-2">
                  {RANGE_CHIPS.map((chip) => (
                    <Chip key={chip} active={activeRange === chip} onClick={() => setActiveRange(chip)}>
                      {chip}
                    </Chip>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: t.glassDivider, marginBottom: 16 }} />

              {/* Categories checkboxes */}
              <div className="mb-4">
                <Eyebrow style={{ marginBottom: 10 }}>Categorías</Eyebrow>
                <div className="space-y-2">
                  {categories.map((cat) => {
                    const isActive = activeCategories.includes(cat);
                    return (
                      <button
                        key={cat}
                        onClick={() => toggleCategory(cat)}
                        className="w-full flex items-center gap-2.5 rounded-lg"
                        style={{ padding: '5px 0' }}
                      >
                        <div
                          className="flex items-center justify-center rounded-md shrink-0"
                          style={{
                            width: 18,
                            height: 18,
                            background: isActive ? t.accent : 'transparent',
                            border: `1.5px solid ${isActive ? t.accent : t.border}`,
                          }}
                        >
                          {isActive && <Check size={11} color={t.accentText} strokeWidth={3} />}
                        </div>
                        <span
                          style={{
                            fontFamily: 'var(--font-sans)',
                            fontSize: 12.5,
                            color: isActive ? t.text : t.text2,
                          }}
                        >
                          {cat}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: t.glassDivider, marginBottom: 16 }} />

              {/* Member chips */}
              <div className="mb-4">
                <Eyebrow style={{ marginBottom: 10 }}>Miembros</Eyebrow>
                <div className="flex flex-wrap gap-2">
                  {memberNames.map((m) => (
                    <Chip key={m} active={activeMembers.includes(m)} onClick={() => toggleMember(m)}>
                      {m}
                    </Chip>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: t.glassDivider, marginBottom: 16 }} />

              {/* Visibility chips */}
              <div>
                <Eyebrow style={{ marginBottom: 10 }}>Visibilidad</Eyebrow>
                <div className="flex flex-wrap gap-2">
                  {VIS_CHIPS.map((chip) => (
                    <Chip key={chip} active={activeVis === chip} onClick={() => setActiveVis(chip)}>
                      {chip}
                    </Chip>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* ── Transaction table (col-span-9) ── */}
        <div className="col-span-9">
          {!loading && transactions.length === 0 ? (
            <Card pad={0} style={{ overflow: 'hidden' }}>
              <EmptyState
                icon={Inbox}
                title="Sin movimientos"
                subtitle="Agregá tu primera transacción para empezar a ver tus finanzas."
                action={{ label: 'Nuevo movimiento', onClick: () => openModal('newTxn') }}
              />
            </Card>
          ) : (
            <Card pad={0} style={{ overflow: 'hidden' }}>
              {/* Column headers */}
              <div
                className="grid"
                style={{
                  gridTemplateColumns: '1fr 140px 90px 80px 100px 120px',
                  padding: '12px 20px',
                  borderBottom: `1px solid ${t.border}`,
                  gap: 8,
                }}
              >
                {['Descripción', 'Categoría', 'Miembro', 'Privado', 'Fecha', 'Importe'].map((col) => (
                  <div
                    key={col}
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: 10.5,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: t.text3,
                      fontWeight: 600,
                    }}
                  >
                    {col}
                  </div>
                ))}
              </div>

              {/* Grouped rows */}
              <div>
                {Array.from(grouped.entries()).map(([dateStr, txns]) => (
                  <div key={dateStr}>
                    {/* Date group header */}
                    <div
                      className="sticky top-0 z-10 px-5 py-2"
                      style={{
                        background: t.bg + 'ee',
                        backdropFilter: 'blur(8px)',
                        borderBottom: `1px solid ${t.glassDivider}`,
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

                    {/* Rows */}
                    {txns.map((txn) => {
                      const positive = txn.type === 'income';
                      const initials = (txn.user?.name ?? '?').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
                      return (
                        <button
                          key={txn.id}
                          className="w-full grid text-left transition-colors hover:opacity-80"
                          style={{
                            gridTemplateColumns: '1fr 140px 90px 80px 100px 120px',
                            padding: '14px 20px',
                            borderBottom: `1px solid ${t.glassDivider}`,
                            gap: 8,
                            alignItems: 'center',
                          }}
                          onClick={() => openModal('editTxn')}
                        >
                          {/* Description + icon */}
                          <div className="flex items-center gap-3 min-w-0">
                            {txn.category ? (
                              <CatIcon icon={txn.category.icon} color={txn.category.color} size={34} />
                            ) : (
                              <div
                                className="rounded-xl shrink-0"
                                style={{ width: 34, height: 34, background: t.surface3 }}
                              />
                            )}
                            <div className="min-w-0">
                              <div
                                className="flex items-center gap-1.5 truncate"
                                style={{
                                  fontFamily: 'var(--font-sans)',
                                  fontSize: 13.5,
                                  color: t.text,
                                  fontWeight: 500,
                                }}
                              >
                                {txn.description}
                                {txn.ai_extracted && <Sparkles size={10} color={t.accent} />}
                              </div>
                            </div>
                          </div>

                          {/* Category */}
                          <div
                            style={{
                              fontFamily: 'var(--font-sans)',
                              fontSize: 12,
                              color: t.text3,
                            }}
                          >
                            {txn.category?.name ?? '—'}
                          </div>

                          {/* Member avatar */}
                          <div>
                            <Avatar initials={initials} size={28} />
                          </div>

                          {/* Visibility */}
                          <div
                            style={{
                              fontFamily: 'var(--font-sans)',
                              fontSize: 11,
                              color: txn.is_shared ? t.text3 : t.navy,
                            }}
                          >
                            {txn.is_shared ? 'Compartido' : 'Privado'}
                          </div>

                          {/* Date */}
                          <div
                            style={{
                              fontFamily: 'var(--font-sans)',
                              fontSize: 12,
                              color: t.text3,
                            }}
                          >
                            {txn.date}
                          </div>

                          {/* Amount */}
                          <div
                            className="text-right"
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: 13,
                              fontWeight: 500,
                              color: positive ? t.income : t.text,
                            }}
                          >
                            {positive ? '+' : '−'}
                            {formatARS(Math.abs(txn.amount), false)}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
