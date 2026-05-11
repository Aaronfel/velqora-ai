import { useIsDesktop } from '@/hooks/useMediaQuery';
import InsightsMobile from './InsightsMobile';
import InsightsDesktop from './InsightsDesktop';

export default function InsightsPage() {
  const isDesktop = useIsDesktop();
  return isDesktop ? <InsightsDesktop /> : <InsightsMobile />;
}
