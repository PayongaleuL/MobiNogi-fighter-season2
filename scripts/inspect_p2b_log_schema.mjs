import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const logsDir = path.resolve('results/p2b_raw_logs');
const files = (await readdir(logsDir)).filter((file) => file.endsWith('.json')).sort();

for (const file of files) {
  const outer = JSON.parse(await readFile(path.join(logsDir, file), 'utf8'));
  const row = {
    file,
    outerKeys: Object.keys(outer),
  };

  for (const [key, value] of Object.entries(outer)) {
    if (typeof value === 'string' && key.toLowerCase().endsWith('json')) {
      try {
        const nested = JSON.parse(value);
        row[`${key}Keys`] = Object.keys(nested);
        row[`${key}Summary`] = {
          title: nested.title,
          player: nested.player,
          target: nested.target,
          duration: nested.duration,
          dps: nested.dps,
          totalDamage: nested.totalDamage,
          skillCount: Array.isArray(nested.skills) ? nested.skills.length : undefined,
        };
      } catch {
        row[`${key}Keys`] = 'non-json string';
      }
    }
  }

  console.log(JSON.stringify(row));
}
