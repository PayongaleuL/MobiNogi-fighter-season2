import React, { useState } from 'react';
import { Search, Save, Copy, FileSpreadsheet, RotateCcw, AlertCircle } from 'lucide-react';

const STAT_KEYS = [
  "공격력%", "조건부공증%", "주는피해%", "받는피해%", "강타피해%", "연타피해%", "추가타피해%", "치명타피해%", "콤보피해%", "멀티피해%",
  "스킬피해%", "추가타확률%", "치명타확률%", "스킬속도%", "재사용회복%", "최종피해%", "가동률", "공격력", "방어력", "마도저항",
  "모든스킬강화", "임의스킬강화"
];

export default function RuneDbEditor({ runes, onRunesUpdate }) {
  const [localRunes, setLocalRunes] = useState([...runes]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('ALL');
  const [copySuccess, setCopySuccess] = useState(false);

  // 셀 값 변경 핸들러
  const handleValChange = (runeName, statKey, valStr) => {
    const newVal = parseFloat(valStr);
    const updated = localRunes.map(r => {
      if (r.name === runeName) {
        return {
          ...r,
          stats: {
            ...r.stats,
            [statKey]: isNaN(newVal) ? 0.0 : newVal
          }
        };
      }
      return r;
    });
    setLocalRunes(updated);
  };

  // 일반 속성 변경 핸들러
  const handlePropChange = (runeName, field, value) => {
    const updated = localRunes.map(r => {
      if (r.name === runeName) {
        return { ...r, [field]: value };
      }
      return r;
    });
    setLocalRunes(updated);
  };

  // 계산기에 즉시 반영
  const handleApply = () => {
    onRunesUpdate(localRunes);
    alert('수정된 룬 스탯이 시뮬레이터 연산에 성공적으로 실시간 적용되었습니다!');
  };

  // 전체 JSON 복사
  const handleCopyJson = () => {
    const cleanExport = localRunes.map(r => {
      const { transcendLevel, ...rest } = r; // 계산용 임시 주입 필드 소거
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

  // 초기 리셋
  const handleReset = () => {
    if (window.confirm('모든 임시 편집 수치들을 되돌리시겠습니까? (저장되지 않은 변경 사항은 소실됩니다)')) {
      setLocalRunes([...runes]);
    }
  };

  // 필터링
  const filtered = localRunes.filter(r => {
    const nameMatch = r.name.toLowerCase().includes(searchTerm.toLowerCase());
    const typeMatch = selectedTypeFilter === 'ALL' || r.type === selectedTypeFilter;
    return nameMatch && typeMatch;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <FileSpreadsheet className="w-5.5 h-5.5 text-mabi-accent" />
            룬 스탯 및 가동률 데이터베이스 에디터 (엑셀식 그리드)
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            룬설명 목록 마크다운에 무거운 표를 그리지 않고, 여기서 모든 룬의 22가지 스탯과 가동률 값을 실시간으로 제어, 검수 및 파일 갱신용 JSON을 추출합니다.
          </p>
        </div>

        {/* 액션 버튼 그룹 */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleApply}
            className="px-4 py-2 bg-emerald-650 hover:bg-emerald-550 text-slate-100 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
          >
            <Save className="w-3.5 h-3.5" />
            계산기에 즉시 반영
          </button>
          <button
            onClick={handleCopyJson}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-slate-100 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
          >
            <Copy className="w-3.5 h-3.5" />
            {copySuccess ? '클립보드 복사 완료!' : 'runes.json 교체용 JSON 복사'}
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-2 bg-slate-850 hover:bg-slate-750 text-slate-400 hover:text-slate-200 border border-slate-750 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            되돌리기
          </button>
        </div>
      </div>

      {/* 검색 및 필터바 */}
      <div className="flex flex-col sm:flex-row gap-3 bg-slate-950/40 p-4 rounded-xl border border-slate-850">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="룬 이름 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-mabi-accent transition-all"
          />
        </div>

        <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
          {['ALL', '무기', '방어구', '장신구', '엠블럼'].map(type => (
            <button
              key={type}
              onClick={() => setSelectedTypeFilter(type)}
              className={`px-3 py-1.5 rounded text-[10px] font-black transition-all ${
                selectedTypeFilter === type
                  ? 'bg-slate-850 text-mabi-accent shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {type === 'ALL' ? '전체 부위' : type}
            </button>
          ))}
        </div>
      </div>

      {/* 엑셀식 고정 헤더 그리드 테이블 */}
      <div className="overflow-x-auto max-h-[500px] border border-slate-800 rounded-xl bg-slate-950/20">
        <table className="w-full border-collapse text-left text-xs">
          <thead className="bg-slate-950 text-slate-350 sticky top-0 z-10 border-b border-slate-800">
            <tr>
              <th className="p-3 font-bold sticky left-0 bg-slate-950 z-20 min-w-[120px] border-r border-slate-800">룬 이름</th>
              <th className="p-3 font-bold min-w-[65px] border-r border-slate-850">부위</th>
              <th className="p-3 font-bold min-w-[65px] border-r border-slate-850">속성</th>
              {STAT_KEYS.map(key => (
                <th key={key} className="p-2 font-semibold text-[10px] text-center border-r border-slate-850 min-w-[75px]">
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-850/60 text-slate-300">
            {filtered.map(r => (
              <tr key={r.name} className="hover:bg-slate-850/40 transition-colors">
                <td className="p-2 font-bold sticky left-0 bg-slate-900/90 z-10 border-r border-slate-800 text-slate-100 flex items-center gap-1">
                  <span>{r.name}</span>
                </td>
                <td className="p-2 border-r border-slate-850 text-slate-400 font-semibold">{r.type}</td>
                <td className="p-2 border-r border-slate-850">
                  <select
                    value={r.element}
                    onChange={(e) => handlePropChange(r.name, 'element', e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-[10px] text-slate-200 focus:outline-none"
                  >
                    <option value="없음">없음</option>
                    <option value="빛">빛</option>
                    <option value="어둠">어둠</option>
                    <option value="용">용</option>
                  </select>
                </td>
                {STAT_KEYS.map(key => {
                  const val = r.stats[key] !== undefined ? r.stats[key] : 0.0;
                  const isNonZero = val !== 0.0;
                  return (
                    <td key={key} className={`p-1 border-r border-slate-850 text-center ${isNonZero ? 'bg-slate-800/20' : ''}`}>
                      <input
                        type="text"
                        value={val}
                        onChange={(e) => handleValChange(r.name, key, e.target.value)}
                        className={`w-full text-center bg-transparent focus:bg-slate-900 text-xs border border-transparent focus:border-slate-700 rounded py-0.5 transition-all focus:outline-none ${
                          isNonZero ? 'text-mabi-accent font-bold' : 'text-slate-600'
                        }`}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 가이드 라인 */}
      <div className="flex items-start gap-2.5 bg-slate-950/40 p-4 rounded-xl border border-slate-850 text-xs text-slate-400">
        <AlertCircle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold text-slate-300 block mb-1">사용 및 적용 팁</span>
          - 표 내부의 입력 값을 바꾼 뒤 상단 <strong className="text-emerald-400">"계산기에 즉시 반영"</strong> 버튼을 누르면 즉시 시뮬레이션 DPS 계산에 수정치가 주입됩니다.
          <br />
          - 영구적으로 소스 데이터베이스를 업데이트하고 싶으실 경우, <strong className="text-indigo-400">"runes.json 교체용 JSON 복사"</strong>를 클릭하여 복사된 전체 텍스트를 <code className="text-slate-200">src/data/runes.json</code> 파일에 그대로 덮어쓰기 하시면 영구 적용됩니다.
        </div>
      </div>
    </div>
  );
}
