import { useState } from 'react';
import { Search, Sparkles, Camera, Plus, Check } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useModalStore } from '@/stores/modalStore';
import Card from '@/components/ui/Card';
import Chip from '@/components/ui/Chip';
import Eyebrow from '@/components/ui/Eyebrow';
import Avatar from '@/components/ui/Avatar';
import CatIcon from '@/components/ui/CatIcon';
import { formatARS } from '@/lib/constants';
import type { TxRowData } from '@/components/shared/TxRow';

// ─── Mock Data ─────────────────────────────────────────────────────────────
interface DesktopTxRow extends TxRowData {
  dateGroup: string;
  memberInitials: string;
  memberColor: string;
}

const MOCK_TRANSACTIONS: DesktopTxRow[] = [
  {
    id: '1', group_id: 'g1', user_id: 'u1', category_id: 'c1',
    amount: 1250000, currency: 'ARS', type: 'expense',
    description: 'Carrefour', date: '2026-05-11',
    receipt_url: null, is_shared: true, ai_extracted: false, created_at: '',
    dateGroup: 'Hoy — domingo 11 mayo',
    memberInitials: 'AA', memberColor: '#9FCEA0',
    category: { id: 'c1', group_id: 'g1', name: 'Mercado', icon: 'ShoppingCart', color: '#9FCEA0', type: 'expense', is_shared: true, sort_order: 0 },
  },
  {
    id: '2', group_id: 'g1', user_id: 'u1', category_id: 'c2',
    amount: 85000, currency: 'ARS', type: 'expense',
    description: 'Uber', date: '2026-05-11',
    receipt_url: null, is_shared: true, ai_extracted: true, created_at: '',
    dateGroup: 'Hoy — domingo 11 mayo',
    memberInitials: 'MF', memberColor: '#7FA5C4',
    category: { id: 'c2', group_id: 'g1', name: 'Transporte', icon: 'Car', color: '#7FA5C4', type: 'expense', is_shared: true, sort_order: 2 },
  },
  {
    id: '3', group_id: 'g1', user_id: 'u1', category_id: 'c3',
    amount: 48000, currency: 'ARS', type: 'expense',
    description: 'La Cabrera', date: '2026-05-10',
    receipt_url: null, is_shared: false, ai_extracted: true, created_at: '',
    dateGroup: 'Ayer — sábado 10 mayo',
    memberInitials: 'AA', memberColor: '#9FCEA0',
    category: { id: 'c3', group_id: 'g1', name: 'Comer afuera', icon: 'Utensils', color: '#E8A37C', type: 'expense', is_shared: true, sort_order: 1 },
  },
  {
    id: '4', group_id: 'g1', user_id: 'u1', category_id: 'c4',
    amount: 15000000, currency: 'ARS', type: 'income',
    description: 'Sueldo mayo', date: '2026-05-10',
    receipt_url: null, is_shared: true, ai_extracted: false, created_at: '',
    dateGroup: 'Ayer — sábado 10 mayo',
    memberInitials: 'AA', memberColor: '#9FCEA0',
    category: { id: 'c4', group_id: 'g1', name: 'Ingresos', icon: 'Briefcase', color: '#9FCEA0', type: 'income', is_shared: true, sort_order: 10 },
  },
  {
    id: '5', group_id: 'g1', user_id: 'u1', category_id: 'c5',
    amount: 320000, currency: 'ARS', type: 'expense',
    description: 'Netflix + Spotify', date: '2026-05-09',
    receipt_url: null, is_shared: true, ai_extracted: false, created_at: '',
    dateGroup: 'Vie 9 mayo',
    memberInitials: 'MF', memberColor: '#7FA5C4',
    category: { id: 'c5', group_id: 'g1', name: 'Suscripciones', icon: 'Tv', color: '#B89FCE', type: 'expense', is_shared: true, sort_order: 4 },
  },
  {
    id: '6', group_id: 'g1', user_id: 'u1', category_id: 'c6',
    amount: 950000, currency: 'ARS', type: 'expense',
    description: 'YPF combustible', date: '2026-05-09',
    receipt_url: null, is_shared: false, ai_extracted: false, created_at: '',
    dateGroup: 'Vie 9 mayo',
    memberInitials: 'AA', memberColor: '#9FCEA0',
    category: { id: 'c6', group_id: 'g1', name: 'Combustible', icon: 'Fuel', color: '#C9B27E', type: 'expense', is_shared: true, sort_order: 3 },
  },
  {
    id: '7', group_id: 'g1', user_id: 'u1', category_id: 'c7',
    amount: 280000, currency: 'ARS', type: 'expense',
    description: 'Farmacity', date: '2026-05-08',
    receipt_url: null, is_shared: true, ai_extracted: true, created_at: '',
    dateGroup: 'Jue 8 mayo',
    memberInitials: 'MF', memberColor: '#7FA5C4',
    category: { id: 'c7', group_id: 'g1', name: 'Salud', icon: 'Heart', color: '#D97A6C', type: 'expense', is_shared: true, sort_order: 12 },
  },
  {
    id: '8', group_id: 'g1', user_id: 'u1', category_id: 'c8',
    amount: 3500000, currency: 'ARS', type: 'expense',
    description: 'Alquiler mayo', date: '2026-05-08',
    receipt_url: null, is_shared: true, ai_extracted: false, created_at: '',
    dateGroup: 'Jue 8 mayo',
    memberInitials: 'AA', memberColor: '#9FCEA0',
    category: { id: 'c8', group_id: 'g1', name: 'Alquiler', icon: 'Home', color: '#E8D5A8', type: 'expense', is_shared: true, sort_order: 6 },
  },
  {
    id: '9', group_id: 'g1', user_id: 'u1', category_id: 'c9',
    amount: 450000, currency: 'ARS', type: 'expense',
    description: 'Edesur', date: '2026-05-07',
    receipt_url: null, is_shared: true, ai_extracted: false, created_at: '',
    dateGroup: 'Mié 7 mayo',
    memberInitials: 'AA', memberColor: '#9FCEA0',
    category: { id: 'c9', group_id: 'g1', name: 'Servicios', icon: 'Zap', color: '#E8C75A', type: 'expense', is_shared: true, sort_order: 7 },
  },
];

// ─── Filter config ────────────────────────────────────────────────────────
const RANGE_CHIPS = ['Este mes', 'Última semana', 'Últimos 30 días', 'Personalizado'];
const CATEGORIES = ['Mercado', 'Transporte', 'Comer afuera', 'Suscripciones', 'Combustible', 'Salud', 'Alquiler', 'Servicios', 'Ingresos'];
const MEMBERS = ['Aaron', 'María'];
const VIS_CHIPS = ['Todos', 'Compartidos', 'Privados'];

// ─── Group helper ─────────────────────────────────────────────────────────
function groupByDate(txns: DesktopTxRow[]) {
  const map = new Map<string, DesktopTxRow[]>();
  for (const txn of txns) {
    const list = map.get(txn.dateGroup) ?? [];
    list.push(txn);
    map.set(txn.dateGroup, list);
  }
  return map;
}

export default function TransactionsDesktop() {
  const t = useTheme();
  const openModal = useModalStore((s) => s.openModal);

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

  const grouped = groupByDate(MOCK_TRANSACTIONS);

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
              Enero 2026
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
                  {CATEGORIES.map((cat) => {
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
                  {MEMBERS.map((m) => (
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
              {Array.from(grouped.entries()).map(([dateLabel, txns]) => (
                <div key={dateLabel}>
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
                      {dateLabel}
                    </span>
                  </div>

                  {/* Rows */}
                  {txns.map((txn) => {
                    const positive = txn.type === 'income';
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
                          <Avatar
                            initials={txn.memberInitials}
                            size={28}
                            color={txn.memberColor}
                          />
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
        </div>
      </div>
    </div>
  );
}
