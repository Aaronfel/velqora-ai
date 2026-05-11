import { useState } from 'react';
import { Plus, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useModalStore } from '@/stores/modalStore';
import Card from '@/components/ui/Card';
import Eyebrow from '@/components/ui/Eyebrow';
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

// ─── BudgetCard (large) ─────────────────────────────────────────────────────
interface BudgetCardLargeProps {
  budget: typeof MOCK_BUDGETS[0];
  onPress: () => void;
}

function BudgetCardLarge({ budget, onPress }: BudgetCardLargeProps) {
  const t = useTheme();
  const pct = Math.round((budget.spent / budget.total) * 100);
  const over = budget.spent > budget.total;
  const available = budget.total - budget.spent;

  return (
    <button
      onClick={onPress}
      className="w-full text-left transition-transform hover:translate-y-[-1px]"
    >
      <Card pad={18}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <CatIcon icon={budget.category.icon} color={budget.category.color} size={40} />
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 14.5,
                  fontWeight: 600,
                  color: t.text,
                }}
              >
                {budget.category.name}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 11.5,
                  color: over ? t.bad : t.text3,
                  marginTop: 1,
                }}
              >
                {over ? 'Excedido' : `${100 - pct}% disponible`}
              </div>
            </div>
          </div>
          <MoreHorizontal size={16} color={t.text3} />
        </div>

        <div className="flex items-baseline gap-1 mb-2">
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 18,
              fontWeight: 600,
              color: over ? t.bad : t.text,
            }}
          >
            {formatARS(budget.spent, false)}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              color: t.text3,
            }}
          >
            / {formatARS(budget.total, false)}
          </span>
        </div>

        <ProgressBar value={budget.spent} max={budget.total} color={budget.category.color} height={6} />

        {!over && (
          <div
            className="mt-2"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11.5,
              color: t.income,
            }}
          >
            {formatARS(available, false)} disponible
          </div>
        )}
      </Card>
    </button>
  );
}

// ─── GoalCard (large) ───────────────────────────────────────────────────────
interface GoalCardLargeProps {
  goal: typeof MOCK_GOALS[0];
  onContribute: () => void;
  onEdit: () => void;
}

function GoalCardLarge({ goal, onContribute, onEdit }: GoalCardLargeProps) {
  const t = useTheme();
  const pct = Math.round((goal.current / goal.target) * 100);
  const remaining = goal.target - goal.current;

  return (
    <Card pad={18}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
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
          <div>
            <div
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 14.5,
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
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          className="flex items-center justify-center rounded-full"
          style={{
            width: 30,
            height: 30,
            background: t.surface2,
            border: `1px solid ${t.border}`,
          }}
        >
          <MoreHorizontal size={14} color={t.text3} />
        </button>
      </div>

      <div className="flex items-baseline gap-1 mb-2">
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 18,
            fontWeight: 600,
            color: t.text,
          }}
        >
          {formatARS(goal.current, false)}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            color: t.text3,
          }}
        >
          / {formatARS(goal.target, false)}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 11.5,
            color: t.text3,
            marginLeft: 4,
          }}
        >
          {pct}%
        </span>
      </div>

      <ProgressBar value={goal.current} max={goal.target} color={goal.color} height={6} />

      <div className="flex items-center justify-between mt-3">
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 12,
            color: t.text3,
          }}
        >
          Faltan {formatARS(remaining, false)}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); onContribute(); }}
          className="flex items-center rounded-lg"
          style={{
            padding: '6px 12px',
            background: t.accent,
            fontFamily: 'var(--font-sans)',
            fontSize: 12,
            fontWeight: 600,
            color: t.accentText,
          }}
        >
          + Aportar
        </button>
      </div>
    </Card>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function BudgetsDesktop() {
  const t = useTheme();
  const openModal = useModalStore((s) => s.openModal);
  const [monthIdx, setMonthIdx] = useState(0);

  const totalBudget = MOCK_BUDGETS.reduce((s, b) => s + b.total, 0);
  const totalSpent = MOCK_BUDGETS.reduce((s, b) => s + b.spent, 0);
  const totalAvailable = totalBudget - totalSpent;
  const exceededCount = MOCK_BUDGETS.filter((b) => b.spent > b.total).length;

  return (
    <div
      className="min-h-screen"
      style={{ background: t.bg, padding: '32px 32px 48px' }}
    >
      <div className="grid grid-cols-12 gap-6">

        {/* ── Header row ── */}
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
              Presupuestos &amp; Metas
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-3">
            {/* Month nav */}
            <div
              className="flex items-center gap-2 rounded-xl"
              style={{
                padding: '8px 14px',
                background: t.surface,
                border: `1px solid ${t.border}`,
              }}
            >
              <button onClick={() => setMonthIdx((i) => Math.max(0, i - 1))}>
                <ChevronLeft size={15} color={t.text2} />
              </button>
              <span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 15,
                  fontWeight: 500,
                  color: t.text,
                  minWidth: 110,
                  textAlign: 'center',
                }}
              >
                {MONTHS[monthIdx % 12]} 2026
              </span>
              <button onClick={() => setMonthIdx((i) => Math.min(11, i + 1))}>
                <ChevronRight size={15} color={t.text2} />
              </button>
            </div>

            {/* New budget button */}
            <button
              onClick={() => openModal('budgetForm')}
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
              Nuevo presupuesto
            </button>
          </div>
        </div>

        {/* ── Summary card (col-span-12) ── */}
        <div className="col-span-12">
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: `linear-gradient(90deg, ${t.surface2} 0%, ${t.surface} 100%)`,
              border: `1px solid ${t.border}`,
              padding: '20px 24px',
            }}
          >
            <div className="grid grid-cols-4 gap-6">
              {/* Total budget */}
              <div>
                <Eyebrow style={{ marginBottom: 6 }}>Presupuesto total</Eyebrow>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 24,
                    fontWeight: 600,
                    color: t.text,
                  }}
                >
                  {formatARS(totalBudget, false)}
                </div>
              </div>

              {/* Spent */}
              <div>
                <Eyebrow style={{ marginBottom: 6 }}>Gastado</Eyebrow>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 24,
                    fontWeight: 600,
                    color: t.expense,
                    marginBottom: 8,
                  }}
                >
                  {formatARS(totalSpent, false)}
                </div>
                <ProgressBar value={totalSpent} max={totalBudget} height={5} />
                <div
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 11,
                    color: t.text3,
                    marginTop: 4,
                  }}
                >
                  {Math.round((totalSpent / totalBudget) * 100)}% del total
                </div>
              </div>

              {/* Available */}
              <div>
                <Eyebrow style={{ marginBottom: 6 }}>Disponible</Eyebrow>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 24,
                    fontWeight: 600,
                    color: totalAvailable >= 0 ? t.income : t.bad,
                  }}
                >
                  {formatARS(Math.abs(totalAvailable), false)}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 11,
                    color: totalAvailable >= 0 ? t.income : t.bad,
                    marginTop: 4,
                  }}
                >
                  {totalAvailable >= 0 ? 'restante' : 'excedido'}
                </div>
              </div>

              {/* Categories exceeded */}
              <div>
                <Eyebrow style={{ marginBottom: 6 }}>Categorías excedidas</Eyebrow>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 24,
                    fontWeight: 600,
                    color: exceededCount > 0 ? t.bad : t.income,
                  }}
                >
                  {exceededCount}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 11,
                    color: t.text3,
                    marginTop: 4,
                  }}
                >
                  de {MOCK_BUDGETS.length} categorías
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Budget section heading ── */}
        <div className="col-span-12 flex items-center justify-between -mb-3">
          <div
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 20,
              fontWeight: 500,
              color: t.text,
              letterSpacing: '-0.01em',
            }}
          >
            Presupuestos por categoría
          </div>
        </div>

        {/* ── Budget cards grid (col-span-4 each) ── */}
        {MOCK_BUDGETS.map((budget) => (
          <div key={budget.id} className="col-span-4">
            <BudgetCardLarge
              budget={budget}
              onPress={() => openModal('budgetForm')}
            />
          </div>
        ))}

        {/* ── Dashed add card ── */}
        <div className="col-span-4">
          <button
            onClick={() => openModal('budgetForm')}
            className="w-full h-full"
          >
            <Card
              pad={18}
              style={{
                borderStyle: 'dashed',
                background: 'transparent',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                minHeight: 120,
              }}
            >
              <Plus size={20} color={t.text3} />
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
        </div>

        {/* ── Goals section heading ── */}
        <div className="col-span-12 flex items-center justify-between -mb-3">
          <div
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 20,
              fontWeight: 500,
              color: t.text,
              letterSpacing: '-0.01em',
            }}
          >
            Metas de ahorro
          </div>
          <button
            onClick={() => openModal('goalForm')}
            className="flex items-center gap-1.5 rounded-xl"
            style={{
              height: 36,
              padding: '0 14px',
              background: t.surface,
              border: `1px solid ${t.border}`,
              fontFamily: 'var(--font-sans)',
              fontSize: 12.5,
              color: t.text2,
              fontWeight: 500,
            }}
          >
            <Plus size={13} color={t.text2} />
            Nueva meta
          </button>
        </div>

        {/* ── Goal cards grid (col-span-4 each) ── */}
        {MOCK_GOALS.map((goal) => (
          <div key={goal.id} className="col-span-4">
            <GoalCardLarge
              goal={goal}
              onContribute={() => openModal('goalForm')}
              onEdit={() => openModal('goalForm')}
            />
          </div>
        ))}

      </div>
    </div>
  );
}
