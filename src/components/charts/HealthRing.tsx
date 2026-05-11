import { useTheme } from '@/hooks/useTheme';

interface HealthRingProps {
  score: number;
  size?: number;
  thickness?: number;
}

export default function HealthRing({ score, size = 120, thickness = 10 }: HealthRingProps) {
  const t = useTheme();
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const dash = (score / 100) * c;
  const color = score > 75 ? t.income : score > 50 ? t.warn : t.bad;

  return (
    <div className="relative inline-block">
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={t.surface3}
          strokeWidth={thickness}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeDasharray={`${dash} ${c}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: size * 0.34,
            fontWeight: 500,
            color: t.text,
            lineHeight: 1,
          }}
        >
          {score}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 9,
            color: t.text3,
            letterSpacing: '0.12em',
            marginTop: 2,
          }}
        >
          / 100
        </div>
      </div>
    </div>
  );
}
