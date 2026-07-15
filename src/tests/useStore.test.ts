import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from '../store/useStore';

describe('useStore', () => {
  // Subagent Fix: Reset Zustand state before every test to prevent bleed-over
  beforeEach(() => {
    useStore.setState({
      viewMode: 'macro',
      clientData: {
        age: 30,
        targetAge: 65,
        monthlyIncome: 10000,
        monthlyExpenses: 4000,
        cash: 50000,
        cpfOA: 100000,
        totalDebt: 0
      },
      stressTests: {
        covidCrash: false,
        sustainedInflation: false,
        medicalEmergency: false
      },
      economicData: {
        masCoreInflation: 0.028,
        cpfOARate: 0.025,
        optimizedPortfolioReturn: 0.065,
        momMedianIncomes: {}
      }
    });
  });

  it('should start with macro view mode (based on mock state)', () => {
    expect(useStore.getState().viewMode).toBe('macro');
  });

  it('should update view mode correctly', () => {
    useStore.getState().setViewMode('micro');
    expect(useStore.getState().viewMode).toBe('micro');
  });

  it('should update client demographics', () => {
    useStore.getState().setClientData({ age: 35, cash: 100000, monthlyExpenses: 5000 });
    const state = useStore.getState();
    expect(state.clientData.age).toBe(35);
    expect(state.clientData.cash).toBe(100000);
    expect(state.clientData.monthlyExpenses).toBe(5000);
  });
});
