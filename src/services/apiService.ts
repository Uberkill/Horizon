/**
 * API Service Layer (Mock for MVP)
 */

export interface EconomicData {
  masCoreInflation: number;
  cpfOARate: number;
  optimizedPortfolioReturn: number;
  momMedianIncomes: Record<string, number>;
}

export interface TimeSeriesPoint {
  year: number;
  value: number;
  baseline?: number;
}

const MOM_2024_MEDIANS: Record<string, number> = {
  "15-19": 1170,
  "20-24": 3269,
  "25-29": 4680,
  "30-34": 5870,
  "35-39": 7049,
  "40-44": 7434,
  "45-49": 7498,
  "50-54": 6400,
  "55-59": 4731,
  "60+": 3052
};

export const apiService = {
  // Existing Micro Canvas Endpoints
  async fetchMacroIndicators(): Promise<{ inflation: number; cpfBase: number }> {
    return { inflation: 0.028, cpfBase: 0.025 };
  },

  async fetchDemographicData(): Promise<Record<string, number>> {
    return MOM_2024_MEDIANS;
  },

  async fetchMarketOptimizedReturn(): Promise<number> {
    return 0.065;
  },

  getMedianForAge(age: number, medians: Record<string, number>): number {
    if (!medians || Object.keys(medians).length === 0) return 0;
    if (age < 20) return medians["15-19"];
    if (age < 25) return medians["20-24"];
    if (age < 30) return medians["25-29"];
    if (age < 35) return medians["30-34"];
    if (age < 40) return medians["35-39"];
    if (age < 45) return medians["40-44"];
    if (age < 50) return medians["45-49"];
    if (age < 55) return medians["50-54"];
    if (age < 60) return medians["55-59"];
    return medians["60+"];
  },

  // NEW: Macro Dashboard Time-Series Endpoints (Mocking 20 years of data from 2004 to 2024)
  async fetchHistoricalInflationVsSavings(): Promise<TimeSeriesPoint[]> {
    const currentYear = 2024;
    const data: TimeSeriesPoint[] = [];
    let costOfLiving = 100000; // Base $100k
    let savings = 100000;
    
    // Simulating compounding inflation (~2.5% avg over 20 yrs, spiking recently) vs fixed 2.5% CPF
    for (let i = 20; i >= 0; i--) {
      const year = currentYear - i;
      // Fake historical inflation: slow till 2021, spikes after
      let infRate = 0.015; 
      if (year >= 2021) infRate = 0.045; // Post-COVID spike
      if (year === 2024) infRate = 0.028;

      if (i < 20) {
        costOfLiving = costOfLiving * (1 + infRate);
        savings = savings * 1.025; // CPF OA
      }
      
      data.push({ year, value: Math.round(costOfLiving), baseline: Math.round(savings) });
    }
    return data;
  },

  async fetchHistoricalHousingIndex(): Promise<TimeSeriesPoint[]> {
    const currentYear = 2024;
    const data: TimeSeriesPoint[] = [];
    let indexValue = 80;
    
    for (let i = 20; i >= 0; i--) {
      const year = currentYear - i;
      // Housing index growth simulation
      let growth = 0.03;
      if (year > 2008 && year < 2013) growth = 0.08; // Boom
      if (year > 2013 && year < 2018) growth = -0.01; // Cooling measures
      if (year >= 2020) growth = 0.09; // Post-COVID boom
      
      if (i < 20) {
        indexValue = indexValue * (1 + growth);
      }
      data.push({ year, value: Math.round(indexValue) });
    }
    return data;
  }
};
