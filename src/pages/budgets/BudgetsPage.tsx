import { useIsDesktop } from '@/hooks/useMediaQuery';
import BudgetsMobile from './BudgetsMobile';
import BudgetsDesktop from './BudgetsDesktop';

export default function BudgetsPage() {
  const isDesktop = useIsDesktop();
  return isDesktop ? <BudgetsDesktop /> : <BudgetsMobile />;
}
