import { create } from 'zustand';
import { BudgetCategory, BudgetInsight, BudgetSummary } from '../utils/types/budget';
import { addBudgetCategory, getBudgetSummary, updateBudgetCategory, calculateBudgetInsights } from '../utils/db/budget';
import { useInvestmentStore } from './investment-store';
import { useDebtStore } from './debt-store';
import { getDefaultCurrency } from '../utils/db/utils/settings';

interface BudgetStore {
  summary: BudgetSummary | null;
  loading: boolean;
  error: string | null;
  insights: BudgetInsight | null;
  fetchSummary: () => Promise<void>;
  addCategory: (category: Omit<BudgetCategory, 'id' | 'created_at'>) => Promise<void>;
  updateCategory: (id: number, updates: Partial<BudgetCategory>) => Promise<void>;
  fetchInsights: () => Promise<void>;
  defaultCurrency: string;
  setDefaultCurrency: (currency: string) => Promise<void>;
}

export const useBudgetStore = create<BudgetStore>((set) => ({
  summary: null,
  loading: false,
  error: null,
  insights: null,
  defaultCurrency: 'USD',

  fetchSummary: async () => {
    try {
      set({ loading: true, error: null });
      const [summary, defaultCurrency] = await Promise.all([
        getBudgetSummary(),
        getDefaultCurrency()
      ]);
      set({ summary, defaultCurrency });
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
      
      // Update related stores
      await Promise.all([
        useInvestmentStore.getState().calculateAnalytics(),
        useDebtStore.getState().fetchSummary()
      ]);
    } catch (error) {
      set({ error: 'Failed to update budget category' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  fetchInsights: async () => {
    try {
      set({ loading: true, error: null });
      const insights = await calculateBudgetInsights();
      set({ insights });
    } catch (error) {
      set({ error: 'Failed to fetch budget insights' });
    } finally {
      set({ loading: false });
    }
  },

  setDefaultCurrency: async (currency: string) => {
    try {
      set({ loading: true, error: null });
      await setDefaultCurrency(currency);
      set({ defaultCurrency: currency });
      await useBudgetStore.getState().fetchSummary();
    } catch (error) {
      set({ error: 'Failed to update default currency' });
    } finally {
      set({ loading: false });
    }
  },
}));
