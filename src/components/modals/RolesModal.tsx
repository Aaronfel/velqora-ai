import { useTheme } from '@/hooks/useTheme';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import Sheet from '@/components/ui/Sheet';
import { useModalStore } from '@/stores/modalStore';
import { useGroupStore } from '@/stores/groupStore';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import type { GroupMember } from '@/types';

const ROLE_COLORS: Record<string, string> = {
  owner: '#9FCEA0',
  member: '#7FA5C4',
  viewer: '#C9B27E',
};

export default function RolesModal() {
  const t = useTheme();
  const isDesktop = useIsDesktop();
  const closeModal = useModalStore((s) => s.closeModal);
  const showToast = useModalStore((s) => s.showToast);
  const { members, fetchMembers } = useGroupStore();
  const currentUser = useAuthStore((s) => s.user);

  const currentMember = members.find((m) => m.user_id === currentUser?.id);
  const isOwner = currentMember?.role === 'owner';

  const handleRoleChange = async (member: GroupMember, newRole: 'member' | 'viewer') => {
    try {
      await supabase
        .from('group_members')
        .update({ role: newRole })
        .eq('user_id', member.user_id)
        .eq('group_id', member.group_id);
      await fetchMembers();
      showToast('Role updated', 'good');
    } catch {
      showToast('Failed to update role', 'bad');
    }
  };

  return (
    <Sheet
      device={isDesktop ? 'desktop' : 'mobile'}
      title="Group Members"
      subtitle={`${members.length} member${members.length !== 1 ? 's' : ''}`}
      onClose={closeModal}
    >
      <div className="flex flex-col gap-2">
        {members.map((m) => (
          <div
            key={m.user_id}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5"
            style={{ background: t.surface2, border: `0.5px solid ${t.border}` }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-medium"
              style={{ background: t.surface3, color: t.text2, fontSize: 14 }}
            >
              {m.user?.name?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p style={{ fontSize: 14, color: t.text, fontWeight: 500 }}>{m.user?.name ?? 'Unknown'}</p>
              <p style={{ fontSize: 12, color: t.text3 }}>{m.user?.email}</p>
            </div>
            {isOwner && m.role !== 'owner' ? (
              <select
                value={m.role}
                onChange={(e) => handleRoleChange(m, e.target.value as 'member' | 'viewer')}
                className="outline-none rounded-lg px-2 py-1"
                style={{
                  background: t.surface3,
                  color: t.text2,
                  border: `0.5px solid ${t.border}`,
                  fontSize: 12,
                }}
              >
                <option value="member">Member</option>
                <option value="viewer">Viewer</option>
              </select>
            ) : (
              <span
                className="rounded-lg px-2 py-0.5"
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: ROLE_COLORS[m.role] ?? t.text3,
                  background: (ROLE_COLORS[m.role] ?? t.text3) + '22',
                  textTransform: 'capitalize',
                }}
              >
                {m.role}
              </span>
            )}
          </div>
        ))}
        {members.length === 0 && (
          <p style={{ fontSize: 13, color: t.text3, textAlign: 'center', padding: '16px 0' }}>
            No members yet
          </p>
        )}
      </div>
    </Sheet>
  );
}
