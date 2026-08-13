// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Calculator from './Calculator';

describe('Calculator preset state integrity', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(window, 'prompt').mockReturnValue('QA 보스 설정');
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('provides the latest ship-dummy specification examples when no user preset exists', async () => {
    const user = userEvent.setup();
    render(<Calculator />);

    const referencePreset = await screen.findByText('예시 1 · 함선허수 약승열 풀오토 (991.7만)');
    await user.click(referencePreset);

    await waitFor(() => expect(screen.getAllByDisplayValue('60607')).toHaveLength(2));
    expect(JSON.parse(localStorage.getItem('mabi_calculator_seals')).weapon).toMatchObject({ type: 'red_moon', baseAtkOverride: 800 });
  });

  it('saves and restores the boss gimmick and seals with a preset', async () => {
    const user = userEvent.setup();
    render(<Calculator />);

    const comboboxes = await screen.findAllByRole('combobox');
    const bossSelect = comboboxes[5];
    await user.selectOptions(bossSelect, '카브락 · 입문');

    const saveButtons = screen.getAllByRole('button', { name: '현재 구성 저장' });
    await user.click(saveButtons[0]);

    const presets = JSON.parse(localStorage.getItem('mabi_runes_presets_v5'));
        expect(presets[0].data.gimmicks.boss).toBe('카브락 · 입문');

    expect(presets[0].data.seals.weapon.type).toBe('none');

    await user.selectOptions(bossSelect, '함선 허수아비');
    expect(bossSelect).toHaveValue('함선 허수아비');

    await user.click(screen.getByText('QA 보스 설정'));
        expect(bossSelect).toHaveValue('카브락 · 입문');

  });
});
