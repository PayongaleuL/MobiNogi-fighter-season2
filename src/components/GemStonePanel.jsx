import React from 'react';
import { Gem, ArrowRight, ShieldAlert, Sparkles, RefreshCw, Layers } from 'lucide-react';

export default function GemStonePanel({ uiTheme, gems, onGemChange, setGems, selectedRunes }) {
  
  // 보석 등급별 고정 세공 증가율 계수 (특수 보석은 스타프리즘S 수치 기본 매핑)
  const gradeValues = {
    '스타프리즘': { dmg: 2.00, cd: 0.65 },
    '스타프리즘S': { dmg: 2.10, cd: 0.70 },
    '온전한 스타프리즘': { dmg: 2.20, cd: 0.75 },
    '헬리오도르': { dmg: 2.10, cd: 0.70 },
    '정제된 헬리오도르': { dmg: 2.10, cd: 0.70 },
    '순수한 헬리오도르': { dmg: 2.10, cd: 0.70 },
    '그린 헬리오도르': { dmg: 2.10, cd: 0.70 },
    '정제된 그린 헬리오도르': { dmg: 2.10, cd: 0.70 },
    '순수한 그린 헬리오도르': { dmg: 2.10, cd: 0.70 }
  };

  // 장비별 소켓 배치 구성표 (장신구 3종 통합 및 합계 22소켓 규격 완벽 매핑)
  const GEM_SLOT_CONFIGS = [
    { part: '무기', count: 3, startIndex: 0 },
    { part: '장신구', count: 3, startIndex: 3 }, // 목걸이, 반지1, 반지2 병합
    { part: '엠블럼', count: 1, startIndex: 6 },
    { part: '방어구1', count: 3, startIndex: 7 },
    { part: '방어구2', count: 3, startIndex: 10 },
    { part: '방어구3', count: 3, startIndex: 13 },
    { part: '방어구4', count: 3, startIndex: 16 },
    { part: '방어구5', count: 3, startIndex: 19 }
  ];

  // 메인 종합계산기 룬 구성과의 실시간 동기화 헬퍼 함수
  const getRuneNameForPart = (part) => {
    if (!selectedRunes) return '';
    
    if (part === '무기') {
      const name = selectedRunes['무기']?.[0]?.name;
      return name ? ` - 무기(${name})` : ' - 무기(룬 미장착)';
    }
    if (part === '장신구') {
      const necklace = selectedRunes['장신구']?.[0]?.name || '미장착';
      const ring1 = selectedRunes['장신구']?.[1]?.name || '미장착';
      const ring2 = selectedRunes['장신구']?.[2]?.name || '미장착';
      return ` - 목걸이(${necklace}) / 반지1(${ring1}) / 반지2(${ring2})`;
    }
    if (part === '엠블럼') {
      const name = selectedRunes['엠블럼']?.[0]?.name;
      return name ? ` - 엠블럼(${name})` : ' - 엠블럼(룬 미장착)';
    }
    
    const armIdx = parseInt(part.replace('방어구', '')) - 1;
    const name = selectedRunes['방어구']?.[armIdx]?.name;
    return name ? ` - ${part}(${name})` : ` - ${part}(룬 미장착)`;
  };

  // 장신구 또는 개별 소켓명 가독성 라벨링
  const getSocketLabel = (part, subIdx) => {
    if (part === '장신구') {
      if (subIdx === 0) return '목걸이 소켓';
      if (subIdx === 1) return '반지1 소켓';
      return '반지2 소켓';
    }
    return `소켓 #${subIdx + 1}`;
  };

  // 22개 보석 인벤토리 실시간 합산 현황 연산 (16대 세공 스탯 및 특수 보석 강화 반영)
  const getSumStats = () => {
    const stats = {
      strongDmg: 0.0, strongCd: 0.0,
      moveDmg: 0.0, moveCd: 0.0,
      subDmg: 0.0, subCd: 0.0,
      saveDmg: 0.0, saveCd: 0.0,
      disableDmg: 0.0, disableCd: 0.0,
      doubleDmg: 0.0, doubleCd: 0.0,
      summonDmg: 0.0, summonCd: 0.0,
      elementDmg: 0.0, elementCd: 0.0
    };

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
        if (opt === '강뎀') stats.strongDmg += values.dmg;
        else if (opt === '강쿨') stats.strongCd += values.cd;
        else if (opt === '이뎀') stats.moveDmg += values.dmg;
        else if (opt === '이쿨') stats.moveCd += values.cd;
        else if (opt === '보뎀') stats.subDmg += values.dmg;
        else if (opt === '보쿨') stats.subCd += values.cd;
        else if (opt === '생존뎀') stats.saveDmg += values.dmg;
        else if (opt === '생존쿨') stats.saveCd += values.cd;
        else if (opt === '방해뎀') stats.disableDmg += values.dmg;
        else if (opt === '방해쿨') stats.disableCd += values.cd;
        else if (opt === '연타뎀') stats.doubleDmg += values.dmg;
        else if (opt === '연타쿨') stats.doubleCd += values.cd;
        else if (opt === '소환뎀') stats.summonDmg += values.dmg;
        else if (opt === '소환쿨') stats.summonCd += values.cd;
        else if (opt === '원소뎀') stats.elementDmg += values.dmg;
        else if (opt === '원소쿨') stats.elementCd += values.cd;
      });
    });

    // 3. 그린 헬리오도르의 모든 태그 데미지 강화% 일괄 적용
    if (emblemSkillTagBoost > 0) {
      stats.strongDmg += emblemSkillTagBoost;
      stats.moveDmg += emblemSkillTagBoost;
      stats.subDmg += emblemSkillTagBoost;
      stats.saveDmg += emblemSkillTagBoost;
      stats.disableDmg += emblemSkillTagBoost;
      stats.doubleDmg += emblemSkillTagBoost;
      stats.summonDmg += emblemSkillTagBoost;
      stats.elementDmg += emblemSkillTagBoost;
    }

    // 소수점 둘째자리 반올림
    Object.keys(stats).forEach(k => {
      stats[k] = parseFloat(stats[k].toFixed(2));
    });

    return {
      stats,
      extraAllStat,
      extraFinalDmgPct,
      emblemSkillTagBoost
    };
  };

  const { stats: sumStats, extraAllStat, extraFinalDmgPct, emblemSkillTagBoost } = getSumStats();

  // 프리셋 설정 도우미 (22개 보석 일괄 세팅 - 강뎀+이뎀 2줄 다중선택 적용)
  const applyPreset = (presetType) => {
    if (presetType === 'perfectStarPrism') {
      setGems(
        Array.from({ length: 22 }, (_, idx) => ({
          id: idx + 1,
          grade: '온전한 스타프리즘',
          options: ['강뎀', '이뎀'] // 강이 2줄 기본 체크
        }))
      );
    } else if (presetType === 'starPrismS') {
      setGems(
        Array.from({ length: 22 }, (_, idx) => ({
          id: idx + 1,
          grade: '스타프리즘S',
          options: ['강뎀', '이뎀']
        }))
      );
    } else if (presetType === 'starPrism') {
      setGems(
        Array.from({ length: 22 }, (_, idx) => ({
          id: idx + 1,
          grade: '스타프리즘',
          options: ['강뎀', '이뎀']
        }))
      );
    } else if (presetType === 'clearOptions') {
      setGems(prev => prev.map(gem => ({ ...gem, options: [] })));
    } else if (presetType === 'reset') {
      setGems(
        Array.from({ length: 22 }, (_, idx) => ({
          id: idx + 1,
          grade: '미장착',
          options: []
        }))
      );
    }
  };

  // 세공 옵션 다중 선택 토글 핸들러 (최대 3개 한도)
  const handleOptionClick = (globalIdx, optionValue, currentOptions) => {
    const opts = currentOptions || [];
    if (opts.includes(optionValue)) {
      const nextOpts = opts.filter(o => o !== optionValue);
      onGemChange(globalIdx, 'options', nextOpts);
    } else {
      if (opts.length >= 3) {
        alert('보석 세공 옵션은 최대 3줄(3개)까지만 선택 가능합니다.');
        return;
      }
      const nextOpts = [...opts, optionValue];
      onGemChange(globalIdx, 'options', nextOpts);
    }
  };

  // 16대 세공 옵션 종류 정의
  const optionTypes = [
    { label: '강뎀', value: '강뎀', desc: '강타 데미지' },
    { label: '이뎀', value: '이뎀', desc: '이동 데미지' },
    { label: '보뎀', value: '보뎀', desc: '보조 데미지' },
    { label: '생존뎀', value: '생존뎀', desc: '생존 데미지' },
    
    { label: '강쿨', value: '강쿨', desc: '강타 쿨감' },
    { label: '이쿨', value: '이쿨', desc: '이동 쿨감' },
    { label: '보쿨', value: '보쿨', desc: '보조 쿨감' },
    { label: '생존쿨', value: '생존쿨', desc: '생존 쿨감' },
    
    { label: '방해뎀', value: '방해뎀', desc: '방해 데미지' },
    { label: '연타뎀', value: '연타뎀', desc: '연타 데미지' },
    { label: '소환뎀', value: '소환뎀', desc: '소환 데미지' },
    { label: '원소뎀', value: '원소뎀', desc: '원소 데미지' },
    
    { label: '방해쿨', value: '방해쿨', desc: '방해 쿨감' },
    { label: '연타쿨', value: '연타쿨', desc: '연타 쿨감' },
    { label: '소환쿨', value: '소환쿨', desc: '소환 쿨감' },
    { label: '원소쿨', value: '원소쿨', desc: '원소 쿨감' }
  ];

  // 보석 위치(index)별 전용 보석 필터링 드롭다운 옵션 제공
  const getGradeOptions = (globalIdx) => {
    const base = (
      <>
        <option value="미장착">❌ 미장착</option>
        <option value="스타프리즘">💎 스타프리즘 (2.0%)</option>
        <option value="스타프리즘S">💎 스타프리즘S (2.1%)</option>
        <option value="온전한 스타프리즘">💎 온전한 스타프리즘 (2.2%)</option>
      </>
    );
    
    if (globalIdx >= 0 && globalIdx <= 2) {
      // 무기 소켓 (0, 1, 2) -> 헬리오도르 노출
      return (
        <>
          {base}
          <option value="헬리오도르">🔸 헬리오도르 (모든능력치+36 / 데미지+5.0%)</option>
          <option value="정제된 헬리오도르">🔸 정제된 헬리오도르 (모든능력치+44 / 데미지+5.2%)</option>
          <option value="순수한 헬리오도르">🔸 순수한 헬리오도르 (모든능력치+54 / 데미지+5.4%)</option>
        </>
      );
    }
    if (globalIdx === 6) {
      // 엠블럼 소켓 (6) -> 그린 헬리오도르 노출
      return (
        <>
          {base}
          <option value="그린 헬리오도르">🟢 그린 헬리오도르 (모든능력치+36 / 태그강화+1.5%)</option>
          <option value="정제된 그린 헬리오도르">🟢 정제된 그린 헬리오도르 (모든능력치+44 / 태그강화+2.1%)</option>
          <option value="순수한 그린 헬리오도르">🟢 순수한 그린 헬리오도르 (모든능력치+54 / 태그강화+2.2%)</option>
        </>
      );
    }
    return base;
  };

  return (
    <div className="bg-theme-card border border-theme rounded-2xl p-6 shadow-theme flex flex-col gap-6 w-full max-w-7xl mx-auto theme-transition">
      
      {/* 타이틀 및 퀵 가이드 */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-theme pb-5 theme-transition">
        <div>
          <h3 className="text-xl font-bold text-theme-main flex items-center gap-2">
            <Gem className="w-6 h-6 text-orange-500 animate-pulse" />
            보석 세공 인벤토리 관리
          </h3>
          <p className="text-xs text-theme-sub mt-1">
            22개의 소켓 보석을 장비 부위별로 지정합니다. 무기 전용 헬리오도르, 엠블럼 전용 그린 헬리오도르 특수 보석을 장착할 수 있습니다.
          </p>
        </div>

        {/* 프리셋 버튼 그룹 */}
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => applyPreset('perfectStarPrism')}
            className="px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-300 dark:border-purple-800/40 rounded-lg text-[10px] font-bold text-purple-700 dark:text-purple-300 transition-all active:scale-95 theme-transition"
          >
            온전한 스타프리즘 일괄 (강이)
          </button>
          <button
            onClick={() => applyPreset('starPrismS')}
            className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-300 dark:border-blue-800/40 rounded-lg text-[10px] font-bold text-blue-700 dark:text-blue-300 transition-all active:scale-95 theme-transition"
          >
            스타프리즘S 일괄 (강이)
          </button>
          <button
            onClick={() => applyPreset('starPrism')}
            className="px-3 py-1.5 bg-theme-subcard hover:bg-theme-card border border-theme rounded-lg text-[10px] font-bold text-theme-sub transition-all active:scale-95 theme-transition"
          >
            스타프리즘 일괄 (강이)
          </button>
          <button
            onClick={() => applyPreset('clearOptions')}
            className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-300 dark:border-amber-900/30 rounded-lg text-[10px] font-bold text-amber-700 dark:text-amber-400 transition-all active:scale-95 flex items-center gap-1 theme-transition"
          >
            <RefreshCw className="w-2.5 h-2.5" />
            옵션만 일괄 비우기
          </button>
          <button
            onClick={() => applyPreset('reset')}
            className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-300 dark:border-red-900/30 rounded-lg text-[10px] font-bold text-red-700 dark:text-red-400 transition-all active:scale-95 theme-transition"
          >
            전체 미장착
          </button>
        </div>
      </div>

      {/* 세공 실시간 합산 현황 보드 (16대 세공 옵션 종합) */}
      <div className="bg-theme-subcard border border-theme rounded-2xl p-5 flex flex-col gap-4 theme-transition">
        <div className="flex justify-between items-center">
          <h4 className="text-xs font-black text-theme-muted flex items-center gap-1.5 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            보석 세공 및 특수 보석 합산 스탯 총합 보드
          </h4>
          {/* 특수 보석 가산 스탯 요약 */}
          {(extraAllStat > 0 || extraFinalDmgPct > 0 || emblemSkillTagBoost > 0) && (
            <div className="flex gap-3 text-[10px] text-orange-500 font-bold">
              {extraAllStat > 0 && <span>모든능력치 +{extraAllStat} (공격력 +{extraAllStat * 1.5})</span>}
              {extraFinalDmgPct > 0 && <span>최종 주는피해 +{extraFinalDmgPct.toFixed(1)}%</span>}
              {emblemSkillTagBoost > 0 && <span>스킬태그 데미지 추가강화 +{emblemSkillTagBoost.toFixed(1)}% (합산됨)</span>}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
          {/* 강타/이동 */}
          <div className="bg-theme-card border border-theme p-2.5 rounded-xl flex flex-col theme-transition shadow-sm">
            <span className="text-[9px] font-semibold text-rose-600 dark:text-red-400">강타뎀 / 강타쿨</span>
            <span className="text-sm font-black text-theme-main mt-0.5">{sumStats.strongDmg.toFixed(1)}% / {sumStats.strongCd.toFixed(1)}%</span>
          </div>
          <div className="bg-theme-card border border-theme p-2.5 rounded-xl flex flex-col theme-transition shadow-sm">
            <span className="text-[9px] font-semibold text-blue-600 dark:text-blue-400">이동뎀 / 이동쿨</span>
            <span className="text-sm font-black text-theme-main mt-0.5">{sumStats.moveDmg.toFixed(1)}% / {sumStats.moveCd.toFixed(1)}%</span>
          </div>

          {/* 보조/생존 */}
          <div className="bg-theme-card border border-theme p-2.5 rounded-xl flex flex-col theme-transition shadow-sm">
            <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">보조뎀 / 보조쿨</span>
            <span className="text-sm font-black text-theme-main mt-0.5">{sumStats.subDmg.toFixed(1)}% / {sumStats.subCd.toFixed(1)}%</span>
          </div>
          <div className="bg-theme-card border border-theme p-2.5 rounded-xl flex flex-col theme-transition shadow-sm">
            <span className="text-[9px] font-semibold text-amber-600 dark:text-amber-400">생존뎀 / 생존쿨</span>
            <span className="text-sm font-black text-theme-main mt-0.5">{sumStats.saveDmg.toFixed(1)}% / {sumStats.saveCd.toFixed(1)}%</span>
          </div>

          {/* 방해/연타 */}
          <div className="bg-theme-card border border-theme p-2.5 rounded-xl flex flex-col theme-transition shadow-sm">
            <span className="text-[9px] font-semibold text-purple-600 dark:text-purple-400">방해뎀 / 방해쿨</span>
            <span className="text-sm font-black text-theme-main mt-0.5">{sumStats.disableDmg.toFixed(1)}% / {sumStats.disableCd.toFixed(1)}%</span>
          </div>
          <div className="bg-theme-card border border-theme p-2.5 rounded-xl flex flex-col theme-transition shadow-sm">
            <span className="text-[9px] font-semibold text-rose-500 dark:text-rose-450">연타뎀 / 연타쿨</span>
            <span className="text-sm font-black text-theme-main mt-0.5">{sumStats.doubleDmg.toFixed(1)}% / {sumStats.doubleCd.toFixed(1)}%</span>
          </div>

          {/* 소환/원소 */}
          <div className="bg-theme-card border border-theme p-2.5 rounded-xl flex flex-col theme-transition shadow-sm">
            <span className="text-[9px] font-semibold text-sky-600 dark:text-sky-400">소환뎀 / 소환쿨</span>
            <span className="text-sm font-black text-theme-main mt-0.5">{sumStats.summonDmg.toFixed(1)}% / {sumStats.summonCd.toFixed(1)}%</span>
          </div>
          <div className="bg-theme-card border border-theme p-2.5 rounded-xl flex flex-col theme-transition shadow-sm">
            <span className="text-[9px] font-semibold text-indigo-600 dark:text-indigo-400">원소뎀 / 원소쿨</span>
            <span className="text-sm font-black text-theme-main mt-0.5">{sumStats.elementDmg.toFixed(1)}% / {sumStats.elementCd.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* 3줄 완성 권장 가이드 경고 배너 */}
      <div className="bg-amber-500/10 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/40 text-amber-700 dark:text-white text-xs p-3.5 rounded-xl font-bold flex items-center gap-2.5 animate-pulse theme-transition">
        <span>💡</span>
        <span>일괄 프리셋(강이) 적용 시 2줄(강뎀/이뎀)만 기본 설정됩니다. 나머지 3번째 줄 세공 옵션은 직접 클릭하여 3줄을 완성해 주십시오. (3줄 미만 시 소켓이 붉게 점멸합니다.)</span>
      </div>

      {/* 장비 부위별 소켓 리스트 렌더링 구역 */}
      <div className="flex flex-col gap-6">
        {GEM_SLOT_CONFIGS.map(config => {
          const partGems = gems.slice(config.startIndex, config.startIndex + config.count);

          return (
            <div key={config.part} className="bg-theme-subcard/40 border border-theme rounded-2xl p-5 flex flex-col gap-4 theme-transition">
              {/* 장비명 & 장착된 룬 정보 연동 헤더 */}
              <div className="flex justify-between items-center border-b border-theme pb-2.5 theme-transition">
                <h4 className="text-xs font-black text-orange-500 tracking-wider uppercase flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-theme-muted" />
                  {config.part === '장신구' ? '장신구 통합 세공' : `${config.part} 보석 세공`}
                  <span className="text-[11px] text-theme-sub font-bold ml-1.5 bg-theme-card border border-theme px-2.5 py-1 rounded-md leading-none theme-transition">
                    {getRuneNameForPart(config.part)}
                  </span>
                </h4>
                <span className="text-[9px] text-theme-muted font-bold">{config.count}개 소켓 장착됨</span>
              </div>

              {/* 보석 슬롯 카드 그리드 (장신구는 flexbox로 모아 조밀하게 배치 및 세로선 보장) */}
              <div className={config.part === '장신구' 
                ? "flex flex-col md:flex-row items-stretch justify-start gap-4 md:gap-5"
                : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5"
              }>
                {partGems.map((gem, subIdx) => {
                  const globalIdx = config.startIndex + subIdx;
                  const isWarning = gem.grade !== '미장착' && (!gem.options || gem.options.length < 3);
                  const isJangsinGu = config.part === '장신구';

                  return (
                    <React.Fragment key={gem.id}>
                      {/* 장신구 3종 소켓 간 세로선/가로선 분리 (Flexbox 내부에서 높이 가득 채움) */}
                      {isJangsinGu && subIdx > 0 && (
                        <>
                          <div className="hidden md:block w-px bg-theme self-stretch my-1.5 shrink-0 theme-transition" />
                          <div className="block md:hidden h-px bg-theme w-full my-1.5 shrink-0 theme-transition" />
                        </>
                      )}

                      <div
                        className={`p-3.5 rounded-xl border flex flex-col gap-3.5 transition-all hover:border-orange-500/50 card-lift-glow theme-transition ${
                          isJangsinGu ? 'flex-1 w-full md:max-w-[240px]' : ''
                        } ${
                          gem.grade === '미장착' 
                            ? 'bg-theme-main/30 border-theme border-dashed opacity-60' 
                            : isWarning
                              ? 'bg-rose-500/10 border-rose-500/40 dark:bg-red-950/15 dark:border-red-500/40 shadow-md shadow-red-950/5 animate-pulse' // 3줄 미만 시 붉은 경고등 테마 적용
                              : 'bg-theme-card border-theme'
                        }`}
                      >
                        {/* 보석 정보 라벨 및 경고 뱃지 */}
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-theme-sub flex items-center gap-1">
                            <Gem className={`w-3.5 h-3.5 ${
                              gem.grade.includes('순수한') ? 'text-orange-500' :
                              gem.grade.includes('정제된') ? 'text-purple-500' :
                              gem.grade.includes('헬리오도르') ? 'text-blue-500' :
                              gem.grade === '온전한 스타프리즘' ? 'text-purple-500' :
                              gem.grade === '스타프리즘S' ? 'text-blue-500' :
                              gem.grade === '스타프리즘' ? 'text-theme-muted' : 'text-theme-muted'
                            }`} />
                            {getSocketLabel(config.part, subIdx)}
                          </span>
                          {isWarning ? (
                            <span className="text-[8px] bg-rose-500/10 border border-rose-300 dark:bg-red-950/40 dark:border-red-900/40 text-rose-700 dark:text-red-400 px-1 rounded font-bold leading-none animate-pulse">
                              옵션 {gem.options?.length || 0}/3
                            </span>
                          ) : (
                            gem.grade !== '미장착' && (
                              <span className="text-[8px] bg-emerald-500/10 border border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-1 rounded font-bold leading-none">
                                완료 3/3
                              </span>
                            )
                          )}
                        </div>

                        {/* 등급 셀렉터 (소켓 index에 특수 보석 드롭다운 조건부 필터 노출) */}
                        <select
                          value={gem.grade}
                          onChange={(e) => onGemChange(globalIdx, 'grade', e.target.value)}
                          className="bg-theme-subcard border border-theme rounded px-2 py-0.5 text-[10px] text-theme-main font-extrabold focus:outline-none theme-transition"
                        >
                          {getGradeOptions(globalIdx)}
                        </select>

                        {/* 세공 옵션 다중 토글 (16대 세공 옵션 4x4 그리드 배치) */}
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[9px] text-theme-muted font-bold leading-none">옵션 다중 선택 (최대 3개)</span>
                          <div className="grid grid-cols-4 gap-1">
                            {optionTypes.map(opt => {
                              const opts = gem.options || [];
                              const isActive = opts.includes(opt.value);
                              const isDisabled = gem.grade === '미장착';

                              return (
                                <button
                                  key={opt.value}
                                  type="button"
                                  disabled={isDisabled}
                                  onClick={() => handleOptionClick(globalIdx, opt.value, gem.options)}
                                  title={opt.desc}
                                  className={`py-1 rounded text-[9px] font-bold transition-all border leading-none theme-transition ${
                                    isDisabled 
                                      ? 'bg-theme-main/10 border-theme text-theme-muted/40 cursor-not-allowed'
                                      : isActive
                                        ? 'bg-orange-500 border-transparent text-white font-black shadow-md'
                                        : 'bg-theme-subcard border-theme text-theme-sub hover:text-theme-main hover:bg-theme-card'
                                  }`}
                                >
                                  {opt.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* 가이드 메시지 */}
      <div className="bg-theme-subcard border border-theme rounded-xl p-4 flex gap-2.5 items-start theme-transition">
        <ShieldAlert className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
        <span className="text-[10px] text-theme-sub leading-normal">
          마비노기 모바일 격투가 장비 세공의 22개 소켓 구조를 1:1 완벽 이식했습니다. 방해 및 생존 계열 보석을 공란으로 두길 원할 시, 옵션 버튼을 한 번 더 클릭하여 비활성화(회색) 상태로 두시면 최종 DPS 연산 대상에서 자동으로 제외 처리됩니다.
        </span>
      </div>

    </div>
  );
}


