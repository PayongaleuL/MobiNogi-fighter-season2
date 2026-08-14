// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import runes from '../data/runes.json';
import RuneAuditDashboard from './RuneAuditDashboard';

afterEach(cleanup);

const getRune = (name) => runes.find((rune) => rune.name === name);

const selectedRunes = {
  무기: [getRune('타오르는 영광')],
  방어구: [null, null, null, null, null],
  장신구: [null, null, null],
  엠블럼: [null],
};

const renderDashboard = () => {
  render(
    <RuneAuditDashboard
      runes={runes}
      onRunesUpdate={vi.fn()}
      selectedRunes={selectedRunes}
    />,
  );
};

describe('RuneAuditDashboard light-mode equipped rune and dictionary', () => {
  it('uses a white surface for non-equipped rows and an emerald surface only for equipped rows', () => {
    renderDashboard();

    const equippedRow = screen.getByRole('button', { name: '타오르는 영광 사전 데이터 보기' }).closest('tr');
    const inactiveRow = screen.getByRole('button', { name: '눈부신 잔영 사전 데이터 보기' }).closest('tr');

    expect(equippedRow).toHaveClass('bg-emerald-50');
    expect(inactiveRow).toHaveClass('bg-white');
    expect(inactiveRow).not.toHaveClass('bg-emerald-50');
  });

  it('opens a read-only dictionary comparison from the rune name and restores focus after Escape', async () => {
    renderDashboard();

    const trigger = screen.getByRole('button', { name: '타오르는 영광 사전 데이터 보기' });
    fireEvent.click(trigger);

    const dialog = screen.getByRole('dialog', { name: /타오르는 영광 사전 데이터/ });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText('마스터 설명 원문')).toBeInTheDocument();
    expect(screen.getByText('저장 데이터 비교')).toBeInTheDocument();
    expect(screen.getByText(/기준 23\.5%/)).toBeInTheDocument();
    expect(screen.getByText(/저장 23\.5%/)).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  });
});
