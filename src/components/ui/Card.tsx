import { useTheme } from '@/hooks/useTheme';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  pad?: number;
}

export default function Card({ children, className = '', style, pad = 16 }: CardProps) {
  const t = useTheme();
  return (
    <div className={`relative overflow-hidden ${className}`}
      style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 18, padding: pad, ...style }}>
      {children}
    </div>
  );
}
