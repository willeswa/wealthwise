import { create } from 'zustand'

interface MenuState {
  isOptionsMenuVisible: boolean
  toggleOptionsMenu: () => void
  hideOptionsMenu: () => void
}

export const useMenuStore = create<MenuState>((set) => ({
  isOptionsMenuVisible: false,
  toggleOptionsMenu: () => set((state) => ({ isOptionsMenuVisible: !state.isOptionsMenuVisible })),
  hideOptionsMenu: () => set({ isOptionsMenuVisible: false })
}))
