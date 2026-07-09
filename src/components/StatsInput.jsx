import React from 'react';
import { User, Activity, Settings } from 'lucide-react';

export default function StatsInput({ stats, onStatsChange }) {
  const handleInputChange = (key, val) => {
    onStatsChange(key, parseFloat(val) || 0);
  };

  const applySkillPreset = (presetType) => {
    const presets = {
      '156': { skillLevel_1: 30, skillLevel_2: 10, skillLevel_3: 10, skillLevel_4: 10, skillLevel_5: 30, skillLevel_6: 30 },
      '256': { skillLevel_1: 10, skillLevel_2: 30, skillLevel_3: 10, skillLevel_4: 10, skillLevel_5: 30, skillLevel_6: 30 },
      '456': { skillLevel_1: 10, skillLevel_2: 10, skillLevel_3: 10, skillLevel_4: 30, skillLevel_5: 30, skillLevel_6: 30 }
    };
    const config = presets[presetType];
    if (config) {
      Object.entries(config).forEach(([key, val]) => {
        onStatsChange(key, val);
      });
    }
  };

  const statFields = [
    { label: '마을 공격력', key: 'baseAttack', min: 1000, max: 100000, step: 1 },
    { label: '치명타 수치', key: 'critScore', min: 100, max: 20000, step: 1 },
    { label: '강타강화 수치', key: 'strongDmg', min: 100, max: 10000, step: 1 },
    { label: '연타강화 수치', key: 'chainDmg', min: 100, max: 10000, step: 1 },
    { label: '콤보강화 수치', key: 'comboPower', min: 100, max: 10000, step: 1 },
    { label: '스킬위력 수치', key: 'skillPower', min: 100, max: 10000, step: 1 },
    { label: '광역강화 수치', key: 'multiPower', min: 100, max: 10000, step: 1 },
    { label: '추가타 수치', key: 'extraProb', min: 100, max: 10000, step: 1 },
    { label: '빠른공격 수치', key: 'fastAtk', min: 100, max: 5000, step: 1 },
    { label: '빠른스킬 수치', key: 'fastSkill', min: 100, max: 5000, step: 1 },
    { label: '궁극기 수치', key: 'ultScore', min: 100, max: 5000, step: 1 }
  ];

  const skillFields = [
    { label: '1번 스킬 개조', key: 'skillLevel_1' },
    { label: '2번 스킬 개조', key: 'skillLevel_2' },
    { label: '3번 스킬 개조', key: 'skillLevel_3' },
    { label: '4번 스킬 개조', key: 'skillLevel_4' },
    { label: '5번 스킬 개조', key: 'skillLevel_5' },
    { label: '6번 스킬 개조', key: 'skillLevel_6' }
  ];

  // 30단계 스킬 개수 계산
  const lv30SkillsCount = skillFields.reduce((count, f) => {
    return stats[f.key] === 30 ? count + 1 : count;
  }, 0);
  const isSkillLimitExceeded = lv30SkillsCount > 3;

  const getStatPercent = (key, val) => {
    if (!val) return '';
    let pct = 0;
    if (key === 'critScore') {
      const baseProb = 0.5 * (val / (val + 2000)) * 100;
      return `실제: ${baseProb.toFixed(2)}% / 허수아비: ${(baseProb + 30).toFixed(2)}%`;
    }
    if (key === 'strongDmg' || key === 'chainDmg' || key === 'skillPower') {
      pct = (val / 8500) * 100;
      return `효율: +${pct.toFixed(2)}%`;
    }
    if (key === 'comboPower') {
      pct = (val / 17500) * 100;
      return `효율: +${pct.toFixed(2)}%`;
    }
    if (key === 'multiPower') {
      pct = 8 + (val / 8500) * 100;
      return `효율: +${pct.toFixed(2)}%`;
    }
    if (key === 'extraProb') {
      pct = (val / 13000) * 100;
      return `실제: ${pct.toFixed(2)}%`;
    }
    return '';
  };

  return (
    <div className={`bg-theme-card border rounded-2xl p-6 shadow-theme flex flex-col gap-6 transition-all duration-350 ${
      isSkillLimitExceeded ? 'border-red-500 shadow-red-100' : 'border-theme'
    }`}>
      
      {/* 캐릭터 스펙 입력 */}
      <div>
        <h3 className="text-lg font-black text-theme-main mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-orange-500" />
          캐릭터 기본 능력치 (마을 기준)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {statFields.map(f => (
            <div key={f.key} className="bg-theme-subcard p-3.5 rounded-xl border border-theme flex flex-col gap-2 theme-transition card-lift-glow">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-0.5">
                  <label className="text-sm font-black text-theme-sub">{f.label}</label>
                  {getStatPercent(f.key, stats[f.key]) && (
                    <span className="text-[9.5px] text-emerald-600 dark:text-emerald-400 font-extrabold theme-transition">
                      ({getStatPercent(f.key, stats[f.key])})
                    </span>
                  )}
                </div>
                <input
                  type="number"
                  value={stats[f.key] || 0}
                  onChange={(e) => handleInputChange(f.key, e.target.value)}
                  className="w-24 bg-theme-card border border-theme rounded px-2.5 py-1 text-sm font-mono font-black text-emerald-600 dark:text-emerald-400 focus-orange-glow focus:outline-none theme-transition"
                />
              </div>
              <input
                type="range"
                min={f.min}
                max={f.max}
                step={f.step}
                value={stats[f.key] || 0}
                onChange={(e) => handleInputChange(f.key, e.target.value)}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500 theme-transition"
              />
            </div>
          ))}
        </div>
      </div>

      <hr className="border-theme" />

      {/* 6개 스킬 개조 레벨 입력 */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-black text-theme-main flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-600" />
            스킬 개조 단계 설정
          </h3>
          <span className={`text-[10px] px-2 py-0.5 rounded font-extrabold border ${
            isSkillLimitExceeded 
              ? 'bg-red-50 border-red-200 text-red-500 animate-pulse'
              : 'bg-theme-subcard border-theme text-theme-sub'
          }`}>
            30단계 개조 스킬: {lv30SkillsCount} / 3개
          </span>
        </div>

        {/* 단축 프리셋 버튼군 */}
        <div className="flex flex-wrap gap-2 mb-4 bg-theme-subcard p-2.5 rounded-xl border border-theme theme-transition">
          <span className="text-[10px] font-bold text-theme-sub self-center mr-1">개조 단계 프리셋:</span>
          {[
            { label: '156 프리셋', key: '156' },
            { label: '256 프리셋', key: '256' },
            { label: '456 프리셋 (시즌2 격투가)', key: '456' }
          ].map(preset => (
            <button
              key={preset.key}
              type="button"
              onClick={() => applySkillPreset(preset.key)}
              className="px-2.5 py-1 bg-theme-card hover:bg-theme-subcard border border-theme rounded-lg text-[10px] font-bold text-orange-500 active:scale-95 transition-all focus:outline-none"
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {skillFields.map(f => {
            const is30 = stats[f.key] === 30;
            return (
              <div 
                key={f.key} 
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all theme-transition ${
                  is30 
                    ? 'bg-purple-500/10 border-purple-300 dark:border-purple-800/60 shadow-sm shadow-purple-500/5' 
                    : 'bg-theme-subcard border-theme'
                }`}
              >
                <span className={`text-[10px] font-bold theme-transition ${is30 ? 'text-purple-750 dark:text-purple-300' : 'text-theme-sub'}`}>{f.label}</span>
                <div className="flex items-center mt-1.5 border border-theme rounded-lg overflow-hidden theme-transition shadow-sm">
                  <button
                    type="button"
                    onClick={() => onStatsChange(f.key, Math.max(10, (stats[f.key] || 10) - 1))}
                    className="w-5 h-6 bg-theme-subcard hover:bg-theme-card text-xs font-black text-theme-sub active:scale-95 transition-all focus:outline-none flex items-center justify-center border-none"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="10"
                    max="30"
                    value={stats[f.key] !== undefined ? stats[f.key] : 10}
                    onChange={(e) => {
                      let val = parseInt(e.target.value);
                      if (isNaN(val)) {
                        onStatsChange(f.key, 10);
                      } else {
                        let checked = val;
                        if (checked < 10) checked = 10;
                        if (checked > 30) checked = 30;
                        onStatsChange(f.key, checked);
                      }
                    }}
                    className={`w-8 h-6 bg-theme-card text-center text-xs font-black focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none border-l border-r border-theme theme-transition ${
                      is30 ? 'text-purple-700 dark:text-purple-300 font-extrabold' : 'text-theme-main'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => onStatsChange(f.key, Math.min(30, (stats[f.key] || 10) + 1))}
                    className="w-5 h-6 bg-theme-subcard hover:bg-theme-card text-xs font-black text-theme-sub active:scale-95 transition-all focus:outline-none flex items-center justify-center border-none"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* 개조 한도 초과 경고 배너 */}
        {isSkillLimitExceeded && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-500 text-xs p-3.5 rounded-xl font-bold flex items-center gap-2 animate-bounce">
            <span>⚠️</span>
            <span>30단계 개조 스킬은 최대 3개까지만 지정 가능합니다. 게임 설정을 확인해 주십시오.</span>
          </div>
        )}
      </div>

      <hr className="border-theme" />

      {/* 추가 인챈트 설정 */}
      <div>
        <h3 className="text-md font-black text-theme-main mb-3 flex items-center gap-2">
          <Settings className="w-4 h-4 text-theme-muted" />
          추가 인챈트 설정
        </h3>
        <div className="bg-theme-subcard p-4 rounded-xl border border-theme flex flex-col sm:flex-row gap-4 justify-between theme-transition">
          <div className="flex-1 flex justify-between items-center gap-2">
            <span className="text-xs font-bold text-theme-sub">인챈트공증 (%)</span>
            <input
              type="number"
              step="0.1"
              value={stats.enchantAtkPct || 0}
              onChange={(e) => handleInputChange('enchantAtkPct', e.target.value)}
              className="w-20 bg-theme-card border border-theme rounded px-2.5 py-1 text-xs text-right font-black text-orange-500 focus-orange-glow focus:outline-none theme-transition"
            />
          </div>
          <div className="flex-1 flex justify-between items-center gap-2">
            <span className="text-xs font-bold text-theme-sub">강타피해 (%)</span>
            <input
              type="number"
              step="0.1"
              value={stats.strongDmgPct || 0}
              onChange={(e) => handleInputChange('strongDmgPct', e.target.value)}
              className="w-20 bg-theme-card border border-theme rounded px-2.5 py-1 text-xs text-right font-black text-orange-500 focus-orange-glow focus:outline-none theme-transition"
            />
          </div>
          <div className="flex-1 flex justify-between items-center gap-2">
            <span className="text-xs font-bold text-theme-sub">연타피해 (%)</span>
            <input
              type="number"
              step="0.1"
              value={stats.chainDmgPct || 0}
              onChange={(e) => handleInputChange('chainDmgPct', e.target.value)}
              className="w-20 bg-theme-card border border-theme rounded px-2.5 py-1 text-xs text-right font-black text-orange-500 focus-orange-glow focus:outline-none theme-transition"
            />
          </div>
        </div>
      </div>

    </div>
  );
}
