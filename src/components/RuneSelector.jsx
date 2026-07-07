import React, { useState } from 'react';
import runesData from '../data/runes.json';
import { Search, Shield, ShieldAlert, Award, Star } from 'lucide-react';

export default function RuneSelector({ selectedRunes, onRuneChange }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('ALL');
  const [activeSlot, setActiveSlot] = useState(null); // { type, index }

  // 룬 설명 극단적 간소화 포맷터 (피드백 반영: 주피증, 공증, 치확 등 짧은 용어로 정리)
  const formatRuneDescCompact = (rune) => {
    if (!rune) return "";
    const specialRunes = {
      "무너진 경계": "침식 시 추가타확 16.5% ~ 33% (가동률 70% 반영)",
      "숲 길잡이": "이동/적중 시 주피증 21% 증가",
      "백금 천칭": "스킬/평타 시 주피증 31.5% / 추가타확 31.5% 증가",
      "초월": "추가타 5회 시 주피증 15% / 치명타 5회 시 치피 15% 증가",
      "눈부신 잔영": "스킬 후 평타 시 주변 스킬피 8% 추가 및 공속 10% 증가",
      "태초": "스킬피 20% 증가",
      "악몽": "스킬 사용 시 불의정수 소모 도트피 (주피증 5% 근사 계산)",
      "금 간 봉인": "체력 비례 공증 10% 및 받는피해 감소",
      "타오르는 영광": "강타피 30% / 공증 23.5% 증가"
    };

    if (specialRunes[rune.name]) return specialRunes[rune.name];

    const parts = [];
    const mapping = {
      "공격력%": "공증",
      "조건부공증%": "조건공증",
      "주는피해%": "주피증",
      "받는피해%": "받는피감",
      "강타피해%": "강타피",
      "연타피해%": "연타피",
      "추가타피해%": "추가타피",
      "치명타피해%": "치피",
      "콤보피해%": "콤보피",
      "멀티피해%": "멀티피",
      "스킬피해%": "스킬피",
      "추가타확률%": "추가타확",
      "치명타확률%": "치확",
      "스킬속도%": "스킬속"
    };

    Object.entries(rune.stats).forEach(([k, v]) => {
      if (v !== 0 && k !== '가동률' && mapping[k]) {
        parts.push(`${mapping[k]} ${(v * 100).toFixed(1)}%`);
      }
    });

    return parts.length > 0 ? parts.join(" / ") : (rune.description || "옵션 없음");
  };

  // 거래불가/각인부위 등의 노이즈 문장을 필터링하여 실제 핵심 고유 효과 텍스트만 추출
  const getCoreRuneTexts = (cleanedText) => {
    if (!cleanedText) return [];
    const ignoredPatterns = [
      '룬:', '전용 룬', '판매', '시즌보존', '시류보존', '기억가능', '각인', '마도 저항',
      '추가 체력', '하위 능력치', '유일', '방어력', '공격력', '전설 희귀도', '스킬 1강화', '스킬 2강화',
      '거래 불가', '거래 불가', '거래불가', '판매기능', '판매가능', '엘불럽에', '방어구데', '임불럼', '엠블럼'
    ];
    return cleanedText.filter(line => {
      const trimmed = line.trim();
      if (!trimmed) return false;
      return !ignoredPatterns.some(pat => trimmed.includes(pat));
    });
  };

  // 룬 타입별로 슬롯 구분
  // 무기(1개), 방어구(5개), 장신구(3개), 엠블럼(1개)
  const slots = [
    { label: '무기 룬', type: '무기', index: 0, count: 1 },
    { label: '방어구 룬 1', type: '방어구', index: 0, count: 5 },
    { label: '방어구 룬 2', type: '방어구', index: 1, count: 5 },
    { label: '방어구 룬 3', type: '방어구', index: 2, count: 5 },
    { label: '방어구 룬 4', type: '방어구', index: 3, count: 5 },
    { label: '방어구 룬 5', type: '방어구', index: 4, count: 5 },
    { label: '장신구 룬 1', type: '장신구', index: 0, count: 3 },
    { label: '장신구 룬 2', type: '장신구', index: 1, count: 3 },
    { label: '장신구 룬 3', type: '장신구', index: 2, count: 3 },
    { label: '엠블럼 룬', type: '엠블럼', index: 0, count: 1 }
  ];

  // 검색 및 필터링된 룬 목록
  const filteredRunes = runesData.filter(rune => {
    const matchesSearch = rune.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rune.cleaned_text && rune.cleaned_text.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())));
    const matchesType = selectedTypeFilter === 'ALL' || rune.type === selectedTypeFilter;
    return matchesSearch && matchesType;
  });

  const getElementColor = (el) => {
    if (el === '용') return 'text-red-400 bg-red-950/40 border-red-800';
    if (el === '어둠') return 'text-purple-400 bg-purple-950/40 border-purple-800';
    if (el === '빛') return 'text-yellow-400 bg-yellow-950/40 border-yellow-800';
    return 'text-slate-400 bg-slate-800/40 border-slate-700';
  };

  const getRuneIcon = (type) => {
    if (type === '무기') return <Award className="w-5 h-5 text-orange-400" />;
    if (type === '방어구') return <Shield className="w-5 h-5 text-blue-400" />;
    if (type === '장신구') return <Star className="w-5 h-5 text-emerald-400" />;
    return <ShieldAlert className="w-5 h-5 text-indigo-400" />;
  };

  const handleSelectRune = (rune) => {
    if (!activeSlot) return;
    onRuneChange(activeSlot.type, activeSlot.index, rune);
    setActiveSlot(null);
  };

  const handleClearSlot = (type, index, e) => {
    e.stopPropagation();
    onRuneChange(type, index, null);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <h3 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
        <Award className="w-6 h-6 text-mabi-red" />
        시즌 2 룬 세팅 구성
      </h3>

      {/* 룬 장착 슬롯 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {slots.map((slot, idx) => {
          const key = `${slot.type}-${slot.index}`;
          const currentRune = selectedRunes[slot.type] ? selectedRunes[slot.type][slot.index] : null;

          return (
            <div
              key={key}
              onClick={() => {
                setActiveSlot({ type: slot.type, index: slot.index });
                setSelectedTypeFilter(slot.type);
              }}
              className={`relative cursor-pointer flex items-center gap-3 p-4 rounded-xl border transition-all duration-300 ${
                currentRune 
                  ? 'bg-slate-850 border-mabi-accent hover:border-mabi-red' 
                  : 'bg-slate-950/60 border-slate-800 border-dashed hover:border-slate-700'
              } ${activeSlot?.type === slot.type && activeSlot?.index === slot.index ? 'ring-2 ring-mabi-red border-transparent' : ''}`}
            >
              <div className="p-2 bg-slate-900 rounded-lg">
                {getRuneIcon(slot.type)}
              </div>

              <div className="flex-1 min-w-0">
                <span className="text-[9px] text-slate-500 font-semibold block">{slot.label}</span>
                <span className="text-xs font-bold text-slate-200 truncate block">
                  {currentRune ? currentRune.name : '룬을 선택해주세요'}
                </span>
                {currentRune ? (
                  <span className="text-[10px] text-emerald-400 font-bold block mt-1 truncate">
                    {formatRuneDescCompact(currentRune)}
                  </span>
                ) : (
                  currentRune?.element && currentRune.element !== '없음' && (
                    <span className={`inline-block text-[9px] px-1.5 py-0.5 rounded border mt-1 font-bold ${getElementColor(currentRune.element)}`}>
                      {currentRune.element}
                    </span>
                  )
                )}
              </div>

              {currentRune && (
                <button
                  onClick={(e) => handleClearSlot(slot.type, slot.index, e)}
                  className="p-1 hover:bg-slate-700/60 rounded-full text-slate-400 hover:text-red-400 transition-colors"
                >
                  &times;
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* 룬 검색 및 선택 모달창 (슬롯 선택 시 활성화) */}
      {activeSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
            
            {/* 헤더 */}
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h4 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                {getRuneIcon(activeSlot.type)}
                {activeSlot.type} 룬 선택 ({activeSlot.index + 1}번 슬롯)
              </h4>
              <button
                onClick={() => setActiveSlot(null)}
                className="text-slate-400 hover:text-slate-200 text-2xl font-bold"
              >
                &times;
              </button>
            </div>

            {/* 필터 및 검색 바 */}
            <div className="p-4 bg-slate-950 border-b border-slate-800/80 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="룬 이름 혹은 효과 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 pl-10 pr-4 py-2 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-mabi-accent transition-all"
                />
              </div>
              <div className="flex gap-2">
                {['ALL', '무기', '방어구', '장신구', '엠블럼'].map(t => (
                  <button
                    key={t}
                    onClick={() => setSelectedTypeFilter(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      selectedTypeFilter === t
                        ? 'bg-mabi-accent/20 border-mabi-accent text-mabi-accent'
                        : 'border-slate-800 text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* 룬 리스트 */}
            <div className="p-4 overflow-y-auto flex-1 bg-slate-950/40">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredRunes.map(rune => {
                  const coreTexts = getCoreRuneTexts(rune.cleaned_text);

                  return (
                    <div
                      key={rune.file}
                      onClick={() => handleSelectRune(rune)}
                      className="cursor-pointer bg-slate-900/90 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 p-4 rounded-xl transition-all duration-200 flex flex-col justify-between gap-3.5"
                    >
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <span className="font-extrabold text-slate-100 text-sm truncate">{rune.name}</span>
                          <div className="flex gap-1.5 shrink-0">
                            {rune.element && rune.element !== '없음' && (
                              <span className={`text-[9px] px-1 rounded border font-bold ${getElementColor(rune.element)}`}>
                                {rune.element}
                              </span>
                            )}
                            <span className="text-[9px] bg-slate-800 text-slate-400 px-1 rounded border border-slate-700">
                              {rune.type}
                            </span>
                          </div>
                        </div>

                        {/* 줄임말 설명 렌더링 - 가독성 극대화 */}
                        <div className="text-xs font-black text-emerald-400 mt-2 bg-slate-950/60 border border-emerald-950/20 px-3 py-2 rounded-lg">
                          {formatRuneDescCompact(rune)}
                        </div>
                      </div>

                      {/* 정제된 한글 원본 상세 효과 리스트 출력 (조건부 텍스트 누락 방지) */}
                      {coreTexts.length > 0 && (
                        <div className="text-[10px] text-slate-400 leading-relaxed font-semibold border-t border-slate-850 pt-2 flex flex-col gap-1">
                          {coreTexts.map((line, lIdx) => (
                            <p key={lIdx} className="flex gap-1.5 items-start">
                              <span className="text-mabi-accent shrink-0 font-black">•</span>
                              <span>{line}</span>
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {filteredRunes.length === 0 && (
                  <div className="col-span-full py-12 text-center text-slate-500 text-sm">
                    검색 결과에 맞는 룬이 없습니다.
                  </div>
                )}
              </div>
            </div>

            {/* 푸터 */}
            <div className="p-4 border-t border-slate-800 bg-slate-900 text-right">
              <button
                onClick={() => setActiveSlot(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-350 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
              >
                닫기
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 장착 룬 상세 효과 사전 (실시간 연동 출력 대시보드) */}
      <div className="mt-8 border-t border-slate-800 pt-6">
        <h4 className="text-xs font-black text-slate-400 mb-4 flex items-center gap-1.5 uppercase tracking-wider">
          <Star className="w-4 h-4 text-mabi-accent" />
          장착 중인 룬 상세 효과 사전
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(selectedRunes).flatMap(([type, list]) => 
            list.map((rune, idx) => {
              if (!rune) return null;
              const coreLines = getCoreRuneTexts(rune.cleaned_text);
              
              return (
                <div key={`${type}-${idx}`} className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl flex flex-col gap-2.5 transition-all hover:border-slate-750">
                  <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                    <span className="text-xs font-black text-slate-100 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-mabi-accent" />
                      {rune.name} ({type} 룬)
                    </span>
                    <span className="text-[9px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-emerald-400 font-bold leading-none">
                      {formatRuneDescCompact(rune)}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-350 leading-relaxed flex flex-col gap-1 font-medium">
                    {coreLines.length > 0 ? (
                      coreLines.map((line, lIdx) => (
                        <p key={lIdx} className="flex gap-1.5 items-start">
                          <span className="text-mabi-accent shrink-0 font-black">•</span>
                          <span>{line}</span>
                        </p>
                      ))
                    ) : (
                      <p className="text-slate-500 italic">상세 효과 정보 없음</p>
                    )}
                  </div>
                </div>
              );
            })
          ).filter(Boolean)}
          
          {Object.values(selectedRunes).flat().filter(Boolean).length === 0 && (
            <div className="col-span-full py-8 text-center text-xs text-slate-500 border border-dashed border-slate-850 rounded-xl">
              현재 장착된 룬이 없습니다. 상단 슬롯을 클릭해 룬을 장착해 주세요.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
