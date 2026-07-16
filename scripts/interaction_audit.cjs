const { chromium } = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1024, height: 768 }
  });

  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  } catch (e) {
    console.log("Error: Could not connect to dev server on port 5173.");
    await browser.close();
    process.exit(1);
  }

  const issues = [];

  // Trap Console Errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      issues.push(`Console Error: ${msg.text()}`);
    }
  });

  page.on('pageerror', err => {
    issues.push(`Uncaught Exception: ${err.message}`);
  });

  try {
    // 1. Click Macro/Micro Toggle safely
    await page.waitForSelector('button:has-text("Macro Market")', { state: 'visible' });
    await page.click('button:has-text("Macro Market")');
    await page.waitForTimeout(500); // Wait for transition
    await page.click('button:has-text("Micro Canvas")');
    await page.waitForTimeout(500);

    // 2. Open Intake Drawer
    await page.waitForSelector('button:has-text("Configure Client")', { state: 'visible' });
    await page.click('button:has-text("Configure Client")');
    await page.waitForTimeout(600); // Wait for offcanvas slide

    // 3. Click Lifestyle Pills
    const pills = ['Basic Survival', 'Middle-Class Comfort', 'Luxury Horizon'];
    for (const pill of pills) {
      await page.waitForSelector(`button:has-text("${pill}")`);
      await page.click(`button:has-text("${pill}")`);
      await page.waitForTimeout(300);
    }
    
    // Close Drawer
    await page.click('button:has-text("Configure Client")');
    await page.waitForTimeout(600);

    // 4. Trigger all Stress Tests
    const widgets = ['COVID-19 Crash', 'Sustained Inflation', 'Medical Emergency'];
    for (const widget of widgets) {
      await page.waitForSelector(`text="${widget}"`);
      await page.click(`text="${widget}"`);
      await page.waitForTimeout(300);
    }

    // 5. Axe-Core Accessibility Scan
    const results = await new AxeBuilder({ page }).analyze();
    results.violations.forEach(violation => {
      issues.push(`Axe-Core Violation [${violation.id}]: ${violation.description} (Impact: ${violation.impact})`);
    });

    // 6. SVG Bounding Box Collision Check
    const boundingBoxErrors = await page.evaluate(() => {
      const bgs = [];
      const svg = document.querySelector('svg.recharts-surface');
      if (!svg) return bgs;

      const texts = svg.querySelectorAll('text');
      
      const svgRect = svg.getBoundingClientRect();
      
      texts.forEach(text => {
        const tRect = text.getBoundingClientRect();
        // Check if text is cut off by SVG container
        if (tRect.left < svgRect.left || tRect.right > svgRect.right) {
          bgs.push(`Collision Bug: Chart text "${text.textContent}" clips outside SVG bounds.`);
        }
      });
      return bgs;
    });

    issues.push(...boundingBoxErrors);

  } catch (e) {
    issues.push(`Automation Execution Error: ${e.message}`);
  }

  if (issues.length > 0) {
    console.log("UX/UI Bugs Found:");
    const uniqueBugs = [...new Set(issues)];
    uniqueBugs.forEach(bug => console.log(`- ${bug}`));
  } else {
    console.log("System Nominal.");
  }

  await browser.close();
})();
