import { useStore } from '../store/useStore';
import { calculateWealthTrajectory, type ProductPortfolio } from '../utils/mathEngine';
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

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const optimized = data.optimized;
    const baseline = data.baseline;
    
    return (
      <div className="bg-slate-900/95 border border-slate-700/50 rounded-xl p-4 shadow-2xl backdrop-blur-xl w-64 max-h-64 overflow-y-auto z-50">
        <p className="text-slate-400 text-xs font-medium mb-1">Age {label}</p>
        
        <div className="mb-4">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Total Projected Wealth</p>
          <p className="text-2xl font-bold text-lime-400 font-mono tracking-tight">{formatCurrency(optimized)}</p>
          
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-700/50">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Unprotected Baseline</p>
            <p className="text-sm font-semibold text-rose-400 font-mono">{formatCurrency(baseline)}</p>
          </div>
        </div>
        
        <div className="space-y-2">
           {payload.map((entry: any, index: number) => {
              if (Math.abs(entry.value) === 0 || entry.dataKey === 'baseline') return null;
              
              // Debt should visually show as negative, but we use absolute value for formatting
              const isDebt = entry.dataKey === 'optDebtDisplay';
              
              return (
                 <div key={index} className="flex justify-between items-center text-sm">
                   <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                     <span className="text-slate-300 text-xs">{entry.name}</span>
                   </div>
                   <span className="font-mono text-slate-100 text-xs">
                     {isDebt ? '-' : ''}{formatCurrency(Math.abs(entry.value))}
                   </span>
                 </div>
              )
           })}
        </div>
      </div>
    );
  }
  return null;
};

export function LifeCanvas() {
  const { 
    clientData, stressTests, economicData, 
    hasShieldPlan, hasCIPlan,
    premiumEndowment, premiumILP, premiumAnnuity, premiumSRS 
  } = useStore();

  const portfolio: ProductPortfolio = {
    hasShieldPlan,
    hasCIPlan,
    premiumEndowment,
    premiumILP,
    premiumAnnuity,
    premiumSRS
  };

  const data = calculateWealthTrajectory(clientData, portfolio, stressTests, economicData);

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
                content={<CustomTooltip />}
                allowEscapeViewBox={{ x: true, y: true }}
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
                dataKey="optDebtDisplay" 
                name="Total Debt" 
                stackId="2"
                stroke="#ef4444" 
                fill="#ef4444" 
                fillOpacity={0.6}
                activeDot={false}
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
              <Area 
                type="monotone" 
                dataKey="optAnnuity" 
                name="Retirement Annuity" 
                stackId="1"
                stroke="#f97316" 
                fill="#f97316" 
                fillOpacity={0.6}
                activeDot={false}
              />
              <Area 
                type="monotone" 
                dataKey="optSRS" 
                name="SRS Index Fund" 
                stackId="1"
                stroke="#eab308" 
                fill="#eab308" 
                fillOpacity={0.6}
                activeDot={false}
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
          <div className="flex items-center gap-2 bg-slate-900/60 px-3 py-1.5 rounded-full backdrop-blur-md border border-slate-700/50">
            <div className="w-2 h-2 bg-[#f97316] rounded-full" />
            <span className="text-[10px] text-slate-300 font-medium">Annuity</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/60 px-3 py-1.5 rounded-full backdrop-blur-md border border-slate-700/50">
            <div className="w-2 h-2 bg-[#eab308] rounded-full" />
            <span className="text-[10px] text-slate-300 font-medium">SRS</span>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
