import React, { useState, useMemo } from 'react';
import { Search, Copy, RotateCcw, Sliders, Info, CheckCircle } from 'lucide-react';
import { parseRuneMarkdown } from '../utils/runeMdParser';
import mdText from '../../results/260708_룬설명목록.md?raw';

const STAT_COLUMNS = [
  { key: "공격력%", label: "공격력", isPercent: true },
  { key: "조건부공증%", label: "조건부공증", isPercent: true },
  { key: "주는피해%", label: "주는피해", isPercent: true },
  { key: "강타피해%", label: "강타피해", isPercent: true },
  { key: "연타피해%", label: "연타피해", isPercent: true },
  { key: "추가타피해%", label: "추가타피해", isPercent: true },
  { key: "치명타피해%", label: "치명타피해", isPercent: true },
  { key: "스킬피해%", label: "스킬피해", isPercent: true },
  { key: "추가타확률%", label: "추가타확률", isPercent: true },
  { key: "치명타확률%", label: "치명타확률", isPercent: true },
  { key: "스킬속도%", label: "스킬속도", isPercent: true },
  { key: "재사용회복%", label: "재사용회복", isPercent: true },
  { key: "최종피해%", label: "최종피해", isPercent: true },
  { key: "가동률", label: "가동률", isPercent: false },
  { key: "마도저항", label: "마도저항", isPercent: false }
];

export default function RuneAuditDashboard({ runes, onRunesUpdate }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'MATCH' | 'MISMATCH' | 'MISSING' | 'CUSTOMIZED'
  const [copySuccess, setCopySuccess] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // 1. 마스터 마크다운 파싱 결과 생성 (읽기 전용 기준 스탯)
  const parsedRunes = useMemo(() => {
    return parseRuneMarkdown(mdText);
  }, []);

  // 2. 파싱된 마스터 룬 정보와 현재 활성화된 runes 데이터 대조 및 종합 상태 생성
  const auditList = useMemo(() => {
    return parsedRunes.map(parsed => {
      // 이름으로 현재 활성화된 룬 탐색
      const existing = runes.find(r => r.name.replace(/\+/g, '').trim() === parsed.name.replace(/\+/g, '').trim()) || 
                       runes.find(r => r.name === parsed.name);
      
      let status = 'MISSING'; // 기본값: 누락
      const mismatches = [];
      let isCustomized = false;

      if (existing) {
        status = 'MATCH';
        
        // 스탯 검수 및 커스텀 여부 판단 (마스터 파싱값과 실제 값이 다른가?)
        STAT_COLUMNS.forEach(col => {
          const parsedVal = parsed.stats[col.key] || 0;
          const currentVal = existing.stats[col.key] || 0;
          
          if (Math.abs(parsedVal - currentVal) > 0.0001) {
            status = 'MISMATCH';
            isCustomized = true;
            mismatches.push({
              key: col.key,
              parsed: parsedVal,
              current: currentVal
            });
          }
        });
      }

      return {
        name: parsed.name,
        type: parsed.type,
        element: parsed.element,
        cleaned_text: parsed.cleaned_text,
        parsedStats: parsed.stats,
        existingRune: existing,
        status,
        isCustomized,
        mismatches
      };
    });
  }, [parsedRunes, runes]);

  // 3. 통계 데이터 계산
  const statsSummary = useMemo(() => {
    const totalMd = auditList.length;
    const totalJson = runes.length;
    const matchCount = auditList.filter(item => item.status === 'MATCH').length;
    const mismatchCount = auditList.filter(item => item.status === 'MISMATCH').length;
    const missingCount = auditList.filter(item => item.status === 'MISSING').length;

    return {
      totalMd,
      totalJson,
      matchCount,
      mismatchCount,
      missingCount
    };
  }, [auditList, runes]);

  // 4. 셀 값 개별 인라인 수정 핸들러
  const handleStatChange = (runeName, statKey, valueStr, isPercent) => {
    setIsUpdating(true);
    let newVal = parseFloat(valueStr);
    if (isNaN(newVal)) newVal = 0.0;
    
    // 백분율 수치 입력 보정 (유저가 화면에 16 입력 시 내부적으로 0.16 저장)
    if (isPercent) {
      newVal = newVal / 100.0;
    }

    const updated = runes.map(r => {
      // 룬 이름이 같으면 해당 스탯만 갱신
      if (r.name.replace(/\+/g, '').trim() === runeName.replace(/\+/g, '').trim() || r.name === runeName) {
        return {
          ...r,
          stats: {
            ...r.stats,
            [statKey]: newVal
          }
        };
      }
      return r;
    });

    onRunesUpdate(updated);
    setTimeout(() => setIsUpdating(false), 450);
  };

  // 5. 마스터 마크다운 설명글 기반 스탯 자동 복원 / 싱크 핸들러
  const handleResetToMaster = () => {
    if (!window.confirm('정말로 모든 수동 수정 내역을 버리고, 마크다운 마스터 설명글에서 파싱된 최신 기본 스탯으로 전체 초기화(복원)하시겠습니까?\n\n(기존에 누락되었던 장신구 및 엠블럼 룬들도 기본 가동률로 자동 복구됩니다)')) {
      return;
    }

    setIsUpdating(true);
    const updatedRunes = [...runes];

    auditList.forEach(item => {
      if (item.status === 'MISSING') {
        // 누락 룬 생성 추가
        const newRune = {
          file: `MabinogiMobile_${Math.random().toString(36).substring(2, 12)}.png`,
          type: item.type,
          name: item.name,
          element: item.element,
          raw_text: item.cleaned_text,
          cleaned_text: item.cleaned_text,
          stats: {
            ...item.parsedStats,
            "가동률": item.type === '장신구' ? 1.0 : (item.name.match(/(흐릿한|잿빛|금 간|무너진|복수|거두는|부서진|흐릿|잿빛)/) ? 0.7 : 1.0),
            "공격력": item.type === '무기' ? 1038.0 : 0.0,
            "방어력": item.type === '방어구' ? 445.0 : 0.0,
            "마도저항": item.type === '무기' ? 300.0 : (item.type === '방어구' ? 300.0 : 0.0),
            "모든스킬강화": 1.0,
            "임의스킬강화": 2.0
          },
          description: item.cleaned_text[0] || `${item.name} 효과`
        };
        updatedRunes.push(newRune);
      } else {
        // 기존 룬은 마크다운 파싱 스탯으로 리셋
        const index = updatedRunes.findIndex(r => r.name === item.existingRune.name);
        if (index !== -1) {
          const target = { ...updatedRunes[index] };
          target.stats = { ...target.stats };
          
          STAT_COLUMNS.forEach(col => {
            target.stats[col.key] = item.parsedStats[col.key] || 0.0;
          });
          
          target.cleaned_text = item.cleaned_text;
          updatedRunes[index] = target;
        }
      }
    });

    onRunesUpdate(updatedRunes);
    setTimeout(() => {
      setIsUpdating(false);
      alert('마스터 설명글 기반으로 룬 데이터베이스 초기화 및 자동 복구 완료!');
    }, 450);
  };

  // 6. JSON 전체 내보내기/복사
  const handleCopyJson = () => {
    const cleanExport = runes.map(r => {
      const { transcendLevel: _, ...rest } = r;
      return rest;
    });

    navigator.clipboard.writeText(JSON.stringify(cleanExport, null, 2))
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch(err => {
        console.error('클립보드 복사 실패:', err);
      });
  };

  // 7. 필터링 로직
  const filteredList = useMemo(() => {
    return auditList.filter(item => {
      const nameMatch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.cleaned_text.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const typeMatch = selectedTypeFilter === 'ALL' || item.type === selectedTypeFilter;
      
      let statusMatch = true;
      if (statusFilter === 'MATCH') statusMatch = item.status === 'MATCH' && !item.isCustomized;
      else if (statusFilter === 'MISMATCH') statusMatch = item.status === 'MISMATCH';
      else if (statusFilter === 'MISSING') statusMatch = item.status === 'MISSING';
      else if (statusFilter === 'CUSTOMIZED') statusMatch = item.isCustomized;

      return nameMatch && typeMatch && statusMatch;
    });
  }, [auditList, searchTerm, selectedTypeFilter, statusFilter]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-6 animate-fadeIn text-slate-200">
      
      {/* 타이틀 영역 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Sliders className="w-5.5 h-5.5 text-mabi-accent" />
            룬 스탯 교정실 (Rune Customizer)
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            룬설명 마스터 문장을 기반으로 각 룬의 연동 스탯을 실시간 교정 및 직접 커스텀하여 DPS 시뮬레이터에 적용합니다.
          </p>
        </div>

        {/* 상단 액션 버튼 그룹 및 상태 라이트 */}
        <div className="flex items-center gap-4 self-stretch md:self-auto justify-between">
          <div className="flex items-center gap-2 text-xs bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800">
            <span className={`w-2.5 h-2.5 rounded-full ${isUpdating ? 'bg-amber-400 animate-ping' : 'bg-emerald-500'} transition-all`} />
            <span className="font-semibold text-slate-400">
              {isUpdating ? '계산기 스탯 동기화 중...' : '시뮬레이터 실시간 반영 중'}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleResetToMaster}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
              title="수동 변경된 값을 마스터 설명글 기준 기본 스탯으로 복원합니다."
            >
              <RotateCcw className="w-4 h-4" />
              마스터 기본값 복원
            </button>
            <button
              onClick={handleCopyJson}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md ${
                copySuccess 
                  ? 'bg-blue-600 text-slate-100' 
                  : 'bg-mabi-accent text-slate-950 hover:bg-amber-400 shadow-amber-950/20'
              }`}
            >
              {copySuccess ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copySuccess ? '복사 완료!' : '교정된 JSON 설정값 복사'}
            </button>
          </div>
        </div>
      </div>

      {/* 게이머 친화적 가이드 및 팁 박스 */}
      <div className="bg-slate-950/40 border border-slate-800/80 p-4 rounded-xl flex gap-3 text-xs leading-relaxed text-slate-300">
        <Info className="w-5 h-5 text-mabi-accent flex-shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1.5">
          <p className="font-semibold text-slate-200">💡 룬 스탯 교정실 안내:</p>
          <p>
            본 교정실의 기본 스탯 데이터는 <span className="text-emerald-400 font-mono">results/260708_룬설명목록.md</span> 마스터 문서에 수동 정제 완료된 실제 게임 내 룬 효과 설명과 <strong>100% 일치하도록 검증 및 동기화가 완료된 상태</strong>입니다. 따라서 일반적인 상황에서는 스탯 수치를 굳이 직접 수정(교정)하실 필요가 없습니다.
          </p>
          <p>
            다만, <strong>직접 피해(깡피해)를 주는 룬들의 경우</strong>(예: 암운+, 부패+, 악몽, 아귀, 초월, 침묵 등 설명문에 고정 피해 수치가 들어있는 룬들) 인게임 깡데미지가 유저의 기본 공격력이나 레벨 스펙에 비례해 변동되므로, 필요에 따라 <strong>직피 데미지 수치(가장 우측의 깡공격력/가동률 등) 정도만 직접 수정하여</strong> 시뮬레이션해 보시는 것을 권장합니다.
          </p>
        </div>
      </div>

      {/* 대시보드 요약 메트릭 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-slate-950/40 border border-slate-800/80 p-3 rounded-xl flex flex-col justify-center">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">마스터 마크다운 룬</span>
          <span className="text-lg font-extrabold text-slate-200 mt-0.5">{statsSummary.totalMd} 개</span>
        </div>
        <div className="bg-slate-950/40 border border-slate-800/80 p-3 rounded-xl flex flex-col justify-center">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">현재 JSON 룬 총합</span>
          <span className="text-lg font-extrabold text-slate-200 mt-0.5">{statsSummary.totalJson} 개</span>
        </div>
        <div className="bg-slate-900 border border-emerald-950/80 p-3 rounded-xl flex flex-col justify-center">
          <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">설명글 일치</span>
          <span className="text-lg font-extrabold text-emerald-400 mt-0.5">{statsSummary.matchCount} 개</span>
        </div>
        <div className="bg-slate-900 border border-amber-950/80 p-3 rounded-xl flex flex-col justify-center">
          <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">수정됨 (커스텀)</span>
          <span className="text-lg font-extrabold text-amber-400 mt-0.5">{statsSummary.mismatchCount} 개</span>
        </div>
        <div className="bg-slate-900 border border-rose-950/80 p-3 rounded-xl flex flex-col justify-center">
          <span className="text-[10px] font-semibold text-rose-400 uppercase tracking-wider">JSON 누락 (자동생성 대상)</span>
          <span className="text-lg font-extrabold text-rose-400 mt-0.5">{statsSummary.missingCount} 개</span>
        </div>
      </div>

      {/* 필터 및 검색 컨트롤 */}
      <div className="flex flex-col md:flex-row gap-4 bg-slate-950/30 p-4 rounded-xl border border-slate-800/60">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="룬 이름 또는 설명 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs focus:outline-none focus:border-mabi-accent text-slate-200 transition-colors"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-bold text-slate-300 focus:outline-none focus:border-mabi-accent"
          >
            <option value="ALL">모든 부위</option>
            <option value="무기">⚔️ 무기</option>
            <option value="방어구">🛡️ 방어구</option>
            <option value="장신구">💍 장신구</option>
            <option value="엠블럼">🎖️ 엠블럼</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-bold text-slate-300 focus:outline-none focus:border-mabi-accent"
          >
            <option value="ALL">모든 상태</option>
            <option value="MATCH">✅ 마스터 기본상태</option>
            <option value="CUSTOMIZED">🛠️ 수동 수정됨 (커스텀)</option>
            <option value="MISSING">❌ JSON 누락</option>
          </select>
        </div>
      </div>

      {/* 룬 스탯 편집용 테이블 그리드 (가로 스크롤 & 룬 이름 열 sticky 고정) */}
      <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/20 max-h-[600px] overflow-y-auto">
        <table className="w-full border-collapse text-left text-xs text-slate-300 min-w-[1500px]">
          <thead>
            <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold sticky top-0 z-20">
              <th className="p-3 w-48 sticky left-0 bg-slate-950 z-30 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.5)]">룬 정보</th>
              {STAT_COLUMNS.map(col => (
                <th key={col.key} className="p-3 text-center w-28 border-l border-slate-800/80">
                  <div className="flex flex-col items-center justify-center gap-0.5">
                    <span className="text-slate-200">{col.label}</span>
                    <span className="text-[9px] text-slate-500 font-medium font-mono">
                      {col.isPercent ? '백분율 (%)' : '깡스탯'}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredList.length === 0 ? (
              <tr>
                <td colSpan={STAT_COLUMNS.length + 1} className="p-8 text-center text-slate-500 font-medium">
                  조건에 부합하는 룬 목록이 없습니다.
                </td>
              </tr>
            ) : (
              filteredList.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-900/10 transition-colors">
                  
                  {/* 룬 정보 열 (Sticky 고정) */}
                  <td className="p-3 sticky left-0 bg-slate-900/90 backdrop-blur-sm z-10 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.5)] border-r border-slate-800/50">
                    <div className="flex flex-row items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-bold text-slate-100 whitespace-nowrap">{item.name}</span>
                      {item.status === 'MISSING' && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-950 text-rose-400 border border-rose-900">
                          누락
                        </span>
                      )}
                      <span className="px-1.5 py-0.2 bg-slate-850 border border-slate-700 text-slate-400 rounded text-[9px] font-bold">
                        {item.type}
                      </span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${
                        item.element === '빛' ? 'bg-amber-950/20 border-amber-900 text-amber-400' :
                        item.element === '어둠' ? 'bg-purple-950/20 border-purple-900 text-purple-400' :
                        item.element === '용' ? 'bg-rose-950/20 border-rose-900 text-rose-400' :
                        'bg-slate-800/20 border-slate-700 text-slate-500'
                      }`}>
                        {item.element}
                      </span>
                    </div>
                  </td>

                  {/* 각 스탯 컬럼 및 수정 입력 필드 */}
                  {STAT_COLUMNS.map(col => {
                    // 현재 활성화된 룬의 스탯 값
                    const currentVal = item.existingRune ? (item.existingRune.stats[col.key] || 0.0) : (item.parsedStats[col.key] || 0.0);
                    // 마스터 마크다운의 파싱 기본 스탯 값
                    const masterVal = item.parsedStats[col.key] || 0.0;
                    
                    // 스탯 활성 조건 판단 (기본값이나 현재값이 0이 아닌 수치이거나, 혹은 가동률은 무조건 활성)
                    const isActive = Math.abs(masterVal) > 0.0001 || Math.abs(currentVal) > 0.0001 || col.key === '가동률';
                    
                    // 수동 수정 여부 판단 (마스터 파싱값과 다름)
                    const isCustomCell = Math.abs(masterVal - currentVal) > 0.0001;

                    // 인풋에 표기할 값 (백분율 스탯은 곱하기 100)
                    const displayVal = col.isPercent ? (currentVal * 100).toFixed(1) : currentVal;

                    return (
                      <td 
                        key={col.key} 
                        className={`p-1.5 border-l border-slate-850 text-center transition-all ${
                          isActive 
                            ? 'bg-emerald-950/15 hover:bg-emerald-950/25' 
                            : 'opacity-40 hover:opacity-100 bg-slate-950/10'
                        }`}
                      >
                        <div className="flex flex-col items-center justify-center gap-1">
                          <input
                            type="number"
                            step={col.isPercent ? "0.1" : "1"}
                            disabled={item.status === 'MISSING'} // 누락된 룬은 먼저 싱크를 맞춰서 추가해야 수정 가능
                            value={item.status === 'MISSING' ? (col.isPercent ? (masterVal * 100).toFixed(1) : masterVal) : displayVal}
                            onChange={(e) => handleStatChange(item.name, col.key, e.target.value, col.isPercent)}
                            className={`w-20 text-center py-1 bg-transparent text-xs font-mono font-bold rounded focus:outline-none transition-all ${
                              item.status === 'MISSING' ? 'text-slate-600 cursor-not-allowed' :
                              isCustomCell 
                                ? 'text-amber-400 bg-amber-950/30 border border-amber-500/50 shadow-inner' 
                                : isActive 
                                  ? 'text-emerald-300 focus:bg-slate-900 focus:border focus:border-emerald-500/60' 
                                  : 'text-slate-500 focus:bg-slate-900 focus:text-slate-200 focus:border focus:border-slate-700'
                            }`}
                            placeholder="0"
                            title={isCustomCell ? `마스터 기본값: ${col.isPercent ? (masterVal * 100).toFixed(1) + '%' : masterVal}` : `기본값`}
                          />
                          
                          {/* 스탯 변경 시 마스터 값과 미세하게 다른 경우 뱃지 제공 */}
                          {isCustomCell && !col.isPercent && (
                            <span className="text-[8px] text-amber-500 font-bold">
                              (원래: {masterVal})
                            </span>
                          )}
                          {isCustomCell && col.isPercent && (
                            <span className="text-[8px] text-amber-500 font-bold">
                              (원래: {(masterVal * 100).toFixed(1)}%)
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
