import { useTheme } from '@/hooks/useTheme';
import { X } from 'lucide-react';

interface SheetProps {
  device: 'mobile' | 'desktop';
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: number;
}

export default function Sheet({ device, title, subtitle, onClose, children, footer, maxWidth = 480 }: SheetProps) {
  const t = useTheme();
  const isMobile = device === 'mobile';
  const BLUR = 'blur(24px) saturate(180%)';

  return (
    <div className="fixed inset-0 z-[60] flex" style={{ alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center' }}>
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.32)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }} onClick={onClose} />
      <div className="relative flex flex-col"
        style={{
          background: t.glassStrong, backdropFilter: BLUR, WebkitBackdropFilter: BLUR,
          borderTopLeftRadius: isMobile ? 36 : 24, borderTopRightRadius: isMobile ? 36 : 24,
          borderBottomLeftRadius: isMobile ? 0 : 24, borderBottomRightRadius: isMobile ? 0 : 24,
          border: `0.5px solid ${t.border}`,
          width: isMobile ? '100%' : maxWidth, maxHeight: isMobile ? '90%' : '85%',
          boxShadow: `0 -20px 50px -10px ${t.shadow}, inset 0 1px 0 0 ${t.glassEdgeStrong}`,
          overflow: 'hidden',
        }}>
        {isMobile && <div className="mx-auto mt-3 mb-1 shrink-0" style={{ width: 36, height: 5, background: t.text4, borderRadius: 3, opacity: 0.55 }} />}
        <div className="flex items-start justify-between shrink-0" style={{ padding: isMobile ? '12px 20px 4px' : '20px 24px 4px' }}>
          <div className="flex-1">
            <h3 className="font-serif" style={{ fontSize: isMobile ? 20 : 22, color: t.text, fontWeight: 500, letterSpacing: '-0.01em', lineHeight: 1.2 }}>{title}</h3>
            {subtitle && <p style={{ fontSize: 12, color: t.text3, marginTop: 4 }}>{subtitle}</p>}
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
            style={{ background: t.surface2, border: `0.5px solid ${t.border}` }}>
            <X size={14} color={t.text2} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto" style={{ padding: isMobile ? '16px 20px 8px' : '16px 24px 8px' }}>
          {children}
        </div>
        {footer && (
          <div className="shrink-0" style={{ padding: isMobile ? '12px 20px 24px' : '16px 24px 20px', borderTop: `0.5px solid ${t.glassDivider}`, background: t.glassStrong, backdropFilter: BLUR, WebkitBackdropFilter: BLUR }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
