import React from 'react';
import { Gem, ArrowRight, ShieldAlert, Sparkles, RefreshCw, Layers } from 'lucide-react';

export default function GemStonePanel({ gems, onGemChange, setGems, selectedRunes }) {
  
  // 보석 등급별 고정 세공 증가율 계수
  const gradeValues = {
    '스타프리즘': { dmg: 2.00, cd: 0.65 },
    '스타프리즘S': { dmg: 2.10, cd: 0.70 },
    '온전한 스타프리즘': { dmg: 2.20, cd: 0.75 }
  };

  // 장비별 소켓 배치 구성표 (합계 22소켓 규격 완벽 싱크)
  const GEM_SLOT_CONFIGS = [
    { part: '무기', count: 3, startIndex: 0 },
    { part: '장신구(목걸이)', count: 1, startIndex: 3 },
    { part: '장신구(반지1)', count: 1, startIndex: 4 },
    { part: '장신구(반지2)', count: 1, startIndex: 5 },
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
    let name = '';
    
    if (part === '무기') name = selectedRunes['무기']?.[0]?.name;
    else if (part === '장신구(목걸이)') name = selectedRunes['장신구']?.[0]?.name;
    else if (part === '장신구(반지1)') name = selectedRunes['장신구']?.[1]?.name;
    else if (part === '장신구(반지2)') name = selectedRunes['장신구']?.[2]?.name;
    else if (part === '엠블럼') name = selectedRunes['엠블럼']?.[0]?.name;
    else if (part === '방어구1') name = selectedRunes['방어구']?.[0]?.name;
    else if (part === '방어구2') name = selectedRunes['방어구']?.[1]?.name;
    else if (part === '방어구3') name = selectedRunes['방어구']?.[2]?.name;
    else if (part === '방어구4') name = selectedRunes['방어구']?.[3]?.name;
    else if (part === '방어구5') name = selectedRunes['방어구']?.[4]?.name;

    return name ? ` - ${name}` : ' - 룬 미장착';
  };

  // 22개 보석 인벤토리 실시간 합산 현황 연산
  const getSumStats = () => {
    const stats = {
      strongDmg: 0.0, strongCd: 0.0,
      moveDmg: 0.0, moveCd: 0.0,
      subDmg: 0.0, subCd: 0.0
    };

    gems.forEach(gem => {
      if (gem.grade === '미장착' || !gem.option) return;
      const values = gradeValues[gem.grade];
      if (!values) return;

      if (gem.option === '강뎀') stats.strongDmg += values.dmg;
      else if (gem.option === '강쿨') stats.strongCd += values.cd;
      else if (gem.option === '이뎀') stats.moveDmg += values.dmg;
      else if (gem.option === '이쿨') stats.moveCd += values.cd;
      else if (gem.option === '보뎀') stats.subDmg += values.dmg;
      else if (gem.option === '보쿨') stats.subCd += values.cd;
    });

    // 소수점 둘째자리 반올림
    Object.keys(stats).forEach(k => {
      stats[k] = parseFloat(stats[k].toFixed(2));
    });
    return stats;
  };

  const sumStats = getSumStats();

  // 프리셋 설정 도우미 (22개 보석 일괄 세팅)
  const applyPreset = (presetType) => {
    if (presetType === 'perfectStarPrism') {
      setGems(
        Array.from({ length: 22 }, (_, idx) => ({
          id: idx + 1,
          grade: '온전한 스타프리즘',
          option: '강뎀'
        }))
      );
    } else if (presetType === 'starPrismS') {
      setGems(
        Array.from({ length: 22 }, (_, idx) => ({
          id: idx + 1,
          grade: '스타프리즘S',
          option: '강뎀'
        }))
      );
    } else if (presetType === 'starPrism') {
      setGems(
        Array.from({ length: 22 }, (_, idx) => ({
          id: idx + 1,
          grade: '스타프리즘',
          option: '강뎀'
        }))
      );
    } else if (presetType === 'clearOptions') {
      setGems(prev => prev.map(gem => ({ ...gem, option: '' })));
    } else if (presetType === 'reset') {
      setGems(
        Array.from({ length: 22 }, (_, idx) => ({
          id: idx + 1,
          grade: '미장착',
          option: ''
        }))
      );
    }
  };

  // 6대 세공 옵션 종류
  const optionTypes = [
    { label: '강뎀', value: '강뎀', desc: '강타 데미지' },
    { label: '이뎀', value: '이뎀', desc: '이동 데미지' },
    { label: '보뎀', value: '보뎀', desc: '보조 데미지' },
    { label: '강쿨', value: '강쿨', desc: '강타 쿨감' },
    { label: '이쿨', value: '이쿨', desc: '이동 쿨감' },
    { label: '보쿨', value: '보쿨', desc: '보조 쿨감' }
  ];

  // 각 등급별 데미/쿨감 수치 안내 가이드
  const getStatInfoString = (grade) => {
    if (grade === '미장착') return '스탯 없음';
    const vals = gradeValues[grade];
    return `뎀+${vals.dmg}% / 쿨감+${vals.cd}%`;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-6 w-full max-w-7xl mx-auto">
      
      {/* 타이틀 및 퀵 가이드 */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Gem className="w-6 h-6 text-mabi-red animate-pulse" />
            보석 세공 인벤토리 관리
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            22개의 소켓 보석을 장비 부위별로 지정합니다. 장착한 장비 룬의 이름이 헤더에 실시간으로 표시됩니다.
          </p>
        </div>

        {/* 프리셋 버튼 그룹 */}
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => applyPreset('perfectStarPrism')}
            className="px-3 py-1.5 bg-purple-950/30 hover:bg-purple-900/40 border border-purple-800/40 rounded-lg text-[10px] font-bold text-purple-300 transition-all active:scale-95"
          >
            온전한 스타 일괄 (강뎀)
          </button>
          <button
            onClick={() => applyPreset('starPrismS')}
            className="px-3 py-1.5 bg-blue-950/30 hover:bg-blue-900/40 border border-blue-800/40 rounded-lg text-[10px] font-bold text-blue-300 transition-all active:scale-95"
          >
            스타S 일괄 (강뎀)
          </button>
          <button
            onClick={() => applyPreset('starPrism')}
            className="px-3 py-1.5 bg-slate-950/50 hover:bg-slate-800/50 border border-slate-700/50 rounded-lg text-[10px] font-bold text-slate-350 transition-all active:scale-95"
          >
            스타 일괄 (강뎀)
          </button>
          <button
            onClick={() => applyPreset('clearOptions')}
            className="px-3 py-1.5 bg-amber-950/20 hover:bg-amber-900/30 border border-amber-900/30 rounded-lg text-[10px] font-bold text-amber-400 transition-all active:scale-95 flex items-center gap-1"
          >
            <RefreshCw className="w-2.5 h-2.5" />
            옵션만 일괄 비우기
          </button>
          <button
            onClick={() => applyPreset('reset')}
            className="px-3 py-1.5 bg-red-950/20 hover:bg-red-900/30 border border-red-900/30 rounded-lg text-[10px] font-bold text-red-400 transition-all active:scale-95"
          >
            전체 미장착
          </button>
        </div>
      </div>

      {/* 세공 실시간 합산 현황 보드 */}
      <div className="bg-slate-950/60 border border-slate-850 rounded-2xl p-5">
        <h4 className="text-xs font-black text-slate-400 mb-4 flex items-center gap-1.5 uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          세공 합산 스탯 총합 보드
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {/* 강타 계열 */}
          <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl flex flex-col gap-0.5">
            <span className="text-[10px] font-semibold text-red-400">강타 데미지</span>
            <span className="text-lg font-black text-slate-100">{sumStats.strongDmg.toFixed(2)}%</span>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl flex flex-col gap-0.5">
            <span className="text-[10px] font-semibold text-red-400">강타 쿨타임 감소</span>
            <span className="text-lg font-black text-slate-100">{sumStats.strongCd.toFixed(2)}%</span>
          </div>

          {/* 이동 계열 */}
          <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl flex flex-col gap-0.5">
            <span className="text-[10px] font-semibold text-blue-400">이동 데미지</span>
            <span className="text-lg font-black text-slate-100">{sumStats.moveDmg.toFixed(2)}%</span>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl flex flex-col gap-0.5">
            <span className="text-[10px] font-semibold text-blue-400">이동 쿨타임 감소</span>
            <span className="text-lg font-black text-slate-100">{sumStats.moveCd.toFixed(2)}%</span>
          </div>

          {/* 보조 계열 */}
          <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl flex flex-col gap-0.5">
            <span className="text-[10px] font-semibold text-emerald-400">보조 데미지</span>
            <span className="text-lg font-black text-slate-100">{sumStats.subDmg.toFixed(2)}%</span>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl flex flex-col gap-0.5">
            <span className="text-[10px] font-semibold text-emerald-400">보조 쿨타임 감소</span>
            <span className="text-lg font-black text-slate-100">{sumStats.subCd.toFixed(2)}%</span>
          </div>
        </div>
      </div>

      {/* 장비 부위별 소켓 리스트 렌더링 구역 */}
      <div className="flex flex-col gap-6">
        {GEM_SLOT_CONFIGS.map(config => {
          // 해당 장비에 연계된 보석 슬롯만 필터링해옴
          const partGems = gems.slice(config.startIndex, config.startIndex + config.count);

          return (
            <div key={config.part} className="bg-slate-950/40 border border-slate-850 rounded-2xl p-5 flex flex-col gap-4">
              {/* 장비명 & 장착된 룬 정보 연동 헤더 */}
              <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
                <h4 className="text-xs font-black text-mabi-accent tracking-wider uppercase flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-slate-500" />
                  {config.part}
                  <span className="text-xs text-slate-350 font-bold ml-1.5 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md leading-none">
                    {getRuneNameForPart(config.part)}
                  </span>
                </h4>
                <span className="text-[9px] text-slate-500 font-bold">{config.count}개 소켓 장착됨</span>
              </div>

              {/* 보석 슬롯 카드 그리드 (해당 장비 부위 하위에만 나열) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
                {partGems.map((gem, subIdx) => {
                  const globalIdx = config.startIndex + subIdx;

                  return (
                    <div
                      key={gem.id}
                      className={`p-3.5 rounded-xl border flex flex-col gap-3.5 transition-all hover:border-slate-700 ${
                        gem.grade === '미장착' 
                          ? 'bg-slate-950/20 border-slate-900 border-dashed opacity-60' 
                          : 'bg-slate-900/80 border-slate-800'
                      }`}
                    >
                      {/* 보석 정보 라벨 */}
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-350 flex items-center gap-1">
                          <Gem className={`w-3.5 h-3.5 ${
                            gem.grade === '온전한 스타프리즘' ? 'text-purple-400' :
                            gem.grade === '스타프리즘S' ? 'text-blue-400' :
                            gem.grade === '스타프리즘' ? 'text-slate-400' : 'text-slate-650'
                          }`} />
                          소켓 #{subIdx + 1}
                        </span>
                        <span className="text-[9px] text-slate-500 font-semibold leading-none">
                          {getStatInfoString(gem.grade)}
                        </span>
                      </div>

                      {/* 등급 셀렉터 */}
                      <select
                        value={gem.grade}
                        onChange={(e) => onGemChange(globalIdx, 'grade', e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-[10px] text-slate-300 font-extrabold focus:outline-none"
                      >
                        <option value="미장착">❌ 미장착</option>
                        <option value="스타프리즘">💎 스타프리즘 (2.0%)</option>
                        <option value="스타프리즘S">💎 스타프리즘S (2.1%)</option>
                        <option value="온전한 스타프리즘">💎 온전한 스타프리즘 (2.2%)</option>
                      </select>

                      {/* 세공 옵션 토글 버튼 */}
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[9px] text-slate-500 font-bold leading-none">세공 옵션 선택</span>
                        <div className="grid grid-cols-3 gap-1">
                          {optionTypes.map(opt => {
                            const isActive = gem.option === opt.value;
                            const isDisabled = gem.grade === '미장착';

                            return (
                              <button
                                key={opt.value}
                                type="button"
                                disabled={isDisabled}
                                onClick={() => {
                                  const nextOption = isActive ? '' : opt.value;
                                  onGemChange(globalIdx, 'option', nextOption);
                                }}
                                title={opt.desc}
                                className={`py-1 rounded text-[10px] font-bold transition-all border ${
                                  isDisabled 
                                    ? 'bg-slate-900/10 border-slate-950 text-slate-700 cursor-not-allowed'
                                    : isActive
                                      ? 'bg-mabi-accent border-transparent text-slate-950 font-black shadow-md'
                                      : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                                }`}
                              >
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* 가이드 메시지 */}
      <div className="bg-slate-950/50 border border-slate-850 rounded-xl p-4 flex gap-2.5 items-start">
        <ShieldAlert className="w-4 h-4 text-mabi-red shrink-0 mt-0.5" />
        <span className="text-[10px] text-slate-400 leading-normal">
          마비노기 모바일 격투가 장비 세공의 22개 소켓 구조를 1:1 완벽 이식했습니다. 방해 및 생존 계열 보석을 공란으로 두길 원할 시, 옵션 버튼을 한 번 더 클릭하여 비활성화(회색) 상태로 두시면 최종 DPS 연산 대상에서 자동으로 제외 처리됩니다.
        </span>
      </div>

    </div>
  );
}
