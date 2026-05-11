import { useId } from 'react';
import { useTheme } from '@/hooks/useTheme';

interface AreaTrendProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}

export default function AreaTrend({ data, width = 320, height = 90, color }: AreaTrendProps) {
  const t = useTheme();
  const strokeColor = color ?? t.accent;
  const uid = useId();
  const gid = `g-${uid.replace(/:/g, '')}`;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const pad = 4;
  const xs = data.map((_, i) => (i / (data.length - 1)) * (width - pad * 2) + pad);
  const ys = data.map(
    (v) => height - pad - ((v - min) / (max - min || 1)) * (height - pad * 2)
  );

  let d = `M ${xs[0]} ${ys[0]}`;
  for (let i = 1; i < xs.length; i++) {
    const cx = (xs[i - 1] + xs[i]) / 2;
    d += ` Q ${cx} ${ys[i - 1]} ${xs[i]} ${ys[i]}`;
  }
  const area = d + ` L ${xs[xs.length - 1]} ${height} L ${xs[0]} ${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      preserveAspectRatio="none"
      style={{ display: 'block' }}
    >
      <defs>
        <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.35" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path
        d={d}
        fill="none"
        stroke={strokeColor}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={xs[xs.length - 1]} cy={ys[ys.length - 1]} r={3} fill={strokeColor} />
    </svg>
  );
}
