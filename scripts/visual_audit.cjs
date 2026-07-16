const { chromium } = require('playwright');

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

  const bugs = await page.evaluate(() => {
    const issues = [];
    
    // 1. Mathematically check Document Overflow
    const docWidth = document.documentElement.scrollWidth;
    const docHeight = document.documentElement.scrollHeight;
    
    if (docWidth > 1024) {
      issues.push(`Overflow Bug: Layout width (${docWidth}px) exceeds iPad viewport width (1024px).`);
    }
    if (docHeight > 768) {
      issues.push(`Overflow Bug: Layout height (${docHeight}px) exceeds iPad viewport height (768px).`);
    }

    // 2. Check for visible/unintended scrollbars
    const elements = document.querySelectorAll('*');
    elements.forEach(el => {
      const style = window.getComputedStyle(el);
      const scrollsX = el.scrollWidth > el.clientWidth && (style.overflowX === 'auto' || style.overflowX === 'scroll');
      const scrollsY = el.scrollHeight > el.clientHeight && (style.overflowY === 'auto' || style.overflowY === 'scroll');
      
      if (scrollsX || scrollsY) {
        // Ignore elements where scrollbar is explicitly hidden
        const classes = typeof el.className === 'string' ? el.className : '';
        if (!classes.includes('[&::-webkit-scrollbar]:hidden') && !classes.includes('scrollbar-hide')) {
           issues.push(`Scrollbar Bug: Element <${el.tagName.toLowerCase()} class="${classes.split(' ').slice(0, 3).join(' ')}..."> triggers unintended scrollbar.`);
        }
      }
    });

    // 3. Z-Index / Position overlaps and bugs
    const nav = document.querySelector('nav');
    if (nav) {
      const isSticky = nav.classList.contains('sticky');
      const isRelative = nav.classList.contains('relative');
      if (isSticky && isRelative) {
        issues.push(`Layout Bug: Navbar uses conflicting position classes ('sticky' and 'relative' overlap).`);
      }
    }

    // 4. Overlapping fixed/absolute elements with same z-index
    const positionedElements = Array.from(elements).filter(el => {
      const style = window.getComputedStyle(el);
      return (style.position === 'absolute' || style.position === 'fixed') && style.zIndex !== 'auto';
    });

    for (let i = 0; i < positionedElements.length; i++) {
      for (let j = i + 1; j < positionedElements.length; j++) {
        const el1 = positionedElements[i];
        const el2 = positionedElements[j];
        if (el1.contains(el2) || el2.contains(el1)) continue;

        const r1 = el1.getBoundingClientRect();
        const r2 = el2.getBoundingClientRect();
        const overlaps = !(r1.right <= r2.left || r1.left >= r2.right || r1.bottom <= r2.top || r1.top >= r2.bottom);

        if (overlaps) {
          const z1 = window.getComputedStyle(el1).zIndex;
          const z2 = window.getComputedStyle(el2).zIndex;
          if (z1 === z2) {
             issues.push(`Z-Index Overlap: Elements visually overlap with same z-index (${z1}).`);
          }
        }
      }
    }
    
    return issues;
  });

  if (bugs.length > 0) {
    console.log("UI Bugs Found:");
    const uniqueBugs = [...new Set(bugs)];
    uniqueBugs.forEach(bug => console.log(`- ${bug}`));
  } else {
    console.log("System Nominal.");
  }

  await browser.close();
})();
