import { describe, it, expect } from 'vitest';
import { apiService } from '../services/apiService';

describe('apiService', () => {
  it('should generate correctly structured time series data', async () => {
    const data = await apiService.fetchFoodInflation();
    expect(data).toBeDefined();
    expect(data.length).toBeGreaterThan(0);
    expect(data[0]).toHaveProperty('year');
    expect(data[0]).toHaveProperty('value');
  });

  it('should fetch 12 modules of data successfully', async () => {
    const wealth = await apiService.fetchWealthErosion();
    const frs = await apiService.fetchCpfFrs();
    const wages = await apiService.fetchWageCurve();
    
    expect(wealth.length).toBe(21); // 20 years + base year
    expect(frs.length).toBe(21);
    expect(wages.length).toBeGreaterThan(5); // Age groups
  });

  it('getMedianForAge should return correct age bands', () => {
    const medians = { "15-19": 1000, "20-24": 2000, "25-29": 3000 };
    expect(apiService.getMedianForAge(18, medians)).toBe(1000);
    expect(apiService.getMedianForAge(22, medians)).toBe(2000);
    expect(apiService.getMedianForAge(28, medians)).toBe(3000);
  });
});
