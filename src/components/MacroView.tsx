import { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { MACRO_NARRATIVES } from '../constants/narratives';
import { 
  TrendingDown, Home, Briefcase, Activity, 
  ShoppingCart, Landmark, Car, Baby, HeartPulse, 
  Hourglass, GraduationCap, Users, Target, ShieldCheck, X, ExternalLink 
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

type TabKey = 'wealth' | 'food' | 'debt' | 'housing' | 'coe' | 'childcare' | 'wages' | 'medical' | 'longevity' | 'education' | 'taxbase' | 'frs';

const MODULES = {
  economic: [
    { id: 'wealth', label: 'Wealth Erosion', icon: TrendingDown, sub: 'Core Inflation vs CPF' },
    { id: 'food', label: 'The Daily Squeeze', icon: ShoppingCart, sub: 'CPI - Food' },
    { id: 'debt', label: 'The Debt Trap', icon: Landmark, sub: 'MAS SORA Rates' }
  ],
  lifestyle: [
    { id: 'housing', label: 'Housing Affordability', icon: Home, sub: 'HDB Resale Index' },
    { id: 'coe', label: 'Cost of Aspiration', icon: Car, sub: 'COE Premiums' },
    { id: 'childcare', label: 'The Parent Penalty', icon: Baby, sub: 'CPI - Childcare' }
  ],
  demographic: [
    { id: 'wages', label: 'Wage Stagnation', icon: Briefcase, sub: 'Median Income Curve' },
    { id: 'medical', label: 'Healthcare Crisis', icon: HeartPulse, sub: 'Medical Inflation' },
    { id: 'longevity', label: 'Longevity Risk', icon: Hourglass, sub: 'Life Expectancy' },
    { id: 'education', label: 'Education Inflation', icon: GraduationCap, sub: 'University Costs' },
    { id: 'taxbase', label: 'Shrinking Tax Base', icon: Users, sub: 'Old-Age Support Ratio' },
    { id: 'frs', label: 'Moving Goalpost', icon: Target, sub: 'CPF FRS Escalation' }
  ]
};

export function MacroView() {
  const [activeTab, setActiveTab] = useState<TabKey>('wealth');
  const [timeframe, setTimeframe] = useState<3 | 5 | 10 | 20>(20);
  
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifierOpen, setVerifierOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const loadData = async () => {
      let fetchedData: any[] = [];
      
      switch(activeTab) {
        case 'wealth': fetchedData = await apiService.fetchWealthErosion(); break;
        case 'food': fetchedData = await apiService.fetchFoodInflation(); break;
        case 'debt': fetchedData = await apiService.fetchSoraRates(); break;
        case 'housing': fetchedData = await apiService.fetchHousingIndex(); break;
        case 'coe': fetchedData = await apiService.fetchCoePrices(); break;
        case 'childcare': fetchedData = await apiService.fetchChildcareCosts(); break;
        case 'wages': fetchedData = await apiService.fetchWageCurve(); break;
        case 'medical': fetchedData = await apiService.fetchMedicalInflation(); break;
        case 'longevity': fetchedData = await apiService.fetchLifeExpectancy(); break;
        case 'education': fetchedData = await apiService.fetchEducationInflation(); break;
        case 'taxbase': fetchedData = await apiService.fetchOldAgeSupportRatio(); break;
        case 'frs': fetchedData = await apiService.fetchCpfFrs(); break;
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

  const getChartConfig = () => {
    switch(activeTab) {
      case 'wealth': return { type: 'area', color: '#ef4444', prefix: '$', name: 'Cost of Living', hasBaseline: true };
      case 'food': return { type: 'area', color: '#f97316', prefix: '', name: 'Food Price Index' };
      case 'debt': return { type: 'line', color: '#eab308', prefix: '', name: 'SORA Rate (%)' };
      case 'housing': return { type: 'bar', color: '#3b82f6', prefix: '', name: 'Property Index' };
      case 'coe': return { type: 'bar', color: '#8b5cf6', prefix: '$', name: 'COE Premium' };
      case 'childcare': return { type: 'area', color: '#ec4899', prefix: '$', name: 'Avg Monthly Cost' };
      case 'wages': return { type: 'area', color: '#10b981', prefix: '$', name: 'Median Monthly Income' };
      case 'medical': return { type: 'area', color: '#f43f5e', prefix: '', name: 'Medical Inflation Index' };
      case 'longevity': return { type: 'line', color: '#06b6d4', prefix: '', name: 'Life Expectancy (Years)' };
      case 'education': return { type: 'area', color: '#6366f1', prefix: '$', name: 'Annual Tuition' };
      case 'taxbase': return { type: 'area', color: '#f59e0b', prefix: '', name: 'Working Adults per Senior' };
      case 'frs': return { type: 'area', color: '#14b8a6', prefix: '$', name: 'Full Retirement Sum' };
      default: return { type: 'area', color: '#3b82f6', prefix: '', name: 'Value' };
    }
  };

  const config = getChartConfig();

  const getSourceDetails = () => {
    switch(activeTab) {
      case 'wealth': return { source: 'Monetary Authority of Singapore (MAS)', id: 'MAS_CORE_INFLATION', url: 'https://www.mas.gov.sg/statistics/consumer-price-developments' };
      case 'food': return { source: 'Singapore Department of Statistics (SingStat)', id: 'SINGSTAT_CPI_FOOD', url: 'https://tablebuilder.singstat.gov.sg/table/TS/M212881' };
      case 'debt': return { source: 'Monetary Authority of Singapore (MAS)', id: 'MAS_SORA_HISTORICAL', url: 'https://eservices.mas.gov.sg/statistics/dir/DomesticInterestRates.aspx' };
      case 'housing': return { source: 'Housing & Development Board (HDB)', id: 'HDB_RESALE_PRICE_INDEX', url: 'https://www.hdb.gov.sg/residential/selling-a-flat/overview/resale-statistics' };
      case 'coe': return { source: 'Data.gov.sg (LTA)', id: 'LTA_COE_PREMIUMS', url: 'https://data.gov.sg/datasets/d_69b3380ad7e51aff3a7dcc84eba52b8a/view' };
      case 'childcare': return { source: 'Data.gov.sg (ECDA)', id: 'ECDA_FEE_STATISTICS', url: 'https://data.gov.sg/datasets/d_44cfe12f2858ae503a093dfc075a28be/view' };
      case 'wages': return { source: 'Ministry of Manpower (MOM)', id: 'MOM_INCOME_STATISTICS', url: 'https://stats.mom.gov.sg/Pages/Income-Summary-Table.aspx' };
      case 'medical': return { source: 'Singapore Department of Statistics (SingStat)', id: 'SINGSTAT_CPI_HEALTHCARE', url: 'https://tablebuilder.singstat.gov.sg/table/TS/M212881' };
      case 'longevity': return { source: 'Singapore Department of Statistics (SingStat)', id: 'SINGSTAT_LIFE_EXPECTANCY', url: 'https://tablebuilder.singstat.gov.sg/table/TS/M810501' };
      case 'education': return { source: 'Ministry of Education (MOE)', id: 'MOE_UNIVERSITY_FEES', url: 'https://www.moe.gov.sg/post-secondary/autonomous-universities' };
      case 'taxbase': return { source: 'Singapore Department of Statistics (SingStat)', id: 'SINGSTAT_OLD_AGE_SUPPORT', url: 'https://tablebuilder.singstat.gov.sg/table/TS/M810361' };
      case 'frs': return { source: 'Central Provident Fund Board (CPF)', id: 'CPFB_RETIREMENT_SUM', url: 'https://www.cpf.gov.sg/member/faq/retirement-income/retirement-accounts/what-are-the-retirement-sums---basic-retirement-sum--brs---full-retiremen' };
      default: return { source: 'Singapore Department of Statistics (SingStat)', id: `SINGSTAT_DEFAULT`, url: 'https://tablebuilder.singstat.gov.sg/' };
    }
  };

  const sourceDetails = getSourceDetails();

  return (
    <div className="w-full h-full flex flex-col lg:flex-row p-4 lg:p-6 gap-4 lg:gap-6 max-w-[1800px] mx-auto overflow-hidden animate-in fade-in zoom-in-95 duration-500">
      
      {/* 12-Module Sidebar */}
      <div className="w-full lg:w-[320px] flex-shrink-0 flex flex-col gap-2 h-full overflow-y-auto [&::-webkit-scrollbar]:hidden pb-12 pr-2">
        <div className="mb-2">
          <h2 className="text-sm font-medium uppercase tracking-wider text-slate-400">Intelligence Arsenal</h2>
        </div>

        {Object.entries(MODULES).map(([category, items]) => (
          <div key={category} className="mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 pl-2">
              {category.replace('economic', 'Economic Threats').replace('lifestyle', 'Lifestyle & Aspiration').replace('demographic', 'Demographic Destiny')}
            </h3>
            <div className="flex flex-col gap-2">
              {items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button 
                    key={item.id}
                    onClick={() => setActiveTab(item.id as TabKey)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 text-left ${isActive ? 'bg-slate-800 border-slate-600 shadow-md' : 'bg-transparent border-transparent hover:bg-slate-800/40'}`}
                  >
                    <div className={`p-1.5 rounded-lg ${isActive ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-400'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className={`font-medium text-sm ${isActive ? 'text-slate-100' : 'text-slate-300'}`}>{item.label}</p>
                      <p className="text-[10px] text-slate-500">{item.sub}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Main Chart Area */}
      <div className="flex-1 bg-slate-900/40 p-6 lg:p-8 rounded-[2rem] border border-slate-700/50 shadow-2xl backdrop-blur-3xl relative flex flex-col min-h-0">
        
        {/* Header & Filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h3 className="text-2xl font-semibold text-slate-100 tracking-wide">
              {MODULES.economic.concat(MODULES.lifestyle, MODULES.demographic).find(m => m.id === activeTab)?.label}
            </h3>
            <p className="text-slate-400 text-sm mb-3">
              {MODULES.economic.concat(MODULES.lifestyle, MODULES.demographic).find(m => m.id === activeTab)?.sub}
            </p>
            {/* Consultant Context Box */}
            <div className="bg-slate-800/50 border border-slate-700/50 p-3 rounded-xl max-w-2xl backdrop-blur-md">
              <p className="text-sm text-slate-300 leading-relaxed italic">
                "{MACRO_NARRATIVES[MODULES.economic.concat(MODULES.lifestyle, MODULES.demographic).find(m => m.id === activeTab)?.label || '']}"
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setVerifierOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors duration-300 border border-emerald-500/20 text-xs font-medium"
            >
              <ShieldCheck className="w-4 h-4" />
              Verify Source
            </button>

            {activeTab !== 'wages' && (
              <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
                {[3, 5, 10, 20].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTimeframe(t as any)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors duration-300 ${
                      timeframe === t ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {t === 20 ? 'Max' : `${t}Y`}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chart Container */}
        <div className="flex-1 w-full min-h-[300px] relative">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Activity className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {config.type === 'area' ? (
                <AreaChart data={data} margin={{ top: 10, right: 10, left: 40, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`color-${activeTab}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={config.color} stopOpacity={0.4}/>
                      <stop offset="95%" stopColor={config.color} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.5} />
                  <XAxis dataKey="year" stroke="#64748b" tickLine={false} axisLine={false} tickMargin={12} />
                  <YAxis stroke="#64748b" tickFormatter={(v) => `${config.prefix}${v.toLocaleString()}`} tickLine={false} axisLine={false} tickMargin={12} />
                  <Tooltip 
                    formatter={(value: any) => `${config.prefix}${value.toLocaleString()}`}
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '12px', border: '1px solid rgba(51, 65, 85, 0.5)' }}
                  />
                  <Area type="monotone" dataKey="value" name={config.name} stroke={config.color} strokeWidth={3} fill={`url(#color-${activeTab})`} />
                  {config.hasBaseline && <Line type="monotone" dataKey="baseline" name="Savings (CPF OA)" stroke="#64748b" strokeWidth={3} dot={false} />}
                </AreaChart>
              ) : config.type === 'bar' ? (
                <BarChart data={data} margin={{ top: 10, right: 10, left: 40, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.5} />
                  <XAxis dataKey="year" stroke="#64748b" tickLine={false} axisLine={false} tickMargin={12} />
                  <YAxis stroke="#64748b" tickFormatter={(v) => `${config.prefix}${v.toLocaleString()}`} tickLine={false} axisLine={false} tickMargin={12} domain={['dataMin', 'auto']} />
                  <Tooltip 
                    formatter={(value: any) => `${config.prefix}${value.toLocaleString()}`}
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '12px', border: '1px solid rgba(51, 65, 85, 0.5)' }}
                  />
                  <Bar dataKey="value" name={config.name} fill={config.color} radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                <LineChart data={data} margin={{ top: 10, right: 10, left: 40, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.5} />
                  <XAxis dataKey="year" stroke="#64748b" tickLine={false} axisLine={false} tickMargin={12} />
                  <YAxis stroke="#64748b" tickFormatter={(v) => `${config.prefix}${v.toLocaleString()}`} tickLine={false} axisLine={false} tickMargin={12} domain={['dataMin', 'auto']} />
                  <Tooltip 
                    formatter={(value: any) => `${config.prefix}${value.toLocaleString()}`}
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '12px', border: '1px solid rgba(51, 65, 85, 0.5)' }}
                  />
                  <Line type="monotone" dataKey="value" name={config.name} stroke={config.color} strokeWidth={3} dot={{ r: 4, fill: config.color }} />
                </LineChart>
              )}
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Evidence Verifier Modal */}
      {isVerifierOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setVerifierOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors duration-300"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white">Source Verification</h4>
                <p className="text-sm text-emerald-400">Official Government Data</p>
              </div>
            </div>

            <div className="space-y-4 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Data Provider</p>
                <p className="text-sm font-medium text-slate-200">{sourceDetails.source}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Dataset ID</p>
                <p className="text-sm font-mono text-slate-400">{sourceDetails.id}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Live Endpoint</p>
                <p className="text-xs font-mono text-blue-400 truncate">{sourceDetails.url}</p>
              </div>
            </div>

            <a 
              href={sourceDetails.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-6 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-medium transition-colors"
            >
              Access Official Database
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
