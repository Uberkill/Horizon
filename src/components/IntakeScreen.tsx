import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { AlertTriangle, X, ChevronDown, ChevronUp } from 'lucide-react';

export function IntakeScreen() {
  const { clientData, setClientData, isDrawerOpen, setDrawerOpen } = useStore();
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
            <h2 className="text-xl font-semibold text-slate-100">Client Configuration</h2>
            <p className="text-slate-400 text-xs mt-1">Adjust metrics to update the Life Canvas.</p>
          </div>
          <button 
            onClick={() => setDrawerOpen(false)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-slate-700"
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
          <InputField label="Monthly Income ($)" name="monthlyIncome" value={clientData.monthlyIncome} min={0} max={200000} step={500} onChange={handleChange} />
          
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
                      className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
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
            <InputField label="Monthly Expenses ($)" name="monthlyExpenses" value={clientData.monthlyExpenses} min={0} max={200000} step={500} onChange={handleChange} />
          </div>

          <InputField label="Cash in Bank ($)" name="cash" value={clientData.cash} min={0} max={10000000} step={10000} onChange={handleChange} />
          <InputField label="CPF OA Balance ($)" name="cpfOA" value={clientData.cpfOA} min={0} max={10000000} step={10000} onChange={handleChange} />
          <InputField label="Total Debt ($)" name="totalDebt" value={clientData.totalDebt} min={0} max={10000000} step={10000} onChange={handleChange} />
        </div>
      </div>
    </>
  );
}

function InputField({ label, name, value, min, max, step, onChange }: any) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-slate-300">{label}</label>
        <input 
          type="number" 
          name={name}
          value={value} 
          onChange={onChange}
          className="w-28 bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-right text-slate-100 focus:outline-none focus:border-lime-500 focus:ring-1 focus:ring-lime-500 font-mono text-sm transition-all"
        />
      </div>
      <input 
        type="range" 
        name={name}
        min={min} 
        max={max} 
        step={step}
        value={value} 
        onChange={onChange}
        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-lime-500 hover:accent-lime-400 transition-all"
      />
    </div>
  );
}
