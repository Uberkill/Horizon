import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { encryptData, decryptData } from '../utils/crypto';
import { apiService, type EconomicData } from '../services/apiService';
import { parsePartialClientData } from '../types/schemas';

const encryptedStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      const encrypted = localStorage.getItem(name);
      if (!encrypted) return null;
      const decrypted = await decryptData(encrypted);
      if (!decrypted) throw new Error('Decryption failed');
      return decrypted;
    } catch (error) {
      console.error('State decryption failed, clearing corrupted data.');
      localStorage.removeItem(name);
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      const encrypted = await encryptData(value);
      localStorage.setItem(name, encrypted);
    } catch (error) {
      console.error('State encryption failed', error);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    localStorage.removeItem(name);
  },
};

export interface ClientData {
  clientName: string;
  age: number;
  targetAge: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  cash: number;
  cpfOA: number;
  totalDebt: number;
  dependentReliefs: number;
}

interface AppState {
  hasStarted: boolean;
  setHasStarted: (v: boolean) => void;
  
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

  hudQueue: HUDEvent[];
  dispatchHUDEvent: (event: Omit<HUDEvent, 'id'>) => void;
  removeHUDEvent: (id: string) => void;

  viewMode: 'macro' | 'micro' | 'planning' | 'proposal' | 'vault';
  setViewMode: (mode: 'macro' | 'micro' | 'planning' | 'proposal' | 'vault') => void;
  economicData: EconomicData | null;
  isLoadingData: boolean;
  initializeData: () => Promise<void>;
  
  lifeEvents: Array<{ id: string; age: number; label: string; category: 'general' | 'housing'; costCash: number; costCPF: number }>;
  addLifeEvent: (event: Omit<AppState['lifeEvents'][0], 'id'>) => void;
  removeLifeEvent: (id: string) => void;
}

export interface HUDEvent {
  id: string;
  type: 'hit' | 'absorbed';
  message: string;
  severity: 'critical' | 'normal';
}

const initialClientData: ClientData = {
  clientName: "",
  age: 30,
  targetAge: 65,
  monthlyIncome: 0,
  monthlyExpenses: 0,
  cash: 0,
  cpfOA: 0,
  totalDebt: 0,
  dependentReliefs: 0,
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      hasStarted: false,
      setHasStarted: (v) => set({ hasStarted: v }),

      isDrawerOpen: false,
      setDrawerOpen: (isOpen) => set({ isDrawerOpen: isOpen }),
      
      clientData: initialClientData,
      
      setClientData: (data) => 
        set((state) => {
          // Strict Zod validation before merging into state
          const validatedUpdate = parsePartialClientData(data);
          return { clientData: { ...state.clientData, ...validatedUpdate } };
        }),
        
      resetClient: () => set({ 
        hasStarted: false,
        clientData: { ...initialClientData },
        stressTests: { covidCrash: false, sustainedInflation: false, medicalEmergency: false },
        hasShieldPlan: false,
        hasCIPlan: false,
        premiumEndowment: 0,
        premiumILP: 0,
        premiumAnnuity: 0,
        premiumSRS: 0,
        lifeEvents: [],
        hudQueue: []
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
      setPremiumEndowment: (v) => set({ premiumEndowment: Math.max(0, v || 0) }),

      premiumILP: 0,
      setPremiumILP: (v) => set({ premiumILP: Math.max(0, v || 0) }),

      premiumAnnuity: 0,
      setPremiumAnnuity: (v) => set({ premiumAnnuity: Math.max(0, v || 0) }),

      premiumSRS: 0,
      setPremiumSRS: (v) => set({ premiumSRS: Math.max(0, v || 0) }),
      
      lifeEvents: [],
      addLifeEvent: (event) => set((state) => ({
        lifeEvents: [...state.lifeEvents, { ...event, id: crypto.randomUUID() }]
      })),
      removeLifeEvent: (id) => set((state) => ({
        lifeEvents: state.lifeEvents.filter(e => e.id !== id)
      })),

      hudQueue: [],
      dispatchHUDEvent: (event) => set((state) => {
        const newEvent = { ...event, id: Date.now().toString() + Math.random().toString(36).substring(7) };
        const newQueue = [...state.hudQueue, newEvent].slice(-3);
        return { hudQueue: newQueue };
      }),
      removeHUDEvent: (id) => set((state) => ({
        hudQueue: state.hudQueue.filter(e => e.id !== id)
      })),

      viewMode: 'micro',
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
    }),
    {
      name: 'horizon-store',
      storage: createJSONStorage(() => encryptedStorage),
      // Don't persist ephemeral state like UI drawers, loading status, or hud events
      partialize: (state) => ({
        clientData: state.clientData,
        hasShieldPlan: state.hasShieldPlan,
        hasCIPlan: state.hasCIPlan,
        premiumEndowment: state.premiumEndowment,
        premiumILP: state.premiumILP,
        premiumAnnuity: state.premiumAnnuity,
        premiumSRS: state.premiumSRS
      }),
    }
  )
);
