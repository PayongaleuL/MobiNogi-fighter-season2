// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
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

  it('saves and restores the boss gimmick and seals with a preset', async () => {
    const user = userEvent.setup();
    render(<Calculator />);

    const comboboxes = await screen.findAllByRole('combobox');
    const bossSelect = comboboxes[5];
    await user.selectOptions(bossSelect, '어비스 지옥2');

    const saveButtons = screen.getAllByRole('button', { name: '현재 구성 저장' });
    await user.click(saveButtons[0]);

    const presets = JSON.parse(localStorage.getItem('mabi_runes_presets_v5'));
    expect(presets[0].data.gimmicks.boss).toBe('어비스 지옥2');
    expect(presets[0].data.seals.weapon.type).toBe('none');

    await user.selectOptions(bossSelect, '함선 허수아비');
    expect(bossSelect).toHaveValue('함선 허수아비');

    await user.click(screen.getByText('QA 보스 설정'));
    expect(bossSelect).toHaveValue('어비스 지옥2');
  });
});
