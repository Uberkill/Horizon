import { describe, it, expect } from 'vitest';
import { calculateWealthTrajectory } from '../utils/mathEngine';
import type { ClientState, ProductPortfolio, StressTests, EconomicData } from '../utils/mathEngine';

describe('Math Engine (calculateWealthTrajectory)', () => {

  const baseClient: ClientState = {
    age: 30,
    targetAge: 60,
    monthlyIncome: 10000,
    monthlyExpenses: 5000,
    cash: 50000,
    cpfOA: 100000,
    totalDebt: 0
  };

  const basePortfolio: ProductPortfolio = {
    hasShieldPlan: false,
    hasCIPlan: false,
    premiumEndowment: 0,
    premiumILP: 0,
    premiumAnnuity: 0,
    premiumSRS: 0
  };

  const baseStress: StressTests = {
    medicalEmergency: false,
    covidCrash: false,
    sustainedInflation: false
  };

  const baseEcon: EconomicData = {
    masCoreInflation: 0.028,
    cpfOARate: 0.025,
    optimizedPortfolioReturn: 0.065
  };

  it('Test Case 1: The Broke Client Waterfall (Massive Debt + Forced ILP)', () => {
    const brokeClient = { ...baseClient, cash: 0, cpfOA: 0, totalDebt: 100000, monthlyIncome: 3000, monthlyExpenses: 3000 };
    const toxicPortfolio = { ...basePortfolio, premiumILP: 1000 };
    
    const result = calculateWealthTrajectory(brokeClient, toxicPortfolio, baseStress, baseEcon);
    const year1 = result[1]; 
    
    expect(year1.optInvestments).toBe(0); 
    expect(Math.abs(year1.optDebtDisplay)).toBeGreaterThan(100000); 
  });

  it('Test Case 2A: The Forcefield Mechanics (Medical Emergency NO Protection)', () => {
    const stress = { ...baseStress, medicalEmergency: true };
    const result = calculateWealthTrajectory(baseClient, basePortfolio, stress, baseEcon);
    
    const year1 = result[1];
    expect(year1.optCash).toBe(0);
    expect(Math.abs(year1.optDebtDisplay)).toBeGreaterThan(30000); 
  });

  it('Test Case 2B: The Forcefield Mechanics (Medical Emergency WITH Shield)', () => {
    const stress = { ...baseStress, medicalEmergency: true };
    const portfolio = { ...basePortfolio, hasShieldPlan: true };
    const result = calculateWealthTrajectory(baseClient, portfolio, stress, baseEcon);
    
    const year1 = result[1];
    expect(year1.optCash).toBeGreaterThan(80000);
    expect(Math.abs(year1.optDebtDisplay)).toBe(0); 
  });

  it('Test Case 2C: The Forcefield Mechanics (Medical Emergency WITH CI)', () => {
    const stress = { ...baseStress, medicalEmergency: true };
    const portfolio = { ...basePortfolio, hasCIPlan: true };
    const result = calculateWealthTrajectory(baseClient, portfolio, stress, baseEcon);
    
    const year1 = result[1];
    expect(year1.optCash).toBeGreaterThan(130000);
  });

  it('Test Case 3: The Covid Crash Isolation', () => {
    const stress = { ...baseStress, covidCrash: true };
    const portfolio = { ...basePortfolio, premiumILP: 1000, premiumEndowment: 1000 };
    
    const normalResult = calculateWealthTrajectory(baseClient, portfolio, baseStress, baseEcon);
    const crashResult = calculateWealthTrajectory(baseClient, portfolio, stress, baseEcon);
    
    const normalY1 = normalResult[1];
    const crashY1 = crashResult[1];
    
    expect(crashY1.optInvestments).toBeLessThan(normalY1.optInvestments);
    expect(crashY1.optEndowment).toBe(normalY1.optEndowment);
  });

  it('Test Case 4: Baseline Debt Clearance', () => {
    const client = { ...baseClient, cash: 0, totalDebt: 10000, monthlyIncome: 20000, monthlyExpenses: 5000 };
    const result = calculateWealthTrajectory(client, basePortfolio, baseStress, baseEcon);
    
    const year1 = result[1];
    expect(year1.baseline).toBeGreaterThan(0);
  });

  it('Test Case 5: Deficit drains Endowment', () => {
    const clientRetire = { ...baseClient, age: 50, targetAge: 52, cash: 0, cpfOA: 0, monthlyIncome: 20000, monthlyExpenses: 8000 };
    const port = { ...basePortfolio, premiumEndowment: 8000 }; 
    const result = calculateWealthTrajectory(clientRetire, port, baseStress, baseEcon);
    
    const year2 = result[2]; 
    expect(year2.optEndowment).toBeGreaterThan(0); 
    expect(year2.optEndowment).toBeLessThan(100000); 
  });

  it('Test Case 6: Inflation Stress', () => {
    const stress = { ...baseStress, sustainedInflation: true };
    const result = calculateWealthTrajectory(baseClient, basePortfolio, stress, baseEcon);
    const year1 = result[1];
    expect(year1.age).toBe(31);
  });

  it('Test Case 7: Missing Economic Data', () => {
    // Omitting baseEcon triggers the ?? defaults
    const result = calculateWealthTrajectory(baseClient, basePortfolio, baseStress);
    const year1 = result[1];
    expect(year1.age).toBe(31);
  });

  it('Test Case 8: Life Events Waterfall Liquidation', () => {
    // Let's create an event that forces a waterfall liquidation
    // We want deficit > optCash + optInvestments + optEndowment + optAnnuity + optSRS
    // So that we can cover the entire waterfall logic down to debt.
    const client = { ...baseClient, age: 30, targetAge: 40, cash: 10000, monthlyIncome: 5000, monthlyExpenses: 5000 };
    const portfolio = { ...basePortfolio, premiumILP: 100, premiumEndowment: 100, premiumAnnuity: 100, premiumSRS: 100 };
    // This will generate small balances for Investments, Endowment, Annuity, SRS in year 1.
    // We add an event at age 31 costing $1M.
    const events: any[] = [{ id: '1', age: 31, label: 'Massive Shock', category: 'general', costCash: 1000000, costCPF: 0 }];
    
    const result = calculateWealthTrajectory(client, portfolio, baseStress, baseEcon, events);
    
    const year1 = result[1]; // Age 31
    expect(year1.optCash).toBe(0);
    expect(year1.optInvestments).toBe(0);
    expect(year1.optEndowment).toBe(0);
    expect(year1.optAnnuity).toBe(0);
    expect(year1.optSRS).toBe(0);
    // The rest goes into debt (displayed as negative)
    expect(year1.optDebtDisplay).toBeLessThan(0);
    
    // Check that baseline also drops below zero and becomes debt
    expect(year1.baseline).toBeLessThan(0);
  });

});
