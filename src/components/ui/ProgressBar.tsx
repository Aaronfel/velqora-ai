import { useTheme } from '@/hooks/useTheme';

interface ProgressBarProps {
  value: number;
  max: number;
  color?: string;
  height?: number;
}

export default function ProgressBar({ value, max, color, height = 6 }: ProgressBarProps) {
  const t = useTheme();
  const pct = Math.min(100, (value / max) * 100);
  const over = value > max;
  return (
    <div className="w-full rounded-full overflow-hidden" style={{ height, background: t.surface3 }}>
      <div className="h-full rounded-full transition-all"
        style={{ width: `${Math.min(100, pct)}%`, background: over ? t.bad : (color || t.accent) }} />
    </div>
  );
}
