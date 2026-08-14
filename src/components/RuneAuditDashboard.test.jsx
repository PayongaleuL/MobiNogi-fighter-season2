// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
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

// 전체 88개 행은 교정실 렌더링 성능을 다루는 별도 UX 검사에서 검증한다.
// 여기서는 각 계약에 필요한 최소 fixture만 사용해 CI 기본 5초 제한에서도
// 상태·접근성·모달 계약을 안정적으로 검증한다.
const baseDashboardRunes = [getRune('타오르는 영광'), getRune('눈부신 잔영')];

const renderDashboard = (dashboardRunes = baseDashboardRunes) => {
  render(
    <RuneAuditDashboard
      runes={dashboardRunes}
      canonicalRunes={dashboardRunes}
      selectedRunes={selectedRunes}
    />,
  );
};

describe('RuneAuditDashboard light-mode equipped rune and dictionary', () => {
  it('uses distinct light and dark surfaces for equipped and non-equipped rows', () => {
    renderDashboard();

    const equippedRow = screen.getByRole('button', { name: '타오르는 영광 사전 데이터 보기' }).closest('tr');
    const inactiveRow = screen.getByRole('button', { name: '눈부신 잔영 사전 데이터 보기' }).closest('tr');

    expect(equippedRow).toHaveClass('bg-emerald-50');
    expect(inactiveRow).toHaveClass('bg-white');
    expect(inactiveRow).not.toHaveClass('bg-emerald-50');

    expect(equippedRow).toHaveClass('dark:bg-emerald-950/80');
    expect(equippedRow).toHaveClass('dark:border-emerald-300');
    expect(inactiveRow).toHaveClass('dark:bg-slate-900/70');
    expect(inactiveRow).not.toHaveClass('dark:bg-emerald-950/80');
  });

  it('marks effect-model v2 runes and describes their individual conditional effects', () => {
    const effectModelRunes = [{
      ...getRune('승전'),
      effectModelVersion: 2,
      conditionalEffects: [{
        id: 'nearby-kill-crit-damage',
        label: '주변 처치 치명타 피해',
        defaultUptime: 0,
        modelStatus: 'manual',
        source: '주위에서 적이 처치될 경우 치명타 피해가 증가한다.'
      }]
    }];
    renderDashboard(effectModelRunes);

    expect(screen.getAllByText('효과 분리 v2').length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: '승전 사전 데이터 보기' }));
    expect(screen.getByText('효과 모델 v2')).toBeInTheDocument();
    expect(screen.getByText('조건부 효과·가동률 정책')).toBeInTheDocument();
    expect(screen.getByText('주변 처치 치명타 피해')).toBeInTheDocument();
    expect(screen.getByText('기본 가동률 0%')).toBeInTheDocument();
  });

  it('reports zero local customizations when current runes match the canonical baseline', () => {
    renderDashboard();

    expect(screen.getByText('수정됨 (로컬 실험)')).toBeInTheDocument();
    expect(screen.getByText('수정됨 (로컬 실험)').parentElement).toHaveTextContent('0 개');
    expect(screen.getByText('기준 데이터 일치').parentElement).toHaveTextContent('2 개');
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
