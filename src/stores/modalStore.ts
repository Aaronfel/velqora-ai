import { create } from 'zustand';

interface ToastItem {
  id: number;
  msg: string;
  tone?: 'good' | 'bad' | 'neutral';
}

interface ModalState {
  toast: ToastItem | null;
  showToast: (msg: string, tone?: ToastItem['tone']) => void;
  clearToast: () => void;
}

let toastId = 0;

export const useModalStore = create<ModalState>((set) => ({
  toast: null,
  showToast: (msg, tone = 'neutral') => set({ toast: { id: ++toastId, msg, tone } }),
  clearToast: () => set({ toast: null }),
}));
