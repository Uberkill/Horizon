import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import { PlanningForm } from '../components/PlanningForm';
import { useStore } from '../store/useStore';

describe('PlanningForm Interactivity & Saving', () => {
  beforeEach(() => {
    useStore.getState().resetClient();
  });

  it('updates local state on input change', () => {
    render(<PlanningForm />);
    
    // Find the current age input (default is 30 from store)
    const ageInput = screen.getByDisplayValue('30') as HTMLInputElement;
    expect(ageInput).toBeTruthy();
    
    // Simulate user typing
    fireEvent.change(ageInput, { target: { name: 'age', value: '31' } });
    
    // Assert value changed in the DOM
    expect(ageInput.value).toBe('31');
  });

  it('saves data to the global store on submit', () => {
    render(<PlanningForm />);
    
    const nameInput = screen.getByPlaceholderText('e.g. John Doe');
    const incomeInput = screen.getAllByRole('spinbutton').find(el => el.getAttribute('name') === 'monthlyIncome');
    
    fireEvent.change(nameInput, { target: { name: 'clientName', value: 'Alice' } });
    fireEvent.change(incomeInput!, { target: { name: 'monthlyIncome', value: '12000' } });
    
    const saveBtn = screen.getByText('Save & Generate');
    fireEvent.click(saveBtn);
    
    // Check if the store was actually updated
    const storeState = useStore.getState();
    expect(storeState.clientData.clientName).toBe('Alice');
    expect(storeState.clientData.monthlyIncome).toBe(12000);
    expect(storeState.viewMode).toBe('micro');
  });

  it('triggers JSON export without crashing', () => {
    // Spy on the click method of HTMLAnchorElement
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    render(<PlanningForm />);
    
    const exportBtn = screen.getByTitle('Download JSON Draft');
    fireEvent.click(exportBtn);
    
    expect(clickSpy).toHaveBeenCalled();
    
    // Cleanup
    clickSpy.mockRestore();
  });
});
