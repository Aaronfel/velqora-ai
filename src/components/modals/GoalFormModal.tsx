import { useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import Sheet from '@/components/ui/Sheet';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useModalStore } from '@/stores/modalStore';
import { useBudgetStore } from '@/stores/budgetStore';
import { useGroupStore } from '@/stores/groupStore';
import type { SavingsGoal } from '@/types';
import { CURRENCIES } from '@/lib/constants';
import { Target } from 'lucide-react';

const ICONS = ['Target', 'Home', 'Car', 'Plane', 'Briefcase', 'Heart', 'Star', 'Gift'];
const COLORS = ['#9FCEA0', '#7FA5C4', '#E8A37C', '#B89FCE', '#E89FC4', '#C9B27E', '#D97A6C', '#7FC4B4'];

export default function GoalFormModal() {
  const t = useTheme();
  const isDesktop = useIsDesktop();
  const closeModal = useModalStore((s) => s.closeModal);
  const showToast = useModalStore((s) => s.showToast);
  const payload = useModalStore((s) => s.payload);
  const { createGoal, updateGoal } = useBudgetStore();
  const activeGroup = useGroupStore((s) => s.activeGroup);

  const existingGoal = payload?.goal as SavingsGoal | undefined;

  const [name, setName] = useState(existingGoal?.name ?? '');
  const [target, setTarget] = useState(existingGoal ? String(existingGoal.target_amount / 100) : '');
  const [currency, setCurrency] = useState<'ARS' | 'USD'>(existingGoal?.currency ?? 'ARS');
  const [deadline, setDeadline] = useState(existingGoal?.deadline ?? '');
  const [icon, setIcon] = useState(existingGoal?.icon ?? 'Target');
  const [color, setColor] = useState(existingGoal?.color ?? '#9FCEA0');

  const handleSave = async () => {
    if (!activeGroup && !existingGoal) { showToast('No active group', 'bad'); return; }
    if (!name.trim()) { showToast('Enter a goal name', 'bad'); return; }
    const targetCents = Math.round(parseFloat(target) * 100);
    if (isNaN(targetCents) || targetCents <= 0) { showToast('Enter a valid amount', 'bad'); return; }

    try {
      if (existingGoal) {
        await updateGoal(existingGoal.id, { name: name.trim(), target_amount: targetCents, currency, deadline, icon, color });
        showToast('Goal updated', 'good');
      } else {
        await createGoal({
          group_id: activeGroup!.id,
          name: name.trim(),
          target_amount: targetCents,
          current_amount: 0,
          currency,
          deadline,
          icon,
          color,
        });
        showToast('Goal created!', 'good');
      }
      closeModal();
    } catch {
      showToast('Failed to save goal', 'bad');
    }
  };

  return (
    <Sheet
      device={isDesktop ? 'desktop' : 'mobile'}
      title={existingGoal ? 'Edit Goal' : 'New Goal'}
      onClose={closeModal}
      footer={
        <Button onClick={handleSave} fullWidth icon={Target} disabled={!name.trim() || !target}>
          {existingGoal ? 'Save Changes' : 'Create Goal'}
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label style={{ fontSize: 12, color: t.text3 }}>Goal name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Emergency fund" />
        </div>

        <div className="flex gap-3">
          <div className="flex-1 flex flex-col gap-1.5">
            <label style={{ fontSize: 12, color: t.text3 }}>Target amount</label>
            <Input value={target} onChange={(e) => setTarget(e.target.value)} placeholder="0" type="number" prefix={currency === 'ARS' ? '$' : 'US$'} />
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
          <label style={{ fontSize: 12, color: t.text3 }}>Deadline</label>
          <Input value={deadline} onChange={(e) => setDeadline(e.target.value)} type="date" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label style={{ fontSize: 12, color: t.text3 }}>Icon</label>
          <div className="flex flex-wrap gap-2">
            {ICONS.map((ic) => (
              <button
                key={ic}
                onClick={() => setIcon(ic)}
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: icon === ic ? color + '33' : t.surface2,
                  border: `0.5px solid ${icon === ic ? color : t.border}`,
                  fontSize: 18,
                }}
              >
                {ic === 'Target' && '🎯'}
                {ic === 'Home' && '🏠'}
                {ic === 'Car' && '🚗'}
                {ic === 'Plane' && '✈️'}
                {ic === 'Briefcase' && '💼'}
                {ic === 'Heart' && '❤️'}
                {ic === 'Star' && '⭐'}
                {ic === 'Gift' && '🎁'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label style={{ fontSize: 12, color: t.text3 }}>Color</label>
          <div className="flex gap-2 flex-wrap">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className="w-8 h-8 rounded-full transition-transform"
                style={{
                  background: c,
                  border: `2px solid ${color === c ? t.text : 'transparent'}`,
                  transform: color === c ? 'scale(1.15)' : 'scale(1)',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </Sheet>
  );
}
