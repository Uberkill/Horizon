# Horizon Financial Blueprint
**An Enterprise-Grade Predictive Financial Visualization Tool**

> ** AI AGENT HANDOFF & ONBOARDING DIRECTIVE**
> If you are a new AI agent reading this file to gain context on the project, **welcome**. 
> To prevent hallucination and get up to speed instantly, you must strictly follow these directives:
> 
> **1. Read the Architecture Docs:**
> Do NOT guess how the system works. Read the highly-focused `.md` files in the `docs/` directory before writing code:
> - `docs/DESIGN_SYSTEM.md`: Strict rules on colors (Slate, Blue, Lime, Rose), Tailwind typography (mono for numbers), and Glassmorphism components. **Adhere to this strictly to maintain UI consistency.**
> - `docs/MATH_ENGINE.md`: Explains the drawdown waterfall (Cash -> CPF -> Endowments -> Investments) and 3% inflation rules.
> - `docs/VAULT_SYSTEM.md`: Explains the offline-first IndexedDB storage using native Web Crypto API (AES-GCM).
> - `docs/TAX_SIMULATOR.md`: Explains the Singapore YA2024 progressive tax engine.
> - `docs/UI_ARCHITECTURE.md`: Explains the `viewMode` Zustand routing (Welcome -> Planning Form -> Micro Canvas -> Proposal).
>
> **2. Environment Constraints:**
> - **Windows OS Workaround**: Do NOT use the built-in `browser_subagent` tool to test the web app. It is hardcoded for Linux and will fail. Rely on `chrome-devtools-mcp` or playwright scripts if visual testing is required.
> - **Multi-Agent Verifier**: Whenever you create an `implementation_plan.md` in Planning Mode, you must spawn a `Reviewer` subagent to attack the plan for edge cases before presenting it to the user.
> 
> **3. Quality Assurance:**
> - Run `npm run qa` before ending your turn. This triggers the Vitest suite and TypeScript compiler. If a test fails, fix it immediately. The app currently has a completely stable test suite with zero bloat.

---

## Technical Overview
Horizon calculates and visualizes a client's projected wealth trajectory, factoring in income, expenses, inflation, debt, and financial products. It is built as a pure offline-first PWA for iPad Pro usage in the field.

## Project Structure
- `docs/`: Core architectural rulebooks and design systems.
- `src/components`: UI components separated logically (`LifeCanvas.tsx`, `PlanningForm.tsx`, `VaultScreen.tsx`).
- `src/store/useStore.ts`: Global state management via Zustand.
- `src/utils/mathEngine.ts`: Pure mathematical functions for financial projections.
- `src/utils/taxEngine.ts`: Singapore progressive tax calculators.
- `src/utils/crypto.ts`: Native Web Crypto API wrapper for the Vault.

## Quickstart Commands
- `npm run dev`: Starts the Vite development server.
- `npm run qa`: Full QA pipeline (linting via oxlint, Vitest tests, TypeScript compilation). Always run this to verify stability.
- `npm run build`: Compiles TypeScript and builds the optimized app.

## Bloat & Dependency Rule
This codebase has been strictly audited by `ponytail-audit`. It contains zero unnecessary dependencies. We use `crypto.subtle` instead of `crypto-js`, native Tailwind animations instead of `framer-motion`, and `crypto.randomUUID()` instead of `uuid`. **Do not introduce heavy dependencies without explicit user authorization.**
