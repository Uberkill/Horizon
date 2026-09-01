import { useEffect } from 'react';
import { useStore } from './store/useStore';
import { Layout } from './components/Layout';
import { IntakeScreen } from './components/IntakeScreen';
import { LifeCanvas } from './components/LifeCanvas';
import { Widgets } from './components/Widgets';
import { MacroView } from './components/MacroView';
import { PlanningForm } from './components/PlanningForm';
import { PWAPrompt } from './components/PWAPrompt';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ProposalView } from './components/ProposalView';
import { VaultScreen } from './components/VaultScreen';

function App() {
  const { hasStarted, viewMode, initializeData, isLoadingData } = useStore();

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  if (isLoadingData) {
    return <div className="h-screen w-screen bg-slate-950 flex items-center justify-center text-slate-400">Initializing Horizon Engine...</div>;
  }

  if (!hasStarted) {
    return (
      <Layout>
        <PWAPrompt />
        <WelcomeScreen />
      </Layout>
    );
  }

  return (
    <Layout>
      <PWAPrompt />
      <IntakeScreen />
      
      {viewMode === 'macro' && <MacroView />}
      {viewMode === 'planning' && <PlanningForm />}
      {viewMode === 'proposal' && <ProposalView />}
      {viewMode === 'vault' && <VaultScreen />}
      {viewMode === 'micro' && (
        <div className="h-full w-full flex flex-col lg:flex-row p-6 lg:p-8 gap-6 lg:gap-8 max-w-[1800px] mx-auto overflow-hidden animate-in fade-in zoom-in-95 duration-500">
          {/* Left Sidebar - Stress Tests */}
          <div className="w-full lg:w-[320px] flex-shrink-0 h-full overflow-y-auto [&::-webkit-scrollbar]:hidden lg:pb-12">
            <Widgets />
          </div>
          
          {/* Right Main Area - Life Canvas */}
          <div className="flex-1 h-full min-h-[400px] lg:pb-12">
            <LifeCanvas />
          </div>
        </div>
      )}
    </Layout>
  );
}

export default App;
