import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VaultScreen } from '../components/VaultScreen';
import { useStore } from '../store/useStore';

// Mock IndexedDB
const indexedDB = {
  open: vi.fn().mockReturnValue({
    onupgradeneeded: null,
    onsuccess: null,
    onerror: null,
    result: {
      transaction: vi.fn().mockReturnValue({
        objectStore: vi.fn().mockReturnValue({
          getAll: vi.fn().mockReturnValue({
            onsuccess: null,
            onerror: null,
            result: []
          }),
          add: vi.fn(),
          delete: vi.fn()
        })
      })
    }
  })
};
global.indexedDB = indexedDB as any;

describe('VaultScreen Component', () => {
  it('renders the empty vault state by default', () => {
    render(<VaultScreen />);
    expect(screen.getByText('Vault is empty')).toBeInTheDocument();
    expect(screen.getByText('Recent Drafts')).toBeInTheDocument();
  });
});
