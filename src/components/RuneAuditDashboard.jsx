import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, CheckCircle, Copy, Info, RotateCcw, Search, Sliders, X } from 'lucide-react';
import { parseRuneMarkdown } from '../utils/runeMdParser';
import mdText from '../../results/260814_룬설명목록.md?raw';

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

export default function RuneAuditDashboard({ runes, onRunesUpdate, selectedRunes }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'EQUIPPED' | 'MATCH' | 'MISMATCH' | 'MISSING' | 'CUSTOMIZED'
  const [copySuccess, setCopySuccess] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedDictionaryRune, setSelectedDictionaryRune] = useState(null);
  const dictionaryTriggerRef = useRef(null);
  const dictionaryCloseButtonRef = useRef(null);

  useEffect(() => {
    if (!selectedDictionaryRune) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeDictionary();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    dictionaryCloseButtonRef.current?.focus();

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedDictionaryRune]);

  const openDictionary = (rune, trigger) => {
    dictionaryTriggerRef.current = trigger;
    setSelectedDictionaryRune(rune);
  };

  const closeDictionary = () => {
    setSelectedDictionaryRune(null);
    window.setTimeout(() => dictionaryTriggerRef.current?.focus(), 0);
  };

  // 0. 현재 장착 중인 룬 이름 목록 세트 수집
  const equippedRuneNames = useMemo(() => {
    const names = new Set();
    if (selectedRunes) {
      Object.values(selectedRunes).forEach(arr => {
        if (arr) {
          arr.forEach(r => {
            if (r && r.name) {
              const name = r.name.trim();
              names.add(name);
              names.add(name.replace(/\+/g, '').trim());
            }
          });
        }
      });
    }
    return names;
  }, [selectedRunes]);

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

      // 장착 중인지 여부 감지
      const isEquipped = equippedRuneNames.has(parsed.name.trim()) || 
                         equippedRuneNames.has(parsed.name.replace(/\+/g, '').trim());

      return {
        name: parsed.name,
        type: parsed.type,
        element: parsed.element,
        cleaned_text: parsed.cleaned_text,
        parsedStats: parsed.stats,
        existingRune: existing,
        status,
        isCustomized,
        mismatches,
        isEquipped,
        effectModelVersion: existing?.effectModelVersion ?? 1,
        conditionalEffects: existing?.conditionalEffects ?? []
      };
    });
  }, [parsedRunes, runes, equippedRuneNames]);

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
  const handleSyncMissingFromMaster = () => {
    if (!window.confirm("마스터 설명에는 있으나 현재 데이터에 없는 룬만 추가합니다. 기존 수동 보정 수치와 가동률은 변경하지 않습니다. 계속하시겠습니까?")) {
      return;
    }

    setIsUpdating(true);
    const updatedRunes = [...runes];
    auditList.filter((item) => item.status === "MISSING").forEach((item) => {
      updatedRunes.push({
        file: `MabinogiMobile_${Math.random().toString(36).substring(2, 12)}.png`,
        type: item.type,
        name: item.name,
        element: item.element,
        raw_text: item.cleaned_text,
        cleaned_text: item.cleaned_text,
        stats: {
          ...item.parsedStats,
          "가동률": item.parsedStats["가동률"] ?? 1.0,
          "공격력": item.type === "무기" ? 1038.0 : 0.0,
          "방어력": item.type === "방어구" ? 445.0 : 0.0,
          "마도저항": item.type === "엠블럼" ? 0.0 : 300.0,
          "모든스킬강화": 1.0,
          "임의스킬강화": 2.0
        },
        description: item.cleaned_text.join("\n")
      });
    });

    onRunesUpdate(updatedRunes);
    setTimeout(() => {
      setIsUpdating(false);
      alert("누락 룬 동기화가 완료되었습니다. 기존 수동 보정과 가동률은 유지되었습니다.");
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
      if (statusFilter === 'EQUIPPED') statusMatch = item.isEquipped;
      else if (statusFilter === 'MATCH') statusMatch = item.status === 'MATCH' && !item.isCustomized;
      else if (statusFilter === 'MISMATCH') statusMatch = item.status === 'MISMATCH';
      else if (statusFilter === 'MISSING') statusMatch = item.status === 'MISSING';
      else if (statusFilter === 'CUSTOMIZED') statusMatch = item.isCustomized;
      
      return nameMatch && typeMatch && statusMatch;
    });
  }, [auditList, searchTerm, selectedTypeFilter, statusFilter]);

  const getRowVisual = (item) => {
    if (item.isEquipped) {
      return {
        label: '장착 중',
        rowClass: 'bg-emerald-50 border-l-4 border-emerald-500 dark:bg-emerald-500/8',
        stickyClass: 'bg-emerald-100 dark:bg-emerald-500/15',
        cellClass: 'bg-emerald-50 dark:bg-emerald-500/8',
        badgeClass: 'bg-emerald-100 border-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-800 text-emerald-800 dark:text-emerald-400'
      };
    }
    if (item.status === 'MISSING') {
      return {
        label: 'JSON 누락',
        rowClass: 'bg-white border-l-4 border-slate-200 dark:bg-rose-500/8 dark:border-rose-500',
        stickyClass: 'bg-white dark:bg-rose-500/15',
        cellClass: 'bg-white dark:bg-rose-500/8',
        badgeClass: 'bg-rose-500/10 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300'
      };
    }
    if (item.isCustomized) {
      return {
        label: '수정됨',
        rowClass: 'bg-white border-l-4 border-slate-200 dark:bg-amber-500/8 dark:border-amber-500',
        stickyClass: 'bg-white dark:bg-amber-500/15',
        cellClass: 'bg-white dark:bg-amber-500/8',
        badgeClass: 'bg-amber-500/10 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300'
      };
    }
    return {
      label: '기본 일치',
      rowClass: 'bg-white border-l-4 border-slate-200 dark:bg-slate-500/5 dark:border-slate-700',
      stickyClass: 'bg-white dark:bg-slate-500/10',
      cellClass: 'bg-white dark:bg-slate-500/5',
      badgeClass: 'bg-slate-500/10 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300'
    };
  };

  return (
    <div className="bg-theme-card border border-theme rounded-xl p-3 md:p-4 shadow-theme flex flex-col gap-3 animate-fadeIn text-theme-main theme-transition">
      
      {/* 타이틀 영역 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2.5 border-b border-theme pb-3 theme-transition">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5.5 h-5.5 text-orange-500" />
            <p className="text-[10px] font-black tracking-[0.14em] text-orange-500">RUNE AUDIT</p>
          </div>
          <h3 className="text-lg font-black text-theme-main mt-0.5">룬 스탯 교정실</h3>
          <p className="text-[10px] text-theme-sub mt-1">
            마스터 설명글 기준 룬 스탯을 검수하고, 필요한 값만 직접 교정해 DPS 시뮬레이터에 실시간 반영합니다.
          </p>
        </div>

        {/* 상단 액션 버튼 그룹 및 상태 라이트 */}
        <div className="flex items-center gap-2 self-stretch md:self-auto justify-between">
          <div className="flex items-center gap-1.5 text-[10px] bg-theme-subcard px-2 py-1.5 rounded-lg border border-theme theme-transition">
            <span className={`w-2.5 h-2.5 rounded-full ${isUpdating ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'} transition-all`} />
            <span className="font-extrabold text-theme-sub">
              {isUpdating ? '계산기 스탯 동기화 중...' : '시뮬레이터 실시간 반영 중'}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSyncMissingFromMaster}
              className="px-2.5 py-1.5 bg-theme-card hover:bg-theme-subcard text-theme-main border border-theme rounded-lg text-[10px] font-bold transition-all flex items-center gap-1.5 shadow-sm focus:outline-none"
              title="수동 변경된 값을 마스터 설명글 기준 기본 스탯으로 복원합니다."
            >
              <RotateCcw className="w-4 h-4" />
              누락 룬만 동기화
            </button>
            <button
              onClick={handleCopyJson}
              className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black transition-all flex items-center gap-1.5 shadow-sm focus:outline-none ${
                copySuccess 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-orange-500 text-white hover:bg-orange-600 shadow-orange-100'
              }`}
            >
              {copySuccess ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copySuccess ? '복사 완료!' : '교정된 JSON 설정값 복사'}
            </button>
          </div>
        </div>
      </div>

      {/* 한 줄형 교정 가이드 */}
      <div className="bg-orange-500/5 border border-orange-500/20 px-3 py-2 rounded-lg flex items-center gap-2 text-[10px] leading-relaxed text-theme-main theme-transition">
        <Info className="w-4 h-4 text-orange-500 shrink-0" />
        <p><strong className="text-orange-600 dark:text-orange-300">룬 스탯 교정실 안내:</strong> 마스터 설명과 현재 JSON을 비교합니다. 수정한 값은 DPS 시뮬레이터에 즉시 반영되며, 직접 피해 룬만 필요한 범위에서 조정하세요.</p>
      </div>

      {/* 대시보드 요약 메트릭 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
        <div className="bg-theme-subcard border border-theme p-2 rounded-lg flex flex-col justify-center theme-transition">
            <span className="text-[10px] font-bold text-theme-sub uppercase tracking-wider">마스터 룬</span>
          <span className="text-lg font-black text-theme-main mt-0.5">{statsSummary.totalMd} 개</span>
        </div>
        <div className="bg-theme-subcard border border-theme p-2 rounded-lg flex flex-col justify-center theme-transition">
            <span className="text-[10px] font-bold text-theme-sub uppercase tracking-wider">현재 JSON</span>
          <span className="text-lg font-black text-theme-main mt-0.5">{statsSummary.totalJson} 개</span>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-300 dark:border-emerald-800/40 p-3 rounded-xl flex flex-col justify-center text-emerald-700 dark:text-emerald-400 theme-transition">
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">설명글 일치</span>
          <span className="text-lg font-black text-emerald-600 dark:text-emerald-350 mt-0.5">{statsSummary.matchCount} 개</span>
        </div>
        <div className="bg-amber-500/10 border border-amber-300 dark:border-amber-800/40 p-3 rounded-xl flex flex-col justify-center text-amber-700 dark:text-amber-400 theme-transition">
          <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">수정됨 (커스텀)</span>
          <span className="text-lg font-black text-amber-700 dark:text-amber-350 mt-0.5">{statsSummary.mismatchCount} 개</span>
        </div>
        <div className="bg-rose-500/10 border border-rose-300 dark:border-rose-800/40 p-3 rounded-xl flex flex-col justify-center text-rose-700 dark:text-rose-450 theme-transition">
          <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">JSON 누락</span>
          <span className="text-lg font-black text-rose-600 dark:text-rose-350 mt-0.5">{statsSummary.missingCount} 개</span>
        </div>
      </div>

      {/* 필터 및 검색 컨트롤 */}
      <div className="flex flex-col xl:flex-row gap-2 bg-theme-subcard p-2.5 rounded-lg border border-theme theme-transition">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
          <input
            type="text"
            placeholder="룬 이름 또는 설명 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-theme-card border border-theme rounded-lg text-xs focus-orange-glow focus:outline-none text-theme-main placeholder-slate-400 theme-transition"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="bg-theme-card border border-theme rounded-lg px-3 py-2 text-xs font-black text-theme-sub focus-orange-glow focus:outline-none theme-transition"
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
            className="bg-theme-card border border-theme rounded-lg px-3 py-2 text-xs font-black text-theme-sub focus-orange-glow focus:outline-none theme-transition"
          >
            <option value="ALL">모든 상태</option>
            <option value="EQUIPPED">💍 장착 중인 룬</option>
            <option value="MATCH">✅ 마스터 기본상태</option>
            <option value="CUSTOMIZED">🛠️ 수동 수정됨 (커스텀)</option>
            <option value="MISSING">❌ JSON 누락</option>
          </select>
        </div>
      </div>

      {/* 룬 스탯 편집용 테이블 그리드 (가로 스크롤 & 룬 이름 열 sticky 고정) */}
      <div className="overflow-x-auto border border-theme rounded-lg bg-theme-subcard/30 max-h-[580px] xl:max-h-[650px] overflow-y-auto theme-transition">
        <table className="w-full border-collapse text-left text-xs text-theme-main min-w-[1500px]">
          <thead>
            <tr className="bg-theme-subcard border-b border-theme text-theme-sub font-bold sticky top-0 z-20 theme-transition">
              <th className="p-2 w-44 text-xs sticky left-0 bg-theme-subcard z-30 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)] theme-transition">룬 정보</th>
              {STAT_COLUMNS.map(col => (
                <th key={col.key} className="p-2 text-center w-28 border-l border-theme theme-transition">
                  <div className="flex flex-col items-center justify-center gap-0.5">
                    <span className="text-sm font-black text-theme-main">{col.label}</span>
                    <span className="text-[10px] text-theme-muted font-bold font-mono">
                      {col.isPercent ? '백분율 (%)' : '깡스탯'}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-theme">
            {filteredList.length === 0 ? (
              <tr>
                <td colSpan={STAT_COLUMNS.length + 1} className="p-8 text-center text-theme-muted font-bold">
                  조건에 부합하는 룬 목록이 없습니다.
                </td>
              </tr>
            ) : (
              filteredList.map((item, idx) => {
                const rowVisual = getRowVisual(item);
                return (
                <tr key={idx} className={`${rowVisual.rowClass} hover:brightness-[0.98] transition-colors`}>
                  
                  {/* 룬 정보 열 (Sticky 고정) */}
                  <td className={`p-2 sticky left-0 ${rowVisual.stickyClass} backdrop-blur-sm z-10 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)] border-r border-theme theme-transition`}>
                    <div className="flex flex-col gap-1.5 justify-center">
                      {/* 줄 1: 이름 및 누락/장착 뱃지 */}
                      <div className="flex flex-row items-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={(event) => openDictionary(item, event.currentTarget)}
                          aria-haspopup="dialog"
                          aria-label={`${item.name} 사전 데이터 보기`}
                          className="group inline-flex min-h-7 items-center gap-1 rounded px-1 -ml-1 text-left text-sm font-black text-theme-main underline-offset-4 transition-colors hover:bg-theme-subcard hover:text-emerald-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70 dark:hover:text-emerald-300"
                          title={`${item.name} 사전 데이터 보기`}
                        >
                          <span className="whitespace-nowrap">{item.name}</span>
                          <BookOpen aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-theme-muted transition-colors group-hover:text-emerald-600 dark:group-hover:text-emerald-300" />
                        </button>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-black border whitespace-nowrap ${rowVisual.badgeClass}`}>
                          {rowVisual.label}
                        </span>
                        {item.effectModelVersion >= 2 && (
                          <span className="rounded border border-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 text-[9px] font-black text-indigo-700 dark:border-indigo-800/60 dark:text-indigo-300">
                            효과 분리 v2
                          </span>
                        )}
                      </div>
                      {/* 줄 2: 부위 및 속성 뱃지 */}
                      <div className="flex flex-row items-center gap-1">
                        <span className="px-1.5 py-0.2 bg-theme-subcard border border-theme text-theme-sub rounded text-[9px] font-bold whitespace-nowrap theme-transition">
                          {item.type}
                        </span>
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border whitespace-nowrap theme-transition ${
                          item.element === '빛' ? 'bg-amber-500/15 border-amber-300 dark:border-amber-800/50 text-amber-700 dark:text-amber-300' :
                          item.element === '어둠' ? 'bg-purple-500/15 border-purple-300 dark:border-purple-800/50 text-purple-700 dark:text-purple-300' :
                          item.element === '용' ? 'bg-rose-500/15 border-rose-300 dark:border-rose-800/50 text-rose-700 dark:text-rose-300' :
                          'bg-theme-subcard border-theme text-theme-sub'
                        }`}>
                          {item.element}
                        </span>
                      </div>
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
                        className={`p-1.5 border-l border-theme text-center transition-all theme-transition ${rowVisual.cellClass} ${
                          isActive ? 'hover:brightness-[0.98]' : 'opacity-65 hover:opacity-100'
                        }`}
                      >
                        <div className="flex flex-col items-center justify-center gap-1">
                          <input
                            type="number"
                            step={col.isPercent ? "0.1" : "1"}
                            disabled={item.status === 'MISSING' || (item.effectModelVersion >= 2 && col.key === '가동률')}
                            value={item.status === 'MISSING' ? (col.isPercent ? (masterVal * 100).toFixed(1) : masterVal) : displayVal}
                            onChange={(e) => handleStatChange(item.name, col.key, e.target.value, col.isPercent)}
                            className={`w-24 text-center py-1 bg-transparent text-sm font-mono font-black rounded focus:outline-none transition-all ${
                              item.status === 'MISSING' || (item.effectModelVersion >= 2 && col.key === '가동률') ? 'text-theme-muted/50 cursor-not-allowed' :
                              isCustomCell
                                ? 'text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-300 dark:border-amber-800/40 shadow-inner' 
                                : isActive 
                                  ? 'text-emerald-700 dark:text-emerald-400 focus:bg-theme-card focus:border focus:border-emerald-500/60' 
                                  : 'text-theme-sub dark:text-theme-main focus:bg-theme-card focus:text-theme-main focus:border focus:border-theme'
                            }`}
                            placeholder="0"
                            title={item.effectModelVersion >= 2 && col.key === '가동률'
                              ? '효과 모델 v2 룬은 룬 단위 가동률을 사용하지 않습니다. 조건부 효과는 전투 설정에서 개별 조정합니다.'
                              : (isCustomCell ? `마스터 기본값: ${col.isPercent ? (masterVal * 100).toFixed(1) + '%' : masterVal}` : '기본값')}
                          />
                          
                          {/* 스탯 변경 시 마스터 값과 미세하게 다른 경우 뱃지 제공 */}
                          {isCustomCell && !col.isPercent && (
                            <span className="text-[10px] text-amber-700 dark:text-amber-400 font-extrabold">
                              (원래: {masterVal})
                            </span>
                          )}
                          {isCustomCell && col.isPercent && (
                            <span className="text-[10px] text-amber-700 dark:text-amber-400 font-extrabold">
                              (원래: {(masterVal * 100).toFixed(1)}%)
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {selectedDictionaryRune && (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/45 p-3 backdrop-blur-sm md:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="rune-dictionary-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeDictionary();
          }}
        >
          <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-theme bg-theme-card shadow-2xl theme-transition" onMouseDown={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-3 border-b border-theme bg-theme-subcard px-4 py-3 theme-transition">
              <div>
                <p className="text-[10px] font-black tracking-[0.14em] text-emerald-700 dark:text-emerald-300">RUNE DICTIONARY</p>
                <h4 id="rune-dictionary-title" className="mt-0.5 text-lg font-black text-theme-main">{selectedDictionaryRune.name} 사전 데이터</h4>
                <p className="mt-0.5 text-xs text-theme-sub">마스터 설명 기준과 현재 저장된 JSON 값을 읽기 전용으로 비교합니다.</p>
              </div>
              <button
                ref={dictionaryCloseButtonRef}
                type="button"
                onClick={closeDictionary}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-theme text-theme-sub transition-colors hover:bg-theme-card hover:text-theme-main focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70"
                aria-label="룬 사전 데이터 닫기"
                title="닫기"
              >
                <X aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[72vh] overflow-y-auto p-4">
              <div className="mb-3 flex flex-wrap gap-1.5">
                <span className="rounded border border-theme bg-theme-subcard px-2 py-1 text-[10px] font-bold text-theme-sub">{selectedDictionaryRune.type}</span>
                <span className="rounded border border-theme bg-theme-subcard px-2 py-1 text-[10px] font-bold text-theme-sub">{selectedDictionaryRune.element}</span>
                <span className={`rounded border px-2 py-1 text-[10px] font-black ${getRowVisual(selectedDictionaryRune).badgeClass}`}>{getRowVisual(selectedDictionaryRune).label}</span>
              </div>

              <div className="grid gap-3 lg:grid-cols-[0.9fr_1.1fr]">
                <section className="rounded-xl border border-theme bg-theme-subcard/60 p-3 theme-transition" aria-labelledby="rune-dictionary-description-title">
                  <h5 id="rune-dictionary-description-title" className="text-xs font-black text-theme-main">마스터 설명 원문</h5>
                  <div className="mt-2 space-y-1.5 text-xs leading-relaxed text-theme-sub">
                    {selectedDictionaryRune.cleaned_text.length > 0 ? selectedDictionaryRune.cleaned_text.map((line, index) => (
                      <p key={`${selectedDictionaryRune.name}-description-${index}`}>{line}</p>
                    )) : <p>사전 설명이 등록되지 않았습니다.</p>}
                  </div>
                </section>

                <section className="rounded-xl border border-theme bg-theme-subcard/60 p-3 theme-transition" aria-labelledby="rune-dictionary-stats-title">
                  <h5 id="rune-dictionary-stats-title" className="text-xs font-black text-theme-main">저장 데이터 비교</h5>
                  <p className="mt-1 text-[10px] text-theme-muted">왼쪽은 설명글에서 파싱한 기준값, 오른쪽은 현재 계산기에 저장된 값입니다.</p>
                  <dl className="mt-2 divide-y divide-theme rounded-lg border border-theme bg-theme-card theme-transition">
                    {STAT_COLUMNS.map((column) => {
                      const masterValue = selectedDictionaryRune.parsedStats[column.key] ?? 0;
                      const storedValue = selectedDictionaryRune.existingRune?.stats?.[column.key];
                      const hasStoredValue = storedValue !== undefined;
                      const displayValue = (value) => column.isPercent ? `${(value * 100).toFixed(1)}%` : String(value);
                      const isMatch = hasStoredValue && Math.abs(masterValue - storedValue) <= 0.0001;

                      return (
                        <div key={column.key} className="grid grid-cols-[0.8fr_1fr_1fr] gap-2 px-2 py-1.5 text-[10px] sm:text-xs">
                          <dt className="font-bold text-theme-sub">{column.label}</dt>
                          <dd className="font-mono font-bold text-theme-main">기준 {displayValue(masterValue)}</dd>
                          <dd className={hasStoredValue && !isMatch ? 'font-mono font-black text-amber-700 dark:text-amber-300' : 'font-mono font-bold text-emerald-700 dark:text-emerald-300'}>
                            {hasStoredValue ? `저장 ${displayValue(storedValue)}` : '저장 미등록'}
                          </dd>
                        </div>
                      );
                    })}
                  </dl>
                  {selectedDictionaryRune.effectModelVersion >= 2 && (
                    <div className="mt-3 rounded-lg border border-indigo-300 bg-indigo-500/5 p-2.5 text-[10px] leading-relaxed text-indigo-800 dark:border-indigo-800/60 dark:text-indigo-200">
                      <p className="font-black">효과 모델 v2</p>
                      <p className="mt-0.5">위 표는 상시 스탯입니다. 룬 단위 가동률은 사용하지 않으며, 아래 조건부 효과만 전투 설정에서 개별 가동률을 조정합니다.</p>
                    </div>
                  )}
                  {selectedDictionaryRune.conditionalEffects.length > 0 && (
                    <section className="mt-3 rounded-xl border border-theme bg-theme-card p-3 theme-transition" aria-labelledby="rune-dictionary-effects-title">
                      <h5 id="rune-dictionary-effects-title" className="text-xs font-black text-theme-main">조건부 효과·가동률 정책</h5>
                      <div className="mt-2 space-y-2">
                        {selectedDictionaryRune.conditionalEffects.map((effect) => {
                          const unresolved = effect.modelStatus === 'unresolved' || effect.includedInDps === false;
                          return (
                            <div key={effect.id} className={`rounded-lg border px-2.5 py-2 ${unresolved ? 'border-amber-300 bg-amber-500/5 dark:border-amber-800/60' : 'border-emerald-300 bg-emerald-500/5 dark:border-emerald-800/60'}`}>
                              <div className="flex flex-wrap items-center justify-between gap-1.5">
                                <p className="font-black text-theme-main">{effect.label}</p>
                                <span className={unresolved ? 'rounded border border-amber-300 px-1.5 py-0.5 font-black text-amber-700 dark:border-amber-800/60 dark:text-amber-300' : 'rounded border border-emerald-300 px-1.5 py-0.5 font-black text-emerald-700 dark:border-emerald-800/60 dark:text-emerald-300'}>
                                  {unresolved ? '계산 미반영' : `기본 가동률 ${Math.round((effect.defaultUptime ?? 0) * 100)}%`}
                                </span>
                              </div>
                              <p className="mt-1 text-theme-sub">{effect.source || '원문 근거가 등록되지 않았습니다.'}</p>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  )}
                </section>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
