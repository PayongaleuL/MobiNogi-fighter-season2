// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ConditionalPanel from './ConditionalPanel';

const burningGlory = {
  name: '타오르는 영광',
  stats: { '가동률': 0.13 },
  conditionalEffects: [{
    id: 'ember-stack-ultimate',
    label: '불씨름 12중첩 궁극기 소모',
    defaultUptime: 0.13,
    uptimeStep: 1,
    source: '궁극기 사용 시 15초 동안 소모한 불씨름 중첩당 공격력 3.5% 증가'
  }]
};

afterEach(cleanup);

describe('ConditionalPanel conditional effect labels', () => {
  it('renders the data-defined condition name and persists its effect-specific uptime key', () => {
    const onUptimeChange = vi.fn();
    render(<ConditionalPanel selectedRunes={{ weapon: [burningGlory] }} conditionalUptimes={{}} onUptimeChange={onUptimeChange} />);
    expect(screen.getByText('타오르는 영광 · 불씨름 12중첩 궁극기 소모')).toBeInTheDocument();
    expect(screen.getByText(/궁극기 사용 시 15초 동안/)).toBeInTheDocument();
    expect(screen.getByRole('slider')).toHaveValue('13');
    expect(screen.getByRole('slider')).toHaveAttribute('step', '1');
    fireEvent.change(screen.getByRole('slider'), { target: { value: '25' } });
    expect(onUptimeChange).toHaveBeenCalledWith('타오르는 영광:ember-stack-ultimate', 25);
  });

  it('continues to show an existing rune-name uptime value for legacy presets', () => {
    render(<ConditionalPanel selectedRunes={{ weapon: [burningGlory] }} conditionalUptimes={{ '타오르는 영광': 40 }} onUptimeChange={vi.fn()} />);
    expect(screen.getByRole('slider')).toHaveValue('40');
  });

  it('derives a v2 effect card from a legacy preset rune object before rendering conditional controls', () => {
    const onUptimeChange = vi.fn();
    const rawVictory = { name: '승전', stats: { '주는피해%': 0.05, '치명타피해%': 0.03, '가동률': 0.3 } };
    render(<ConditionalPanel selectedRunes={{ armor: [rawVictory] }} conditionalUptimes={{}} onUptimeChange={onUptimeChange} />);

    expect(screen.getByText('승전 · 주변 처치 치명타 피해')).toBeInTheDocument();
    expect(screen.getByRole('slider')).toHaveValue('0');
    fireEvent.change(screen.getByRole('slider'), { target: { value: '40' } });
    expect(onUptimeChange).toHaveBeenCalledWith('armor-victory:nearby-kill-crit-damage', 40);
  });

  it('marks unresolved basic-attack or direct-damage effects as excluded instead of exposing a misleading slider', () => {
    const unresolvedTracker = {
      id: 'weapon-tracker',
      name: '추적자',
      stats: { '강타피해%': 0.35, '가동률': 1 },
      effectModelVersion: 2,
      conditionalEffects: [{
        id: 'eight-skill-direct-damage-and-strong-penalty',
        label: '스킬 8회 직접 피해·강타 피해 감소',
        source: '스킬 8회 사용 시 직접 피해를 주고 6초 동안 강타 피해가 감소한다.',
        defaultUptime: 0,
        modelStatus: 'unresolved',
        includedInDps: false
      }]
    };
    render(<ConditionalPanel selectedRunes={{ weapon: [unresolvedTracker] }} conditionalUptimes={{}} onUptimeChange={vi.fn()} />);

    expect(screen.getByText('계산 미반영')).toBeInTheDocument();
    expect(screen.getByText(/평타·적중 이벤트, 스택 유지 또는 직접 피해 시점/)).toBeInTheDocument();
    expect(screen.queryByRole('slider')).not.toBeInTheDocument();
  });
});
