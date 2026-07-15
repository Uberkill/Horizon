import type { ReactNode } from 'react';
import { Navbar } from './Navbar';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen flex flex-col bg-[#0f172a] text-slate-100 font-sans selection:bg-lime-500/30 overflow-hidden">
      <Navbar />
      <main className="flex-1 w-full h-[calc(100vh-73px)] mx-auto overflow-hidden bg-gradient-to-br from-slate-900 to-slate-950 relative">
        {children}
      </main>
    </div>
  );
}
