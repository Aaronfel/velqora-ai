import { useTheme } from '@/hooks/useTheme';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import Sheet from '@/components/ui/Sheet';
import Button from '@/components/ui/Button';
import { useModalStore } from '@/stores/modalStore';
import { useAuthStore } from '@/stores/authStore';
import { LogOut } from 'lucide-react';

export default function SignOutModal() {
  const t = useTheme();
  const isDesktop = useIsDesktop();
  const closeModal = useModalStore((s) => s.closeModal);
  const signOut = useAuthStore((s) => s.signOut);

  const handleSignOut = async () => {
    await signOut();
    closeModal();
  };

  return (
    <Sheet
      device={isDesktop ? 'desktop' : 'mobile'}
      title="Sign out"
      subtitle="You'll need to sign in again to access your data."
      onClose={closeModal}
      maxWidth={380}
      footer={
        <div className="flex gap-3">
          <Button variant="secondary" onClick={closeModal} fullWidth>Cancel</Button>
          <Button onClick={handleSignOut} fullWidth danger icon={LogOut}>Sign out</Button>
        </div>
      }
    >
      <p style={{ fontSize: 14, color: t.text2, lineHeight: 1.5 }}>
        Are you sure you want to sign out of VelqoraAI?
      </p>
    </Sheet>
  );
}
