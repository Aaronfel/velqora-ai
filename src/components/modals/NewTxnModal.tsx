import { useState, useEffect } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import Sheet from '@/components/ui/Sheet';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import CatIcon from '@/components/ui/CatIcon';
import Toggle from '@/components/ui/Toggle';
import { useModalStore } from '@/stores/modalStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { useGroupStore } from '@/stores/groupStore';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import type { Category } from '@/types';
import { CURRENCIES } from '@/lib/constants';
import { fetchBlueRate, usdToArs } from '@/lib/exchangeRate';
import { Plus, Check } from 'lucide-react';

export default function NewTxnModal() {
  const t = useTheme();
  const isDesktop = useIsDesktop();
  const closeModal = useModalStore((s) => s.closeModal);
  const showToast = useModalStore((s) => s.showToast);
  const payload = useModalStore((s) => s.payload);
  const addTransaction = useTransactionStore((s) => s.addTransaction);
  const activeGroup = useGroupStore((s) => s.activeGroup);
  const currentUser = useAuthStore((s) => s.user);

  const prefill = payload?.prefill as {
    amount?: number;
    currency?: 'ARS' | 'USD';
    description?: string;
    date?: string;
  } | undefined;

  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState(prefill?.amount ? String(prefill.amount / 100) : '');
  const [description, setDescription] = useState(prefill?.description ?? '');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(prefill?.date ?? new Date().toISOString().slice(0, 10));
  const [currency, setCurrency] = useState<'ARS' | 'USD'>(prefill?.currency ?? 'ARS');
  const [isShared, setIsShared] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    if (!activeGroup) return;
    supabase
      .from('categories')
      .select('*')
      .eq('group_id', activeGroup.id)
      .eq('type', type)
      .order('sort_order')
      .then(({ data }) => {
        setCategories(data ?? []);
        setCategoryId('');
      });
  }, [activeGroup, type]);

  const handleSubmit = async () => {
    if (!activeGroup) { showToast('No active group', 'bad'); return; }
    if (!currentUser) { showToast('Not authenticated', 'bad'); return; }
    if (!categoryId) { showToast('Select a category', 'bad'); return; }
    const amountCents = Math.round(parseFloat(amount) * 100);
    if (isNaN(amountCents) || amountCents <= 0) { showToast('Enter a valid amount', 'bad'); return; }

    try {
      let amountArs: number | null = null;
      let exchangeRate: number | null = null;

      if (currency === 'USD') {
        try {
          exchangeRate = await fetchBlueRate();
          amountArs = usdToArs(amountCents, exchangeRate);
        } catch {
          showToast('No se pudo obtener la cotización del dólar', 'bad');
          return;
        }
      }

      await addTransaction({
        group_id: activeGroup.id,
        user_id: currentUser.id,
        category_id: categoryId,
        amount: amountCents,
        currency,
        amount_ars: amountArs,
        exchange_rate: exchangeRate,
        type,
        description: description.trim(),
        date,
        receipt_url: null,
        is_shared: isShared,
        ai_extracted: false,
      });
      showToast('Transaction added', 'good');
      closeModal();
    } catch {
      showToast('Failed to add transaction', 'bad');
    }
  };

  return (
    <Sheet
      device={isDesktop ? 'desktop' : 'mobile'}
      title="New Transaction"
      onClose={closeModal}
      footer={
        <Button onClick={handleSubmit} fullWidth icon={Plus} disabled={!categoryId || !amount}>
          Add Transaction
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Type toggle */}
        <div className="flex rounded-xl p-1" style={{ background: t.surface2, border: `0.5px solid ${t.border}` }}>
          {(['expense', 'income'] as const).map((tp) => (
            <button
              key={tp}
              onClick={() => setType(tp)}
              className="flex-1 rounded-lg py-2 capitalize font-medium transition-all"
              style={{
                background: type === tp ? (tp === 'income' ? t.income : t.expense) + '33' : 'transparent',
                color: type === tp ? (tp === 'income' ? t.income : t.expense) : t.text3,
                border: `0.5px solid ${type === tp ? (tp === 'income' ? t.income : t.expense) : 'transparent'}`,
                fontSize: 13,
              }}
            >
              {tp}
            </button>
          ))}
        </div>

        {/* Amount + Currency */}
        <div className="flex gap-3">
          <div className="flex-1 flex flex-col gap-1.5">
            <label style={{ fontSize: 12, color: t.text3 }}>Amount</label>
            <Input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              type="number"
              prefix={currency === 'ARS' ? '$' : 'US$'}
            />
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

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label style={{ fontSize: 12, color: t.text3 }}>Description</label>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What was this for?" />
        </div>

        {/* Category */}
        <div className="flex flex-col gap-1.5">
          <label style={{ fontSize: 12, color: t.text3 }}>Category</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategoryId(c.id)}
                className="flex items-center gap-1.5 rounded-xl px-2 py-1.5"
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

        {/* Date */}
        <div className="flex flex-col gap-1.5">
          <label style={{ fontSize: 12, color: t.text3 }}>Date</label>
          <Input value={date} onChange={(e) => setDate(e.target.value)} type="date" />
        </div>

        {/* Shared toggle */}
        <div className="flex items-center justify-between py-1">
          <div>
            <p style={{ fontSize: 14, color: t.text }}>Shared expense</p>
            <p style={{ fontSize: 12, color: t.text3 }}>Visible to all group members</p>
          </div>
          <Toggle checked={isShared} onChange={setIsShared} />
        </div>
      </div>
    </Sheet>
  );
}
