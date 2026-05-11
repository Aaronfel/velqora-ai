import { Sparkles } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useModalStore } from '@/stores/modalStore';
import CatIcon from '@/components/ui/CatIcon';
import { formatARS, formatUSD } from '@/lib/constants';
import type { Transaction, Category, User } from '@/types';

export interface TxRowData extends Transaction {
  category?: Category;
  user?: User;
}

interface TxRowProps {
  txn: TxRowData;
  dense?: boolean;
}

export default function TxRow({ txn, dense = false }: TxRowProps) {
  const t = useTheme();
  const openModal = useModalStore((s) => s.openModal);

  const positive = txn.type === 'income';
  const formatted =
    txn.currency === 'USD'
      ? formatUSD(Math.abs(txn.amount), false)
      : formatARS(Math.abs(txn.amount), false);

  const category = txn.category;

  return (
    <button
      onClick={() => openModal('editTxn')}
      className="w-full flex items-center gap-3 text-left transition-colors hover:opacity-90"
      style={{ padding: dense ? '10px 0' : '12px 0' }}
    >
      {category ? (
        <CatIcon icon={category.icon} color={category.color} size={dense ? 34 : 38} />
      ) : (
        <div
          className="rounded-xl shrink-0"
          style={{
            width: dense ? 34 : 38,
            height: dense ? 34 : 38,
            background: t.surface3,
          }}
        />
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span
            className="truncate"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 13.5,
              color: t.text,
              fontWeight: 500,
            }}
          >
            {txn.description}
          </span>
          {txn.ai_extracted && <Sparkles size={10} color={t.accent} />}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: t.text3 }}>
            {txn.date}
          </span>
          {category && (
            <>
              <span style={{ color: t.text4 }}>·</span>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: t.text3 }}>
                {category.name}
              </span>
            </>
          )}
          {!txn.is_shared && (
            <>
              <span style={{ color: t.text4 }}>·</span>
              <span
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 10,
                  color: t.navy,
                }}
              >
                privado
              </span>
            </>
          )}
        </div>
      </div>

      <div className="text-right shrink-0">
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 13,
            fontWeight: 500,
            color: positive ? t.income : t.text,
          }}
        >
          {positive ? '+' : '−'}
          {formatted}
        </div>
      </div>
    </button>
  );
}
