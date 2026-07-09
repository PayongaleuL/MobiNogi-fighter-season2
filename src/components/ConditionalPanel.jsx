import React from 'react';
import { ToggleLeft, Sliders, Info } from 'lucide-react';

export default function ConditionalPanel({ selectedRunes, conditionalUptimes, onUptimeChange, nightBlessingUptime, onNightBlessingChange }) {
  // 조건부 옵션을 가진 룬 리스트 정의
  const conditionalRunesConfig = [
    { name: '무너진 경계', desc: '침식 부여 시 추가타 확률 16.5% 증가 (100% 이상 시 2배인 33% 적용, 오염 시 소실)', defaultUptime: 70 },
    { name: '흐릿한 형상', desc: '침식 부여 시 강타 피해 18% 증가 (100% 이상 시 2배인 36% 적용, 오염 시 소실)', defaultUptime: 70 },
    { name: '잿빛 장막', desc: '침식 부여 시 연타 피해 18% 증가 (100% 이상 시 2배인 36% 적용, 오염 시 소실)', defaultUptime: 70 },
    { name: '금 간 봉인', desc: '침식 부여 시 치명타 확률 16.5% 증가 (100% 이상 시 2배인 33% 적용, 오염 시 소실)', defaultUptime: 70 },
    { name: '복수+', desc: '피해를 입을 시 12초간 공격력 5% / 받는 회복량 2% 증가 (최대 5회 중첩)', defaultUptime: 70 },
    { name: '거두는 손길', desc: '전투 시작 시 15초간 주는 피해 26% 증가 (적 처치 시 재발동)', defaultUptime: 70 },
    { name: '부서진 왕관', desc: '마력의 원 위에서 15초간 공격력 4% / 강타 피해 4.5% 증가 (최대 3회 중첩)', defaultUptime: 70 },
    { name: '숲 길잡이', desc: '이동 및 공격 스택 달성 시 10초간 주는 피해 21% 증가', defaultUptime: 100 },
    { name: '백금 천칭', desc: '콤보/기본 공격 조건부로 주는 피해 31.5% 및 추가타 확률 31.5% 적용', defaultUptime: 100 },
    { name: '초월', desc: '추가타/치명타 5회 적중 시 주는 피해 15% 및 치명타 피해 15% 증가', defaultUptime: 100 },
    { name: '악몽', desc: '불의 정수 소물로 화염 지대 지속 피해 발생 (주는 피해 5% 근사 계산)', defaultUptime: 100 },
    { name: '거대한 분노', desc: '강타 적중 시 스킬피해 3% 증가(최대 4회 중첩). 가동률에 비례하여 최대 12.0%의 스킬피증이 기댓값에 반영됩니다. (100% 설정 시 기본 +12.0% 스킬피증 자동 합산)', defaultUptime: 100 }
  ];

  // 현재 선택된 룬 중 조건부 룬에 해당하는 것 필터링
  const activeConditionalRunes = [];
  
  Object.values(selectedRunes).forEach(slotList => {
    if (!slotList) return;
    slotList.forEach(rune => {
      if (!rune) return;
      const config = conditionalRunesConfig.find(c => c.name === rune.name);
      if (config) {
        activeConditionalRunes.push({ ...rune, ...config });
      } else if (rune.stats && rune.stats.가동률 !== undefined && rune.stats.가동률 < 1.0) {
        // 가동률이 100% 미만인 룬 동적 추가
        activeConditionalRunes.push({
          ...rune,
          name: rune.name,
          desc: `실전 가동률 기댓값 반영 대상 룬 (기본 가동률: ${Math.round(rune.stats.가동률 * 100)}%) - 옵션: ${rune.description || '옵션 설명 없음'}`,
          defaultUptime: Math.round(rune.stats.가동률 * 100)
        });
      }
    });
  });

  if (activeConditionalRunes.length === 0) {
    return (
      <div className="bg-theme-card border border-theme rounded-2xl p-6 shadow-theme text-center text-theme-sub text-sm flex flex-col items-center justify-center min-h-[120px] theme-transition">
        <Info className="w-8 h-8 text-theme-muted mb-2" />
        장착된 룬 중 조건부/트리거형 옵션을 가진 룬이 없습니다.<br />
        조건부 룬을 장착하면 여기에 미세 조절 패널이 노출됩니다.
      </div>
    );
  }

  return (
    <div className="bg-theme-card border border-theme rounded-2xl p-6 shadow-theme theme-transition">
      <h3 className="text-xl font-black text-theme-main mb-2 flex items-center gap-2">
        <ToggleLeft className="w-6 h-6 text-emerald-600" />
        조건부 버프 및 가동률 조절
      </h3>
      <p className="text-xs text-theme-sub mb-6">
        전설 룬들의 고유 조건부 옵션 가동률(유지율)을 조절하여 실전 딜을 더욱 정밀하게 가상 예측합니다.
      </p>

      <div className="flex flex-col gap-4">
        {activeConditionalRunes.map(rune => {
          const currentVal = conditionalUptimes[rune.name] !== undefined 
            ? conditionalUptimes[rune.name] 
            : rune.defaultUptime;

          return (
            <div key={rune.name} className="bg-theme-subcard p-4 rounded-xl border border-theme flex flex-col gap-3 theme-transition">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <span className="text-sm font-black text-theme-main">{rune.name}</span>
                  <span className="text-[10px] text-theme-sub block leading-relaxed mt-0.5">{rune.desc}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-theme-card px-2 py-0.5 rounded border border-theme theme-transition">
                    {currentVal}%
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Sliders className="w-4 h-4 text-theme-muted" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={currentVal}
                  onChange={(e) => onUptimeChange(rune.name, parseInt(e.target.value))}
                  className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500 theme-transition"
                />
                <button
                  onClick={() => onUptimeChange(rune.name, currentVal === 100 ? 0 : 100)}
                  className={`text-[10px] px-2 py-1 rounded font-bold border transition-all focus:outline-none theme-transition ${
                    currentVal === 100
                      ? 'bg-emerald-500/10 border-emerald-300 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400'
                      : 'bg-theme-card border-theme text-theme-sub hover:text-theme-main'
                  }`}
                >
                  {currentVal === 100 ? '항시 버프' : '수정'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 시즌2 시즌스킬 버프 가동률 연동 슬라이더 */}
      {onNightBlessingChange && (
        <div className="mt-6 border-t border-theme pt-6 theme-transition">
          <h4 className="text-xs font-black text-theme-muted uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-orange-500" />
            시즌2 신규스킬 버프 가동률 조절
          </h4>
          <div className="bg-theme-subcard p-4 rounded-xl border border-theme flex flex-col gap-3 theme-transition">
            <div className="flex justify-between items-start gap-2">
              <div>
                <span className="text-sm font-black text-theme-main">밤의 축복 (백 스텝 버프)</span>
                <span className="text-[10px] text-theme-sub block leading-relaxed mt-0.5">3번 스킬 사용 시 15초간 공격력 15% 증가 (쿨타임 60초, 기본 기댓값 25%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-theme-card px-2 py-0.5 rounded border border-theme theme-transition">
                  {nightBlessingUptime || 25}%
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Sliders className="w-4 h-4 text-theme-muted" />
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={nightBlessingUptime || 25}
                onChange={(e) => onNightBlessingChange(parseInt(e.target.value))}
                className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500 theme-transition"
              />
              <button
                type="button"
                onClick={() => onNightBlessingChange((nightBlessingUptime || 25) === 100 ? 0 : 100)}
                className={`text-[10px] px-2 py-1 rounded font-bold border transition-all focus:outline-none theme-transition ${
                  (nightBlessingUptime || 25) === 100
                    ? 'bg-emerald-500/10 border-emerald-300 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400'
                    : 'bg-theme-card border-theme text-theme-sub hover:text-theme-main'
                }`}
              >
                {(nightBlessingUptime || 25) === 100 ? '항시 버프' : '수정'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
