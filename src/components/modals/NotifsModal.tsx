import { useTheme } from '@/hooks/useTheme';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import Sheet from '@/components/ui/Sheet';
import { useModalStore } from '@/stores/modalStore';
import { Bell } from 'lucide-react';

export default function NotifsModal() {
  const t = useTheme();
  const isDesktop = useIsDesktop();
  const closeModal = useModalStore((s) => s.closeModal);

  return (
    <Sheet
      device={isDesktop ? 'desktop' : 'mobile'}
      title="Notifications"
      onClose={closeModal}
    >
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: t.surface2 }}>
          <Bell size={22} color={t.text3} />
        </div>
        <p style={{ fontSize: 14, color: t.text3, textAlign: 'center' }}>No notifications yet</p>
        <p style={{ fontSize: 12, color: t.text4, textAlign: 'center' }}>
          Budget alerts and AI tips will appear here.
        </p>
      </div>
    </Sheet>
  );
}
