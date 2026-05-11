import { useState, useRef } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import Sheet from '@/components/ui/Sheet';
import Button from '@/components/ui/Button';
import { useModalStore } from '@/stores/modalStore';
import { scanReceipt } from '@/lib/api';
import { Camera, Upload, ScanLine } from 'lucide-react';

export default function ReceiptModal() {
  const t = useTheme();
  const isDesktop = useIsDesktop();
  const closeModal = useModalStore((s) => s.closeModal);
  const openModal = useModalStore((s) => s.openModal);
  const showToast = useModalStore((s) => s.showToast);
  const [preview, setPreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [fileData, setFileData] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip the data URL prefix to get pure base64
      const base64 = result.split(',')[1];
      setFileData(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleScan = async () => {
    if (!fileData) return;
    setScanning(true);
    try {
      const result = await scanReceipt(fileData);
      closeModal();
      openModal('newTxn', { prefill: result });
    } catch {
      showToast('Failed to scan receipt', 'bad');
    } finally {
      setScanning(false);
    }
  };

  return (
    <Sheet
      device={isDesktop ? 'desktop' : 'mobile'}
      title="Scan Receipt"
      subtitle="Upload or take a photo to auto-extract transaction data"
      onClose={closeModal}
      footer={
        preview ? (
          <Button onClick={handleScan} fullWidth icon={ScanLine} disabled={scanning}>
            {scanning ? 'Scanning...' : 'Scan Receipt'}
          </Button>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-4">
        {preview ? (
          <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${t.border}`, maxHeight: 320 }}>
            <img src={preview} alt="Receipt preview" className="w-full object-cover" style={{ maxHeight: 320 }} />
          </div>
        ) : (
          <div
            className="rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer"
            style={{ border: `2px dashed ${t.border}`, height: 200, background: t.surface }}
            onClick={() => fileRef.current?.click()}
          >
            <Camera size={32} color={t.text4} />
            <p style={{ fontSize: 14, color: t.text3 }}>Tap to upload a receipt</p>
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        <Button variant="secondary" onClick={() => fileRef.current?.click()} fullWidth icon={Upload}>
          {preview ? 'Change Photo' : 'Choose from Library'}
        </Button>
        {scanning && (
          <div className="flex items-center gap-2 rounded-xl p-3" style={{ background: t.surface2 }}>
            <ScanLine size={16} color={t.accent} />
            <p style={{ fontSize: 13, color: t.text2 }}>Scanning receipt…</p>
          </div>
        )}
      </div>
    </Sheet>
  );
}
