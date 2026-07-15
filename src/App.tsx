import { Layout } from './components/Layout';
import { IntakeScreen } from './components/IntakeScreen';
import { LifeCanvas } from './components/LifeCanvas';
import { Widgets } from './components/Widgets';

function App() {
  return (
    <Layout>
      <IntakeScreen />
      
      <div className="h-full w-full flex flex-col lg:flex-row p-6 lg:p-8 gap-6 lg:gap-8 max-w-[1800px] mx-auto overflow-hidden">
        {/* Left Sidebar - Stress Tests */}
        <div className="w-full lg:w-[320px] flex-shrink-0 h-full overflow-y-auto [&::-webkit-scrollbar]:hidden lg:pb-12">
          <Widgets />
        </div>
        
        {/* Right Main Area - Life Canvas */}
        <div className="flex-1 h-full min-h-[400px] lg:pb-12">
          <LifeCanvas />
        </div>
      </div>
    </Layout>
  );
}

export default App;
