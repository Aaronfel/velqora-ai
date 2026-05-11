import { useTheme } from '@/hooks/useTheme';

interface AvatarProps {
  initials: string;
  size?: number;
  color?: string;
  ring?: boolean;
}

export default function Avatar({ initials, size = 32, color, ring = false }: AvatarProps) {
  const t = useTheme();
  const bgColor = color || t.accent;
  return (
    <div className="inline-flex items-center justify-center rounded-full shrink-0"
      style={{
        width: size, height: size,
        background: `linear-gradient(135deg, ${bgColor} 0%, ${t.accentDeep} 100%)`,
        color: t.accentText, fontSize: size * 0.36, fontWeight: 600, letterSpacing: '0.02em',
        boxShadow: ring ? `0 0 0 2px ${t.bg}, 0 0 0 3px ${t.borderStrong}` : 'none',
      }}>
      {initials}
    </div>
  );
}
