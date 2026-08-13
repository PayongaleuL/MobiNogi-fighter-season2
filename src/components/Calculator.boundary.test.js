import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const calculatorSource = readFileSync(
  fileURLToPath(new URL('./Calculator.jsx', import.meta.url)),
  'utf8',
);

describe('Calculator rendering boundary', () => {
  it('consumes the application adapter result instead of importing calculation implementations', () => {
    expect(calculatorSource).toContain("import { useDpsResult } from '../adapters/useDpsResult';");
    expect(calculatorSource).not.toMatch(/import\s+\{\s*calculateDPS\s*\}/);
    expect(calculatorSource).not.toMatch(/import\s+\{\s*calculateGemStats\s*\}/);
    expect(calculatorSource).not.toContain('parseSkillMarkdown');
    expect(calculatorSource).not.toContain('skillMdText');
  });
});
