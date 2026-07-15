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
  const { clientData, stressTests, economicData } = useStore();

  const INFLATION_RATE = stressTests.sustainedInflation 
    ? 0.05 
    : (economicData?.masCoreInflation ?? 0.028);
    
  const BASELINE_RETURN = economicData?.cpfOARate ?? 0.025;
  const OPTIMIZED_RETURN = economicData?.optimizedPortfolioReturn ?? 0.065;

  const data = [];
  // True Net Worth Calculation (Subagent Patched)
  let currentBaselineCash = clientData.cash + clientData.cpfOA;
  let currentBaselineDebt = clientData.totalDebt;
  
  let currentOptimizedCash = clientData.cash + clientData.cpfOA;
  let currentOptimizedDebt = clientData.totalDebt;

  const DEBT_INTEREST_RATE = 0.04; // 4% SORA + Spread

  for (let year = 0; year <= (85 - clientData.age); year++) {
    const currentAge = clientData.age + year;
    
    if (year > 0) {
      const inflatedExpenses = (clientData.monthlyExpenses * 12) * Math.pow(1 + INFLATION_RATE, year);
      const inflatedIncome = (clientData.monthlyIncome * 12) * Math.pow(1 + INFLATION_RATE, year);
      
      let yearSavings = 0;
      if (currentAge < clientData.targetAge) {
        yearSavings = inflatedIncome - inflatedExpenses;
      } else {
        yearSavings = -inflatedExpenses;
      }

      if (stressTests.medicalEmergency && year === 1) {
        yearSavings -= 36000;
      }

      // Process Baseline
      currentBaselineDebt *= (1 + DEBT_INTEREST_RATE);
      if (yearSavings >= 0) {
        // Surplus: Pay down debt first
        if (currentBaselineDebt > 0) {
          if (yearSavings >= currentBaselineDebt) {
            yearSavings -= currentBaselineDebt;
            currentBaselineDebt = 0;
          } else {
            currentBaselineDebt -= yearSavings;
            yearSavings = 0;
          }
        }
        currentBaselineCash = (currentBaselineCash * (1 + BASELINE_RETURN)) + yearSavings;
      } else {
        // Deficit Spiral: Drain cash, then increase debt
        currentBaselineCash += yearSavings; // yearSavings is negative
        if (currentBaselineCash < 0) {
          currentBaselineDebt += Math.abs(currentBaselineCash);
          currentBaselineCash = 0;
        } else {
          currentBaselineCash *= (1 + BASELINE_RETURN);
        }
      }

      // Process Optimized
      currentOptimizedDebt *= (1 + DEBT_INTEREST_RATE);
      let optSavings = yearSavings; // Recalculate original savings for optimized path
      if (currentAge < clientData.targetAge) {
        optSavings = inflatedIncome - inflatedExpenses;
      } else {
        optSavings = -inflatedExpenses;
      }
      if (stressTests.medicalEmergency && year === 1) {
        optSavings -= 36000;
      }

      if (optSavings >= 0) {
        if (currentOptimizedDebt > 0) {
          if (optSavings >= currentOptimizedDebt) {
            optSavings -= currentOptimizedDebt;
            currentOptimizedDebt = 0;
          } else {
            currentOptimizedDebt -= optSavings;
            optSavings = 0;
          }
        }
        currentOptimizedCash = (currentOptimizedCash * (1 + OPTIMIZED_RETURN)) + optSavings;
      } else {
        currentOptimizedCash += optSavings;
        if (currentOptimizedCash < 0) {
          currentOptimizedDebt += Math.abs(currentOptimizedCash);
          currentOptimizedCash = 0;
        } else {
          currentOptimizedCash *= (1 + OPTIMIZED_RETURN);
        }
      }
      
      if (stressTests.covidCrash && year === 1) {
         currentBaselineCash *= 0.70;
         currentOptimizedCash *= 0.90; 
      }
    }
    
    // Net worth = Cash - Debt
    let netBaseline = currentBaselineCash - currentBaselineDebt;
    let netOptimized = currentOptimizedCash - currentOptimizedDebt;

    // Remove artificial floor clamping, allow it to fall to actual depths, but cap extreme runaway debt for render sanity
    const clampedBaseline = Math.max(-20000000, netBaseline);
    const clampedOptimized = Math.max(-20000000, netOptimized);

    data.push({
      age: currentAge,
      baseline: Math.round(clampedBaseline),
      optimized: Math.round(clampedOptimized)
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
                dataKey="optimized" 
                name="Optimized" 
                stroke="#a3e635" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorOptimized)" 
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
        <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-8 pointer-events-none">
          <div className="flex items-center gap-2 bg-slate-900/60 px-4 py-2 rounded-full backdrop-blur-md border border-slate-700/50">
            <div className="w-3 h-1 bg-rose-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
            <span className="text-xs text-slate-300 font-medium tracking-wide">Baseline</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/60 px-4 py-2 rounded-full backdrop-blur-md border border-slate-700/50">
            <div className="w-3 h-1 bg-lime-400 rounded-full shadow-[0_0_8px_rgba(163,230,53,0.5)]" />
            <span className="text-xs text-slate-300 font-medium tracking-wide">Optimized</span>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
