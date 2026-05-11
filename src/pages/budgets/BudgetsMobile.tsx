import { useState } from 'react';
import { Plus, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useModalStore } from '@/stores/modalStore';
import Card from '@/components/ui/Card';
import CatIcon from '@/components/ui/CatIcon';
import ProgressBar from '@/components/ui/ProgressBar';
import { formatARS } from '@/lib/constants';

// ─── Mock Data ─────────────────────────────────────────────────────────────
const MOCK_BUDGETS = [
  { id: '1', category: { name: 'Mercado', icon: 'ShoppingCart', color: '#9FCEA0' }, spent: 124800, total: 150000 },
  { id: '2', category: { name: 'Comer afuera', icon: 'Utensils', color: '#E8A37C' }, spent: 86300, total: 70000 },
  { id: '3', category: { name: 'Transporte', icon: 'Car', color: '#7FA5C4' }, spent: 24100, total: 40000 },
  { id: '4', category: { name: 'Combustible', icon: 'Fuel', color: '#C9B27E' }, spent: 42300, total: 50000 },
  { id: '5', category: { name: 'Ocio', icon: 'Film', color: '#E89FC4' }, spent: 18900, total: 30000 },
  { id: '6', category: { name: 'Suscripciones', icon: 'Tv', color: '#B89FCE' }, spent: 12490, total: 15000 },
];

const MOCK_GOALS = [
  { id: '1', name: 'Vacaciones Europa', icon: 'Plane', color: '#7FC4B4', current: 850000, target: 2000000, deadline: 'Jun 2026' },
  { id: '2', name: 'Fondo emergencia', icon: 'Shield', color: '#9FCEA0', current: 1200000, target: 3000000, deadline: 'Dic 2026' },
  { id: '3', name: 'MacBook Pro', icon: 'Laptop', color: '#B89FCE', current: 350000, target: 800000, deadline: 'Mar 2026' },
];

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

// ─── BudgetCard ─────────────────────────────────────────────────────────────
interface BudgetCardProps {
  budget: typeof MOCK_BUDGETS[0];
  onPress: () => void;
}

function BudgetCard({ budget, onPress }: BudgetCardProps) {
  const t = useTheme();
  const pct = Math.round((budget.spent / budget.total) * 100);
  const over = budget.spent > budget.total;

  return (
    <button
      onClick={onPress}
      className="w-full text-left transition-transform hover:translate-y-[-1px]"
    >
      <Card pad={14} style={{ marginBottom: 10 }}>
        <div className="flex items-center gap-3">
          <CatIcon icon={budget.category.icon} color={budget.category.color} size={40} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0.5">
              <span
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 14,
                  fontWeight: 600,
                  color: t.text,
                }}
              >
                {budget.category.name}
              </span>
              <MoreHorizontal size={16} color={t.text3} />
            </div>
            <div className="flex items-center justify-between mb-2">
              <span
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 11.5,
                  color: over ? t.bad : t.text3,
                }}
              >
                {over ? 'Excedido' : `${100 - pct}% disponible`}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  color: t.text2,
                }}
              >
                {formatARS(budget.spent, false)}
                <span style={{ color: t.text3 }}>/{formatARS(budget.total, false)}</span>
              </span>
            </div>
            <ProgressBar value={budget.spent} max={budget.total} color={budget.category.color} height={5} />
          </div>
        </div>
      </Card>
    </button>
  );
}

// ─── GoalCard ───────────────────────────────────────────────────────────────
interface GoalCardProps {
  goal: typeof MOCK_GOALS[0];
  onContribute: () => void;
  onEdit: () => void;
}

function GoalCard({ goal, onContribute, onEdit }: GoalCardProps) {
  const t = useTheme();
  const pct = Math.round((goal.current / goal.target) * 100);
  const remaining = goal.target - goal.current;

  return (
    <Card pad={14} style={{ marginBottom: 10 }}>
      <div className="flex items-start gap-3">
        {/* Icon square */}
        <div
          className="flex items-center justify-center rounded-2xl shrink-0"
          style={{
            width: 44,
            height: 44,
            background: goal.color + '22',
            border: `1px solid ${goal.color}30`,
          }}
        >
          <CatIcon icon={goal.icon} color={goal.color} size={44} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-0.5">
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 14,
                  fontWeight: 600,
                  color: t.text,
                }}
              >
                {goal.name}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 11.5,
                  color: t.text3,
                  marginTop: 1,
                }}
              >
                Vence {goal.deadline}
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="flex items-center justify-center rounded-full"
              style={{
                width: 28,
                height: 28,
                background: t.surface2,
                border: `1px solid ${t.border}`,
              }}
            >
              <MoreHorizontal size={13} color={t.text3} />
            </button>
          </div>

          {/* Amounts */}
          <div className="flex items-baseline gap-1 mt-2 mb-1.5">
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 15,
                fontWeight: 600,
                color: t.text,
              }}
            >
              {formatARS(goal.current, false)}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11.5,
                color: t.text3,
              }}
            >
              / {formatARS(goal.target, false)}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 11,
                color: t.text3,
                marginLeft: 2,
              }}
            >
              {pct}%
            </span>
          </div>

          <ProgressBar value={goal.current} max={goal.target} color={goal.color} height={5} />

          {/* Footer */}
          <div className="flex items-center justify-between mt-2.5">
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 11.5,
                color: t.text3,
              }}
            >
              Faltan {formatARS(remaining, false)}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); onContribute(); }}
              className="flex items-center rounded-lg"
              style={{
                padding: '5px 10px',
                background: t.accent,
                fontFamily: 'var(--font-sans)',
                fontSize: 11.5,
                fontWeight: 600,
                color: t.accentText,
              }}
            >
              + Aportar
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function BudgetsMobile() {
  const t = useTheme();
  const openModal = useModalStore((s) => s.openModal);
  const [activeTab, setActiveTab] = useState<'budgets' | 'goals'>('budgets');
  const [monthIdx, setMonthIdx] = useState(0); // 0 = Enero 2026

  const totalSpent = MOCK_BUDGETS.reduce((s, b) => s + b.spent, 0);
  const totalBudget = MOCK_BUDGETS.reduce((s, b) => s + b.total, 0);

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
          Presupuestos
        </div>
        <button
          onClick={() => openModal('budgetForm')}
          className="flex items-center justify-center rounded-full"
          style={{
            width: 38,
            height: 38,
            background: t.accent,
          }}
        >
          <Plus size={18} color={t.accentText} />
        </button>
      </div>

      {/* ── Tab pill ── */}
      <div className="px-4 mb-4">
        <div
          className="flex rounded-full p-1"
          style={{
            background: t.surface,
            border: `1px solid ${t.border}`,
          }}
        >
          {(['budgets', 'goals'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 rounded-full transition-all"
              style={{
                padding: '7px 0',
                background: activeTab === tab ? t.accent : 'transparent',
                color: activeTab === tab ? t.accentText : t.text2,
                fontFamily: 'var(--font-sans)',
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              {tab === 'budgets' ? 'Presupuestos' : 'Metas'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Month picker ── */}
      <div className="flex items-center justify-between px-4 mb-5">
        <button
          onClick={() => setMonthIdx((i) => Math.max(0, i - 1))}
          className="flex items-center justify-center rounded-full"
          style={{
            width: 32,
            height: 32,
            background: t.surface,
            border: `1px solid ${t.border}`,
          }}
        >
          <ChevronLeft size={15} color={t.text2} />
        </button>

        <div className="text-center">
          <div
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 18,
              fontWeight: 500,
              color: t.text,
              letterSpacing: '-0.01em',
            }}
          >
            {MONTHS[monthIdx % 12]} 2026
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: t.text3,
              marginTop: 1,
            }}
          >
            {formatARS(totalSpent, false)} / {formatARS(totalBudget, false)}
          </div>
        </div>

        <button
          onClick={() => setMonthIdx((i) => Math.min(11, i + 1))}
          className="flex items-center justify-center rounded-full"
          style={{
            width: 32,
            height: 32,
            background: t.surface,
            border: `1px solid ${t.border}`,
          }}
        >
          <ChevronRight size={15} color={t.text2} />
        </button>
      </div>

      {/* ── Content ── */}
      <div className="px-4">
        {activeTab === 'budgets' ? (
          <>
            {MOCK_BUDGETS.map((budget) => (
              <BudgetCard
                key={budget.id}
                budget={budget}
                onPress={() => openModal('budgetForm')}
              />
            ))}

            {/* Dashed "add category" card */}
            <button
              onClick={() => openModal('budgetForm')}
              className="w-full"
            >
              <Card
                pad={16}
                style={{
                  borderStyle: 'dashed',
                  background: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  marginBottom: 10,
                }}
              >
                <Plus size={16} color={t.text3} />
                <span
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 13,
                    color: t.text3,
                    fontWeight: 500,
                  }}
                >
                  Agregar categoría
                </span>
              </Card>
            </button>
          </>
        ) : (
          <>
            {MOCK_GOALS.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onContribute={() => openModal('goalForm')}
                onEdit={() => openModal('goalForm')}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
