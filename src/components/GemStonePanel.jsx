import React from 'react';
import { Gem, ArrowRight, ShieldAlert } from 'lucide-react';

export default function GemStonePanel({ gemStats, onGemStatsChange }) {
  const gemFields = [
    { label: '강타 계열', key: 'strong', color: 'text-red-400', border: 'border-red-950/40', bg: 'bg-red-950/10' },
    { label: '이동 계열', key: 'move', color: 'text-blue-400', border: 'border-blue-950/40', bg: 'bg-blue-950/10' },
    { label: '보조 계열', key: 'sub', color: 'text-emerald-400', border: 'border-emerald-950/40', bg: 'bg-emerald-950/10' },
    { label: '방해 계열', key: 'disable', color: 'text-purple-400', border: 'border-purple-950/40', bg: 'bg-purple-950/10' },
    { label: '생존 계열', key: 'save', color: 'text-amber-400', border: 'border-amber-950/40', bg: 'bg-amber-950/10' },
  ];

  const handleInputChange = (key, val) => {
    onGemStatsChange(key, parseFloat(val) || 0);
  };

  // 프리셋 설정 도우미 (마비노기 모바일 보석 시스템 규격 적용, 22개 슬롯 곱연산)
  const applyPreset = (rank) => {
    let dmg = 0;
    let cd = 0;
    const gemCount = 22; // 전체 보석 개수 22개 일괄 곱연산
    
    if (rank === 'starPrismS') { 
      dmg = parseFloat((2.10 * gemCount).toFixed(2)); // 46.20%
      cd = parseFloat((0.70 * gemCount).toFixed(2));  // 15.40%
    } 
    else if (rank === 'perfectStarPrism') { 
      dmg = parseFloat((2.20 * gemCount).toFixed(2)); // 48.40%
      cd = parseFloat((0.75 * gemCount).toFixed(2));  // 16.50%
    }

    const updated = {};
    gemFields.forEach(f => {
      updated[`${f.key}Dmg`] = dmg;
      updated[`${f.key}Cd`] = cd;
    });
    
    // 일괄 갱신을 부모에 전달
    Object.entries(updated).forEach(([k, v]) => {
      onGemStatsChange(k, v);
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl max-w-4xl mx-auto flex flex-col gap-6">
      
      {/* 타이틀 및 퀵 가이드 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Gem className="w-6 h-6 text-purple-400 animate-pulse" />
            보석 세공 상세 입력
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            소켓 보석 세공으로 인한 스킬 계열별 데미지 증가(%) 및 재사용 대기시간 감소(%) 수치를 기입합니다.
          </p>
        </div>

        {/* 프리셋 버튼 그룹 */}
        <div className="flex gap-2">
          <button
            onClick={() => applyPreset('starPrismS')}
            className="px-3 py-1.5 bg-blue-950/20 hover:bg-blue-900/30 border border-blue-800/40 rounded-lg text-[10px] font-bold text-blue-300 transition-all active:scale-95"
          >
            스타프리즘S 일괄
          </button>
          <button
            onClick={() => applyPreset('perfectStarPrism')}
            className="px-3 py-1.5 bg-purple-950/20 hover:bg-purple-900/30 border border-purple-800/40 rounded-lg text-[10px] font-bold text-purple-300 transition-all active:scale-95"
          >
            온전한 스타프리즘 일괄
          </button>
        </div>
      </div>

      {/* 세공 스탯 필드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {gemFields.map(f => {
          const dmgKey = `${f.key}Dmg`;
          const cdKey = `${f.key}Cd`;

          return (
            <div
              key={f.key}
              className={`p-4 rounded-xl border ${f.border} ${f.bg} flex flex-col gap-3 transition-all hover:border-slate-700`}
            >
              <div className="flex justify-between items-center">
                <span className={`text-sm font-bold ${f.color} flex items-center gap-1.5`}>
                  <Gem className="w-4 h-4" />
                  {f.label}
                </span>
                <span className="text-[10px] text-slate-500 font-semibold">보석 세공 슬롯</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* 데미지 증가 */}
                <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-850 flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400">데미지 증가 (%)</label>
                  <div className="flex items-center gap-1 mt-1">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      value={gemStats[dmgKey] || 0}
                      onChange={(e) => handleInputChange(dmgKey, e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-xs text-right font-extrabold text-slate-200 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-500 font-bold">%</span>
                  </div>
                </div>

                {/* 쿨타임 감소 */}
                <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-850 flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400">재사용 대기시간 감소 (%)</label>
                  <div className="flex items-center gap-1 mt-1">
                    <input
                      type="number"
                      min="0"
                      max="50"
                      step="0.5"
                      value={gemStats[cdKey] || 0}
                      onChange={(e) => handleInputChange(cdKey, e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-xs text-right font-extrabold text-slate-200 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-500 font-bold">%</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 가이드 메시지 */}
      <div className="bg-slate-950/50 border border-slate-850 rounded-xl p-4 flex gap-2.5 items-start">
        <ShieldAlert className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
        <span className="text-[10px] text-slate-400 leading-normal">
          보석 세공 탭에서 설정하신 데이터는 종합 계산 엔진에 즉시 반영됩니다. 스킬 계열별 매칭 규칙에 따라 데미지가 증가하고 스킬 사용 시전 속도 공식에 영향을 미칩니다.
        </span>
      </div>

    </div>
  );
}
