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
    fireEvent.change(screen.getByRole('slider'), { target: { value: '25' } });
    expect(onUptimeChange).toHaveBeenCalledWith('타오르는 영광:ember-stack-ultimate', 25);
  });

  it('continues to show an existing rune-name uptime value for legacy presets', () => {
    render(<ConditionalPanel selectedRunes={{ weapon: [burningGlory] }} conditionalUptimes={{ '타오르는 영광': 40 }} onUptimeChange={vi.fn()} />);
    expect(screen.getByRole('slider')).toHaveValue('40');
  });
});
