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
    let stanceSettingsBehavior = false;
    if (target.width >= 1024) {
      const combatSettingsToggle = page.getByRole('button', { name: '전투 보조 설정 열기' });
      const drawer = page.locator('#conditional-settings-drawer');
      await combatSettingsToggle.click();
      const opens = await drawer.getAttribute('aria-hidden') === 'false';
      const stanceSelects = drawer.getByRole('combobox');
      const stanceCount = await stanceSelects.count();
      const firstStance = stanceSelects.first();
      const currentStance = await firstStance.inputValue();
      const nextStance = currentStance === '충돌' ? '약점' : '충돌';
      await firstStance.selectOption(nextStance);
      const stanceValueUpdated = await firstStance.inputValue() === nextStance;
      stanceSettingsBehavior = stanceCount === 5 && stanceValueUpdated;
      await page.getByRole('button', { name: '전투 보조 설정 패널 닫기' }).click();
      const closesOnOutsideClick = await drawer.getAttribute('aria-hidden') === 'true';
      await combatSettingsToggle.click();
      await page.keyboard.press('Escape');
      const closesOnEscape = await drawer.getAttribute('aria-hidden') === 'true';
      conditionalSettingsBehavior = opens && closesOnOutsideClick && closesOnEscape;
    } else {
      const mobileCombatDetails = page.locator('details').first();
      await mobileCombatDetails.locator('summary').click();
      conditionalSettingsBehavior = await mobileCombatDetails.getAttribute('open') !== null;
      stanceSettingsBehavior = await mobileCombatDetails.getByRole('combobox').count() === 5;
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

    const headerDensityCheck = target.width < 1024 || await page.evaluate(() => {
      const title = document.querySelector('h2');
      const header = title?.closest('div[class*="border-b"]');
      const firstSection = [...document.querySelectorAll('h2, h3')]
        .find((heading) => heading.textContent?.trim() === '기본 스펙과 시즌 패시브');
      if (!header || !firstSection) return false;
      const headerRect = header.getBoundingClientRect();
      const sectionRect = firstSection.getBoundingClientRect();
      return headerRect.top <= 32 && headerRect.height <= 70 && sectionRect.top <= 110;
    });

    const mobileErgonomicsCheck = target.width >= 1024 || await page.evaluate(() => {
      const tabButtons = ['종합 계산기', '보석 세공실', '룬 교정실', '인장 설정실']
        .map((label) => [...document.querySelectorAll('button')].find((button) => button.textContent?.trim() === label));
      const themeButton = document.querySelector('button[aria-label="밝은 테마와 어두운 테마 전환"]');
      const combatSummary = document.querySelector('details > summary');
      const dpsHeading = [...document.querySelectorAll('h2')]
        .find((heading) => heading.textContent?.trim() === '실전 DPS 결과');
      const basicHeading = [...document.querySelectorAll('h3')]
        .find((heading) => heading.textContent?.trim() === '기본 스펙과 시즌 패시브');
      const firstStatInput = document.querySelector('input[type="number"]');
      const firstTranscendButton = [...document.querySelectorAll('button')]
        .find((button) => button.textContent?.trim() === '미초월');
      if (!themeButton || !combatSummary || !dpsHeading || !basicHeading || !firstStatInput || !firstTranscendButton || tabButtons.some((button) => !button)) return false;
      const controlsHaveComfortableTargets = [...tabButtons, themeButton, combatSummary]
        .every((element) => element.getBoundingClientRect().height >= 44);
      const resultComesBeforeSetup = dpsHeading.getBoundingClientRect().top < basicHeading.getBoundingClientRect().top;
      const statTextIsReadable = parseFloat(window.getComputedStyle(firstStatInput).fontSize) >= 12;
      const transcendTargetIsUsable = firstTranscendButton.getBoundingClientRect().height >= 32;
      return controlsHaveComfortableTargets && resultComesBeforeSetup && statTextIsReadable && transcendTargetIsUsable;
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
      stanceSettingsBehavior,
      firstFoldCheck,
      headerDensityCheck,
      mobileErgonomicsCheck
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
    !result.stanceSettingsBehavior ||
    !result.firstFoldCheck ||
    !result.headerDensityCheck ||
    !result.mobileErgonomicsCheck
  ))) {
    process.exitCode = 1;
  }
} finally {
  await browser.close();
}
