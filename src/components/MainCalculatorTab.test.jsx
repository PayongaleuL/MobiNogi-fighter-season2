// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { DpsOverview } from './MainCalculatorTab';

afterEach(cleanup);

describe('DpsOverview calculation status badge', () => {
  const baseResult = { weightedDps: 0, totalAtk: 0, runeAtkAdd: 0, critProb: 0, extraProb: 0 };

  it('shows only the error badge for invalid cycle input', () => {
    render(<DpsOverview equippedRuneCount={0} dpsResult={{ ...baseResult, status: 'invalid', errors: [{ state: 'ordinary', code: 'EMPTY_ROTATION' } ] }} />);
    expect(screen.getByText('계산 입력 오류')).toBeInTheDocument();
    expect(screen.queryByText('계산 상태 정상')).not.toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('딜사이클 입력 오류');
  });

  it('shows the normal badge for a valid calculation', () => {
    render(<DpsOverview equippedRuneCount={0} dpsResult={{ ...baseResult, status: 'ok', errors: [] }} />);
    expect(screen.getByText('계산 상태 정상')).toBeInTheDocument();
    expect(screen.queryByText('계산 입력 오류')).not.toBeInTheDocument();
  });
});
