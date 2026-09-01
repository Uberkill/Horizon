# Math Engine Architecture

**Path**: `src/utils/mathEngine.ts`

## Core Purpose
Deterministic financial simulation engine projecting wealth from the client's current age to age 90.

## Key Rules & Parameters
- **Timeline**: `currentAge` to `90` (inclusive).
- **Inflation Rates**: 
  - Expenses inflate at **3.0%** annually.
  - Income inflates at **2.0%** annually (stops at `targetAge`).
- **Growth Rates (Optimized Portfolio)**:
  - Cash: 0.1%
  - CPF OA: 2.5%
  - Endowments: 3.5%
  - Annuity: 4.0%
  - SRS (Index Funds): 6.0%
  - Investments (ILP/Equities): 7.5%

## Drawdown Waterfall (Retirement / Deficit)
If expenses exceed income, the engine liquidates assets in this strict order to cover the shortfall:
1. Liquid Cash
2. CPF OA
3. Endowments (Safe)
4. Investments (Growth)

## Deficit Detection
- `isDeficit`: Boolean flag triggered if a client's total assets hit $0 before age 90 in the optimized portfolio.
- `deficitAge`: The exact age the client runs out of money.

## Design Constraints
- Pure functions only. No React dependencies.
- Deterministic: Same inputs must yield the exact same array of yearly data points.
