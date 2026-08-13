import React from 'react';
import StatsInput from './StatsInput';
import RuneSelector from './RuneSelector';
import ConditionalPanel from './ConditionalPanel';
import {
  Activity,
  CheckCircle2,
  Info,
  Sliders,
  Sparkles,
  Target,
  Timer,
  TrendingUp
} from 'lucide-react';

function WorkflowStrip({ equippedRuneCount }) {
  const steps = [
    { number: '01', title: '기본 스펙', description: '마을 능력치와 스킬 개조', complete: true },
    { number: '02', title: '실전 조건', description: '보스, 시간, 스킬 사이클', complete: true },
    { number: '03', title: '룬 세팅', description: `${equippedRuneCount}/10 슬롯 장착`, complete: equippedRuneCount === 10 }
  ];

  return (
    <section aria-label="계산기 설정 진행 순서" className="bg-theme-card border border-theme rounded-2xl px-4 py-3.5 shadow-theme theme-transition">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-orange-500" />
          </div>
          <div>
            <p className="text-[10px] font-black tracking-[0.16em] uppercase text-orange-500">Quick flow</p>
            <p className="text-xs font-bold text-theme-main">입력부터 결과 확인까지, 순서대로 완성하세요.</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 w-full sm:w-auto">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center gap-2 min-w-0">
              <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[10px] font-black border ${step.complete ? 'bg-orange-500 text-white border-orange-500' : 'bg-theme-subcard text-theme-muted border-theme'}`}>
                {step.complete ? <CheckCircle2 className="w-3.5 h-3.5" /> : step.number}
              </div>
              <div className="min-w-0 hidden sm:block">
                <p className="text-[10px] font-black text-theme-main truncate">{step.title}</p>
                <p className="text-[9px] text-theme-muted truncate">{step.description}</p>
              </div>
              {index < steps.length - 1 && <div className="hidden md:block w-5 h-px bg-theme-border" />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionIntro({ step, title, description, icon: Icon, badge }) {
  return (
    <div className="flex items-start justify-between gap-3 px-1">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-orange-500" />
        </div>
        <div>
          <p className="text-[10px] font-black tracking-[0.14em] text-orange-500">{step}</p>
          <h3 className="text-sm font-black text-theme-main mt-0.5">{title}</h3>
          {description && <p className="text-[11px] text-theme-muted mt-0.5 leading-relaxed">{description}</p>}
        </div>
      </div>
      {badge && <span className="shrink-0 text-[10px] font-black px-2 py-1 rounded-full bg-theme-subcard border border-theme text-theme-sub">{badge}</span>}
    </div>
  );
}

function DpsOverview({ dpsResult, equippedRuneCount }) {
  const metrics = [
    { label: '적용 공격력', value: dpsResult ? dpsResult.totalAtk.toLocaleString() : '0', accent: 'text-theme-main' },
    { label: '룬 공격력 가산', value: `+${dpsResult ? dpsResult.runeAtkAdd.toLocaleString() : '0'}`, accent: 'text-orange-600 dark:text-orange-300' },
    { label: '치명타 확률', value: `${dpsResult ? dpsResult.critProb : '0.0'}%`, accent: 'text-violet-600 dark:text-violet-300' },
    { label: '추가타 확률', value: `${dpsResult ? dpsResult.extraProb : '0.0'}%`, accent: 'text-emerald-600 dark:text-emerald-300' }
  ];

  return (
    <section aria-label="실전 DPS 결과 요약" className="relative overflow-hidden bg-theme-card border border-orange-500/30 rounded-2xl p-5 sm:p-6 xl:p-7 shadow-theme theme-transition">
      <div className="absolute -right-16 -top-16 w-44 h-44 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
      <div className="relative">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-500 text-white shadow-sm flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-black tracking-[0.14em] uppercase text-orange-500">Live result</p>
              <h2 className="text-sm font-black text-theme-main">실전 DPS 결과</h2>
            </div>
          </div>
          <span className="text-[10px] font-black bg-theme-subcard border border-theme text-theme-sub px-2.5 py-1 rounded-full">룬 {equippedRuneCount}/10 장착</span>
        </div>

        <div className="rounded-2xl bg-theme-subcard border border-theme p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-bold text-theme-sub">종합 실전 예상 DPS</p>
              <p className="text-4xl sm:text-5xl xl:text-6xl font-black text-orange-500 tracking-[-0.045em] leading-none mt-1.5">
                {dpsResult ? dpsResult.weightedDps.toLocaleString() : '0'}
                <span className="text-xs tracking-normal text-theme-muted font-bold ml-1.5">DPS</span>
              </p>
              <p className="text-[10px] text-theme-muted mt-2">현재 입력값과 전투 조건을 기준으로 즉시 계산됩니다.</p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              계산 상태 정상
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-2.5 mt-3">
          {metrics.map((metric) => (
            <div key={metric.label} className="bg-theme-main/60 border border-theme rounded-xl px-3 py-2.5 theme-transition">
              <p className="text-[10px] font-bold text-theme-muted truncate">{metric.label}</p>
              <p className={`text-sm font-black mt-1 ${metric.accent}`}>{metric.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StancePanel({ skillStances, onStanceChange }) {
  const stances = [
    { key: 'skill_1', label: '1번 차징 피스트', options: [['순정', '순정 (1.475 계수)'], ['충돌', '충돌 (1.775 계수 / 범위피)'], ['약점', '약점 (0.92 계수 / 카운터 디버프)']] },
    { key: 'skill_2', label: '2번 스러스트 킥', options: [['순정', '순정 (0.405 계수)'], ['전진', '전진 (0.465 계수 / 콤보피증)'], ['도약', '도약 (0.64 계수 / 거리 비례피)']] },
    { key: 'skill_3', label: '3번 백 스텝', options: [['순정', '순정 (0.085 계수)'], ['순발력', '순발력 (0.24 계수 / 이속저하)']] },
    { key: 'skill_4', label: '4번 버스트 펀치', options: [['순정', '순정 (0.141~ 계수)'], ['격파', '격파 (0.188~ 계수 / 단일추가타)'], ['승천', '승천 (1.09 × 2.98배 기댓값)']] },
    { key: 'skill_5', label: '5번 섬머솔트', options: [['순정', '순정 (0.32~ 계수)'], ['강격', '강격 (0.32~ 계수 / 카운터 쿨감)'], ['열혈', '열혈 (0.435~ 계수 / 검날 범위피)'], ['섬머솔트', '섬머솔트 (1.53 계수 / 쿨감 9.5s)']] }
  ];

  return (
    <section className="bg-theme-card border border-theme rounded-2xl p-5 shadow-theme theme-transition">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
          <Activity className="w-4 h-4 text-orange-500" />
        </div>
        <div>
          <h3 className="text-sm font-black text-theme-main">스킬 스탠스 시뮬레이션</h3>
          <p className="text-[11px] text-theme-muted mt-0.5 leading-relaxed">룬 장착과 별도로 각 스킬의 행동 변화를 선택해 딜사이클을 가상 적용합니다.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-5 gap-2.5">
        {stances.map((stance) => (
          <label key={stance.key} className="flex flex-col gap-1.5 bg-theme-subcard border border-theme rounded-xl p-3 theme-transition">
            <span className="text-[10px] font-black text-theme-sub">{stance.label}</span>
            <select
              value={skillStances[stance.key]}
              onChange={(event) => onStanceChange(stance.key, event.target.value)}
              className="w-full bg-theme-card border border-theme rounded-lg px-2.5 py-2 text-xs text-theme-main font-bold focus-orange-glow focus:outline-none theme-transition"
            >
              {stance.options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
        ))}
      </div>
    </section>
  );
}

function CombatScenarioPanel({ gimmicks, onGimmickChange, cycles, onCycleChange }) {
  return (
    <section className="bg-theme-card border border-theme rounded-2xl p-5 shadow-theme theme-transition">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
            <Sliders className="w-4 h-4 text-orange-500" />
          </div>
          <div>
            <h3 className="text-sm font-black text-theme-main">실전 시뮬레이션</h3>
            <p className="text-[11px] text-theme-muted mt-0.5 leading-relaxed">보스와 전투 시간, 사이클을 지정하여 가중치 기반 실전 DPS를 계산합니다.</p>
          </div>
        </div>
        <span className="text-[9px] font-black tracking-wider text-orange-500 bg-orange-500/10 border border-orange-500/20 rounded-full px-2 py-1">GIMMICKS</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <label className="sm:col-span-2 flex flex-col gap-1.5 bg-theme-subcard p-3 rounded-xl border border-theme theme-transition">
          <span className="text-[10px] font-black text-theme-sub">대상 몬스터</span>
          <select value={gimmicks.boss} onChange={(event) => onGimmickChange('boss', event.target.value)} className="bg-theme-card border border-theme rounded-lg px-2.5 py-2 text-xs text-theme-main font-bold focus-orange-glow focus:outline-none theme-transition">
            <option value="함선 허수아비">함선 허수아비 (치명타 저항 0% / 방어도 30)</option>
            <option value="허수아비">허수아비 (상시 무방비 90% 오버라이드 / 방어도 30)</option>
            <option value="글라스기브넨">글라스기브넨 (일반 레이드 / 방어도 6,410)</option>
            <option value="화이트서큐버스">화이트서큐버스 (일반 레이드 / 방어도 6,410)</option>
            <option value="어비스 지옥2">어비스 지옥2 (치명타 저항 20% / 방어도 9,153)</option>
            <option value="바리어비스">바리어비스 (치명타 저항 20% / 방어도 15,903)</option>
          </select>
        </label>
        <label className="flex flex-col gap-1.5 bg-theme-subcard p-3 rounded-xl border border-theme theme-transition">
          <span className="text-[10px] font-black text-theme-sub">평상시 딜 시간 (초)</span>
          <input type="number" value={gimmicks.ordinaryTime} onChange={(event) => onGimmickChange('ordinaryTime', parseInt(event.target.value) || 0)} className="bg-theme-card border border-theme rounded-lg px-2.5 py-2 text-xs text-theme-main font-bold text-right focus-orange-glow focus:outline-none theme-transition" />
        </label>
        <label className="flex flex-col gap-1.5 bg-theme-subcard p-3 rounded-xl border border-theme theme-transition">
          <span className="text-[10px] font-black text-theme-sub">궁극기 딜 시간 (초)</span>
          <input type="number" value={gimmicks.ultimateTime} onChange={(event) => onGimmickChange('ultimateTime', parseInt(event.target.value) || 0)} className="bg-theme-card border border-theme rounded-lg px-2.5 py-2 text-xs text-theme-main font-bold text-right focus-orange-glow focus:outline-none theme-transition" />
        </label>
      </div>

      <div className="mt-4 pt-4 border-t border-theme">
        <div className="flex items-center gap-2 mb-2.5">
          <Timer className="w-3.5 h-3.5 text-orange-500" />
          <span className="text-[11px] font-black text-theme-sub">딜사이클 입력</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <label className="bg-theme-subcard p-3 rounded-xl border border-theme flex flex-col gap-1.5 theme-transition">
            <span className="text-[10px] text-theme-muted font-bold">평상시 사이클</span>
            <input type="text" value={cycles.ordinary} onChange={(event) => onCycleChange('ordinary', event.target.value)} className="w-full bg-theme-card border border-theme rounded-lg px-3 py-2 text-sm font-black text-orange-500 tracking-[0.18em] focus-orange-glow focus:outline-none theme-transition" />
          </label>
          <label className="bg-theme-subcard p-3 rounded-xl border border-theme flex flex-col gap-1.5 theme-transition">
            <span className="text-[10px] text-theme-muted font-bold">궁극기 활성 사이클</span>
            <input type="text" value={cycles.ultimate} onChange={(event) => onCycleChange('ultimate', event.target.value)} className="w-full bg-theme-card border border-theme rounded-lg px-3 py-2 text-sm font-black text-orange-500 tracking-[0.18em] focus-orange-glow focus:outline-none theme-transition" />
          </label>
        </div>
        <p className="text-[10px] text-theme-muted leading-relaxed mt-2.5 flex items-start gap-1.5">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          스킬 약어: 1 차징피스트, 2 스러스트킥, 3 백스텝, 4 버스트펀치/소닉피스트, 5 비룡격/섬머솔트, 6 궁극기
        </p>
      </div>
    </section>
  );
}

function DpsBreakdown({ dpsResult, gimmicks }) {
  return (
    <div>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between mb-3">
        <div>
          <p className="text-[10px] font-black tracking-[0.14em] text-orange-500">CALCULATION DETAIL</p>
          <h3 className="text-sm font-black text-theme-main mt-0.5">상황별 세부 연산</h3>
        </div>
        <p className="text-[10px] text-theme-muted">파쇄권/충격파 패시브 피해는 100% 상시 통합 연산됩니다.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {dpsResult && Object.entries(dpsResult.states).map(([state, result]) => {
          const label = state === 'ordinary' ? '평상시 딜링' : state === 'ordinaryBreak' ? '평상시 무방비' : state === 'ultimate' ? '궁극기 타이밍' : '궁극기 무방비';
          if (state.includes('Break') && gimmicks.unarmedTime === 0) return null;

          return (
            <article key={state} className="bg-theme-subcard p-4 rounded-xl border border-theme theme-transition">
              <div className="flex items-center justify-between gap-2 border-b border-theme pb-2.5">
                <h4 className="text-xs font-black text-theme-main">{label}</h4>
                <span className="text-[10px] text-theme-muted font-bold">{result.cycleTime}초 사이클</span>
              </div>
              <dl className="mt-3 space-y-2 text-[11px]">
                <div className="flex justify-between gap-3"><dt className="text-theme-sub">스킬/패시브</dt><dd className="font-bold text-theme-main">{result.skillDps.toLocaleString()}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-theme-sub">추가타(직접)</dt><dd className="font-bold text-theme-main">{result.directDps.toLocaleString()}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-theme-sub">지속/멀티</dt><dd className="font-bold text-theme-main">{result.dotDps.toLocaleString()}</dd></div>
                <div className="flex justify-between gap-3 border-t border-theme pt-2.5 mt-2"><dt className="font-black text-theme-main">합산 예상 DPS</dt><dd className="font-black text-orange-500">{result.totalDps.toLocaleString()}</dd></div>
              </dl>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function PresetComparison({ presets, dpsResult, savePreset, loadPreset, clearPreset }) {
  return (
    <div className="border-t border-theme pt-5">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-4 h-4 text-orange-500" />
        <div>
          <h3 className="text-sm font-black text-theme-main">셋팅 비교 및 저장</h3>
          <p className="text-[10px] text-theme-muted mt-0.5">저장된 세션 프리셋과 현재 DPS를 바로 비교할 수 있습니다.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {presets.map((preset, index) => {
          const presetDps = preset.data?.weightedDps || 0;
          const isCurrentHigher = dpsResult && dpsResult.weightedDps >= presetDps;
          const difference = presetDps > 0 && dpsResult ? Math.abs(((dpsResult.weightedDps / presetDps) - 1) * 100).toFixed(1) : '0.0';

          return (
            <article key={index} onClick={() => preset.data && loadPreset(index)} className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${preset.data ? 'cursor-pointer bg-theme-subcard border-theme hover:border-orange-500 shadow-sm' : 'bg-theme-main border-theme border-dashed'}`}>
              <div>
                <div className="flex justify-between items-center gap-2 mb-2">
                  <span className="text-xs font-black text-theme-main truncate">{preset.name}</span>
                  {preset.data && <button type="button" aria-label={`${preset.name} 삭제`} onClick={(event) => clearPreset(index, event)} className="text-theme-muted hover:text-red-500 text-base font-bold p-1 leading-none">&times;</button>}
                </div>
                <p className="text-sm font-black text-theme-main">{preset.data ? `${presetDps.toLocaleString()} DPS` : '비어있음'}</p>
                {preset.data && dpsResult && <p className={`text-[10px] font-bold mt-1.5 ${isCurrentHigher ? 'text-emerald-600 dark:text-emerald-300' : 'text-red-500'}`}>현재가 {difference}% {isCurrentHigher ? '높음' : '낮음'}</p>}
              </div>
              <button type="button" onClick={(event) => { event.stopPropagation(); savePreset(index); }} className="mt-4 w-full bg-theme-card hover:bg-orange-500 hover:text-white border border-theme text-[10px] font-black py-2 rounded-lg transition-colors focus-orange-glow focus:outline-none">현재 구성 저장</button>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export default function MainCalculatorTab({
  uiTheme,
  stats,
  onStatsChange,
  skillStances,
  onStanceChange,
  gimmicks,
  onGimmickChange,
  cycles,
  onCycleChange,
  selectedRunes,
  onRuneChange,
  transcendLevels,
  onTranscendChange,
  dpsResult,
  presets,
  savePreset,
  loadPreset,
  clearPreset,
  conditionalUptimes,
  onUptimeChange
}) {
  const equippedRuneCount = Object.values(selectedRunes).flat().filter(Boolean).length;

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      <WorkflowStrip equippedRuneCount={equippedRuneCount} />

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] gap-6 xl:gap-8 items-start">
        <main className="flex flex-col gap-5 min-w-0">
          <section className="bg-theme-card border border-theme rounded-2xl p-4 sm:p-5 xl:p-6 shadow-theme theme-transition">
            <SectionIntro step="01 · REQUIRED SETUP" title="기본 스펙과 시즌 패시브" description="마을 기준 능력치·스킬 개조·최종뎀 증가를 순서대로 설정합니다." icon={Sparkles} badge="DPS 필수" />
            <div className="mt-4">
              <StatsInput stats={stats} onStatsChange={onStatsChange} />
            </div>
          </section>

          <div className="xl:hidden">
            <DpsOverview dpsResult={dpsResult} equippedRuneCount={equippedRuneCount} />
          </div>

          <section className="bg-theme-card border border-theme rounded-2xl p-4 sm:p-5 xl:p-6 shadow-theme theme-transition">
            <SectionIntro step="02 · STANCE" title="스킬별 스탠스 시뮬레이션" description="선택한 스탠스가 각 스킬 계수와 최종 DPS에 반영됩니다." icon={Activity} badge="DPS 필수" />
            <div className="mt-4">
              <StancePanel skillStances={skillStances} onStanceChange={onStanceChange} />
            </div>
          </section>

          <section className="bg-theme-card border border-theme rounded-2xl p-4 sm:p-5 xl:p-6 shadow-theme theme-transition">
            <SectionIntro step="03 · COMBAT" title="전투 상황과 딜사이클" description="보스·시간·사이클을 입력해 실전 가중 DPS를 계산합니다." icon={Target} badge="DPS 필수" />
            <div className="mt-4">
              <CombatScenarioPanel gimmicks={gimmicks} onGimmickChange={onGimmickChange} cycles={cycles} onCycleChange={onCycleChange} />
            </div>
          </section>

          <ConditionalPanel uiTheme={uiTheme} selectedRunes={selectedRunes} conditionalUptimes={conditionalUptimes} onUptimeChange={onUptimeChange} nightBlessingUptime={stats.nightBlessingUptime} onNightBlessingChange={(value) => onStatsChange('nightBlessingUptime', value)} />
        </main>

        <aside className="flex flex-col gap-5 min-w-0">
          <div className="hidden xl:block">
            <DpsOverview dpsResult={dpsResult} equippedRuneCount={equippedRuneCount} />
          </div>

          <section className="bg-theme-card border border-theme rounded-2xl p-4 sm:p-5 xl:p-6 shadow-theme theme-transition">
            <SectionIntro step="04 · RUNE SETUP" title="시즌 2 룬 세팅 구성" description="부위별 룬과 초월 단계를 조합하면 결과가 즉시 갱신됩니다." icon={Activity} badge={`${equippedRuneCount}/10 장착`} />
            <div className="mt-4">
              <RuneSelector uiTheme={uiTheme} selectedRunes={selectedRunes} onRuneChange={onRuneChange} transcendLevels={transcendLevels} onTranscendChange={onTranscendChange} />
            </div>
          </section>

          <section className="bg-theme-card border border-theme rounded-2xl p-4 sm:p-5 xl:p-6 shadow-theme theme-transition">
            <DpsBreakdown dpsResult={dpsResult} gimmicks={gimmicks} />
            <PresetComparison presets={presets} dpsResult={dpsResult} savePreset={savePreset} loadPreset={loadPreset} clearPreset={clearPreset} />
          </section>
        </aside>
      </div>
    </div>
  );
}
