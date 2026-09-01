import { calculateTax } from './taxEngine';

export interface ClientState {
  age: number;
  targetAge: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  cash: number;
  cpfOA: number;
  totalDebt: number;
  dependentReliefs: number;
}

export interface ProductPortfolio {
  hasShieldPlan: boolean;
  hasCIPlan: boolean;
  premiumEndowment: number;
  premiumILP: number;
  premiumAnnuity: number;
  premiumSRS: number;
}

export interface StressTests {
  medicalEmergency: boolean;
  covidCrash: boolean;
  sustainedInflation: boolean;
}

export interface EconomicData {
  masCoreInflation: number;
  cpfOARate: number;
  optimizedPortfolioReturn: number;
}

export interface YearlyProjection {
  age: number;
  baseline: number;
  optCash: number;
  optCPF: number;
  optEndowment: number;
  optInvestments: number;
  optAnnuity: number;
  optSRS: number;
  optDebtDisplay: number;
  optimized: number;
}

export interface LifeEvent {
  id: string;
  age: number;
  label: string;
  category: 'general' | 'housing';
  costCash: number;
  costCPF: number;
}

const getCPFCeiling = (yearIndex: number) => {
  const year = new Date().getFullYear() + yearIndex;
  if (year <= 2024) return 6800 * 12;
  if (year === 2025) return 7400 * 12;
  return 8000 * 12;
};

const getEmployeeCPFRate = (age: number) => {
  if (age <= 55) return 0.20;
  if (age <= 60) return 0.13;
  if (age <= 65) return 0.075;
  return 0.05;
};

const getEarnedIncomeRelief = (age: number) => {
  if (age < 55) return 1000;
  if (age < 60) return 6000;
  return 8000;
};

// Out of the employee contribution, how much flows to the Ordinary Account (OA)?
// For simplicity MVP, we assume a blended allocation of ~62-75% depending on age. 
// We will use 0.70 (70%) as a blended average to avoid extremely complex OA/SA/MA split logic.
const OA_ALLOCATION_RATIO = 0.70;

export function calculateWealthTrajectory(
  clientData: ClientState,
  portfolio: ProductPortfolio,
  stressTests: StressTests,
  economicData?: EconomicData,
  lifeEvents?: LifeEvent[]
): YearlyProjection[] {
  const INFLATION_RATE = stressTests.sustainedInflation 
    ? 0.05 
    : (economicData?.masCoreInflation ?? 0.028);
    
  const BASELINE_RETURN = economicData?.cpfOARate ?? 0.025;

  const data: YearlyProjection[] = [];
  let currentBaselineCash = clientData.cash + clientData.cpfOA;
  let currentBaselineDebt = clientData.totalDebt;
  
  let optCash = clientData.cash;
  let optCPF = clientData.cpfOA;
  let optEndowment = 0;
  let optInvestments = 0;
  let optAnnuity = 0;
  let optSRS = 0;
  let optDebt = clientData.totalDebt;

  let pendingTaxBill = 0;
  let pendingBaselineTaxBill = 0;

  const DEBT_INTEREST_RATE = 0.04;
  const YIELD_CASH = 0.01;
  const YIELD_CPF = 0.025;
  const YIELD_ENDOWMENT = 0.035;
  const YIELD_INVESTMENTS = 0.075;
  const YIELD_ANNUITY = 0.045;
  const YIELD_SRS = 0.06;

  for (let year = 0; year <= (85 - clientData.age); year++) {
    const currentAge = clientData.age + year;
    
    if (year > 0) {
      const grossAnnualIncome = (clientData.monthlyIncome * 12) * Math.pow(1 + INFLATION_RATE, year);
      const inflatedExpenses = (clientData.monthlyExpenses * 12) * Math.pow(1 + INFLATION_RATE, year);
      
      let baseSavings = 0;
      let optSavings = 0;
      let employeeCpf = 0;
      let allocatedOA = 0;

      if (currentAge < clientData.targetAge) {
        // Calculate CPF Deductions
        const cpfRate = getEmployeeCPFRate(currentAge);
        const cpfCeiling = getCPFCeiling(year);
        employeeCpf = Math.min(grossAnnualIncome, cpfCeiling) * cpfRate;
        allocatedOA = employeeCpf * OA_ALLOCATION_RATIO;
        
        const takeHomeIncome = grossAnnualIncome - employeeCpf;
        
        // Liquid cashflow (After Last Year's Tax and current expenses)
        baseSavings = takeHomeIncome - pendingBaselineTaxBill - inflatedExpenses;
        optSavings = takeHomeIncome - pendingTaxBill - inflatedExpenses;
        
        if (portfolio.hasShieldPlan) optSavings -= 1200; 
        if (portfolio.hasCIPlan) optSavings -= 2400; 
        
        // Calculate THIS year's tax to be paid next year
        const eir = getEarnedIncomeRelief(currentAge);
        
        pendingTaxBill = calculateTax(
          grossAnnualIncome, 
          portfolio.premiumSRS * 12, 
          clientData.dependentReliefs || 0,
          employeeCpf,
          eir
        ).taxPayable;

        pendingBaselineTaxBill = calculateTax(
          grossAnnualIncome, 
          0, // No SRS in baseline
          clientData.dependentReliefs || 0,
          employeeCpf,
          eir
        ).taxPayable;

      } else {
        baseSavings = -inflatedExpenses;
        optSavings = -inflatedExpenses;
        pendingTaxBill = 0;
        pendingBaselineTaxBill = 0;
      }

      if (stressTests.medicalEmergency && year === 1) {
        baseSavings -= 150000;
        if (!portfolio.hasShieldPlan) optSavings -= 150000;
        if (portfolio.hasCIPlan) optSavings += 200000;
      }

      // --- Process Baseline ---
      currentBaselineDebt *= (1 + DEBT_INTEREST_RATE);
      // Inject allocated OA into baseline cash proxy (since baseline tracks them combined)
      currentBaselineCash += allocatedOA; 
      
      if (baseSavings >= 0) {
        if (currentBaselineDebt > 0) {
          if (baseSavings >= currentBaselineDebt) {
            baseSavings -= currentBaselineDebt;
            currentBaselineDebt = 0;
          } else {
            currentBaselineDebt -= baseSavings;
            baseSavings = 0;
          }
        }
        currentBaselineCash = (currentBaselineCash * (1 + BASELINE_RETURN)) + baseSavings;
      } else {
        currentBaselineCash *= (1 + BASELINE_RETURN);
        currentBaselineCash += baseSavings;
        if (currentBaselineCash < 0) {
          currentBaselineDebt += Math.abs(currentBaselineCash);
          currentBaselineCash = 0;
        }
      }

      // --- Process Optimized Stack ---
      optDebt *= (1 + DEBT_INTEREST_RATE);
      optCPF += allocatedOA; // Inject CPF OA Contribution

      let allocatedEndowment = 0;
      let allocatedILP = 0;
      let allocatedAnnuity = 0;
      let allocatedSRS = 0;

      if (currentAge < clientData.targetAge && optSavings >= 0) {
         const maxEndowment = Math.min(optSavings, portfolio.premiumEndowment * 12);
         allocatedEndowment = maxEndowment;
         optSavings -= maxEndowment;

         const maxILP = Math.min(optSavings, portfolio.premiumILP * 12);
         allocatedILP = maxILP;
         optSavings -= maxILP;

         const maxAnnuity = Math.min(optSavings, portfolio.premiumAnnuity * 12);
         allocatedAnnuity = maxAnnuity;
         optSavings -= maxAnnuity;

         const maxSRS = Math.min(optSavings, portfolio.premiumSRS * 12);
         allocatedSRS = maxSRS;
         optSavings -= maxSRS;
      }

      if (optSavings >= 0) {
        if (optDebt > 0) {
          if (optSavings >= optDebt) {
            optSavings -= optDebt;
            optDebt = 0;
          } else {
            optDebt -= optSavings;
            optSavings = 0;
          }
        }
        
        optCash = (optCash * (1 + YIELD_CASH)) + optSavings;
        optEndowment = (optEndowment * (1 + YIELD_ENDOWMENT)) + allocatedEndowment;
        optInvestments = (optInvestments * (1 + YIELD_INVESTMENTS)) + allocatedILP;
        optAnnuity = (optAnnuity * (1 + YIELD_ANNUITY)) + allocatedAnnuity;
        optSRS = (optSRS * (1 + YIELD_SRS)) + allocatedSRS;
        optCPF *= (1 + YIELD_CPF);

      } else {
        optCash *= (1 + YIELD_CASH);
        optEndowment *= (1 + YIELD_ENDOWMENT);
        optInvestments *= (1 + YIELD_INVESTMENTS);
        optAnnuity *= (1 + YIELD_ANNUITY);
        optSRS *= (1 + YIELD_SRS);
        optCPF *= (1 + YIELD_CPF);

        let deficit = Math.abs(optSavings);
        
        if (optCash >= deficit) {
           optCash -= deficit;
        } else {
           deficit -= optCash;
           optCash = 0;
           if (optInvestments >= deficit) {
              optInvestments -= deficit;
           } else {
              deficit -= optInvestments;
              optInvestments = 0;
              if (optEndowment >= deficit) {
                 optEndowment -= deficit;
              } else {
                 deficit -= optEndowment;
                 optEndowment = 0;
                 optDebt += deficit;
              }
           }
        }
      }
      
      if (stressTests.covidCrash && year === 1) {
         currentBaselineCash *= 0.70;
         optInvestments *= 0.70;
      }

      // --- Process Life Events ---
      if (lifeEvents) {
        const eventsThisYear = lifeEvents.filter(e => e.age === currentAge);
        for (const ev of eventsThisYear) {
          // Process CPF Drain (Only if category allows CPF, represented by costCPF > 0)
          if (ev.costCPF > 0) {
            // Baseline
            currentBaselineCash -= ev.costCPF;
            if (currentBaselineCash < 0) {
              currentBaselineDebt += Math.abs(currentBaselineCash);
              currentBaselineCash = 0;
            }
            
            // Optimized
            let cpfDeficit = ev.costCPF;
            if (optCPF >= cpfDeficit) {
               optCPF -= cpfDeficit;
            } else {
               cpfDeficit -= optCPF;
               optCPF = 0;
               optDebt += cpfDeficit; // If CPF falls short, borrow
            }
          }

          // Process Cash Drain
          if (ev.costCash > 0) {
            // Baseline
            currentBaselineCash -= ev.costCash;
            if (currentBaselineCash < 0) {
              currentBaselineDebt += Math.abs(currentBaselineCash);
              currentBaselineCash = 0;
            }

            // Optimized (Waterfall Liquidation)
            let deficit = ev.costCash;
            if (optCash >= deficit) {
               optCash -= deficit;
            } else {
               deficit -= optCash;
               optCash = 0;
               if (optInvestments >= deficit) {
                  optInvestments -= deficit;
               } else {
                  deficit -= optInvestments;
                  optInvestments = 0;
                  if (optEndowment >= deficit) {
                     optEndowment -= deficit;
                  } else {
                     deficit -= optEndowment;
                     optEndowment = 0;
                     if (optAnnuity >= deficit) {
                        optAnnuity -= deficit;
                     } else {
                        deficit -= optAnnuity;
                        optAnnuity = 0;
                        if (optSRS >= deficit) {
                            optSRS -= deficit;
                        } else {
                            deficit -= optSRS;
                            optSRS = 0;
                            optDebt += deficit; // Finally, borrow
                        }
                     }
                  }
               }
            }
          }
        }
      }
    }
    
    let netBaseline = currentBaselineCash - currentBaselineDebt;
    let netOptCash = optCash;

    data.push({
      age: currentAge,
      baseline: Math.round(Math.max(-20000000, netBaseline)),
      optCash: Math.round(netOptCash),
      optCPF: Math.round(optCPF),
      optEndowment: Math.round(optEndowment),
      optInvestments: Math.round(optInvestments),
      optAnnuity: Math.round(optAnnuity),
      optSRS: Math.round(optSRS),
      optDebtDisplay: -Math.round(optDebt),
      optimized: Math.round(Math.max(-20000000, optCash + optCPF + optEndowment + optInvestments + optAnnuity + optSRS - optDebt))
    });
  }
  
  return data;
}
