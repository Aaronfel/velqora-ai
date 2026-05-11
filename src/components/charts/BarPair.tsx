import { useTheme } from '@/hooks/useTheme';

interface BarPairProps {
  months: string[];
  income: number[];
  expense: number[];
}

export default function BarPair({ months, income, expense }: BarPairProps) {
  const t = useTheme();
  const W = 360;
  const H = 160;
  const gap = 14;
  const max = Math.max(...income, ...expense);
  const colW = (W - gap * (months.length - 1)) / months.length;
  const barW = (colW - 4) / 2;

  return (
    <svg viewBox={`0 0 ${W} ${H + 24}`} width="100%" height={H + 24}>
      {months.map((m, i) => {
        const x = i * (colW + gap);
        const hi = (income[i] / max) * H;
        const he = (expense[i] / max) * H;
        return (
          <g key={i}>
            <rect x={x} y={H - hi} width={barW} height={hi} rx={3} fill={t.income} opacity={0.85} />
            <rect
              x={x + barW + 4}
              y={H - he}
              width={barW}
              height={he}
              rx={3}
              fill={t.expense}
              opacity={0.85}
            />
            <text
              x={x + colW / 2}
              y={H + 16}
              textAnchor="middle"
              fill={t.text3}
              style={{ fontSize: 10, letterSpacing: '0.04em', fontFamily: 'var(--font-sans)' }}
            >
              {m}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
