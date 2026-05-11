import { useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import Sheet from '@/components/ui/Sheet';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useModalStore } from '@/stores/modalStore';
import { useGroupStore } from '@/stores/groupStore';
import { nlQuery, type NLQueryResult } from '@/lib/api';
import { Search, Sparkles } from 'lucide-react';

export default function NLSearchModal() {
  const t = useTheme();
  const isDesktop = useIsDesktop();
  const closeModal = useModalStore((s) => s.closeModal);
  const showToast = useModalStore((s) => s.showToast);
  const activeGroup = useGroupStore((s) => s.activeGroup);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<NLQueryResult | null>(null);

  const handleSearch = async () => {
    if (!query.trim() || !activeGroup) return;
    setLoading(true);
    try {
      const data = await nlQuery(activeGroup.id, query.trim());
      setResult(data);
    } catch {
      showToast('Search failed', 'bad');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet
      device={isDesktop ? 'desktop' : 'mobile'}
      title="Smart Search"
      subtitle="Ask anything about your finances"
      onClose={closeModal}
      footer={
        <Button onClick={handleSearch} fullWidth icon={Sparkles} disabled={!query.trim() || loading}>
          {loading ? 'Searching…' : 'Search'}
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. How much did I spend on food last month?"
          prefix={<Search size={14} />}
        />
        <div className="flex flex-col gap-2">
          <p style={{ fontSize: 11, color: t.text4, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
            Suggestions
          </p>
          {[
            'Biggest expense this month',
            'Compare spending vs last month',
            'Show shared transactions',
          ].map((s) => (
            <button
              key={s}
              onClick={() => setQuery(s)}
              className="text-left rounded-xl px-3 py-2.5 transition-opacity hover:opacity-70"
              style={{ background: t.surface2, fontSize: 13, color: t.text2, border: `0.5px solid ${t.border}` }}
            >
              {s}
            </button>
          ))}
        </div>
        {result && (
          <div className="flex flex-col gap-3">
            <div className="rounded-xl p-4" style={{ background: t.surface2, border: `0.5px solid ${t.border}` }}>
              <p style={{ fontSize: 14, color: t.text, lineHeight: 1.5 }}>{result.answer}</p>
              {result.total_count > 0 && (
                <p style={{ fontSize: 12, color: t.text3, marginTop: 8 }}>
                  {result.total_count} transaction{result.total_count !== 1 ? 's' : ''} found
                </p>
              )}
            </div>
            {result.transactions.slice(0, 5).map((txn, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl px-3 py-2.5"
                style={{ background: t.surface2, border: `0.5px solid ${t.border}` }}
              >
                <div>
                  <p style={{ fontSize: 13, color: t.text }}>{txn.description || txn.category?.name || '—'}</p>
                  <p style={{ fontSize: 11, color: t.text3 }}>{txn.date}</p>
                </div>
                <p style={{ fontSize: 13, fontWeight: 600, color: txn.type === 'income' ? t.income : t.expense }}>
                  {txn.currency === 'USD' ? 'US$' : '$'}{(txn.amount / 100).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Sheet>
  );
}
