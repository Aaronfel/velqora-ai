// src/components/ui/EmptyState.tsx
import { useTheme } from '@/hooks/useTheme';
import Button from '@/components/ui/Button';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  action?: { label: string; onClick: () => void };
}

export default function EmptyState({ icon: Icon, title, subtitle, action }: EmptyStateProps) {
  const t = useTheme();
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div
        className="rounded-2xl flex items-center justify-center mb-4"
        style={{ width: 56, height: 56, background: t.surface2, color: t.text3 }}
      >
        <Icon size={24} strokeWidth={1.5} />
      </div>
      <h3 className="font-sans" style={{ fontSize: 15, color: t.text, fontWeight: 500 }}>
        {title}
      </h3>
      {subtitle && (
        <p className="font-sans" style={{ fontSize: 12.5, color: t.text3, marginTop: 6, maxWidth: 280, lineHeight: 1.5 }}>
          {subtitle}
        </p>
      )}
      {action && (
        <div style={{ marginTop: 16 }}>
          <Button onClick={action.onClick} variant="secondary">{action.label}</Button>
        </div>
      )}
    </div>
  );
}
