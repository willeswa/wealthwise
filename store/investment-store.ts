import { create } from 'zustand';
import { Investment, InvestmentInput, Contribution, ContributionInput, InvestmentType } from '../utils/types/investment';
import { addInvestment, deleteInvestment, getInvestments, addContribution, getContributions, getInvestmentTypes, updateInvestment } from '../utils/db/investments';

interface InvestmentStore {
  investments: Investment[];
  contributions: Contribution[];
  investmentTypes: InvestmentType[];
  loading: boolean;
  error: string | null;
  initialized: boolean;
  
  fetchInvestments: () => Promise<void>;
  fetchContributions: (investmentId: number) => Promise<void>;
  fetchInvestmentTypes: () => Promise<void>;
  addNewInvestment: (investment: InvestmentInput) => Promise<void>;
  addNewContribution: (contribution: ContributionInput) => Promise<void>;
  removeInvestment: (id: number) => Promise<void>;
  updateExistingInvestment: (id: number, investment: Partial<InvestmentInput>) => Promise<void>;
}

export const useInvestmentStore = create<InvestmentStore>((set, get) => ({
  investments: [],
  contributions: [],
  investmentTypes: [],
  loading: false,
  error: null,
  initialized: false,

  fetchInvestments: async () => {
    try {
      set({ loading: true, error: null });
      const data = await getInvestments();
      set({ investments: data, initialized: true });
    } catch (error) {
      set({ error: 'Failed to fetch investments', initialized: false });
      console.error('Error fetching investments:', error);
    } finally {
      set({ loading: false });
    }
  },

  fetchContributions: async (investmentId: number) => {
    try {
      set({ loading: true, error: null });
      const data = await getContributions(investmentId);
      set({ contributions: data });
    } catch (error) {
      set({ error: 'Failed to fetch contributions' });
      console.error('Error fetching contributions:', error);
    } finally {
      set({ loading: false });
    }
  },

  fetchInvestmentTypes: async () => {
    try {
      set({ loading: true, error: null });
      const types = await getInvestmentTypes();
      set({ investmentTypes: types });
    } catch (error) {
      set({ error: 'Failed to fetch investment types' });
      console.error('Error fetching investment types:', error);
    } finally {
      set({ loading: false });
    }
  },

  addNewInvestment: async (investmentData) => {
    try {
      set({ loading: true, error: null });
      await addInvestment(investmentData);
      await get().fetchInvestments();
    } catch (error) {
      set({ error: 'Failed to add investment' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  addNewContribution: async (contributionData) => {
    try {
      set({ loading: true, error: null });
      await addContribution(contributionData);
      await get().fetchContributions(contributionData.investment_id);
    } catch (error) {
      set({ error: 'Failed to add contribution' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  removeInvestment: async (id) => {
    try {
      set({ loading: true, error: null });
      await deleteInvestment(id);
      await get().fetchInvestments();
    } catch (error) {
      set({ error: 'Failed to delete investment' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateExistingInvestment: async (id, investmentData) => {
    try {
      set({ loading: true, error: null });
      await updateInvestment(id, investmentData);
      await get().fetchInvestments();
    } catch (error) {
      set({ error: 'Failed to update investment' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
