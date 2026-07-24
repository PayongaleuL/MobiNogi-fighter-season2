import React, { useState, useEffect, useMemo } from 'react';
import GemStonePanel from './GemStonePanel';
import RuneAuditDashboard from './RuneAuditDashboard';
import SealControlPanel from './SealControlPanel';
import MainCalculatorTab from './MainCalculatorTab';
import { calculateDPS } from '../utils/calculator';
import { Sun, Moon, Shield, Sliders, Activity, Gem } from 'lucide-react';
import runesData from '../data/runes.json';
import { parseRuneMarkdown } from '../utils/runeMdParser';
import mdText from '../../results/260708_룬설명목록.md?raw';
import skillMdText from '../../results/260710_패시브_액티브_스킬목록.md?raw';
import parseSkillMarkdown from '../utils/skillMdParser';
import { calculateGemStats } from '../utils/gemCalculator';

export default function Calculator() {
  // 1. 활성화 탭 관리 ('calculator' | 'gemstone' | 'runeAudit' | 'seals')
  const [activeTab, setActiveTab] = useState('calculator');

  // 1-2. UI 테마 관리 ('light' | 'dark')
  const [uiTheme, setUiTheme] = useState(() => {
    const saved = localStorage.getItem('mabi_calculator_theme');
    if (saved === 'dark') return 'dark';
    return 'light';
  });

  useEffect(() => {
    localStorage.setItem('mabi_calculator_theme', uiTheme);
    const root = document.documentElement;
    root.classList.remove('theme-dark');
    if (uiTheme === 'dark') {
      root.classList.add('theme-dark');
    }
  }, [uiTheme]);

  // 1-1. 룬 데이터베이스 수정 가능한 커스텀 룬 목록 상태 (마스터 마크다운 자동 파싱 연동)
  const [customRunes, setCustomRunes] = useState(() => {
    try {
      const parsed = parseRuneMarkdown(mdText);
      if (parsed && parsed.length > 40) {
        const getCore = (name) => name ? name.replace(/\+/g, '').replace(/\s+/g, '').trim() : '';
        return parsed.map(p => {
          const original = runesData.find(o => getCore(o.name) === getCore(p.name)) || {};
          return {
            ...original,
            ...p
          };
        });
      }
    } catch (e) {
      console.error("Master markdown parsing failed, falling back to runes.json:", e);
    }
    return runesData;
  });

  // 1-3. 파싱된 스킬 데이터 구성
  const parsedSkills = useMemo(() => parseSkillMarkdown(skillMdText), []);

  // 1-4. 로컬 스토리지 초기 로딩 완료 여부 플래그
  const [isLoaded, setIsLoaded] = useState(false);

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
    strongDmgPct: 0.0,
    chainDmgPct: 0.0,
    skillLevel_1: 10,
    skillLevel_2: 30,
    skillLevel_3: 10,
    skillLevel_4: 10,
    skillLevel_5: 10,
    skillLevel_6: 10,
    useNightTrace: true,
    useDeadlyImpact: true,
    useHitCombo: true,
    nightBlessingUptime: 25
  });

  // 3-2. 시즌2 달의 인장 설정 상태
  const [seals, setSeals] = useState(() => {
    const saved = localStorage.getItem('mabi_calculator_seals');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return {
      weapon: { type: 'none', blueStat1Type: 'str', blueStat1Value: 27, blueStat2Type: 'wil', blueStat2Value: 27, redMoonStatValue: 40 },
      necklace: { type: 'none', blueStat1Type: 'str', blueStat1Value: 27, blueStat2Type: 'wil', blueStat2Value: 27, redMoonStatValue: 40 },
      ring1: { type: 'none', blueStat1Type: 'str', blueStat1Value: 27, blueStat2Type: 'wil', blueStat2Value: 27, redMoonStatValue: 40 },
      ring2: { type: 'none', blueStat1Type: 'str', blueStat1Value: 27, blueStat2Type: 'wil', blueStat2Value: 27, redMoonStatValue: 40 },
      emblem: { type: 'none', blueStat1Type: 'str', blueStat1Value: 27, blueStat2Type: 'wil', blueStat2Value: 27, redMoonStatValue: 40 },
      hat: { type: 'none', blueStat1Type: 'str', blueStat1Value: 27, blueStat2Type: 'wil', blueStat2Value: 27, redMoonStatValue: 40 },
      top: { type: 'none', blueStat1Type: 'str', blueStat1Value: 27, blueStat2Type: 'wil', blueStat2Value: 27, redMoonStatValue: 40 },
      bottom: { type: 'none', blueStat1Type: 'str', blueStat1Value: 27, blueStat2Type: 'wil', blueStat2Value: 27, redMoonStatValue: 40 },
      gloves: { type: 'none', blueStat1Type: 'str', blueStat1Value: 27, blueStat2Type: 'wil', blueStat2Value: 27, redMoonStatValue: 40 },
      shoes: { type: 'none', blueStat1Type: 'str', blueStat1Value: 27, blueStat2Type: 'wil', blueStat2Value: 27, redMoonStatValue: 40 }
    };
  });

  useEffect(() => {
    localStorage.setItem('mabi_calculator_seals', JSON.stringify(seals));
  }, [seals]);

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

  // 4-1. 22개 보석 개별 슬롯 인벤토리 상태 (기본 세공 없음 상태로 시작)
  const [gems, setGems] = useState(
    Array.from({ length: 22 }, (_, idx) => ({
      id: idx + 1,
      grade: '온전한 스타프리즘',
      options: []
    }))
  );

  // 5. 전투 및 보스 기믹 상태 (기본 함선 허수아비 셋팅)
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

  // 6. 상황별 딜사이클 상태 (기본 딜사이클 셋팅)
  const [cycles, setCycles] = useState({
    ordinary: '235212',
    ordinaryBreak: '235212',
    ultimate: '252',
    ultimateBreak: '252'
  });

  // 7. 조건부 룬 가동률 상태
  const [conditionalUptimes, setConditionalUptimes] = useState({});

  // 8. 6개 스킬 개별 스탠스(Stance) 선택 상태 (순정 셋팅)
  const [skillStances, setSkillStances] = useState({
    skill_1: '순정',
    skill_2: '순정',
    skill_3: '순정',
    skill_4: '순정',
    skill_5: '순정'
  });

  // 10. 세팅 비교용 슬롯 상태 (로컬 스토리지 연동)
  const [presets, setPresets] = useState(() => {
    const saved = localStorage.getItem('mabi_runes_presets_v5');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse presets_v5:", e);
      }
    }
    const savedV4 = localStorage.getItem('mabi_runes_presets_v4');
    if (savedV4) {
      try {
        const parsed = JSON.parse(savedV4);
        localStorage.setItem('mabi_runes_presets_v5', savedV4);
        return parsed;
      } catch (e) {
        console.error("Failed to parse presets_v4:", e);
      }
    }
    return [
      { name: '셋팅 1', data: null },
      { name: '셋팅 2', data: null },
      { name: '셋팅 3', data: null }
    ];
  });

  // gems로부터 gemStats 및 특수보석 능력치 계산
  const { gemStats, extraAllStat, extraFinalDmgPct } = useMemo(() => {
    return calculateGemStats(gems);
  }, [gems]);

  // 룬 정보 전개 및 개별 초월 레벨 주입
  const flattenedRunes = useMemo(() => {
    const flattened = [];
    const getCoreName = (name) => name ? name.replace(/\+/g, '').replace(/\s+/g, '').trim() : '';
    Object.keys(selectedRunes).forEach(type => {
      selectedRunes[type].forEach((r, idx) => {
        if (r) {
          const latestRune = customRunes.find(cr => getCoreName(cr.name) === getCoreName(r.name)) || 
                             runesData.find(o => getCoreName(o.name) === getCoreName(r.name)) || 
                             r;
          const rCopy = {
            ...latestRune,
            stats: latestRune.stats || {},
            transcendLevel: transcendLevels[type] ? transcendLevels[type][idx] : 0
          };
          flattened.push(rCopy);
        }
      });
    });
    return flattened;
  }, [selectedRunes, customRunes, transcendLevels]);

  // DPS 실시간 연산 (인장 설정 데이터 seals 결합 전달 및 parsedSkills 전달)
  const dpsResult = useMemo(() => {
    const statsWithGems = {
      ...stats,
      extraAllStat,
      extraFinalDmgPct
    };
    const res = calculateDPS(statsWithGems, flattenedRunes, gimmicks, cycles, conditionalUptimes, gemStats, skillStances, seals, parsedSkills);
    console.log("CALC_DETAILS:", JSON.stringify({
      weightedDps: res.weightedDps,
      totalAtk: res.totalAtk,
      gemStats,
      skillStances,
      seals
    }));
    return res;
  }, [stats, extraAllStat, extraFinalDmgPct, flattenedRunes, gimmicks, cycles, conditionalUptimes, gemStats, skillStances, seals, parsedSkills]);

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
    setIsLoaded(true);
  }, []);

  // 능력치/룬/세공 등 상태 변경 시 자동 저장 (로드가 완벽히 끝난 후 변경된 건만 덮어씀)
  useEffect(() => {
    if (!isLoaded) return;
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
  }, [isLoaded, stats, selectedRunes, transcendLevels, cycles, conditionalUptimes, gimmicks, skillStances, gems]);

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
    if (rune && rune.type !== type) {
      console.warn(`Rune type mismatch! Cannot equip ${rune.name} (${rune.type}) to ${type} slot.`);
      return;
    }
    setSelectedRunes(prev => {
      const copy = [...prev[type]];
      copy[index] = rune;
      return { ...prev, [type]: copy };
    });
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
          options: []
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
      const getCoreName = (name) => name ? name.replace(/\+/g, '').replace(/\s+/g, '').trim() : '';
      Object.keys(next).forEach(type => {
        next[type] = next[type].map(selectedRune => {
          if (!selectedRune) return null;
          const matched = updatedRunes.find(ur => getCoreName(ur.name) === getCoreName(selectedRune.name));
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

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-theme-main flex items-center justify-center theme-transition p-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-black text-theme-sub animate-pulse">격투가 세션 복구 및 마스터 마도서 파싱 중...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 p-4 md:p-6 text-theme-main theme-transition">
      {/* 타이틀 및 탭 네비게이션 */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-theme-card border border-theme rounded-2xl p-6 shadow-theme theme-transition">
        <div>
          <h2 className="text-2xl font-black text-theme-main flex flex-wrap items-center gap-x-2 gap-y-1.5 leading-tight">
            <span className="text-orange-500 font-extrabold whitespace-nowrap">Mabinogi Mobile</span>
            <span className="whitespace-nowrap">격투가 종합 계산기</span>
            <span className="text-xs bg-theme-subcard border border-theme px-2 py-0.5 rounded-full text-theme-sub font-bold whitespace-nowrap">시즌2.ver (260710)</span>
          </h2>
          <p className="text-xs text-theme-sub mt-1 leading-relaxed">
            보석 세공 3줄 다중 지정, 장비 부위별 묶음 연동 및 3줄 미만 경고 시스템이 이식된 7차 완성 대시보드입니다.
          </p>
        </div>

        <div className="flex items-center gap-4 w-full xl:w-auto justify-between xl:justify-end">
          {/* 테마 스위처 */}
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black text-theme-muted uppercase tracking-wider">UI Theme</label>
            <div 
              onClick={() => setUiTheme(prev => prev === 'light' ? 'dark' : 'light')}
              className="relative w-14 h-8 bg-theme-subcard border border-theme rounded-full p-1 cursor-pointer flex items-center justify-between theme-transition select-none group"
            >
              <Sun className="w-3.5 h-3.5 text-orange-400 ml-0.5 opacity-55 group-hover:opacity-100 transition-opacity shrink-0" />
              <Moon className="w-3.5 h-3.5 text-indigo-400 mr-0.5 opacity-55 group-hover:opacity-100 transition-opacity shrink-0" />
              
              <div 
                className={`absolute w-6 h-6 rounded-full shadow-md flex items-center justify-center transition-all duration-300 ease-in-out ${
                  uiTheme === 'dark' 
                    ? 'translate-x-6 bg-indigo-600' 
                    : 'translate-x-0 bg-orange-500'
                }`}
              >
                {uiTheme === 'dark' ? (
                  <Moon className="w-3 h-3 text-white animate-pulse" />
                ) : (
                  <Sun className="w-3 h-3 text-white animate-spin-slow" />
                )}
              </div>
            </div>
          </div>

          {/* 상단 탭 버튼 */}
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black text-theme-muted uppercase tracking-wider">Navigation Menu</label>
            <div className="flex bg-theme-subcard p-1 rounded-xl border border-theme self-stretch md:self-auto theme-transition overflow-x-auto whitespace-nowrap max-w-full">
              <button
                onClick={() => setActiveTab('calculator')}
                className={`flex-1 md:flex-none px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap flex-shrink-0 focus:outline-none ${
                  activeTab === 'calculator'
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'text-theme-sub hover:text-theme-main'
                }`}
              >
                종합 계산기
              </button>
              <button
                onClick={() => setActiveTab('gemstone')}
                className={`flex-1 md:flex-none px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap flex-shrink-0 focus:outline-none ${
                  activeTab === 'gemstone'
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'text-theme-sub hover:text-theme-main'
                }`}
              >
                <Gem className="w-3.5 h-3.5" />
                보석 세공실
              </button>
              <button
                onClick={() => setActiveTab('runeAudit')}
                className={`flex-1 md:flex-none px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap flex-shrink-0 focus:outline-none ${
                  activeTab === 'runeAudit'
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'text-theme-sub hover:text-theme-main'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                룬 스탯 교정실
              </button>
              <button
                onClick={() => setActiveTab('seals')}
                className={`flex-1 md:flex-none px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap flex-shrink-0 focus:outline-none ${
                  activeTab === 'seals'
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'text-theme-sub hover:text-theme-main'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                인장 설정실
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 탭 내용 분기 렌더링 */}
      {activeTab === 'gemstone' ? (
        <GemStonePanel uiTheme={uiTheme} gems={gems} onGemChange={handleGemChange} setGems={setGems} selectedRunes={selectedRunes} />
      ) : activeTab === 'runeAudit' ? (
        <RuneAuditDashboard uiTheme={uiTheme} runes={customRunes} onRunesUpdate={handleRunesUpdate} selectedRunes={selectedRunes} />
      ) : activeTab === 'seals' ? (
        <SealControlPanel seals={seals} onSealChange={(slot, val) => setSeals(prev => ({ ...prev, [slot]: val }))} />
      ) : (
        <MainCalculatorTab
          uiTheme={uiTheme}
          stats={stats}
          onStatsChange={handleStatsChange}
          skillStances={skillStances}
          onStanceChange={handleStanceChange}
          gimmicks={gimmicks}
          onGimmickChange={handleGimmickChange}
          cycles={cycles}
          onCycleChange={handleCycleChange}
          selectedRunes={selectedRunes}
          onRuneChange={handleRuneChange}
          transcendLevels={transcendLevels}
          onTranscendChange={handleTranscendChange}
          dpsResult={dpsResult}
          presets={presets}
          savePreset={savePreset}
          loadPreset={loadPreset}
          clearPreset={clearPreset}
          conditionalUptimes={conditionalUptimes}
          onUptimeChange={handleUptimeChange}
        />
      )}

    </div>
  );
}
