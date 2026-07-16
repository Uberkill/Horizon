import { describe, it, expect } from 'vitest';
import { calculateWealthTrajectory, ClientState, ProductPortfolio, StressTests, EconomicData } from '../utils/mathEngine';

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
    expect(Math.abs(year1.optDebtDisplay)).toBe(104000); 
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
    expect(year1.optCash).toBeGreaterThan(100000);
    expect(Math.abs(year1.optDebtDisplay)).toBe(0); 
  });

  it('Test Case 2C: The Forcefield Mechanics (Medical Emergency WITH CI)', () => {
    const stress = { ...baseStress, medicalEmergency: true };
    const portfolio = { ...basePortfolio, hasCIPlan: true };
    const result = calculateWealthTrajectory(baseClient, portfolio, stress, baseEcon);
    
    const year1 = result[1];
    expect(year1.optCash).toBeGreaterThan(150000);
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

});
