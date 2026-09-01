import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../App';
import { Layout } from '../components/Layout';
import { Navbar } from '../components/Navbar';
import { IntakeScreen } from '../components/IntakeScreen';
import { LifeCanvas } from '../components/LifeCanvas';
import { ProtectionHUD } from '../components/ProtectionHUD';
import { Widgets } from '../components/Widgets';
import { PlanningForm } from '../components/PlanningForm';

// Mock ResizeObserver for Recharts
globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('Component Smoke Tests', () => {
  it('renders Layout without crashing', () => {
    const { container } = render(<Layout><div data-testid="child">Child</div></Layout>);
    expect(container).toBeTruthy();
  });

  it('renders Navbar without crashing', () => {
    const { container } = render(<Navbar />);
    expect(container).toBeTruthy();
  });

  it('renders IntakeScreen without crashing', () => {
    const { container } = render(<IntakeScreen />);
    expect(container).toBeTruthy();
  });

  it('renders LifeCanvas without crashing', () => {
    const { container } = render(<LifeCanvas />);
    expect(container).toBeTruthy();
  });

  it('renders ProtectionHUD without crashing', () => {
    const { container } = render(<ProtectionHUD />);
    expect(container).toBeTruthy();
  });

  it('renders Widgets without crashing', () => {
    const { container } = render(<Widgets />);
    expect(container).toBeTruthy();
  });

  it('renders PlanningForm without crashing', () => {
    const { container } = render(<PlanningForm />);
    expect(container).toBeTruthy();
  });

  it('renders App without crashing', () => {
    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });
});
