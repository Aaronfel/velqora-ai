import { useTheme } from '@/hooks/useTheme';
import type { LucideIcon } from 'lucide-react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  fullWidth?: boolean;
  danger?: boolean;
  icon?: LucideIcon;
  disabled?: boolean;
  type?: 'button' | 'submit';
}

export default function Button({ children, onClick, variant = 'primary', fullWidth = false, danger = false, icon: Icon, disabled, type = 'button' }: ButtonProps) {
  const t = useTheme();
  const isPrimary = variant === 'primary';
  return (
    <button onClick={onClick} type={type} disabled={disabled}
      className={`flex items-center justify-center gap-2 ${fullWidth ? 'w-full' : ''} transition-opacity`}
      style={{
        background: isPrimary ? t.accent : 'transparent',
        color: isPrimary ? t.accentText : danger ? t.bad : t.text2,
        padding: '13px 18px', borderRadius: 14,
        border: isPrimary ? 'none' : `1px solid ${t.border}`,
        fontSize: 14, fontWeight: 500, letterSpacing: '-0.005em',
        opacity: disabled ? 0.5 : 1,
      }}>
      {Icon && <Icon size={15} strokeWidth={2} />}
      {children}
    </button>
  );
}
