import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { AlertTriangle, X, ChevronDown, ChevronUp, Landmark } from 'lucide-react';
import { calculateTax } from '../utils/taxEngine';

export function IntakeScreen() {
  const { 
    clientData, setClientData, 
    isDrawerOpen, setDrawerOpen,
    hasShieldPlan, setHasShieldPlan,
    hasCIPlan, setHasCIPlan,
    premiumEndowment, setPremiumEndowment,
    premiumILP, setPremiumILP,
    premiumAnnuity, setPremiumAnnuity,
    premiumSRS, setPremiumSRS,
    dispatchHUDEvent
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

  const monthlySurplus = clientData.monthlyIncome - clientData.monthlyExpenses;
  let totalPremiums = 0;
  if (hasShieldPlan) totalPremiums += 100;
  if (hasCIPlan) totalPremiums += 200;
  totalPremiums += premiumEndowment + premiumILP + premiumAnnuity + premiumSRS;
  
  const unallocated = monthlySurplus - totalPremiums;
  const isDeficit = unallocated < 0;

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
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-500 lg:hidden print:hidden ${
          isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />
      
      {/* Offcanvas Side Drawer */}
      <div 
        className={`fixed top-0 left-0 h-[calc(100vh-73px)] mt-[73px] w-full sm:w-[400px] bg-slate-900/90 backdrop-blur-3xl border-r border-slate-700/50 z-50 transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-2xl flex flex-col print:hidden ${
          isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50 bg-slate-800/30">
          <div>
            <h2 className="text-lg font-medium text-slate-300">Portfolio Architect</h2>
            <p className="text-slate-400 text-xs mt-1">Design the financial strategy.</p>
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

          {/* Profile sliders have been migrated to the PlanningForm to reduce cognitive overload during the pitch */}
          
          <div className="space-y-6">
            
            <div className={`sticky top-0 z-20 p-4 rounded-xl border backdrop-blur-xl shadow-lg transition-colors duration-300 ${isDeficit ? 'bg-rose-500/10 border-rose-500/50' : 'bg-slate-800/80 border-slate-700'}`}>
               <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Unallocated Cash Flow</h3>
               <div className={`text-2xl font-bold font-mono tracking-tight ${isDeficit ? 'text-rose-400' : 'text-lime-400'}`}>
                 ${unallocated.toLocaleString()}/mo
               </div>
               {isDeficit && <p className="text-xs text-rose-400 mt-1">Warning: Client cannot afford this portfolio.</p>}
            </div>

            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">FA Product Cart</h3>
            
            {/* Bucket 1: Protection */}
            <div className="space-y-3">
              <h4 className="text-xs font-medium text-slate-500 uppercase">Bucket 1: Protection (The Moat)</h4>
              
              <ToggleCard 
                active={hasShieldPlan} 
                onToggle={() => {
                  setHasShieldPlan(!hasShieldPlan);
                  if (!hasShieldPlan) dispatchHUDEvent({ type: 'absorbed', message: 'Hospital Shield Equipped', severity: 'normal' });
                }}
                title="Integrated Shield + Rider" 
                desc="Neutralizes Medical Emergency drawdown." 
                cost="$100/mo" 
              />
              <ToggleCard 
                active={hasCIPlan} 
                onToggle={() => {
                  setHasCIPlan(!hasCIPlan);
                  if (!hasCIPlan) dispatchHUDEvent({ type: 'absorbed', message: 'CI Armor Equipped', severity: 'normal' });
                }}
                title="Early Critical Illness (Singlife)" 
                desc="Injects $200k cash upon diagnosis." 
                cost="$200/mo" 
              />
            </div>

            {/* Bucket 2 & 3: Wealth */}
            <div className="space-y-4">
              <h4 className="text-xs font-medium text-slate-500 uppercase mt-4">Bucket 2 & 3: Wealth Accumulation</h4>
              
              <PremiumInput 
                 label="Endowment (Great Eastern)" 
                 desc="3.5% yield. Safe bedrock (Purple layer)." 
                 value={premiumEndowment} 
                 onChange={(e: any) => setPremiumEndowment(Number(e.target.value))} 
              />
              <PremiumInput 
                 label="100% ILP (Manulife)" 
                 desc="7.5% yield. Growth engine (Lime layer)." 
                 value={premiumILP} 
                 onChange={(e: any) => setPremiumILP(Number(e.target.value))} 
              />
            </div>

            {/* Advanced Cabinet */}
            <div className="pt-4 border-t border-slate-700/50">
               <button 
                 onClick={() => setExpandedPill(expandedPill === 'adv' ? null : 'adv')}
                 className="flex items-center justify-between w-full p-3 bg-slate-800 rounded-lg text-sm text-slate-300 font-medium hover:bg-slate-700 transition-colors"
               >
                 Advanced Strategies (High-Net-Worth)
                 {expandedPill === 'adv' ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
               </button>

               {expandedPill === 'adv' && (
                 <div className="mt-4 space-y-4 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                    <PremiumInput 
                       label="Retirement Annuity (NTUC)" 
                       desc="4.5% yield. Guaranteed payout (Orange layer)." 
                       value={premiumAnnuity} 
                       onChange={(e: any) => setPremiumAnnuity(Number(e.target.value))} 
                    />
                    <PremiumInput 
                       label="SRS Index Fund" 
                       desc="6.0% yield. Tax-optimized (Yellow layer)." 
                       value={premiumSRS} 
                       onChange={(e: any) => setPremiumSRS(Number(e.target.value))} 
                    />
                    
                    {premiumSRS > 0 && (
                      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 flex items-start gap-3 mt-4 animate-in fade-in slide-in-from-top-2">
                        <Landmark className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-emerald-400">
                            ${calculateTax(clientData.monthlyIncome * 12, premiumSRS * 12).taxSaved.toLocaleString()} Tax Saved
                          </p>
                          <p className="text-[10px] text-emerald-500/80 mt-1 leading-snug">
                            Annual IRAS tax relief achieved via SRS top-up. 
                            (Capped at $15,300/yr).
                          </p>
                        </div>
                      </div>
                    )}
                 </div>
               )}
            </div>

            {/* Life Events Cabinet */}
            <div className="pt-4 border-t border-slate-700/50">
               <button 
                 onClick={() => setExpandedPill(expandedPill === 'events' ? null : 'events')}
                 className="flex items-center justify-between w-full p-3 bg-slate-800 rounded-lg text-sm text-slate-300 font-medium hover:bg-slate-700 transition-colors"
               >
                 Life Events (Drawdowns)
                 {expandedPill === 'events' ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
               </button>

               {expandedPill === 'events' && (
                 <div className="mt-4 space-y-4 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                    <button 
                      onClick={() => {
                        const eventAge = Math.min(clientData.age + 5, 80);
                        useStore.getState().addLifeEvent({ age: eventAge, costCash: 50000, costCPF: 0, category: 'general', label: 'Wedding / BTO' });
                      }}
                      className="w-full p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2"
                    >
                      + Add Major Expense
                    </button>
                    
                    {useStore.getState().lifeEvents.map(ev => (
                      <div key={ev.id} className="bg-slate-900 border border-slate-700 p-3 rounded-lg relative space-y-3">
                        <button 
                          onClick={() => useStore.getState().removeLifeEvent(ev.id)}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-rose-500 hover:bg-rose-600 rounded-full flex items-center justify-center text-white z-10 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>

                        <div className="flex gap-2">
                          <input 
                            type="text"
                            value={ev.label}
                            onChange={(e) => {
                              const state = useStore.getState();
                              state.lifeEvents = state.lifeEvents.map(x => x.id === ev.id ? { ...x, label: e.target.value } : x);
                              useStore.setState({ lifeEvents: [...state.lifeEvents] });
                            }}
                            className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                            placeholder="Event Name"
                          />
                          <select 
                            value={ev.category}
                            onChange={(e) => {
                              const state = useStore.getState();
                              const newCat = e.target.value as 'general' | 'housing';
                              // If switching away from housing, wipe CPF cost
                              state.lifeEvents = state.lifeEvents.map(x => x.id === ev.id ? { ...x, category: newCat, costCPF: newCat === 'general' ? 0 : x.costCPF } : x);
                              useStore.setState({ lifeEvents: [...state.lifeEvents] });
                            }}
                            className="bg-slate-800 border border-slate-600 rounded-lg px-2 py-1.5 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                          >
                            <option value="general">General</option>
                            <option value="housing">Housing</option>
                          </select>
                        </div>

                        <InputField 
                          label="Age" 
                          name={`eventAge_${ev.id}`} 
                          value={ev.age} 
                          min={clientData.age} 
                          max={clientData.targetAge} 
                          step={1} 
                          onChange={(e: any) => {
                             const state = useStore.getState();
                             state.lifeEvents = state.lifeEvents.map(x => x.id === ev.id ? { ...x, age: Number(e.target.value) } : x);
                             useStore.setState({ lifeEvents: [...state.lifeEvents] });
                          }} 
                        />
                        
                        <InputField 
                          label="Cost (Cash)" 
                          name={`eventCostCash_${ev.id}`} 
                          value={ev.costCash} 
                          min={0} 
                          max={2000000} 
                          isLogarithmic={true} 
                          onChange={(e: any) => {
                             const state = useStore.getState();
                             state.lifeEvents = state.lifeEvents.map(x => x.id === ev.id ? { ...x, costCash: Number(e.target.value) } : x);
                             useStore.setState({ lifeEvents: [...state.lifeEvents] });
                          }} 
                        />

                        {ev.category === 'housing' && (
                          <InputField 
                            label="Cost (CPF OA)" 
                            name={`eventCostCPF_${ev.id}`} 
                            value={ev.costCPF} 
                            min={0} 
                            max={2000000} 
                            isLogarithmic={true} 
                            onChange={(e: any) => {
                               const state = useStore.getState();
                               state.lifeEvents = state.lifeEvents.map(x => x.id === ev.id ? { ...x, costCPF: Number(e.target.value) } : x);
                               useStore.setState({ lifeEvents: [...state.lifeEvents] });
                            }} 
                          />
                        )}
                      </div>
                    ))}
                 </div>
               )}
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

function InputField({ label, name, value, min, max, step, isLogarithmic, onChange }: any) {
  const POWER = 4;
  const [localValue, setLocalValue] = React.useState(value);
  const throttleTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastCall = React.useRef(0);

  // Sync external changes (e.g. initial load or resets)
  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);
  
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
    if (!isLogarithmic) return localValue;
    if (localValue <= min) return 0;
    if (localValue >= max) return 100;
    return Math.pow((localValue - min) / (max - min), 1 / POWER) * 100;
  };

  const commitChange = (valToCommit: number, originalEvent?: React.ChangeEvent<HTMLInputElement>) => {
    const now = Date.now();
    if (now - lastCall.current >= 50) {
      if (originalEvent && !isLogarithmic) {
        onChange(originalEvent);
      } else {
        onChange({
          target: { name, value: String(valToCommit) }
        } as React.ChangeEvent<HTMLInputElement>);
      }
      lastCall.current = now;
    } else {
      if (throttleTimeout.current) clearTimeout(throttleTimeout.current);
      throttleTimeout.current = setTimeout(() => {
        if (originalEvent && !isLogarithmic) {
          onChange(originalEvent);
        } else {
          onChange({
            target: { name, value: String(valToCommit) }
          } as React.ChangeEvent<HTMLInputElement>);
        }
        lastCall.current = Date.now();
      }, 50);
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isLogarithmic) {
      const val = Number(e.target.value);
      setLocalValue(val);
      commitChange(val, e);
      return;
    }
    
    const pos = Number(e.target.value);
    let calculated = min + (max - min) * Math.pow(pos / 100, POWER);
    calculated = roundValue(calculated);
    
    setLocalValue(calculated);
    commitChange(calculated);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-slate-300">{label}</label>
        <input 
          type="number" 
          inputMode="decimal"
          pattern="[0-9]*"
          name={name}
          value={localValue} 
          onChange={(e) => {
            setLocalValue(Number(e.target.value));
            commitChange(Number(e.target.value), e);
          }}
          className="w-28 bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-right text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono text-sm transition-all duration-300"
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
        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all duration-300"
      />
    </div>
  );
}

function ToggleCard({ active, onToggle, title, desc, cost }: any) {
  return (
    <div 
      className={`flex items-start justify-between gap-4 cursor-pointer group outline-none rounded-lg p-3 border transition-all duration-300 ${
        active ? 'bg-blue-500/10 border-blue-500/30' : 'bg-slate-800 border-slate-700'
      }`}
      onClick={onToggle}
    >
      <div className="space-y-1">
        <span className={`text-sm font-medium transition-colors ${active ? 'text-blue-400' : 'text-slate-300'}`}>
          {title} <span className="text-slate-500 font-normal">({cost})</span>
        </span>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
      <div className={`w-10 h-6 rounded-full flex items-center p-1 shrink-0 transition-colors duration-300 ${
        active ? 'bg-blue-500' : 'bg-slate-700 group-hover:bg-slate-600'
      }`}>
        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${
          active ? 'translate-x-4' : 'translate-x-0'
        }`} />
      </div>
    </div>
  );
}

function PremiumInput({ label, desc, value, onChange }: any) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
      <div className="flex justify-between items-center mb-1">
        <label className="text-sm font-medium text-slate-300">{label}</label>
        <div className="flex items-center">
          <span className="text-slate-500 text-sm mr-2">$</span>
          <input 
            type="number" 
            inputMode="decimal"
            pattern="[0-9]*"
            value={value || ''} 
            onChange={onChange}
            placeholder="0"
            className="w-20 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-right text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono text-sm transition-all duration-300"
          />
          <span className="text-slate-500 text-xs ml-2">/mo</span>
        </div>
      </div>
      <p className="text-xs text-slate-500">{desc}</p>
    </div>
  );
}
