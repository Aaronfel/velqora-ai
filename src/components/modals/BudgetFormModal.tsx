import { useState, useEffect } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import Sheet from '@/components/ui/Sheet';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import CatIcon from '@/components/ui/CatIcon';
import { useModalStore } from '@/stores/modalStore';
import { useBudgetStore } from '@/stores/budgetStore';
import { useGroupStore } from '@/stores/groupStore';
import { supabase } from '@/lib/supabase';
import type { Category } from '@/types';
import { CURRENCIES } from '@/lib/constants';
import { Check } from 'lucide-react';

const PERIODS = ['monthly', 'weekly'] as const;

export default function BudgetFormModal() {
  const t = useTheme();
  const isDesktop = useIsDesktop();
  const closeModal = useModalStore((s) => s.closeModal);
  const showToast = useModalStore((s) => s.showToast);
  const upsertBudget = useBudgetStore((s) => s.upsertBudget);
  const activeGroup = useGroupStore((s) => s.activeGroup);

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<'ARS' | 'USD'>('ARS');
  const [period, setPeriod] = useState<'monthly' | 'weekly'>('monthly');

  useEffect(() => {
    if (!activeGroup) return;
    supabase
      .from('categories')
      .select('*')
      .eq('group_id', activeGroup.id)
      .eq('type', 'expense')
      .order('sort_order')
      .then(({ data }) => setCategories(data ?? []));
  }, [activeGroup]);

  const handleSave = async () => {
    if (!activeGroup) { showToast('No active group', 'bad'); return; }
    if (!categoryId) { showToast('Select a category', 'bad'); return; }
    const amountCents = Math.round(parseFloat(amount) * 100);
    if (isNaN(amountCents) || amountCents <= 0) { showToast('Enter a valid amount', 'bad'); return; }

    const month = new Date().toISOString().slice(0, 7);
    try {
      await upsertBudget({ group_id: activeGroup.id, category_id: categoryId, amount: amountCents, currency, period, month });
      showToast('Budget saved', 'good');
      closeModal();
    } catch {
      showToast('Failed to save budget', 'bad');
    }
  };

  return (
    <Sheet
      device={isDesktop ? 'desktop' : 'mobile'}
      title="Set Budget"
      onClose={closeModal}
      footer={
        <Button onClick={handleSave} fullWidth disabled={!categoryId || !amount}>
          Save Budget
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label style={{ fontSize: 12, color: t.text3 }}>Category</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategoryId(c.id)}
                className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5"
                style={{
                  background: categoryId === c.id ? c.color + '33' : t.surface2,
                  border: `0.5px solid ${categoryId === c.id ? c.color : t.border}`,
                }}
              >
                <CatIcon icon={c.icon} color={c.color} size={22} />
                <span style={{ fontSize: 12, color: t.text2 }}>{c.name}</span>
                {categoryId === c.id && <Check size={11} color={c.color} />}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-1 flex flex-col gap-1.5">
            <label style={{ fontSize: 12, color: t.text3 }}>Amount</label>
            <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" type="number" prefix={currency === 'ARS' ? '$' : 'US$'} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label style={{ fontSize: 12, color: t.text3 }}>Currency</label>
            <div className="flex gap-1">
              {CURRENCIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className="rounded-lg px-3 py-2 text-xs font-medium"
                  style={{
                    background: currency === c ? t.accent : t.surface2,
                    color: currency === c ? t.accentText : t.text2,
                    border: `0.5px solid ${currency === c ? t.accent : t.border}`,
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label style={{ fontSize: 12, color: t.text3 }}>Period</label>
          <div className="flex gap-2">
            {PERIODS.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className="flex-1 rounded-xl py-2.5 capitalize"
                style={{
                  background: period === p ? t.accent : t.surface2,
                  color: period === p ? t.accentText : t.text2,
                  border: `0.5px solid ${period === p ? t.accent : t.border}`,
                  fontSize: 13, fontWeight: 500,
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Sheet>
  );
}
