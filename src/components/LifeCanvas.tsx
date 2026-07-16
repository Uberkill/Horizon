import { useStore } from '../store/useStore';
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Scatter
} from 'recharts';
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900/50 rounded-2xl border border-rose-500/20 p-8">
      <p className="text-rose-400 font-medium mb-2">Mathematical projection error</p>
      <p className="text-slate-500 text-sm text-center">Please verify the client inputs in the configuration drawer. Values may be out of bounds.</p>
    </div>
  );
}

function CustomScatterNode(props: any) {
  const { cx, cy, payload } = props;
  return (
    <g className="transition-all duration-300">
      <circle cx={cx} cy={cy} r={6} fill="#a3e635" stroke="#0f172a" strokeWidth={3} />
      <g transform={`translate(${cx},${cy - 28})`}>
        <rect x={-55} y={-14} width={110} height={28} rx={14} fill="#1e293b" fillOpacity={0.9} stroke="#334155" />
        <text x={0} y={0} textAnchor="middle" dominantBaseline="central" fill="#cbd5e1" fontSize={11} fontWeight={500}>
          {payload.label}
        </text>
      </g>
    </g>
  );
}

export function LifeCanvas() {
  const { clientData, stressTests, economicData, portfolioRiskRatio, hasProtectionPlan } = useStore();

  const INFLATION_RATE = stressTests.sustainedInflation 
    ? 0.05 
    : (economicData?.masCoreInflation ?? 0.028);
    
  const BASELINE_RETURN = economicData?.cpfOARate ?? 0.025;
  const OPTIMIZED_RETURN = economicData?.optimizedPortfolioReturn ?? 0.065;

  const data = [];
  let currentBaselineCash = clientData.cash + clientData.cpfOA;
  let currentBaselineDebt = clientData.totalDebt;
  
  let optCash = clientData.cash;
  let optCPF = clientData.cpfOA;
  let optEndowment = 0;
  let optInvestments = 0;
  let optDebt = clientData.totalDebt;

  const DEBT_INTEREST_RATE = 0.04;
  const YIELD_CASH = 0.01;
  const YIELD_CPF = 0.025;
  const YIELD_ENDOWMENT = 0.035;
  const YIELD_INVESTMENTS = 0.075;

  const ratioEndowment = (100 - portfolioRiskRatio) / 100;
  const ratioInvestments = portfolioRiskRatio / 100;

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
        if (hasProtectionPlan) {
          optSavings -= (inflatedIncome * 0.10); // 10% Protection Premium
        }
      } else {
        baseSavings = -inflatedExpenses;
        optSavings = -inflatedExpenses;
      }

      if (stressTests.medicalEmergency && year === 1) {
        baseSavings -= 150000;
        if (!hasProtectionPlan) {
          optSavings -= 150000;
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
        
        const cashCap = inflatedExpenses / 2;
        optCash *= (1 + YIELD_CASH);
        
        if (optCash < cashCap) {
           const cashNeeded = cashCap - optCash;
           if (optSavings <= cashNeeded) {
              optCash += optSavings;
              optSavings = 0;
           } else {
              optCash += cashNeeded;
              optSavings -= cashNeeded;
           }
        }

        optEndowment = (optEndowment * (1 + YIELD_ENDOWMENT)) + (optSavings * ratioEndowment);
        optInvestments = (optInvestments * (1 + YIELD_INVESTMENTS)) + (optSavings * ratioInvestments);
        optCPF *= (1 + YIELD_CPF);

      } else {
        optCash *= (1 + YIELD_CASH);
        optEndowment *= (1 + YIELD_ENDOWMENT);
        optInvestments *= (1 + YIELD_INVESTMENTS);
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
    let netOptCash = optCash - optDebt;

    data.push({
      age: currentAge,
      baseline: Math.round(Math.max(-20000000, netBaseline)),
      optCash: Math.round(netOptCash),
      optCPF: Math.round(optCPF),
      optEndowment: Math.round(optEndowment),
      optInvestments: Math.round(optInvestments),
      optimized: Math.round(Math.max(-20000000, optCash + optCPF + optEndowment + optInvestments - optDebt))
    });
  }

  // Derive milestones for the Scatter plot
  const milestones = [];
  const retirementData = data.find(d => d.age === clientData.targetAge);
  if (retirementData) milestones.push({ age: retirementData.age, optimized: retirementData.optimized, label: 'Retirement' });

  const propAge = clientData.targetAge - 10;
  const propertyData = data.find(d => d.age === propAge && propAge > clientData.age + 2);
  if (propertyData) milestones.push({ age: propertyData.age, optimized: propertyData.optimized, label: 'Property Purchase' });

  const travelAge = clientData.targetAge + 5;
  const travelData = data.find(d => d.age === travelAge);
  if (travelData) milestones.push({ age: travelData.age, optimized: travelData.optimized, label: 'Travel Goal' });


  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatYAxis = (value: number) => {
    if (Math.abs(value) >= 1000000) {
      return `${value < 0 ? '-' : ''}$${Math.abs(value) / 1000000}M`;
    }
    return `${value < 0 ? '-' : ''}$${Math.abs(value) / 1000}k`;
  };

  const isMultipleStress = Object.values(stressTests).filter(Boolean).length > 1;

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="w-full h-full min-h-[500px] flex flex-col bg-slate-900/40 p-6 lg:p-8 rounded-[2rem] border border-slate-700/50 shadow-2xl backdrop-blur-3xl relative overflow-hidden">
        
        {/* Decorative Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-lime-500/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="mb-8 flex justify-between items-start relative z-10">
          <div>
            <h2 className="text-3xl font-semibold text-slate-100 mb-2 tracking-tight">Life Canvas</h2>
            <p className="text-slate-400 text-sm tracking-wide">Predictive financial timelines with clear visual storytelling</p>
          </div>
          {isMultipleStress && (
            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 px-4 py-2 rounded-xl text-sm font-medium shadow-sm flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Multiple Stress Events Active
            </div>
          )}
        </div>

        <div className="flex-1 w-full min-h-0 relative z-10 -ml-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 40, right: 30, left: 20, bottom: 20 }}>
              <defs>
                <linearGradient id="colorOptimized" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a3e635" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#a3e635" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.5} />
              <XAxis 
                dataKey="age" 
                stroke="#64748b" 
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickMargin={12}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                stroke="#64748b" 
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickFormatter={formatYAxis}
                axisLine={false}
                tickLine={false}
                tickMargin={12}
              />
              <Tooltip 
                formatter={(value: any) => formatCurrency(Number(value))}
                labelFormatter={(label) => `Age ${label}`}
                contentStyle={{ 
                  backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                  border: '1px solid rgba(51, 65, 85, 0.5)', 
                  borderRadius: '12px',
                  backdropFilter: 'blur(12px)',
                  color: '#f8fafc',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                }}
                itemStyle={{ fontWeight: 500 }}
              />
              
              <Line 
                type="monotone" 
                dataKey="baseline" 
                name="Baseline" 
                stroke="#ef4444" 
                strokeWidth={3}
                dot={false} 
                activeDot={{ r: 6, fill: "#ef4444", stroke: "#0f172a", strokeWidth: 2 }}
              />
              
              <Area 
                type="monotone" 
                dataKey="optCash" 
                name="Liquid Cash" 
                stackId="1"
                stroke="#0ea5e9" 
                fill="#0ea5e9" 
                fillOpacity={0.6}
                activeDot={false}
              />
              <Area 
                type="monotone" 
                dataKey="optCPF" 
                name="CPF Balances" 
                stackId="1"
                stroke="#14b8a6" 
                fill="#14b8a6" 
                fillOpacity={0.6}
                activeDot={false}
              />
              <Area 
                type="monotone" 
                dataKey="optEndowment" 
                name="Endowments (Safe)" 
                stackId="1"
                stroke="#8b5cf6" 
                fill="#8b5cf6" 
                fillOpacity={0.6}
                activeDot={false}
              />
              <Area 
                type="monotone" 
                dataKey="optInvestments" 
                name="ILP / Equities (Growth)" 
                stackId="1"
                stroke="#a3e635" 
                fill="#a3e635" 
                fillOpacity={0.6}
                activeDot={{ r: 6, fill: "#a3e635", stroke: "#0f172a", strokeWidth: 2 }}
              />

              {milestones.length > 0 && (
                <Scatter 
                  data={milestones} 
                  shape={<CustomScatterNode />}
                  isAnimationActive={false}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        
        {/* Custom Legend to match image */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center flex-wrap items-center gap-4 px-8 pointer-events-none z-20">
          <div className="flex items-center gap-2 bg-slate-900/60 px-3 py-1.5 rounded-full backdrop-blur-md border border-slate-700/50">
            <div className="w-3 h-1 bg-rose-500 rounded-full" />
            <span className="text-[10px] text-slate-300 font-medium">Unprotected Baseline</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/60 px-3 py-1.5 rounded-full backdrop-blur-md border border-slate-700/50">
            <div className="w-2 h-2 bg-[#0ea5e9] rounded-full" />
            <span className="text-[10px] text-slate-300 font-medium">Cash</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/60 px-3 py-1.5 rounded-full backdrop-blur-md border border-slate-700/50">
            <div className="w-2 h-2 bg-[#14b8a6] rounded-full" />
            <span className="text-[10px] text-slate-300 font-medium">CPF</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/60 px-3 py-1.5 rounded-full backdrop-blur-md border border-slate-700/50">
            <div className="w-2 h-2 bg-[#8b5cf6] rounded-full" />
            <span className="text-[10px] text-slate-300 font-medium">Endowments</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/60 px-3 py-1.5 rounded-full backdrop-blur-md border border-slate-700/50">
            <div className="w-2 h-2 bg-[#a3e635] rounded-full" />
            <span className="text-[10px] text-slate-300 font-medium">Investments</span>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
