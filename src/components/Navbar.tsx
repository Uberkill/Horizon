import { RotateCcw, Settings, Activity, Globe, User } from 'lucide-react';
import { useStore } from '../store/useStore';

export function Navbar() {
  const { resetClient, isDrawerOpen, setDrawerOpen, viewMode, setViewMode } = useStore();

  const handleNav = (mode: 'macro' | 'micro' | 'planning' | 'proposal' | 'vault') => {
    setViewMode(mode);
    if (mode !== 'micro') {
      setDrawerOpen(false);
    }
  };

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
      <div className="flex-1 flex justify-center overflow-x-auto [&::-webkit-scrollbar]:hidden mx-2 md:mx-4">
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-700/80 shadow-inner">
        <button
          onClick={() => handleNav('macro')}
          className={`flex items-center gap-2 px-3 md:px-6 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
            viewMode === 'macro' 
              ? 'bg-blue-500/20 text-blue-400 shadow-md border border-blue-500/30' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
          }`}
          title="Macro Market"
        >
          <Globe className="w-4 h-4 shrink-0" />
          <span className="hidden md:inline whitespace-nowrap">Macro Market</span>
        </button>
        <button
          onClick={() => handleNav('micro')}
          className={`flex items-center gap-2 px-3 md:px-6 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
            viewMode === 'micro' 
              ? 'bg-lime-500/20 text-lime-400 shadow-md border border-lime-500/30' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
          }`}
          title="Micro Canvas"
        >
          <User className="w-4 h-4 shrink-0" />
          <span className="hidden md:inline whitespace-nowrap">Micro Canvas</span>
        </button>
        <button
          onClick={() => handleNav('planning')}
          className={`flex items-center gap-2 px-3 md:px-6 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
            viewMode === 'planning' 
              ? 'bg-purple-500/20 text-purple-400 shadow-md border border-purple-500/30' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
          }`}
          title="Planning Form"
        >
          <Activity className="w-4 h-4 shrink-0" />
          <span className="hidden md:inline whitespace-nowrap">Planning Form</span>
        </button>
        <button
          onClick={() => handleNav('proposal')}
          className={`flex items-center gap-2 px-3 md:px-6 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
            viewMode === 'proposal' 
              ? 'bg-emerald-500/20 text-emerald-400 shadow-md border border-emerald-500/30' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
          }`}
          title="The Proposal"
        >
          <User className="w-4 h-4 shrink-0" />
          <span className="hidden md:inline whitespace-nowrap">Proposal</span>
        </button>
        <button
          onClick={() => handleNav('vault')}
          className={`flex items-center gap-2 px-3 md:px-6 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
            viewMode === 'vault' 
              ? 'bg-rose-500/20 text-rose-400 shadow-md border border-rose-500/30' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
          }`}
          title="Local Vault"
        >
          <Activity className="w-4 h-4 shrink-0" />
          <span className="hidden md:inline whitespace-nowrap">Vault</span>
        </button>
      </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        {viewMode === 'micro' && (
          <button 
            onClick={() => setDrawerOpen(!isDrawerOpen)}
            className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-all duration-300 text-sm font-medium border border-slate-700/80 shadow-sm"
            title="Portfolio Architect"
          >
            <Settings className={`w-4 h-4 transition-transform duration-500 ${isDrawerOpen ? 'rotate-180' : ''}`} />
            <span className="hidden md:inline">Portfolio Architect</span>
          </button>
        )}
        <button 
          onClick={handleReset}
          className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-rose-500/10 text-slate-300 hover:text-rose-400 transition-all duration-300 text-sm font-medium border border-slate-700/80 hover:border-rose-500/30 shadow-sm"
          title="Reset"
        >
          <RotateCcw className="w-4 h-4 shrink-0" />
          <span className="hidden md:inline whitespace-nowrap">Reset</span>
        </button>
      </div>
    </nav>
  );
}
