import { useModalStore } from '@/stores/modalStore';
import NewTxnModal from './NewTxnModal';
import EditTxnModal from './EditTxnModal';
import ReceiptModal from './ReceiptModal';
import NLSearchModal from './NLSearchModal';
import InviteModal from './InviteModal';
import RolesModal from './RolesModal';
import BudgetFormModal from './BudgetFormModal';
import GoalFormModal from './GoalFormModal';
import ExchangeModal from './ExchangeModal';
import SignOutModal from './SignOutModal';
import NotifsModal from './NotifsModal';
import CategoriesModal from './CategoriesModal';
import GroupsModal from './GroupsModal';

export default function ModalRoot() {
  const modal = useModalStore((s) => s.modal);

  if (!modal) return null;

  switch (modal) {
    case 'newTxn':
      return <NewTxnModal />;
    case 'editTxn':
      return <EditTxnModal />;
    case 'receipt':
      return <ReceiptModal />;
    case 'nlSearch':
      return <NLSearchModal />;
    case 'invite':
      return <InviteModal />;
    case 'roles':
      return <RolesModal />;
    case 'budgetForm':
      return <BudgetFormModal />;
    case 'goalForm':
      return <GoalFormModal />;
    case 'exchange':
      return <ExchangeModal />;
    case 'signout':
      return <SignOutModal />;
    case 'notifs':
      return <NotifsModal />;
    case 'categories':
      return <CategoriesModal />;
    case 'groups':
      return <GroupsModal />;
    case 'picker':
      return null;
    default:
      return null;
  }
}
