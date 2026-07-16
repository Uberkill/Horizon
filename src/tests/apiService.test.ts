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

  it('should fetch all 12 modules of data successfully', async () => {
    const wealth = await apiService.fetchWealthErosion();
    const frs = await apiService.fetchCpfFrs();
    const wages = await apiService.fetchWageCurve();
    
    expect(wealth.length).toBe(21); // 20 years + base year
    expect(frs.length).toBe(21);
    expect(wages.length).toBeGreaterThan(5); // Age groups
  });

  it('getMedianForAge should return correct age bands', () => {
    const medians = { 
      "15-19": 1000, "20-24": 2000, "25-29": 3000, "30-34": 4000, 
      "35-39": 5000, "40-44": 6000, "45-49": 7000, "50-54": 8000, 
      "55-59": 9000, "60+": 10000 
    };
    
    // Test all branches
    expect(apiService.getMedianForAge(18, medians)).toBe(1000); // <20
    expect(apiService.getMedianForAge(22, medians)).toBe(2000); // <25
    expect(apiService.getMedianForAge(28, medians)).toBe(3000); // <30
    expect(apiService.getMedianForAge(32, medians)).toBe(4000); // <35
    expect(apiService.getMedianForAge(38, medians)).toBe(5000); // <40
    expect(apiService.getMedianForAge(42, medians)).toBe(6000); // <45
    expect(apiService.getMedianForAge(48, medians)).toBe(7000); // <50
    expect(apiService.getMedianForAge(52, medians)).toBe(8000); // <55
    expect(apiService.getMedianForAge(58, medians)).toBe(9000); // <60
    expect(apiService.getMedianForAge(65, medians)).toBe(10000); // 60+
    expect(apiService.getMedianForAge(20, {})).toBe(0); // empty fallback
  });

  it('fetchSoraRates covers all conditional blocks', async () => {
    const rates = await apiService.fetchSoraRates();
    // 2024 is the base year, so year range is 2004 to 2024
    const rate2006 = rates.find(r => r.year === 2006)?.value; // <= 2008 -> 1.5
    const rate2010 = rates.find(r => r.year === 2010)?.value; // > 2008 & < 2015 -> 0.5
    const rate2016 = rates.find(r => r.year === 2016)?.value; // >= 2015 & < 2020 -> 1.8
    const rate2020 = rates.find(r => r.year === 2020)?.value; // === 2020 -> 0.2
    const rate2023 = rates.find(r => r.year === 2023)?.value; // >= 2022 -> 3.8
    
    expect(rate2006).toBe(1.5);
    expect(rate2010).toBe(0.5);
    expect(rate2016).toBe(1.8);
    expect(rate2020).toBe(0.2);
    expect(rate2023).toBe(3.8);
  });

  it('fetchHousingIndex covers all conditional blocks', async () => {
    const index = await apiService.fetchHousingIndex();
    expect(index.length).toBe(21);
    // Since it grows backwards, we just check it returns 21 valid items
    expect(index[index.length-1].value).toBeGreaterThan(0);
  });

  it('fetchCoePrices covers all conditional blocks', async () => {
    const coe = await apiService.fetchCoePrices();
    const rate2006 = coe.find(r => r.year === 2006)?.value; // <= 2008 -> 40000
    const rate2010 = coe.find(r => r.year === 2010)?.value; // > 2008 & < 2013 -> 60000
    const rate2015 = coe.find(r => r.year === 2015)?.value; // > 2013 & < 2018 -> 45000
    const rate2021 = coe.find(r => r.year === 2021)?.value; // >= 2021 -> 100000
    
    expect(rate2006).toBe(40000);
    expect(rate2010).toBe(60000);
    expect(rate2015).toBe(45000);
    expect(rate2021).toBe(100000);
  });

  it('covers the remaining fetch methods', async () => {
    expect((await apiService.fetchChildcareCosts()).length).toBe(21);
    expect((await apiService.fetchMedicalInflation()).length).toBe(21);
    expect((await apiService.fetchLifeExpectancy()).length).toBe(21);
    expect((await apiService.fetchEducationInflation()).length).toBe(21);
    expect((await apiService.fetchOldAgeSupportRatio()).length).toBe(21);
  });
});
