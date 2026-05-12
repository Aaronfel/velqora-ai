import { useState, useEffect } from 'react';
import { Plus, ChevronLeft, ChevronRight, MoreHorizontal, Target, PiggyBank } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useModalStore } from '@/stores/modalStore';
import { useBudgetStore } from '@/stores/budgetStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { useGroupStore } from '@/stores/groupStore';
import Card from '@/components/ui/Card';
import CatIcon from '@/components/ui/CatIcon';
import ProgressBar from '@/components/ui/ProgressBar';
import EmptyState from '@/components/ui/EmptyState';
import { formatARS } from '@/lib/constants';
import { budgetSpentMap } from '@/lib/aggregations';
import type { Budget, SavingsGoal } from '@/types';

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

// ─── BudgetCard ─────────────────────────────────────────────────────────────
interface BudgetCardProps {
  budget: Budget;
  spent: number;
  onPress: () => void;
}

function BudgetCard({ budget, spent, onPress }: BudgetCardProps) {
  const t = useTheme();
  const pct = Math.round((spent / budget.amount) * 100);
  const over = spent > budget.amount;

  return (
    <button
      onClick={onPress}
      className="w-full text-left transition-transform hover:translate-y-[-1px]"
    >
      <Card pad={14} style={{ marginBottom: 10 }}>
        <div className="flex items-center gap-3">
          <CatIcon icon={budget.category?.icon ?? 'Circle'} color={budget.category?.color ?? '#999'} size={40} />
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
                {budget.category?.name ?? 'Sin categoría'}
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
                {formatARS(spent, false)}
                <span style={{ color: t.text3 }}>/{formatARS(budget.amount, false)}</span>
              </span>
            </div>
            <ProgressBar value={spent} max={budget.amount} color={budget.category?.color ?? '#999'} height={5} />
          </div>
        </div>
      </Card>
    </button>
  );
}

// ─── GoalCard ───────────────────────────────────────────────────────────────
interface GoalCardProps {
  goal: SavingsGoal;
  onContribute: () => void;
  onEdit: () => void;
}

function GoalCard({ goal, onContribute, onEdit }: GoalCardProps) {
  const t = useTheme();
  const pct = Math.round((goal.current_amount / goal.target_amount) * 100);
  const remaining = goal.target_amount - goal.current_amount;

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
              {formatARS(goal.current_amount, false)}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11.5,
                color: t.text3,
              }}
            >
              / {formatARS(goal.target_amount, false)}
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

          <ProgressBar value={goal.current_amount} max={goal.target_amount} color={goal.color} height={5} />

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
  const [monthIdx, setMonthIdx] = useState(0); // 0 = current month

  const activeGroup = useGroupStore((s) => s.activeGroup);
  const { budgets, goals, fetchBudgets, fetchGoals } = useBudgetStore();
  const { transactions, fetchTransactions } = useTransactionStore();

  const now = new Date();
  const selectedMonth = new Date(now.getFullYear(), now.getMonth() - monthIdx, 1);
  const monthKey = `${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2, '0')}`;
  const monthLabel = MONTHS[selectedMonth.getMonth()];
  const monthYear = selectedMonth.getFullYear();

  useEffect(() => {
    if (activeGroup) {
      fetchBudgets(activeGroup.id, monthKey);
      fetchGoals(activeGroup.id);
      fetchTransactions(activeGroup.id);
    }
  }, [activeGroup, fetchBudgets, fetchGoals, fetchTransactions, monthKey]);

  const spentMap = budgetSpentMap(transactions, monthKey);

  const totalSpent = budgets.reduce((s, b) => s + (spentMap.get(b.category_id) ?? 0), 0);
  const totalBudget = budgets.reduce((s, b) => s + b.amount, 0);

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
          onClick={() => setMonthIdx((i) => i + 1)}
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
            {monthLabel} {monthYear}
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
          onClick={() => setMonthIdx((i) => Math.max(0, i - 1))}
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
            {budgets.length === 0 ? (
              <EmptyState icon={Target} title="Sin presupuestos" subtitle="Creá presupuestos por categoría para controlar tus gastos." action={{ label: 'Crear presupuesto', onClick: () => openModal('budgetForm') }} />
            ) : (
              <>
                {budgets.map((budget) => (
                  <BudgetCard
                    key={budget.id}
                    budget={budget}
                    spent={spentMap.get(budget.category_id) ?? 0}
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
            )}
          </>
        ) : (
          <>
            {goals.length === 0 ? (
              <EmptyState icon={PiggyBank} title="Sin metas de ahorro" subtitle="Creá una meta y seguí tu progreso." action={{ label: 'Crear meta', onClick: () => openModal('goalForm') }} />
            ) : (
              goals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onContribute={() => openModal('goalForm')}
                  onEdit={() => openModal('goalForm')}
                />
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}
