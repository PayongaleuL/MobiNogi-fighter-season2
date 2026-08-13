import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const coreModules = ['calculator.js', 'gemCalculator.js', 'sealCalculator.js'];
const forbiddenDependencies = [
  /from ['"]react['"]/i,
  /\bwindow\b/,
  /\bdocument\b/,
  /\blocalStorage\b/,
  /\bsessionStorage\b/,
  /\bDate\b/,
  /Math\.random/,
];

describe('core calculation boundary', () => {
  it('keeps deterministic calculations independent from React and browser runtime APIs', () => {
    coreModules.forEach((fileName) => {
      const source = readFileSync(fileURLToPath(new URL(`./${fileName}`, import.meta.url)), 'utf8');
      forbiddenDependencies.forEach((pattern) => {
        expect(source).not.toMatch(pattern);
      });
    });
  });
});
