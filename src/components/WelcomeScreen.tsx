import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { ArrowRight, PlaneTakeoff } from 'lucide-react';

export function WelcomeScreen() {
  const { setClientData, setHasStarted, setViewMode, setDrawerOpen } = useStore();
  const [name, setName] = useState('');

  const handleStart = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (name.trim()) {
      setClientData({ clientName: name.trim() });
    }
    setHasStarted(true);
    setViewMode('planning');
    setDrawerOpen(false);
  };

  const handleSkip = () => {
    setHasStarted(true);
    setViewMode('planning');
    setDrawerOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 md:p-12">
      <div className="w-full max-w-lg flex flex-col gap-6 md:gap-8 items-center text-center">
        
        {/* Animated Icon */}
        <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center animate-in fade-in zoom-in duration-700 ease-out">
          <PlaneTakeoff className="w-10 h-10 text-blue-500" />
        </div>

        {/* Headline */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 ease-out fill-mode-both">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-50 mb-2">
            Horizon Pilot
          </h1>
          <p className="text-slate-400 text-lg">
            Intelligent Wealth Architecture
          </p>
        </div>

        {/* Interactive Form */}
        <form onSubmit={handleStart} className="w-full flex flex-col gap-4 items-center mt-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 ease-out fill-mode-both">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Who are we planning for today?"
            className="w-full text-lg p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-center"
            autoFocus
          />

          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full max-w-[240px] text-lg font-semibold py-3 px-8 rounded-full bg-blue-600 text-white shadow-md hover:bg-blue-500 hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
          >
            Start Planning
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={handleSkip}
            className="text-sm font-medium text-slate-500 hover:text-slate-300 underline-offset-4 hover:underline transition-colors mt-4"
          >
            Skip for now
          </button>
        </form>

      </div>
    </div>
  );
}
