import { useState } from 'react';
import { useStore } from '../store/useStore';
import { FileText, Printer, CheckCircle2, Shield, TrendingUp, HeartPulse, Loader2 } from 'lucide-react';
import { LifeCanvas } from './LifeCanvas';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-SG', {
    style: 'currency',
    currency: 'SGD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export function ProposalView() {
  const { 
    clientData, 
    hasShieldPlan, 
    hasCIPlan,
    premiumEndowment,
    premiumILP,
    premiumAnnuity,
    premiumSRS,
    dispatchHUDEvent
  } = useStore();

  const [isExporting, setIsExporting] = useState(false);

  const totalPremium = 
    (hasShieldPlan ? 100 : 0) + 
    (hasCIPlan ? 200 : 0) + 
    premiumEndowment + 
    premiumILP + 
    premiumAnnuity + 
    premiumSRS;

  const exportToPDF = async () => {
    setIsExporting(true);
    
    // Wait a tick for React to render the "isExporting" state (light mode)
    await new Promise(resolve => setTimeout(resolve, 150));
    
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = document.getElementById('printable-proposal');
      
      const safeName = (clientData.clientName || 'Client').replace(/[^a-zA-Z0-9\s]/g, '').trim().replace(/\s+/g, '_');
      const filename = `${safeName}_Horizon_Blueprint.pdf`;
      
      const opt = {
        margin:       [10, 10, 10, 10],
        filename:     filename,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      
      await html2pdf().set(opt).from(element).save();
      
      dispatchHUDEvent({
        type: 'hit',
        message: 'PDF Exported Successfully',
        severity: 'normal'
      });
    } catch (error) {
      console.error(error);
      dispatchHUDEvent({
        type: 'hit',
        message: 'Failed to export PDF',
        severity: 'critical'
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={`w-full h-full p-4 md:p-8 overflow-y-auto ${isExporting ? 'bg-white text-black' : 'print:p-0 print:bg-white print:text-black'}`}>
      
      {/* Subtle Top Toolbar (Hidden in Print and Export) */}
      <div className={`max-w-4xl mx-auto mb-6 flex justify-end ${isExporting ? 'hidden' : 'print:hidden'}`}>
        <button 
          onClick={exportToPDF}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 hover:text-white text-sm font-medium rounded-lg transition-all border border-slate-700 shadow-sm"
          title="Export as PDF"
        >
          {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
          {isExporting ? 'Generating PDF...' : 'Export to PDF'}
        </button>
      </div>

      {/* Printable Document Container */}
      <div 
        id="printable-proposal"
        className={`max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out 
          ${isExporting ? 'block bg-transparent p-0 shadow-none border-none' : 'print:block bg-slate-900/40 print:bg-transparent p-8 rounded-3xl border border-slate-800 print:border-none shadow-2xl print:shadow-none print:p-0'}`}
      >
        
        {/* Document Header (Visible heavily in Print) */}
        <div className={`border-b pb-6 flex justify-between items-end ${isExporting ? 'border-slate-300' : 'border-slate-700 print:border-slate-300'}`}>
          <div>
            <h1 className={`text-4xl font-extrabold tracking-tight mb-2 ${isExporting ? 'text-black' : 'text-white print:text-black'}`}>
              Horizon Financial Blueprint
            </h1>
            <p className={`text-xl font-medium ${isExporting ? 'text-blue-600' : 'text-blue-400 print:text-blue-600'}`}>Prepared for: {clientData.clientName || 'Valued Client'}</p>
          </div>
          <div className="text-right">
             <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Date Generated</p>
             <p className={`text-base font-mono mt-1 ${isExporting ? 'text-slate-800' : 'text-slate-300'}`}>{new Date().toLocaleDateString('en-SG', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
          </div>
        </div>

        {/* The Math Canvas */}
        <div className={isExporting ? '' : 'print:break-inside-avoid'}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isExporting ? 'text-slate-800' : 'text-slate-300 print:text-slate-800'}`}>
            <TrendingUp className={`w-5 h-5 ${isExporting ? 'text-blue-600' : 'text-blue-400 print:text-blue-600'}`} />
            Projected Wealth Trajectory
          </h3>
          {/* We wrap LifeCanvas in a container that forces height during print */}
          <div className={`w-full ${isExporting ? 'h-[500px]' : 'h-[350px] md:h-[500px] print:h-[500px]'}`}>
            <LifeCanvas />
          </div>
        </div>

        {/* Selected Portfolio */}
        <div className={`grid grid-cols-1 gap-8 ${isExporting ? 'grid-cols-2 gap-4' : 'md:grid-cols-2 print:grid-cols-2 print:gap-4 print:break-inside-avoid'}`}>
          
          {/* Protection */}
          <div className={`rounded-2xl p-5 md:p-6 delay-150 animate-in fade-in fill-mode-both ${isExporting ? 'bg-transparent border-slate-300 border' : 'bg-slate-900/50 print:bg-transparent border border-slate-800 print:border-slate-300'}`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isExporting ? 'text-slate-800' : 'text-slate-300 print:text-slate-800'}`}>
              <Shield className={`w-5 h-5 ${isExporting ? 'text-emerald-600' : 'text-emerald-400 print:text-emerald-600'}`} />
              Protection Portfolio
            </h3>
            <ul className="space-y-4">
              {hasShieldPlan && (
                <li className={`flex justify-between items-center ${isExporting ? 'text-slate-900' : 'text-slate-200 print:text-slate-900'}`}>
                  <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Shield Plan (Hospital)</span>
                  <span className={`font-mono ${isExporting ? 'text-slate-600' : 'text-slate-400 print:text-slate-600'}`}>$100/mo</span>
                </li>
              )}
              {hasCIPlan && (
                <li className={`flex justify-between items-center ${isExporting ? 'text-slate-900' : 'text-slate-200 print:text-slate-900'}`}>
                  <span className="flex items-center gap-2"><HeartPulse className="w-4 h-4 text-emerald-500" /> Critical Illness ($200k)</span>
                  <span className={`font-mono ${isExporting ? 'text-slate-600' : 'text-slate-400 print:text-slate-600'}`}>$200/mo</span>
                </li>
              )}
              {!hasShieldPlan && !hasCIPlan && (
                <p className="text-sm text-slate-500 italic">No protection plans selected.</p>
              )}
            </ul>
          </div>

          {/* Wealth Accumulation */}
          <div className={`rounded-2xl p-5 md:p-6 delay-300 animate-in fade-in fill-mode-both ${isExporting ? 'bg-transparent border-slate-300 border' : 'bg-slate-900/50 print:bg-transparent border border-slate-800 print:border-slate-300'}`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isExporting ? 'text-slate-800' : 'text-slate-300 print:text-slate-800'}`}>
              <TrendingUp className={`w-5 h-5 ${isExporting ? 'text-blue-600' : 'text-blue-400 print:text-blue-600'}`} />
              Wealth Vehicles
            </h3>
            <ul className="space-y-4">
              {premiumEndowment > 0 && (
                <li className={`flex justify-between items-center ${isExporting ? 'text-slate-900' : 'text-slate-200 print:text-slate-900'}`}>
                  <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-500" /> Endowment Plan</span>
                  <span className={`font-mono ${isExporting ? 'text-slate-600' : 'text-slate-400 print:text-slate-600'}`}>${premiumEndowment}/mo</span>
                </li>
              )}
              {premiumILP > 0 && (
                <li className={`flex justify-between items-center ${isExporting ? 'text-slate-900' : 'text-slate-200 print:text-slate-900'}`}>
                  <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-500" /> ILP / Investments</span>
                  <span className={`font-mono ${isExporting ? 'text-slate-600' : 'text-slate-400 print:text-slate-600'}`}>${premiumILP}/mo</span>
                </li>
              )}
              {premiumAnnuity > 0 && (
                <li className={`flex justify-between items-center ${isExporting ? 'text-slate-900' : 'text-slate-200 print:text-slate-900'}`}>
                  <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-500" /> Annuity (Retirement)</span>
                  <span className={`font-mono ${isExporting ? 'text-slate-600' : 'text-slate-400 print:text-slate-600'}`}>${premiumAnnuity}/mo</span>
                </li>
              )}
              {premiumSRS > 0 && (
                <li className={`flex justify-between items-center ${isExporting ? 'text-slate-900' : 'text-slate-200 print:text-slate-900'}`}>
                  <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-500" /> SRS Top-up</span>
                  <span className={`font-mono ${isExporting ? 'text-slate-600' : 'text-slate-400 print:text-slate-600'}`}>${premiumSRS}/mo</span>
                </li>
              )}
              {premiumEndowment === 0 && premiumILP === 0 && premiumAnnuity === 0 && premiumSRS === 0 && (
                <p className="text-sm text-slate-500 italic">No wealth vehicles selected.</p>
              )}
            </ul>
          </div>
        </div>

        {/* Final Commitment */}
        <div className={`mt-8 rounded-2xl p-6 flex justify-between items-center delay-500 animate-in fade-in slide-in-from-bottom-4 fill-mode-both ${isExporting ? 'bg-blue-50 border-blue-200 border' : 'bg-blue-600/10 print:bg-blue-50 border border-blue-500/30 print:border-blue-200 print:break-inside-avoid'}`}>
          <div>
            <h3 className={`text-xl font-bold ${isExporting ? 'text-blue-700' : 'text-blue-400 print:text-blue-700'}`}>Total Monthly Commitment</h3>
            <p className={`text-sm mt-1 ${isExporting ? 'text-blue-600/80' : 'text-slate-400 print:text-blue-600/80'}`}>To achieve your projected timeline.</p>
          </div>
          <div className={`text-4xl font-extrabold tracking-tight ${isExporting ? 'text-black' : 'text-white print:text-black'}`}>
            {formatCurrency(totalPremium)}
          </div>
        </div>

        {/* Signature Box (Print Only) */}
        <div className={`mt-16 pt-8 border-t border-gray-300 justify-between ${isExporting ? 'flex' : 'hidden print:flex break-inside-avoid'}`}>
          <div className="w-64 text-center">
            <div className="border-b border-gray-400 h-16"></div>
            <p className="text-xs text-gray-500 mt-2">Client Signature</p>
          </div>
          <div className="w-64 text-center">
            <div className="border-b border-gray-400 h-16"></div>
            <p className="text-xs text-gray-500 mt-2">Date</p>
          </div>
        </div>
        <p className={`text-center text-[10px] text-gray-400 mt-8 ${isExporting ? 'block' : 'hidden print:block'}`}>
          This projection is for illustrative purposes only. Actual returns and premiums may vary based on underwriting and market performance.
        </p>

      </div>
    </div>
  );
}
