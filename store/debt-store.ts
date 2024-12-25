import { create } from 'zustand';
import { Debt, DebtInput, DebtSummary } from '../utils/types/debt';
import { addDebt, getDebts, getDebtSummary } from '../utils/db/debt';

interface DebtStore {
  debts: Debt[];
  summary: DebtSummary | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  fetchDebts: () => Promise<void>;
  fetchSummary: () => Promise<void>;
  addNewDebt: (debt: DebtInput) => Promise<void>;
}

export const useDebtStore = create<DebtStore>((set) => ({
  debts: [],
  summary: null,
  loading: false,
  error: null,
  initialized: false,

  fetchDebts: async () => {
    try {
      set({ loading: true, error: null });
      const data = await getDebts();
      set({ debts: data, initialized: true });
    } catch (error) {
      set({ error: 'Failed to fetch debts', initialized: false });
      console.error('Error fetching debts:', error);
    } finally {
      set({ loading: false });
    }
  },

  fetchSummary: async () => {
    try {
      set({ loading: true, error: null });
      const summary = await getDebtSummary();
      set({ summary });
    } catch (error) {
      set({ error: 'Failed to fetch debt summary' });
      console.error('Error fetching debt summary:', error);
    } finally {
      set({ loading: false });
    }
  },

  addNewDebt: async (debtData) => {
    try {
      set({ loading: true, error: null });
      await addDebt(debtData);
      await Promise.all([
        useDebtStore.getState().fetchDebts(),
        useDebtStore.getState().fetchSummary()
      ]);
    } catch (error) {
      set({ error: 'Failed to add debt' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
