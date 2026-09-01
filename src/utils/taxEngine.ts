const EXACT_BRACKETS = [
  { limit: 1000000, rate: 0.24, base: 199150 }, // For income > 1,000,000, rate is 24%
  { limit: 500000, rate: 0.23, base: 84150 }, // For > 500,000, rate is 23%
  { limit: 320000, rate: 0.22, base: 44550 }, // For > 320,000, rate is 22%
  { limit: 280000, rate: 0.20, base: 36550 }, // For > 280,000, rate is 20%
  { limit: 240000, rate: 0.195, base: 28750 }, // For > 240,000, rate is 19.5%
  { limit: 200000, rate: 0.19, base: 21150 }, // For > 200,000, rate is 19%
  { limit: 160000, rate: 0.18, base: 13950 }, // For > 160,000, rate is 18% (was mistakenly 0.15 before!)
  { limit: 120000, rate: 0.15, base: 7950 }, // For > 120,000, rate is 15% (was mistakenly 0.115 before!)
  { limit: 80000, rate: 0.115, base: 3350 }, // For > 80,000, rate is 11.5%
  { limit: 40000, rate: 0.07, base: 550 }, // For > 40,000, rate is 7%
  { limit: 30000, rate: 0.035, base: 200 }, // For > 30,000, rate is 3.5%
  { limit: 20000, rate: 0.02, base: 0 } // For > 20,000, rate is 2%
];

export const calculateTax = (
  annualIncome: number, 
  srsTopUp: number = 0, 
  dependentReliefs: number = 0,
  mandatoryCPF: number = 0,
  earnedIncomeRelief: number = 1000
) => {
  const calculateRawTax = (income: number) => {
    if (income <= 20000) return 0;
    for (const bracket of EXACT_BRACKETS) {
      if (income > bracket.limit) {
        return bracket.base + ((income - bracket.limit) * bracket.rate);
      }
    }
    return 0;
  };

  const baselineRelief = earnedIncomeRelief + mandatoryCPF + dependentReliefs;
  const cappedBaselineRelief = Math.min(baselineRelief, 80000);
  const baselineChargeableIncome = Math.max(0, annualIncome - cappedBaselineRelief);
  const baselineTax = calculateRawTax(baselineChargeableIncome);

  const cappedSRS = Math.min(srsTopUp, 15300);
  const totalOptimizedRelief = Math.min(baselineRelief + cappedSRS, 80000);
  
  const optimizedChargeableIncome = Math.max(0, annualIncome - totalOptimizedRelief);
  const optimizedTax = calculateRawTax(optimizedChargeableIncome);

  const taxSaved = Math.max(0, baselineTax - optimizedTax);

  return {
    baselineTax: Math.round(baselineTax),
    optimizedTax: Math.round(optimizedTax),
    taxPayable: Math.round(optimizedTax),
    taxSaved: Math.round(taxSaved),
    cappedSRS
  };
};
