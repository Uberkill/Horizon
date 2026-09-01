import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Widgets } from '../components/Widgets';
import { useStore } from '../store/useStore';

describe('Widgets Component', () => {
  beforeEach(() => {
    useStore.setState({ 
      clientData: { clientName: 'Test', currentAge: 30, targetRetirementAge: 65, monthlyIncome: 10000, monthlyExpenses: 5000, cashInBank: 50000, cpfOABalance: 100000, totalDebt: 0 },
      stressTests: { medicalEmergency: false, covidCrash: false, sustainedInflation: false },
      economicData: { momMedianIncomes: [{ ageGroup: '30-34', medianIncome: 5000 }], masCoreInflation: 0, cpfOARate: 0, optimizedPortfolioReturn: 0 }
    });
  });

  it('renders stress tests', () => {
    render(<Widgets />);
    expect(screen.getByText('Medical Emergency')).toBeInTheDocument();
    expect(screen.getByText('Market Crash')).toBeInTheDocument();
    expect(screen.getByText('Inflation')).toBeInTheDocument();
  });

  it('toggles a stress test', () => {
    render(<Widgets />);
    const toggle = screen.getByText('Medical Emergency');
    fireEvent.click(toggle);
    expect(useStore.getState().stressTests.medicalEmergency).toBe(true);
  });

  it('renders percentile correctly', () => {
    render(<Widgets />);
    expect(screen.getByText(/Top/)).toBeInTheDocument();
  });
});
