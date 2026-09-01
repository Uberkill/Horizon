import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { FolderHeart, Plus, Trash2, ShieldCheck, Check } from 'lucide-react';
import { encryptData, decryptData } from '../utils/crypto';

// ENCRYPTION_KEY is handled natively inside crypto.ts
const DB_NAME = 'HorizonVaultDB';
const STORE_NAME = 'client_drafts';

// Lightweight IDB Wrapper
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (e: any) => {
      e.target.result.createObjectStore(STORE_NAME, { keyPath: 'id' });
    };
  });
};

const saveToVault = async (draft: any) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    
    // Encrypt the sensitive payload
    encryptData(JSON.stringify(draft.payload)).then(encryptedPayload => {
      const secureDraft = {
        id: draft.id,
        clientName: draft.clientName, // Plaintext for search/display
        updatedAt: draft.updatedAt,
        securePayload: encryptedPayload
      };
      
      const request = store.put(secureDraft);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    }).catch(reject);
  });
};

const getVaultDrafts = async (): Promise<any[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const deleteFromVault = async (id: string) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export function VaultScreen() {
  const { setViewMode } = useStore();
  const [drafts, setDrafts] = useState<any[]>([]);
  const [justSaved, setJustSaved] = useState(false);

  const loadDrafts = async () => {
    try {
      const records = await getVaultDrafts();
      setDrafts(records.sort((a, b) => b.updatedAt - a.updatedAt));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadDrafts();
  }, []);

  const handleSaveCurrent = async () => {
    const state = useStore.getState();
    const payload = {
      clientData: state.clientData,
      hasShieldPlan: state.hasShieldPlan,
      hasCIPlan: state.hasCIPlan,
      premiumEndowment: state.premiumEndowment,
      premiumILP: state.premiumILP,
      premiumAnnuity: state.premiumAnnuity,
      premiumSRS: state.premiumSRS,
      lifeEvents: state.lifeEvents
    };

    const draft = {
      id: state.clientData.clientName || 'Untitled_' + Date.now(),
      clientName: state.clientData.clientName || 'Untitled Client',
      updatedAt: Date.now(),
      payload
    };

    await saveToVault(draft);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
    loadDrafts();
  };

  const handleLoad = async (record: any) => {
    try {
      const decryptedString = await decryptData(record.securePayload);
      const decrypted = JSON.parse(decryptedString);
      
      const state = useStore.getState();
      state.setClientData(decrypted.clientData);
      useStore.setState({
        hasShieldPlan: decrypted.hasShieldPlan,
        hasCIPlan: decrypted.hasCIPlan,
        premiumEndowment: decrypted.premiumEndowment,
        premiumILP: decrypted.premiumILP,
        premiumAnnuity: decrypted.premiumAnnuity,
        premiumSRS: decrypted.premiumSRS,
        lifeEvents: decrypted.lifeEvents || []
      });
      setViewMode('micro');
      useStore.getState().setDrawerOpen(true);
    } catch (e) {
      alert("Failed to decrypt draft. The encryption key may have changed or data is corrupted.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this draft?')) {
      await deleteFromVault(id);
      loadDrafts();
    }
  };

  return (
    <div className="w-full h-full max-w-6xl mx-auto p-4 md:p-8 animate-in fade-in zoom-in-95 duration-500 overflow-y-auto [&::-webkit-scrollbar]:hidden">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-slate-800/60 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <FolderHeart className="w-8 h-8 text-blue-400" />
            <h2 className="text-3xl font-bold text-white tracking-tight">Recent Drafts</h2>
          </div>
          <p className="text-slate-400 mt-2">Secure offline vault. Encrypted via AES-256 in IndexedDB.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSaveCurrent}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              justSaved ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.25)]'
            }`}
          >
            {justSaved ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {justSaved ? 'Saved to Vault' : 'Save Current Session'}
          </button>
        </div>
      </div>

      {drafts.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-slate-800">
          <FolderHeart className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-300">Vault is empty</h3>
          <p className="text-slate-500 mt-1 text-sm">Save your current session to access it later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drafts.map(draft => (
            <div key={draft.id} className="bg-slate-900/60 border border-slate-700/60 hover:border-blue-500/50 rounded-2xl p-6 transition-all group shadow-xl">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-slate-100">{draft.clientName}</h3>
                <div className="flex gap-2">
                  <button onClick={() => handleDelete(draft.id)} className="p-1.5 text-slate-500 hover:text-rose-400 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>AES Encrypted</span>
                <span className="mx-2">•</span>
                <span>{new Date(draft.updatedAt).toLocaleDateString()}</span>
              </div>
              <button 
                onClick={() => handleLoad(draft)}
                className="w-full py-2.5 bg-slate-800 group-hover:bg-blue-600 text-slate-300 group-hover:text-white rounded-xl text-sm font-medium transition-colors"
              >
                Open Canvas
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
