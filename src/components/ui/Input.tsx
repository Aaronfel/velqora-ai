import { useTheme } from '@/hooks/useTheme';

interface InputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

export default function Input({ value, onChange, placeholder, type = 'text', prefix, suffix }: InputProps) {
  const t = useTheme();
  return (
    <div className="flex items-center rounded-xl" style={{ background: t.surface, border: `1px solid ${t.border}`, padding: '2px 12px' }}>
      {prefix && <span className="shrink-0 mr-1.5" style={{ fontSize: 13, color: t.text3 }}>{prefix}</span>}
      <input value={value} onChange={onChange} placeholder={placeholder} type={type}
        className="flex-1 min-w-0 outline-none bg-transparent"
        style={{ fontSize: 16, color: t.text, padding: '10px 0' }} />
      {suffix && <span className="shrink-0 ml-1.5" style={{ fontSize: 12, color: t.text3 }}>{suffix}</span>}
    </div>
  );
}
