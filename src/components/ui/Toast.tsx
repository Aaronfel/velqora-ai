import { useEffect } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { useModalStore } from '@/stores/modalStore';

export default function Toast() {
  const t = useTheme();
  const toast = useModalStore((s) => s.toast);
  const clearToast = useModalStore((s) => s.clearToast);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(clearToast, 2500);
    return () => clearTimeout(timer);
  }, [toast?.id, clearToast]);

  if (!toast) return null;

  const bg = toast.tone === 'good' ? t.income : toast.tone === 'bad' ? t.bad : t.accent;
  return (
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full"
      style={{ background: bg, color: t.accentText, fontSize: 13, fontWeight: 500 }}>
      {toast.msg}
    </div>
  );
}
