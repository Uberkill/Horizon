import { create } from 'zustand';

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
}));
