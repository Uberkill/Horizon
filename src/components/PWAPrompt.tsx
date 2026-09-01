
// @ts-ignore - vite-plugin-pwa virtual module
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, X } from 'lucide-react';

export function PWAPrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r: any) {
      console.log('SW Registered: ', r);
    },
    onRegisterError(error: any) {
      console.log('SW registration error', error);
    },
  });

  const close = () => {
    setNeedRefresh(false);
  };

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-4 right-4 pb-[env(safe-area-inset-bottom)] z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl shadow-2xl flex items-center gap-4 max-w-sm">
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-slate-100">Update Available</h4>
          <p className="text-xs text-slate-400 mt-1">A new version of Horizon Pilot is ready. Refresh to update.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => updateServiceWorker(true)}
            className="flex items-center justify-center p-2 bg-blue-500 hover:bg-blue-400 text-white rounded-lg transition-colors"
            title="Update now"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={close}
            className="flex items-center justify-center p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
