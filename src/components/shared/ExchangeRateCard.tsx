import { useEffect } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { useExchangeStore } from '@/stores/exchangeStore';
import Card from '@/components/ui/Card';
import Eyebrow from '@/components/ui/Eyebrow';
import Sparkline from '@/components/charts/Sparkline';

interface ExchangeRateCardProps {
  compact?: boolean;
}

const SPARKLINE_MOCK = [1150, 1170, 1160, 1190, 1185, 1200, 1210];

export default function ExchangeRateCard({ compact = false }: ExchangeRateCardProps) {
  const t = useTheme();
  const { rate, fetchLatestRate } = useExchangeStore();

  useEffect(() => {
    fetchLatestRate();
  }, [fetchLatestRate]);

  const buy = rate?.buy_rate ?? 1190;
  const sell = rate?.sell_rate ?? 1215;

  return (
    <Card pad={14} style={{ background: t.surface }}>
      <div className="flex items-center gap-2">
        <div
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ background: t.navy, boxShadow: `0 0 8px ${t.navy}` }}
        />
        <Eyebrow style={{ color: t.text2 }}>Dólar Blue</Eyebrow>
      </div>

      <div className="flex items-end justify-between mt-2">
        <div>
          <div
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 26,
              fontWeight: 500,
              color: t.text,
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }}
          >
            ${sell.toLocaleString('es-AR')}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span style={{ fontSize: 10, color: t.text3 }}>compra ${buy.toLocaleString('es-AR')}</span>
            <span style={{ color: t.text4 }}>·</span>
            <span style={{ fontSize: 10, color: t.text3 }}>venta ${sell.toLocaleString('es-AR')}</span>
          </div>
        </div>

        {!compact && (
          <Sparkline data={SPARKLINE_MOCK} width={80} height={32} color={t.navy} />
        )}
      </div>
    </Card>
  );
}
