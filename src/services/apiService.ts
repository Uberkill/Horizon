/**
 * API Service Layer (Mock for MVP)
 * 
 * In production, these functions will be replaced with fetch() calls
 * to a backend proxy (e.g., Cloudflare Worker) which securely holds
 * the MAS and SingStat API keys.
 */

export interface EconomicData {
  masCoreInflation: number;
  cpfOARate: number;
  optimizedPortfolioReturn: number;
  momMedianIncomes: Record<string, number>;
}

// Hardcoded empirical data from Singapore (2024 data)
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
  /**
   * Mocks a call to the MAS API for Core Inflation and CPF interest rates.
   */
  async fetchMacroIndicators(): Promise<{ inflation: number; cpfBase: number }> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      inflation: 0.028, // MAS 2024 Core Inflation
      cpfBase: 0.025    // CPF OA Floor
    };
  },

  /**
   * Mocks a call to the SingStat API for MOM Household Income data.
   */
  async fetchDemographicData(): Promise<Record<string, number>> {
    await new Promise(resolve => setTimeout(resolve, 600));
    return MOM_2024_MEDIANS;
  },

  /**
   * Mocks a call to an aggregate market index tracker (e.g. MSCI World proxy).
   */
  async fetchMarketOptimizedReturn(): Promise<number> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return 0.065; // 6.5% long-term conservative proxy
  },

  /**
   * Helper function to get the median for a specific age.
   */
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
  }
};
