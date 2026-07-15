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
    clientData: initialClientData,
    stressTests: { covidCrash: false, sustainedInflation: false, medicalEmergency: false }
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
          momMedianIncomes: demographic,
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
