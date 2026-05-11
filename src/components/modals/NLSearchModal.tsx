import { useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import Sheet from '@/components/ui/Sheet';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useModalStore } from '@/stores/modalStore';
import { Search, Sparkles } from 'lucide-react';

export default function NLSearchModal() {
  const t = useTheme();
  const isDesktop = useIsDesktop();
  const closeModal = useModalStore((s) => s.closeModal);
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    // AI natural language search — will connect to edge function in Task 23
  };

  return (
    <Sheet
      device={isDesktop ? 'desktop' : 'mobile'}
      title="Smart Search"
      subtitle="Ask anything about your finances"
      onClose={closeModal}
      footer={
        <Button onClick={handleSearch} fullWidth icon={Sparkles} disabled={!query.trim()}>
          Search
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
        {query.trim() && (
          <div className="rounded-xl p-4" style={{ background: t.surface2, border: `0.5px solid ${t.border}` }}>
            <p style={{ fontSize: 13, color: t.text3, textAlign: 'center' }}>
              AI search will be available in a future update.
            </p>
          </div>
        )}
      </div>
    </Sheet>
  );
}
