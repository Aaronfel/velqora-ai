import { useState, useEffect } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import Sheet from '@/components/ui/Sheet';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import CatIcon from '@/components/ui/CatIcon';
import { useModalStore } from '@/stores/modalStore';
import { useGroupStore } from '@/stores/groupStore';
import { supabase } from '@/lib/supabase';
import type { Category } from '@/types';
import { Plus, Trash2 } from 'lucide-react';

const PRESET_COLORS = ['#9FCEA0', '#7FA5C4', '#E8A37C', '#B89FCE', '#E89FC4', '#C9B27E', '#D97A6C', '#7FC4B4'];
const PRESET_ICONS = ['ShoppingCart', 'Utensils', 'Car', 'Home', 'Tv', 'Film', 'Heart', 'Briefcase', 'Star', 'Gift', 'Zap', 'Plane'];

export default function CategoriesModal() {
  const t = useTheme();
  const isDesktop = useIsDesktop();
  const closeModal = useModalStore((s) => s.closeModal);
  const showToast = useModalStore((s) => s.showToast);
  const activeGroup = useGroupStore((s) => s.activeGroup);

  const [categories, setCategories] = useState<Category[]>([]);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('ShoppingCart');
  const [newColor, setNewColor] = useState('#9FCEA0');
  const [newType, setNewType] = useState<'income' | 'expense'>('expense');

  const fetchCategories = async () => {
    if (!activeGroup) return;
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('group_id', activeGroup.id)
      .order('sort_order');
    setCategories(data ?? []);
  };

  useEffect(() => { fetchCategories(); }, [activeGroup]);

  const handleAdd = async () => {
    if (!activeGroup) return;
    if (!newName.trim()) { showToast('Enter a category name', 'bad'); return; }
    try {
      const { error } = await supabase.from('categories').insert({
        group_id: activeGroup.id,
        name: newName.trim(),
        icon: newIcon,
        color: newColor,
        type: newType,
        is_shared: true,
        sort_order: categories.length,
      });
      if (error) throw error;
      showToast('Category added', 'good');
      setNewName('');
      setAdding(false);
      fetchCategories();
    } catch {
      showToast('Failed to add category', 'bad');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      showToast('Category deleted', 'good');
      fetchCategories();
    } catch {
      showToast('Failed to delete category', 'bad');
    }
  };

  return (
    <Sheet
      device={isDesktop ? 'desktop' : 'mobile'}
      title="Categories"
      subtitle={`${categories.length} categories`}
      onClose={closeModal}
    >
      <div className="flex flex-col gap-2">
        {categories.map((c) => (
          <div
            key={c.id}
            className="flex items-center gap-3 rounded-xl px-3 py-2"
            style={{ background: t.surface2, border: `0.5px solid ${t.border}` }}
          >
            <CatIcon icon={c.icon} color={c.color} size={32} />
            <div className="flex-1 min-w-0">
              <p style={{ fontSize: 14, color: t.text, fontWeight: 500 }}>{c.name}</p>
              <p style={{ fontSize: 11, color: t.text4, textTransform: 'capitalize' }}>{c.type}</p>
            </div>
            <button
              onClick={() => handleDelete(c.id)}
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: t.bad + '18' }}
            >
              <Trash2 size={13} color={t.bad} />
            </button>
          </div>
        ))}

        {adding ? (
          <div className="flex flex-col gap-3 rounded-xl p-3 mt-1" style={{ background: t.surface2, border: `0.5px solid ${t.border}` }}>
            <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Category name" />
            <div className="flex gap-2">
              {(['expense', 'income'] as const).map((tp) => (
                <button
                  key={tp}
                  onClick={() => setNewType(tp)}
                  className="flex-1 rounded-lg py-2 text-xs font-medium capitalize"
                  style={{
                    background: newType === tp ? t.accent : t.surface3,
                    color: newType === tp ? t.accentText : t.text2,
                    border: `0.5px solid ${newType === tp ? t.accent : t.border}`,
                  }}
                >
                  {tp}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_ICONS.map((ic) => (
                <button
                  key={ic}
                  onClick={() => setNewIcon(ic)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    background: newIcon === ic ? newColor + '33' : t.surface3,
                    border: `0.5px solid ${newIcon === ic ? newColor : t.border}`,
                  }}
                >
                  <CatIcon icon={ic} color={newColor} size={24} />
                </button>
              ))}
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {PRESET_COLORS.map((cl) => (
                <button
                  key={cl}
                  onClick={() => setNewColor(cl)}
                  className="w-7 h-7 rounded-full"
                  style={{ background: cl, border: `2px solid ${newColor === cl ? t.text : 'transparent'}` }}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setAdding(false)} fullWidth>Cancel</Button>
              <Button onClick={handleAdd} fullWidth disabled={!newName.trim()}>Add</Button>
            </div>
          </div>
        ) : (
          <Button variant="secondary" onClick={() => setAdding(true)} fullWidth icon={Plus}>
            Add Category
          </Button>
        )}
      </div>
    </Sheet>
  );
}
