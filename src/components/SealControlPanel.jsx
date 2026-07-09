import React from 'react';
import { Shield, Sparkles, Plus, Minus, Info } from 'lucide-react';

const SLOT_NAMES = {
  weapon: '무기',
  necklace: '목걸이',
  ring1: '반지 1',
  ring2: '반지 2',
  emblem: '엠블럼',
  hat: '모자',
  top: '상의',
  bottom: '하의',
  gloves: '장갑',
  shoes: '신발'
};

const SEAL_TYPES = [
  { value: 'none', label: '장착 안 함' },
  { value: 'star', label: '별의 인장' },
  { value: 'blue_moon', label: '푸른 달의 인장' },
  { value: 'red_moon', label: '붉은 달의 인장' }
];

export default function SealControlPanel({ seals, onSealChange }) {
  // 기본값 보장
  const getSealData = (slot) => {
    return seals[slot] || {
      type: 'none',
      blueStat1Type: 'str',
      blueStat1Value: 27,
      blueStat2Type: 'wil',
      blueStat2Value: 27,
      redMoonStatValue: 40
    };
  };

  const handleTypeChange = (slot, type) => {
    const prev = getSealData(slot);
    onSealChange(slot, { ...prev, type });
  };

  const handleFieldChange = (slot, key, val) => {
    const prev = getSealData(slot);
    onSealChange(slot, { ...prev, [key]: val });
  };

  // 실시간 합산 결과 연산
  let totalAtk = 0;
  let totalEmblemPct = 0;
  let totalStr = 0;
  let totalWil = 0;
  let totalLuk = 0;
  let totalDex = 0;
  let totalInt = 0;

  Object.entries(SLOT_NAMES).forEach(([slot, _]) => {
    const seal = getSealData(slot);
    if (seal.type === 'none') return;

    // A. 슬롯 강화 효과 합산
    if (slot === 'weapon') {
      if (seal.type === 'star') totalAtk += 300;
      else if (seal.type === 'blue_moon') totalAtk += 500;
      else if (seal.type === 'red_moon') totalAtk += 800;
    } else if (slot === 'necklace') {
      if (seal.type === 'star') totalAtk += 150;
      else if (seal.type === 'blue_moon') totalAtk += 250;
      else if (seal.type === 'red_moon') totalAtk += 400;
    } else if (slot === 'emblem') {
      if (seal.type === 'star') totalEmblemPct += 3; // +7% -> +10% (+3%)
      else if (seal.type === 'blue_moon') totalEmblemPct += 4; // +7% -> +11% (+4%)
      else if (seal.type === 'red_moon') totalEmblemPct += 5; // +7% -> +12% (+5%)
    }

    // B. 추가 능력치 합산
    if (seal.type === 'blue_moon') {
      if (seal.blueStat1Type === 'str') totalStr += seal.blueStat1Value || 27;
      else if (seal.blueStat1Type === 'dex') totalDex += seal.blueStat1Value || 27;
      else if (seal.blueStat1Type === 'int') totalInt += seal.blueStat1Value || 27;

      if (seal.blueStat2Type === 'wil') totalWil += seal.blueStat2Value || 27;
      else if (seal.blueStat2Type === 'luk') totalLuk += seal.blueStat2Value || 27;
    } else if (seal.type === 'red_moon') {
      const val = seal.redMoonStatValue || 40;
      totalStr += val;
      totalDex += val;
      totalInt += val;
      totalWil += val;
      totalLuk += val;
    }
  });

  // 스탯 기반 공격력 및 크리티컬 환산
  const dpsAtkGain = (totalStr + totalWil) * 1.5;
  const dpsCritGain = totalLuk * 1.0;

  return (
    <div className="flex flex-col gap-6">
      {/* 1. 종합 설정 현황 보드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-theme-subcard border border-theme p-5 rounded-2xl theme-transition card-lift-glow">
        <div className="flex flex-col gap-1 md:border-r border-theme pr-4 last:border-0 theme-transition">
          <span className="text-[10px] font-black text-theme-muted uppercase">총 추가 슬롯 공격력</span>
          <span className="text-xl font-black text-orange-500">+{totalAtk}</span>
          <span className="text-[9.5px] text-theme-sub font-bold mt-0.5">무기, 목걸이 인장 강화 합산</span>
        </div>
        <div className="flex flex-col gap-1 md:border-r border-theme pr-4 last:border-0 theme-transition">
          <span className="text-[10px] font-black text-theme-muted uppercase">엠블럼 추가공격력 배율</span>
          <span className="text-xl font-black text-emerald-500">+{totalEmblemPct}%</span>
          <span className="text-[9.5px] text-theme-sub font-bold mt-0.5">엠블럼 인장 등급 보정치</span>
        </div>
        <div className="flex flex-col gap-1 md:border-r border-theme pr-4 last:border-0 theme-transition">
          <span className="text-[10px] font-black text-theme-muted uppercase">총 추가 5대 능력치</span>
          <span className="text-sm font-black text-theme-main flex flex-wrap gap-x-2 gap-y-0.5 mt-1 leading-none">
            {totalStr > 0 && <span className="bg-orange-500/10 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded text-[10px]">힘 +{totalStr}</span>}
            {totalWil > 0 && <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded text-[10px]">의지 +{totalWil}</span>}
            {totalLuk > 0 && <span className="bg-purple-500/10 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded text-[10px]">행운 +{totalLuk}</span>}
            {totalDex > 0 && <span className="bg-slate-500/10 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded text-[10px]">솜씨 +{totalDex}</span>}
            {totalInt > 0 && <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded text-[10px]">지력 +{totalInt}</span>}
            {totalStr === 0 && totalWil === 0 && totalLuk === 0 && <span className="text-theme-muted font-bold text-xs">-</span>}
          </span>
        </div>
        <div className="flex flex-col gap-1 last:border-0">
          <span className="text-[10px] font-black text-theme-muted uppercase">실제 DPS 공식 환산치</span>
          <span className="text-xs font-bold text-theme-main flex flex-col gap-0.5 mt-0.5">
            <div>공격력 환산: <span className="text-orange-500 font-extrabold">+{dpsAtkGain.toFixed(1)}</span></div>
            <div>치명적중 환산: <span className="text-purple-500 font-extrabold">+{dpsCritGain.toFixed(0)}</span></div>
          </span>
        </div>
      </div>

      {/* 2. 10대 장비 슬롯 개별 설정 대시보드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {Object.entries(SLOT_NAMES).map(([slot, label]) => {
          const seal = getSealData(slot);

          // 테마 색상 적용 규칙
          let cardColorClass = 'bg-theme-card border-theme';
          let badgeColorClass = 'bg-theme-subcard text-theme-muted';
          if (seal.type === 'star') {
            cardColorClass = 'bg-amber-500/5 border-amber-300/60 dark:border-amber-800/40 shadow-[0_0_12px_rgba(245,158,11,0.04)]';
            badgeColorClass = 'bg-amber-500/10 text-amber-700 dark:text-amber-400';
          } else if (seal.type === 'blue_moon') {
            cardColorClass = 'bg-blue-500/5 border-blue-300/60 dark:border-blue-800/40 shadow-[0_0_12px_rgba(59,130,246,0.04)]';
            badgeColorClass = 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
          } else if (seal.type === 'red_moon') {
            cardColorClass = 'bg-rose-500/5 border-rose-300/60 dark:border-rose-800/40 shadow-[0_0_12px_rgba(244,63,94,0.04)]';
            badgeColorClass = 'bg-rose-500/10 text-rose-700 dark:text-rose-400';
          }

          return (
            <div
              key={slot}
              className={`p-4 rounded-2xl border flex flex-col gap-3.5 transition-all duration-300 card-lift-glow theme-transition ${cardColorClass}`}
            >
              {/* 장비 부위 명세 */}
              <div className="flex justify-between items-center">
                <span className="text-sm font-black text-theme-main flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-orange-500" />
                  {label} 슬롯 인장
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold theme-transition ${badgeColorClass}`}>
                  {seal.type === 'none' && '미장착'}
                  {seal.type === 'star' && '별의 단계'}
                  {seal.type === 'blue_moon' && '푸른 달 단계'}
                  {seal.type === 'red_moon' && '붉은 달 단계'}
                </span>
              </div>

              {/* 강화 인장 종류 선택 세그먼트 */}
              <div className="grid grid-cols-4 gap-1 bg-theme-subcard p-1 rounded-xl border border-theme theme-transition">
                {SEAL_TYPES.map(st => (
                  <button
                    key={st.value}
                    type="button"
                    onClick={() => handleTypeChange(slot, st.value)}
                    className={`py-1 text-[9.5px] font-bold rounded-lg transition-all focus:outline-none ${
                      seal.type === st.value
                        ? 'bg-theme-card border border-theme text-orange-500 shadow-sm'
                        : 'text-theme-muted hover:text-theme-main'
                    }`}
                  >
                    {st.label.replace('의 인장', '').replace(' 설정', '')}
                  </button>
                ))}
              </div>

              {/* 강화 효과 일람 안내 */}
              {seal.type !== 'none' && (
                <div className="text-[10px] bg-theme-subcard/50 border border-theme/60 p-2 rounded-xl text-theme-sub font-semibold theme-transition">
                  {slot === 'weapon' && (
                    <span>강화 효과: <strong className="text-orange-500 font-extrabold">공격력 {seal.type === 'star' ? '+300' : seal.type === 'blue_moon' ? '+500' : '+800'}</strong></span>
                  )}
                  {slot === 'necklace' && (
                    <span>강화 효과: <strong className="text-orange-500 font-extrabold">공격력 {seal.type === 'star' ? '+150' : seal.type === 'blue_moon' ? '+250' : '+400'}</strong></span>
                  )}
                  {slot === 'emblem' && (
                    <span>강화 효과: <strong className="text-emerald-500 font-extrabold">추가 공격력 {seal.type === 'star' ? '+10%' : seal.type === 'blue_moon' ? '+11%' : '+12%'}</strong> (기본 7% 대비 보정)</span>
                  )}
                  {slot !== 'weapon' && slot !== 'necklace' && slot !== 'emblem' && (
                    <span>강화 효과: <strong className="text-slate-500 font-extrabold">방어력 {seal.type === 'star' ? '+50' : seal.type === 'blue_moon' ? '+80' : '+130'}</strong> (반지/방어구 슬롯)</span>
                  )}
                </div>
              )}

              {/* 푸른 달의 인장 세부 스탯 커스텀 조절 */}
              {seal.type === 'blue_moon' && (
                <div className="flex flex-col gap-2 bg-blue-500/5 p-3 rounded-xl border border-blue-200/50 dark:border-blue-900/40">
                  <span className="text-[10px] font-black text-blue-700 dark:text-blue-300 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    푸른 달 추가 능력치 2종 설정
                  </span>
                  
                  {/* 스탯 1 (힘/솜씨/지력) */}
                  <div className="flex gap-2 items-center justify-between mt-1">
                    <select
                      value={seal.blueStat1Type}
                      onChange={(e) => handleFieldChange(slot, 'blueStat1Type', e.target.value)}
                      className="bg-theme-card border border-theme text-xs font-bold text-theme-main rounded px-1.5 py-1 focus:outline-none focus-orange-glow theme-transition"
                    >
                      <option value="str">힘 (Str)</option>
                      <option value="dex">솜씨 (Dex)</option>
                      <option value="int">지력 (Int)</option>
                    </select>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleFieldChange(slot, 'blueStat1Value', Math.max(25, (seal.blueStat1Value || 27) - 1))}
                        className="p-1 bg-theme-card hover:bg-theme-subcard border border-theme rounded text-theme-main focus:outline-none transition-all"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-black text-orange-500 font-mono">
                        +{seal.blueStat1Value || 27}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleFieldChange(slot, 'blueStat1Value', Math.min(30, (seal.blueStat1Value || 27) + 1))}
                        className="p-1 bg-theme-card hover:bg-theme-subcard border border-theme rounded text-theme-main focus:outline-none transition-all"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* 스탯 2 (의지/행운) */}
                  <div className="flex gap-2 items-center justify-between">
                    <select
                      value={seal.blueStat2Type}
                      onChange={(e) => handleFieldChange(slot, 'blueStat2Type', e.target.value)}
                      className="bg-theme-card border border-theme text-xs font-bold text-theme-main rounded px-1.5 py-1 focus:outline-none focus-orange-glow theme-transition"
                    >
                      <option value="wil">의지 (Wil)</option>
                      <option value="luk">행운 (Luk)</option>
                    </select>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleFieldChange(slot, 'blueStat2Value', Math.max(25, (seal.blueStat2Value || 27) - 1))}
                        className="p-1 bg-theme-card hover:bg-theme-subcard border border-theme rounded text-theme-main focus:outline-none transition-all"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-black text-orange-500 font-mono">
                        +{seal.blueStat2Value || 27}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleFieldChange(slot, 'blueStat2Value', Math.min(30, (seal.blueStat2Value || 27) + 1))}
                        className="p-1 bg-theme-card hover:bg-theme-subcard border border-theme rounded text-theme-main focus:outline-none transition-all"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 붉은 달의 인장 스탯 수치 조절기 */}
              {seal.type === 'red_moon' && (
                <div className="flex flex-col gap-2 bg-rose-500/5 p-3 rounded-xl border border-rose-200/50 dark:border-rose-900/40">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-rose-700 dark:text-rose-300 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      모든 능력치 증가량
                    </span>
                    <span className="text-[9.5px] font-semibold text-rose-600 dark:text-rose-400">
                      (최대 +60 상한)
                    </span>
                  </div>

                  <div className="flex justify-between items-center gap-2 mt-1">
                    <span className="text-xs font-bold text-theme-sub leading-none">중복 사용 스탯 누적:</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleFieldChange(slot, 'redMoonStatValue', Math.max(40, (seal.redMoonStatValue || 40) - 5))}
                        className="p-1.5 bg-theme-card hover:bg-theme-subcard border border-theme rounded-lg text-theme-main focus:outline-none transition-all"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-black text-rose-500 font-mono">
                        +{seal.redMoonStatValue || 40}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleFieldChange(slot, 'redMoonStatValue', Math.min(60, (seal.redMoonStatValue || 40) + 5))}
                        className="p-1.5 bg-theme-card hover:bg-theme-subcard border border-theme rounded-lg text-theme-main focus:outline-none transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
