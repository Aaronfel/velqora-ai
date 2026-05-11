import { useTheme } from '@/hooks/useTheme';

interface ChipProps {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}

export default function Chip({ children, active = false, onClick }: ChipProps) {
  const t = useTheme();
  return (
    <button onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full whitespace-nowrap transition-colors"
      style={{
        padding: '6px 12px', fontSize: 12, fontWeight: 500, letterSpacing: '0.01em',
        background: active ? t.accent : 'transparent',
        color: active ? t.accentText : t.text2,
        border: `1px solid ${active ? t.accent : t.border}`,
      }}>
      {children}
    </button>
  );
}
