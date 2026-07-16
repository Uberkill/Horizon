import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { AlertTriangle, X, ChevronDown, ChevronUp } from 'lucide-react';

export function IntakeScreen() {
  const { 
    clientData, setClientData, 
    isDrawerOpen, setDrawerOpen,
    portfolioRiskRatio, setPortfolioRiskRatio,
    hasProtectionPlan, setHasProtectionPlan
  } = useStore();
  const [warnings, setWarnings] = useState<string[]>([]);
  const [expandedPill, setExpandedPill] = useState<string | null>(null);

  const LIFESTYLES = [
    { id: 'basic', label: 'Basic Survival', amount: 2000, context: "Solo, Paid HDB, Public Transport" },
    { id: 'middle', label: 'Middle-Class Comfort', amount: 5000, context: "Married, Dining Out, Shield Plans" },
    { id: 'luxury', label: 'Luxury Horizon', amount: 10000, context: "Private Healthcare, Car, Travel" }
  ];

  useEffect(() => {
    const newWarnings: string[] = [];
    if (clientData.monthlyIncome > 0) {
      if (clientData.monthlyExpenses > clientData.monthlyIncome) {
        newWarnings.push("Warning: Monthly expenses exceed income.");
      } else {
        const savingsRate = ((clientData.monthlyIncome - clientData.monthlyExpenses) / clientData.monthlyIncome) * 100;
        if (savingsRate > 70) {
          newWarnings.push("Review: Unusually high savings rate — please confirm.");
        }
      }
    }
    setWarnings(newWarnings);
  }, [clientData.monthlyIncome, clientData.monthlyExpenses]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let parsed = Number(value);
    if (isNaN(parsed)) parsed = 0;
    setClientData({ [name]: parsed });
  };

  return (
    <>
      {/* Backdrop overlay for smaller screens when drawer is open */}
      <div 
        onClick={() => setDrawerOpen(false)}
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-500 lg:hidden ${
          isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />
      
      {/* Offcanvas Side Drawer */}
      <div 
        className={`fixed top-0 left-0 h-[calc(100vh-73px)] mt-[73px] w-[400px] max-w-full bg-slate-900/90 backdrop-blur-3xl border-r border-slate-700/50 z-50 transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-2xl flex flex-col ${
          isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50 bg-slate-800/30">
          <div>
            <h2 className="text-lg font-medium text-slate-300">Client Configuration</h2>
            <p className="text-slate-400 text-xs mt-1">Adjust metrics to update the Life Canvas.</p>
          </div>
          <button 
            onClick={() => setDrawerOpen(false)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors duration-300 border border-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 [&::-webkit-scrollbar]:hidden">
          {warnings.length > 0 && (
            <div className="space-y-2 mb-4">
              {warnings.map((warning, idx) => (
                <div key={idx} className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-sm">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <p>{warning}</p>
                </div>
              ))}
            </div>
          )}

          <InputField label="Current Age" name="age" value={clientData.age} min={18} max={80} step={1} onChange={handleChange} />
          <InputField label="Target Retirement Age" name="targetAge" value={clientData.targetAge} min={clientData.age + 1} max={90} step={1} onChange={handleChange} />
          <InputField label="Monthly Income ($)" name="monthlyIncome" value={clientData.monthlyIncome} min={0} max={200000} isLogarithmic={true} onChange={handleChange} />
          
          <div className="space-y-3 pt-2">
            <label className="text-sm font-medium text-slate-300">Retirement Lifestyle (Today's Value)</label>
            <div className="flex flex-wrap gap-2">
              {LIFESTYLES.map((style) => {
                const isActive = clientData.monthlyExpenses === style.amount;
                return (
                  <div key={style.id} className="flex flex-col w-full">
                    <button
                      onClick={() => {
                        setClientData({ monthlyExpenses: style.amount });
                        setExpandedPill(isActive && expandedPill === style.id ? null : style.id);
                      }}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-medium transition-all duration-300 ${
                        isActive 
                          ? 'bg-lime-500/20 border-lime-500/50 text-lime-400' 
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span>{style.label} (${style.amount})</span>
                      {expandedPill === style.id ? <ChevronUp className="w-3 h-3 ml-2" /> : <ChevronDown className="w-3 h-3 ml-2" />}
                    </button>
                    {expandedPill === style.id && (
                      <div className="mt-1 p-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-[10px] text-slate-400 italic">
                        {style.context}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <InputField label="Monthly Expenses ($)" name="monthlyExpenses" value={clientData.monthlyExpenses} min={0} max={200000} isLogarithmic={true} onChange={handleChange} />
          </div>

          <InputField label="Cash in Bank ($)" name="cash" value={clientData.cash} min={0} max={10000000} isLogarithmic={true} onChange={handleChange} />
          <InputField label="CPF OA Balance ($)" name="cpfOA" value={clientData.cpfOA} min={0} max={10000000} isLogarithmic={true} onChange={handleChange} />
          <InputField label="Total Debt ($)" name="totalDebt" value={clientData.totalDebt} min={0} max={10000000} isLogarithmic={true} onChange={handleChange} />
          
          <div className="pt-6 mt-6 border-t border-slate-700/50 space-y-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">FA Portfolio Sandbox</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-medium text-slate-300">
                <span>Safe (Endowments)</span>
                <span>Growth (ILPs)</span>
              </div>
              <input 
                type="range" 
                min={0} max={100} step={1}
                value={portfolioRiskRatio}
                onChange={(e) => setPortfolioRiskRatio(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-lime-500 hover:accent-lime-400 transition-all duration-300"
              />
              <div className="flex justify-between items-center text-[10px] text-slate-500">
                <span>{100 - portfolioRiskRatio}% Allocation</span>
                <span>{portfolioRiskRatio}% Allocation</span>
              </div>
            </div>

            <div 
              className={`flex items-start justify-between gap-4 cursor-pointer group outline-none rounded-lg p-3 border transition-all duration-300 ${
                hasProtectionPlan ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-slate-800 border-slate-700'
              }`}
              onClick={() => setHasProtectionPlan(!hasProtectionPlan)}
            >
              <div className="space-y-1">
                <span className={`text-sm font-medium transition-colors ${hasProtectionPlan ? 'text-indigo-400' : 'text-slate-300'}`}>
                  Comprehensive Shield / CI
                </span>
                <p className="text-xs text-slate-500">Transfers Medical Emergency risk to insurer (10% of Income).</p>
              </div>
              <div className={`w-10 h-6 rounded-full flex items-center p-1 shrink-0 transition-colors duration-300 ${
                hasProtectionPlan ? 'bg-indigo-500' : 'bg-slate-700 group-hover:bg-slate-600'
              }`}>
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${
                  hasProtectionPlan ? 'translate-x-4' : 'translate-x-0'
                }`} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function InputField({ label, name, value, min, max, step, isLogarithmic, onChange }: any) {
  const POWER = 4;
  
  // Dynamic rounding for clean visual numbers
  const roundValue = (val: number) => {
    if (val === 0) return 0;
    if (val < 1000) return Math.round(val / 100) * 100;
    if (val < 10000) return Math.round(val / 500) * 500;
    if (val < 100000) return Math.round(val / 1000) * 1000;
    if (val < 1000000) return Math.round(val / 10000) * 10000;
    return Math.round(val / 50000) * 50000;
  };

  const getSliderPosition = () => {
    if (!isLogarithmic) return value;
    if (value <= min) return 0;
    if (value >= max) return 100;
    return Math.pow((value - min) / (max - min), 1 / POWER) * 100;
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isLogarithmic) {
      onChange(e);
      return;
    }
    
    const pos = Number(e.target.value);
    let calculated = min + (max - min) * Math.pow(pos / 100, POWER);
    calculated = roundValue(calculated);
    
    // Simulate standard event
    onChange({
      target: { name, value: String(calculated) }
    } as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-slate-300">{label}</label>
        <input 
          type="number" 
          name={name}
          value={value} 
          onChange={onChange}
          className="w-28 bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-right text-slate-100 focus:outline-none focus:border-lime-500 focus:ring-1 focus:ring-lime-500 font-mono text-sm transition-all duration-300"
        />
      </div>
      <input 
        type="range" 
        name={name}
        min={isLogarithmic ? 0 : min} 
        max={isLogarithmic ? 100 : max} 
        step={isLogarithmic ? 0.1 : step}
        value={getSliderPosition()} 
        onChange={handleSliderChange}
        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-lime-500 hover:accent-lime-400 transition-all duration-300"
      />
    </div>
  );
}
