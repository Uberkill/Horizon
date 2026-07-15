import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MacroView } from '../components/MacroView';

describe('MacroView Component', () => {
  it('renders the sidebar and initial chart correctly', () => {
    render(<MacroView />);
    
    expect(screen.getByText('Intelligence Arsenal')).toBeInTheDocument();
    
    // CSS handles uppercase, actual text node is title case
    expect(screen.getByText('Economic Threats')).toBeInTheDocument();
    expect(screen.getByText('Lifestyle & Aspiration')).toBeInTheDocument();
    
    // Because 'Wealth Erosion' appears in both the sidebar button and the chart title, we use getAllByText
    expect(screen.getAllByText('Wealth Erosion').length).toBeGreaterThan(0);
  });

  it('opens the Evidence Verifier modal when clicked', () => {
    render(<MacroView />);
    
    const verifyButton = screen.getByText(/Verify Source/i);
    fireEvent.click(verifyButton);
    
    expect(screen.getByText('Source Verification')).toBeInTheDocument();
    expect(screen.getByText('Official Government Data')).toBeInTheDocument();
  });
});
