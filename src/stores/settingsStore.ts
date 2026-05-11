import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ThemeMode } from '@/styles/theme';

interface SettingsState {
  theme: ThemeMode;
  locale: 'es' | 'en';
  primaryCurrency: 'ARS' | 'USD';
  pushEnabled: boolean;
  emailDigest: 'off' | 'weekly' | 'monthly';
  budgetAlerts: boolean;
  setTheme: (theme: ThemeMode) => void;
  setLocale: (locale: 'es' | 'en') => void;
  setPrimaryCurrency: (currency: 'ARS' | 'USD') => void;
  setPushEnabled: (enabled: boolean) => void;
  setEmailDigest: (freq: 'off' | 'weekly' | 'monthly') => void;
  setBudgetAlerts: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'dark',
      locale: 'es',
      primaryCurrency: 'ARS',
      pushEnabled: true,
      emailDigest: 'weekly',
      budgetAlerts: true,
      setTheme: (theme) => set({ theme }),
      setLocale: (locale) => set({ locale }),
      setPrimaryCurrency: (currency) => set({ primaryCurrency: currency }),
      setPushEnabled: (enabled) => set({ pushEnabled: enabled }),
      setEmailDigest: (freq) => set({ emailDigest: freq }),
      setBudgetAlerts: (enabled) => set({ budgetAlerts: enabled }),
    }),
    { name: 'velqora-settings' }
  )
);
