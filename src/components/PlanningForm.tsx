import React from 'react';
import { useStore, type ClientData } from '../store/useStore';
import { Save, User, Wallet, PiggyBank, Briefcase } from 'lucide-react';

export function PlanningForm() {
  const { clientData, setClientData, setViewMode } = useStore();
  const [localData, setLocalData] = React.useState<ClientData>(clientData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalData(prev => ({
      ...prev,
      [name]: name === 'clientName' ? value : parseFloat(value)
    }));
  };

  const handleSave = () => {
    setClientData(localData);
    setViewMode('micro');
    useStore.getState().setDrawerOpen(true);
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(localData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "horizon-draft.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="w-full h-full max-w-4xl mx-auto p-4 md:p-8 overflow-y-auto [&::-webkit-scrollbar]:hidden animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-slate-800/60 pb-6">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold text-white tracking-tight">
            {localData.clientName ? `Planning for ${localData.clientName}` : 'Client Planning Canvas'}
          </h2>
          <p className="text-slate-400 mt-1.5 text-sm">Enter the client's financial details. Data is auto-saved locally and encrypted.</p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-md">
            <span className="text-amber-500/90 text-xs font-medium">⚠️ iOS clears local storage after 7 days of inactivity. Export your drafts.</span>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleExport}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-transparent hover:bg-slate-800/80 text-slate-300 text-sm font-medium rounded-lg transition-all border border-slate-700 shadow-sm"
            title="Download JSON Draft"
          >
            Download Draft
          </button>
          <button
            onClick={handleSave}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-all shadow-[0_0_15px_rgba(37,99,235,0.25)]"
          >
            <Save className="w-4 h-4" />
            Save & Generate
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Profile Section */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
            <User className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-medium text-slate-200">Client Profile</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-[13px] font-medium text-slate-400 mb-1.5">Client Name</label>
              <input
                type="text"
                name="clientName"
                value={localData.clientName}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="e.g. John Doe"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-slate-400 mb-1.5">Current Age</label>
              <input
                type="number"
                min="18"
                max="99"
                inputMode="decimal"
                pattern="[0-9]*"
                name="age"
                value={Number.isNaN(localData.age) ? '' : localData.age}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="e.g. 30"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-slate-400 mb-1.5">Target Retirement Age</label>
              <input
                type="number"
                min={Number.isNaN(localData.age) ? "50" : String(Math.max(50, localData.age + 1))}
                max="99"
                inputMode="decimal"
                pattern="[0-9]*"
                name="targetAge"
                value={Number.isNaN(localData.targetAge) ? '' : localData.targetAge}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="e.g. 65"
              />
            </div>
          </div>
        </div>

        {/* Cashflow Section */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
            <Wallet className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-medium text-slate-200">Monthly Cashflow</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[13px] font-medium text-slate-400 mb-1.5">Monthly Income ($)</label>
              <input
                type="number"
                min="0"
                inputMode="decimal"
                pattern="[0-9]*"
                name="monthlyIncome"
                value={Number.isNaN(localData.monthlyIncome) ? '' : localData.monthlyIncome}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-emerald-400 font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-slate-400 mb-1.5">Monthly Expenses ($)</label>
              <input
                type="number"
                min="0"
                inputMode="decimal"
                pattern="[0-9]*"
                name="monthlyExpenses"
                value={Number.isNaN(localData.monthlyExpenses) ? '' : localData.monthlyExpenses}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-rose-400 font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>
          </div>
        </div>

      {/* Tax Reliefs Section */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
            <Briefcase className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-medium text-slate-200">Statutory & Dependent Reliefs</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[13px] font-medium text-slate-400 mb-1.5">Dependent Reliefs ($)</label>
              <input
                type="number"
                min="0"
                inputMode="decimal"
                pattern="[0-9]*"
                name="dependentReliefs"
                value={Number.isNaN(localData.dependentReliefs) ? '' : localData.dependentReliefs}
                onChange={handleChange}
                placeholder="e.g. 15000"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-purple-400 font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
              <p className="text-xs text-slate-500 mt-2">Sum of QCR, WMCR, Parent Reliefs, etc. (Earned Income and CPF reliefs are auto-calculated).</p>
            </div>
          </div>
        </div>

        {/* Assets Section */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
            <PiggyBank className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-medium text-slate-200">Current Assets & Liabilities</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-[13px] font-medium text-slate-400 mb-1.5">Cash on Hand ($)</label>
              <input
                type="number"
                min="0"
                inputMode="decimal"
                pattern="[0-9]*"
                name="cash"
                value={Number.isNaN(localData.cash) ? '' : localData.cash}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-slate-400 mb-1.5">CPF OA Balance ($)</label>
              <input
                type="number"
                min="0"
                inputMode="decimal"
                pattern="[0-9]*"
                name="cpfOA"
                value={Number.isNaN(localData.cpfOA) ? '' : localData.cpfOA}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-slate-400 mb-1.5">Total Debt ($)</label>
              <input
                type="number"
                min="0"
                inputMode="decimal"
                pattern="[0-9]*"
                name="totalDebt"
                value={Number.isNaN(localData.totalDebt) ? '' : localData.totalDebt}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-rose-400 font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
