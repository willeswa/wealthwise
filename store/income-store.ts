import { create } from 'zustand';
import { addIncome, deleteIncome, getIncomes } from '../utils/db/income';
import { getDefaultCurrency, setDefaultCurrency } from '../utils/db/utils/settings';
import { Income, IncomeInput } from '../utils/types/income';
import { useBudgetStore } from './budget-store';
import { useInvestmentStore } from './investment-store';

interface IncomeStore {
  incomes: Income[];
  loading: boolean;
  error: string | null;
  fetchIncomes: () => Promise<void>;
  addNewIncome: (income: IncomeInput) => Promise<void>;
  removeIncome: (id: number) => Promise<void>;
  initialized: boolean;
  defaultCurrency: string;
  setDefaultCurrency: (currency: string) => Promise<void>;
}

export const useIncomeStore = create<IncomeStore>((set) => ({
  incomes: [],
  loading: false,
  error: null,
  initialized: false,
  defaultCurrency: 'USD',

  fetchIncomes: async () => {
    try {
      set({ loading: true, error: null });
      const [data, currency] = await Promise.all([
        getIncomes(),
        getDefaultCurrency()
      ]);
      set({ 
        incomes: data, 
        defaultCurrency: currency, 
        initialized: true 
      });
    } catch (error) {
      set({ 
        error: 'Failed to fetch incomes', 
        initialized: false 
      });
      console.error('Error fetching incomes:', error);
    } finally {
      set({ loading: false });
    }
  },

  addNewIncome: async (incomeData) => {
    try {
      set({ loading: true, error: null });
      await addIncome(incomeData);
      const updatedIncomes = await getIncomes();
      set({ incomes: updatedIncomes });
      await Promise.all([
        useBudgetStore.getState().fetchSummary(),
        useInvestmentStore.getState().calculateAnalytics()
      ]);
    } catch (error) {
      set({ error: 'Failed to add income' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  removeIncome: async (id) => {
    try {
      set({ loading: true, error: null });
      await deleteIncome(id);
      const updatedIncomes = await getIncomes();
      set({ incomes: updatedIncomes });
      await Promise.all([
        useBudgetStore.getState().fetchSummary(),
        useInvestmentStore.getState().calculateAnalytics()
      ]);
    } catch (error) {
      set({ error: 'Failed to delete income' });
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
