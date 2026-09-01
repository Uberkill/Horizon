const fs = require("fs");
let wi = fs.readFileSync("src/tests/Widgets.test.tsx", "utf8");
wi = wi.replace(/momMedianIncomes: \[\{ ageGroup: \x2730-34\x27, medianIncome: 5000 \}\]/, "momMedianIncomes: 5000");
fs.writeFileSync("src/tests/Widgets.test.tsx", wi);
