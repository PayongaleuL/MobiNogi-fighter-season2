import React from 'react';
import { Info, Sliders } from 'lucide-react';

const CONDITIONAL_RUNES = [
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
  { name: '악몽', desc: '불의 정수 소모로 화염 지대 지속 피해 발생 (주는 피해 5% 근사 계산)', defaultUptime: 100 },
  { name: '거대한 분노', desc: '강타 적중 시 스킬피해 3% 증가(최대 4회 중첩). 가동률에 비례하여 최대 12.0%의 스킬피증이 기댓값에 반영됩니다.', defaultUptime: 100 }
];

function UptimeCard({ name, description, value, onChange }) {
  return (
    <div className="rounded-xl border border-theme bg-theme-subcard p-3 theme-transition">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-black text-theme-main">{name}</p>
          <p className="mt-0.5 text-[10px] font-semibold leading-relaxed text-theme-sub">{description}</p>
        </div>
        <span className="shrink-0 rounded border border-theme bg-theme-card px-2 py-0.5 text-xs font-black text-emerald-600 dark:text-emerald-400 theme-transition">
          {value}%
        </span>
      </div>
      <div className="mt-3 flex items-center gap-2.5">
        <Sliders className="h-4 w-4 shrink-0 text-theme-muted" />
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={value}
          onChange={(event) => onChange(parseInt(event.target.value, 10))}
          className="h-1.5 flex-1 cursor-pointer appearance-none rounded-lg bg-slate-200 accent-orange-500 theme-transition dark:bg-slate-800"
        />
        <button
          type="button"
          onClick={() => onChange(value === 100 ? 0 : 100)}
          className={`rounded border px-2 py-1 text-[10px] font-bold transition-all focus:outline-none ${
            value === 100
              ? 'border-emerald-300 bg-emerald-500/10 text-emerald-700 dark:border-emerald-800/40 dark:text-emerald-400'
              : 'border-theme bg-theme-card text-theme-sub hover:text-theme-main'
          }`}
        >
          {value === 100 ? '항시' : '100%'}
        </button>
      </div>
    </div>
  );
}

export default function ConditionalPanel({ selectedRunes, conditionalUptimes, onUptimeChange, nightBlessingUptime, onNightBlessingChange }) {
  const activeConditionalRunes = [];

  Object.values(selectedRunes).forEach((slotList) => {
    if (!slotList) return;
    slotList.forEach((rune) => {
      if (!rune) return;
      const conditionalEffects = Array.isArray(rune.conditionalEffects)
        ? rune.conditionalEffects.filter((effect) => effect?.id && effect?.label)
        : [];

      if (conditionalEffects.length > 0) {
        conditionalEffects.forEach((effect) => {
          activeConditionalRunes.push({
            name: `${rune.name} · ${effect.label}`,
            uptimeKey: `${rune.name}:${effect.id}`,
            legacyUptimeKey: rune.name,
            desc: effect.source || `${effect.label} 조건부 효과`,
            defaultUptime: Math.round((effect.defaultUptime ?? rune.stats?.가동률 ?? 1) * 100)
          });
        });
        return;
      }

      const config = CONDITIONAL_RUNES.find((candidate) => candidate.name === rune.name);
      if (config) {
        activeConditionalRunes.push({ ...rune, ...config, uptimeKey: rune.name });
      } else if (rune.stats && rune.stats.가동률 !== undefined && rune.stats.가동률 < 1.0) {
        activeConditionalRunes.push({
          ...rune,
          name: rune.name,
          uptimeKey: rune.name,
          desc: `실전 가동률 기댓값 반영 대상 룬 (기본 가동률: ${Math.round(rune.stats.가동률 * 100)}%)`,
          defaultUptime: Math.round(rune.stats.가동률 * 100)
        });
      }
    });
  });

  return (
    <div className="flex flex-col gap-3">
      {activeConditionalRunes.length === 0 ? (
        <div className="flex min-h-[92px] flex-col items-center justify-center rounded-xl border border-dashed border-theme bg-theme-subcard/50 p-4 text-center text-[11px] font-semibold leading-relaxed text-theme-sub theme-transition">
          <Info className="mb-2 h-5 w-5 text-theme-muted" />
          장착된 룬 중 조건부 가동률을 조정할 항목이 없습니다. 룬을 장착하면 이곳에 즉시 표시됩니다.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {activeConditionalRunes.map((rune) => {
            const currentValue = conditionalUptimes[rune.uptimeKey] !== undefined
              ? conditionalUptimes[rune.uptimeKey]
              : (rune.legacyUptimeKey && conditionalUptimes[rune.legacyUptimeKey] !== undefined
                ? conditionalUptimes[rune.legacyUptimeKey]
                : rune.defaultUptime);
            return (
              <UptimeCard
                key={rune.uptimeKey}
                name={rune.name}
                description={rune.desc}
                value={currentValue}
                onChange={(value) => onUptimeChange(rune.uptimeKey, value)}
              />
            );
          })}
        </div>
      )}

      {onNightBlessingChange && (
        <div className="border-t border-theme pt-3 theme-transition">
          <p className="mb-2 flex items-center gap-1.5 text-[10px] font-black tracking-[0.08em] text-orange-500">
            <Info className="h-3.5 w-3.5" />
            시즌 스킬 버프
          </p>
          <UptimeCard
            name="밤의 축복 (백 스텝 버프)"
            description="3번 스킬 사용 시 15초간 공격력 15% 증가합니다. 기본 기댓값은 25%입니다."
            value={nightBlessingUptime || 25}
            onChange={onNightBlessingChange}
          />
        </div>
      )}
    </div>
  );
}
