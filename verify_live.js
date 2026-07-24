import { chromium } from 'playwright';

(async () => {
  console.log("Launching headless Chromium for final verify...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log("Navigating to GitHub Pages live site...");
  await page.goto('https://payongaleul.github.io/MobiNogi-fighter-season2/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);
  
  console.log("Extracting rendered version header...");
  const versionText = await page.evaluate(() => {
    const span = document.querySelector('span.font-bold');
    return span ? span.innerText : 'Version span not found';
  });
  console.log("Rendered version header on page:", versionText);

  console.log("Checking if presets container rendered...");
  const presetsText = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const prSetButton = buttons.find(b => b.innerText.includes('셋팅 1') || b.innerText.includes('셋팅 2'));
    return prSetButton ? 'Presets Buttons Found' : 'Presets Buttons Not Found';
  });
  console.log("Presets Check:", presetsText);
  
  await browser.close();
  console.log("Browser closed.");
})();
