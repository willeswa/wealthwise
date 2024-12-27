import { create } from 'zustand';
import { Debt, DebtInput, DebtSummary } from '../utils/types/debt';
import { addDebt, getDebts, getDebtSummary, getDebtWithRepayments, markDebtAsPaidOff, deleteDebtWithRelated } from '../utils/db/debt';
import { useBudgetStore } from './budget-store';
import { calculatePaymentSchedule } from '../utils/calculations/debt';
import { useExpenseStore } from './expense-store';

interface DebtStore {
  debts: Debt[];
  summary: DebtSummary | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  fetchDebts: () => Promise<void>;
  fetchSummary: () => Promise<void>;
  addNewDebt: (debt: DebtInput) => Promise<void>;
  calculateNextPayment: (debtId: number) => any | null;
  refresh: () => Promise<void>;
  markAsPaidOff: (debtId: number) => Promise<void>;
  deleteDebt: (debtId: number) => Promise<void>;
}

export const useDebtStore = create<DebtStore>((set, get) => ({
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
      
      // Debug logs
      
      if (summary.debts.length > 0) {
        const calculatedDebts = await Promise.all(summary.debts.map(async (debt) => {
          const debtWithRepayments = await getDebtWithRepayments(debt.id!);
          
          const schedule = calculatePaymentSchedule({
            ...debt,
            remaining_amount: debtWithRepayments.remaining_amount
          });
          
          return {
            ...debtWithRepayments,
            calculatedPayment: schedule
          };
        }));

        const totalOutstanding = calculatedDebts.reduce((sum, d) => sum + d.remaining_amount, 0);

        set({
          summary: {
            ...summary,
            debts: calculatedDebts,
            totalOutstanding
          }
        });
      } else {
        set({ summary });
      }
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
        useDebtStore.getState().fetchSummary(),
        useBudgetStore.getState().fetchSummary(),
      ]);
    } catch (error) {
      set({ error: 'Failed to add debt' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  calculateNextPayment: (debtId: number) => {
    const debt = get().debts.find(d => d.id === debtId);
    if (!debt) return null;
    return calculatePaymentSchedule(debt);
  },

  refresh: async () => {
    try {
      const [debts, summary] = await Promise.all([
        getDebts(),
        getDebtSummary()
      ]);

      if (summary.debts.length > 0) {
        const calculatedDebts = await Promise.all(
          summary.debts.map(async (debt) => {
            const debtWithRepayments = await getDebtWithRepayments(debt.id!);
            return {
              ...debtWithRepayments,
              calculatedPayment: calculatePaymentSchedule({
                ...debt,
                remaining_amount: debtWithRepayments.remaining_amount
              })
            };
          })
        );

        set({
          debts,
          summary: {
            ...summary,
            debts: calculatedDebts,
            totalOutstanding: calculatedDebts.reduce((sum, d) => sum + d.remaining_amount, 0)
          },
          initialized: true
        });
      } else {
        set({ debts, summary, initialized: true });
      }
    } catch (error) {
      console.error('Error refreshing debt store:', error);
    }
  },

  markAsPaidOff: async (debtId: number) => {
    try {
      set({ loading: true, error: null });
      await markDebtAsPaidOff(debtId);
      
      // Refresh all relevant data
      await Promise.all([
        get().refresh(),
        useExpenseStore.getState().fetchExpenses(),
        useBudgetStore.getState().fetchSummary()
      ]);
    } catch (error) {
      set({ error: 'Failed to mark debt as paid off' });
      console.error('Error marking debt as paid off:', error);
    } finally {
      set({ loading: false });
    }
  },

  deleteDebt: async (debtId: number) => {
    try {
      set({ loading: true, error: null });
      await deleteDebtWithRelated(debtId);
      
      // Refresh all relevant data
      await Promise.all([
        get().refresh(),
        useExpenseStore.getState().fetchExpenses(),
        useBudgetStore.getState().fetchSummary()
      ]);
    } catch (error) {
      set({ error: 'Failed to delete debt' });
      console.error('Error deleting debt:', error);
    } finally {
      set({ loading: false });
    }
  },
}));
