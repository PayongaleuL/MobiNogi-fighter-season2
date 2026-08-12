import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const port = Number(process.env.E2E_PORT || 4175);
const baseURL = `http://127.0.0.1:${port}/MobiNogi-fighter-season2/`;
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const server = spawn(npmCommand, ['run', 'preview', '--', '--host', '127.0.0.1', '--port', String(port)], {
  stdio: ['ignore', 'pipe', 'pipe'],
  detached: process.platform !== 'win32',
});
const serverOutput = [];
server.stdout.on('data', chunk => serverOutput.push(chunk.toString()));
server.stderr.on('data', chunk => serverOutput.push(chunk.toString()));

async function waitForPreview() {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(baseURL);
      if (response.ok) return;
    } catch {
      // The preview server may still be starting.
    }
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  throw new Error(`미리보기 서버 시작 시간 초과:\n${serverOutput.join('')}`);
}

async function stopPreview() {
  if (server.exitCode !== null || server.signalCode !== null) return;
  await new Promise(resolve => {
    server.once('exit', resolve);
    const terminate = signal => {
      if (process.platform === 'win32') server.kill(signal);
      else process.kill(-server.pid, signal);
    };
    terminate('SIGTERM');
    setTimeout(() => {
      if (server.exitCode === null && server.signalCode === null) terminate('SIGKILL');
    }, 5_000).unref();
  });
}

async function verifyViewport(browser, name, viewport, exerciseInput) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
  page.on('console', message => {
    if (message.type() === 'error') errors.push(`console.error: ${message.text()}`);
  });

  await page.goto(baseURL, { waitUntil: 'networkidle' });
  await page.getByText('종합 실전 예상 DPS', { exact: true }).waitFor();
  await page.getByText('마을 공격력', { exact: true }).waitFor();

  if (exerciseInput) {
    const dpsValue = page.locator('span.text-3xl.font-black.text-orange-500').first();
    const dpsBefore = (await dpsValue.innerText()).replace(/,/g, '').replace('DPS', '').trim();
    const attackInput = page.getByText('마을 공격력', { exact: true })
      .locator('xpath=../..')
      .locator('input[type="number"]');
    await attackInput.fill('60607');
    await attackInput.press('Tab');
    await page.waitForTimeout(200);
    const dpsAfter = (await dpsValue.innerText()).replace(/,/g, '').replace('DPS', '').trim();

    if (!/^\d+$/.test(dpsBefore) || !/^\d+$/.test(dpsAfter) || Number(dpsAfter) <= 0 || dpsAfter === dpsBefore) {
      throw new Error(`입력-결과 재계산 실패: before=${dpsBefore}, after=${dpsAfter}`);
    }
    await page.getByText('예시 1 · 함선허수 약승열 풀오토 (991.7만)', { exact: true }).waitFor();
  }

  await page.screenshot({ path: `results/e2e/${name}-calculator.png`, fullPage: true });
  await context.close();
  if (errors.length) throw new Error(`${name} 브라우저 오류:\n${errors.join('\n')}`);
}

try {
  await mkdir('results/e2e', { recursive: true });
  await waitForPreview();
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}),
  });
  try {
    await verifyViewport(browser, 'desktop', { width: 1440, height: 1000 }, true);
    await verifyViewport(browser, 'mobile', { width: 390, height: 844 }, false);
  } finally {
    await browser.close();
  }
  console.log('PASS: 데스크톱·모바일 렌더링, 마을 공격력 입력, DPS 재계산, 예시 프리셋 표시, 브라우저 오류 0건');
} finally {
  await stopPreview();
}
