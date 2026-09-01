import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Navbar } from '../components/Navbar';
import { useStore } from '../store/useStore';

describe('Navbar Component', () => {
  beforeEach(() => {
    useStore.setState({ 
      hasStarted: true,
      viewMode: 'micro',
      isDrawerOpen: true 
    });
  });

  it('renders title', () => {
    render(<Navbar />);
    expect(screen.getByText('Horizon')).toBeInTheDocument();
  });

  it('navigating to Vault closes the drawer', () => {
    render(<Navbar />);
    const vaultBtn = screen.getByTitle('Local Vault');
    fireEvent.click(vaultBtn);
    
    expect(useStore.getState().viewMode).toBe('vault');
    expect(useStore.getState().isDrawerOpen).toBe(false);
  });

  it('navigating to Micro Canvas keeps drawer unchanged', () => {
    useStore.setState({ isDrawerOpen: true, viewMode: 'macro' });
    render(<Navbar />);
    const microBtn = screen.getByTitle('Micro Canvas');
    fireEvent.click(microBtn);
    
    expect(useStore.getState().viewMode).toBe('micro');
    expect(useStore.getState().isDrawerOpen).toBe(true);
  });
});
