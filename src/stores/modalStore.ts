import { create } from 'zustand';

interface ToastItem {
  id: number;
  msg: string;
  tone?: 'good' | 'bad' | 'neutral';
}

export type ModalType =
  | 'newTxn'
  | 'editTxn'
  | 'receipt'
  | 'nlSearch'
  | 'invite'
  | 'roles'
  | 'budgetForm'
  | 'goalForm'
  | 'picker'
  | 'exchange'
  | 'signout'
  | 'notifs'
  | 'categories'
  | 'groups'
  | null;

interface ModalState {
  toast: ToastItem | null;
  showToast: (msg: string, tone?: ToastItem['tone']) => void;
  clearToast: () => void;
  modal: ModalType;
  openModal: (type: Exclude<ModalType, null>) => void;
  closeModal: () => void;
}

let toastId = 0;

export const useModalStore = create<ModalState>((set) => ({
  toast: null,
  showToast: (msg, tone = 'neutral') => set({ toast: { id: ++toastId, msg, tone } }),
  clearToast: () => set({ toast: null }),
  modal: null,
  openModal: (type) => set({ modal: type }),
  closeModal: () => set({ modal: null }),
}));
