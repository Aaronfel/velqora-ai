import { useMemo } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { DARK_THEME, LIGHT_THEME, type Theme } from '@/styles/theme';

export function useTheme(): Theme {
  const mode = useSettingsStore((s) => s.theme);
  return useMemo(() => (mode === 'dark' ? DARK_THEME : LIGHT_THEME), [mode]);
}
