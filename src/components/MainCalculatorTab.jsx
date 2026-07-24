import React from 'react';
import StatsInput from './StatsInput';
import RuneSelector from './RuneSelector';
import ConditionalPanel from './ConditionalPanel';
import { Activity, Info, Sliders, TrendingUp } from 'lucide-react';

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
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fadeIn">
      {/* 좌측 패널 */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        <StatsInput stats={stats} onStatsChange={onStatsChange} />
        
        {/* 스킬별 스탠스 시뮬레이션 설정 */}
        <div className="bg-theme-card border border-theme rounded-2xl p-6 shadow-theme theme-transition">
          <h3 className="text-lg font-black text-theme-main mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-orange-500" />
            스킬별 스탠스(Stance) 시뮬레이션 설정
          </h3>
          <p className="text-xs text-theme-sub mb-5 leading-normal">
            장신구 룬 장착과 무관하게, 각 액티브 스킬들의 행동 변화(승천, 섬머솔트 등 치환) 스탠스를 지정하여 딜사이클을 직접 가상 시뮬레이션합니다.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* 1번 스킬 */}
            <div className="flex flex-col gap-1.5 bg-theme-subcard p-3 rounded-xl border border-theme theme-transition">
              <label className="text-[10px] font-black text-theme-sub">1번 차징 피스트</label>
              <select
                value={skillStances.skill_1}
                onChange={(e) => onStanceChange('skill_1', e.target.value)}
                className="bg-theme-card border border-theme rounded px-2.5 py-1.5 text-xs text-theme-main font-bold focus-orange-glow focus:outline-none theme-transition"
              >
                <option value="순정">순정 (1.475 계수)</option>
                <option value="충돌">충돌 (1.775 계수 / 범위피)</option>
                <option value="약점">약점 (0.92 계수 / 카운터 디버프)</option>
              </select>
            </div>

            {/* 2번 스킬 */}
            <div className="flex flex-col gap-1.5 bg-theme-subcard p-3 rounded-xl border border-theme theme-transition">
              <label className="text-[10px] font-black text-theme-sub">2번 스러스트 킥</label>
              <select
                value={skillStances.skill_2}
                onChange={(e) => onStanceChange('skill_2', e.target.value)}
                className="bg-theme-card border border-theme rounded px-2.5 py-1.5 text-xs text-theme-main font-bold focus-orange-glow focus:outline-none theme-transition"
              >
                <option value="순정">순정 (0.405 계수)</option>
                <option value="전진">전진 (0.465 계수 / 콤보피증)</option>
                <option value="도약">도약 (0.64 계수 / 거리 비례피)</option>
              </select>
            </div>

            {/* 3번 스킬 */}
            <div className="flex flex-col gap-1.5 bg-theme-subcard p-3 rounded-xl border border-theme theme-transition">
              <label className="text-[10px] font-black text-theme-sub">3번 백 스텝</label>
              <select
                value={skillStances.skill_3}
                onChange={(e) => onStanceChange('skill_3', e.target.value)}
                className="bg-theme-card border border-theme rounded px-2.5 py-1.5 text-xs text-theme-main font-bold focus-orange-glow focus:outline-none theme-transition"
              >
                <option value="순정">순정 (0.085 계수)</option>
                <option value="순발력">순발력 (0.24 계수 / 이속저하)</option>
              </select>
            </div>

            {/* 4번 스킬 */}
            <div className="flex flex-col gap-1.5 bg-theme-subcard p-3 rounded-xl border border-theme theme-transition">
              <label className="text-[10px] font-black text-theme-sub">4번 버스트 펀치</label>
              <select
                value={skillStances.skill_4}
                onChange={(e) => onStanceChange('skill_4', e.target.value)}
                className="bg-theme-card border border-theme rounded px-2.5 py-1.5 text-xs text-theme-main font-bold focus-orange-glow focus:outline-none theme-transition"
              >
                <option value="순정">순정 (0.141~ 계수)</option>
                <option value="격파">격파 (0.188~ 계수 / 단일추가타)</option>
                <option value="승천">승천 (1.09 * 2.98배 기댓값)</option>
              </select>
            </div>

            {/* 5번 스킬 */}
            <div className="flex flex-col gap-1.5 bg-theme-subcard p-3 rounded-xl border border-theme theme-transition">
              <label className="text-[10px] font-black text-theme-sub">5번 섬머솔트</label>
              <select
                value={skillStances.skill_5}
                onChange={(e) => onStanceChange('skill_5', e.target.value)}
                className="bg-theme-card border border-theme rounded px-2.5 py-1.5 text-xs text-theme-main font-bold focus-orange-glow focus:outline-none theme-transition"
              >
                <option value="순정">순정 (0.32~ 계수)</option>
                <option value="강격">강격 (0.32~ 계수 / 카운터 쿨감)</option>
                <option value="열혈">열혈 (0.435~ 계수 / 검날 범위피)</option>
                <option value="섬머솔트">섬머솔트 (1.53 계수 / 쿨감 9.5s)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 전투 상황 및 딜사이클 설정 */}
        <div className="bg-theme-card border border-theme rounded-2xl p-6 shadow-theme theme-transition">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-black text-theme-main flex items-center gap-2">
              <Sliders className="w-5 h-5 text-orange-500" />
              전투 상황 및 딜사이클 설정
            </h3>
            <span className="text-[10px] bg-orange-500/10 text-orange-500 border border-orange-500/30 px-2 py-0.5 rounded font-black uppercase tracking-wider">Gimmicks</span>
          </div>
          <p className="text-xs text-theme-sub mb-5 leading-normal">
            보스의 위상(어비스, 방어계수 가감) 및 평상시/무방비 딜 타임 비율을 조절하여 가장 합리적인 가중치 실전 DPS를 구출합니다.
          </p>

          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col gap-1.5 bg-theme-subcard p-3 rounded-xl border border-theme theme-transition">
              <label className="text-[10px] font-black text-theme-sub">대상 몬스터 (보스 설정)</label>
              <select
                value={gimmicks.boss}
                onChange={(e) => onGimmickChange('boss', e.target.value)}
                className="bg-theme-card border border-theme rounded px-2.5 py-1.5 text-xs text-theme-main font-bold focus-orange-glow focus:outline-none theme-transition"
              >
                <option value="함선 허수아비">함선 허수아비 (치명타 저항 0% / 방어도 30)</option>
                <option value="허수아비">허수아비 (상시 무방비 90% 오버라이드 / 방어도 30)</option>
                <option value="글라스기브넨">글라스기브넨 (일반 레이드 / 방어도 6,410)</option>
                <option value="화이트서큐버스">화이트서큐버스 (일반 레이드 / 방어도 6,410)</option>
                <option value="어비스 지옥2">어비스 지옥2 (치명타 저항 20% / 방어도 9,153)</option>
                <option value="바리어비스">바리어비스 (치명타 저항 20% / 방어도 15,903)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5 bg-theme-subcard p-3 rounded-xl border border-theme theme-transition">
                <label className="text-[10px] font-black text-theme-sub">평상시 딜 시간 (초)</label>
                <input
                  type="number"
                  value={gimmicks.ordinaryTime}
                  onChange={(e) => onGimmickChange('ordinaryTime', parseInt(e.target.value) || 0)}
                  className="bg-theme-card border border-theme rounded px-2.5 py-1 text-xs text-theme-main font-bold text-right focus-orange-glow focus:outline-none theme-transition"
                />
              </div>
              <div className="flex flex-col gap-1.5 bg-theme-subcard p-3 rounded-xl border border-theme theme-transition">
                <label className="text-[10px] font-black text-theme-sub">궁극기 딜 시간 (초)</label>
                <input
                  type="number"
                  value={gimmicks.ultimateTime}
                  onChange={(e) => onGimmickChange('ultimateTime', parseInt(e.target.value) || 0)}
                  className="bg-theme-card border border-theme rounded px-2.5 py-1 text-xs text-theme-main font-bold text-right focus-orange-glow focus:outline-none theme-transition"
                />
              </div>
            </div>
          </div>

          {/* 딜사이클 문자열 입력 */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-black text-theme-sub">딜사이클 문자열 설정</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-theme-subcard p-3 rounded-xl border border-theme flex flex-col gap-1 theme-transition">
                <span className="text-[10px] text-theme-muted font-semibold">평상시 사이클</span>
                <input
                  type="text"
                  value={cycles.ordinary}
                  onChange={(e) => onCycleChange('ordinary', e.target.value)}
                  className="w-full bg-theme-card border border-theme rounded px-3 py-1 text-xs font-bold text-orange-500 tracking-wider focus-orange-glow focus:outline-none theme-transition"
                />
              </div>
              <div className="bg-theme-subcard p-3 rounded-xl border border-theme flex flex-col gap-1 theme-transition">
                <span className="text-[10px] text-theme-muted font-semibold">궁극기 활성 사이클</span>
                <input
                  type="text"
                  value={cycles.ultimate}
                  onChange={(e) => onCycleChange('ultimate', e.target.value)}
                  className="w-full bg-theme-card border border-theme rounded px-3 py-1 text-xs font-bold text-orange-500 tracking-wider focus-orange-glow focus:outline-none theme-transition"
                />
              </div>
            </div>
            <span className="text-[9px] text-theme-muted leading-normal mt-1 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 inline text-theme-muted" />
              스킬 입력 약어: 1 (차징피스트 1타/2타), 2 (스러스트 킥), 3 (백 스텝), 4 (버스트펀치/소닉피스트), 5 (비룡격/섬머솔트), 6 (궁극기)
            </span>
          </div>
        </div>

        <ConditionalPanel
          uiTheme={uiTheme}
          selectedRunes={selectedRunes}
          conditionalUptimes={conditionalUptimes}
          onUptimeChange={onUptimeChange}
          nightBlessingUptime={stats.nightBlessingUptime}
          onNightBlessingChange={(val) => onStatsChange('nightBlessingUptime', val)}
        />
      </div>

      {/* 우측 패널 */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        {/* 룬 슬롯 선택기 */}
        <RuneSelector
          uiTheme={uiTheme}
          selectedRunes={selectedRunes}
          onRuneChange={onRuneChange}
          transcendLevels={transcendLevels}
          onTranscendChange={onTranscendChange}
        />

        {/* 최종 예상 DPS 대시보드 */}
        <div className="bg-theme-card border border-theme rounded-2xl p-6 shadow-theme flex flex-col gap-6 theme-transition">
          {/* 결과 큰 숫자 */}
          <div className="bg-theme-subcard border border-theme rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-center gap-4 theme-transition">
            <div>
              <span className="text-xs font-black text-theme-sub block">종합 실전 예상 DPS</span>
              <span className="text-3xl font-black text-orange-500 tracking-tight mt-1 block">
                {dpsResult ? dpsResult.weightedDps.toLocaleString() : '0'}
                <span className="text-xs text-theme-muted font-bold ml-1">DPS</span>
              </span>
            </div>
            
            {/* 스펙 연동 결과 */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-theme-card px-4 py-2 rounded-xl border border-theme theme-transition">
                <span className="text-theme-muted font-semibold block">적용 공격력</span>
                <span className="font-bold text-theme-main mt-0.5 block">{dpsResult ? dpsResult.totalAtk.toLocaleString() : '0'}</span>
              </div>
              <div className="bg-orange-500/10 px-4 py-2 rounded-xl border border-orange-300 dark:border-orange-850/30 theme-transition">
                <span className="text-orange-700 dark:text-orange-400 font-semibold block">룬 공격력 가산</span>
                <span className="font-bold text-orange-600 dark:text-orange-300 mt-0.5 block">+{dpsResult ? dpsResult.runeAtkAdd.toLocaleString() : '0'}</span>
              </div>
              <div className="bg-blue-500/10 px-4 py-2 rounded-xl border border-blue-300 dark:border-blue-850/30 theme-transition">
                <span className="text-blue-700 dark:text-blue-400 font-semibold block">총 마도저항</span>
                <span className="font-bold text-blue-600 dark:text-blue-300 mt-0.5 block">{dpsResult ? dpsResult.totalResist.toLocaleString() : '0'}</span>
              </div>
              <div className="bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-300 dark:border-emerald-850/30 theme-transition">
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold block">추가타 확률</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-300 mt-0.5 block">{dpsResult ? dpsResult.extraProb : '0.0'}%</span>
              </div>
              <div className="bg-purple-500/10 px-4 py-2 rounded-xl border border-purple-300 dark:border-purple-850/30 col-span-2 sm:col-span-1 theme-transition">
                <span className="text-purple-700 dark:text-purple-400 font-semibold block">치명타 확률</span>
                <span className="font-bold text-purple-600 dark:text-purple-300 mt-0.5 block">{dpsResult ? dpsResult.critProb : '0.0'}%</span>
              </div>
              <div className="bg-purple-500/10 px-4 py-2 rounded-xl border border-purple-300 dark:border-purple-850/30 col-span-2 sm:col-span-1 theme-transition">
                <span className="text-purple-700 dark:text-purple-400 font-semibold block">치명타 피해</span>
                <span className="font-bold text-purple-600 dark:text-purple-300 mt-0.5 block">{dpsResult ? dpsResult.critDmg : '0.0'}%</span>
              </div>
            </div>
          </div>

          {/* 상황별 세부 DPS 리스트 */}
          <div>
            <h4 className="text-sm font-black text-theme-main mb-3 flex justify-between items-center">
              <span>상황별 세부 연산 내역</span>
              <span className="text-[10px] text-theme-muted font-medium">※ 파쇄권/충격파 패시브 피해 100% 상시 통합 연산됨</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {dpsResult && Object.entries(dpsResult.states).map(([state, res]) => {
                const label = state === 'ordinary' ? '평상시 딜링' :
                              state === 'ordinaryBreak' ? '평상시 (무방비)' :
                              state === 'ultimate' ? '궁극기 타이밍' : '궁극기 (무방비)';
                if (state.includes('Break') && gimmicks.unarmedTime === 0) return null;

                return (
                  <div key={state} className="bg-theme-subcard p-4 rounded-xl border border-theme flex flex-col gap-3 theme-transition">
                    <div className="flex justify-between items-center border-b border-theme pb-2">
                      <span className="text-xs font-bold text-theme-main">{label}</span>
                      <span className="text-xs text-theme-muted font-semibold">{res.cycleTime}초 사이클</span>
                    </div>
                    <div className="flex flex-col gap-1.5 text-xs text-theme-sub">
                      <div className="flex justify-between">
                        <span>스킬/패시브 DPS:</span>
                        <span className="font-semibold text-theme-main">{res.skillDps.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>추가타(직접) DPS:</span>
                        <span className="font-semibold text-theme-main">{res.directDps.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>지속/멀티 DPS:</span>
                        <span className="font-semibold text-theme-main">{res.dotDps.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-t border-theme pt-1.5 font-black mt-1">
                        <span className="text-theme-main">합산 예상 DPS:</span>
                        <span className="text-orange-500 font-extrabold">{res.totalDps.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 프리셋 저장 및 비교 테이블 */}
          <div className="border-t border-theme pt-6">
            <h4 className="text-sm font-black text-theme-main mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-orange-500" />
              셋팅 비교 및 저장 (세션 프리셋)
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {presets.map((preset, idx) => (
                <div
                  key={idx}
                  onClick={() => preset.data && loadPreset(idx)}
                  className={`p-4 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                    preset.data
                      ? 'bg-theme-subcard border-theme hover:border-orange-500 shadow-sm'
                      : 'bg-theme-main border-theme border-dashed hover:border-theme-accent'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-theme-main truncate">{preset.name}</span>
                      {preset.data && (
                        <button
                          onClick={(e) => clearPreset(idx, e)}
                          className="text-theme-muted hover:text-red-500 text-sm font-bold p-1"
                        >
                          &times;
                        </button>
                      )}
                    </div>
                    <span className="text-xs font-black block mt-1">
                      {preset.data 
                        ? `${(preset.data.weightedDps || 0).toLocaleString()} DPS` 
                        : '비어있음'}
                    </span>
                    {preset.data && dpsResult && (
                      <span className={`text-[10px] font-bold block mt-1.5 ${
                        dpsResult.weightedDps >= (preset.data.weightedDps || 0) ? 'text-emerald-500' : 'text-red-500'
                      }`}>
                        {dpsResult.weightedDps >= (preset.data.weightedDps || 0) ? '현재보다 ' : '현재보다 '}
                        {(preset.data.weightedDps || 0) > 0 
                          ? Math.abs(((dpsResult.weightedDps / (preset.data.weightedDps || 0) - 1) * 100)).toFixed(1) 
                          : '0.0'}% 
                        {dpsResult.weightedDps >= (preset.data.weightedDps || 0) ? ' 낮음' : ' 높음'}
                      </span>
                    )}
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      savePreset(idx);
                    }}
                    className="mt-4 w-full bg-theme-card hover:bg-orange-500 hover:text-white border border-theme text-[10px] font-bold py-1.5 rounded-lg transition-colors focus:outline-none"
                  >
                    현재 구성 저장
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
