import { create } from 'zustand'

export type Action = "add-income" | "add-expense" | "add-investment" | "add-debt" | null;

interface ModalState {
  isModalVisible: boolean
  currentAction: Action
  openModal: (action: Action) => void
  closeModal: () => void
}

export const useModalStore = create<ModalState>((set) => ({
  isModalVisible: false,
  currentAction: null,
  openModal: (action) => set({ isModalVisible: true, currentAction: action }),
  closeModal: () => set({ isModalVisible: false, currentAction: null })
}))
