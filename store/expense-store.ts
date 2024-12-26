import { create } from 'zustand';
import { addExpense, deleteExpense, getExpenses } from '../utils/db/expense';
import { getDefaultCurrency, setDefaultCurrency } from '../utils/db/utils/settings';
import { Expense, ExpenseInput } from '../utils/types/expense';
import { useBudgetStore } from './budget-store';

interface ExpenseStore {
  expenses: Expense[];
  loading: boolean;
  error: string | null;
  initialized: boolean;
  defaultCurrency: string;
  fetchExpenses: () => Promise<void>;
  addNewExpense: (expense: ExpenseInput) => Promise<void>;
  removeExpense: (id: number) => Promise<void>;
  setDefaultCurrency: (currency: string) => Promise<void>;
}

export const useExpenseStore = create<ExpenseStore>((set) => ({
  expenses: [],
  loading: false,
  error: null,
  initialized: false,
  defaultCurrency: 'USD',

  fetchExpenses: async () => {
    try {
      set({ loading: true, error: null });
      const [data, currency] = await Promise.all([
        getExpenses(),
        getDefaultCurrency()
      ]);
      set({ expenses: data, defaultCurrency: currency, initialized: true });
    } catch (error) {
      set({ error: 'Failed to fetch expenses', initialized: false });
      console.error('Error fetching expenses:', error);
    } finally {
      set({ loading: false });
    }
  },

  addNewExpense: async (expenseData) => {
    try {
      set({ loading: true, error: null });
      await addExpense(expenseData);
      const updatedExpenses = await getExpenses();
      set({ expenses: updatedExpenses });
      await useBudgetStore.getState().fetchSummary();
    } catch (error) {
      set({ error: 'Failed to add expense' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  removeExpense: async (id) => {
    try {
      set({ loading: true, error: null });
      await deleteExpense(id);
      const updatedExpenses = await getExpenses();
      set({ expenses: updatedExpenses });
      await useBudgetStore.getState().fetchSummary();
    } catch (error) {
      set({ error: 'Failed to delete expense' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  setDefaultCurrency: async (currency: string) => {
    try {
      await setDefaultCurrency(currency);
      set({ defaultCurrency: currency });
    } catch (error) {
      console.error('Error setting default currency:', error);
      throw error;
    }
  },
}));
