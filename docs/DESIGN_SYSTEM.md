# Horizon Design System

**Path**: `tailwind.config.js` & Global Components

## Core Identity
Horizon is a premium, enterprise-grade financial blueprinting tool. The UI must feel sophisticated, trustworthy, and incredibly modern. 

## Color Palette
### 1. Base & Background (The Void)
- **Primary Background**: `slate-950`
- **Surface / Panels**: `slate-900`
- **Borders**: `slate-800` or `slate-700/50`
- *Rule*: Never use pure black (`#000000`). Always use the deep blue-grey tint of the Tailwind Slate palette.

### 2. Typography (The Ink)
- **Primary Text**: `slate-200`
- **Secondary Text**: `slate-400`
- **Muted Text**: `slate-500`

### 3. Accents & Call-To-Action (The Signals)
- **Primary Action (Buttons, Links)**: `blue-500` / `blue-600`
- **Wealth / Growth (Investments)**: `lime-400` / `lime-500`
- **Protection (Shield, CI)**: `emerald-400` / `emerald-500`
- **Safe Assets (Endowments)**: `purple-400` / `purple-500`
- **Advanced / Edge (SRS, Annuity)**: `amber-500` / `orange-500`
- **Warnings / Debt / Deficits**: `rose-400` / `rose-500`

## Typography & Sizing
- **Font Family**: Standard sans-serif (`Inter` or system-ui).
- **Numbers**: Always use `font-mono` when displaying financial metrics, yields, or ages so they align perfectly.
- **H1 (Document Titles)**: `text-4xl font-extrabold tracking-tight`
- **H2 (Page Headers)**: `text-3xl font-bold tracking-tight`
- **H3 (Section Headers)**: `text-lg font-medium text-slate-300`

## UI Patterns & Components
### Glassmorphism
Use translucent backgrounds with blur for floating elements (Navbars, Drawers, Modals).
- *Class string*: `bg-slate-900/60 backdrop-blur-xl border-slate-800`

### Buttons
- **Primary**: `bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg`
- **Secondary**: `bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl`

### Document Containers (Proposal)
When simulating physical paper on screen (e.g., The Proposal):
- *Class string*: `bg-slate-900/40 p-8 rounded-3xl border border-slate-800 shadow-2xl`
