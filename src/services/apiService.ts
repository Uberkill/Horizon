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
  year: number | string;
  value: number;
  baseline?: number;
}

const MOM_2024_MEDIANS: Record<string, number> = {
  "15-19": 1170, "20-24": 3269, "25-29": 4680, "30-34": 5870,
  "35-39": 7049, "40-44": 7434, "45-49": 7498, "50-54": 6400,
  "55-59": 4731, "60+": 3052
};

export const apiService = {
  // --- Micro Canvas Core ---
  async fetchMacroIndicators() { return { inflation: 0.028, cpfBase: 0.025 }; },
  async fetchDemographicData() { return MOM_2024_MEDIANS; },
  async fetchMarketOptimizedReturn() { return 0.065; },
  getMedianForAge(age: number, medians: Record<string, number>) {
    if (!medians || Object.keys(medians).length === 0) return 0;
    if (age < 20) return medians["15-19"]; if (age < 25) return medians["20-24"];
    if (age < 30) return medians["25-29"]; if (age < 35) return medians["30-34"];
    if (age < 40) return medians["35-39"]; if (age < 45) return medians["40-44"];
    if (age < 50) return medians["45-49"]; if (age < 55) return medians["50-54"];
    if (age < 60) return medians["55-59"]; return medians["60+"];
  },

  // --- MACRO DASHBOARD: 12 TIME-SERIES MOCK GENERATORS ---
  _buildSeries(startValue: number, growthFn: (year: number) => number, years = 20): TimeSeriesPoint[] {
    const data: TimeSeriesPoint[] = [];
    const currentYear = 2024;
    let val = startValue;
    for (let i = years; i >= 0; i--) {
      const year = currentYear - i;
      if (i < years) val = val * (1 + growthFn(year));
      data.push({ year, value: Math.round(val) });
    }
    return data;
  },

  // 1. Core Inflation vs CPF (Wealth Erosion)
  async fetchWealthErosion(): Promise<TimeSeriesPoint[]> {
    const data = this._buildSeries(100000, (y) => y >= 2021 ? 0.045 : 0.015);
    let savings = 100000;
    return data.map((d, i) => {
      if (i > 0) savings *= 1.025;
      return { ...d, baseline: Math.round(savings) };
    });
  },

  // 2. Food Inflation (The Daily Squeeze)
  async fetchFoodInflation(): Promise<TimeSeriesPoint[]> {
    return this._buildSeries(100, (y) => y >= 2021 ? 0.06 : 0.02);
  },

  // 3. SORA Rates (The Debt Trap)
  async fetchSoraRates(): Promise<TimeSeriesPoint[]> {
    const data: TimeSeriesPoint[] = [];
    const currentYear = 2024;
    for (let i = 20; i >= 0; i--) {
      const year = currentYear - i;
      let rate = 1.5;
      if (year > 2008 && year < 2015) rate = 0.5;
      if (year >= 2015 && year < 2020) rate = 1.8;
      if (year === 2020 || year === 2021) rate = 0.2;
      if (year >= 2022) rate = 3.8;
      data.push({ year, value: rate });
    }
    return data;
  },

  // 4. Housing Affordability (HDB Index)
  async fetchHousingIndex(): Promise<TimeSeriesPoint[]> {
    return this._buildSeries(80, (y) => {
      if (y > 2008 && y < 2013) return 0.08;
      if (y > 2013 && y < 2018) return -0.01;
      if (y >= 2020) return 0.09;
      return 0.03;
    });
  },

  // 5. COE Premiums (Cost of Aspiration)
  async fetchCoePrices(): Promise<TimeSeriesPoint[]> {
    const data: TimeSeriesPoint[] = [];
    for (let i = 20; i >= 0; i--) {
      const year = 2024 - i;
      let val = 40000;
      if (year > 2008 && year < 2013) val = 60000;
      if (year > 2013 && year < 2018) val = 45000;
      if (year >= 2021) val = 100000 + (year - 2021) * 10000;
      data.push({ year, value: val });
    }
    return data;
  },

  // 6. Childcare Costs (Parent Penalty)
  async fetchChildcareCosts(): Promise<TimeSeriesPoint[]> {
    return this._buildSeries(800, () => 0.05);
  },

  // 7. Wage Stagnation (Bell Curve)
  async fetchWageCurve(): Promise<TimeSeriesPoint[]> {
    return Object.entries(MOM_2024_MEDIANS).map(([ageGroup, median]) => ({
      year: ageGroup,
      value: median
    }));
  },

  // 8. Healthcare Crisis (Medical Inflation)
  async fetchMedicalInflation(): Promise<TimeSeriesPoint[]> {
    return this._buildSeries(100, (y) => y >= 2020 ? 0.08 : 0.05);
  },

  // 9. Longevity Risk (Life Expectancy)
  async fetchLifeExpectancy(): Promise<TimeSeriesPoint[]> {
    const data: TimeSeriesPoint[] = [];
    let exp = 78;
    for (let i = 20; i >= 0; i--) {
      const year = 2024 - i;
      if (year % 3 === 0) exp += 0.8;
      data.push({ year, value: parseFloat(exp.toFixed(1)) });
    }
    return data;
  },

  // 10. Education Inflation (University)
  async fetchEducationInflation(): Promise<TimeSeriesPoint[]> {
    return this._buildSeries(15000, () => 0.04);
  },

  // 11. Old-Age Support Ratio (Tax Base)
  async fetchOldAgeSupportRatio(): Promise<TimeSeriesPoint[]> {
    const data: TimeSeriesPoint[] = [];
    let ratio = 7.5;
    for (let i = 20; i >= 0; i--) {
      const year = 2024 - i;
      if (i < 20) ratio = ratio - 0.2;
      data.push({ year, value: parseFloat(Math.max(2.7, ratio).toFixed(1)) });
    }
    return data;
  },

  // 12. CPF FRS Escalation (Moving Goalpost)
  async fetchCpfFrs(): Promise<TimeSeriesPoint[]> {
    return this._buildSeries(80000, () => 0.035);
  }
};
