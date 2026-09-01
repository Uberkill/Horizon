import type { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { useStore } from '../store/useStore';

export function Layout({ children }: { children: ReactNode }) {
  const hasStarted = useStore(state => state.hasStarted);
  return (
    <div className="h-screen flex flex-col bg-[#0f172a] text-slate-100 font-sans selection:bg-lime-500/30 overflow-hidden print:overflow-visible print:h-auto print:bg-white">
      {hasStarted && <Navbar />}
      <main className={`flex-1 w-full mx-auto overflow-hidden print:overflow-visible print:h-auto bg-gradient-to-br from-slate-900 to-slate-950 print:bg-none print:bg-white relative ${hasStarted ? 'h-[calc(100vh-73px)]' : 'h-screen'}`}>
        {children}
      </main>
    </div>
  );
}
