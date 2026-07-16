export interface ClientState {
  age: number;
  targetAge: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  cash: number;
  cpfOA: number;
  totalDebt: number;
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

export function calculateWealthTrajectory(
  clientData: ClientState,
  portfolio: ProductPortfolio,
  stressTests: StressTests,
  economicData?: EconomicData
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
      const inflatedExpenses = (clientData.monthlyExpenses * 12) * Math.pow(1 + INFLATION_RATE, year);
      const inflatedIncome = (clientData.monthlyIncome * 12) * Math.pow(1 + INFLATION_RATE, year);
      
      let baseSavings = 0;
      let optSavings = 0;

      if (currentAge < clientData.targetAge) {
        baseSavings = inflatedIncome - inflatedExpenses;
        optSavings = inflatedIncome - inflatedExpenses;
        
        if (portfolio.hasShieldPlan) optSavings -= 1200; // $100/mo * 12
        if (portfolio.hasCIPlan) optSavings -= 2400; // $200/mo * 12
      } else {
        baseSavings = -inflatedExpenses;
        optSavings = -inflatedExpenses;
      }

      if (stressTests.medicalEmergency && year === 1) {
        baseSavings -= 150000;
        
        if (!portfolio.hasShieldPlan) {
          optSavings -= 150000;
        }
        if (portfolio.hasCIPlan) {
          optSavings += 200000;
        }
      }

      // --- Process Baseline ---
      currentBaselineDebt *= (1 + DEBT_INTEREST_RATE);
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
