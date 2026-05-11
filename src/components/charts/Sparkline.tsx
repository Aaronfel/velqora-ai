import { useTheme } from '@/hooks/useTheme';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}

export default function Sparkline({ data, width = 80, height = 24, color }: SparklineProps) {
  const t = useTheme();
  const strokeColor = color ?? t.income;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const xs = data.map((_, i) => (i / (data.length - 1)) * width);
  const ys = data.map((v) => height - ((v - min) / (max - min || 1)) * height);
  const d = xs.map((x, i) => `${i ? 'L' : 'M'} ${x} ${ys[i]}`).join(' ');

  return (
    <svg width={width} height={height}>
      <path d={d} fill="none" stroke={strokeColor} strokeWidth={1.5} strokeLinecap="round" />
      <circle cx={xs[xs.length - 1]} cy={ys[ys.length - 1]} r={2} fill={strokeColor} />
    </svg>
  );
}
