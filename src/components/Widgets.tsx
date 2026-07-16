import { useStore } from '../store/useStore';
import { apiService } from '../services/apiService';
import { ShieldAlert, Gauge, HeartHandshake } from 'lucide-react';
import React from 'react';

export function Widgets() {
  const { clientData, stressTests, toggleStressTest, economicData } = useStore();

  const netCashFlow = clientData.monthlyIncome - clientData.monthlyExpenses;
  const isInMassiveDebt = clientData.totalDebt > (clientData.monthlyIncome * 36);
  const isNegativeCashFlow = netCashFlow < 0;
  const showDebtMode = isInMassiveDebt || isNegativeCashFlow;
  
  // API-driven percentile calculation
  let percentile = 50;
  let medianIncome = 0;
  if (economicData?.momMedianIncomes) {
    medianIncome = apiService.getMedianForAge(clientData.age, economicData.momMedianIncomes);
    if (medianIncome > 0) {
      if (clientData.monthlyIncome >= medianIncome) {
        const ratio = (clientData.monthlyIncome - medianIncome) / medianIncome;
        percentile = 50 + Math.min(49, ratio * 40);
      } else {
        const ratio = clientData.monthlyIncome / medianIncome;
        percentile = Math.max(1, ratio * 50);
      }
    }
  }
  percentile = Math.round(percentile);

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-slate-900/40 p-6 lg:p-8 rounded-[2rem] border border-slate-700/50 shadow-2xl backdrop-blur-3xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 rounded-lg bg-lime-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(132,204,22,0.15)]">
            <ShieldAlert className="w-4 h-4 text-lime-400" />
          </div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Stress Tests</h3>
        </div>
        
        <div className="space-y-6">
          <StressToggle 
            active={stressTests.covidCrash}
            onClick={() => toggleStressTest('covidCrash')}
            title="Market Crash"
            description="Simulates a 30% portfolio drop"
          />
          <StressToggle 
            active={stressTests.sustainedInflation}
            onClick={() => toggleStressTest('sustainedInflation')}
            title="Inflation"
            description="Overrides inflation to 5% p.a."
          />
          <StressToggle 
            active={stressTests.medicalEmergency}
            onClick={() => toggleStressTest('medicalEmergency')}
            title="Medical Emergency"
            description="$3,000/mo extra expenses for 1yr"
          />
        </div>
      </div>

      <div className="bg-slate-900/40 p-6 lg:p-8 rounded-[2rem] border border-slate-700/50 shadow-2xl backdrop-blur-3xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.15)]">
            <Gauge className="w-4 h-4 text-blue-400" />
          </div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Peer Benchmark</h3>
        </div>
        
        {showDebtMode ? (
          <div className="flex items-start gap-4 p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
            <HeartHandshake className="w-8 h-8 text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <p className="text-slate-100 font-medium mb-1">Debt Reduction Focus</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Prioritizing clearing liabilities to build a stable foundation.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center pb-2 pt-4">
            <div className="relative w-36 h-36 flex items-center justify-center mb-4">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                />
                <path
                  className="text-blue-500 transition-all duration-1000 ease-out drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]"
                  strokeDasharray={`${percentile}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Top</span>
                <span className="text-3xl font-bold text-slate-100">{100 - percentile}%</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 text-center leading-relaxed max-w-[200px]">
              Benchmarked against MOM API Data for Age {clientData.age} (Median: ${medianIncome})
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function StressToggle({ active, onClick, title, description }: { active: boolean, onClick: () => void, title: string, description: string }) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div 
      className="flex items-start justify-between gap-4 cursor-pointer group outline-none focus-visible:ring-2 focus-visible:ring-lime-500 rounded-lg p-1 -m-1 transition-all duration-300" 
      onClick={onClick}
      role="switch"
      aria-checked={active}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div>
        <p className={`font-medium text-sm mb-1 transition-colors ${active ? 'text-slate-100' : 'text-slate-300'}`}>{title}</p>
        <p className="text-[11px] text-slate-500 leading-snug">{description}</p>
      </div>
      <div 
        className={`w-12 h-6 rounded-full p-1 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex-shrink-0 mt-0.5 flex items-center ${
          active ? 'bg-lime-400 shadow-[0_0_15px_rgba(163,230,53,0.5)]' : 'bg-slate-700/80 group-hover:bg-slate-600'
        }`}
      >
        <div 
          className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-sm ${
            active ? 'translate-x-6' : 'translate-x-0'
          }`} 
        />
      </div>
    </div>
  );
}
