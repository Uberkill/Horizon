const fs = require("fs");

let intake = fs.readFileSync("src/components/IntakeScreen.tsx", "utf8");
intake = intake.replace("clientData, setClientData,", "clientData,");
fs.writeFileSync("src/components/IntakeScreen.tsx", intake);

let proposal = fs.readFileSync("src/components/ProposalView.tsx", "utf8");
proposal = proposal.replace("type: \x27jpeg\x27,", "type: \x27jpeg\x27 as const,");
fs.writeFileSync("src/components/ProposalView.tsx", proposal);

let pwa = fs.readFileSync("src/components/PWAPrompt.tsx", "utf8");
pwa = pwa.replace(/^.*react.*$/m, "");
fs.writeFileSync("src/components/PWAPrompt.tsx", pwa);

let vault = fs.readFileSync("src/components/VaultScreen.tsx", "utf8");
vault = vault.replace(/^import React from \x27react\x27;\r?\n/m, "");
vault = vault.replace("Download, Upload, ", "");
vault = vault.replace("const { clientData, setClientData, lifeEvents, addLifeEvent, removeLifeEvent } = useStore();", "const { addLifeEvent, removeLifeEvent } = useStore();");
fs.writeFileSync("src/components/VaultScreen.tsx", vault);

let math = fs.readFileSync("src/tests/mathEngine.test.ts", "utf8");
math = math.replace("totalDebt: 0", "totalDebt: 0, dependentReliefs: 0");
fs.writeFileSync("src/tests/mathEngine.test.ts", math);

let tpv = fs.readFileSync("src/tests/ProposalView.test.tsx", "utf8");
tpv = tpv.replace("currentAge:", "age:");
fs.writeFileSync("src/tests/ProposalView.test.tsx", tpv);

let tvs = fs.readFileSync("src/tests/VaultScreen.test.tsx", "utf8");
tvs = tvs.replace(/import \{ useStore \} from \x27\.\.\/store\/useStore\x27;\r?\n/m, "");
tvs = tvs.replace(/global\./g, "globalThis.");
fs.writeFileSync("src/tests/VaultScreen.test.tsx", tvs);

let tws = fs.readFileSync("src/tests/WelcomeScreen.test.tsx", "utf8");
tws = tws.replace("import { describe, it, expect, vi }", "import { describe, it, expect }");
tws = tws.replace("currentAge:", "age:");
fs.writeFileSync("src/tests/WelcomeScreen.test.tsx", tws);

let twi = fs.readFileSync("src/tests/Widgets.test.tsx", "utf8");
twi = twi.replace("currentAge:", "age:");
twi = twi.replace("medianIncome: 5870 }]", "medianIncome: 5870 as any }]");
fs.writeFileSync("src/tests/Widgets.test.tsx", twi);

let schemas = fs.readFileSync("src/types/schemas.ts", "utf8");
schemas = schemas.replace("z.number({ invalid_type_error: \"Age is required\" })", "z.number()");
fs.writeFileSync("src/types/schemas.ts", schemas);

