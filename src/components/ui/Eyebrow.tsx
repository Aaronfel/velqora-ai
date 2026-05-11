import { useTheme } from '@/hooks/useTheme';

interface EyebrowProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export default function Eyebrow({ children, style }: EyebrowProps) {
  const t = useTheme();
  return (
    <div style={{ fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase' as const, color: t.text3, fontWeight: 500, ...style }}>
      {children}
    </div>
  );
}
