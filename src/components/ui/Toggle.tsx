import { useTheme } from '@/hooks/useTheme';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export default function Toggle({ checked, onChange }: ToggleProps) {
  const t = useTheme();
  return (
    <button onClick={() => onChange(!checked)}
      className="relative rounded-full transition-colors"
      style={{ width: 38, height: 22, background: checked ? t.accent : t.surface3 }}>
      <div className="absolute top-1 rounded-full transition-all"
        style={{ width: 14, height: 14, background: checked ? t.accentText : t.text3, left: checked ? 22 : 2 }} />
    </button>
  );
}
