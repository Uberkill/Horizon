import { useStore } from '../store/useStore';
import { AlertTriangle, Globe } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export function MacroView() {
  const { economicData, isLoadingData } = useStore();

  if (isLoadingData || !economicData) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4" />
        <p className="text-slate-400 font-mono text-sm animate-pulse">Connecting to Singapore Government Developer Portal...</p>
      </div>
    );
  }

  const formatPercent = (val: number) => (val * 100).toFixed(1) + '%';
  const gap = Math.max(0, economicData.masCoreInflation - economicData.cpfOARate);

  const data = [];
  let purchasingPower = 100000;
  for (let year = 0; year <= 10; year++) {
    data.push({
      year: `Year ${year}`,
      value: Math.round(purchasingPower)
    });
    purchasingPower = purchasingPower * (1 - gap);
  }

  return (
    <div className="w-full h-full p-6 lg:p-8 flex flex-col max-w-[1800px] mx-auto overflow-hidden animate-in fade-in zoom-in-95 duration-500">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-slate-100 mb-2 tracking-tight flex items-center gap-3">
            <Globe className="w-8 h-8 text-blue-400" />
            Macro Market Reality 
          </h2>
          <p className="text-slate-400 text-sm tracking-wide">
            Live API Data sourced from Monetary Authority of Singapore (MAS)
          </p>
        </div>
        <div className="px-4 py-2 bg-slate-800/80 rounded-full border border-slate-700 flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
           <span className="text-xs text-slate-300 font-mono">API Connection Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900/40 p-6 lg:p-8 rounded-[2rem] border border-rose-500/30 shadow-2xl backdrop-blur-3xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-[50px] pointer-events-none" />
           <p className="text-slate-400 text-sm font-medium mb-2 tracking-wide uppercase">MAS Core Inflation</p>
           <p className="text-6xl font-bold text-rose-400">{formatPercent(economicData.masCoreInflation)}</p>
        </div>
        <div className="bg-slate-900/40 p-6 lg:p-8 rounded-[2rem] border border-slate-700/50 shadow-2xl backdrop-blur-3xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-slate-500/10 rounded-full blur-[50px] pointer-events-none" />
           <p className="text-slate-400 text-sm font-medium mb-2 tracking-wide uppercase">CPF OA Base Interest</p>
           <p className="text-6xl font-bold text-slate-200">{formatPercent(economicData.cpfOARate)}</p>
        </div>
        <div className="bg-rose-500/10 p-6 lg:p-8 rounded-[2rem] border border-rose-500/50 shadow-2xl backdrop-blur-3xl flex flex-col justify-center relative overflow-hidden">
           <div className="absolute bottom-0 right-0 opacity-10">
              <AlertTriangle className="w-48 h-48" />
           </div>
           <div className="flex items-center gap-3 text-rose-400 mb-3 relative z-10">
             <AlertTriangle className="w-8 h-8" />
             <p className="font-semibold text-xl">Purchasing Power Loss</p>
           </div>
           <p className="text-slate-300 text-base leading-relaxed relative z-10">
             Cash savings in standard accounts are actively losing <strong className="text-rose-400">{formatPercent(gap)}</strong> of their value every year due to inflation outpacing interest.
           </p>
        </div>
      </div>

      <div className="flex-1 bg-slate-900/40 p-6 lg:p-8 rounded-[2rem] border border-slate-700/50 shadow-2xl backdrop-blur-3xl relative overflow-hidden min-h-[300px]">
        <h3 className="text-xl font-medium text-slate-100 mb-6 tracking-wide">The Impact: $100k Value Erosion (Next 10 Years)</h3>
        <div className="w-full h-[calc(100%-4rem)]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.5} />
              <XAxis dataKey="year" stroke="#64748b" tickLine={false} axisLine={false} tickMargin={12} />
              <YAxis stroke="#64748b" tickFormatter={(v) => `$${v/1000}k`} tickLine={false} axisLine={false} tickMargin={12} />
              <Tooltip 
                formatter={(value: any) => `$${value.toLocaleString()}`}
                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '12px', border: '1px solid rgba(51, 65, 85, 0.5)', backdropFilter: 'blur(12px)' }}
                itemStyle={{ color: '#ef4444', fontWeight: 600 }}
              />
              <Area type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={4} fill="url(#colorValue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
