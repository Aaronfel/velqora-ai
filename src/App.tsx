import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useGroupStore } from '@/stores/groupStore';
import LoginPage from '@/pages/auth/LoginPage';
import OnboardingPage from '@/pages/auth/OnboardingPage';
import AppLayout from '@/components/layout/AppLayout';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import TransactionsPage from '@/pages/transactions/TransactionsPage';
import BudgetsPage from '@/pages/budgets/BudgetsPage';
import InsightsPage from '@/pages/insights/InsightsPage';
import SettingsPage from '@/pages/settings/SettingsPage';
import Toast from '@/components/ui/Toast';

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore();
  const { loading: groupsLoading, fetchGroups } = useGroupStore();
  const [onboarded, setOnboarded] = useState<boolean | null>(null);
  const t = useSettingsStore((s) => s.theme);

  useEffect(() => {
    if (user) {
      fetchGroups().then(() => {
        const current = useGroupStore.getState().groups;
        setOnboarded(current.length > 0);
      });
    }
  }, [user, fetchGroups]);

  const splash = (
    <div className="h-screen w-screen flex items-center justify-center" style={{ background: t === 'dark' ? '#0B0907' : '#F4EDDE' }}>
      <span className="font-serif text-2xl" style={{ color: t === 'dark' ? '#E8D5A8' : '#2D1F12' }}>VelqoraAI</span>
    </div>
  );

  if (loading) return splash;
  if (!user) return <><LoginPage /><Toast /></>;
  if (groupsLoading || onboarded === null) return splash;
  if (!onboarded) return <><OnboardingPage onComplete={() => setOnboarded(true)} /><Toast /></>;

  return <>{children}</>;
}

export default function App() {
  const initialize = useAuthStore((s) => s.initialize);
  const theme = useSettingsStore((s) => s.theme);

  useEffect(() => { initialize(); }, [initialize]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <BrowserRouter>
      <AuthGate>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/budgets" element={<BudgetsPage />} />
            <Route path="/insights" element={<InsightsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthGate>
    </BrowserRouter>
  );
}
