import { useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import Sheet from '@/components/ui/Sheet';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useModalStore } from '@/stores/modalStore';
import { useGroupStore } from '@/stores/groupStore';
import { UserPlus, Mail } from 'lucide-react';

export default function InviteModal() {
  const t = useTheme();
  const isDesktop = useIsDesktop();
  const closeModal = useModalStore((s) => s.closeModal);
  const showToast = useModalStore((s) => s.showToast);
  const inviteMember = useGroupStore((s) => s.inviteMember);

  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'member' | 'viewer'>('member');

  const handleInvite = async () => {
    if (!email.trim()) {
      showToast('Enter an email address', 'bad');
      return;
    }
    try {
      await inviteMember(email.trim(), role);
      showToast('Invitation sent!', 'good');
      closeModal();
    } catch {
      showToast('Failed to send invite', 'bad');
    }
  };

  return (
    <Sheet
      device={isDesktop ? 'desktop' : 'mobile'}
      title="Invite Member"
      subtitle="They'll receive an email to join your group"
      onClose={closeModal}
      maxWidth={420}
      footer={
        <Button onClick={handleInvite} fullWidth icon={UserPlus} disabled={!email.trim()}>
          Send Invite
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label style={{ fontSize: 12, color: t.text3 }}>Email address</label>
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="friend@example.com"
            type="email"
            prefix={<Mail size={13} />}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label style={{ fontSize: 12, color: t.text3 }}>Role</label>
          <div className="flex gap-2">
            {(['member', 'viewer'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className="flex-1 rounded-xl py-2.5 text-sm font-medium transition-all"
                style={{
                  background: role === r ? t.accent : t.surface2,
                  color: role === r ? t.accentText : t.text2,
                  border: `0.5px solid ${role === r ? t.accent : t.border}`,
                  fontSize: 13,
                }}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
          <p style={{ fontSize: 11, color: t.text4, marginTop: 2 }}>
            {role === 'member' ? 'Can add and edit transactions' : 'Can only view transactions'}
          </p>
        </div>
      </div>
    </Sheet>
  );
}
