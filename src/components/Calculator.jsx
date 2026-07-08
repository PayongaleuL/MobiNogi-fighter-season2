import React, { useState, useEffect } from 'react';
import StatsInput from './StatsInput';
import RuneSelector from './RuneSelector';
import ConditionalPanel from './ConditionalPanel';
import GemStonePanel from './GemStonePanel';
import RuneAuditDashboard from './RuneAuditDashboard';
import { calculateDPS } from '../utils/calculator';
import { Play, RotateCcw, Save, Trash2, Check, TrendingUp, Info, Gem, Activity, Sliders } from 'lucide-react';
import runesData from '../data/runes.json';

export default function Calculator() {
  // 1. 활성화 탭 관리 ('calculator' | 'gemstone' | 'runeAudit')
  const [activeTab, setActiveTab] = useState('calculator');

  // 1-1. 룬 데이터베이스 수정 가능한 커스텀 룬 목록 상태
  const [customRunes, setCustomRunes] = useState(runesData);

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
    strongDmgPct: 0.0, // 추가 인챈트 강타피해%
    chainDmgPct: 0.0,  // 추가 인챈트 연타피해%
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

  // 3-1. 장착 룬 초월 단계 상태 (0: 미초월, 1: 초월+, 2: 초월++)
  const [transcendLevels, setTranscendLevels] = useState({
    '무기': [0],
    '방어구': [0, 0, 0, 0, 0],
    '장신구': [0, 0, 0],
    '엠블럼': [0]
  });

  // 4. 보석 세공 수치 계산 결과 상태 (실시간 유도되어 하위 패널 전달용)
  const [gemStats, setGemStats] = useState({
    strongDmg: 0.0, strongCd: 0.0,
    moveDmg: 0.0, moveCd: 0.0,
    subDmg: 0.0, subCd: 0.0,
    disableDmg: 0.0, disableCd: 0.0,
    saveDmg: 0.0, saveCd: 0.0
  });

  // 4-1. 22개 보석 개별 슬롯 인벤토리 상태 (세공 옵션 최대 3줄 다중 선택 지원)
  const [gems, setGems] = useState(
    Array.from({ length: 22 }, (_, idx) => ({
      id: idx + 1,
      grade: '온전한 스타프리즘', // '미장착' | '스타프리즘' | '스타프리즘S' | '온전한 스타프리즘'
      options: ['강뎀', '이뎀'] // 기본 2줄 다중선택 프리셋 (강뎀 + 이뎀)
    }))
  );

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

  // 8. 6개 스킬 개별 스탠스(Stance) 선택 상태
  const [skillStances, setSkillStances] = useState({
    skill_1: '순정',
    skill_2: '순정',
    skill_3: '순정',
    skill_4: '순정',
    skill_5: '순정'
  });

  // 9. 계산된 DPS 결과 상태
  const [dpsResult, setDpsResult] = useState(null);

  // 10. 세팅 비교용 슬롯 상태 (로컬 스토리지 연동)
  const [presets, setPresets] = useState([
    { name: '셋팅 1', data: null },
    { name: '셋팅 2', data: null },
    { name: '셋팅 3', data: null }
  ]);

  // 실시간 DPS 재계산 트리거 (gems 개별 상태 연산식 포함)
  useEffect(() => {
    // gems로부터 gemStats 및 특수보석 능력치 계산
    const gradeValues = {
      '스타프리즘': { dmg: 2.00, cd: 0.65 },
      '스타프리즘S': { dmg: 2.10, cd: 0.70 },
      '온전한 스타프리즘': { dmg: 2.20, cd: 0.75 },
      
      // 특수 보석 계열 (세공 기본 효율은 스타프리즘S와 동일하게 뎀증 2.1%, 쿨감 0.70% 상속)
      '헬리오도르': { dmg: 2.10, cd: 0.70 },
      '정제된 헬리오도르': { dmg: 2.10, cd: 0.70 },
      '순수한 헬리오도르': { dmg: 2.10, cd: 0.70 },
      '그린 헬리오도르': { dmg: 2.10, cd: 0.70 },
      '정제된 그린 헬리오도르': { dmg: 2.10, cd: 0.70 },
      '순수한 그린 헬리오도르': { dmg: 2.10, cd: 0.70 }
    };

    const calculatedGemStats = {
      strongDmg: 0.0, strongCd: 0.0,
      moveDmg: 0.0, moveCd: 0.0,
      subDmg: 0.0, subCd: 0.0,
      saveDmg: 0.0, saveCd: 0.0,
      disableDmg: 0.0, disableCd: 0.0,
      doubleDmg: 0.0, doubleCd: 0.0,
      summonDmg: 0.0, summonCd: 0.0,
      elementDmg: 0.0, elementCd: 0.0
    };

    // 특수 보석 고유 옵션 변수
    let extraAllStat = 0;
    let extraFinalDmgPct = 0.0;
    let emblemSkillTagBoost = 0.0;

    gems.forEach(gem => {
      if (gem.grade === '미장착') return;

      // 1. 특수 보석 고유 능력치 파싱
      if (gem.grade === '헬리오도르') {
        extraAllStat += 36;
        extraFinalDmgPct += 5.0;
      } else if (gem.grade === '정제된 헬리오도르') {
        extraAllStat += 44;
        extraFinalDmgPct += 5.2;
      } else if (gem.grade === '순수한 헬리오도르') {
        extraAllStat += 54;
        extraFinalDmgPct += 5.4;
      } else if (gem.grade === '그린 헬리오도르') {
        extraAllStat += 36;
        emblemSkillTagBoost += 1.50;
      } else if (gem.grade === '정제된 그린 헬리오도르') {
        extraAllStat += 44;
        emblemSkillTagBoost += 2.10;
      } else if (gem.grade === '순수한 그린 헬리오도르') {
        extraAllStat += 54;
        emblemSkillTagBoost += 2.20;
      }

      // 2. 세공 옵션 누적
      if (!gem.options || gem.options.length === 0) return;
      const values = gradeValues[gem.grade];
      if (!values) return;

      gem.options.forEach(opt => {
        if (opt === '강뎀') calculatedGemStats.strongDmg += values.dmg;
        else if (opt === '강쿨') calculatedGemStats.strongCd += values.cd;
        else if (opt === '이뎀') calculatedGemStats.moveDmg += values.dmg;
        else if (opt === '이쿨') calculatedGemStats.moveCd += values.cd;
        else if (opt === '보뎀') calculatedGemStats.subDmg += values.dmg;
        else if (opt === '보쿨') calculatedGemStats.subCd += values.cd;
        else if (opt === '생존뎀') calculatedGemStats.saveDmg += values.dmg;
        else if (opt === '생존쿨') calculatedGemStats.saveCd += values.cd;
        else if (opt === '방해뎀') calculatedGemStats.disableDmg += values.dmg;
        else if (opt === '방해쿨') calculatedGemStats.disableCd += values.cd;
        else if (opt === '연타뎀') calculatedGemStats.doubleDmg += values.dmg;
        else if (opt === '연타쿨') calculatedGemStats.doubleCd += values.cd;
        else if (opt === '소환뎀') calculatedGemStats.summonDmg += values.dmg;
        else if (opt === '소환쿨') calculatedGemStats.summonCd += values.cd;
        else if (opt === '원소뎀') calculatedGemStats.elementDmg += values.dmg;
        else if (opt === '원소쿨') calculatedGemStats.elementCd += values.cd;
      });
    });

    // 3. 그린 헬리오도르의 모든 스킬태그 데미지 강화% 일괄 누적
    if (emblemSkillTagBoost > 0) {
      calculatedGemStats.strongDmg += emblemSkillTagBoost;
      calculatedGemStats.moveDmg += emblemSkillTagBoost;
      calculatedGemStats.subDmg += emblemSkillTagBoost;
      calculatedGemStats.saveDmg += emblemSkillTagBoost;
      calculatedGemStats.disableDmg += emblemSkillTagBoost;
      calculatedGemStats.doubleDmg += emblemSkillTagBoost;
      calculatedGemStats.summonDmg += emblemSkillTagBoost;
      calculatedGemStats.elementDmg += emblemSkillTagBoost;
    }

    // 소수점 2자리 반올림
    Object.keys(calculatedGemStats).forEach(k => {
      calculatedGemStats[k] = parseFloat(calculatedGemStats[k].toFixed(2));
    });

    setGemStats(calculatedGemStats);

    // 룬 정보 전개 및 개별 초월 레벨 주입
    const flattenedRunes = [];
    Object.keys(selectedRunes).forEach(type => {
      selectedRunes[type].forEach((r, idx) => {
        if (r) {
          const latestRune = customRunes.find(cr => cr.name === r.name) || r;
          const rCopy = {
            ...latestRune,
            transcendLevel: transcendLevels[type] ? transcendLevels[type][idx] : 0
          };
          flattenedRunes.push(rCopy);
        }
      });
    });

    // 캐릭터 스탯에 특수 보석 가산 스탯(extraAllStat, extraFinalDmgPct)을 결합하여 전달
    const statsWithGems = {
      ...stats,
      extraAllStat,
      extraFinalDmgPct
    };

    // DPS 실시간 연산
    const result = calculateDPS(statsWithGems, flattenedRunes, gimmicks, cycles, conditionalUptimes, calculatedGemStats, skillStances);
    setDpsResult(result);
  }, [stats, selectedRunes, gimmicks, cycles, conditionalUptimes, gems, skillStances, customRunes]);

  // 로컬 스토리지 프리셋 로드 및 하위 호환 마이그레이션
  useEffect(() => {
    let saved = localStorage.getItem('mabi_runes_presets_v5');
    if (!saved) {
      const legacyKeys = [
        'mabi_runes_presets_v4',
        'mabi_runes_presets_v3',
        'mabi_runes_presets_v2',
        'mabi_runes_presets'
      ];
      for (const legacyKey of legacyKeys) {
        const legacyData = localStorage.getItem(legacyKey);
        if (legacyData) {
          saved = legacyData;
          localStorage.setItem('mabi_runes_presets_v5', legacyData);
          break;
        }
      }
    }
    if (saved) {
      try {
        setPresets(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // 마지막 입력 스탯 및 상태 자동 로드 (새로고침 및 하위 호환 마이그레이션 대응)
  useEffect(() => {
    let savedAutosave = localStorage.getItem('mabi_calculator_autosave_v5');
    if (!savedAutosave) {
      const legacyAutosaveKeys = [
        'mabi_calculator_autosave_v4',
        'mabi_calculator_autosave_v3',
        'mabi_calculator_autosave_v2',
        'mabi_calculator_autosave'
      ];
      for (const legacyKey of legacyAutosaveKeys) {
        const legacyData = localStorage.getItem(legacyKey);
        if (legacyData) {
          savedAutosave = legacyData;
          localStorage.setItem('mabi_calculator_autosave_v5', legacyData);
          break;
        }
      }
    }
    if (savedAutosave) {
      try {
        const parsed = JSON.parse(savedAutosave);
        if (parsed.stats) setStats(parsed.stats);
        if (parsed.selectedRunes) setSelectedRunes(parsed.selectedRunes);
        if (parsed.transcendLevels) setTranscendLevels(parsed.transcendLevels);
        if (parsed.cycles) setCycles(parsed.cycles);
        if (parsed.conditionalUptimes) setConditionalUptimes(parsed.conditionalUptimes);
        if (parsed.gimmicks) setGimmicks(parsed.gimmicks);
        if (parsed.skillStances) setSkillStances(parsed.skillStances);
        if (parsed.gems) {
          // 하위 호환성 확보: 혹시 options가 없고 단일 option 필드만 있는 구버전 데이터면 배열로 강제 마이그레이션
          const migGems = parsed.gems.map(g => {
            if (!g.options) {
              return {
                ...g,
                options: g.option ? [g.option] : []
              };
            }
            return g;
          });
          setGems(migGems);
        }
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
      transcendLevels,
      cycles,
      conditionalUptimes,
      gimmicks,
      skillStances,
      gems
    };
    localStorage.setItem('mabi_calculator_autosave_v5', JSON.stringify(dataToSave));
  }, [stats, selectedRunes, transcendLevels, cycles, conditionalUptimes, gimmicks, skillStances, gems]);

  const handleStatsChange = (key, val) => {
    setStats(prev => ({ ...prev, [key]: val }));
  };

  const handleGemChange = (index, key, val) => {
    setGems(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [key]: val };
      return copy;
    });
  };

  const handleRuneChange = (type, index, rune) => {
    setSelectedRunes(prev => {
      const copy = [...prev[type]];
      copy[index] = rune;
      return { ...prev, [type]: copy };
    });
    // 룬이 해제되면 초월 레벨도 0으로 복원
    if (!rune) {
      setTranscendLevels(prev => {
        const copy = [...prev[type]];
        copy[index] = 0;
        return { ...prev, [type]: copy };
      });
    }
  };

  const handleTranscendChange = (type, index, level) => {
    setTranscendLevels(prev => {
      const copy = [...prev[type]];
      copy[index] = level;
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

  const handleStanceChange = (key, val) => {
    setSkillStances(prev => ({ ...prev, [key]: val }));
  };

  const handleReset = () => {
    if (window.confirm('모든 능력치, 룬, 보석 세공, 스탠스 설정을 초기화하시겠습니까?')) {
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
        strongDmgPct: 0.0,
        chainDmgPct: 0.0,
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
      setTranscendLevels({
        '무기': [0],
        '방어구': [0, 0, 0, 0, 0],
        '장신구': [0, 0, 0],
        '엠블럼': [0]
      });
      setGems(
        Array.from({ length: 22 }, (_, idx) => ({
          id: idx + 1,
          grade: '온전한 스타프리즘',
          options: ['강뎀', '이뎀']
        }))
      );
      setSkillStances({
        skill_1: '순정',
        skill_2: '순정',
        skill_3: '순정',
        skill_4: '순정',
        skill_5: '순정'
      });
      setConditionalUptimes({});
    }
  };

  const handleRunesUpdate = (updatedRunes) => {
    setCustomRunes(updatedRunes);
    setSelectedRunes(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(type => {
        next[type] = next[type].map(selectedRune => {
          if (!selectedRune) return null;
          const matched = updatedRunes.find(ur => ur.name === selectedRune.name);
          return matched ? matched : selectedRune;
        });
      });
      return next;
    });
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
        transcendLevels,
        cycles,
        conditionalUptimes,
        gems,
        skillStances,
        weightedDps: dpsResult?.weightedDps || 0
      }
    };
    setPresets(newPresets);
    localStorage.setItem('mabi_runes_presets_v5', JSON.stringify(newPresets));
  };

  const clearPreset = (slotIndex, e) => {
    e.stopPropagation();
    if (window.confirm('이 프리셋 저장을 해제하시겠습니까?')) {
      const newPresets = [...presets];
      newPresets[slotIndex] = { name: `셋팅 ${slotIndex + 1}`, data: null };
      setPresets(newPresets);
      localStorage.setItem('mabi_runes_presets_v5', JSON.stringify(newPresets));
    }
  };

  const loadPreset = (slotIndex) => {
    const preset = presets[slotIndex];
    if (!preset || !preset.data) return;
    
    if (window.confirm(`'${preset.name}' 셋팅을 불러오시겠습니까? 현재 구성은 덮어씌워집니다.`)) {
      setStats(preset.data.stats);
      setSelectedRunes(preset.data.selectedRunes);
      setTranscendLevels(preset.data.transcendLevels || {
        '무기': [0],
        '방어구': [0, 0, 0, 0, 0],
        '장신구': [0, 0, 0],
        '엠블럼': [0]
      });
      setCycles(preset.data.cycles);
      setConditionalUptimes(preset.data.conditionalUptimes || {});
      if (preset.data.gems) {
        // 프리셋 로드 시에도 options 배열 규격 마이그레이션 적용
        const migGems = preset.data.gems.map(g => {
          if (!g.options) {
            return {
              ...g,
              options: g.option ? [g.option] : []
            };
          }
          return g;
        });
        setGems(migGems);
      }
      setSkillStances(preset.data.skillStances || {
        skill_1: '순정',
        skill_2: '순정',
        skill_3: '순정',
        skill_4: '순정',
        skill_5: '순정'
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
            <span className="text-xs bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-full text-slate-400 font-bold">시즌 2 최종본</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            보석 세공 3줄 다중 지정, 장비 부위별 묶음 연동 및 3줄 미만 경고 시스템이 이식된 7차 완성 대시보드입니다.
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
          <button
            onClick={() => setActiveTab('runeAudit')}
            className={`flex-1 md:flex-none px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'runeAudit'
                ? 'bg-mabi-accent text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            룬 스탯 교정실
          </button>
        </div>
      </div>

      {/* 탭 내용 분기 렌더링 */}
      {activeTab === 'gemstone' ? (
        <GemStonePanel gems={gems} onGemChange={handleGemChange} setGems={setGems} selectedRunes={selectedRunes} />
      ) : activeTab === 'runeAudit' ? (
        <RuneAuditDashboard runes={customRunes} onRunesUpdate={handleRunesUpdate} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fadeIn">
          
          {/* 좌측 패널 */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <StatsInput stats={stats} onStatsChange={handleStatsChange} />
            <ConditionalPanel
              selectedRunes={selectedRunes}
              conditionalUptimes={conditionalUptimes}
              onUptimeChange={handleUptimeChange}
            />
          </div>

          {/* 우측 패널 */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* 룬 슬롯 선택기 */}
            <RuneSelector
              selectedRunes={selectedRunes}
              onRuneChange={handleRuneChange}
              transcendLevels={transcendLevels}
              onTranscendChange={handleTranscendChange}
            />

            {/* 스킬별 스탠스 시뮬레이션 설정 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                스킬별 스탠스(Stance) 시뮬레이션 설정
              </h3>
              <p className="text-xs text-slate-400 mb-5 leading-normal">
                장신구 룬 장착과 무관하게, 각 액티브 스킬들의 행동 변화(소닉 피스트, 섬머솔트 등 치환) 스탠스를 지정하여 딜사이클을 직접 가상 시뮬레이션합니다.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {/* 1번 스킬 */}
                <div className="flex flex-col gap-1.5 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                  <label className="text-[10px] font-semibold text-slate-400">1번 차징 피스트</label>
                  <select
                    value={skillStances.skill_1}
                    onChange={(e) => handleStanceChange('skill_1', e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-bold focus:outline-none"
                  >
                    <option value="순정">순정 (1.475 계수)</option>
                    <option value="충돌">충돌 (1.775 계수 / 범위피)</option>
                    <option value="약점">약점 (0.92 계수 / 카운터 디버프)</option>
                  </select>
                </div>

                {/* 2번 스킬 */}
                <div className="flex flex-col gap-1.5 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                  <label className="text-[10px] font-semibold text-slate-400">2번 연환격</label>
                  <select
                    value={skillStances.skill_2}
                    onChange={(e) => handleStanceChange('skill_2', e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-bold focus:outline-none"
                  >
                    <option value="순정">순정 (0.405 계수)</option>
                    <option value="전진">전진 (0.465 계수 / 콤보피증)</option>
                    <option value="도약">도약 (0.64 계수 / 거리 비례피)</option>
                  </select>
                </div>

                {/* 3번 스킬 */}
                <div className="flex flex-col gap-1.5 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                  <label className="text-[10px] font-semibold text-slate-400">3번 섬격</label>
                  <select
                    value={skillStances.skill_3}
                    onChange={(e) => handleStanceChange('skill_3', e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-bold focus:outline-none"
                  >
                    <option value="순정">순정 (0.085 계수)</option>
                    <option value="순발력">순발력 (0.24 계수 / 이속저하)</option>
                  </select>
                </div>

                {/* 4번 스킬 */}
                <div className="flex flex-col gap-1.5 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                  <label className="text-[10px] font-semibold text-slate-400">4번 버스트 펀치</label>
                  <select
                    value={skillStances.skill_4}
                    onChange={(e) => handleStanceChange('skill_4', e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-bold focus:outline-none"
                  >
                    <option value="순정">순정 (0.141~ 계수)</option>
                    <option value="격파">격파 (0.188~ 계수 / 단일추가타)</option>
                    <option value="소닉 피스트">소닉 피스트 (1.09 * 2.98배 기댓값)</option>
                  </select>
                </div>

                {/* 5번 스킬 */}
                <div className="flex flex-col gap-1.5 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                  <label className="text-[10px] font-semibold text-slate-400">5번 비룡격</label>
                  <select
                    value={skillStances.skill_5}
                    onChange={(e) => handleStanceChange('skill_5', e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-bold focus:outline-none"
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
                  스킬 입력 약어: 1 (차징피스트 1타/2타), 2 (연환격 1타/2타), 3 (섬격), 4 (버스트펀치/소닉피스트), 5 (비룡격/섬머솔트), 6 (궁극기)
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
                    <span className="text-slate-500 font-semibold block">룬 공격력 가산</span>
                    <span className="font-bold text-amber-400 mt-0.5 block">+{dpsResult ? dpsResult.runeAtkAdd.toLocaleString() : '0'}</span>
                  </div>
                  <div className="bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-850">
                    <span className="text-slate-500 font-semibold block">총 마도저항</span>
                    <span className="font-bold text-blue-400 mt-0.5 block">{dpsResult ? dpsResult.totalResist.toLocaleString() : '0'}</span>
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
                <h4 className="text-sm font-bold text-slate-300 mb-3 flex justify-between items-center">
                  <span>상황별 세부 연산 내역</span>
                  <span className="text-[10px] text-slate-500 font-medium">※ 파쇄권/충격파 패시브 피해 100% 상시 통합 연산됨</span>
                </h4>
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
                            <span>스킬/패시브 DPS:</span>
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
                          : 'bg-slate-950/20 border-slate-800 border-dashed hover:border-slate-700'
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
