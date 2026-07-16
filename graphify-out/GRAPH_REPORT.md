# Graph Report - .  (2026-07-16)

## Corpus Check
- Corpus is ~9,568 words - fits in a single context window. You may not need a graph.

## Summary
- 165 nodes · 192 edges · 15 communities (14 shown, 1 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 18 edges
2. `compilerOptions` - 15 edges
3. `useStore` - 12 edges
4. `react` - 8 edges
5. `scripts` - 6 edges
6. `apiService` - 5 edges
7. `plugins` - 4 edges
8. `rules` - 3 edges
9. `IntakeScreen()` - 3 edges
10. `LifeCanvas()` - 3 edges

## Surprising Connections (you probably didn't know these)
- `App()` --calls--> `useStore`  [EXTRACTED]
  src/App.tsx → src/store/useStore.ts
- `IntakeScreen()` --calls--> `useStore`  [EXTRACTED]
  src/components/IntakeScreen.tsx → src/store/useStore.ts
- `LifeCanvas()` --calls--> `useStore`  [EXTRACTED]
  src/components/LifeCanvas.tsx → src/store/useStore.ts
- `Navbar()` --calls--> `useStore`  [EXTRACTED]
  src/components/Navbar.tsx → src/store/useStore.ts
- `Widgets()` --calls--> `useStore`  [EXTRACTED]
  src/components/Widgets.tsx → src/store/useStore.ts

## Import Cycles
- None detected.

## Communities (15 total, 1 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (41): autoprefixer, axe-core, @axe-core/playwright, jsdom, oxlint, devDependencies, autoprefixer, axe-core (+33 more)

### Community 1 - "Community 1"
Cohesion: 0.08
Nodes (23): DOM, src, vite/client, compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx (+15 more)

### Community 2 - "Community 2"
Cohesion: 0.18
Nodes (8): react, App(), IntakeScreen(), Layout(), LifeCanvas(), Navbar(), Widgets(), useStore

### Community 3 - "Community 3"
Cohesion: 0.10
Nodes (19): node, vite.config.ts, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection (+11 more)

### Community 4 - "Community 4"
Cohesion: 0.15
Nodes (13): lucide-react, dependencies, lucide-react, react, react-dom, react-error-boundary, recharts, zustand (+5 more)

### Community 5 - "Community 5"
Cohesion: 0.18
Nodes (10): name, private, scripts, build, dev, lint, preview, qa (+2 more)

### Community 6 - "Community 6"
Cohesion: 0.25
Nodes (7): apiService, EconomicData, MOM_2024_MEDIANS, TimeSeriesPoint, AppState, ClientData, initialClientData

### Community 7 - "Community 7"
Cohesion: 0.22
Nodes (8): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, oxc, typescript, warn

### Community 8 - "Community 8"
Cohesion: 0.38
Nodes (4): MacroView(), MODULES, TabKey, MACRO_NARRATIVES

## Knowledge Gaps
- **82 isolated node(s):** `$schema`, `typescript`, `oxc`, `react/rules-of-hooks`, `warn` (+77 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `Community 0` to `Community 5`?**
  _High betweenness centrality (0.129) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Community 4` to `Community 5`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **Why does `react` connect `Community 2` to `Community 8`, `Community 7`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **What connects `$schema`, `typescript`, `oxc` to the rest of the system?**
  _82 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.04878048780487805 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.08333333333333333 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._