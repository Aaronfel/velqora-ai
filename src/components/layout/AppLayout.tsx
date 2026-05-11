import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useTheme } from '@/hooks/useTheme';
import { useRealtime } from '@/hooks/useRealtime';
import Sidebar from './Sidebar';
import TabBar from './TabBar';
import ModalRoot from '@/components/modals/ModalRoot';
import Toast from '@/components/ui/Toast';
import { useGroupStore } from '@/stores/groupStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { useBudgetStore } from '@/stores/budgetStore';
import { useExchangeStore } from '@/stores/exchangeStore';

export default function AppLayout() {
  const isDesktop = useIsDesktop();
  const t = useTheme();
  useRealtime();

  const activeGroup = useGroupStore((s) => s.activeGroup);
  const fetchTransactions = useTransactionStore((s) => s.fetchTransactions);
  const fetchBudgets = useBudgetStore((s) => s.fetchBudgets);
  const fetchGoals = useBudgetStore((s) => s.fetchGoals);
  const fetchLatestRate = useExchangeStore((s) => s.fetchLatestRate);

  useEffect(() => {
    useGroupStore.getState().fetchGroups();
  }, []);

  useEffect(() => {
    if (!activeGroup) return;
    const currentMonth = new Date().toISOString().slice(0, 7);
    fetchTransactions(activeGroup.id);
    fetchBudgets(activeGroup.id, currentMonth);
    fetchGoals(activeGroup.id);
    fetchLatestRate();
  }, [activeGroup, fetchTransactions, fetchBudgets, fetchGoals, fetchLatestRate]);

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
        <Toast />
      </main>
    </div>
  );
}
