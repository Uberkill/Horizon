import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WelcomeScreen } from '../components/WelcomeScreen';
import { useStore } from '../store/useStore';

describe('WelcomeScreen Component', () => {
  beforeEach(() => {
    // Reset store before each test
    useStore.setState({ 
      hasStarted: false, 
      clientData: { clientName: '', age: 30, targetAge: 65, monthlyIncome: 0, monthlyExpenses: 0, cash: 0, cpfOA: 0, totalDebt: 0, dependentReliefs: 0 },
      isDrawerOpen: false,
      viewMode: 'macro'
    });
  });

  it('renders correctly', () => {
    render(<WelcomeScreen />);
    expect(screen.getByPlaceholderText('Who are we planning for today?')).toBeInTheDocument();
  });

  it('handles name input and start button', () => {
    render(<WelcomeScreen />);
    const input = screen.getByPlaceholderText('Who are we planning for today?');
    fireEvent.change(input, { target: { value: 'Alice' } });
    
    const startBtn = screen.getByText('Start Planning');
    fireEvent.click(startBtn);

    const state = useStore.getState();
    expect(state.clientData.clientName).toBe('Alice');
    expect(state.hasStarted).toBe(true);
    expect(state.viewMode).toBe('planning');
    expect(state.isDrawerOpen).toBe(false);
  });

  it('handles skip button', () => {
    render(<WelcomeScreen />);
    const skipBtn = screen.getByText('Skip for now');
    fireEvent.click(skipBtn);

    const state = useStore.getState();
    expect(state.clientData.clientName).toBe('');
    expect(state.hasStarted).toBe(true);
    expect(state.viewMode).toBe('planning');
    expect(state.isDrawerOpen).toBe(false);
  });
});
