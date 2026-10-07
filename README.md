# Horizon Financial Blueprint

An offline-first, client-side predictive financial modeling and wealth trajectory application engineered with React, TypeScript, and Zustand.

---

## Technical Overview

Horizon models multi-decade wealth projections, simulating dynamic interactions between income streams, expenditure schedules, progressive taxation, debt amortization, and multi-tier drawdown waterfalls. Designed as a standalone Progressive Web App (PWA) with client-side encryption.

### Core Architectural Systems

- **Predictive Projection Engine (`src/utils/mathEngine.ts`):** Calculates multi-year financial forecasts factoring in inflation adjustments and prioritized asset drawdown waterfalls (Cash, CPF, Endowments, Portfolio Investments).
- **Tax Simulation Engine (`src/utils/taxEngine.ts`):** Deterministic progressive tax computation supporting relief brackets and deductions.
- **Client-Side Encrypted Vault (`src/utils/crypto.ts`):** Secure offline persistence using the native Web Crypto API (`AES-GCM` via `crypto.subtle`) stored in IndexedDB. Data remains encrypted at rest on the client device.
- **State Management & Routing (`src/store/useStore.ts`):** Modular Zustand store controlling financial state partitions and view transitions.
- **Dependency Philosophy:** Pure standard library and native web platform APIs (native Web Crypto instead of third-party cipher libraries, standard Web APIs for identifiers).

---

## Project Structure

```text
Horizon/
├── docs/             # Technical specifications and tax rules
├── src/
│   ├── components/   # UI components and canvas visualizers
│   ├── constants/    # Inflation baselines and bracket tables
│   ├── store/        # Zustand global state management
│   ├── types/        # TypeScript schemas and data models
│   └── utils/        # Pure math, tax, and crypto calculation engines
└── scripts/          # Quality assurance runner
```

---

## Getting Started

### Development
```bash
npm install
npm run dev
```

### Quality Assurance & Verification
```bash
npm run qa        # Runs linter, TypeScript compiler, and Vitest suite
npm run build     # Compiles production bundle
```
