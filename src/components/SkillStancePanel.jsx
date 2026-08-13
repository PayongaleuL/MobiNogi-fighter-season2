import React from 'react';
import { Swords } from 'lucide-react';

const STANCES = [
  { key: 'skill_1', shortLabel: '1번 차징 피스트', options: [['순정', '순정'], ['충돌', '충돌'], ['약점', '약점']] },
  { key: 'skill_2', shortLabel: '2번 스러스트 킥', options: [['순정', '순정'], ['전진', '전진'], ['도약', '도약']] },
  { key: 'skill_3', shortLabel: '3번 백 스텝', options: [['순정', '순정'], ['순발력', '순발력']] },
  { key: 'skill_4', shortLabel: '4번 버스트 펀치', options: [['순정', '순정'], ['격파', '격파'], ['승천', '승천']] },
  { key: 'skill_5', shortLabel: '5번 섬머솔트', options: [['순정', '순정'], ['강격', '강격'], ['열혈', '열혈'], ['섬머솔트', '섬머솔트']] }
];

export default function SkillStancePanel({ skillStances, onStanceChange, compact = false }) {
  return (
    <section aria-label="스킬 스탠스 선택" className="flex flex-col gap-2.5">
      <div className="flex items-start gap-2 border-b border-theme pb-2">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-orange-500/20 bg-orange-500/10">
          <Swords className="h-3.5 w-3.5 text-orange-500" />
        </div>
        <div>
          <p className="text-[9px] font-black tracking-[0.14em] text-orange-500">DPS REQUIRED</p>
          <h3 className="mt-0.5 text-xs font-black text-theme-main">스킬별 스탠스 시뮬레이션</h3>
          {!compact && <p className="mt-0.5 text-[9px] text-theme-muted">선택값은 각 스킬 계수와 최종 DPS에 즉시 반영됩니다.</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-1.5">
        {STANCES.map((stance) => (
          <label key={stance.key} className="grid grid-cols-[1fr_7.5rem] items-center gap-2 rounded-lg border border-theme bg-theme-subcard px-2.5 py-2 theme-transition">
            <span className="min-w-0 text-[10px] font-black text-theme-main truncate">{stance.shortLabel}</span>
            <select
              value={skillStances[stance.key]}
              onChange={(event) => onStanceChange(stance.key, event.target.value)}
              className="w-full rounded-md border border-theme bg-theme-card px-2 py-1 text-[10px] font-black text-theme-main focus-orange-glow focus:outline-none theme-transition"
            >
              {stance.options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
        ))}
      </div>
    </section>
  );
}

export { STANCES };
