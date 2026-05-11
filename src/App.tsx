import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import LoginPage from '@/pages/auth/LoginPage';

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore();

  if (loading) {
    return <div className="h-screen w-screen flex items-center justify-center" style={{ background: '#0B0907' }}>
      <span className="font-serif text-2xl" style={{ color: '#E8D5A8' }}>VelqoraAI</span>
    </div>;
  }

  if (!user) return <LoginPage />;
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
          <Route path="/" element={<div>Dashboard placeholder</div>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthGate>
    </BrowserRouter>
  );
}
