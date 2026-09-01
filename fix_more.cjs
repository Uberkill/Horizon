const fs = require("fs");

let pv = fs.readFileSync("src/tests/ProposalView.test.tsx", "utf8");
pv = pv.replace("totalDebt: 0 }", "totalDebt: 0, dependentReliefs: 0 }");
fs.writeFileSync("src/tests/ProposalView.test.tsx", pv);

let ws = fs.readFileSync("src/tests/WelcomeScreen.test.tsx", "utf8");
ws = ws.replace("totalDebt: 0 }", "totalDebt: 0, dependentReliefs: 0 }");
ws = ws.replace("import { describe, it, expect, vi }", "import { describe, it, expect }");
fs.writeFileSync("src/tests/WelcomeScreen.test.tsx", ws);

let wi = fs.readFileSync("src/tests/Widgets.test.tsx", "utf8");
wi = wi.replace("totalDebt: 0 }", "totalDebt: 0, dependentReliefs: 0 }");
wi = wi.replace("momMedianIncomes: 5000", "momMedianIncomes: { \x2730-34\x27: 5000 }");
fs.writeFileSync("src/tests/Widgets.test.tsx", wi);

let schemas = fs.readFileSync("src/types/schemas.ts", "utf8");
schemas = schemas.replace("z.number({ required_error: \"Age is required\" })", "z.number()");
fs.writeFileSync("src/types/schemas.ts", schemas);

