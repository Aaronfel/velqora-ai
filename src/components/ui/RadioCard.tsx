import { useTheme } from '@/hooks/useTheme';
import type { LucideIcon } from 'lucide-react';

interface RadioCardProps {
  active: boolean;
  title: string;
  desc?: string;
  onClick: () => void;
  icon?: LucideIcon;
}

export default function RadioCard({ active, title, desc, onClick, icon: Icon }: RadioCardProps) {
  const t = useTheme();
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 transition-colors text-left"
      style={{
        padding: '14px', background: active ? t.surface2 : t.surface,
        border: `1px solid ${active ? t.accent : t.border}`, borderRadius: 14,
      }}>
      {Icon && <Icon size={16} color={active ? t.accent : t.text2} strokeWidth={1.6} />}
      <div className="flex-1">
        <div style={{ fontSize: 13.5, color: t.text, fontWeight: 500 }}>{title}</div>
        {desc && <div style={{ fontSize: 11.5, color: t.text3, marginTop: 2 }}>{desc}</div>}
      </div>
      <div className="rounded-full shrink-0 relative" style={{ width: 18, height: 18, border: `2px solid ${active ? t.accent : t.borderStrong}` }}>
        {active && <div className="absolute rounded-full" style={{ inset: 3, background: t.accent }} />}
      </div>
    </button>
  );
}
