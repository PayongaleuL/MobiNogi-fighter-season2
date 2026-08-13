import { chromium } from 'playwright';

const baseUrl = process.env.UI_E2E_BASE_URL || 'http://127.0.0.1:5173/MobiNogi-fighter-season2/';
const targets = [
  { name: 'ultrawide', width: 2560, height: 1440 },
  { name: 'desktop', width: 1440, height: 1050 },
  { name: 'mobile', width: 390, height: 844 }
];

const browser = await chromium.launch({
  headless: true,
  ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {})
});
const results = [];

try {
  for (const target of targets) {
    const page = await browser.newPage({ viewport: { width: target.width, height: target.height }, deviceScaleFactor: 1 });
    await page.goto(baseUrl, { waitUntil: 'networkidle' });

    const dpsSection = page.getByRole('region', { name: '실전 DPS 결과 요약' });
    const baselineDps = await dpsSection.innerText();
    await page.locator('input[type="number"]').first().fill('28000');
    await page.waitForTimeout(100);
    const updatedDps = await dpsSection.innerText();
    const dpsHasStickyAncestor = await dpsSection.evaluate((element) => {
      for (let node = element; node; node = node.parentElement) {
        const position = window.getComputedStyle(node).position;
        if (position === 'sticky' || position === 'fixed') return true;
      }
      return false;
    });

    let conditionalSettingsBehavior = false;
    if (target.width >= 1024) {
      const conditionalToggle = page.getByRole('button', { name: '조건부 버프 및 가동률 설정 열기' });
      const drawer = page.locator('#conditional-settings-drawer');
      await conditionalToggle.click();
      const opens = await drawer.getAttribute('aria-hidden') === 'false';
      await page.getByRole('button', { name: '조건부 설정 패널 닫기' }).click();
      const closesOnOutsideClick = await drawer.getAttribute('aria-hidden') === 'true';
      await conditionalToggle.click();
      await page.keyboard.press('Escape');
      const closesOnEscape = await drawer.getAttribute('aria-hidden') === 'true';
      conditionalSettingsBehavior = opens && closesOnOutsideClick && closesOnEscape;
    } else {
      const mobileConditionalDetails = page.locator('details').first();
      await mobileConditionalDetails.locator('summary').click();
      conditionalSettingsBehavior = await mobileConditionalDetails.getAttribute('open') !== null;
    }

    await page.getByRole('button', { name: '보석 세공실' }).click();
    const gemstoneTabVisible = await page.getByText('보석 세공 인벤토리 관리', { exact: false }).isVisible();
    await page.getByRole('button', { name: '종합 계산기' }).click();

    await page.getByText('룬을 선택해주세요', { exact: true }).first().click();
    await page.getByRole('button', { name: /눈부신 잔영/ }).first().click();
    await page.getByRole('button', { name: '룬 교정실' }).click();
    await page.locator('select').nth(1).selectOption('EQUIPPED');
    const equippedRuneVisual = await page.locator('tbody tr').first().evaluate((row) => {
      const stickyCell = row.querySelector('td');
      return row.className.includes('bg-emerald-500/8') &&
        row.className.includes('border-emerald-500') &&
        stickyCell?.className.includes('bg-emerald-500/10');
    });
    await page.getByRole('button', { name: '종합 계산기' }).click();

    const themeButton = page.getByRole('button', { name: '밝은 테마와 어두운 테마 전환' });
    await themeButton.click();
    const darkThemeApplied = await page.evaluate(() => document.documentElement.classList.contains('theme-dark'));
    await themeButton.click();

    const firstFoldCheck = target.name !== 'ultrawide' || await page.evaluate(() => {
      const textTargets = ['실전 DPS 결과', '시즌 2 룬 세팅 구성', '상황별 세부 연산', '셋팅 비교 및 저장'];
      return textTargets.every((text) => {
        const element = [...document.querySelectorAll('h2, h3')].find((candidate) => candidate.textContent?.trim() === text);
        if (!element) return false;
        const rect = element.getBoundingClientRect();
        return rect.top >= 0 && rect.bottom <= window.innerHeight;
      });
    });

    await page.screenshot({ path: `results/e2e/ux-ui-${target.name}.png`, fullPage: true });

    const report = await page.evaluate(() => ({
      title: document.querySelector('h2')?.textContent?.trim(),
      dpsHeading: [...document.querySelectorAll('h2')].find((heading) => heading.textContent?.includes('실전 DPS 결과'))?.textContent?.trim(),
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      dpsText: [...document.querySelectorAll('p')].find((paragraph) => paragraph.textContent?.includes('종합 실전 예상 DPS'))?.parentElement?.textContent?.trim(),
      overflowCandidates: [...document.querySelectorAll('*')]
        .map((element) => {
          const rect = element.getBoundingClientRect();
          return {
            tag: element.tagName,
            className: typeof element.className === 'string' ? element.className : '',
            text: element.textContent?.trim().slice(0, 60),
            right: Math.ceil(rect.right),
            viewport: document.documentElement.clientWidth
          };
        })
        .filter((item) => item.right > item.viewport + 1)
        .slice(0, 8)
    }));

    results.push({
      viewport: target.name,
      title: report.title,
      dpsHeading: report.dpsHeading,
      hasHorizontalOverflow: report.scrollWidth > report.clientWidth,
      dpsText: report.dpsText,
      overflowCandidates: report.overflowCandidates,
      dpsUpdatesWhenStatChanges: baselineDps !== updatedDps,
      dpsHasStickyAncestor,
      gemstoneTabVisible,
      equippedRuneVisual,
      darkThemeApplied,
      conditionalSettingsBehavior,
      firstFoldCheck
    });
    await page.close();
  }

  console.log(JSON.stringify(results, null, 2));
  if (results.some((result) => (
    result.hasHorizontalOverflow ||
    !result.dpsHeading ||
    result.dpsHasStickyAncestor ||
    !result.dpsUpdatesWhenStatChanges ||
    !result.gemstoneTabVisible ||
    !result.equippedRuneVisual ||
    !result.darkThemeApplied ||
    !result.conditionalSettingsBehavior ||
    !result.firstFoldCheck
  ))) {
    process.exitCode = 1;
  }
} finally {
  await browser.close();
}
