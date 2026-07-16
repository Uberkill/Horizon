import { create } from 'zustand';
import { apiService, type EconomicData } from '../services/apiService';

export interface ClientData {
  age: number;
  targetAge: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  cash: number;
  cpfOA: number;
  totalDebt: number;
}

interface AppState {
  clientData: ClientData;
  setClientData: (data: Partial<ClientData>) => void;
  resetClient: () => void;
  isDrawerOpen: boolean;
  setDrawerOpen: (isOpen: boolean) => void;
  
  stressTests: {
    covidCrash: boolean;
    sustainedInflation: boolean;
    medicalEmergency: boolean;
  };
  toggleStressTest: (test: keyof AppState['stressTests']) => void;

  hasShieldPlan: boolean;
  setHasShieldPlan: (v: boolean) => void;
  
  hasCIPlan: boolean;
  setHasCIPlan: (v: boolean) => void;

  premiumEndowment: number;
  setPremiumEndowment: (v: number) => void;

  premiumILP: number;
  setPremiumILP: (v: number) => void;

  premiumAnnuity: number;
  setPremiumAnnuity: (v: number) => void;

  premiumSRS: number;
  setPremiumSRS: (v: number) => void;

  // New API and Macro/Micro State
  viewMode: 'macro' | 'micro';
  setViewMode: (mode: 'macro' | 'micro') => void;
  economicData: EconomicData | null;
  isLoadingData: boolean;
  initializeData: () => Promise<void>;
}

const initialClientData: ClientData = {
  age: 30,
  targetAge: 65,
  monthlyIncome: 0,
  monthlyExpenses: 0,
  cash: 0,
  cpfOA: 0,
  totalDebt: 0,
};

export const useStore = create<AppState>((set) => ({
  isDrawerOpen: false,
  setDrawerOpen: (isOpen) => set({ isDrawerOpen: isOpen }),
  
  clientData: initialClientData,
  
  setClientData: (data) => 
    set((state) => ({ 
      clientData: { ...state.clientData, ...data } 
    })),
    
  resetClient: () => set({ 
    clientData: { ...initialClientData },
    stressTests: { covidCrash: false, sustainedInflation: false, medicalEmergency: false },
    hasShieldPlan: false,
    hasCIPlan: false,
    premiumEndowment: 0,
    premiumILP: 0,
    premiumAnnuity: 0,
    premiumSRS: 0
  }),
  
  stressTests: {
    covidCrash: false,
    sustainedInflation: false,
    medicalEmergency: false,
  },
  
  toggleStressTest: (test) =>
    set((state) => ({
      stressTests: {
        ...state.stressTests,
        [test]: !state.stressTests[test]
      }
    })),

  hasShieldPlan: false,
  setHasShieldPlan: (v) => set({ hasShieldPlan: v }),
  
  hasCIPlan: false,
  setHasCIPlan: (v) => set({ hasCIPlan: v }),

  premiumEndowment: 0,
  setPremiumEndowment: (v) => set({ premiumEndowment: v }),

  premiumILP: 0,
  setPremiumILP: (v) => set({ premiumILP: v }),

  premiumAnnuity: 0,
  setPremiumAnnuity: (v) => set({ premiumAnnuity: v }),

  premiumSRS: 0,
  setPremiumSRS: (v) => set({ premiumSRS: v }),

  viewMode: 'micro', // default to client pitch view
  setViewMode: (mode) => set({ viewMode: mode }),
  
  economicData: null,
  isLoadingData: true,
  initializeData: async () => {
    set({ isLoadingData: true });
    try {
      const [macro, demographic, optimized] = await Promise.all([
        apiService.fetchMacroIndicators(),
        apiService.fetchDemographicData(),
        apiService.fetchMarketOptimizedReturn()
      ]);
      
      set({
        economicData: {
          masCoreInflation: macro.inflation,
          cpfOARate: macro.cpfBase,
          momMedianIncomes: { ...demographic },
          optimizedPortfolioReturn: optimized
        },
        isLoadingData: false
      });
    } catch (error) {
      console.error("Failed to fetch API data", error);
      set({ isLoadingData: false });
    }
  }
}));
