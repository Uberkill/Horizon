const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  console.log('Navigating to http://localhost:5173...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });

  // Open the drawer
  await page.evaluate(() => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); // Close any modal if open
  });
  
  // Wait a bit
  await new Promise(r => setTimeout(r, 1000));
  
  // Click the open drawer button (FAB or Navbar)
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const configBtn = btns.find(b => b.textContent.includes('Client Configuration') || b.innerHTML.includes('lucide-sliders'));
    if (configBtn) configBtn.click();
  });

  // Wait for drawer animation
  await new Promise(r => setTimeout(r, 800));

  // Toggle the Shield plan on
  await page.evaluate(() => {
    const divs = Array.from(document.querySelectorAll('div'));
    const shieldToggle = divs.find(d => d.textContent.includes('Comprehensive Shield / CI') && d.classList.contains('cursor-pointer'));
    if (shieldToggle) shieldToggle.click();
  });
  
  // Wait for animation
  await new Promise(r => setTimeout(r, 500));

  const screenshotDir = path.resolve('C:/Users/oob/.gemini/antigravity/brain/8e8e2c19-1a01-4ec6-8556-229c8149a1bc');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const screenshotPath = path.join(screenshotDir, 'stacked_chart_ui.jpg');
  await page.screenshot({ path: screenshotPath, type: 'jpeg', quality: 90 });

  console.log('Screenshot saved to:', screenshotPath);
  await browser.close();
})();
