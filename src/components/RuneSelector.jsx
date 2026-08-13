import React, { useState } from 'react';
import runesData from '../data/runes.json';
import { normalizeRuneText } from '../utils/runeTextNormalizer';
import { Search, Shield, ShieldAlert, Award, Star, ChevronDown } from 'lucide-react';

export default function RuneSelector({ _uiTheme, selectedRunes, onRuneChange, transcendLevels, onTranscendChange }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('ALL');
  const [activeSlot, setActiveSlot] = useState(null); // { type, index }
  const [isDetailOpen, setIsDetailOpen] = useState(false); // 장착 룬 상세 사전 열기/닫기 토글 상태

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
      "스킬속도%": "스킬속",
      "재사용회복%": "쿨감",
      "최종피해%": "최종피"
    };

    Object.entries(rune.stats).forEach(([k, v]) => {
      if (v !== 0 && k !== '가동률' && mapping[k]) {
        parts.push(`${mapping[k]} ${(v * 100).toFixed(1)}%`);
      }
    });

    return parts.length > 0 ? parts.join(" / ") : (rune.description || "옵션 없음");
  };

  // 룬 설명에서 일괄 제거할 노이즈 단어 설정 테이블
  const getCoreRuneTexts = normalizeRuneText;

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
    if (el === '용') return 'text-red-700 bg-red-50 border-red-200';
    if (el === '어둠') return 'text-purple-700 bg-purple-50 border-purple-200';
    if (el === '빛') return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-slate-600 bg-slate-100 border-slate-200';
  };

  const getRuneIcon = (type) => {
    if (type === '무기') return <Award className="w-4 h-4 text-orange-500" />;
    if (type === '방어구') return <Shield className="w-4 h-4 text-blue-500" />;
    if (type === '장신구') return <Star className="w-4 h-4 text-emerald-500" />;
    return <ShieldAlert className="w-4 h-4 text-indigo-500" />;
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
    <div className="theme-transition">
      <div className="mb-1.5 flex items-center justify-between gap-2 text-[9px] font-black text-theme-muted">
        <span>슬롯을 눌러 장착 룬을 선택하고 초월 단계를 즉시 반영합니다.</span>
        <span className="shrink-0 rounded-full border border-theme bg-theme-subcard px-1.5 py-0.5 text-orange-500">10 SLOTS</span>
      </div>

      {/* 룬 장착 슬롯 그리드 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-1.5 mb-2">
        {slots.map((slot) => {
          const key = `${slot.type}-${slot.index}`;
          const currentRune = selectedRunes[slot.type] ? selectedRunes[slot.type][slot.index] : null;
          const currentLevel = transcendLevels ? transcendLevels[slot.type][slot.index] : 0;
          const levelLabels = ['', ' [초월+]', ' [초월++]'];
          const levelBadgeColor = currentLevel === 1 ? 'text-amber-600' : 'text-red-500';

          return (
            <div
              key={key}
              onClick={() => {
                setActiveSlot({ type: slot.type, index: slot.index });
                setSelectedTypeFilter(slot.type);
              }}
              className={`relative cursor-pointer flex flex-col gap-1 p-1.5 rounded-lg border transition-all duration-300 theme-transition card-lift-glow ${
                currentRune 
                  ? 'bg-theme-subcard border-orange-500/80 shadow-sm' 
                  : 'bg-theme-main border-theme border-dashed'
              } ${activeSlot?.type === slot.type && activeSlot?.index === slot.index ? 'ring-2 ring-orange-500 border-transparent shadow-md' : ''}`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex min-w-0 items-center gap-1.5">
                  <div className="p-1 bg-theme-card border border-theme rounded-md theme-transition">
                    {getRuneIcon(slot.type)}
                  </div>
                  <div>
                    <span className="text-[8px] text-theme-muted font-bold block leading-none">{slot.label}</span>
                    <span className="text-[10px] font-black text-theme-main mt-0.5 block truncate">
                      {currentRune ? (
                        <>
                          {currentRune.name}
                          {currentLevel > 0 && (
                            <span className={`text-[10.5px] font-black ${levelBadgeColor}`}>
                              {levelLabels[currentLevel]}
                            </span>
                          )}
                        </>
                      ) : (
                        '룬을 선택해주세요'
                      )}
                    </span>
                  </div>
                </div>

                {currentRune && (
                  <button
                    onClick={(e) => handleClearSlot(slot.type, slot.index, e)}
                    className="w-5 h-5 hover:bg-slate-200 rounded-full text-slate-400 hover:text-red-500 transition-colors leading-none text-base flex items-center justify-center focus:outline-none"
                  >
                    &times;
                  </button>
                )}
              </div>

              {currentRune ? (
                <div className="flex flex-col gap-1 w-full mt-0.5" onClick={(e) => e.stopPropagation()}>
                  <span className="text-[8px] text-emerald-600 font-extrabold truncate block">
                    {formatRuneDescCompact(currentRune)}
                  </span>
                  
                  {/* 초월 레벨 선택 버튼 세그먼트 */}
                  <div className="flex gap-1 border-t border-theme pt-1 theme-transition">
                    {[0, 1, 2].map((lvl) => {
                      const labels = ['미초월', '초월+', '초월++'];
                      const activeColor = lvl === 0 
                        ? 'bg-theme-card border-theme text-theme-main font-bold shadow-sm' 
                        : lvl === 1 
                          ? 'bg-amber-50 border-amber-300 text-amber-700 font-black shadow-sm' 
                          : 'bg-red-50 border-red-300 text-red-700 font-black shadow-sm';
                      return (
                        <button
                          key={lvl}
                          onClick={() => onTranscendChange(slot.type, slot.index, lvl)}
                          className={`text-[7px] flex-1 px-1 py-0.5 rounded border transition-all focus:outline-none ${
                            currentLevel === lvl 
                              ? activeColor 
                              : 'bg-theme-subcard border-theme text-theme-muted hover:text-theme-main hover:bg-theme-card'
                          }`}
                        >
                          {labels[lvl]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                currentRune?.element && currentRune.element !== '없음' && (
                  <span className={`inline-block text-[9px] px-1.5 py-0.5 rounded border mt-0.5 font-bold w-fit ${getElementColor(currentRune.element)}`}>
                    {currentRune.element}
                  </span>
                )
              )}
            </div>
          );
        })}
      </div>

      {/* 룬 검색 및 선택 모달창 (슬롯 선택 시 활성화) */}
      {activeSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all animate-fadeIn">
          <div className="bg-theme-card border border-theme w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col theme-transition">
            
            {/* 헤더 */}
            <div className="p-6 border-b border-theme flex justify-between items-center theme-transition">
              <h4 className="text-lg font-black text-theme-main flex items-center gap-2">
                {getRuneIcon(activeSlot.type)}
                {activeSlot.type} 룬 선택 ({activeSlot.index + 1}번 슬롯)
              </h4>
              <button
                onClick={() => setActiveSlot(null)}
                className="text-theme-muted hover:text-theme-main text-2xl font-bold focus:outline-none"
              >
                &times;
              </button>
            </div>

            {/* 필터 및 검색 바 */}
            <div className="p-4 bg-theme-subcard border-b border-theme flex flex-col sm:flex-row gap-3 theme-transition">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-theme-muted" />
                <input
                  type="text"
                  placeholder="룬 이름 혹은 효과 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-theme-card border border-theme pl-10 pr-4 py-2 rounded-xl text-sm text-theme-main placeholder-slate-400 focus-orange-glow focus:outline-none theme-transition"
                />
              </div>
              <div className="flex gap-2">
                {['ALL', '무기', '방어구', '장신구', '엠블럼'].map(t => (
                  <button
                    key={t}
                    onClick={() => setSelectedTypeFilter(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all focus:outline-none theme-transition ${
                      selectedTypeFilter === t
                        ? 'bg-orange-500/10 border-orange-500 text-orange-600 dark:text-orange-400 font-extrabold shadow-sm'
                        : 'border-theme text-theme-sub hover:bg-theme-card'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* 추천/자주 쓰는 룬 퀵보드 */}
            <div className="px-4 pb-4 bg-theme-subcard border-b border-theme theme-transition">
              <span className="text-[10px] font-black text-theme-muted uppercase block mb-2">💡 격투가 추천/자주 쓰는 룬 빠른 장착</span>
              <div className="flex flex-wrap gap-2">
                {(() => {
                  let names = [];
                  if (activeSlot.type === '무기') {
                    names = ['태초', '초월', '무너진 경계', '숲 길잡이', '백금 천칭', '눈부신 잔영', '금 간 봉인', '타오르는 영광'];
                  } else if (activeSlot.type === '장신구') {
                    names = ['태초', '초월', '무너진 경계', '숲 길잡이', '백금 천칭', '눈부신 잔영', '금 간 봉인', '타오르는 영광'];
                  } else if (activeSlot.type === '방어구') {
                    names = ['도약+', '승천+', '강격+', '격파+', '약점+', '충돌+', '전진+', '열혈+', '순발력+'];
                  } else if (activeSlot.type === '엠블럼') {
                    names = ['태초', '초월'];
                  }
                  
                  return names.map(name => {
                    return runesData.find(r => r.name === name);
                  }).filter(Boolean).map(r => (
                    <button
                      key={r.name}
                      onClick={() => handleSelectRune(r)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-black bg-theme-card border border-theme hover:border-orange-500/80 text-theme-main transition-all flex items-center gap-1.5 theme-transition hover:bg-orange-500/5"
                    >
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>{r.name}</span>
                      <span className="text-[9px] text-emerald-500 font-extrabold">({formatRuneDescCompact(r).split(' ')[0]})</span>
                    </button>
                  ));
                })()}
              </div>
            </div>

            {/* 룬 리스트 */}
            <div className="p-4 overflow-y-auto flex-1 bg-theme-main theme-transition">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredRunes.map(rune => {
                  const coreTexts = getCoreRuneTexts(rune.cleaned_text, rune.name);

                  return (
                    <div
                      key={rune.file}
                      onClick={() => handleSelectRune(rune)}
                      className="cursor-pointer bg-theme-card hover:bg-theme-subcard border border-theme hover:border-orange-500/60 p-4 rounded-xl transition-all duration-200 flex flex-col justify-start gap-3 shadow-sm theme-transition"
                    >
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <span className="font-extrabold text-theme-main text-sm truncate">{rune.name}</span>
                          <div className="flex gap-1.5 shrink-0">
                            {rune.element && rune.element !== '없음' && (
                              <span className={`text-[9px] px-1 rounded border font-bold ${getElementColor(rune.element)}`}>
                                {rune.element}
                              </span>
                            )}
                            <span className="text-[9px] bg-theme-subcard text-theme-sub px-1 rounded border border-theme">
                              {rune.type}
                            </span>
                          </div>
                        </div>

                        {/* 줄임말 설명 렌더링 - 가독성 극대화 */}
                        <div className="text-xs font-black text-emerald-700 dark:text-emerald-400 mt-2 bg-emerald-500/10 border border-emerald-300 dark:border-emerald-800/40 px-3 py-2 rounded-lg theme-transition">
                          {formatRuneDescCompact(rune)}
                        </div>
                      </div>

                      {/* 정제된 한글 원본 상세 효과 리스트 출력 */}
                      {coreTexts.length > 0 && (
                        <div className="text-[10px] text-theme-sub leading-relaxed font-bold border-t border-theme pt-2 flex flex-col gap-1 theme-transition">
                          {coreTexts.map((line, lIdx) => (
                            <p key={lIdx} className="flex gap-1.5 items-start">
                              <span className="text-orange-500 shrink-0 font-black">•</span>
                              <span>{line}</span>
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {filteredRunes.length === 0 && (
                  <div className="col-span-full py-12 text-center text-theme-muted text-sm">
                    검색 결과에 맞는 룬이 없습니다.
                  </div>
                )}
              </div>
            </div>

            {/* 푸터 */}
            <div className="p-4 border-t border-theme bg-theme-card text-right theme-transition">
              <button
                onClick={() => setActiveSlot(null)}
                className="bg-theme-subcard hover:bg-theme-main border border-theme text-theme-sub px-4 py-2 rounded-xl text-xs font-bold transition-all focus:outline-none"
              >
                닫기
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 장착 룬 상세 효과 사전 (실시간 연동 출력 대시보드) */}
      <div className="mt-4 border-t border-theme pt-3 theme-transition">
        <button 
          onClick={() => setIsDetailOpen(!isDetailOpen)}
          className="w-full flex items-center justify-between text-xs font-black text-theme-main bg-theme-subcard hover:bg-theme-card border border-theme rounded-xl p-2.5 shadow-sm transition-all duration-300 card-lift-glow focus:outline-none theme-transition mb-3"
        >
          <span className="flex items-center gap-2">
            <Star className={`w-4 h-4 text-orange-500 transition-transform duration-500 ${isDetailOpen ? 'rotate-180 scale-110' : 'rotate-0'}`} />
            <span className="font-extrabold tracking-wide text-theme-main">장착 중인 룬 상세 효과 사전 {isDetailOpen ? '(열림)' : '(닫힘)'}</span>
          </span>
          <ChevronDown className={`w-4 h-4 text-theme-muted transition-transform duration-300 ${isDetailOpen ? 'rotate-180' : 'rotate-0'}`} />
        </button>

        {isDetailOpen && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
            {Object.entries(selectedRunes).flatMap(([type, list]) => 
              list.map((rune, idx) => {
                if (!rune) return null;
                const coreLines = getCoreRuneTexts(rune.cleaned_text, rune.name);
                if (coreLines.length === 0) return null; // 빈 카드는 아예 렌더링 스킵 처리
                
                return (
                  <div key={`${type}-${idx}`} className="bg-theme-subcard/50 border border-theme p-4 rounded-xl flex flex-col gap-2.5 transition-all hover:border-orange-500/50 card-lift-glow h-fit theme-transition">
                    <div className="flex justify-between items-center border-b border-theme pb-2 theme-transition">
                      <span className="text-xs font-black text-theme-main flex items-center gap-1.5 theme-transition">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                        {rune.name} ({type} 룬)
                      </span>
                      <span className="text-[9px] bg-theme-card border border-theme px-2 py-0.5 rounded text-emerald-600 dark:text-emerald-400 font-bold leading-none theme-transition">
                        {formatRuneDescCompact(rune)}
                      </span>
                    </div>
                    <div className="text-[10px] text-theme-sub leading-relaxed flex flex-col gap-1 font-medium theme-transition">
                      {coreLines.map((line, lIdx) => (
                        <p key={lIdx} className="flex gap-1.5 items-start">
                          <span className="text-orange-500 shrink-0 font-black">•</span>
                          <span>{line}</span>
                        </p>
                      ))}
                    </div>
                  </div>
                );
              })
            ).filter(Boolean)}
            
            {Object.values(selectedRunes).flat().filter(Boolean).filter(r => getCoreRuneTexts(r.cleaned_text, r.name).length > 0).length === 0 && (
              <div className="col-span-full py-8 text-center text-xs text-theme-muted border border-dashed border-theme rounded-xl theme-transition">
                현재 장착된 룬이 없습니다. 상단 슬롯을 클릭해 룬을 장착해 주세요.
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
