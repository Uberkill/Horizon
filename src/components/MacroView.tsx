import { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { TrendingDown, Home, Briefcase, Activity } from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export function MacroView() {
  const [activeTab, setActiveTab] = useState<'wealth' | 'housing' | 'wages'>('wealth');
  const [timeframe, setTimeframe] = useState<3 | 5 | 10 | 20>(20);
  
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const loadData = async () => {
      let fetchedData: any[] = [];
      
      if (activeTab === 'wealth') {
        fetchedData = await apiService.fetchHistoricalInflationVsSavings();
      } else if (activeTab === 'housing') {
        fetchedData = await apiService.fetchHistoricalHousingIndex();
      } else if (activeTab === 'wages') {
        const medians = await apiService.fetchDemographicData();
        fetchedData = Object.entries(medians).map(([ageGroup, median]) => ({
          year: ageGroup, // repurpose 'year' key for XAxis
          value: median
        }));
      }

      if (isMounted) {
        if (activeTab !== 'wages') {
          fetchedData = fetchedData.slice(Math.max(fetchedData.length - timeframe - 1, 0));
        }
        setData(fetchedData);
        setIsLoading(false);
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, [activeTab, timeframe]);

  return (
    <div className="w-full h-full flex flex-col lg:flex-row p-6 lg:p-8 gap-6 lg:gap-8 max-w-[1800px] mx-auto overflow-hidden animate-in fade-in zoom-in-95 duration-500">
      
      {/* Vertical Sidebar */}
      <div className="w-full lg:w-[320px] flex-shrink-0 flex flex-col gap-4">
        <div className="mb-4">
          <h2 className="text-2xl font-semibold text-slate-100 tracking-tight">Intelligence</h2>
          <p className="text-slate-400 text-sm">Official SingStat & MAS Data</p>
        </div>

        <button 
          onClick={() => setActiveTab('wealth')}
          className={`flex items-center gap-3 p-4 rounded-2xl border transition-all text-left ${activeTab === 'wealth' ? 'bg-slate-800 border-slate-600 shadow-md' : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/60'}`}
        >
          <div className={`p-2 rounded-lg ${activeTab === 'wealth' ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-400'}`}>
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <p className={`font-medium ${activeTab === 'wealth' ? 'text-slate-100' : 'text-slate-300'}`}>Wealth Erosion</p>
            <p className="text-xs text-slate-500">CPI vs Interest Rates</p>
          </div>
        </button>

        <button 
          onClick={() => setActiveTab('housing')}
          className={`flex items-center gap-3 p-4 rounded-2xl border transition-all text-left ${activeTab === 'housing' ? 'bg-slate-800 border-slate-600 shadow-md' : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/60'}`}
        >
          <div className={`p-2 rounded-lg ${activeTab === 'housing' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-400'}`}>
            <Home className="w-5 h-5" />
          </div>
          <div>
            <p className={`font-medium ${activeTab === 'housing' ? 'text-slate-100' : 'text-slate-300'}`}>Housing Affordability</p>
            <p className="text-xs text-slate-500">HDB Resale Index Growth</p>
          </div>
        </button>

        <button 
          onClick={() => setActiveTab('wages')}
          className={`flex items-center gap-3 p-4 rounded-2xl border transition-all text-left ${activeTab === 'wages' ? 'bg-slate-800 border-slate-600 shadow-md' : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/60'}`}
        >
          <div className={`p-2 rounded-lg ${activeTab === 'wages' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <p className={`font-medium ${activeTab === 'wages' ? 'text-slate-100' : 'text-slate-300'}`}>Wage Stagnation</p>
            <p className="text-xs text-slate-500">Median Income by Age</p>
          </div>
        </button>
      </div>

      {/* Main Chart Area */}
      <div className="flex-1 bg-slate-900/40 p-6 lg:p-8 rounded-[2rem] border border-slate-700/50 shadow-2xl backdrop-blur-3xl relative flex flex-col min-h-0">
        
        {/* Header & Filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h3 className="text-2xl font-semibold text-slate-100 tracking-wide">
              {activeTab === 'wealth' && "Historical Purchasing Power"}
              {activeTab === 'housing' && "Exponential Housing Growth"}
              {activeTab === 'wages' && "The Earning Lifecycle"}
            </h3>
            <p className="text-slate-400 text-sm">
              {activeTab === 'wages' ? 'SingStat 2024 Demographic Data' : 'Time-series empirical data (SingStat & MAS)'}
            </p>
          </div>

          {activeTab !== 'wages' && (
            <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
              {[3, 5, 10, 20].map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeframe(t as any)}
                  className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    timeframe === t ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t === 20 ? 'Max' : `${t}Y`}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Chart Container */}
        <div className="flex-1 w-full min-h-[300px] relative">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Activity className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {activeTab === 'wealth' ? (
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.5} />
                  <XAxis dataKey="year" stroke="#64748b" tickLine={false} axisLine={false} tickMargin={12} />
                  <YAxis stroke="#64748b" tickFormatter={(v) => `$${v/1000}k`} tickLine={false} axisLine={false} tickMargin={12} />
                  <Tooltip 
                    formatter={(value: any) => `$${value.toLocaleString()}`}
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '12px', border: '1px solid rgba(51, 65, 85, 0.5)' }}
                  />
                  <Area type="monotone" dataKey="value" name="Cost of Living" stroke="#ef4444" strokeWidth={3} fill="url(#colorCost)" />
                  <Line type="monotone" dataKey="baseline" name="Savings (CPF OA)" stroke="#64748b" strokeWidth={3} dot={false} />
                </AreaChart>
              ) : activeTab === 'housing' ? (
                <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.5} />
                  <XAxis dataKey="year" stroke="#64748b" tickLine={false} axisLine={false} tickMargin={12} />
                  <YAxis stroke="#64748b" tickLine={false} axisLine={false} tickMargin={12} domain={['dataMin - 10', 'auto']} />
                  <Tooltip 
                    formatter={(value: any) => value.toLocaleString()}
                    labelFormatter={(label) => `Year ${label}`}
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '12px', border: '1px solid rgba(51, 65, 85, 0.5)' }}
                  />
                  <Bar dataKey="value" name="Property Index" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorWage" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.5} />
                  <XAxis dataKey="year" stroke="#64748b" tickLine={false} axisLine={false} tickMargin={12} />
                  <YAxis stroke="#64748b" tickFormatter={(v) => `$${v}`} tickLine={false} axisLine={false} tickMargin={12} />
                  <Tooltip 
                    formatter={(value: any) => `$${value.toLocaleString()}`}
                    labelFormatter={(label) => `Age Group ${label}`}
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '12px', border: '1px solid rgba(51, 65, 85, 0.5)' }}
                  />
                  <Area type="monotone" dataKey="value" name="Median Income" stroke="#10b981" strokeWidth={3} fill="url(#colorWage)" />
                </AreaChart>
              )}
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
