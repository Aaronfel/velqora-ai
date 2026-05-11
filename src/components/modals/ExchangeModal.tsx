import { useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import Sheet from '@/components/ui/Sheet';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useModalStore } from '@/stores/modalStore';
import { useExchangeStore } from '@/stores/exchangeStore';
import { ArrowRightLeft } from 'lucide-react';

export default function ExchangeModal() {
  const t = useTheme();
  const isDesktop = useIsDesktop();
  const closeModal = useModalStore((s) => s.closeModal);
  const showToast = useModalStore((s) => s.showToast);
  const { rate, manualOverride } = useExchangeStore();

  const [buyRate, setBuyRate] = useState(rate ? String(rate.buy_rate) : '');
  const [sellRate, setSellRate] = useState(rate ? String(rate.sell_rate) : '');

  const handleSave = async () => {
    const buy = parseFloat(buyRate);
    const sell = parseFloat(sellRate);
    if (isNaN(buy) || isNaN(sell) || buy <= 0 || sell <= 0) {
      showToast('Enter valid rates', 'bad');
      return;
    }
    try {
      await manualOverride(buy, sell);
      showToast('Exchange rate updated', 'good');
      closeModal();
    } catch {
      showToast('Failed to update rate', 'bad');
    }
  };

  return (
    <Sheet
      device={isDesktop ? 'desktop' : 'mobile'}
      title="Exchange Rate"
      subtitle="USD → ARS manual override"
      onClose={closeModal}
      maxWidth={420}
      footer={
        <Button onClick={handleSave} fullWidth icon={ArrowRightLeft}>
          Save Rate
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        {rate && (
          <div className="rounded-xl p-3" style={{ background: t.surface2, border: `0.5px solid ${t.border}` }}>
            <p style={{ fontSize: 12, color: t.text4, marginBottom: 4 }}>Current rate ({rate.source})</p>
            <div className="flex gap-4">
              <div>
                <p style={{ fontSize: 11, color: t.text3 }}>Buy</p>
                <p style={{ fontSize: 16, fontWeight: 600, color: t.income }}>${rate.buy_rate.toLocaleString()}</p>
              </div>
              <div>
                <p style={{ fontSize: 11, color: t.text3 }}>Sell</p>
                <p style={{ fontSize: 16, fontWeight: 600, color: t.expense }}>${rate.sell_rate.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          <label style={{ fontSize: 12, color: t.text3 }}>Buy rate (ARS per USD)</label>
          <Input
            value={buyRate}
            onChange={(e) => setBuyRate(e.target.value)}
            placeholder="e.g. 1050"
            type="number"
            prefix="$"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label style={{ fontSize: 12, color: t.text3 }}>Sell rate (ARS per USD)</label>
          <Input
            value={sellRate}
            onChange={(e) => setSellRate(e.target.value)}
            placeholder="e.g. 1080"
            type="number"
            prefix="$"
          />
        </div>
      </div>
    </Sheet>
  );
}
