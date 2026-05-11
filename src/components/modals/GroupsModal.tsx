import { useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import Sheet from '@/components/ui/Sheet';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useModalStore } from '@/stores/modalStore';
import { useGroupStore } from '@/stores/groupStore';
import type { Group } from '@/types';
import { Plus, Users } from 'lucide-react';

const GROUP_TYPES: Array<{ value: Group['type']; label: string }> = [
  { value: 'personal', label: 'Personal' },
  { value: 'family', label: 'Family' },
  { value: 'business', label: 'Business' },
];

export default function GroupsModal() {
  const t = useTheme();
  const isDesktop = useIsDesktop();
  const closeModal = useModalStore((s) => s.closeModal);
  const showToast = useModalStore((s) => s.showToast);
  const { groups, activeGroup, setActiveGroup, createGroup } = useGroupStore();

  const [name, setName] = useState('');
  const [type, setType] = useState<Group['type']>('family');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      showToast('Enter a group name', 'bad');
      return;
    }
    try {
      const group = await createGroup(name.trim(), type);
      showToast(`Group "${group.name}" created`, 'good');
      setName('');
      setCreating(false);
    } catch {
      showToast('Failed to create group', 'bad');
    }
  };

  return (
    <Sheet
      device={isDesktop ? 'desktop' : 'mobile'}
      title="Groups"
      subtitle="Switch between or create new groups"
      onClose={closeModal}
    >
      <div className="flex flex-col gap-3">
        <p style={{ fontSize: 11, color: t.text4, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
          Your groups
        </p>
        {groups.map((g) => (
          <button
            key={g.id}
            onClick={() => { setActiveGroup(g); closeModal(); }}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left w-full transition-opacity hover:opacity-75"
            style={{
              background: activeGroup?.id === g.id ? t.accent + '22' : t.surface2,
              border: `0.5px solid ${activeGroup?.id === g.id ? t.accent : t.border}`,
            }}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: t.surface3 }}>
              <Users size={14} color={t.text3} />
            </div>
            <div className="flex-1 min-w-0">
              <p style={{ fontSize: 14, color: activeGroup?.id === g.id ? t.accent : t.text, fontWeight: 500 }}>{g.name}</p>
              <p style={{ fontSize: 11, color: t.text4, textTransform: 'capitalize' }}>{g.type}</p>
            </div>
            {activeGroup?.id === g.id && (
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: t.accent }} />
            )}
          </button>
        ))}

        {creating ? (
          <div className="flex flex-col gap-3 rounded-xl p-3" style={{ background: t.surface2, border: `0.5px solid ${t.border}` }}>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Group name" />
            <div className="flex gap-2">
              {GROUP_TYPES.map((gt) => (
                <button
                  key={gt.value}
                  onClick={() => setType(gt.value)}
                  className="flex-1 rounded-lg py-2 text-xs font-medium"
                  style={{
                    background: type === gt.value ? t.accent : t.surface3,
                    color: type === gt.value ? t.accentText : t.text2,
                    border: `0.5px solid ${type === gt.value ? t.accent : t.border}`,
                  }}
                >
                  {gt.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setCreating(false)} fullWidth>Cancel</Button>
              <Button onClick={handleCreate} fullWidth disabled={!name.trim()}>Create</Button>
            </div>
          </div>
        ) : (
          <Button variant="secondary" onClick={() => setCreating(true)} fullWidth icon={Plus}>
            New Group
          </Button>
        )}
      </div>
    </Sheet>
  );
}
