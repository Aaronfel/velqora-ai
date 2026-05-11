import { Outlet } from 'react-router-dom';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useTheme } from '@/hooks/useTheme';
import { useRealtime } from '@/hooks/useRealtime';
import Sidebar from './Sidebar';
import TabBar from './TabBar';
import ModalRoot from '@/components/modals/ModalRoot';

export default function AppLayout() {
  const isDesktop = useIsDesktop();
  const t = useTheme();
  useRealtime();

  return (
    <div className="h-full flex" style={{ background: t.bg }}>
      {isDesktop && <Sidebar />}
      <main className="flex-1 relative overflow-hidden">
        <div className="h-full overflow-y-auto">
          {isDesktop ? (
            <div className="p-8 max-w-[1400px] mx-auto">
              <Outlet />
            </div>
          ) : (
            <Outlet />
          )}
        </div>
        {!isDesktop && <TabBar />}
        <ModalRoot />
      </main>
    </div>
  );
}
