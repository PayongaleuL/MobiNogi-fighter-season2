import { createHash } from 'node:crypto';
import { mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';

const manifestPath = path.resolve(process.argv[2] ?? 'results/private_dps_logs/manifest.local.json');
const sourceDirectory = path.join(path.dirname(manifestPath), 'sources');
const digest = (value) => createHash('sha256').update(value, 'utf8').digest('hex');

async function fetchWithTimeout(url, timeoutMs = 45_000) {
  const response = await fetch(url, {
    headers: { accept: 'application/json' },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
}

await mkdir(sourceDirectory, { recursive: true });
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const collectedAt = new Date().toISOString();

for (const entry of manifest.records ?? []) {
  const analysisId = String(entry.analysisId ?? '').trim();
  const sourceUrl = String(entry.url ?? '').trim();
  const recordId = sourceUrl.split('/').filter(Boolean).at(-1);
  if (!analysisId || !recordId) throw new Error('비공개 매니페스트의 analysisId 또는 URL이 비어 있습니다.');

  const temporaryPath = path.join(sourceDirectory, `${analysisId}.download`);
  const outputPath = path.join(sourceDirectory, `${analysisId}.json`);
  try {
    const sourceText = await fetchWithTimeout(`https://mobi-score.com/api/record-share/${recordId}`);
    const outer = JSON.parse(sourceText);
    if (typeof outer.recordJson !== 'string' || !outer.recordJson.trim()) {
      throw new Error('recordJson이 비어 있습니다.');
    }
    JSON.parse(outer.recordJson);
    await writeFile(temporaryPath, sourceText, 'utf8');
    await rename(temporaryPath, outputPath);
    entry.sourceSha256 = digest(sourceText);
    entry.recordJsonSha256 = digest(outer.recordJson);
    entry.collectedAt = collectedAt;
    console.log(`${analysisId} 수집·검증 완료`);
  } catch (error) {
    await unlink(temporaryPath).catch(() => {});
    throw new Error(`${analysisId}: 원본 응답 수집 또는 JSON 검증 실패 — ${error instanceof Error ? error.message : String(error)}`);
  }
}

manifest.collectedAt = collectedAt;
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(`비공개 원본 ${manifest.records.length}건 수집 완료`);
