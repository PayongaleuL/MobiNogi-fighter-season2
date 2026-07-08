import React, { useState, useMemo } from 'react';
import { Search, Copy, AlertTriangle, CheckCircle, PlusCircle, AlertCircle, FileText } from 'lucide-react';
import { parseRuneMarkdown } from '../utils/runeMdParser';
import mdText from '../../results/260708_룬설명목록.md?raw';

const AUDIT_KEYS = [
  "공격력%", "주는피해%", "강타피해%", "연타피해%", "추가타피해%", "치명타피해%", "스킬피해%", "추가타확률%", "치명타확률%", "스킬속도%", "재사용회복%", "최종피해%"
];

export default function RuneAuditDashboard({ runes, onRunesUpdate }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'MATCH' | 'MISMATCH' | 'MISSING'
  const [copySuccess, setCopySuccess] = useState(false);

  // 1. 마스터 마크다운 파싱 결과 생성
  const parsedRunes = useMemo(() => {
    return parseRuneMarkdown(mdText);
  }, []);

  // 2. 파싱 룬과 기존 JSON 룬 대조 연산
  const auditList = useMemo(() => {
    return parsedRunes.map(parsed => {
      // 이름으로 기존 룬 찾기
      const existing = runes.find(r => r.name.replace(/\+/g, '').trim() === parsed.name.replace(/\+/g, '').trim()) || 
                       runes.find(r => r.name === parsed.name);
      
      let status = 'MISSING'; // 기본값: 누락
      const mismatches = [];

      if (existing) {
        status = 'MATCH';
        // 스탯 검수
        AUDIT_KEYS.forEach(key => {
          const parsedVal = parsed.stats[key] || 0;
          const existingVal = existing.stats[key] || 0;
          
          // 소수점 4자리까지 오차 허용 비교 (부동소수점 오차 방지)
          if (Math.abs(parsedVal - existingVal) > 0.0001) {
            status = 'MISMATCH';
            mismatches.push({
              key,
              parsed: parsedVal,
              existing: existingVal
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

  // 4. 자동 싱크 및 업데이트 핸들러
  const handleAutoSync = () => {
    if (!window.confirm('정말로 마크다운에서 파싱된 최신 스탯 수치로 JSON 데이터베이스를 강제 동기화하시겠습니까?\n\n(누락된 장신구, 엠블럼 룬도 자동으로 생성 및 추가됩니다)')) {
      return;
    }

    // 싱크 진행
    const updatedRunes = [...runes];

    auditList.forEach(item => {
      if (item.status === 'MISSING') {
        // 신규 룬 추가
        const newRune = {
          file: `MabinogiMobile_${Math.random().toString(36).substring(2, 12)}.png`,
          type: item.type,
          name: item.name,
          element: item.element,
          raw_text: item.cleaned_text,
          cleaned_text: item.cleaned_text,
          stats: {
            ...item.parsedStats,
            "가동률": item.type === '장신구' ? 1.0 : (item.name.includes('침식') || item.name.includes('봉인') || item.name.includes('경계') || item.status === 'MISSING' && item.name.match(/(흐릿한|잿빛|금 간|무너진|복수|거두는|부서진)/) ? 0.7 : 1.0),
            "공격력": item.type === '무기' ? 1038.0 : 0.0,
            "방어력": item.type === '방어구' ? 445.0 : 0.0,
            "마도저항": item.type === '무기' ? 300.0 : (item.type === '방어구' ? 300.0 : 0.0),
            "모든스킬강화": 1.0,
            "임의스킬강화": 2.0
          },
          description: item.cleaned_text[0] || `${item.name} 효과`
        };
        updatedRunes.push(newRune);
      } else if (item.status === 'MISMATCH' && item.existingRune) {
        // 기존 룬 스탯 덮어쓰기
        const index = updatedRunes.findIndex(r => r.name === item.existingRune.name);
        if (index !== -1) {
          const target = { ...updatedRunes[index] };
          target.stats = { ...target.stats };
          
          // 파싱된 스탯으로 강제 매핑
          AUDIT_KEYS.forEach(key => {
            target.stats[key] = item.parsedStats[key] || 0.0;
          });
          
          // cleaned_text도 최신 마스터 텍스트로 보정
          target.cleaned_text = item.cleaned_text;
          
          updatedRunes[index] = target;
        }
      }
    });

    onRunesUpdate(updatedRunes);
    alert('모든 불일치 스탯 및 누락 룬 싱크 완료! 계산기 시뮬레이터에 실시간 적용되었습니다. 갱신된 JSON을 복사하여 src/data/runes.json에 덮어씌워 보존해 주세요.');
  };

  // 5. JSON 전체 내보내기/복사
  const handleCopyJson = () => {
    // 임시 시뮬레이션용 주입 필드 transcendLevel 등 제거 후 순수한 json 구조화
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

  // 6. 필터링 로직
  const filteredList = useMemo(() => {
    return auditList.filter(item => {
      const nameMatch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.cleaned_text.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const typeMatch = selectedTypeFilter === 'ALL' || item.type === selectedTypeFilter;
      
      let statusMatch = true;
      if (statusFilter === 'MATCH') statusMatch = item.status === 'MATCH';
      else if (statusFilter === 'MISMATCH') statusMatch = item.status === 'MISMATCH';
      else if (statusFilter === 'MISSING') statusMatch = item.status === 'MISSING';

      return nameMatch && typeMatch && statusMatch;
    });
  }, [auditList, searchTerm, selectedTypeFilter, statusFilter]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-6 animate-fadeIn text-slate-200">
      
      {/* 타이틀 영역 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-5.5 h-5.5 text-mabi-accent" />
            룬 마스터 마크다운 정밀 검수 대시보드
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            읽기 전용 마스터 파일인 <span className="text-emerald-400 font-mono">260708_룬설명목록.md</span>의 오타 수정본 설명 문장과 현재 JSON 데이터베이스의 스탯 수치를 정밀 대조합니다.
          </p>
        </div>

        {/* 상단 액션 버튼 그룹 */}
        <div className="flex gap-2.5">
          <button
            onClick={handleAutoSync}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-900 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md shadow-emerald-950/20"
          >
            <PlusCircle className="w-4 h-4" />
            마크다운 스탯으로 자동 싱크
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
            {copySuccess ? '복사 완료!' : '정정된 JSON 복사'}
          </button>
        </div>
      </div>

      {/* 대시보드 요약 메트릭 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-slate-950/40 border border-slate-800/80 p-4 rounded-xl flex flex-col justify-center">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">마크다운 룬 총수</span>
          <span className="text-xl font-extrabold text-slate-200 mt-1">{statsSummary.totalMd} 개</span>
        </div>
        <div className="bg-slate-950/40 border border-slate-800/80 p-4 rounded-xl flex flex-col justify-center">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">현재 JSON 룬 수</span>
          <span className="text-xl font-extrabold text-slate-200 mt-1">{statsSummary.totalJson} 개</span>
        </div>
        <div className="bg-slate-900 border border-emerald-900/60 p-4 rounded-xl flex flex-col justify-center bg-gradient-to-br from-slate-900 to-emerald-950/10">
          <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">일치 룬</span>
          <span className="text-xl font-extrabold text-emerald-400 mt-1">{statsSummary.matchCount} 개</span>
        </div>
        <div className="bg-slate-900 border border-amber-900/60 p-4 rounded-xl flex flex-col justify-center bg-gradient-to-br from-slate-900 to-amber-950/10">
          <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">스탯 상이 (오류)</span>
          <span className="text-xl font-extrabold text-amber-400 mt-1">{statsSummary.mismatchCount} 개</span>
        </div>
        <div className="bg-slate-900 border border-rose-900/60 p-4 rounded-xl flex flex-col justify-center bg-gradient-to-br from-slate-900 to-rose-950/10">
          <span className="text-[10px] font-semibold text-rose-400 uppercase tracking-wider">JSON 누락 (장신구/엠블럼)</span>
          <span className="text-xl font-extrabold text-rose-400 mt-1">{statsSummary.missingCount} 개</span>
        </div>
      </div>

      {/* 필터 및 검색 컨트롤 */}
      <div className="flex flex-col md:flex-row gap-4 bg-slate-950/30 p-4 rounded-xl border border-slate-800/60">
        {/* 검색 인풋 */}
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

        {/* 필터 셀렉터 그룹 */}
        <div className="flex gap-2">
          {/* 부위 필터 */}
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

          {/* 상태 필터 */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-bold text-slate-300 focus:outline-none focus:border-mabi-accent"
          >
            <option value="ALL">모든 상태</option>
            <option value="MATCH">✅ 일치</option>
            <option value="MISMATCH">⚠️ 스탯 상이</option>
            <option value="MISSING">❌ JSON 누락</option>
          </select>
        </div>
      </div>

      {/* 결과 테이블 */}
      <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/20">
        <table className="w-full border-collapse text-left text-xs text-slate-300">
          <thead>
            <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-bold">
              <th className="p-4 w-48">룬 정보</th>
              <th className="p-4">인게임 정제 문장 (마스터 마크다운)</th>
              <th className="p-4 w-64">검수 대조 분석</th>
              <th className="p-4 w-28 text-center">상태</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredList.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-8 text-center text-slate-500 font-medium">
                  조건에 일치하는 검수 내역이 없습니다.
                </td>
              </tr>
            ) : (
              filteredList.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-900/30 transition-colors">
                  {/* 룬 정보 */}
                  <td className="p-4 font-semibold text-slate-100 flex flex-col gap-1.5 justify-center">
                    <span className="text-sm font-bold text-slate-100">{item.name}</span>
                    <div className="flex gap-1">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700/60">
                        {item.type}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                        item.element === '빛' ? 'bg-amber-950/30 border-amber-800 text-amber-300' :
                        item.element === '어둠' ? 'bg-purple-950/30 border-purple-800 text-purple-300' :
                        item.element === '용' ? 'bg-rose-950/30 border-rose-800 text-rose-300' :
                        'bg-slate-800/30 border-slate-700 text-slate-400'
                      }`}>
                        {item.element}
                      </span>
                    </div>
                  </td>

                  {/* 정제 문장 */}
                  <td className="p-4 leading-relaxed font-medium">
                    {item.cleaned_text.map((text, i) => (
                      <div key={i} className="mb-1 last:mb-0">
                        • {text}
                      </div>
                    ))}
                  </td>

                  {/* 검수 대조 분석 */}
                  <td className="p-4">
                    {item.status === 'MATCH' && (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> 스탯 수치 완벽히 일치
                      </span>
                    )}

                    {item.status === 'MISMATCH' && (
                      <div className="flex flex-col gap-1.5">
                        <span className="text-amber-400 font-bold flex items-center gap-1 mb-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> 불일치 {item.mismatches.length}건 감지:
                        </span>
                        {item.mismatches.map((m, i) => (
                          <div key={i} className="bg-amber-950/20 border border-amber-900/40 p-1.5 rounded text-[11px] flex justify-between font-mono">
                            <span className="text-slate-400 font-semibold">{m.key}</span>
                            <span className="text-amber-300">
                              파싱: {(m.parsed * 100).toFixed(1)}% vs JSON: {(m.existing * 100).toFixed(1)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {item.status === 'MISSING' && (
                      <div className="bg-rose-950/15 border border-rose-900/40 p-2 rounded text-[11px] flex flex-col gap-1">
                        <span className="text-rose-400 font-bold flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> JSON 데이터 누락
                        </span>
                        <p className="text-slate-400 text-[10px] leading-normal">
                          장신구/엠블럼 룬으로, 싱크 진행 시 파싱된 스탯으로 새롭게 추가됩니다.
                        </p>
                      </div>
                    )}
                  </td>

                  {/* 상태 */}
                  <td className="p-4 text-center font-bold">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] inline-block w-20 text-center ${
                      item.status === 'MATCH' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' :
                      item.status === 'MISMATCH' ? 'bg-amber-950 text-amber-400 border border-amber-900' :
                      'bg-rose-950 text-rose-400 border border-rose-900'
                    }`}>
                      {item.status === 'MATCH' ? '일치' :
                       item.status === 'MISMATCH' ? '스탯 상이' : '누락'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
