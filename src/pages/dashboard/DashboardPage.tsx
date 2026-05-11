import { useIsDesktop } from '@/hooks/useMediaQuery';
import DashboardMobile from './DashboardMobile';
import DashboardDesktop from './DashboardDesktop';

export default function DashboardPage() {
  const isDesktop = useIsDesktop();
  return isDesktop ? <DashboardDesktop /> : <DashboardMobile />;
}
