import { create } from 'zustand';
import { Investment, InvestmentInput, Contribution, ContributionInput, InvestmentType, InvestmentPerformance, PortfolioAnalytics, InvestmentInsight } from '../utils/types/investment';
import { addInvestment, deleteInvestment, getInvestments, addContribution, getContributions, getInvestmentTypes, updateInvestment, getInvestmentPerformance, getLatestInsights } from '../utils/db/investments';
import { analyzePortfolio } from '@/utils/investment-analytics';
import { getDatabase } from '@/utils/db/utils/setup';
import { useBudgetStore } from './budget-store';
import { getDefaultCurrency } from '../utils/db/utils/settings';

interface InvestmentStore {
  investments: Investment[];
  contributions: Contribution[];
  investmentTypes: InvestmentType[];
  loading: boolean;
  error: string | null;
  initialized: boolean;
  analytics: PortfolioAnalytics | null;
  performances: Record<number, InvestmentPerformance[]>;
  fetchInvestments: () => Promise<void>;
  fetchContributions: (investmentId: number) => Promise<void>;
  fetchInvestmentTypes: () => Promise<void>;
  addNewInvestment: (investment: InvestmentInput) => Promise<void>;
  addNewContribution: (contribution: ContributionInput) => Promise<void>;
  removeInvestment: (id: number) => Promise<void>;
  updateExistingInvestment: (id: number, investment: Partial<InvestmentInput>) => Promise<void>;
  calculateAnalytics: () => void;
  getPendingContributions: () => Promise<void>;
  defaultCurrency: string;
  insights: {
    daily: InvestmentInsight | null;
    weekly: InvestmentInsight[];
    loading: boolean;
    error: string | null;
  };
  fetchInsights: () => Promise<void>;
}

export const useInvestmentStore = create<InvestmentStore>((set, get) => ({
  investments: [],
  contributions: [],
  investmentTypes: [],
  loading: false,
  error: null,
  initialized: false,
  analytics: null,
  performances: {},
  defaultCurrency: 'USD',
  insights: {
    daily: null,
    weekly: [],
    loading: false,
    error: null
  },

  fetchInvestments: async () => {
    try {
      set({ loading: true, error: null });
      const [data, currency] = await Promise.all([
        getInvestments(),
        getDefaultCurrency()
      ]);
      
      // Initialize analytics with empty state if needed
      if (!get().analytics) {
        set({
          analytics: {
            bestPerforming: { name: '', return: 0 },
            worstPerforming: { name: '', return: 0 },
            riskAnalysis: {
              riskScore: 0,
              riskLevel: 'Medium',
              distribution: { low: 0, medium: 0, high: 0 }
            },
            recommendations: []
          }
        });
      }
      
      set({ 
        investments: data, 
        defaultCurrency: currency,
        initialized: true 
      });
      
      // Fetch performance data for each investment
      const performances: Record<number, InvestmentPerformance[]> = {};
      for (const inv of data) {
        const perfData = await getInvestmentPerformance(inv.id);
        performances[inv.id] = perfData;
      }
      set({ performances });
      
      // Update analytics after getting all data
      await get().getPendingContributions();
      get().calculateAnalytics();
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
      await Promise.all([
        get().fetchInvestments(),
        useBudgetStore.getState().fetchSummary()
      ]);
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
      await Promise.all([
        get().fetchContributions(contributionData.investment_id),
        useBudgetStore.getState().fetchSummary()
      ]);
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

  calculateAnalytics: () => {
    const { investments, performances } = get();
    if (investments.length > 0) {
      const analytics = analyzePortfolio(investments);
      set(state => ({
        analytics: {
          ...analytics,
          pendingContributions: state.analytics?.pendingContributions || []
        }
      }));
    }
  },

  getPendingContributions: async () => {
    try {
      const db = getDatabase();
      const pendingContributions = await db.getAllAsync(`
        SELECT 
          i.name as investmentName,
          e.amount,
          e.status,
          e.due_date as dueDate
        FROM expenses e
        JOIN investments i ON i.id = e.linked_item_id
        WHERE e.linked_item_type = 'investment'
        AND e.status = 'pending'
        ORDER BY e.due_date ASC
      `);

      if (!get().analytics) return;

      set(state => ({
        analytics: {
          ...state.analytics!,
          pendingContributions: pendingContributions.map((pc: any) => ({
            investmentName: pc.investmentName,
            amount: Number(pc.amount),
            status: pc.status,
            dueDate: pc.dueDate
          }))
        }
      }));
    } catch (error) {
      console.error('Error fetching pending contributions:', error);
    }
  },

  fetchInsights: async () => {
    try {
      set(state => ({ 
        insights: { 
          ...state.insights,
          loading: true, 
          error: null 
        } 
      }));
      
      const insights = await getLatestInsights();
      
      set(state => ({
        insights: {
          ...state.insights,
          daily: insights.daily,
          weekly: insights.weekly,
          loading: false
        }
      }));
    } catch (error) {
      set(state => ({
        insights: {
          ...state.insights,
          error: 'Failed to fetch investment insights',
          loading: false
        }
      }));
      console.error('Error fetching insights:', error);
    }
  }
}));
