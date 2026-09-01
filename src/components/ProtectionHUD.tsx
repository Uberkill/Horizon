import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { Shield, ShieldAlert, ShieldCheck, HeartPulse } from 'lucide-react';

export function ProtectionHUD() {
  const { hasShieldPlan, hasCIPlan, hudQueue, removeHUDEvent } = useStore();
  const [a11yMessage, setA11yMessage] = useState('');

  // Debounced A11y announcer
  useEffect(() => {
    let msg = '';
    if (hasShieldPlan && hasCIPlan) msg = 'Shield Equipped: Unlimited Hospitalization and $200k Critical Illness Coverage.';
    else if (hasShieldPlan) msg = 'Shield Equipped: Unlimited Hospitalization Coverage.';
    else if (hasCIPlan) msg = 'Shield Equipped: $200k Critical Illness Coverage.';
    else msg = 'Unprotected: Vulnerable to medical emergencies.';

    const timer = setTimeout(() => setA11yMessage(msg), 500);
    return () => clearTimeout(timer);
  }, [hasShieldPlan, hasCIPlan]);

  // Handle toast removal
  useEffect(() => {
    if (hudQueue.length > 0) {
      const latestEvent = hudQueue[hudQueue.length - 1];
      const timer = setTimeout(() => removeHUDEvent(latestEvent.id), 2500);
      return () => clearTimeout(timer);
    }
  }, [hudQueue, removeHUDEvent]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      
      {/* Screen Reader Only */}
      <div aria-live="polite" className="sr-only">
        {a11yMessage}
      </div>

      {/* Top Right Shield HUD */}
      <div className="absolute top-6 right-8 flex flex-col items-end gap-2">
         {!hasShieldPlan && !hasCIPlan ? (
            <div 
              className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 px-4 py-2 rounded-xl shadow-[0_0_15px_rgba(244,63,94,0.2)] backdrop-blur-md animate-in fade-in slide-in-from-right-4 duration-500"
            >
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              <div>
                <p className="text-xs font-bold text-rose-500 uppercase tracking-widest">Unprotected</p>
                <p className="text-[10px] text-rose-400/70">100% Vulnerable to Medical Shocks</p>
              </div>
            </div>
         ) : (
            <div 
              className="flex flex-col items-end gap-2 animate-in fade-in zoom-in-95 duration-500"
            >
              <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/40 px-4 py-2 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.3)] backdrop-blur-md">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
                <div>
                   <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">Shield Active</p>
                   <p className="text-[10px] text-blue-300/70">
                     {hasShieldPlan ? 'Full Hospital Cover' : 'Partial Cover'}
                   </p>
                </div>
              </div>
              
              {hasCIPlan && (
                <div 
                  className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/40 px-3 py-1.5 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.2)] backdrop-blur-md mr-2 animate-in fade-in slide-in-from-top-2 duration-300"
                >
                  <HeartPulse className="w-4 h-4 text-emerald-400" />
                  <p className="text-[10px] font-bold text-emerald-400 tracking-wide">+$200k CI Cash Armor</p>
                </div>
              )}
            </div>
         )}
      </div>

      {/* Floating Text Event Queue (Top Center Screen) */}
      <div className="absolute top-28 inset-x-0 flex flex-col items-center pointer-events-none gap-3 z-50">
        {hudQueue.map((event) => (
          <div
            key={event.id}
            className={`pointer-events-none animate-in fade-in zoom-in-95 ${event.type === 'hit' ? 'slide-in-from-top-4' : 'slide-in-from-bottom-4'} duration-300`}
          >
            <div className={`px-6 py-3 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-center gap-3 ${
              event.type === 'hit' 
                ? 'bg-rose-950/90 border-rose-500 shadow-[0_0_40px_rgba(244,63,94,0.5)]'
                : 'bg-blue-950/90 border-blue-400 shadow-[0_0_40px_rgba(59,130,246,0.5)]'
            }`}>
              {event.type === 'hit' ? <ShieldAlert className="w-8 h-8 text-rose-500" /> : <Shield className="w-8 h-8 text-blue-400" />}
              <div>
                <p className={`text-sm font-black uppercase tracking-widest ${
                  event.type === 'hit' ? 'text-rose-500' : 'text-blue-400'
                }`}>
                  {event.type === 'hit' ? 'Critical Hit' : 'Damage Absorbed'}
                </p>
                <p className="text-xl font-mono font-bold text-white">{event.message}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
