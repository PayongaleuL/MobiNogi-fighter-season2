import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  await page.goto('https://payongaleul.github.io/MobiNogi-fighter-season2/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);
  
  console.log("Searching for specific text nodes...");
  const data = await page.evaluate(() => {
    const findText = (query) => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node;
      const results = [];
      while (node = walker.nextNode()) {
        if (node.nodeValue.includes(query)) {
          results.push(node.nodeValue.trim());
        }
      }
      return results;
    };
    return {
      atk: findText('적용 공격력'),
      dps: findText('DPS'),
      statAtk: findText('공격력'),
      crit: findText('치명타')
    };
  });
  
  console.log("=== Rendered text nodes matching query ===");
  console.log("적용 공격력 관련:", data.atk);
  console.log("DPS 관련:", data.dps.slice(0, 10));
  console.log("공격력 관련:", data.statAtk.slice(0, 10));
  console.log("치명타 관련:", data.crit.slice(0, 10));
  
  await browser.close();
})();
