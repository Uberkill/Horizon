import { describe, it, expect, beforeEach, vi } from 'vitest';
import { decryptData } from '../utils/crypto';

// We mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('Store Persistence & Encryption Engine', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.resetModules();
  });

  it('should gracefully handle corrupted or tampered localStorage data', async () => {
    // Inject corrupted ciphertext that cannot be decrypted
    window.localStorage.setItem('horizon-store', 'invalid_ciphertext_that_will_fail');
    
    // Dynamically import the store so it evaluates our mocked localStorage
    const { useStore } = await import('../store/useStore');
    
    // The store should not crash. It should catch the decryption error, wipe the key, and boot initial state.
    const state = useStore.getState();
    expect(state.clientData.age).toBe(30); // Default age
    
    // Wait for async initialization
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // It should have wiped the corrupted key
    expect(window.localStorage.getItem('horizon-store')).toBeNull();
  });

  it('should successfully encrypt and persist data', async () => {
    const { useStore } = await import('../store/useStore');
    
    // Update state to trigger persist
    useStore.getState().setClientData({ cash: 999999 });
    
    // Give Zustand a tick to persist
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const rawStorage = window.localStorage.getItem('horizon-store');
    expect(rawStorage).toBeTruthy();
    expect(rawStorage).not.toContain('999999'); // Should be encrypted
    
    // Manually decrypt to verify
    const decrypted = await decryptData(rawStorage!);
    
    expect(decrypted).toContain('999999');
  });
});
