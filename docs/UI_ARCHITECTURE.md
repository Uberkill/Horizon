# UI Architecture

**Path**: `src/components/` & `src/store/useStore.ts`

## Core Purpose
State-driven Single Page Application (SPA) routing without using a complex router library.

## View Modes
The entire application view is controlled by a single Zustand string: `viewMode`
- `macro`: The Macro Market View (Yield curves, inflation context).
- `micro`: The Micro Canvas (The primary `LifeCanvas` projection and `IntakeScreen` drawer).
- `planning`: The full-page Fact-Finding data entry form (`PlanningForm`).
- `proposal`: The final PDF export layout (`ProposalView`).
- `vault`: The encryption/decryption screen for local save states (`VaultScreen`).

## Navigation Pipeline
1. **WelcomeScreen**: Captures the client's name.
2. **PlanningForm**: Full-page, distraction-free environment for static facts (Age, Income, Expenses, Debt).
3. **Micro Canvas (Portfolio Architect)**: Interactive charting where the FA toggles products (Shield, ILP, CI) in the side drawer to modify the live projection.
4. **The Proposal**: Final A4-styled screen for PDF export.

## Component Principles
- **Separation of Concerns**: Fact-finding inputs are isolated from Pitching toggles to prevent cognitive overload.
- **Glassmorphism**: Modals, navbars, and drawers use `backdrop-blur` over absolute dark backgrounds.
- **Responsive**: Mobile-first Tailwind styling, though primarily targeted at iPad Pro dimensions for FA field usage.
