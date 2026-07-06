import React from 'react';
import { User, Activity, Settings } from 'lucide-react';

export default function StatsInput({ stats, onStatsChange }) {
  const handleInputChange = (key, val) => {
    onStatsChange(key, parseFloat(val) || 0);
  };

  const statFields = [
    { label: '마을 공격력', key: 'baseAttack', min: 1000, max: 100000, step: 1 },
    { label: '치명타 수치', key: 'critScore', min: 100, max: 20000, step: 1 },
    { label: '강타강화 수치', key: 'strongDmg', min: 100, max: 10000, step: 1 },
    { label: '연타강화 수치', key: 'chainDmg', min: 100, max: 10000, step: 1 },
    { label: '콤보강화 수치', key: 'comboPower', min: 100, max: 10000, step: 1 },
    { label: '스킬위력 수치', key: 'skillPower', min: 100, max: 10000, step: 1 },
    { label: '광역강화 수치', key: 'multiPower', min: 100, max: 10000, step: 1 },
    { label: '추가타 수치', key: 'extraProb', min: 100, max: 10000, step: 1 }
  ];

  const skillFields = [
    { label: '1번 스킬 개조 레벨', key: 'skillLevel_1' },
    { label: '2번 스킬 개조 레벨', key: 'skillLevel_2' },
    { label: '3번 스킬 개조 레벨', key: 'skillLevel_3' },
    { label: '4번 스킬 개조 레벨', key: 'skillLevel_4' }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-6">
      
      {/* 캐릭터 스펙 입력 */}
      <div>
        <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-mabi-accent" />
          캐릭터 기본 능력치 (마을 기준)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {statFields.map(f => (
            <div key={f.key} className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/80 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-400">{f.label}</label>
                <input
                  type="number"
                  value={stats[f.key] || 0}
                  onChange={(e) => handleInputChange(f.key, e.target.value)}
                  className="w-24 bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-xs text-right font-bold text-emerald-400 focus:outline-none focus:border-mabi-accent"
                />
              </div>
              <input
                type="range"
                min={f.min}
                max={f.max}
                step={f.step}
                value={stats[f.key] || 0}
                onChange={(e) => handleInputChange(f.key, e.target.value)}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-mabi-accent"
              />
            </div>
          ))}
        </div>
      </div>

      <hr className="border-slate-800/80" />

      {/* 세공 및 스킬 개조 레벨 입력 */}
      <div>
        <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-400" />
          스킬 개조 단계 설정
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {skillFields.map(f => (
            <div key={f.key} className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/80 flex flex-col items-center gap-1.5">
              <span className="text-[10px] text-slate-500 font-semibold">{f.label.replace(' 개조 레벨', '')}</span>
              <div className="flex items-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => handleInputChange(f.key, Math.max(0, (stats[f.key] || 10) - 1))}
                  className="w-6 h-6 bg-slate-850 hover:bg-slate-800 rounded flex items-center justify-center text-xs font-bold text-slate-350 active:scale-95 transition-all"
                >
                  -
                </button>
                <span className="w-8 text-center text-sm font-bold text-slate-200">
                  {stats[f.key] || 10}
                </span>
                <button
                  type="button"
                  onClick={() => handleInputChange(f.key, Math.min(30, (stats[f.key] || 10) + 1))}
                  className="w-6 h-6 bg-slate-850 hover:bg-slate-800 rounded flex items-center justify-center text-xs font-bold text-slate-350 active:scale-95 transition-all"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <hr className="border-slate-800/80" />

      {/* 세공 공증 수치 */}
      <div>
        <h3 className="text-md font-bold text-slate-200 mb-3 flex items-center gap-2">
          <Settings className="w-4 h-4 text-slate-400" />
          추가 세공 설정
        </h3>
        <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex-1 flex justify-between items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">세공 공격력 증가 (%)</span>
            <input
              type="number"
              step="0.1"
              value={stats.enchantAtkPct || 0}
              onChange={(e) => handleInputChange('enchantAtkPct', e.target.value)}
              className="w-20 bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-right font-bold text-mabi-accent focus:outline-none"
            />
          </div>
          <div className="flex-1 flex justify-between items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">치명타확률 보정 (%)</span>
            <input
              type="number"
              step="0.1"
              value={(stats.critBonusPct || 0) * 100}
              onChange={(e) => handleInputChange('critBonusPct', (parseFloat(e.target.value) || 0) / 100)}
              className="w-20 bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-right font-bold text-mabi-accent focus:outline-none"
            />
          </div>
        </div>
      </div>

    </div>
  );
}
