import { useSettingsStore } from '@/stores/settingsStore';
import * as Icons from 'lucide-react';

interface CatIconProps {
  icon: string;
  color: string;
  size?: number;
}

export default function CatIcon({ icon, color, size = 36 }: CatIconProps) {
  const isDark = useSettingsStore((s) => s.theme) === 'dark';
  const IconComponent = (Icons as any)[icon];
  if (!IconComponent) return null;

  const bgAlpha = isDark ? '22' : '38';
  const borderAlpha = isDark ? '1f' : '60';
  const strokeColor = isDark ? color : darken(color, 0.35);

  return (
    <div className="flex items-center justify-center rounded-xl shrink-0"
      style={{ width: size, height: size, background: color + bgAlpha, color: strokeColor, border: `1px solid ${color}${borderAlpha}` }}>
      <IconComponent size={size * 0.46} strokeWidth={1.6} />
    </div>
  );
}

function darken(hex: string, pct: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 0xff) * (1 - pct));
  const g = Math.round(((n >> 8) & 0xff) * (1 - pct));
  const b = Math.round((n & 0xff) * (1 - pct));
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}
