import React from 'react';
import { ToggleLeft, Sliders, Info } from 'lucide-react';

export default function ConditionalPanel({ selectedRunes, conditionalUptimes, onUptimeChange }) {
  // 조건부 옵션을 가진 룬 리스트 정의
  const conditionalRunesConfig = [
    { name: '무너진 경계', desc: '침식 부여 시 추가타 확률 16.5% 증가 (100% 이상 시 2배인 33% 적용, 오염 시 소실)', defaultUptime: 70 },
    { name: '숲 길잡이', desc: '이동 및 공격 스택 달성 시 10초간 주는 피해 21% 증가', defaultUptime: 100 },
    { name: '백금 천칭', desc: '콤보/기본 공격 조건부로 주는 피해 31.5% 및 추가타 확률 31.5% 적용', defaultUptime: 100 },
    { name: '초월', desc: '추가타/치명타 5회 적중 시 주는 피해 15% 및 치명타 피해 15% 증가', defaultUptime: 100 },
    { name: '악몽', desc: '불의 정수 소물로 화염 지대 지속 피해 발생 (주는 피해 5% 근사 계산)', defaultUptime: 100 }
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
      }
    });
  });

  if (activeConditionalRunes.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-center text-slate-500 text-sm flex flex-col items-center justify-center min-h-[120px]">
        <Info className="w-8 h-8 text-slate-600 mb-2" />
        장착된 룬 중 조건부/트리거형 옵션을 가진 룬이 없습니다.<br />
        조건부 룬을 장착하면 여기에 미세 조절 패널이 노출됩니다.
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <h3 className="text-xl font-bold text-slate-100 mb-2 flex items-center gap-2">
        <ToggleLeft className="w-6 h-6 text-emerald-400" />
        조건부 버프 및 가동률 조절
      </h3>
      <p className="text-xs text-slate-400 mb-6">
        전설 룬들의 고유 조건부 옵션 가동률(유지율)을 조절하여 실전 딜을 더욱 정밀하게 가상 예측합니다.
      </p>

      <div className="flex flex-col gap-4">
        {activeConditionalRunes.map(rune => {
          const currentVal = conditionalUptimes[rune.name] !== undefined 
            ? conditionalUptimes[rune.name] 
            : rune.defaultUptime;

          return (
            <div key={rune.name} className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 flex flex-col gap-3">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <span className="text-sm font-bold text-slate-200">{rune.name}</span>
                  <span className="text-[10px] text-slate-500 block leading-relaxed mt-0.5">{rune.desc}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {currentVal}%
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Sliders className="w-4 h-4 text-slate-500" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={currentVal}
                  onChange={(e) => onUptimeChange(rune.name, parseInt(e.target.value))}
                  className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <button
                  onClick={() => onUptimeChange(rune.name, currentVal === 100 ? 0 : 100)}
                  className={`text-[10px] px-2 py-1 rounded font-bold border transition-all ${
                    currentVal === 100
                      ? 'bg-emerald-950/30 border-emerald-800 text-emerald-400'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {currentVal === 100 ? '항시 버프' : '수정'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
