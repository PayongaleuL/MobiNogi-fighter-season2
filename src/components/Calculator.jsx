import React, { useState, useEffect } from 'react';
import StatsInput from './StatsInput';
import RuneSelector from './RuneSelector';
import ConditionalPanel from './ConditionalPanel';
import GemStonePanel from './GemStonePanel';
import { calculateDPS } from '../utils/calculator';
import { Play, RotateCcw, Save, Trash2, Check, TrendingUp, Info, Gem } from 'lucide-react';

export default function Calculator() {
  // 1. 활성화 탭 관리 ('calculator' | 'gemstone')
  const [activeTab, setActiveTab] = useState('calculator');

  // 2. 캐릭터 스펙 상태
  const [stats, setStats] = useState({
    baseAttack: 27166.0,
    critScore: 6925.0,
    strongDmg: 2487.0,
    chainDmg: 2989.0,
    comboPower: 1532.0,
    skillPower: 1577.0,
    multiPower: 1082.0,
    extraProb: 987.0,
    fastAtk: 1484.0,
    fastSkill: 1488.0,
    ultScore: 1792.0,
    enchantAtkPct: 6.8,
    critBonusPct: 0.0,
    skillLevel_1: 10,
    skillLevel_2: 30,
    skillLevel_3: 10,
    skillLevel_4: 10,
    skillLevel_5: 10,
    skillLevel_6: 10
  });

  // 3. 장착 룬 상태
  const [selectedRunes, setSelectedRunes] = useState({
    '무기': [null],
    '방어구': [null, null, null, null, null],
    '장신구': [null, null, null],
    '엠블럼': [null]
  });

  // 4. 보석 세공 상태
  const [gemStats, setGemStats] = useState({
    strongDmg: 0.0, strongCd: 0.0,
    moveDmg: 0.0, moveCd: 0.0,
    subDmg: 0.0, subCd: 0.0,
    disableDmg: 0.0, disableCd: 0.0,
    saveDmg: 0.0, saveCd: 0.0
  });

  // 5. 전투 및 보스 기믹 상태
  const [gimmicks, setGimmicks] = useState({
    boss: '함선 허수아비',
    ordinaryTime: 87,
    unarmedTime: 0,
    ultimateTime: 33,
    gimmickDmgPct: 0.0,
    healerDmgPct: 0.0,
    skillDebuffDmgPct: 10.0,
    hasSpdBuff: false
  });

  // 6. 상황별 딜사이클 상태
  const [cycles, setCycles] = useState({
    ordinary: '235212',
    ordinaryBreak: '235212',
    ultimate: '252',
    ultimateBreak: '252'
  });

  // 7. 조건부 룬 가동률 상태
  const [conditionalUptimes, setConditionalUptimes] = useState({});

  // 8. 계산된 DPS 결과 상태
  const [dpsResult, setDpsResult] = useState(null);

  // 9. 세팅 비교용 슬롯 상태 (로컬 스토리지 연동)
  const [presets, setPresets] = useState([
    { name: '셋팅 1', data: null },
    { name: '셋팅 2', data: null },
    { name: '셋팅 3', data: null }
  ]);

  // 실시간 DPS 재계산 트리거
  useEffect(() => {
    const flattenedRunes = [];
    Object.values(selectedRunes).forEach(arr => {
      arr.forEach(r => {
        if (r) flattenedRunes.push(r);
      });
    });

    // gemStats 인자 추가 전달하여 연산 연계
    const result = calculateDPS(stats, flattenedRunes, gimmicks, cycles, conditionalUptimes, gemStats);
    setDpsResult(result);
  }, [stats, selectedRunes, gimmicks, cycles, conditionalUptimes, gemStats]);

  // 로컬 스토리지 프리셋 로드
  useEffect(() => {
    const saved = localStorage.getItem('mabi_runes_presets_v2');
    if (saved) {
      try {
        setPresets(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // 마지막 입력 스탯 및 상태 자동 로드 (새로고침 대응)
  useEffect(() => {
    const savedAutosave = localStorage.getItem('mabi_calculator_autosave');
    if (savedAutosave) {
      try {
        const parsed = JSON.parse(savedAutosave);
        if (parsed.stats) setStats(parsed.stats);
        if (parsed.selectedRunes) setSelectedRunes(parsed.selectedRunes);
        if (parsed.cycles) setCycles(parsed.cycles);
        if (parsed.gemStats) setGemStats(parsed.gemStats);
        if (parsed.conditionalUptimes) setConditionalUptimes(parsed.conditionalUptimes);
        if (parsed.gimmicks) setGimmicks(parsed.gimmicks);
      } catch (e) {
        console.error("Autosave load failed:", e);
      }
    }
  }, []);

  // 능력치/룬/세공 등 상태 변경 시 자동 저장
  useEffect(() => {
    const dataToSave = {
      stats,
      selectedRunes,
      cycles,
      gemStats,
      conditionalUptimes,
      gimmicks
    };
    localStorage.setItem('mabi_calculator_autosave', JSON.stringify(dataToSave));
  }, [stats, selectedRunes, cycles, gemStats, conditionalUptimes, gimmicks]);

  const handleStatsChange = (key, val) => {
    setStats(prev => ({ ...prev, [key]: val }));
  };

  const handleGemStatsChange = (updatesOrKey, val) => {
    if (typeof updatesOrKey === 'object' && updatesOrKey !== null) {
      setGemStats(prev => ({ ...prev, ...updatesOrKey }));
    } else {
      setGemStats(prev => ({ ...prev, [updatesOrKey]: val }));
    }
  };

  const handleRuneChange = (type, index, rune) => {
    setSelectedRunes(prev => {
      const copy = [...prev[type]];
      copy[index] = rune;
      return { ...prev, [type]: copy };
    });
  };

  const handleGimmickChange = (key, val) => {
    setGimmicks(prev => ({ ...prev, [key]: val }));
  };

  const handleCycleChange = (key, val) => {
    setCycles(prev => ({ ...prev, [key]: val }));
  };

  const handleUptimeChange = (runeName, val) => {
    setConditionalUptimes(prev => ({ ...prev, [runeName]: val }));
  };

  const handleReset = () => {
    if (window.confirm('모든 능력치, 룬, 보석 설정을 초기화하시겠습니까?')) {
      setStats({
        baseAttack: 27166.0,
        critScore: 6925.0,
        strongDmg: 2487.0,
        chainDmg: 2989.0,
        comboPower: 1532.0,
        skillPower: 1577.0,
        multiPower: 1082.0,
        extraProb: 987.0,
        fastAtk: 1484.0,
        fastSkill: 1488.0,
        ultScore: 1792.0,
        enchantAtkPct: 6.8,
        critBonusPct: 0.0,
        skillLevel_1: 10,
        skillLevel_2: 30,
        skillLevel_3: 10,
        skillLevel_4: 10,
        skillLevel_5: 10,
        skillLevel_6: 10
      });
      setSelectedRunes({
        '무기': [null],
        '방어구': [null, null, null, null, null],
        '장신구': [null, null, null],
        '엠블럼': [null]
      });
      setGemStats({
        strongDmg: 0.0, strongCd: 0.0,
        moveDmg: 0.0, moveCd: 0.0,
        subDmg: 0.0, subCd: 0.0,
        disableDmg: 0.0, disableCd: 0.0,
        saveDmg: 0.0, saveCd: 0.0
      });
      setConditionalUptimes({});
    }
  };

  const savePreset = (slotIndex) => {
    const presetName = prompt(`${slotIndex + 1}번 셋팅 프리셋의 이름을 입력하세요:`, presets[slotIndex].name || `셋팅 ${slotIndex + 1}`);
    if (!presetName) return;

    const newPresets = [...presets];
    newPresets[slotIndex] = {
      name: presetName,
      data: {
        stats,
        selectedRunes,
        cycles,
        conditionalUptimes,
        gemStats,
        weightedDps: dpsResult?.weightedDps || 0
      }
    };
    setPresets(newPresets);
    localStorage.setItem('mabi_runes_presets_v2', JSON.stringify(newPresets));
  };

  const clearPreset = (slotIndex, e) => {
    e.stopPropagation();
    if (window.confirm('이 프리셋 저장을 해제하시겠습니까?')) {
      const newPresets = [...presets];
      newPresets[slotIndex] = { name: `셋팅 ${slotIndex + 1}`, data: null };
      setPresets(newPresets);
      localStorage.setItem('mabi_runes_presets_v2', JSON.stringify(newPresets));
    }
  };

  const loadPreset = (slotIndex) => {
    const preset = presets[slotIndex];
    if (!preset || !preset.data) return;
    
    if (window.confirm(`'${preset.name}' 셋팅을 불러오시겠습니까? 현재 구성은 덮어씌워집니다.`)) {
      setStats(preset.data.stats);
      setSelectedRunes(preset.data.selectedRunes);
      setCycles(preset.data.cycles);
      setConditionalUptimes(preset.data.conditionalUptimes || {});
      setGemStats(preset.data.gemStats || {
        strongDmg: 0, strongCd: 0,
        moveDmg: 0, moveCd: 0,
        subDmg: 0, subCd: 0,
        disableDmg: 0, disableCd: 0,
        saveDmg: 0, saveCd: 0
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6">
      
      {/* 타이틀 및 탭 네비게이션 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div>
          <h2 className="text-2xl font-black text-slate-100 flex items-center gap-2">
            <span className="text-mabi-red">Mabinogi Mobile</span> 격투가 종합 계산기
            <span className="text-xs bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-full text-slate-400 font-bold">시즌 2 스펙 확장</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            6스킬 개조 레벨 연동, 보석 세공 전역 연동 및 시즌 2 간소화 룬 데이터베이스가 이식된 웹 계산기입니다.
          </p>
        </div>

        {/* 상단 탭 버튼 */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 self-stretch md:self-auto">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex-1 md:flex-none px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'calculator'
                ? 'bg-mabi-accent text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            종합 계산기
          </button>
          <button
            onClick={() => setActiveTab('gemstone')}
            className={`flex-1 md:flex-none px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'gemstone'
                ? 'bg-mabi-accent text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Gem className="w-3.5 h-3.5" />
            보석 세공
          </button>
        </div>
      </div>

      {/* 탭 내용 분기 렌더링 */}
      {activeTab === 'gemstone' ? (
        <GemStonePanel gemStats={gemStats} onGemStatsChange={handleGemStatsChange} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fadeIn">
          
          {/* 좌측 패널 (스탯 입력 및 조건부 가동률) - 5칸 차지 */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <StatsInput stats={stats} onStatsChange={handleStatsChange} />
            <ConditionalPanel
              selectedRunes={selectedRunes}
              conditionalUptimes={conditionalUptimes}
              onUptimeChange={handleUptimeChange}
            />
          </div>

          {/* 우측 패널 (룬 선택 및 DPS 종합 리포트) - 7칸 차지 */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* 룬 슬롯 선택기 */}
            <RuneSelector selectedRunes={selectedRunes} onRuneChange={handleRuneChange} />

            {/* 전투 상황 및 딜사이클 설정 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Play className="w-5 h-5 text-mabi-red" />
                  전투 환경 및 딜사이클 설정
                </h3>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1 px-2.5 py-1 bg-slate-850 hover:bg-slate-800 rounded text-[10px] font-bold text-slate-400 border border-slate-800 active:scale-95 transition-all"
                >
                  <RotateCcw className="w-3 h-3" />
                  모두 초기화
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="flex flex-col gap-1.5 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                  <label className="text-[10px] font-semibold text-slate-400">대상 몬스터 (방어지수)</label>
                  <select
                    value={gimmicks.boss}
                    onChange={(e) => handleGimmickChange('boss', e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 font-bold focus:outline-none"
                  >
                    <option value="함선 허수아비">함선 허수아비 (방어 30)</option>
                    <option value="허수아비">허수아비 (방어 30, 치적+30%)</option>
                    <option value="글라스기브넨">글라스기브넨 (방어 6410)</option>
                    <option value="화이트서큐버스">화이트서큐버스 (방어 6410)</option>
                    <option value="어비스 지옥2">어비스 지옥 2 (방어 9153)</option>
                    <option value="바리어비스">바리 어비스 (방어 15903)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                  <label className="text-[10px] font-semibold text-slate-400">평상시 딜 시간 (초)</label>
                  <input
                    type="number"
                    value={gimmicks.ordinaryTime}
                    onChange={(e) => handleGimmickChange('ordinaryTime', parseInt(e.target.value) || 0)}
                    className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-right font-bold text-slate-200"
                  />
                </div>
                <div className="flex flex-col gap-1.5 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                  <label className="text-[10px] font-semibold text-slate-400">궁극기 딜 시간 (초)</label>
                  <input
                    type="number"
                    value={gimmicks.ultimateTime}
                    onChange={(e) => handleGimmickChange('ultimateTime', parseInt(e.target.value) || 0)}
                    className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-right font-bold text-slate-200"
                  />
                </div>
              </div>

              {/* 딜사이클 문자열 입력 */}
              <div className="flex flex-col gap-3">
                <span className="text-xs font-semibold text-slate-400">딜사이클 문자열 설정</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800 flex flex-col gap-1">
                    <span className="text-[10px] text-slate-500 font-semibold">평상시 사이클</span>
                    <input
                      type="text"
                      value={cycles.ordinary}
                      onChange={(e) => handleCycleChange('ordinary', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1 text-xs font-bold text-mabi-accent tracking-wider focus:outline-none"
                    />
                  </div>
                  <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800 flex flex-col gap-1">
                    <span className="text-[10px] text-slate-500 font-semibold">궁극기 활성 사이클</span>
                    <input
                      type="text"
                      value={cycles.ultimate}
                      onChange={(e) => handleCycleChange('ultimate', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1 text-xs font-bold text-mabi-accent tracking-wider focus:outline-none"
                    />
                  </div>
                </div>
                <span className="text-[9px] text-slate-500 leading-normal mt-1 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 inline text-slate-600" />
                  스킬 입력 약어: 1 (차징피스트 1-1, 1-2), 2 (연환격 2-1, 2-2), 3 (섬격 3), 4 (필사의 일격 4-1~3 연타), 5 (비룡격 5-1~3 연타), 6 (궁극기 6)
                </span>
              </div>
            </div>

            {/* 최종 예상 DPS 대시보드 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-6">
              
              {/* 결과 큰 숫자 */}
              <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800/80 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <span className="text-xs font-semibold text-slate-400 block">종합 실전 예상 DPS</span>
                  <span className="text-3xl font-black text-emerald-400 tracking-tight mt-1 block">
                    {dpsResult ? dpsResult.weightedDps.toLocaleString() : '0'}
                    <span className="text-xs text-slate-500 font-bold ml-1">DPS</span>
                  </span>
                </div>
                
                {/* 스펙 연동 결과 */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-850">
                    <span className="text-slate-500 font-semibold block">적용 공격력</span>
                    <span className="font-bold text-slate-350 mt-0.5 block">{dpsResult ? dpsResult.totalAtk.toLocaleString() : '0'}</span>
                  </div>
                  <div className="bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-850">
                    <span className="text-slate-500 font-semibold block">추가타 확률</span>
                    <span className="font-bold text-emerald-400 mt-0.5 block">{dpsResult ? dpsResult.extraProb : '0.0'}%</span>
                  </div>
                  <div className="bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-850">
                    <span className="text-slate-500 font-semibold block">치명타 확률</span>
                    <span className="font-bold text-purple-400 mt-0.5 block">{dpsResult ? dpsResult.critProb : '0.0'}%</span>
                  </div>
                  <div className="bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-850">
                    <span className="text-slate-500 font-semibold block">치명타 피해</span>
                    <span className="font-bold text-purple-400 mt-0.5 block">{dpsResult ? dpsResult.critDmg : '0.0'}%</span>
                  </div>
                </div>
              </div>

              {/* 상황별 세부 DPS 리스트 */}
              <div>
                <h4 className="text-sm font-bold text-slate-300 mb-3">상황별 세부 연산 내역</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {dpsResult && Object.entries(dpsResult.states).map(([state, res]) => {
                    const label = state === 'ordinary' ? '평상시 딜링' :
                                  state === 'ordinaryBreak' ? '평상시 (무방비)' :
                                  state === 'ultimate' ? '궁극기 타이밍' : '궁극기 (무방비)';
                    if (state.includes('Break') && gimmicks.unarmedTime === 0) return null;

                    return (
                      <div key={state} className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 flex flex-col gap-3">
                        <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
                          <span className="text-xs font-bold text-slate-300">{label}</span>
                          <span className="text-xs text-slate-500 font-semibold">{res.cycleTime}초 사이클</span>
                        </div>
                        <div className="flex flex-col gap-1.5 text-xs text-slate-400">
                          <div className="flex justify-between">
                            <span>스킬/평타 DPS:</span>
                            <span className="font-medium text-slate-300">{res.skillDps.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>추가타(직접) DPS:</span>
                            <span className="font-medium text-slate-300">{res.directDps.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>지속/멀티 DPS:</span>
                            <span className="font-medium text-slate-300">{res.dotDps.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between border-t border-slate-800/40 pt-1.5 font-bold mt-1">
                            <span className="text-slate-200">합산 예상 DPS:</span>
                            <span className="text-emerald-400">{res.totalDps.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 프리셋 저장 및 비교 테이블 */}
              <div className="border-t border-slate-800 pt-6">
                <h4 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-mabi-accent" />
                  셋팅 비교 및 저장 (세션 프리셋)
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {presets.map((preset, idx) => (
                    <div
                      key={idx}
                      onClick={() => preset.data && loadPreset(idx)}
                      className={`p-4 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                        preset.data
                          ? 'bg-slate-950/40 border-slate-850 hover:border-mabi-accent'
                          : 'bg-slate-950/20 border-slate-800 border-dashed hover:border-slate-800'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold text-slate-300 truncate">{preset.name}</span>
                          {preset.data && (
                            <button
                              onClick={(e) => clearPreset(idx, e)}
                              className="text-slate-500 hover:text-red-400 text-sm font-bold p-1"
                            >
                              &times;
                            </button>
                          )}
                        </div>
                        <span className="text-xs font-black block mt-1">
                          {preset.data 
                            ? `${preset.data.weightedDps.toLocaleString()} DPS` 
                            : '비어있음'}
                        </span>
                        {preset.data && dpsResult && (
                          <span className={`text-[10px] font-bold block mt-1.5 ${
                            dpsResult.weightedDps >= preset.data.weightedDps ? 'text-emerald-400' : 'text-red-400'
                          }`}>
                            {dpsResult.weightedDps >= preset.data.weightedDps ? '현재보다 ' : '현재보다 '}
                            {Math.abs(((dpsResult.weightedDps / preset.data.weightedDps - 1) * 100)).toFixed(1)}% 
                            {dpsResult.weightedDps >= preset.data.weightedDps ? ' 낮음' : ' 높음'}
                          </span>
                        )}
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          savePreset(idx);
                        }}
                        className="mt-3 w-full bg-slate-850 hover:bg-slate-800 border border-slate-800 text-[10px] font-bold text-slate-350 py-1 rounded transition-all"
                      >
                        현재 셋팅 저장
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
