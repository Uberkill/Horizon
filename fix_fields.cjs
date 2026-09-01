const fs = require("fs");
const fix = (file) => {
  let content = fs.readFileSync(file, "utf8");
  content = content.replace(/targetRetirementAge/g, "targetAge");
  content = content.replace(/cashInBank/g, "cash");
  content = content.replace(/cpfOABalance/g, "cpfOA");
  fs.writeFileSync(file, content);
};
fix("src/tests/ProposalView.test.tsx");
fix("src/tests/WelcomeScreen.test.tsx");
fix("src/tests/Widgets.test.tsx");
