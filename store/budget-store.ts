import { create } from 'zustand';
import { BudgetCategory, BudgetSummary } from '../utils/types/budget';
import { addBudgetCategory, getBudgetSummary, updateBudgetCategory } from '../utils/db/budget';

interface BudgetStore {
  summary: BudgetSummary | null;
  loading: boolean;
  error: string | null;
  fetchSummary: () => Promise<void>;
  addCategory: (category: Omit<BudgetCategory, 'id' | 'created_at'>) => Promise<void>;
  updateCategory: (id: number, updates: Partial<BudgetCategory>) => Promise<void>;
}

export const useBudgetStore = create<BudgetStore>((set) => ({
  summary: null,
  loading: false,
  error: null,

  fetchSummary: async () => {
    try {
      set({ loading: true, error: null });
      const summary = await getBudgetSummary();
      set({ summary });
    } catch (error) {
      set({ error: 'Failed to fetch budget summary' });
    } finally {
      set({ loading: false });
    }
  },

  addCategory: async (category) => {
    try {
      set({ loading: true, error: null });
      await addBudgetCategory(category);
      const summary = await getBudgetSummary();
      set({ summary });
    } catch (error) {
      set({ error: 'Failed to add budget category' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateCategory: async (id, updates) => {
    try {
      set({ loading: true, error: null });
      await updateBudgetCategory(id, updates);
      const summary = await getBudgetSummary();
      set({ summary });
    } catch (error) {
      set({ error: 'Failed to update budget category' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
