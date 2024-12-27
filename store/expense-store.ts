import { create } from 'zustand';
import { addExpense, deleteExpense, getExpenses, getExpenseCategories, updateExpenseStatus } from '../utils/db/expense';
import { getDefaultCurrency, setDefaultCurrency } from '../utils/db/utils/settings';
import { Expense, ExpenseInput, ExpenseCategory, ExpenseStatus } from '../utils/types/expense';
import { useBudgetStore } from './budget-store';
import { useDebtStore } from './debt-store';
import { useInvestmentStore } from './investment-store';

interface ExpenseStore {
  expenses: Expense[];
  loading: boolean;
  error: string | null;
  initialized: boolean;
  defaultCurrency: string;
  categories: ExpenseCategory[];
  fetchExpenses: () => Promise<void>;
  addNewExpense: (expense: ExpenseInput) => Promise<void>;
  removeExpense: (id: number) => Promise<void>;
  setDefaultCurrency: (currency: string) => Promise<void>;
  fetchCategories: () => Promise<void>;
  updateStatus: (id: number, status: ExpenseStatus, paidDate?: string) => Promise<void>;
}

export const useExpenseStore = create<ExpenseStore>((set) => ({
  expenses: [],
  loading: false,
  error: null,
  initialized: false,
  defaultCurrency: 'USD',
  categories: [],

  fetchExpenses: async () => {
    try {
      set({ loading: true, error: null });
      const [data, currency, categories] = await Promise.all([
        getExpenses(),
        getDefaultCurrency(),
        getExpenseCategories()
      ]);
      console.log('Fetched expenses:', currency);
      set({ 
        expenses: data, 
        defaultCurrency: currency, 
        categories: categories,
        initialized: true 
      });
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
      await Promise.all([
        useBudgetStore.getState().fetchSummary(),
        useInvestmentStore.getState().getPendingContributions(),
        useDebtStore.getState().fetchSummary()
      ]);
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

  fetchCategories: async () => {
    try {
      const categories = await getExpenseCategories();
      set({ categories });
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  },

  updateStatus: async (id: number, status: ExpenseStatus, paidDate?: string) => {
    try {
      set({ loading: true, error: null });
      await updateExpenseStatus(id, status, paidDate);
      
      // Fetch updated expenses
      const updatedExpenses = await getExpenses();
      set({ expenses: updatedExpenses });

      // Update related stores
      await Promise.all([
        useBudgetStore.getState().fetchSummary(),
        useDebtStore.getState().fetchSummary() // Add this line
      ]);
    } catch (error) {
      set({ error: 'Failed to update expense status' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
