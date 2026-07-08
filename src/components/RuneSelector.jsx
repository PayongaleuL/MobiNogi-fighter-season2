import React, { useState } from 'react';
import runesData from '../data/runes.json';
import { Search, Shield, ShieldAlert, Award, Star, ChevronDown, ChevronUp } from 'lucide-react';

export default function RuneSelector({ uiTheme, selectedRunes, onRuneChange, transcendLevels, onTranscendChange }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('ALL');
  const [activeSlot, setActiveSlot] = useState(null); // { type, index }
  const [isDetailOpen, setIsDetailOpen] = useState(true); // 장착 룬 상세 사전 열기/닫기 토글 상태

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
  const NOISE_WORDS = [
    // 1글자 낱자 (인접 문자와 결합되지 않는 경우만 지워야 하므로 루프에서 분기 처리)
    '용', '다', '쥐', '벼', '능', '어둠', '빛', '전투', '없음', '분노', '명약', '태초',
    
    // 메타데이터 단어 및 오타 변형
    '거래 불가', '거래불가',
    '판매 가능', '판매가능', '판매 기능', '판매기능', '판매',
    '기억 가능', '기억가능',
    '각인 시즌보존', '각인 시류보존', '각인 시료보존', 
    '각인시류보존', '각인시료보존', '각인시즌보존',
    '방어구에 각인', '장신구에 각인', '무기에 각인', '엠블럼에 각인', '엘불럽에 각인',
    '전설 무기 전용 룬', '전설 장신구 전용 룬', '전설 방어구 전용 룬', '전설 업늘럼 전용 룬', '전설 엠블럼 전용 룬',
    '전설 무기 전용문', '전설 장신구 전용률', '전설 방어구 전용률', '전설 방어구 전용문', '전설 업늘럼 전용문', '전설 업늘럼 전용률',
    '전설 장신구 전용류', '전설 무기 전용류', '전설 방어구 전용류', '전설 전용류', '전용류',
    '유일',
    
    // 룬 접두/접미 정보
    '무기 룬', '방어구 룬', '장신구 룬', '엠블럼 룬', '임불럼 룬', '업늘럼 룬',
    '무기 료', '방어구 문', '장신구 문', '임불럼 문', '엠블럼 문', '업늘럼 문',
    '무기 룬:', '방어구 룬:', '장신구 룬:', '엠블럼 룬:', '임불럼 룬:', '엠블럼 룬:', '업늘럼 룬:',
    '무기 료:', '방어구 문:', '장신구 문:', '임불럼 문:', '엠블럼 문:', '업늘럼 문:',
    
    // 오 OCR 잔여물
    '하위 능력치', '하위 능력지', '하위 능력차', '하위 능력', '하위 능력치$', '하위 능력치<', '하위 능력지$', '하위 능력지<'
  ];

  // OCR 판독 오타 한글 맞춤법/어절 표준화 교정 사전
  const KOREAN_SPELL_CORRECTIONS = {
    '변화지 준다': '변화를 준다',
    '변화지': '변화를',
    '피해지 주며': '피해를 주며',
    '피해지': '피해를',
    '피해름 주고': '피해를 주고',
    '추가 공격올': '추가 공격을',
    '타켓에거': '타겟에게',
    '타켓에게': '타겟에게',
    '아난': '아닌'
  };

  // 거래불가/각인부위/저주확률 등의 메타 데이터 및 초월/동작 안내 가이드를 지우고 핵심 스펙 텍스트만 추출
  const getCoreRuneTexts = (cleanedText, runeName = '') => {
    if (!cleanedText) return [];

    // 1단계: 룬 이름 및 룬 고유 분류 헤더가 포함된 줄 조기 필터 제거 (문두 찌꺼기 원천 봉쇄)
    const filteredLines = cleanedText.filter(line => {
      if (!line) return false;
      const cleanLine = line.trim();
      // 룬 이름 자체를 포함하는 헤더 라인 제거
      if (runeName && cleanLine.includes(runeName)) return false;
      // 룬 분류 전용 표기 라인 제거
      if (cleanLine.includes('전용 룬') || cleanLine.includes('전용문') || cleanLine.includes('전용률') || cleanLine.includes('전용류')) return false;
      return true;
    });

    // 2단계: 전체 줄을 공백으로 합침 (줄바꿈 끊김 방지)
    let text = filteredLines.join(' ');

    // 소수점이 줄바꿈이나 기호(•, ·, º) 등에 의해 '1. • 5%' 처럼 찢겨 있는 현상 선제적 결합
    text = text.replace(/(\d+)\.\s*[•·º·]?\s*(\d+)/g, '$1.$2');

    // 유니코드 기반 한글, 영문, 숫자, 공백 및 기본 문장 부호(.,%()~) 외의 모든 OCR 노이즈 특수문자 원천 세척
    text = text.replace(/[^ㄱ-ㅎㅏ-ㅣ가-힣0-9a-zA-Z\s.,%()~]/g, '');

    // 공백 정규화
    text = text.replace(/\s+/g, ' ');

    // 3단계: 사전 정의된 블랙리스트(NOISE_WORDS) 단어를 순회하며 일괄/구조적 제거
    NOISE_WORDS.forEach(word => {
      if (word.length === 1) {
        // 낱글자는 단어의 일부로 쓰인 정상 단어(예: '용의 문장')를 보존하기 위해 단어 경계 및 공백 기준으로 매칭
        const regexSingle = new RegExp(`\\b${word}\\b|\\s+${word}\\s+|\\s+${word}$|^${word}\\s+`, 'g');
        text = text.replace(regexSingle, ' ');
      } else {
        // 2글자 이상은 본문 내 발견 즉시 전역 완전 소거
        const escaped = word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regexWord = new RegExp(escaped, 'g');
        text = text.replace(regexWord, '');
      }
    });

    // 4단계: 특정 문맥 문장 통째 소거 정규식 적용 (초월/스킬 변화)
    const contextPatterns = [
      // 깡스탯 데이터 숫자 결합형 소거 (공격력/피해 등의 일반 한글 단어 보존)
      /(마도\s*저항\s*\d+|마도\s*저향\s*\d+|추가\s*체력\s*\d+|방어력\s*\d+|공격력\s*\d+)/g,
      // 저주 확률 소거
      /(저주 확률|저주 확출)\s*\d+%\.?/g,
      
      // 장신구 룬 스킬 변화 문장 통째 소거
      /[^. ]*(스킬에 변화를|스킬을 변화한|변화를 줌)[^.]*\.?/g,
      
      // 초월 각인 조건부 피해 증가 문장 소거
      /(초월 각인 시|초월 각인 시;|초월 각인 시,|초월 각인 단계당)[^.]+단계마다[^.]+증가(하다|한다)\.?/g,
      /(초월 각인 시|초월 각인 시;|초월 각인 시,|초월 각인 단계당)[^.]+최종[^.]+증가(하다|한다)\.?/g,
      
      // 스킬 레벨 강화 효과 가이드 소거
      /전설 희귀도 효과 부여\.?/g,
      /모든 스킬 \d+강화\.?/g,
      /임의 \d+개 스킬 \d+강화\.?/g
    ];

    contextPatterns.forEach(pat => {
      text = text.replace(pat, '');
    });

    // 4단계: 마침표(.)를 기준으로 끊어 온전한 통문장 리스트 반환
    const sentences = text
      .split(/(?<=\.)/g)
      .map(s => s.trim())
      .filter(s => {
        if (!s) return false;
        if (s.startsWith('하위 능력치') || s.startsWith('하위 능력지')) return false;
        if (s === '.') return false;
        return s.length > 2;
      });

    // 5단계: 한글 문법 및 오타 교정 피드백 적용
    return sentences.map(s => {
      return s
        .replace(/증가하다\.?/g, '증가')
        .replace(/증가한다\.?/g, '증가')
        .replace(/감소하다\.?/g, '감소')
        .replace(/감소한다\.?/g, '감소')
        .replace(/중되다\.?/g, '중첩')
        .replace(/중첩되다\.?/g, '중첩')
        .replace(/중첩된다\.?/g, '중첩')
        .replace(/해제되다\.?/g, '해제')
        .replace(/해제된다\.?/g, '해제')
        .replace(/;/g, ',')
        .replace(/아난/g, '아닌')
        .replace(/타켓에거/g, '타겟에게')
        .replace(/타켓에게/g, '타겟에게')
        .replace(/피해지 준다/g, '피해를 줌')
        .replace(/피해름 주고/g, '피해를 주고')
        .replace(/피해를 주고/g, '피해를 주고')
        .replace(/추가 공격올/g, '추가 공격을')
        .trim();
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
    if (el === '용') return 'text-red-700 bg-red-50 border-red-200';
    if (el === '어둠') return 'text-purple-700 bg-purple-50 border-purple-200';
    if (el === '빛') return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-slate-600 bg-slate-100 border-slate-200';
  };

  const getRuneIcon = (type) => {
    if (type === '무기') return <Award className="w-5 h-5 text-orange-500" />;
    if (type === '방어구') return <Shield className="w-5 h-5 text-blue-500" />;
    if (type === '장신구') return <Star className="w-5 h-5 text-emerald-500" />;
    return <ShieldAlert className="w-5 h-5 text-indigo-500" />;
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
    <div className="bg-theme-card border border-theme rounded-2xl p-6 shadow-theme theme-transition">
      <h3 className="text-xl font-black text-theme-main mb-6 flex items-center gap-2">
        <Award className="w-6 h-6 text-orange-500" />
        시즌 2 룬 세팅 구성
      </h3>

      {/* 룬 장착 슬롯 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {slots.map((slot, idx) => {
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
              className={`relative cursor-pointer flex flex-col gap-2.5 p-4 rounded-xl border transition-all duration-300 theme-transition ${
                currentRune 
                  ? 'bg-theme-subcard border-orange-500/80 hover:border-orange-600 shadow-sm' 
                  : 'bg-theme-main border-theme border-dashed hover:border-theme-accent'
              } ${activeSlot?.type === slot.type && activeSlot?.index === slot.index ? 'ring-2 ring-orange-500 border-transparent shadow-md' : ''}`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-theme-card border border-theme rounded-lg theme-transition">
                    {getRuneIcon(slot.type)}
                  </div>
                  <div>
                    <span className="text-[9px] text-theme-muted font-bold block leading-none">{slot.label}</span>
                    <span className="text-xs font-black text-theme-main mt-1.5 block">
                      {currentRune ? (
                        <>
                          {currentRune.name}
                          {currentLevel > 0 && (
                            <span className={`text-[10px] font-black ${levelBadgeColor}`}>
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
                    className="w-6 h-6 hover:bg-slate-200 rounded-full text-slate-400 hover:text-red-500 transition-colors leading-none text-lg flex items-center justify-center focus:outline-none"
                  >
                    &times;
                  </button>
                )}
              </div>

              {currentRune ? (
                <div className="flex flex-col gap-2.5 w-full mt-0.5" onClick={(e) => e.stopPropagation()}>
                  <span className="text-[10px] text-emerald-600 font-extrabold truncate block">
                    {formatRuneDescCompact(currentRune)}
                  </span>
                  
                  {/* 초월 레벨 선택 버튼 세그먼트 */}
                  <div className="flex gap-1 border-t border-theme pt-2.5 theme-transition">
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
                          className={`text-[9px] px-2.5 py-1 rounded border transition-all focus:outline-none ${
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
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all focus:outline-none ${
                      selectedTypeFilter === t
                        ? 'bg-orange-50 border-orange-500 text-orange-600 font-extrabold shadow-sm'
                        : 'border-theme text-theme-sub hover:bg-theme-card'
                    }`}
                  >
                    {t}
                  </button>
                ))}
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
                        <div className="text-xs font-black text-emerald-600 mt-2 bg-emerald-50/50 border border-emerald-100 px-3 py-2 rounded-lg">
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
      <div className="mt-8 border-t border-slate-800 pt-6">
        <button 
          onClick={() => setIsDetailOpen(!isDetailOpen)}
          className="w-full flex items-center justify-between text-xs font-black text-slate-400 mb-4 uppercase tracking-wider hover:text-slate-200 transition-colors focus:outline-none"
        >
          <span className="flex items-center gap-1.5">
            <Star className="w-4 h-4 text-mabi-accent" />
            장착 중인 룬 상세 효과 사전
          </span>
          {isDetailOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </button>

        {isDetailOpen && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
            {Object.entries(selectedRunes).flatMap(([type, list]) => 
              list.map((rune, idx) => {
                if (!rune) return null;
                const coreLines = getCoreRuneTexts(rune.cleaned_text, rune.name);
                if (coreLines.length === 0) return null; // 빈 카드는 아예 렌더링 스킵 처리
                
                return (
                  <div key={`${type}-${idx}`} className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl flex flex-col gap-2.5 transition-all hover:border-slate-750 h-fit">
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
                      {coreLines.map((line, lIdx) => (
                        <p key={lIdx} className="flex gap-1.5 items-start">
                          <span className="text-mabi-accent shrink-0 font-black">•</span>
                          <span>{line}</span>
                        </p>
                      ))}
                    </div>
                  </div>
                );
              })
            ).filter(Boolean)}
            
            {Object.values(selectedRunes).flat().filter(Boolean).filter(r => getCoreRuneTexts(r.cleaned_text, r.name).length > 0).length === 0 && (
              <div className="col-span-full py-8 text-center text-xs text-slate-500 border border-dashed border-slate-850 rounded-xl">
                현재 장착된 룬이 없습니다. 상단 슬롯을 클릭해 룬을 장착해 주세요.
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
