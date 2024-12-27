import { create } from 'zustand';

type ModalAction = 'add-income' | 'add-expense' | 'add-expense-manual' | 'scan-receipt' | 'bulk-expense' | 'add-debt' | 'add-investment' | "settings" |null;

interface ModalStore {
  isModalVisible: boolean;
  currentAction: ModalAction;
  openModal: (action: ModalAction) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalStore>((set) => ({
  isModalVisible: false,
  currentAction: null,
  openModal: (action) => {
    set({ isModalVisible: true, currentAction: action })
  },
  closeModal: () => set({ isModalVisible: false, currentAction: null }),
}));
