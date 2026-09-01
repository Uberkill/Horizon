import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProposalView } from '../components/ProposalView';
import { useStore } from '../store/useStore';

describe('ProposalView Component', () => {
  beforeEach(() => {
    useStore.setState({ 
      clientData: { clientName: 'Test Client', currentAge: 30, targetRetirementAge: 65, monthlyIncome: 10000, monthlyExpenses: 5000, cashInBank: 50000, cpfOABalance: 100000, totalDebt: 0 },
      hasShieldPlan: true,
      hasCIPlan: true,
      premiumEndowment: 500,
      premiumILP: 500,
      premiumAnnuity: 500,
      premiumSRS: 500
    });
  });

  it('renders correctly with client data', () => {
    render(<ProposalView />);
    expect(screen.getByText('Prepared for: Test Client')).toBeInTheDocument();
    expect(screen.getByText('Protection Portfolio')).toBeInTheDocument();
    expect(screen.getByText('Wealth Vehicles')).toBeInTheDocument();
  });

  it('renders default if no client name', () => {
    useStore.setState({ clientData: { ...useStore.getState().clientData, clientName: '' } });
    render(<ProposalView />);
    expect(screen.getByText('Prepared for: Valued Client')).toBeInTheDocument();
  });
});
