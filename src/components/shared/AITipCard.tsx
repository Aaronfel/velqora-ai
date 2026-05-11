import { Sparkles } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useModalStore } from '@/stores/modalStore';
import Card from '@/components/ui/Card';

const TIP_MESSAGE =
  'Tu gasto en comida afuera subió un 34% respecto al mes pasado. Fijar un límite de $45.000 te ayudaría a mantener el objetivo de ahorro.';

export default function AITipCard() {
  const t = useTheme();
  const showToast = useModalStore((s) => s.showToast);
  const openModal = useModalStore((s) => s.openModal);

  return (
    <Card
      pad={18}
      style={{
        background: `linear-gradient(135deg, ${t.surface2} 0%, ${t.surface} 100%)`,
        borderColor: t.borderStrong,
      }}
    >
      <div className="flex items-center justify-between">
        <div
          className="inline-flex items-center gap-1.5 rounded-full"
          style={{
            padding: '3px 9px',
            background: t.accent + '15',
            border: `1px solid ${t.accent}30`,
          }}
        >
          <Sparkles size={11} color={t.accent} />
          <span
            style={{
              fontSize: 10,
              color: t.accent,
              fontWeight: 500,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            Insight
          </span>
        </div>
        <span style={{ fontSize: 10, color: t.text3 }}>Hace 2h</span>
      </div>

      <p
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 17,
          lineHeight: 1.35,
          color: t.text,
          marginTop: 14,
          fontWeight: 400,
        }}
      >
        {TIP_MESSAGE}
      </p>

      <div className="flex items-center gap-2 mt-4">
        <button
          onClick={() => openModal('budgetForm')}
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: t.accentText,
            background: t.accent,
            padding: '8px 14px',
            borderRadius: 999,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Fijar límite
        </button>
        <button
          onClick={() => showToast('Tip descartado', 'neutral')}
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: t.text2,
            padding: '8px 14px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Ahora no
        </button>
      </div>
    </Card>
  );
}
