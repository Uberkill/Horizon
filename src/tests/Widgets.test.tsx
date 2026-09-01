import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Widgets } from '../components/Widgets';
import { useStore } from '../store/useStore';

describe('Widgets Component', () => {
  beforeEach(() => {
    useStore.setState({ 
      clientData: { clientName: 'Test', age: 30, targetAge: 65, monthlyIncome: 10000, monthlyExpenses: 5000, cash: 50000, cpfOA: 100000, totalDebt: 0, dependentReliefs: 0 },
      stressTests: { medicalEmergency: false, covidCrash: false, sustainedInflation: false },
      economicData: { momMedianIncomes: { '30-34': 5000 }, masCoreInflation: 0, cpfOARate: 0, optimizedPortfolioReturn: 0 }
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
