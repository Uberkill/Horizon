import { describe, it, expect } from 'vitest';
import { calculateTax } from '../utils/taxEngine';

describe('Tax Engine Simulator', () => {
  it('should return 0 tax for income <= 20000', () => {
    const result = calculateTax(20000);
    expect(result.baselineTax).toBe(0);
    expect(result.optimizedTax).toBe(0);
    expect(result.taxSaved).toBe(0);
  });

  it('should calculate raw tax correctly for high incomes', () => {
    const result = calculateTax(150000);
    expect(result.baselineTax).toBeGreaterThan(0);
  });

  it('should apply SRS relief with 15300 cap', () => {
    const result = calculateTax(100000, 20000);
    expect(result.cappedSRS).toBe(15300);
    expect(result.baselineTax).toBeGreaterThan(result.optimizedTax);
    expect(result.taxSaved).toBeGreaterThan(0);
  });

  it('should apply mandatory CPF and dependent reliefs properly', () => {
    // 100k income, 0 SRS, 10000 dependents, 8000 CPF
    const result = calculateTax(100000, 0, 10000, 8000, 1000);
    // Chargeable income = 100000 - 10000 - 8000 - 1000 = 81000
    // Tax on 81k = 3350 + (1000 * 0.115) = 3465
    expect(result.optimizedTax).toBeLessThan(6000);
  });

  it('should cap total relief at 80000', () => {
    const result = calculateTax(200000, 50000, 50000, 20000, 1000);
    expect(result.cappedSRS).toBe(15300);
    // Baseline relief = 50000 + 20000 + 1000 = 71000
    // Total optimized = 71000 + 15300 = 86300 (capped at 80000)
    // Chargeable = 200000 - 80000 = 120000
    expect(result.optimizedTax).toBe(7950);
  });

  it('should not allow taxable income to fall below 0', () => {
    const result = calculateTax(10000, 15300, 8000);
    expect(result.optimizedTax).toBe(0);
    expect(result.baselineTax).toBe(0);
  });
});
