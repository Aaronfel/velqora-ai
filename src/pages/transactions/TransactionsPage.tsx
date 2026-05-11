import { useIsDesktop } from '@/hooks/useMediaQuery';
import TransactionsMobile from './TransactionsMobile';
import TransactionsDesktop from './TransactionsDesktop';

export default function TransactionsPage() {
  const isDesktop = useIsDesktop();
  return isDesktop ? <TransactionsDesktop /> : <TransactionsMobile />;
}
