import { RotateCcw, Settings, Activity } from 'lucide-react';
import { useStore } from '../store/useStore';

export function Navbar() {
  const { resetClient, isDrawerOpen, setDrawerOpen } = useStore();

  const handleReset = () => {
    if (window.confirm("Start a new session? Current client data will be cleared.")) {
      resetClient();
    }
  };

  return (
    <nav className="w-full h-[73px] bg-slate-900/60 backdrop-blur-2xl border-b border-slate-800/80 px-6 flex items-center justify-between z-40 sticky top-0 relative">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-lime-500/10 rounded-xl border border-lime-500/20 shadow-[0_0_15px_rgba(132,204,22,0.15)]">
          <Activity className="w-5 h-5 text-lime-400" />
        </div>
        <h1 className="text-xl font-semibold text-slate-100 tracking-wide">Horizon <span className="text-slate-500 font-normal">Pilot</span></h1>
      </div>
      
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setDrawerOpen(!isDrawerOpen)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-all text-sm font-medium border border-slate-700/80 shadow-sm"
        >
          <Settings className="w-4 h-4" />
          Configure Client
        </button>
        <button 
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-rose-500/10 text-slate-300 hover:text-rose-400 transition-all text-sm font-medium border border-slate-700/80 hover:border-rose-500/30 shadow-sm"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>
    </nav>
  );
}
