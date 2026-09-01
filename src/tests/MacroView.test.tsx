import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MacroView } from '../components/MacroView';

describe('MacroView Component', () => {
  it('renders the sidebar and initial chart correctly', async () => {
    render(<MacroView />);
    
    // Use findByText to wait for the async data fetch to complete and state to settle
    expect(await screen.findByText('Intelligence Arsenal')).toBeInTheDocument();
    
    expect(screen.getByText('Economic Threats')).toBeInTheDocument();
    expect(screen.getByText('Lifestyle & Aspiration')).toBeInTheDocument();
    
    expect(screen.getAllByText('Wealth Erosion').length).toBeGreaterThan(0);
  });

  it('opens the Evidence Verifier modal when clicked', async () => {
    render(<MacroView />);
    
    // Wait for initial render to settle
    expect(await screen.findByText('Intelligence Arsenal')).toBeInTheDocument();
    
    const verifyButton = screen.getByText(/Verify Source/i);
    fireEvent.click(verifyButton);
    
    expect(await screen.findByText('Source Verification')).toBeInTheDocument();
    expect(screen.getByText('Official Government Data')).toBeInTheDocument();
  });
});
