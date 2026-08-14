import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const port = Number(process.env.RUNE_AUDIT_UI_PORT || 4176);
const baseUrl = `http://127.0.0.1:${port}/MobiNogi-fighter-season2/`;
const screenshotDir = 'results/rune-audit-ui';

const server = spawn(
  process.execPath,
  ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', String(port)],
  { stdio: ['ignore', 'pipe', 'pipe'], detached: process.platform !== 'win32' },
);
const serverOutput = [];
server.stdout.on('data', (chunk) => serverOutput.push(chunk.toString()));
server.stderr.on('data', (chunk) => serverOutput.push(chunk.toString()));

async function waitForPreview() {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
    } catch {
      // Preview server may still be starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`미리보기 서버 시작 시간 초과:\n${serverOutput.join('')}`);
}

async function stopPreview() {
  if (server.exitCode !== null || server.signalCode !== null) return;
  await new Promise((resolve) => {
    server.once('exit', resolve);
    const terminate = (signal) => {
      if (process.platform === 'win32') server.kill(signal);
      else process.kill(-server.pid, signal);
    };
    terminate('SIGTERM');
    setTimeout(() => {
      if (server.exitCode === null && server.signalCode === null) terminate('SIGKILL');
    }, 5_000).unref();
  });
}

async function assertIncludes(locator, expectedClass, message) {
  const className = await locator.getAttribute('class');
  if (!className?.includes(expectedClass)) {
    throw new Error(`${message}: expected class "${expectedClass}", actual "${className}"`);
  }
}

async function verifyViewport(browser, name, viewport) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console.error: ${message.text()}`);
  });

  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.getByText('무기 룬', { exact: true }).first().click();
  await page.getByRole('button', { name: /타오르는 영광/ }).click();
  await page.getByRole('button', { name: '룬 교정실', exact: true }).click();

  const equippedTrigger = page.getByRole('button', { name: '타오르는 영광 사전 데이터 보기' });
  const inactiveTrigger = page.getByRole('button', { name: '눈부신 잔영 사전 데이터 보기' });
  await equippedTrigger.waitFor();
  await inactiveTrigger.waitFor();

  const equippedRow = equippedTrigger.locator('xpath=ancestor::tr');
  const inactiveRow = inactiveTrigger.locator('xpath=ancestor::tr');
  await assertIncludes(equippedRow, 'bg-emerald-50', `${name} 장착 행 라이트 강조`);
  await assertIncludes(inactiveRow, 'bg-white', `${name} 미장착 행 흰색 표면`);
  if ((await inactiveRow.getAttribute('class'))?.includes('bg-emerald-50')) {
    throw new Error(`${name} 미장착 행에 장착 강조색이 적용되었습니다.`);
  }

  await page.screenshot({ path: `${screenshotDir}/${name}-light-table.png`, fullPage: true });
  await equippedTrigger.click();
  const dialog = page.getByRole('dialog', { name: /타오르는 영광 사전 데이터/ });
  await dialog.waitFor();
  await dialog.getByText('마스터 설명 원문', { exact: true }).waitFor();
  await dialog.getByText('저장 데이터 비교', { exact: true }).waitFor();
  await page.screenshot({ path: `${screenshotDir}/${name}-dictionary.png`, fullPage: true });

  await page.keyboard.press('Escape');
  await dialog.waitFor({ state: 'hidden' });

  await assertIncludes(equippedRow, 'dark:bg-emerald-500/8', `${name} 장착 행 다크 모드 클래스 보존`);
  await assertIncludes(inactiveRow, 'dark:bg-slate-500/5', `${name} 미장착 행 다크 모드 클래스 보존`);

  await context.close();
  if (errors.length) throw new Error(`${name} 브라우저 오류:\n${errors.join('\n')}`);
}

try {
  await mkdir(screenshotDir, { recursive: true });
  await waitForPreview();
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}),
  });
  try {
    await verifyViewport(browser, 'desktop', { width: 1440, height: 1050 });
    await verifyViewport(browser, 'mobile', { width: 390, height: 844 });
  } finally {
    await browser.close();
  }
  console.log('PASS: 라이트 모드 미장착 흰색·장착 에메랄드 강조, 룬 사전 상세, Escape 닫기, 다크 모드 클래스 보존, 데스크톱·모바일 렌더링');
} finally {
  await stopPreview();
}
