import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useStore } from '../store/useStore';
import { apiService } from '../services/apiService';

// Mock the API Service
vi.mock('../services/apiService', () => ({
  apiService: {
    fetchMacroIndicators: vi.fn(),
    fetchDemographicData: vi.fn(),
    fetchMarketOptimizedReturn: vi.fn()
  }
}));

describe('useStore', () => {
  // Store Reset Strategy
  const initialState = useStore.getState();
  
  beforeEach(() => {
    useStore.setState(initialState, true);
    vi.clearAllMocks();
  });

  it('should update view mode correctly', () => {
    useStore.getState().setViewMode('macro');
    expect(useStore.getState().viewMode).toBe('macro');
  });

  it('should update drawer state', () => {
    useStore.getState().setDrawerOpen(true);
    expect(useStore.getState().isDrawerOpen).toBe(true);
  });

  it('should update client demographics', () => {
    useStore.getState().setClientData({ age: 35, cash: 100000, monthlyExpenses: 5000 });
    const state = useStore.getState();
    expect(state.clientData.age).toBe(35);
    expect(state.clientData.cash).toBe(100000);
    expect(state.clientData.monthlyExpenses).toBe(5000);
  });

  it('should toggle stress tests', () => {
    expect(useStore.getState().stressTests.covidCrash).toBe(false);
    
    useStore.getState().toggleStressTest('covidCrash');
    expect(useStore.getState().stressTests.covidCrash).toBe(true);
    
    useStore.getState().toggleStressTest('covidCrash');
    expect(useStore.getState().stressTests.covidCrash).toBe(false);
  });

  it('should set product portfolio values', () => {
    const store = useStore.getState();
    store.setHasShieldPlan(true);
    store.setHasCIPlan(true);
    store.setPremiumEndowment(1000);
    store.setPremiumILP(2000);
    store.setPremiumAnnuity(500);
    store.setPremiumSRS(300);

    const updated = useStore.getState();
    expect(updated.hasShieldPlan).toBe(true);
    expect(updated.hasCIPlan).toBe(true);
    expect(updated.premiumEndowment).toBe(1000);
    expect(updated.premiumILP).toBe(2000);
    expect(updated.premiumAnnuity).toBe(500);
    expect(updated.premiumSRS).toBe(300);
  });

  it('should reset client state and portfolio entirely', () => {
    const store = useStore.getState();
    store.setClientData({ cash: 50000 });
    store.toggleStressTest('medicalEmergency');
    store.setPremiumILP(1000);
    
    store.resetClient();
    
    const reset = useStore.getState();
    expect(reset.clientData.cash).toBe(0);
    expect(reset.stressTests.medicalEmergency).toBe(false);
    expect(reset.premiumILP).toBe(0);
  });

  it('should successfully initialize economic data from apiService', async () => {
    vi.mocked(apiService.fetchMacroIndicators).mockResolvedValue({ inflation: 0.03, cpfBase: 0.025 });
    vi.mocked(apiService.fetchDemographicData).mockResolvedValue({ '30-34': 6000 });
    vi.mocked(apiService.fetchMarketOptimizedReturn).mockResolvedValue(0.07);

    const promise = useStore.getState().initializeData();
    expect(useStore.getState().isLoadingData).toBe(true);
    
    await promise;
    
    const state = useStore.getState();
    expect(state.isLoadingData).toBe(false);
    expect(state.economicData).toEqual({
      masCoreInflation: 0.03,
      cpfOARate: 0.025,
      momMedianIncomes: { '30-34': 6000 },
      optimizedPortfolioReturn: 0.07
    });
  });

  it('should handle API failure gracefully during initializeData', async () => {
    vi.mocked(apiService.fetchMacroIndicators).mockRejectedValue(new Error("Network Error"));
    
    // We suppress console.error just for this test so it doesn't clutter the test output
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    await useStore.getState().initializeData();
    
    const state = useStore.getState();
    expect(state.isLoadingData).toBe(false);
    expect(state.economicData).toBeNull(); // Should remain null or whatever the default was
    
    expect(consoleSpy).toHaveBeenCalledWith("Failed to fetch API data", expect.any(Error));
    consoleSpy.mockRestore();
  });
});
