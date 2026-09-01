import { describe, it, expect } from 'vitest';
import { parsePartialClientData, clientDataSchema } from '../types/schemas';

describe('Zod Validation and Anti-Corruption', () => {
  it('should parse valid client data successfully', () => {
    const validData = {
      age: 35,
      targetAge: 65,
      monthlyIncome: 10000,
      monthlyExpenses: 5000,
      cash: 50000,
      cpfOA: 100000,
      totalDebt: 20000
    };
    
    const result = clientDataSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should catch negative numbers and coerce to 0 via safeNumber', () => {
    const invalidData = {
      monthlyIncome: -5000, // Invalid
      cash: -100 // Invalid
    };
    
    const result = parsePartialClientData(invalidData);
    
    // safeParse should catch the error and coerce to 0
    expect(result).toEqual({ monthlyIncome: 0, cash: 0 });
  });

  it('should prevent NaN from propagating to the store', () => {
    const invalidData = {
      age: NaN,
      monthlyIncome: NaN
    };
    
    const result = parsePartialClientData(invalidData);
    // Age has a catch of 30, monthlyIncome has a catch of 0
    expect(result).toEqual({ age: 30, monthlyIncome: 0 });
  });

  it('should allow valid partial updates', () => {
    const validPartial = {
      age: 40,
      cash: 150000
    };
    
    const result = parsePartialClientData(validPartial);
    expect(result).toEqual({ age: 40, cash: 150000 });
  });
});
