# Vault System Architecture

**Path**: `src/utils/storePersistence.ts` & `src/components/VaultScreen.tsx`

## Core Purpose
Secure, offline-first storage of client drafts directly on the iPad/browser.

## Security & Encryption
- **Algorithm**: `AES-GCM` (Advanced Encryption Standard with Galois/Counter Mode).
- **Key Derivation**: `PBKDF2` (Password-Based Key Derivation Function 2) with 100,000 iterations using a SHA-256 hash.
- **Salting**: Unique random salt generated per user pin, appended to the ciphertext.
- **Zero-Knowledge**: The master PIN is never stored. Only the derived encryption key interacts with the cipher.

## Storage Layer
- **Adapter**: `localStorage` (temporary drafting) and `IndexedDB` (long-term draft storage).
- **Format**: Data is stored purely as a Base64 encoded ciphertext string. 
- **Tamper Protection**: Any tampering with the Base64 string will result in a decryption failure (caught by AES-GCM's authentication tag), which gracefully resets the state rather than crashing.

## Usage Rules
- Client PII (Name, Financials) must never touch `localStorage` in plaintext.
- The Vault screen decrypts the draft payload into the Zustand `useStore` memory and immediately destroys the key.
