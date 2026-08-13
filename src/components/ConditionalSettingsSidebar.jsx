import React from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import ConditionalPanel from './ConditionalPanel';
import SkillStancePanel from './SkillStancePanel';

function SettingsContent({
  skillStances,
  onStanceChange,
  selectedRunes,
  conditionalUptimes,
  onUptimeChange,
  nightBlessingUptime,
  onNightBlessingChange,
  compact
}) {
  return (
    <div className="flex flex-col gap-4">
      <SkillStancePanel
        skillStances={skillStances}
        onStanceChange={onStanceChange}
        compact={compact}
      />
      <div className="border-t border-theme pt-3">
        <ConditionalPanel
          selectedRunes={selectedRunes}
          conditionalUptimes={conditionalUptimes}
          onUptimeChange={onUptimeChange}
          nightBlessingUptime={nightBlessingUptime}
          onNightBlessingChange={onNightBlessingChange}
        />
      </div>
    </div>
  );
}

export default function ConditionalSettingsSidebar({
  isOpen,
  onOpen,
  onClose,
  skillStances,
  onStanceChange,
  selectedRunes,
  conditionalUptimes,
  onUptimeChange,
  nightBlessingUptime,
  onNightBlessingChange
}) {
  return (
    <>
      <details className="mb-1 rounded-lg border border-theme bg-theme-card theme-transition lg:hidden">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between px-3 py-2.5 text-xs font-black text-theme-main">
          <span className="flex items-center gap-2"><SlidersHorizontal className="h-4 w-4 text-orange-500" />스킬 스탠스·조건부 설정</span>
          <span className="text-[10px] text-orange-500">열기</span>
        </summary>
        <div className="border-t border-theme p-3">
          <SettingsContent
            skillStances={skillStances}
            onStanceChange={onStanceChange}
            selectedRunes={selectedRunes}
            conditionalUptimes={conditionalUptimes}
            onUptimeChange={onUptimeChange}
            nightBlessingUptime={nightBlessingUptime}
            onNightBlessingChange={onNightBlessingChange}
            compact
          />
        </div>
      </details>

      <button
        type="button"
        aria-label="전투 보조 설정 열기"
        aria-expanded={isOpen}
        aria-controls="conditional-settings-drawer"
        onClick={onOpen}
        className="fixed left-0 top-1/2 z-30 hidden -translate-y-1/2 rounded-r-2xl border border-l-0 border-orange-500/40 bg-theme-card px-2.5 py-4 text-orange-500 shadow-lg transition-all hover:bg-orange-500 hover:text-white focus-orange-glow focus:outline-none lg:flex lg:flex-col lg:items-center lg:gap-2"
      >
        <SlidersHorizontal className="h-4 w-4" />
        <span className="[writing-mode:vertical-rl] text-[10px] font-black tracking-[0.12em]">전투 설정</span>
      </button>

      {isOpen && (
        <button
          type="button"
          aria-label="전투 보조 설정 패널 닫기"
          onClick={onClose}
          className="fixed inset-0 z-40 hidden cursor-default bg-transparent lg:block"
        />
      )}

      <aside
        id="conditional-settings-drawer"
        aria-label="스킬 스탠스 및 조건부 버프 설정"
        aria-hidden={!isOpen}
        className={`fixed left-0 top-0 z-50 hidden h-dvh w-[420px] max-w-[calc(100vw-1rem)] border-r border-theme bg-theme-main shadow-2xl transition-transform duration-300 ease-out lg:flex lg:flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full pointer-events-none'}`}
      >
        <div className="flex items-center justify-between border-b border-theme bg-theme-card px-4 py-3 theme-transition">
          <div>
            <p className="text-[10px] font-black tracking-[0.14em] text-orange-500">COMBAT SETTINGS</p>
            <h2 className="mt-0.5 text-sm font-black text-theme-main">스탠스·조건부 설정</h2>
          </div>
          <button
            type="button"
            aria-label="전투 보조 설정 닫기"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-theme bg-theme-subcard text-theme-sub transition-colors hover:border-orange-500 hover:text-orange-500 focus-orange-glow focus:outline-none"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          <SettingsContent
            skillStances={skillStances}
            onStanceChange={onStanceChange}
            selectedRunes={selectedRunes}
            conditionalUptimes={conditionalUptimes}
            onUptimeChange={onUptimeChange}
            nightBlessingUptime={nightBlessingUptime}
            onNightBlessingChange={onNightBlessingChange}
          />
        </div>
      </aside>
    </>
  );
}
