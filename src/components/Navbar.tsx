import { RotateCcw, Settings, Activity, Globe, User } from 'lucide-react';
import { useStore } from '../store/useStore';

export function Navbar() {
  const { resetClient, isDrawerOpen, setDrawerOpen, viewMode, setViewMode } = useStore();

  const handleReset = () => {
    if (window.confirm("Start a new session? Current client data will be cleared.")) {
      resetClient();
    }
  };

  return (
    <nav className="w-full h-[73px] bg-slate-900/60 backdrop-blur-2xl border-b border-slate-800/80 px-6 flex items-center justify-between z-40 sticky top-0">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-lime-500/10 rounded-xl border border-lime-500/20 shadow-[0_0_15px_rgba(132,204,22,0.15)]">
          <Activity className="w-5 h-5 text-lime-400" />
        </div>
        <h1 className="text-xl font-semibold text-slate-100 tracking-wide">Horizon <span className="text-slate-500 font-normal">Pilot</span></h1>
      </div>
      
      {/* View Mode Toggle */}
      <div className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-700/80 shadow-inner absolute left-1/2 -translate-x-1/2">
        <button
          onClick={() => setViewMode('macro')}
          className={`flex items-center gap-2 px-6 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
            viewMode === 'macro' 
              ? 'bg-blue-500/20 text-blue-400 shadow-md border border-blue-500/30' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
          }`}
        >
          <Globe className="w-4 h-4" />
          Macro Market
        </button>
        <button
          onClick={() => setViewMode('micro')}
          className={`flex items-center gap-2 px-6 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
            viewMode === 'micro' 
              ? 'bg-lime-500/20 text-lime-400 shadow-md border border-lime-500/30' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
          }`}
        >
          <User className="w-4 h-4" />
          Micro Canvas
        </button>
      </div>

      <div className="flex items-center gap-4">
        {viewMode === 'micro' && (
          <button 
            onClick={() => setDrawerOpen(!isDrawerOpen)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-all duration-300 text-sm font-medium border border-slate-700/80 shadow-sm"
          >
            <Settings className="w-4 h-4" />
            Configure Client
          </button>
        )}
        <button 
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-rose-500/10 text-slate-300 hover:text-rose-400 transition-all duration-300 text-sm font-medium border border-slate-700/80 hover:border-rose-500/30 shadow-sm"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>
    </nav>
  );
}
