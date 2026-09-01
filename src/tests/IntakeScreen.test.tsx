import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { IntakeScreen } from '../components/IntakeScreen';
import { useStore } from '../store/useStore';

describe('IntakeScreen Component', () => {
  beforeEach(() => {
    useStore.setState({ isDrawerOpen: true });
  });

  it('renders correctly', () => {
    render(<IntakeScreen />);
    expect(screen.getByText('Portfolio Architect')).toBeInTheDocument();
  });

  it('renders life events section', () => {
    render(<IntakeScreen />);
    expect(screen.getByText(/Life Events \(Drawdowns\)/)).toBeInTheDocument();
  });

  it('adds a life event when clicking add', () => {
    render(<IntakeScreen />);
    
    // First expand the pill
    const toggleBtn = screen.getByText(/Life Events \(Drawdowns\)/);
    fireEvent.click(toggleBtn);

    const addBtn = screen.getByText('+ Add Major Expense');
    fireEvent.click(addBtn);
    expect(useStore.getState().lifeEvents.length).toBe(1);
    expect(useStore.getState().lifeEvents[0].label).toBe('Wedding / BTO');
  });
});
